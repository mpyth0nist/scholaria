import React, { useEffect } from 'react'

function formatDate(isoString) {
    if (!isoString) return ''
    const d = new Date(isoString)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 5) return 'Just now'
    if (diffHours < 1) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function EdahHistoryDrawer({
    isOpen,
    onClose,
    conversations,
    isLoading,
    activeConversationId,
    onSelectConversation,
    onDeleteConversation,
    onNewChat
}) {
    if (!isOpen) return null

    return (
        <div className="absolute inset-0 bg-[#FAF6EE] dark:bg-[#1A1E1A] z-20 flex flex-col font-sans animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10 bg-primary/5 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-base" aria-hidden="true">◷</span>
                    <h3 className="text-sm font-bold tracking-wide uppercase text-action">Chat History</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onNewChat}
                        className="px-2.5 py-1 text-xs font-semibold text-action hover:bg-action/10 rounded-lg transition-colors btn-press flex items-center gap-1"
                        aria-label="Start a new conversation"
                    >
                        <span>+ New</span>
                    </button>
                    <button
                        onClick={onClose}
                        title="Back to chat"
                        aria-label="Back to chat"
                        className="p-1.5 text-text/75 hover:text-action hover:bg-primary/10 rounded-full transition-colors text-sm"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 flex flex-col gap-1.5">
                {isLoading ? (
                    <div className="flex flex-col gap-2.5 p-2 animate-pulse">
                        {[1, 2, 3, 4].map(n => (
                            <div key={n} className="h-14 rounded-xl bg-primary/10 dark:bg-white/10 w-full" />
                        ))}
                    </div>
                ) : (!Array.isArray(conversations) || conversations.length === 0) ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-text/70">
                        <span className="text-3xl mb-2">💬</span>
                        <p className="text-sm font-medium">No previous conversations yet.</p>
                        <p className="text-xs text-text/60 mt-1">Start a conversation and it will appear here.</p>
                    </div>
                ) : (
                    conversations.map(conv => {
                        const isActive = String(conv.id) === String(activeConversationId)
                        return (
                            <div
                                key={conv.id}
                                className={`
                                    group flex items-center justify-between rounded-xl border transition-all
                                    ${isActive
                                        ? 'bg-action/15 border-action text-action font-semibold shadow-sm'
                                        : 'bg-white/80 dark:bg-[#2D332D]/80 border-primary/10 hover:border-action/40 hover:bg-white text-text'}
                                `}
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        onSelectConversation(conv.id)
                                        onClose()
                                    }}
                                    aria-current={isActive ? 'page' : undefined}
                                    className="flex-1 min-w-0 text-left px-3 py-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                                >
                                    <h4 className="text-[13px] leading-5 truncate">
                                        {conv.title || 'New conversation'}
                                    </h4>
                                    {conv.created_at && <span className="text-[11px] text-text/60 font-normal">
                                        {formatDate(conv.created_at)}
                                    </span>}
                                </button>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDeleteConversation(conv.id)
                                    }}
                                    title="Delete conversation"
                                    aria-label={`Delete ${conv.title || 'conversation'}`}
                                    className="mr-2 p-2 text-text/65 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                >
                                    <span aria-hidden="true">🗑</span>
                                </button>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
