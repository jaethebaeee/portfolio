import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Minimize2, Maximize2, RotateCcw, Wifi, WifiOff } from 'lucide-react';
import useStore from '@/stores/useStore';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import { useChat } from '@/hooks/useChat';

const ChatModal: React.FC = () => {
  const { ui, chat, toggleChat, clearMessages } = useStore();
  const { sendMessage } = useChat();
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat.messages, chat.isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (ui.isChatOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [ui.isChatOpen, isMinimized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || chat.isLoading) return;

    const messageText = message.trim();
    setMessage('');

    try {
      await sendMessage(messageText);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Optionally show user-friendly error message
      // For now, just log the error - the chat hook handles most errors internally
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      clearMessages();
    }
  };

  const suggestedQuestions = [
    "What's your most impressive research achievement?",
    "How do you approach healthcare AI challenges?",
    "What drew you to computational oncology?",
    "How has your work impacted real patients?",
    "What's your vision for AI in healthcare?",
    "What makes Cornell unique for your research?",
    "How do you balance theory and practice?",
    "What's next in your research journey?",
  ];

  const handleSuggestedQuestion = (question: string) => {
    setMessage(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <AnimatePresence>
      {ui.isChatOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleChat}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Chat Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: '100%' }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: 0,
              height: isMinimized ? '60px' : '600px'
            }}
            exit={{ opacity: 0, scale: 0.8, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col overflow-hidden"
            style={{ maxHeight: isMinimized ? '60px' : '600px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
                    chat.isConnected ? 'bg-green-500' : 'bg-red-500'
                  } border-2 border-white`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Jae's AI Assistant</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    {chat.isConnected ? (
                      <>
                        <Wifi size={10} />
                        Online
                      </>
                    ) : (
                      <>
                        <WifiOff size={10} />
                        Offline
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClearChat}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  title="Clear chat"
                >
                  <RotateCcw size={16} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  title={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleChat}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  title="Close chat"
                >
                  <X size={16} />
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col flex-1"
                >
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50 dark:bg-gray-900">
                    {/* Welcome message */}
                    {chat.messages.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                      >
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            👋 Hi! I'm Jae's AI Assistant
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            I can answer questions about Jae's background, skills, experience, and projects. What would you like to know?
                          </p>
                          
                          {/* Suggested questions */}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              Try asking:
                            </p>
                            <div className="space-y-1">
                              {suggestedQuestions.map((question, index) => (
                                <motion.button
                                  key={index}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleSuggestedQuestion(question)}
                                  className="block w-full text-left text-xs px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                  {question}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Chat messages */}
                    {chat.messages.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} />
                    ))}

                    {/* Typing indicator */}
                    {chat.isTyping && <TypingIndicator />}

                    {/* Error message */}
                    {chat.error && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm"
                      >
                        {chat.error}
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex space-x-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={chat.isConnected ? "Ask me anything about Jae..." : "Connecting..."}
                        disabled={chat.isLoading || !chat.isConnected}
                        className="flex-1 input text-sm"
                      />
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={chat.isLoading || !message.trim() || !chat.isConnected}
                        className="btn btn-primary p-2 disabled:opacity-50"
                      >
                        {chat.isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send size={16} />
                        )}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatModal;
