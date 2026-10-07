import React from 'react'
import { History, PanelRight, Plus, X } from 'lucide-react'

export default function EdahHeader({ onClose, toggleWidth, onClearChat, onShowHistory }) {
    return (
        <div className="flex items-center justify-between px-5 py-4 border-b border-primary/10 bg-primary/5 shrink-0 select-none">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-action border border-white/20 flex items-center justify-center text-white font-serif font-bold shadow-sm text-lg" aria-hidden="true">
                    إ
                </div>
                <div>
                    <h3 className="text-sm font-bold tracking-widest uppercase text-action font-sans">Edah AI</h3>
                    <p className="text-[10px] uppercase tracking-wider text-primary/60 font-sans">Your Tutor</p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <button
                    onClick={onShowHistory}
                    title="Chat history"
                    aria-label="Open chat history"
                    className="px-2.5 py-1 text-xs font-medium text-text/80 hover:text-action hover:bg-primary/10 rounded-lg transition-colors font-sans btn-press flex items-center gap-1"
                >
                    <History size={15} strokeWidth={1.8} aria-hidden="true" /><span>History</span>
                </button>
                <button
                    onClick={onClearChat}
                    title="New Chat"
                    aria-label="Start a new conversation"
                    className="px-2.5 py-1 text-xs font-medium text-text/80 hover:text-action hover:bg-primary/10 rounded-lg transition-colors font-sans btn-press flex items-center gap-1"
                >
                    <Plus size={15} strokeWidth={1.8} aria-hidden="true" />
                    <span>New</span>
                </button>
                <button
                    onClick={toggleWidth}
                    title="Change chat width"
                    aria-label="Change chat width"
                    className="hidden md:block p-2 text-text/75 hover:text-action hover:bg-primary/10 rounded-full transition-colors btn-press text-sm"
                >
                    <PanelRight size={17} strokeWidth={1.8} aria-hidden="true" />
                </button>
                <button
                    onClick={onClose}
                    title="Close Edah"
                    aria-label="Close Edah"
                    className="p-2 text-text/75 hover:text-action hover:bg-primary/10 rounded-full transition-colors btn-press text-sm"
                >
                    <X size={17} strokeWidth={1.8} aria-hidden="true" />
                </button>
            </div>
        </div>
    )
}
