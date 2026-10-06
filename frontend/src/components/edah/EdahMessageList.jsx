import React, { useEffect, useRef } from 'react'
import EdahMessageBubble from './EdahMessageBubble'
import EdahSuggestionChips from './EdahSuggestionChips'

export default function EdahMessageList({
    messages,
    status,
    lessonId,
    isExpandedWidth,
    onSendSuggestion,
    onRetry
}) {
    const listRef = useRef(null)

    // Auto-scroll when near bottom
    useEffect(() => {
        const list = listRef.current
        if (!list) return
        const { scrollTop, scrollHeight, clientHeight } = list
        if (scrollHeight - scrollTop - clientHeight < 140) {
            list.scrollTop = scrollHeight
        }
    }, [messages, status])

    const isLoading = status === 'loading'
    const isStreaming = status === 'streaming'

    return (
        <div
            ref={listRef}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 flex flex-col gap-4 font-sans relative"
            role="log"
            aria-live="polite"
            aria-label="Chat with Edah AI"
        >
            {messages.map((msg, idx) => (
                <React.Fragment key={idx}>
                    <EdahMessageBubble
                        message={msg}
                        isLatest={idx === messages.length - 1}
                        isStreaming={isStreaming}
                        isExpandedWidth={isExpandedWidth}
                        onRetry={onRetry}
                    />
                    {idx === 0 && messages.length === 1 && (
                        <EdahSuggestionChips lessonId={lessonId} onSelect={onSendSuggestion} />
                    )}
                </React.Fragment>
            ))}

            {isLoading && (
                <div className="flex justify-start">
                    <div className={`${isExpandedWidth ? 'max-w-[96%]' : 'max-w-[85%]'} w-full rounded-2xl rounded-bl-sm px-4 py-3.5 bg-white dark:bg-[#2D332D] text-text border border-primary/10 shadow-sm animate-pulse flex flex-col gap-2.5`}>
                        <div className="h-3 rounded-full bg-primary/10 dark:bg-white/10 w-3/4" />
                        <div className="h-3 rounded-full bg-primary/10 dark:bg-white/10 w-5/6" />
                        <div className="h-3 rounded-full bg-primary/10 dark:bg-white/10 w-1/2" />
                    </div>
                </div>
            )}
        </div>
    )
}

