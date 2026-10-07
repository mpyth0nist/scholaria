import React, { useState } from 'react'
import MarkdownRenderer from './MarkdownRenderer'

export default function EdahMessageBubble({ message, isLatest, isStreaming, isExpandedWidth, onRetry }) {
    const [copied, setCopied] = useState(false)
    const isUser = message?.role === 'user'
    const contentStr = typeof message?.content === 'string' ? message.content : String(message?.content || '')

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(contentStr)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (_) {}
    }

    const isError = !isUser && (
        contentStr.includes('[Error:') ||
        contentStr.startsWith('Sorry, I encountered an error') ||
        contentStr === 'AI service is temporarily unavailable.'
    )

    if (isError) {
        return (
            <div className="flex justify-start">
                <div
                    className={`
                        ${isExpandedWidth ? 'max-w-[96%]' : 'max-w-[85%]'} rounded-2xl rounded-bl-sm px-4 py-3 text-sm
                        bg-red-500/10 dark:bg-red-950/20 border border-red-500/30 text-red-600 dark:text-red-400
                        flex items-center justify-between gap-3 shadow-sm font-sans
                    `}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="shrink-0 text-base">⚠️</span>
                        <span className="truncate">{contentStr.replace('\n\n[Error: Stream interrupted]', '')}</span>
                    </div>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="px-3 py-1 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm shrink-0 btn-press"
                        >
                            Retry
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className={`group flex min-w-0 ${isUser ? 'justify-end' : 'justify-start'} relative`}>
            <div
                className={`
                    ${isExpandedWidth ? 'max-w-[96%]' : 'max-w-[85%]'} min-w-0 rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm relative transition-all
                    ${isUser
                        ? 'bg-action text-white rounded-br-sm whitespace-pre-wrap'
                        : 'bg-white dark:bg-[#2D332D] text-text border border-primary/10 rounded-bl-sm'}
                `}
            >
                {isUser ? (
                    message.content
                ) : (
                    <>
                        <MarkdownRenderer>{message.content}</MarkdownRenderer>
                        {isStreaming && isLatest && (
                            <span className="inline-block w-1.5 h-3.5 bg-action/70 rounded-sm animate-pulse ml-1 align-middle" />
                        )}
                    </>
                )}

                {/* Hover Actions for AI bubbles */}
                {!isUser && (
                    <div className="absolute -bottom-6 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-surface border border-border rounded-lg px-1.5 py-0.5 shadow-md z-10 text-xs">
                        <button
                            onClick={handleCopy}
                            title="Copy message"
                            className="text-text/60 hover:text-action px-1.5 py-0.5 rounded transition-colors"
                        >
                            {copied ? 'Copied ✓' : '📋 Copy'}
                        </button>
                        {isLatest && !isStreaming && onRetry && (
                            <button
                                onClick={onRetry}
                                title="Regenerate response"
                                className="text-text/60 hover:text-action px-1.5 py-0.5 rounded transition-colors border-l border-border pl-1.5"
                            >
                                🔄 Retry
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
