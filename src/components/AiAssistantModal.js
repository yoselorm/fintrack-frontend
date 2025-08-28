import React, { useState, useEffect, useRef } from 'react';
import {
    X, Send, Bot, User, TrendingUp, PiggyBank, AlertCircle,
    Lightbulb, DollarSign, Target, Calendar, BarChart3, Loader, Lock, Gift
} from 'lucide-react';
import { useSelector } from 'react-redux';

const AiAssistantModal = ({ isOpen, onClose, userTransactions = [], userProfile = {} }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('chat');
    const {
        referralCode,
        totalReferrals,
        totalRewards,
    } = useSelector((state) => state.referral);
    console.log(totalRewards)

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Check if user has minimum rewards to access AI
    const hasAccess = (totalRewards || 0) >= 20;
    const rewardsNeeded = 20 - (totalRewards || 0);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen && hasAccess) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, hasAccess]);

    // Initialize with welcome message
    useEffect(() => {
        if (isOpen && messages.length === 0 && hasAccess) {
            setMessages([{
                id: 1,
                type: 'ai',
                content: `Hello! 👋 I'm your AI financial assistant powered by Gemini. I can help you with:

• **Spending Analysis** - Break down your expenses
• **Budget Planning** - Create personalized budgets  
• **Investment Advice** - Ghana-specific opportunities
• **Savings Goals** - Achieve your financial targets

What would you like to explore today?`,
                timestamp: new Date(),
                suggestions: [
                    'Analyze my recent spending',
                    'Create a monthly budget',
                    'Investment options in Ghana',
                    'How can I save more money?'
                ]
            }]);
        }
    }, [isOpen, hasAccess]);

    // Gemini API call...the setup is done in the backend with the API key
    const getGeminiResponse = async (userMessage) => {
        try {
            const response = await fetch('http://localhost:5001/api/financial-advice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    message: userMessage,
                    transactions: userTransactions.slice(0, 20),
                    userProfile: {
                        name: userProfile.firstName,
                        location: 'Ghana',
                        currency: 'GHS' || 'USD'
                    },
                    context: 'financial_assistant'
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            return data.advice || data.response;
        } catch (error) {
            console.error('Gemini API error:', error);
            throw error;
        }
    };

    const sendMessage = async (messageText = inputMessage) => {
        if (!messageText.trim() || !hasAccess) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: messageText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const aiResponse = await getGeminiResponse(messageText);

            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: aiResponse,
                timestamp: new Date(),
                suggestions: generateSuggestions(messageText)
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: "I apologize, but I'm experiencing some technical difficulties connecting to my AI services. Please try again in a moment, or check your internet connection.",
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const generateSuggestions = (lastMessage) => {
        const lowerMessage = lastMessage.toLowerCase();

        if (lowerMessage.includes('spending') || lowerMessage.includes('expense')) {
            return [
                'Break down by categories',
                'Compare with last month',
                'Find areas to cut costs'
            ];
        }
        if (lowerMessage.includes('budget')) {
            return [
                'Set up emergency fund',
                'Track monthly expenses',
                '50/20/20 budgeting rule'
            ];
        }
        if (lowerMessage.includes('investment') || lowerMessage.includes('invest')) {
            return [
                'Ghana Treasury Bills',
                'Mutual funds options',
                'Stock market basics'
            ];
        }
        if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
            return [
                'High-yield savings accounts',
                'Automatic savings tips',
                'Emergency fund calculator'
            ];
        }

        return [
            'Analyze my transactions',
            'Budget recommendations',
            'Investment opportunities',
            'Debt management tips'
        ];
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && hasAccess) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Access Denied Component
    const AccessDenied = () => (
        <div className="flex-1 flex items-center justify-center p-8 overflow-scroll">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock size={20} className="text-gray-400" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    AI Assistant Premium Feature
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                    You need <strong>{rewardsNeeded} more referral rewards</strong> to unlock the AI Financial Assistant.
                    Share your referral code and earn rewards to get personalized financial advice!
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Gift className="text-blue-600" size={20} />
                        <span className="font-medium text-blue-900">Current Status</span>
                    </div>
                    <div className="text-sm text-blue-800">
                        <div className="flex justify-between mb-1">
                            <span>Referral Rewards:</span>
                            <span className="font-medium">{totalRewards || 0} / 20</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Referrals:</span>
                            <span className="font-medium">{totalReferrals || 0}</span>
                        </div>
                    </div>

                    <div className="mt-3">
                        <div className="bg-blue-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(((totalRewards || 0) / 20) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        <strong>Your Referral Code:</strong> <span className="font-mono text-blue-600">{referralCode}</span>
                    </div>

                    <p className="text-xs text-gray-500">
                        Share your code with friends and family. You both get 10 rewards when they sign up!
                    </p>
                </div>
            </div>
        </div>
    );

    const QuickActions = () => (
        <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => sendMessage('Analyze my spending patterns')}
                    disabled={!hasAccess}
                    className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <BarChart3 size={16} className="text-blue-600" />
                    <span className="text-blue-700">Spending Analysis</span>
                </button>

                <button
                    onClick={() => sendMessage('Help me create a monthly budget')}
                    disabled={!hasAccess}
                    className="flex items-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Target size={16} className="text-green-600" />
                    <span className="text-green-700">Budget Help</span>
                </button>

                <button
                    onClick={() => sendMessage('What are the best investment options in Ghana?')}
                    disabled={!hasAccess}
                    className="flex items-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <TrendingUp size={16} className="text-purple-600" />
                    <span className="text-purple-700">Investments</span>
                </button>

                <button
                    onClick={() => sendMessage('How can I save more money each month?')}
                    disabled={!hasAccess}
                    className="flex items-center gap-2 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PiggyBank size={16} className="text-orange-600" />
                    <span className="text-orange-700">Savings Tips</span>
                </button>
            </div>
        </div>
    );

    const MessageBubble = ({ message }) => (
        <div className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            {message.type === 'ai' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-white" />
                </div>
            )}

            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                <div className={`p-3 rounded-2xl ${message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : message.isError
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-gray-100 text-gray-900'
                    }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.type === 'ai' && !message.isError && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Powered by Gemini
                        </span>
                    )}
                </div>

                {/* AI Suggestions */}
                {message.type === 'ai' && message.suggestions && !message.isError && (
                    <div className="mt-3 space-y-1">
                        {message.suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => sendMessage(suggestion)}
                                className="block w-full text-left p-2 text-xs bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                            >
                                💡 {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {message.type === 'user' && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-gray-600" />
                </div>
            )}
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl h-[800px] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Bot size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                AI Financial Assistant {!hasAccess && <Lock size={16} className="inline ml-1 text-gray-400" />}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {hasAccess ? 'Powered by Gemini • Always here to help' : `Unlock with ${rewardsNeeded} more rewards`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close AI Assistant"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {!hasAccess ? (
                    <AccessDenied />
                ) : (
                    <>
                        <QuickActions />

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <MessageBubble key={message.id} message={message} />
                            ))}

                            {isLoading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <Bot size={16} className="text-white" />
                                    </div>
                                    <div className="bg-gray-100 rounded-2xl p-3">
                                        <div className="flex items-center gap-2">
                                            <Loader size={16} className="animate-spin text-blue-500" />
                                            <span className="text-sm text-gray-600">
                                                Thinking...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-gray-200">
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <textarea
                                        ref={inputRef}
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder={hasAccess ? "Ask me anything about your finances..." : "Unlock AI Assistant with 20 referral rewards"}
                                        className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                                        rows="1"
                                        disabled={isLoading || !hasAccess}
                                        style={{ minHeight: '44px', maxHeight: '120px' }}
                                        onInput={(e) => {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }}
                                    />
                                    <button
                                        onClick={() => sendMessage()}
                                        disabled={!inputMessage.trim() || isLoading || !hasAccess}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Send message"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                <span>{hasAccess ? 'Press Enter to send, Shift+Enter for new line' : 'Referral rewards required'}</span>
                                <span className="flex items-center gap-1">
                                    <div className={`w-2 h-2 ${hasAccess ? 'bg-green-500' : 'bg-gray-400'} rounded-full`}></div>
                                    {hasAccess ? 'Connected to Gemini AI' : 'Access Restricted'}
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AiAssistantModal;