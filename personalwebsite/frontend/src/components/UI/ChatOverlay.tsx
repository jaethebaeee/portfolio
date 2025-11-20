import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import useStore from '@/stores/useStore';

export function ChatOverlay() {
  const { sendMessage, isLoading } = useChat();
  const { chat, ui, setChatOpen } = useStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Only render if chat is open
  if (!ui.isChatOpen) return null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  // Handle ESC key to close chat
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setChatOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setChatOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
      onClick={() => setChatOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="pixel-panel max-w-3xl w-full h-[80vh] flex flex-col p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b-4 border-gray-700">
          <div>
            <h1 className="pixel-font text-2xl text-yellow-400">AI ASSISTANT</h1>
            <p className="pixel-font text-xs text-gray-400 mt-1">
              Ask me anything about Jae!
            </p>
          </div>
          <button
            onClick={() => setChatOpen(false)}
            className="pixel-button p-2 hover:bg-red-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 custom-scrollbar">
          {chat.messages.length === 0 && (
            <div className="text-center py-8">
              <p className="pixel-font text-sm text-gray-400">
                Start a conversation! Ask about Jae's experience, skills, or projects.
              </p>
            </div>
          )}
          
          {chat.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 pixel-border ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                <p className="pixel-font text-xs leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t-2 border-gray-600">
                    <p className="pixel-font text-xs text-gray-400">
                      Sources: {message.sources.length}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {chat.isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-700 p-3 pixel-border">
                <div className="flex space-x-1">
                  <motion.div
                    className="w-2 h-2 bg-white"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-white"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-white"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2" role="form" aria-label="Send message">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-gray-800 text-white pixel-border pixel-font text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            disabled={isLoading}
            aria-label="Type your message to AI assistant"
            aria-describedby="chat-input-help"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="pixel-button px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={isLoading ? "Sending message..." : "Send message"}
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </form>
        <div id="chat-input-help" className="sr-only">
          Press Enter to send your message to the AI assistant
        </div>

        {/* Footer hint */}
        <div className="mt-3 pt-3 border-t-4 border-gray-700">
          <p className="pixel-font text-xs text-gray-400 text-center">
            Press ESC or click outside to close
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

