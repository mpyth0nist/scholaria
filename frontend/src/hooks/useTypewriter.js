import { useEffect, useRef, useState } from 'react'

// Reveal speed in characters per second. The speed adapts to how much text is
// waiting, so a slow stream types at a calm pace and a long answer that
// arrives at once (e.g. from the cache) still finishes in a few seconds.
const MIN_CPS = 60
const MAX_CPS = 280
const CATCH_UP_SECONDS = 2

// Reveal whole words when the next boundary is close, to avoid half-words
const WORD_SNAP = 12

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const commonPrefixLength = (a, b) => {
    let i = 0
    while (i < a.length && i < b.length && a[i] === b[i]) i++
    return i
}

const nextBoundary = (text, index) => {
    if (index >= text.length) return text.length
    const rest = text.slice(index, index + WORD_SNAP)
    const offset = rest.search(/\s/)
    return offset === -1 ? index : index + offset
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
    const countRef = useRef(count)
    const textRef = useRef(text)
    const frameRef = useRef(null)

    useEffect(() => {
        // If the text changed rather than grew (a retry, or a trailing marker
        // the stream removed), keep only what still matches what was shown
        countRef.current = commonPrefixLength(textRef.current.slice(0, countRef.current), text)
        textRef.current = text

        if (!animate) {
            countRef.current = text.length
            setCount(text.length)
            return
        }
        if (frameRef.current !== null || countRef.current >= text.length) return

        let last = performance.now()
        const step = (now) => {
            const target = textRef.current
            const backlog = target.length - countRef.current
            const cps = Math.min(MAX_CPS, Math.max(MIN_CPS, backlog / CATCH_UP_SECONDS))
            const advanced = countRef.current + Math.max(1, Math.round(cps * (now - last) / 1000))
            last = now

            countRef.current = Math.min(target.length, nextBoundary(target, advanced))
            setCount(countRef.current)
            frameRef.current = countRef.current < target.length ? requestAnimationFrame(step) : null
        }
        frameRef.current = requestAnimationFrame(step)
    }, [text, animate])

    useEffect(() => () => {
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }, [])

    const isTyping = count < text.length
    return {
        text: isTyping ? closeOpenMarkdown(text.slice(0, count)) : text,
        isTyping,
    }
}
