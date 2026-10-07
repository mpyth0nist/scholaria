import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useEdahChat } from '../../hooks/useEdahChat'
import EdahHeader from './EdahHeader'
import EdahMessageList from './EdahMessageList'
import EdahInput from './EdahInput'
import EdahHistoryDrawer from './EdahHistoryDrawer'
import { BASE_URL, getCookie } from '../../utils/http'

const WIDTHS = ['400px', '640px', 'min(60vw, 900px)']

export default function EdahAIAssistant({ isOpen, onClose, lessonId = null, onWidthChange }) {
    const [widthIdx, setWidthIdx] = useState(() => {
        const saved = localStorage.getItem('edahWidthIdx')
        return saved ? Number(saved) : 0
    })
    const [historyOpen, setHistoryOpen] = useState(false)
    const [conversations, setConversations] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)

    const {
        messages,
        status,
        sendMessage,
        stopGeneration,
        clearChat,
        selectConversation,
        conversationId,
        retryLast
    } = useEdahChat({ lessonId })

    const currentWidth = WIDTHS[widthIdx]

    const loadConversations = useCallback(async () => {
        setHistoryLoading(true)
        try {
            const response = await fetch(`${BASE_URL}api/llm/conversations/`, { credentials: 'include' })
            if (!response.ok) throw new Error('Could not load chat history')
            const data = await response.json()
            // The current API returns an id-to-title object; accept arrays too for forward compatibility.
            const items = Array.isArray(data)
                ? data
                : Object.entries(data || {}).map(([id, title]) => ({ id, title }))
            setConversations(items)
        } catch (_) {
            setConversations([])
        } finally {
            setHistoryLoading(false)
        }
    }, [])

    useEffect(() => {
        if (isOpen) loadConversations()
    }, [isOpen, loadConversations])

    useEffect(() => {
        if (conversationId && isOpen && status === 'idle') loadConversations()
    }, [conversationId, isOpen, status, loadConversations])

    const deleteConversation = async (id) => {
        try {
            const response = await fetch(`${BASE_URL}api/llm/conversations/${id}/`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'X-CSRFToken': getCookie('csrftoken') || '' },
            })
            if (!response.ok) throw new Error('Could not delete conversation')
            if (String(id) === String(conversationId)) clearChat()
            await loadConversations()
        } catch (_) {
            // Keep the item visible when deletion fails so the user can retry.
        }
    }

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
                    fixed bottom-2 left-2 right-2 h-[85vh] z-30 rounded-2xl overflow-hidden m-8
                    md:bottom-4 md:right-5 md:top-4 md:left-auto md:h-auto
                    bg-[#FAF6EE]/95 dark:bg-[#1A1E1A]/95 backdrop-blur-xl border border-primary/20 shadow-2xl
                    flex flex-col animate-page-enter transition-[width] duration-300
                `}
                style={{ width: typeof window !== 'undefined' && window.innerWidth >= 768 ? currentWidth : undefined }}
            >
                <EdahHeader
                    onClose={onClose}
                    toggleWidth={toggleWidth}
                    onClearChat={clearChat}
                    onShowHistory={() => { setHistoryOpen(true); loadConversations() }}
                />
                <div className="relative flex flex-1 min-h-0 flex-col">
                    <EdahMessageList
                        messages={messages}
                        status={status}
                        lessonId={lessonId}
                        isExpandedWidth={isExpandedWidth}
                        onSendSuggestion={sendMessage}
                        onRetry={retryLast}
                    />
                    <EdahInput onSend={sendMessage} onStop={stopGeneration} status={status} isOpen={isOpen} />
                    <EdahHistoryDrawer
                        isOpen={historyOpen}
                        onClose={() => setHistoryOpen(false)}
                        conversations={conversations}
                        isLoading={historyLoading}
                        activeConversationId={conversationId}
                        onSelectConversation={selectConversation}
                        onDeleteConversation={deleteConversation}
                        onNewChat={() => { clearChat(); setHistoryOpen(false) }}
                    />
                </div>
            </div>
        </>,
        document.body
    )
}
