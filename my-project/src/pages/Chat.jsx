import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const hasSentInitial = useRef(false);

    // Check if user is logged in
    const userEmail = localStorage.getItem('userEmail');
    const isLoggedIn = !!userEmail;

    // Per-user storage key
    const historyKey = isLoggedIn ? `chatHistory_${userEmail}` : null;

    // Load chat history from localStorage for this user
    useEffect(() => {
        if (!isLoggedIn) return;
        const saved = localStorage.getItem(historyKey);
        if (saved) {
            try {
                setChatHistory(JSON.parse(saved));
            } catch (e) {
                setChatHistory([]);
            }
        } else {
            setChatHistory([]);
        }
    }, [historyKey, isLoggedIn]);

    // Save chat history to localStorage whenever it changes
    useEffect(() => {
        if (isLoggedIn && chatHistory.length > 0) {
            localStorage.setItem(historyKey, JSON.stringify(chatHistory));
        }
    }, [chatHistory, historyKey, isLoggedIn]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-send initial message from Home page (StrictMode safe)
    useEffect(() => {
        let ignore = false;
        if (location.state?.initialMessage) {
            const msg = location.state.initialMessage;
            window.history.replaceState({}, '');

            const newId = Date.now().toString();
            setActiveChatId(newId);
            setMessages([]);

            // Send message with ignore guard
            const userMessage = msg.trim();
            if (userMessage && !ignore) {
                setMessages([{ role: 'user', content: userMessage }]);
                setLoading(true);

                const controller = new AbortController();
                fetch('http://127.0.0.1:8000/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userMessage, system_prompt: 'You are a helpful assistant.' }),
                    signal: controller.signal,
                })
                    .then(res => {
                        if (!res.ok) throw new Error('Failed');
                        return res.json();
                    })
                    .then(data => {
                        if (!ignore) {
                            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
                        }
                    })
                    .catch(err => {
                        if (!ignore && err.name !== 'AbortError') {
                            setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Could not connect to the AI server. Make sure the backend is running at http://127.0.0.1:8000' }]);
                        }
                    })
                    .finally(() => {
                        if (!ignore) setLoading(false);
                    });

                // Cleanup: abort fetch and set ignore flag on unmount (StrictMode)
                return () => {
                    ignore = true;
                    controller.abort();
                };
            }
        }
    }, [location.state]);

    const startNewChat = () => {
        // Save current chat to history if it has messages
        saveCurrentChat();
        const newId = Date.now().toString();
        setActiveChatId(newId);
        setMessages([]);
        hasSentInitial.current = false;
        inputRef.current?.focus();
    };

    const saveCurrentChat = () => {
        if (!isLoggedIn) return;
        if (messages.length > 0 && activeChatId) {
            setChatHistory(prev => {
                const exists = prev.find(c => c.id === activeChatId);
                const title = messages[0]?.content?.slice(0, 40) + (messages[0]?.content?.length > 40 ? '...' : '');
                if (exists) {
                    return prev.map(c => c.id === activeChatId ? { ...c, messages, title, updatedAt: new Date().toISOString() } : c);
                } else {
                    return [{ id: activeChatId, title, messages, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...prev];
                }
            });
        }
    };

    // Auto-save current chat whenever messages change (only for logged-in users)
    useEffect(() => {
        if (!isLoggedIn) return;
        if (messages.length > 0 && activeChatId) {
            setChatHistory(prev => {
                const title = messages[0]?.content?.slice(0, 40) + (messages[0]?.content?.length > 40 ? '...' : '');
                const exists = prev.find(c => c.id === activeChatId);
                if (exists) {
                    return prev.map(c => c.id === activeChatId ? { ...c, messages, title, updatedAt: new Date().toISOString() } : c);
                } else {
                    return [{ id: activeChatId, title, messages, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...prev];
                }
            });
        }
    }, [messages, isLoggedIn]);

    const loadChat = (chat) => {
        saveCurrentChat();
        setActiveChatId(chat.id);
        setMessages(chat.messages);
    };

    const deleteChat = (e, chatId) => {
        e.stopPropagation();
        setChatHistory(prev => {
            const updated = prev.filter(c => c.id !== chatId);
            if (historyKey) localStorage.setItem(historyKey, JSON.stringify(updated));
            return updated;
        });
        if (activeChatId === chatId) {
            setActiveChatId(null);
            setMessages([]);
        }
    };

    const abortRef = useRef(null);

    const sendMessage = async (messageText) => {
        const userMessage = messageText.trim();
        if (!userMessage) return;

        // Cancel any previous in-flight request
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        if (!activeChatId) {
            setActiveChatId(Date.now().toString());
        }

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    system_prompt: 'You are a helpful assistant.',
                }),
                signal: controller.signal,
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (err) {
            if (err.name !== 'AbortError') {
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: '⚠️ Could not connect to the AI server. Make sure the backend is running at http://127.0.0.1:8000' },
                ]);
            }
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!loading) sendMessage(input);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar — Chat History (only for logged-in users) */}
            {isLoggedIn && (
                <div
                    className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden flex-shrink-0`}
                >
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                        <h2 className="text-sm font-semibold text-gray-700 whitespace-nowrap truncate">{userEmail}</h2>
                        <button
                            onClick={startNewChat}
                            className="h-8 w-8 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center justify-center transition flex-shrink-0"
                            title="New Chat"
                        >
                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 overflow-y-auto">
                        {chatHistory.length === 0 ? (
                            <div className="p-4 text-center">
                                <p className="text-xs text-gray-400">No conversations yet</p>
                            </div>
                        ) : (
                            <div className="py-2">
                                {chatHistory.map(chat => (
                                    <div
                                        key={chat.id}
                                        onClick={() => loadChat(chat)}
                                        className={`group flex items-center justify-between px-4 py-3 cursor-pointer transition ${activeChatId === chat.id
                                            ? 'bg-indigo-50 border-r-2 border-indigo-600'
                                            : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-sm truncate ${activeChatId === chat.id ? 'text-indigo-700 font-medium' : 'text-gray-700'}`}>
                                                {chat.title || 'New Chat'}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">{formatTime(chat.updatedAt)}</p>
                                        </div>
                                        <button
                                            onClick={(e) => deleteChat(e, chat.id)}
                                            className="ml-2 h-6 w-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 transition"
                                            title="Delete"
                                        >
                                            <svg className="h-3.5 w-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
                    <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {isLoggedIn && (
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition"
                                    title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                                >
                                    <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition"
                            >
                                <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <h1 className="text-lg font-semibold text-gray-900">Chat</h1>
                        </div>
                        <button
                            onClick={startNewChat}
                            className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                        >
                            New Chat
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 w-full">
                        {messages.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                                    <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">Start a conversation</h2>
                                <p className="text-gray-500 max-w-sm">Type a message below to chat with the AI assistant. Ask anything!</p>
                            </div>
                        )}

                        {messages.map((msg, index) => (
                            <div key={index} className={`flex mb-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {/* AI Avatar */}
                                {msg.role === 'assistant' && (
                                    <div className="flex-shrink-0 mr-3 mt-1">
                                        <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                                <div
                                    className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-sm'
                                        : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-sm'
                                        }`}
                                >
                                    {msg.role === 'assistant' && (
                                        <p className="text-xs font-medium text-indigo-600 mb-1">AI Assistant</p>
                                    )}
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                {/* User Avatar */}
                                {msg.role === 'user' && (
                                    <div className="flex-shrink-0 ml-3 mt-1">
                                        <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center">
                                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="flex justify-start mb-6">
                                <div className="flex-shrink-0 mr-3 mt-1">
                                    <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="bg-white text-gray-800 border border-gray-200 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                                    <p className="text-xs font-medium text-indigo-600 mb-1">AI Assistant</p>
                                    <div className="flex space-x-1.5 py-1">
                                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Bar */}
                <div className="bg-white border-t border-gray-200 px-4 py-4 flex-shrink-0">
                    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-3 border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-indigo-400 bg-white">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message..."
                                disabled={loading}
                                className="flex-1 outline-none text-gray-700 placeholder-gray-400 disabled:opacity-50 bg-transparent"
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 rounded-xl flex items-center justify-center transition disabled:cursor-not-allowed flex-shrink-0"
                            >
                                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                            AI can make mistakes. Consider checking important information.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;
