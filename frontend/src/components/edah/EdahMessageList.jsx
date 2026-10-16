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

    // Follow new content while the reader is near the bottom. Observing DOM
    // changes keeps up with replies as they are typed out, between renders
    // of the message list itself.
    useEffect(() => {
        const list = listRef.current
        if (!list) return
        const follow = () => {
            const { scrollTop, scrollHeight, clientHeight } = list
            if (scrollHeight - scrollTop - clientHeight < 140) {
                list.scrollTop = scrollHeight
            }
        }
        follow()
        const observer = new MutationObserver(follow)
        observer.observe(list, { childList: true, subtree: true, characterData: true })
        return () => observer.disconnect()
    }, [])

    const isLoading = status === 'loading'
    const isStreaming = status === 'streaming'

    return (
        <div
            ref={listRef}
            className="flex-1 min-h-0 min-w-0 overflow-y-auto overscroll-contain p-4 flex flex-col gap-4 font-sans relative"
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
                <div className="flex justify-start animate-page-enter">
                    <div
                        className="rounded-2xl rounded-bl-sm px-4 py-3.5 bg-[var(--chat-ai-surface)] border border-[var(--chat-ai-border)] shadow-sm flex items-center gap-1.5"
                        role="status"
                        aria-label="Edah is thinking"
                    >
                        <span className="typing-dot w-2 h-2 rounded-full bg-action" />
                        <span className="typing-dot w-2 h-2 rounded-full bg-action" />
                        <span className="typing-dot w-2 h-2 rounded-full bg-action" />
                    </div>
                </div>
            )}
        </div>
    )
}
