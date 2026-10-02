import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../api';

const CHAT_PROSE = `
    [&_p]:mb-2 [&_p]:last:mb-0
    [&_strong]:font-bold [&_em]:italic
    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
    [&_li]:mb-0.5
    [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1
    [&_h4]:font-bold [&_h4]:mt-2 [&_h4]:mb-1
    [&_code]:bg-black/10 [&_code]:dark:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px]
    [&_pre]:bg-black/5 [&_pre]:dark:bg-white/5 [&_pre]:p-2 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:mb-2
    [&_pre_code]:bg-transparent [&_pre_code]:px-0 [&_pre_code]:py-0
    [&_a]:text-action [&_a]:underline
    [&_table]:mb-2 [&_table]:border-collapse [&_table]:text-[13px]
    [&_th]:text-left [&_th]:font-semibold [&_th]:px-2 [&_th]:py-1.5 [&_th]:border-b [&_th]:border-current/20 [&_th]:bg-black/5
    [&_td]:px-2 [&_td]:py-1.5 [&_td]:border-b [&_td]:border-current/10
`;

function MarkdownComponents() {
    return {
        table: ({ children }) => (
            <div className="overflow-x-auto mb-2">
                <table className="w-max min-w-full border-collapse text-[13px]">{children}</table>
            </div>
        ),
        th: ({ children }) => (
            <th className="text-left font-semibold px-3 py-1.5 border-b-2 border-current/20 bg-black/5 min-w-[110px] align-top" dir="auto">{children}</th>
        ),
        td: ({ children }) => (
            <td className="px-3 py-1.5 border-b border-current/10 min-w-[110px] align-top" dir="auto">{children}</td>
        ),
        pre: ({ children }) => (
            <div className="overflow-x-auto mb-2">
                <pre className="bg-black/5 dark:bg-white/5 p-2 rounded text-sm leading-relaxed" dir="ltr" style={{ unicodeBidi: 'isolate' }}>{children}</pre>
            </div>
        ),
        code: ({ inline, children }) =>
            inline
                ? <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-[13px]">{children}</code>
                : <code className="bg-transparent text-sm leading-relaxed" dir="ltr" style={{ unicodeBidi: 'isolate' }}>{children}</code>,
        p: ({ children }) => <p className="mb-2 last:mb-0" dir="auto">{children}</p>,
        li: ({ children }) => <li className="mb-0.5" dir="auto">{children}</li>,
        h3: ({ children }) => <h3 className="font-bold mt-3 mb-1" dir="auto">{children}</h3>,
        h4: ({ children }) => <h4 className="font-bold mt-2 mb-1" dir="auto">{children}</h4>,
    }
}

const WIDTHS = ['400px', '640px', 'min(60vw, 900px)'];

