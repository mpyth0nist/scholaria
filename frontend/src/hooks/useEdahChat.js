import { useState, useRef, useCallback, useEffect } from 'react'
import { BASE_URL, getCookie } from '../utils/http'

const INITIAL_MESSAGE = {
    role: 'ai',
    content: 'Hello! I am Edah (إيضاح), your AI Tutor. How can I help you with this lesson?'
}

export function useEdahChat({ lessonId = null } = {}) {
    const storageKey = `edah_conv_${lessonId ?? 'global'}`
    
    const [conversationId, setConversationId] = useState(() => {
        return localStorage.getItem(storageKey) || null
    })
    const initialConversationId = useRef(conversationId)
    const historyRequestRef = useRef(0)

    const [messages, setMessages] = useState([INITIAL_MESSAGE])
    const [status, setStatus] = useState('idle') // idle | loading | streaming | error
    const abortRef = useRef(null)

    // Save conversation ID when it changes
    useEffect(() => {
        if (conversationId) {
            localStorage.setItem(storageKey, conversationId)
        } else {
            localStorage.removeItem(storageKey)
        }
    }, [conversationId, storageKey])

    // Restore the last active conversation once. New IDs returned during streaming
    // must not trigger a fetch that can race with the streamed answer.
    useEffect(() => {
        const id = initialConversationId.current
        if (!id) return
        const requestId = ++historyRequestRef.current
        setStatus('loading')
        async function fetchInitialHistory() {
            try {
                const res = await fetch(`${BASE_URL}api/llm/conversations/${id}/messages/`, {
                    credentials: 'include',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken') || '',
                    },
                })
                if (res.ok) {
                    const data = await res.json()
                    if (historyRequestRef.current === requestId) {
                        setMessages(data.messages?.length ? data.messages : [INITIAL_MESSAGE])
                        setStatus('idle')
                    }
                } else if (res.status === 404) {
                    if (historyRequestRef.current === requestId) {
                        setConversationId(null)
                        setMessages([INITIAL_MESSAGE])
                        setStatus('idle')
                    }
                }
            } catch (_) {
                if (historyRequestRef.current === requestId) setStatus('error')
            }
        }
        fetchInitialHistory()
        return () => { historyRequestRef.current += 1 }
    }, [])

    const stopGeneration = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort()
            abortRef.current = null
        }
        setStatus(prev => (prev === 'loading' || prev === 'streaming' ? 'idle' : prev))
    }, [])

    const clearChat = useCallback(() => {
        historyRequestRef.current += 1
        stopGeneration()
        setConversationId(null)
        setMessages([INITIAL_MESSAGE])
        setStatus('idle')
    }, [stopGeneration])

    const selectConversation = useCallback(async (id) => {
        const requestId = ++historyRequestRef.current
        stopGeneration()
        setMessages([])
        setStatus('loading')
        setConversationId(String(id))
        try {
            const res = await fetch(`${BASE_URL}api/llm/conversations/${id}/messages/`, {
                credentials: 'include',
                headers: { 'X-CSRFToken': getCookie('csrftoken') || '' },
            })
            if (!res.ok) throw new Error('Could not load this conversation')
            const data = await res.json()
            if (historyRequestRef.current === requestId) {
                setMessages(data.messages?.length ? data.messages : [INITIAL_MESSAGE])
                setStatus('idle')
            }
        } catch (_) {
            if (historyRequestRef.current === requestId) {
                setMessages([{ role: 'ai', content: 'Could not load this conversation. Please try again.' }])
                setStatus('error')
            }
        }
    }, [stopGeneration])

    const sendMessage = useCallback(async (userText) => {
        if (!userText || !userText.trim() || status === 'loading' || status === 'streaming') return

        stopGeneration()

        const controller = new AbortController()
        abortRef.current = controller

        const userMsg = { role: 'user', content: userText.trim() }
        setMessages(prev => [...prev, userMsg])
        setStatus('loading')

        const doFetch = () => fetch(`${BASE_URL}api/llm/answer/`, {
            method: 'POST',
            signal: controller.signal,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') || '',
            },
            body: JSON.stringify({
                query: userMsg.content,
                conversation_id: conversationId,
                lesson_id: lessonId,
            }),
        })

        let aiBubbleCreated = false

        try {
            let res = await doFetch()

            // Handle 401 automatic token refresh
            if (res.status === 401) {
                try {
                    await fetch(`${BASE_URL}api/users/refresh/`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'X-CSRFToken': getCookie('csrftoken') || '' },
                    })
                    res = await doFetch()
                } catch (_) {
                    throw new Error('Session expired. Please log in again.')
                }
            }

            if (!res.ok) {
                let errorMsg = 'Sorry, I encountered an error. Please try again.'
                try {
                    const errorData = await res.json()
                    if (errorData.error || errorData.answer) errorMsg = errorData.error || errorData.answer
                } catch (_) {}
                throw new Error(errorMsg)
            }

            const newConvId = res.headers.get('X-Conversation-Id')
            if (newConvId) {
                setConversationId(newConvId)
            }

            const reader = res.body.getReader()
            const decoder = new TextDecoder('utf-8')
            let accumulatedText = ''

            setStatus('streaming')

            while (true) {
                const { value, done } = await reader.read()
                if (done) break

                if (value) {
                    const chunk = decoder.decode(value, { stream: true })
                    accumulatedText += chunk

                    if (!aiBubbleCreated) {
                        aiBubbleCreated = true
                    }

                    setMessages(prev => {
                        const newMsgs = [...prev]
                        const lastMsg = newMsgs[newMsgs.length - 1]
                        if (lastMsg && lastMsg.role === 'ai') {
                            newMsgs[newMsgs.length - 1] = { ...lastMsg, content: accumulatedText }
                        } else {
                            newMsgs.push({ role: 'ai', content: accumulatedText })
                        }
                        return newMsgs
                    })
                }
            }

            setStatus('idle')
        } catch (err) {
            if (err.name === 'AbortError') {
                setStatus('idle')
                return
            }

            setStatus('error')
            const errorContent = err.message || 'Sorry, I encountered an error. Please try again.'
            
            if (!aiBubbleCreated) {
                setMessages(prev => [...prev, { role: 'ai', content: errorContent }])
            } else {
                setMessages(prev => {
                    const newMsgs = [...prev]
                    const lastMsg = newMsgs[newMsgs.length - 1]
                    if (lastMsg && lastMsg.role === 'ai') {
                        newMsgs[newMsgs.length - 1] = {
                            ...lastMsg,
                            content: `${lastMsg.content}\n\n[Error: Stream interrupted]`
                        }
                    }
                    return newMsgs
                })
            }
        } finally {
            abortRef.current = null
        }
    }, [status, conversationId, lessonId, stopGeneration])

    const retryLast = useCallback(() => {
        setMessages(prev => {
            if (prev.length < 2) return prev
            const lastMsg = prev[prev.length - 1]
            let promptText = ''

            if (lastMsg.role === 'ai') {
                const userMsg = prev[prev.length - 2]
                if (userMsg && userMsg.role === 'user') {
                    promptText = userMsg.content
                    // Pop AI message and User message to re-send
                    const trimmed = prev.slice(0, prev.length - 2)
                    setTimeout(() => sendMessage(promptText), 0)
                    return trimmed
                }
            } else if (lastMsg.role === 'user') {
                promptText = lastMsg.content
                const trimmed = prev.slice(0, prev.length - 1)
                setTimeout(() => sendMessage(promptText), 0)
                return trimmed
            }
            return prev
        })
    }, [sendMessage])

    return {
        messages,
        status,
        conversationId,
        sendMessage,
        stopGeneration,
        clearChat,
        selectConversation,
        retryLast
    }
}
