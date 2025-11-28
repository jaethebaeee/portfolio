import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import useStore from '@/stores/useStore';

export function ChatOverlay() {
  const { sendMessage, isLoading } = useChat();
  const { chat, ui, setChatOpen } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const typeAndSendMessage = async (message: string) => {
    if (isLoading || isTyping) return;

    setIsTyping(true);
    setInput('');

    // Type out the message character by character
    for (let i = 0; i < message.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30)); // 30ms delay between characters
      setInput(message.slice(0, i + 1));
    }

    // Small pause before sending
    await new Promise(resolve => setTimeout(resolve, 200));

    // Send the message
    sendMessage(message);
    setInput('');
    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !isTyping) {
      sendMessage(input);
      setInput('');
    }
  };

  if (!ui.isChatOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-70 p-4"
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center py-8 space-y-6"
            >
              <div>
                <p className="pixel-font text-sm text-gray-400 mb-4">
                  Start a conversation! Ask about Jae's experience, skills, or projects.
                </p>
                <p className="pixel-font text-xs text-gray-500">
                  Click on any question below to get started:
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="grid grid-cols-1 gap-3 max-w-2xl mx-auto">
                {[
                  "What are Jae's main areas of expertise?",
                  "Can you tell me about Jae's education background?",
                  "What projects has Jae worked on recently?",
                  "What technologies does Jae specialize in?",
                  "What's Jae's experience with AI/ML?",
                  "How can I contact Jae for collaboration?"
                ].map((question, index) => (
                  <motion.button
                    key={question}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => typeAndSendMessage(question)}
                    className="pixel-button p-4 bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-blue-500 transition-all duration-200 text-left group"
                    disabled={isLoading || isTyping}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0 group-hover:bg-blue-300 transition-colors" />
                      <p className="pixel-font text-sm text-gray-300 group-hover:text-white leading-relaxed">
                        {question}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
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

          {/* Follow-up suggestions after first message */}
          {chat.messages.length > 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="border-t border-gray-600 pt-4 mt-4"
            >
              <p className="pixel-font text-xs text-gray-500 mb-3 text-center">
                💡 More questions you might ask:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Tell me about Jae's research",
                  "What companies has Jae worked for?",
                  "Jae's GitHub projects?",
                  "AI healthcare experience?"
                ].map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => typeAndSendMessage(suggestion)}
                    className="pixel-button px-3 py-2 bg-gray-700 hover:bg-blue-600 text-xs text-gray-300 hover:text-white transition-all duration-200"
                    disabled={isLoading || isTyping}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2" role="form" aria-label="Send message">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isTyping ? "Typing question..." : "Type your message..."}
              className="w-full px-4 py-3 bg-gray-800 text-white pixel-border pixel-font text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              disabled={isLoading || isTyping}
              aria-label="Type your message to AI assistant"
              aria-describedby="chat-input-help"
            />
            {isTyping && (
              <motion.div
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="w-1 h-1 bg-blue-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || isTyping || !input.trim()}
            className="pixel-button px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={isLoading ? "Sending message..." : isTyping ? "Typing message..." : "Send message"}
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

