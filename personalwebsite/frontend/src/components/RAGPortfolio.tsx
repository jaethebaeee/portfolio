import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, Bot, User, ChevronLeft, Home, Check, CheckCheck, Clock, Sparkles, MessageSquare } from 'lucide-react';
import { ragOrchestrator, RAGResponse } from '../services/ragOrchestrator';
import { DocumentChunk } from '../services/contentIndexer';
import { soundManager } from '../utils/soundManager';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: DocumentChunk[];
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isTyping?: boolean;
}

interface RAGPortfolioProps {
  onExit?: () => void;
  onBack?: () => void;
}

export function RAGPortfolio({ onExit, onBack }: RAGPortfolioProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: "🤖 **Hey there! I'm Jae's AI Portfolio Guide**\n\nI'm your personal navigator through Jae's world of **AI-powered healthcare innovation**. He builds cutting-edge machine learning systems that are literally saving lives - his cancer research models hit **92% accuracy** in clinical trials at Memorial Sloan Kettering Cancer Center (MSKCC).\n\n🚀 **Let's dive into what makes Jae tick:**\n\n• **Clinical ML Excellence** - Real-world deployment of AI in hospitals\n• **Computational Oncology** - Fighting cancer with data science at MSKCC\n• **Biomedical Signal Processing** - Turning complex medical data into insights\n• **Healthcare AI Vision** - Building the future of personalized medicine\n• **Research Journey** - From academic breakthroughs to clinical impact\n\n💭 **What fascinates you most about healthcare AI?**\n\nAsk me anything - from technical deep dives to the human stories behind the research!",
      timestamp: new Date(),
      status: 'read'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Generate initial suggestions
    setSuggestions(ragOrchestrator.getSuggestions(''));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate message being sent
    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
      ));
      soundManager.playMessageSent(0.2);
    }, 200);

    try {
      const response: RAGResponse = await ragOrchestrator.query({
        query: userMessage.content,
        maxResults: 5
      });

      // Mark user message as delivered
      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
      ));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.answer,
        sources: response.sources,
        timestamp: new Date(),
        status: 'sent'
      };

      setMessages(prev => [...prev, assistantMessage]);
      soundManager.playMessageReceived(0.15);

      // Update suggestions based on the conversation
      const newSuggestions = ragOrchestrator.getSuggestions(userMessage.content);
      setSuggestions(newSuggestions);

    } catch (error) {
      console.error('RAG query error:', error);

      // Mark user message as delivered even if response failed
      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
      ));

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I apologize, but I'm having trouble processing your question right now. Please try again or ask about Jae's projects, skills, or experience.",
        timestamp: new Date(),
        status: 'sent'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };


  return (
    <motion.div
      className="h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-cyan-900/10 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={onBack || onExit}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <div className="flex items-center space-x-3">
            {/* AI Avatar with Status */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <motion.div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  isLoading ? 'bg-yellow-400' : 'bg-green-400'
                }`}
                animate={{ scale: isLoading ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 2, repeat: isLoading ? Infinity : 0 }}
              />
            </div>

            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Portfolio Assistant
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-400">
                  {isLoading ? 'Thinking...' : 'Online & ready to help'}
                </p>
                {!isLoading && (
                  <motion.div
                    className="flex space-x-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
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
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Message Count */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-slate-800/50 rounded-full text-xs text-slate-400">
            <MessageSquare className="w-3 h-3" />
            <span>{messages.length} messages</span>
          </div>

          <motion.button
            onClick={onExit}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Home className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                duration: 0.3,
                delay: index === messages.length - 1 ? 0 : 0
              }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} group`}
            >
              <div className={`max-w-[85%] sm:max-w-[75%] ${
                message.type === 'user'
                  ? 'order-2 ml-auto'
                  : 'order-1 mr-auto'
              }`}>
                {/* Message Header */}
                <div className={`flex items-center gap-2 mb-2 px-1 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  <div className={`flex items-center gap-1.5 text-xs ${
                    message.type === 'user' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {message.type === 'assistant' ? (
                      <>
                        <Bot className="w-3 h-3 text-blue-400" />
                        <span className="font-medium">AI Assistant</span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">You</span>
                        <User className="w-3 h-3 text-slate-400" />
                      </>
                    )}
                    <span className="mx-1 opacity-50">•</span>
                    <Clock className="w-3 h-3" />
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Message Bubble */}
                <motion.div
                  className={`relative px-4 py-3 rounded-2xl shadow-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md'
                      : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-100 rounded-bl-md'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Message Content */}
                  <div className="relative">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>

                    {/* Typing Indicator for User Messages */}
                    {message.status === 'sending' && message.type === 'user' && (
                      <motion.div className="flex items-center gap-1 mt-2 text-xs text-blue-200">
                        <Clock className="w-3 h-3" />
                        <span>Sending...</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ delay: 0.3 }}
                      className="mt-4 pt-3 border-t border-slate-600/50"
                    >
                      <div className="flex items-center gap-1 mb-2">
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-slate-400 font-medium">Sources</span>
                      </div>
                      <div className="space-y-2">
                        {message.sources.slice(0, 3).map((source, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-center gap-2 p-2 bg-slate-600/30 rounded-lg hover:bg-slate-600/50 transition-colors cursor-pointer"
                          >
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-blue-300 truncate">
                                {source.metadata.title}
                              </p>
                              <p className="text-xs text-slate-400 capitalize">
                                {source.metadata.type}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Message Status */}
                  {message.type === 'user' && message.status && (
                    <div className="flex justify-end mt-2">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        {message.status === 'sending' && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Clock className="w-3 h-3" />
                          </motion.div>
                        )}
                        {message.status === 'sent' && <Check className="w-3 h-3" />}
                        {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                        {message.status === 'read' && (
                          <div className="relative">
                            <CheckCheck className="w-3 h-3 text-blue-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%] sm:max-w-[75%] mr-auto">
              {/* Typing Header */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Bot className="w-3 h-3 text-blue-400" />
                  <span className="font-medium">AI Assistant</span>
                  <span className="mx-1 opacity-50">•</span>
                  <span>Typing...</span>
                </div>
              </div>

              {/* Typing Bubble */}
              <motion.div
                className="relative px-4 py-3 rounded-2xl rounded-bl-md bg-gradient-to-br from-slate-700 to-slate-800 text-slate-100 shadow-lg"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div className="flex space-x-1">
                    <motion.div
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-sm text-slate-400 ml-2">Thinking...</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {suggestions.length > 0 && messages.length <= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="px-4 pb-4"
        >
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-300">💡 Try asking:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.slice(0, 6).map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-blue-600 hover:to-blue-700 rounded-lg text-left text-sm text-slate-200 hover:text-white transition-all duration-200 border border-slate-600 hover:border-blue-500 group"
                  disabled={isLoading}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0 group-hover:bg-blue-300 transition-colors" />
                    <span className="leading-relaxed">{suggestion}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Input Area */}
      <div className="p-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Input Field */}
          <div className="relative">
            <div className="flex items-start space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder={isLoading ? "AI is thinking..." : "Ask about Jae's projects, skills, or experience..."}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 resize-none min-h-[48px] max-h-32 transition-all duration-200"
                  disabled={isLoading}
                  rows={1}
                  style={{ height: 'auto', minHeight: '48px' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                  }}
                />
                {/* Character Counter */}
                {input.length > 0 && (
                  <div className="absolute bottom-2 right-3 text-xs text-slate-500">
                    {input.length}
                  </div>
                )}
              </div>

              {/* Send Button */}
              <motion.button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
                  input.trim() && !isLoading
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
                whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
                whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Search className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </motion.button>
            </div>

            {/* Input Hints */}
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              {input.length > 500 && (
                <span className="text-yellow-400">Message might be too long</span>
              )}
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
