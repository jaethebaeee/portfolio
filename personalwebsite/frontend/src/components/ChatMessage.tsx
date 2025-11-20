import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, ExternalLink, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChatMessage as ChatMessageType } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.type === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message Header */}
        <div className={`flex items-center gap-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`flex items-center gap-1 text-xs text-gray-500 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {isUser ? (
              <>
                <span>You</span>
                <User size={12} />
              </>
            ) : (
              <>
                <Bot size={12} />
                <span>AI Assistant</span>
              </>
            )}
            <span className="mx-1">•</span>
            <Clock size={10} />
            <span>{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Message Content */}
        <div
          className={`chat-message ${
            isUser ? 'chat-message-user' : 'chat-message-assistant'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow as any}
                        language={match[1]}
                        PreTag="div"
                        className="text-sm"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.3 }}
            className="mt-3 space-y-2"
          >
            <div className="text-xs text-gray-500 font-medium">Sources:</div>
            <div className="space-y-1">
              {message.sources.slice(0, 3).map((source, index) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-xs border-l-2 border-primary-400"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {source.title}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded text-xs font-medium">
                        {source.metadata.type}
                      </span>
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: `hsl(${Math.max(0, Math.min(120, source.metadata.relevance_score * 120))}, 70%, 50%)`
                        }}
                        title={`Relevance: ${Math.round(source.metadata.relevance_score * 100)}%`}
                      />
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-1">
                    {source.content.length > 100 
                      ? `${source.content.substring(0, 100)}...` 
                      : source.content
                    }
                  </p>
                  
                  {source.metadata.url && (
                    <a
                      href={source.metadata.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      <span>Learn more</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