const EdahAIAssistant = ({ isOpen, onClose, lessonId = null, onWidthChange }) => {
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Hello! I am Edah (إيضاح), your AI Tutor. How can I help you with this lesson?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const listRef = useRef(null);
    const inputRef = useRef(null);

    const [widthIdx, setWidthIdx] = useState(() => {
        const saved = localStorage.getItem('edahWidthIdx');
        return saved ? Number(saved) : 0;
    });

    const currentWidth = WIDTHS[widthIdx];

    useEffect(() => {
        if (onWidthChange) {
            onWidthChange(currentWidth);
        }
    }, [currentWidth, onWidthChange]);

    const toggleWidth = () => {
        const next = (widthIdx + 1) % WIDTHS.length;
        setWidthIdx(next);
        localStorage.setItem('edahWidthIdx', next);
    };

    useEffect(() => {
        if (isOpen) {
            // Give layout a tick before focusing
            setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 10);
        }
    }, [isOpen]);

    useEffect(() => {
        const list = listRef.current;
        if (!list) return;
        const { scrollTop, scrollHeight, clientHeight } = list;
        if (scrollHeight - scrollTop - clientHeight < 120) {
            list.scrollTop = scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        let aiBubbleCreated = false;

        try {
            let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/';
            if (!baseURL.endsWith('/')) baseURL += '/';

            const getCookie = (name) => {
                let cookieValue = null;
                if (document.cookie && document.cookie !== '') {
                    const cookies = document.cookie.split(';');
                    for (let i = 0; i < cookies.length; i++) {
                        const cookie = cookies[i].trim();
                        if (cookie.substring(0, name.length + 1) === (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            };

            const makeFetch = () => fetch(`${baseURL}api/llm/answer/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify({
                    query: userMsg.content,
                    conversation_id: conversationId,
                    lesson_id: lessonId,
                }),
            });

            let res = await makeFetch();

            if (res.status === 401) {
                try {
                    await api.post('api/users/token/refresh/');
                } catch (_) {
                    throw new Error('Session expired. Please log in again.');
                }
                res = await makeFetch();
            }

            if (!res.ok) {
                let errorMsg = 'Sorry, I encountered an error. Please try again.';
                try {
                    const errorData = await res.json();
                    if (errorData.error) errorMsg = errorData.error;
                } catch (e) {}
                throw new Error(errorMsg);
            }

            const newConvId = res.headers.get('X-Conversation-Id');
            if (newConvId) setConversationId(newConvId);

            const reader = res.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let done = false;
            let accumulatedText = "";
            
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    accumulatedText += chunk;
                    
                    if (!aiBubbleCreated) {
                        setIsLoading(false);
                        aiBubbleCreated = true;
                    }
                    
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMsg = newMessages[newMessages.length - 1];
                        if (lastMsg && lastMsg.role === 'ai') {
                            newMessages[newMessages.length - 1] = { ...lastMsg, content: accumulatedText };
                        } else {
                            newMessages.push({ role: 'ai', content: accumulatedText });
                        }
                        return newMessages;
                    });
                }
            }
            if (!aiBubbleCreated) {
                setIsLoading(false);
                setMessages(prev => [...prev, { role: 'ai', content: 'No response received.' }]);
            }
        } catch (err) {
            setIsLoading(false);
            if (!aiBubbleCreated) {
                setMessages(prev => [...prev, { role: 'ai', content: err.message || 'Sorry, I encountered an error. Please try again.' }]);
            } else {
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content += '\n\n[Error: Stream interrupted]';
                    return newMessages;
                });
            }
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <>
            {/* Mobile overlay */}
            <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-scale-in"
                onClick={onClose}
            />

            {/* Container */}
            <div 
                className={`
                    fixed bottom-0 left-0 right-0 h-[85vh] z-50 rounded-t-3xl overflow-hidden
                    md:bottom-4 md:right-4 md:top-4 md:left-auto md:h-auto md:rounded-2xl
                    bg-[#FAF6EE]/90 dark:bg-[#1A1E1A]/90 backdrop-blur-xl border border-primary/20 shadow-2xl
                    flex flex-col animate-page-enter transition-[width] duration-300
                `}
                style={{ width: typeof window !== 'undefined' && window.innerWidth >= 768 ? currentWidth : '100%' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-primary/10 bg-primary/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white dark:bg-black border border-primary/20 flex items-center justify-center text-action font-serif font-bold shadow-sm">
                            إ
                        </div>
                        <div>
                            <h3 className="text-sm font-bold tracking-widest uppercase text-action font-sans">Edah AI</h3>
                            <p className="text-[10px] uppercase tracking-wider text-primary/60 font-sans">Your Tutor</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={toggleWidth} className="hidden md:block p-2 text-primary/60 hover:text-action hover:bg-primary/10 rounded-full transition-colors btn-press">
                            ⟷
                        </button>
                        <button onClick={onClose} className="p-2 text-primary/60 hover:text-action hover:bg-primary/10 rounded-full transition-colors btn-press">
                            ✕
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div
                    ref={listRef}
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 flex flex-col gap-4 font-sans relative"
                    role="log"
                    aria-live="polite"
                    aria-label="Chat with Edah AI"
                >
    {messages.map((msg, idx) => (
        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
                ${widthIdx > 0 ? 'max-w-[96%]' : 'max-w-[85%]'} rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                    ? 'bg-action text-white rounded-br-sm whitespace-pre-wrap' 
                    : `bg-white dark:bg-[#2D332D] text-text border border-primary/10 rounded-bl-sm ${CHAT_PROSE}`}
            `}>
                {msg.role === 'ai' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents()}>{msg.content}</ReactMarkdown>
                ) : (
                    msg.content
                )}
            </div>
        </div>
    ))}
    {isLoading && (
        <div className="flex justify-start">
            <div className={`${widthIdx > 0 ? 'max-w-[96%]' : 'max-w-[85%]'} rounded-2xl rounded-bl-sm px-4 py-4 bg-white dark:bg-[#2D332D] text-text border border-primary/10 flex items-center gap-1.5 shadow-sm`}>
                <div className="w-1.5 h-1.5 bg-action rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-action rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-action rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    )}
</div>

{/* Input */}
<div className="p-4 bg-white/40 dark:bg-black/40 border-t border-primary/10 backdrop-blur-md shrink-0">
    <form onSubmit={handleSubmit} className="relative">
        <input
            ref={inputRef}
            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask Edah a question..."
                            disabled={isLoading}
                            aria-label="Ask Edah a question"
                            className="w-full bg-white dark:bg-[#1A1E1A] border border-primary/20 focus:border-action outline-none rounded-full pl-5 pr-12 py-3.5 text-sm text-text placeholder-primary/40 shadow-sm transition-all disabled:opacity-50 font-sans"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            aria-label="Send message"
                            className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-action hover:bg-[#2d4d38] text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-action shadow-sm btn-press"
                        >
                            <svg className="w-4 h-4 translate-x-px translate-y-[-1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </>,
        document.body
    );
};

export default EdahAIAssistant;
