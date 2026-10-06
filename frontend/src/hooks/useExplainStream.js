import { useRef, useState, useCallback } from 'react'
import { ENDPOINTS } from '../constants'
import { BASE_URL, getCookie } from '../utils/http'

/**
 * useExplainStream — stream an inline-explain answer from the backend.
 *
 * Returns { text, status, annotationId, stream, abort }
 *   status: 'idle' | 'loading' | 'streaming' | 'done' | 'error'
 */
export function useExplainStream() {
    const [text, setText] = useState('')
    const [status, setStatus] = useState('idle')  // idle|loading|streaming|done|error
    const [annotationId, setAnnotationId] = useState(null)
    const abortRef = useRef(null)

    const abort = useCallback(() => {
        abortRef.current?.abort()
        setStatus(prev => prev === 'streaming' || prev === 'loading' ? 'done' : prev)
    }, [])

    const stream = useCallback(async ({ lessonId, selectedText, surroundingText, action, language = 'en', extraQuestion = null }) => {
        // Cancel any in-flight request
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        setText('')
        setAnnotationId(null)
        setStatus('loading')

        const doFetch = () => fetch(`${BASE_URL}${ENDPOINTS.lessonExplain(lessonId)}`, {
            method: 'POST',
            signal: controller.signal,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') || '',
            },
            body: JSON.stringify({
                selected_text: selectedText,
                surrounding_text: surroundingText,
                action,
                language,
                extra_question: extraQuestion,
            }),
        })

        try {
            let res = await doFetch()

            // One-shot 401 retry
            if (res.status === 401) {
                await fetch(`${BASE_URL}api/users/refresh/`, {
                    method: 'POST', credentials: 'include',
                    headers: { 'X-CSRFToken': getCookie('csrftoken') || '' },
                })
                res = await doFetch()
            }

            if (!res.ok) {
                let msg = 'AI service error. Please try again.'
                try { const d = await res.json(); if (d.error) msg = d.error } catch (_) {}
                setStatus('error')
                setText(msg)
                return
            }

            const reader = res.body.getReader()
            const decoder = new TextDecoder('utf-8')
            let accumulated = ''
            setStatus('streaming')

            while (true) {
                const { value, done } = await reader.read()
                if (done) break
                const chunk = decoder.decode(value, { stream: true })
                accumulated += chunk

                // The backend appends "\n\nX-Annotation-Id:<id>" as a sentinel.
                // Strip it from display text and capture the id.
                const sentinelIdx = accumulated.indexOf('\n\nX-Annotation-Id:')
                if (sentinelIdx !== -1) {
                    const id = accumulated.slice(sentinelIdx + '\n\nX-Annotation-Id:'.length).trim()
                    if (id) setAnnotationId(Number(id))
                    setText(accumulated.slice(0, sentinelIdx))
                } else {
                    setText(accumulated)
                }
            }

            setStatus('done')
        } catch (err) {
            if (err.name === 'AbortError') return
            setStatus('error')
            setText('AI service is temporarily unavailable.')
        }
    }, [])

    return { text, status, annotationId, stream, abort }
}
