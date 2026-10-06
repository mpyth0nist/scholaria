import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useEdahChat } from '../../hooks/useEdahChat'
import EdahHeader from './EdahHeader'
import EdahMessageList from './EdahMessageList'
import EdahInput from './EdahInput'

const WIDTHS = ['400px', '640px', 'min(60vw, 900px)']

export default function EdahAIAssistant({ isOpen, onClose, lessonId = null, onWidthChange }) {
    const [widthIdx, setWidthIdx] = useState(() => {
        const saved = localStorage.getItem('edahWidthIdx')
        return saved ? Number(saved) : 0
    })

    const {
        messages,
        status,
        sendMessage,
        stopGeneration,
        clearChat,
        retryLast
    } = useEdahChat({ lessonId })

    const currentWidth = WIDTHS[widthIdx]

    useEffect(() => {
        if (onWidthChange) {
            onWidthChange(currentWidth)
        }
    }, [currentWidth, onWidthChange])

    const toggleWidth = () => {
        const next = (widthIdx + 1) % WIDTHS.length
        setWidthIdx(next)
        localStorage.setItem('edahWidthIdx', next)
    }

    // Escape key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const isExpandedWidth = widthIdx > 0

    return createPortal(
        <>
            {/* Mobile backdrop overlay */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-scale-in"
                onClick={onClose}
            />

            {/* Container Drawer */}
            <div
                className={`
                    fixed bottom-0 left-0 right-0 h-[85vh] z-50 rounded-t-3xl overflow-hidden
                    md:bottom-4 md:right-4 md:top-4 md:left-auto md:h-auto md:rounded-2xl
                    bg-[#FAF6EE]/95 dark:bg-[#1A1E1A]/95 backdrop-blur-xl border border-primary/20 shadow-2xl
                    flex flex-col animate-page-enter transition-[width] duration-300
                `}
                style={{ width: typeof window !== 'undefined' && window.innerWidth >= 768 ? currentWidth : '100%' }}
            >
                <EdahHeader
                    onClose={onClose}
                    toggleWidth={toggleWidth}
                    onClearChat={clearChat}
                />

                <EdahMessageList
                    messages={messages}
                    status={status}
                    lessonId={lessonId}
                    isExpandedWidth={isExpandedWidth}
                    onSendSuggestion={sendMessage}
                    onRetry={retryLast}
                />

                <EdahInput
                    onSend={sendMessage}
                    onStop={stopGeneration}
                    status={status}
                    isOpen={isOpen}
                />
            </div>
        </>,
        document.body
    )
}

