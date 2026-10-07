import React, { useState, useRef, useEffect } from 'react'

export default function EdahInput({ onSend, onStop, status, isOpen }) {
    const [input, setInput] = useState('')
    const textareaRef = useRef(null)

    const isBusy = status === 'loading' || status === 'streaming'

    // Auto-focus input when panel opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => textareaRef.current?.focus({ preventScroll: true }), 20)
        }
    }, [isOpen])

    // Auto-resize textarea height
    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = 'auto'
            const nextHeight = Math.min(textarea.scrollHeight, 160)
            textarea.style.height = `${nextHeight}px`
            textarea.style.overflowY = textarea.scrollHeight > 160 ? 'auto' : 'hidden'
        }
    }

    const handleTextareaChange = (e) => {
        setInput(e.target.value)
        adjustTextareaHeight()
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const handleSubmit = (e) => {
        e?.preventDefault()
        if (!input.trim() || isBusy) return
        onSend(input)
        setInput('')
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.overflowY = 'hidden'
        }
    }

    return (
        <div className="p-3 sm:p-4 bg-white/40 dark:bg-black/40 border-t border-primary/10 backdrop-blur-md shrink-0">
            <form onSubmit={handleSubmit} className="flex items-end gap-2 bg-white dark:bg-[#1A1E1A] border border-primary/30 focus-within:border-action focus-within:ring-2 focus-within:ring-action/40 rounded-2xl p-1.5 shadow-sm transition-all">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Edah a question... (Shift+Enter for new line)"
                    disabled={isBusy}
                    aria-label="Ask Edah a question"
                    className="flex-1 bg-transparent border-0 outline-none px-3 py-2 text-sm text-text placeholder:text-text/55 font-sans resize-none max-h-[160px] leading-relaxed overflow-y-hidden"
                />
                
                <div className="shrink-0 mb-0.5">
                    {isBusy ? (
                        <button
                            type="button"
                            onClick={onStop}
                            aria-label="Stop generating"
                            title="Stop generating"
                            className="w-9 h-9 bg-danger/80 hover:bg-danger text-white rounded-xl flex items-center justify-center transition-all shadow-sm btn-press"
                        >
                            {/* Stop Icon (Square) */}
                            <div className="w-3 h-3 bg-white rounded-sm" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            aria-label="Send message"
                            title="Send message"
                            className="w-9 h-9 bg-action hover:bg-[#2d4d38] text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-action shadow-sm btn-press"
                        >
                            <svg className="w-4 h-4 translate-x-px translate-y-[-1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
