/**
 * InlineExplainCard.jsx
 *
 * Shown inline below an anchor block after a SelectionToolbar action.
 * Streams the LLM answer, renders it with ReactMarkdown + remarkGfm.
 * Supports Pin, Dismiss, Stop, Retry.
 *
 * Props:
 *   lessonId        — number
 *   selectedText    — string
 *   surroundingText — string
 *   action          — 'explain' | 'simplify' | 'example'
 *   annotationId    — number | null  (pre-loaded annotation)
 *   initialText     — string | null  (pre-loaded text, skips stream)
 *   isPinned        — boolean
 *   onDismiss()
 *   onPinChange(pinned)
 */
import { useEffect, useRef } from 'react'
import api from '../api'
import { useExplainStream } from '../hooks/useExplainStream'
import { ENDPOINTS } from '../constants'
import MarkdownRenderer from './edah/MarkdownRenderer'

const ACTION_LABELS = {
    explain:  '💡 Explain',
    simplify: '✏️ Simplify',
    example:  '🔬 Example',
}

// Matches CHAT_PROSE from EdahAIAssistant but with overflow-x:auto on tables/pre
const CARD_PROSE = `
    [&_p]:mb-2 [&_p]:last:mb-0
    [&_strong]:font-bold [&_em]:italic
    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
    [&_li]:mb-0.5
    [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1
    [&_h4]:font-bold [&_h4]:mt-2 [&_h4]:mb-1
    [&_code]:bg-black/10 [&_code]:dark:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px]
    [&_a]:text-action [&_a]:underline
`

/** Skeleton lines shown while loading */
function Skeleton() {
    return (
        <div className="flex flex-col gap-2 animate-pulse py-1">
            {[80, 95, 65].map((w, i) => (
                <div key={i} className="h-3 rounded bg-primary/10" style={{ width: `${w}%` }} />
            ))}
        </div>
    )
}

/** Table + pre wrapper with horizontal scroll and min column widths */
function MarkdownComponents() {
    return {
        table: ({ children }) => (
            <div className="overflow-x-auto mb-2">
                <table className="w-full border-collapse text-[13px] min-w-[400px]">{children}</table>
            </div>
        ),
        th: ({ children }) => (
            <th className="text-left font-semibold px-3 py-1.5 border-b-2 border-current/20 bg-black/5 min-w-[80px]" dir="auto">{children}</th>
        ),
        td: ({ children }) => (
            <td className="px-3 py-1.5 border-b border-current/10 min-w-[80px]" dir="auto">{children}</td>
        ),
        pre: ({ children }) => (
            <div className="overflow-x-auto mb-2">
                <pre className="bg-black/5 dark:bg-white/5 p-2 rounded text-sm leading-relaxed" dir="ltr">{children}</pre>
            </div>
        ),
        code: ({ inline, children }) =>
            inline
                ? <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-[13px]">{children}</code>
                : <code className="bg-transparent text-sm leading-relaxed" dir="ltr">{children}</code>,
        p: ({ children }) => <p className="mb-2 last:mb-0" dir="auto">{children}</p>,
        li: ({ children }) => <li className="mb-0.5" dir="auto">{children}</li>,
    }
}

export default function InlineExplainCard({
    lessonId,
    selectedText,
    surroundingText,
    action,
    annotationId: initialAnnotationId = null,
    initialText = null,
    isPinned: initialPinned = false,
    onDismiss,
    onPinChange,
}) {
    const { text, status, annotationId: streamedId, stream, abort } = useExplainStream()
    const didStream = useRef(false)
    const pinned = initialPinned  // lifted to parent via onPinChange
    const resolvedAnnotationId = streamedId ?? initialAnnotationId

    // Auto-stream on mount unless we already have text
    useEffect(() => {
        if (initialText || didStream.current) return
        didStream.current = true
        stream({ lessonId, selectedText, surroundingText, action })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleRetry = () => {
        didStream.current = false
        stream({ lessonId, selectedText, surroundingText, action })
    }

    const handlePin = async () => {
        if (!resolvedAnnotationId) return
        try {
            const res = await api.patch(ENDPOINTS.annotationPin(resolvedAnnotationId))
            onPinChange?.(res.data.pinned)
        } catch (e) {
            console.error('Pin failed', e)
        }
    }

    const displayText = initialText || text
    const displayStatus = initialText ? 'done' : status

    const truncatedQuote = selectedText.length > 80
        ? selectedText.slice(0, 80) + '…'
        : selectedText

    return (
        <div className="w-full my-3 rounded-xl border border-action/20 bg-action/5 shadow-sm overflow-hidden animate-scale-in font-sans">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-action/10 border-b border-action/15">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold uppercase tracking-widest text-action shrink-0">
                        {ACTION_LABELS[action] ?? action}
                    </span>
                    <span className="text-xs text-text/50 truncate italic">"{truncatedQuote}"</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                    {/* Stop */}
                    {displayStatus === 'loading' || displayStatus === 'streaming' ? (
                        <button
                            onClick={abort}
                            title="Stop"
                            className="text-xs px-2 py-1 rounded-lg text-text/60 hover:bg-primary/10 hover:text-text transition btn-press"
                        >
                            ◼ Stop
                        </button>
                    ) : null}
                    {/* Pin */}
                    {resolvedAnnotationId && (displayStatus === 'done') && (
                        <button
                            onClick={handlePin}
                            title={pinned ? 'Unpin' : 'Pin annotation'}
                            className={`text-xs px-2 py-1 rounded-lg transition btn-press ${pinned ? 'text-action font-bold' : 'text-text/50 hover:text-action'}`}
                        >
                            📌
                        </button>
                    )}
                    {/* Dismiss */}
                    <button
                        onClick={onDismiss}
                        title="Dismiss"
                        className="text-xs px-2 py-1 rounded-lg text-text/50 hover:text-danger hover:bg-danger/5 transition btn-press"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="px-4 py-3 text-sm text-text">
                {displayStatus === 'loading' && <Skeleton />}

                {displayStatus === 'error' && (
                    <div className="flex items-center gap-3">
                        <span className="text-danger text-xs">{displayText || 'Something went wrong.'}</span>
                        <button
                            onClick={handleRetry}
                            className="text-xs font-semibold text-action hover:underline btn-press"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {(displayStatus === 'streaming' || displayStatus === 'done') && displayText && (
                    <div className="relative">
                        <MarkdownRenderer>{displayText}</MarkdownRenderer>
                        {displayStatus === 'streaming' && (
                            <span className="inline-block w-1.5 h-3.5 bg-action/60 rounded-sm animate-pulse ml-0.5 align-middle" />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
