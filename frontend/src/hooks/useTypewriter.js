import { useEffect, useRef, useState } from 'react'

// Reveal speed in characters per second. The speed adapts to how much text is
// waiting, so a slow stream types at a calm pace and a long answer that
// arrives at once (e.g. from the cache) still finishes in a few seconds.
const MIN_CPS = 60
const MAX_CPS = 280
const CATCH_UP_SECONDS = 2

// Show whole words: hold back a partial word unless it is unusually long
const WORD_SNAP = 12

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const commonPrefixLength = (a, b) => {
    let i = 0
    while (i < a.length && i < b.length && a[i] === b[i]) i++
    return i
}

// The visible length for a reveal position: the end of the last complete word
const wholeWords = (text, position) => {
    if (position >= text.length) return text.length
    const boundary = text.lastIndexOf(' ', position)
    const newline = text.lastIndexOf('\n', position)
    const end = Math.max(boundary, newline)
    return end >= position - WORD_SNAP ? end + 1 : position
}

/**
 * Closes Markdown left open by a partial reveal, so a half-typed **bold** or
 * `code` renders formatted instead of showing raw markers.
 */
export const closeOpenMarkdown = (partial) => {
    if ((partial.match(/^```/gm) || []).length % 2 === 1) return `${partial}\n\`\`\``

    let closed = partial
    if ((closed.match(/\*\*/g) || []).length % 2 === 1) closed += '**'
    if ((closed.replace(/```/g, '').match(/`/g) || []).length % 2 === 1) closed += '`'
    return closed
}

/**
 * Gradually reveals `text` as it grows. Returns the visible part and whether
 * it is still catching up. With `enabled` false, or when the user prefers
 * reduced motion, the full text is shown immediately.
 */
export function useTypewriter(text, { enabled = true } = {}) {
    const animate = enabled && !prefersReducedMotion()
    const [count, setCount] = useState(animate ? 0 : text.length)
    // Exact reveal position; the visible count trails it to whole words
    const positionRef = useRef(count)
    const textRef = useRef(text)
    const frameRef = useRef(null)

    useEffect(() => {
        // If the text changed rather than grew (a retry, or a trailing marker
        // the stream removed), keep only what still matches what was shown
        positionRef.current = commonPrefixLength(textRef.current.slice(0, positionRef.current), text)
        textRef.current = text

        if (!animate) {
            positionRef.current = text.length
            setCount(text.length)
            return
        }
        if (positionRef.current >= text.length) return

        let last = performance.now()
        const step = (now) => {
            const target = textRef.current
            const backlog = target.length - positionRef.current
            const cps = Math.min(MAX_CPS, Math.max(MIN_CPS, backlog / CATCH_UP_SECONDS))
            positionRef.current = Math.min(target.length, positionRef.current + cps * (now - last) / 1000)
            last = now

            setCount(wholeWords(target, Math.floor(positionRef.current)))
            frameRef.current = positionRef.current < target.length ? requestAnimationFrame(step) : null
        }
        frameRef.current = requestAnimationFrame(step)

        // Each new chunk restarts the loop from the current position. Clearing
        // the frame also matters when React remounts the component (StrictMode
        // does this in development): a stale id would block the next start.
        return () => {
            cancelAnimationFrame(frameRef.current)
            frameRef.current = null
        }
    }, [text, animate])

    const isTyping = count < text.length
    return {
        text: isTyping ? closeOpenMarkdown(text.slice(0, count)) : text,
        isTyping,
    }
}
