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
    const handleTextareaChange = (e) => {
        const value = e.target.value
        setInput(value)
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = 'auto'
            textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
        }
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
        }
    }

    return (
        <div className="p-4 bg-white/40 dark:bg-black/40 border-t border-primary/10 backdrop-blur-md shrink-0">
            <form onSubmit={handleSubmit} className="relative flex items-end">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Edah a question... (Shift+Enter for new line)"
                    disabled={isBusy}
                    aria-label="Ask Edah a question"
                    className="w-full bg-white dark:bg-[#1A1E1A] border border-primary/20 focus:border-action outline-none rounded-2xl pl-4 pr-12 py-3 text-sm text-text placeholder-primary/40 shadow-sm transition-all disabled:opacity-60 font-sans resize-none overflow-y-auto max-h-[160px] leading-relaxed"
                />
                
                {isBusy ? (
                    <button
                        type="button"
                        onClick={onStop}
                        aria-label="Stop generating"
                        title="Stop generating"
                        className="absolute right-2 bottom-2 w-9 h-9 bg-danger/80 hover:bg-danger text-white rounded-full flex items-center justify-center transition-all shadow-sm btn-press"
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
                        className="absolute right-2 bottom-2 w-9 h-9 bg-action hover:bg-[#2d4d38] text-white rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-action shadow-sm btn-press"
                    >
                        <svg className="w-4 h-4 translate-x-px translate-y-[-1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                )}
            </form>
        </div>
    )
}

