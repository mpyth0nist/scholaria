import React, { useState } from 'react'
import { AlertTriangle, Check, Copy, RotateCcw } from 'lucide-react'
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
        } catch {
            // Clipboard access can be unavailable in restricted browser contexts.
        }
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
                        <AlertTriangle size={17} className="shrink-0" aria-hidden="true" />
                        <span className="truncate">{contentStr.replace('\n\n[Error: Stream interrupted]', '')}</span>
                    </div>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm shrink-0 btn-press"
                        >
                            <RotateCcw size={13} aria-hidden="true" /> Retry
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
                        ? 'bg-[var(--chat-user-surface)] text-[var(--chat-user-text)] rounded-br-sm whitespace-pre-wrap'
                        : 'bg-[var(--chat-ai-surface)] text-text border border-[var(--chat-ai-border)] rounded-bl-sm'}
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
                    <div className="absolute -bottom-6 right-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center gap-1 bg-surface border border-border rounded-lg px-1.5 py-0.5 shadow-md z-10 text-xs">
                        <button
                            onClick={handleCopy}
                            title="Copy message"
                            aria-label={copied ? 'Message copied' : 'Copy message'}
                            className="inline-flex items-center gap-1.5 text-text/75 hover:text-action px-1.5 py-0.5 rounded transition-colors"
                        >
                            {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                        {isLatest && !isStreaming && onRetry && (
                            <button
                            onClick={onRetry}
                            title="Regenerate response"
                            aria-label="Regenerate response"
                            className="inline-flex items-center gap-1.5 text-text/75 hover:text-action px-1.5 py-0.5 rounded transition-colors border-l border-border pl-1.5"
                            >
                                <RotateCcw size={14} aria-hidden="true" /> Retry
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
