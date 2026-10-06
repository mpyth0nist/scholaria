import React from 'react'

export default function EdahHeader({ onClose, toggleWidth, onClearChat }) {
    return (
        <div className="flex items-center justify-between px-5 py-4 border-b border-primary/10 bg-primary/5 shrink-0 select-none">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white dark:bg-black border border-primary/20 flex items-center justify-center text-action font-serif font-bold shadow-sm text-lg">
                    إ
                </div>
                <div>
                    <h3 className="text-sm font-bold tracking-widest uppercase text-action font-sans">Edah AI</h3>
                    <p className="text-[10px] uppercase tracking-wider text-primary/60 font-sans">Your Tutor</p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <button
                    onClick={onClearChat}
                    title="New Chat"
                    className="px-2.5 py-1 text-xs text-primary/60 hover:text-action hover:bg-primary/10 rounded-lg transition-colors font-sans btn-press flex items-center gap-1"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>New</span>
                </button>
                <button
                    onClick={toggleWidth}
                    title="Toggle Width"
                    className="hidden md:block p-2 text-primary/60 hover:text-action hover:bg-primary/10 rounded-full transition-colors btn-press text-xs"
                >
                    ⟷
                </button>
                <button
                    onClick={onClose}
                    title="Close"
                    className="p-2 text-primary/60 hover:text-action hover:bg-primary/10 rounded-full transition-colors btn-press text-xs"
                >
                    ✕
                </button>
            </div>
        </div>
    )
}

