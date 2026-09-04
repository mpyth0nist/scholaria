import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { ACCESS_TOKEN } from '../constants';

const EdahAIAssistant = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Hello! I am Edah (إيضاح), your AI Tutor. How can I help you with this lesson?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        let aiBubbleCreated = false;

        try {
            const token = localStorage.getItem(ACCESS_TOKEN);
            let baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/';
            if (!baseURL.endsWith('/')) baseURL += '/';
            
            const res = await fetch(`${baseURL}api/llm/answer/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    query: userMsg.content,
                    conversation_id: conversationId 
                })
            });

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
            
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    
                    if (!aiBubbleCreated) {
                        setIsLoading(false);
                        setMessages(prev => [...prev, { role: 'ai', content: chunk }]);
                        aiBubbleCreated = true;
                    } else {
                        setMessages(prev => {
                            const newMessages = [...prev];
                            newMessages[newMessages.length - 1].content += chunk;
                            return newMessages;
                        });
                    }
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

    return (
        <>
            {/* Mobile overlay */}
            <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-scale-in"
                onClick={onClose}
            />

            {/* Container */}
            <div className={`
                fixed bottom-0 left-0 right-0 h-[85vh] z-50 rounded-t-3xl overflow-hidden
                lg:static lg:h-[calc(100vh-8rem)] lg:w-[350px] xl:w-[400px] lg:rounded-2xl lg:shrink-0 lg:ml-6
                bg-[#FAF6EE]/90 dark:bg-[#1A1E1A]/90 backdrop-blur-xl border border-primary/20 shadow-2xl
                flex flex-col animate-page-enter
            `}>
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
                    <button onClick={onClose} className="p-2 text-primary/60 hover:text-action hover:bg-primary/10 rounded-full transition-colors btn-press">
                        ✕
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 font-sans relative">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap
                                ${msg.role === 'user' 
                                    ? 'bg-action text-white rounded-br-sm' 
                                    : 'bg-white dark:bg-[#2D332D] text-text border border-primary/10 rounded-bl-sm'}
                            `}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-4 bg-white dark:bg-[#2D332D] text-text border border-primary/10 flex items-center gap-1.5 shadow-sm">
                                <div className="w-1.5 h-1.5 bg-action rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-action rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 bg-action rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-1" />
                </div>

                {/* Input */}
                <div className="p-4 bg-white/40 dark:bg-black/40 border-t border-primary/10 backdrop-blur-md shrink-0">
                    <form onSubmit={handleSubmit} className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask Edah a question..."
                            disabled={isLoading}
                            className="w-full bg-white dark:bg-[#1A1E1A] border border-primary/20 focus:border-action outline-none rounded-full pl-5 pr-12 py-3.5 text-sm text-text placeholder-primary/40 shadow-sm transition-all disabled:opacity-50 font-sans"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-action hover:bg-[#2d4d38] text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-action shadow-sm btn-press"
                        >
                            <svg className="w-4 h-4 translate-x-px translate-y-[-1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EdahAIAssistant;
