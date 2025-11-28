import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Check, CheckCheck, Clock } from 'lucide-react';
import { soundManager } from '@/utils/soundManager';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '👋 **Hello! I\'m Jae\'s AI Assistant**\n\nI\'m passionate about Jae\'s work in **healthcare AI** and **computational biology**. He\'s a Cornell BA/MS \'25 candidate with research experience at MSKCC and 2 peer-reviewed publications.\n\n💡 **Ask me about:**\n• His clinical machine learning projects\n• Healthcare AI applications\n• Research collaborations\n• Technical expertise\n• Career aspirations\n\nWhat would you like to know about Jae\'s research journey?',
      sender: 'bot',
      timestamp: new Date(),
      status: 'read'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Simulate message being sent
    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
      ));
      soundManager.playMessageSent(0.2);
    }, 200);

    // Simple response - in a real app, this would connect to an AI service
    setTimeout(() => {
      // Mark user message as delivered
      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
      ));

      const responses = [
        "Thanks for your message! Jae typically responds within 24 hours. For detailed discussions about AI projects or collaborations, feel free to email him directly.",
        "I'd be happy to help! Jae works on healthcare AI and machine learning. Check out his projects section for more details on his work.",
        "Great question! Jae's background includes Cornell BA/MS in AI and extensive experience in clinical ML applications. You can find more details in the About and Skills sections.",
        "Thanks for reaching out! For professional opportunities or detailed technical discussions, Jae prefers direct communication via email or LinkedIn."
      ];

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent'
      };

      setMessages(prev => [...prev, botMessage]);
      soundManager.playMessageReceived(0.15);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Enhanced Chat Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-600 hover:from-cyan-500 hover:via-blue-600 hover:to-cyan-700 text-white rounded-full shadow-2xl flex items-center justify-center z-50 group"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(true);
          soundManager.playChatOpen(0.3);
        }}
        aria-label="Open chat"
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(34, 211, 238, 0.4)",
            "0 0 0 10px rgba(34, 211, 238, 0)",
          ]
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <MessageCircle className="w-7 h-7" />
        </motion.div>

        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyan-300/50"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Notification badge */}
        {messages.length > 1 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
          >
            {messages.length - 1}
          </motion.div>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-80 h-[calc(100vh-8rem)] sm:h-96 max-w-sm bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-xl shadow-2xl backdrop-blur-sm z-50 flex flex-col overflow-hidden"
          >
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-white font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    AI Assistant
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">Online</p>
                    <div className="flex space-x-1">
                      <motion.div
                        className="w-1 h-1 bg-green-400 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-1 h-1 bg-green-400 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      />
                      <motion.div
                        className="w-1 h-1 bg-green-400 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <motion.button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-gray-400" />
              </motion.button>
            </div>

            {/* Enhanced Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: index === messages.length - 1 ? 0 : 0
                  }}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  <div className="max-w-xs">
                    {/* Message Header */}
                    <div className={`flex items-center gap-1 mb-1 text-xs text-gray-500 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      {msg.sender === 'bot' ? (
                        <>
                          <Bot className="w-3 h-3" />
                          <span>AI Assistant</span>
                        </>
                      ) : (
                        <>
                          <span>You</span>
                          <User className="w-3 h-3" />
                        </>
                      )}
                      <span className="mx-1 opacity-50">•</span>
                      <Clock className="w-3 h-3" />
                      <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Message Bubble */}
                    <motion.div
                      className={`relative px-4 py-3 rounded-2xl shadow-lg ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-br-md'
                          : 'bg-gradient-to-br from-gray-800 to-gray-700 text-gray-100 rounded-bl-md'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                      {/* Message Status */}
                      {msg.sender === 'user' && msg.status && (
                        <div className="flex justify-end mt-2 gap-1">
                          {msg.status === 'sending' && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Clock className="w-3 h-3 text-cyan-200" />
                            </motion.div>
                          )}
                          {msg.status === 'sent' && <Check className="w-3 h-3 text-cyan-200" />}
                          {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 text-cyan-200" />}
                          {msg.status === 'read' && (
                            <div className="relative">
                              <CheckCheck className="w-3 h-3 text-cyan-200" />
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 bg-gradient-to-r from-gray-600 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Input */}
            <div className="p-4 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-sm"
                      disabled={false}
                    />
                    {message.length > 0 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                        {message.length}
                      </div>
                    )}
                  </div>
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      message.trim()
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                    whileHover={message.trim() ? { scale: 1.05 } : {}}
                    whileTap={message.trim() ? { scale: 0.95 } : {}}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Input Hint */}
                <div className="text-xs text-gray-500 text-center">
                  Press Enter to send • Ask about Jae's background, skills, or projects
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}