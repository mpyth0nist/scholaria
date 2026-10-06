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

    // Load existing messages if conversationId is found in localStorage
    useEffect(() => {
        if (!conversationId) return

        let isCancelled = false

        async function fetchHistory() {
            try {
                const res = await fetch(`${BASE_URL}api/llm/conversations/${conversationId}/messages/`, {
                    credentials: 'include',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken') || '',
                    },
                })
                if (res.ok) {
                    const data = await res.json()
                    if (!isCancelled && data.messages && data.messages.length > 0) {
                        setMessages(data.messages)
                    }
                } else if (res.status === 404) {
                    if (!isCancelled) {
                        setConversationId(null)
                    }
                }
            } catch (_) {}
        }

        fetchHistory()

        return () => {
            isCancelled = true
        }
    }, [conversationId])

    const stopGeneration = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort()
            abortRef.current = null
        }
        setStatus(prev => (prev === 'loading' || prev === 'streaming' ? 'idle' : prev))
    }, [])

    const clearChat = useCallback(() => {
        stopGeneration()
        setConversationId(null)
        setMessages([INITIAL_MESSAGE])
        setStatus('idle')
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
                    if (errorData.error) errorMsg = errorData.error
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
        retryLast
    }
}

