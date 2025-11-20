import React, { useCallback, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useStore from '@/stores/useStore';
import { ChatMessage } from '@/types';
import { useGameStore } from '@/stores/useGameStore';

// Static knowledge base for the AI assistant
const STATIC_KNOWLEDGE_BASE = [
  {
    title: 'Professional Overview',
    content: "Hi! I'm Jae Kim, an AI Engineer focused on healthcare ML. I've deployed AI solutions that improve patient outcomes by 25%+ and reduce healthcare costs.",
  },
  {
    title: 'Technical Skills',
    content: "My core technical skills include: Machine Learning, Clinical AI, Natural Language Processing, Python, TensorFlow, PyTorch, React, TypeScript, Node.js, and modern AI/ML frameworks.",
  },
  {
    title: 'Key Projects',
    content: "Some of my notable projects include: Clinical ML Pipeline (healthcare AI system), Real-time Biosensor Analytics (wearable device data processing), and this 3D Portfolio Website. Each project showcases my expertise in AI and healthcare applications.",
  },
  {
    title: 'Professional Experience',
    content: "I specialize in clinical machine learning, natural language processing, and real-time biosensor systems. As a Cornell BA/MS '25 student with 2 peer-reviewed publications, I build ML systems that healthcare providers actually use.",
  },
  {
    title: 'Contact Information',
    content: "You can reach out through the contact form on this website. I'm always interested in discussing new opportunities in AI research, healthcare ML, or collaborations!",
  },
];

export const useChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addMessage } = useStore();
  const typingTimeoutRef = useRef<number | null>(null);

  const {
    updateChallengeProgress,
    completeChallenge,
    dailyChallenges
  } = useGameStore();

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return;

    // Clear any existing typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Create user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    };

    // Add user message immediately
    addMessage(userMessage);
    setIsLoading(true);

    // Update chat challenge progress
    const chatChallenge = dailyChallenges.find(c => c.type === 'chat');
    if (chatChallenge) {
      updateChallengeProgress(chatChallenge.id);
      if (chatChallenge.current + 1 >= chatChallenge.target) {
        setTimeout(() => completeChallenge(chatChallenge.id), 100);
      }
    }

    // Simulate typing delay
    typingTimeoutRef.current = setTimeout(() => {
      const query = messageText.toLowerCase();

      // Simple rule-based responses based on query patterns
      let response = '';

      if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
        response = "Hi there! I'm Jae's AI assistant. I'm here to help you learn more about Jae's background as an AI Engineer focused on healthcare ML. What would you like to know?";
      } else if (query.includes('skill') || query.includes('technology') || query.includes('tech')) {
        response = "Jae works with AI/ML technologies including Machine Learning, Clinical AI, Natural Language Processing, Python, TensorFlow, and PyTorch. He has experience in healthcare applications and real-time systems. Check out his skills section for a complete list!";
      } else if (query.includes('project') || query.includes('work')) {
        response = "Jae has worked on projects including Clinical ML Pipeline (healthcare AI system), Real-time Biosensor Analytics (wearable device processing), and this 3D Portfolio Website. Each project shows his work in AI and healthcare.";
      } else if (query.includes('experience') || query.includes('background')) {
        response = "Jae is an AI Engineer focused on healthcare ML, currently finishing his Cornell BA/MS '25 with 2 peer-reviewed publications. He works on clinical machine learning, NLP, and real-time biosensor systems, building ML systems that healthcare providers actually use.";
      } else if (query.includes('contact') || query.includes('reach') || query.includes('email')) {
        response = "You can reach out through the contact form on this website. Jae is interested in discussing new opportunities in AI, healthcare ML, or collaborations!";
      } else if (query.includes('education') || query.includes('degree') || query.includes('university')) {
        response = "Jae is finishing his Cornell BA/MS '25 with 2 peer-reviewed publications. His work focuses on clinical machine learning and healthcare AI applications.";
      } else if (query.includes('ai') || query.includes('machine learning') || query.includes('ml')) {
        response = "Jae is an expert in AI and machine learning, particularly in healthcare applications. He has deployed AI solutions that improve patient outcomes by 25%+ and has extensive experience with clinical ML, NLP, and real-time biosensor systems.";
      } else {
        response = "I'd be happy to help you learn more about Jae! Feel free to ask about his AI research, healthcare ML work, projects, experience, or anything else related to his background and expertise.";
      }

      // Find relevant knowledge sources
      const relevantSources = STATIC_KNOWLEDGE_BASE.filter(item =>
        item.content.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query)
      ).slice(0, 3).map((item, index) => ({
        id: `source-${index}`,
        title: item.title,
        content: item.content,
        metadata: {
          type: 'general' as const,
          relevance_score: Math.max(0.3, 1 - (index * 0.2)),
        },
      }));

      setIsLoading(false);
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        sources: relevantSources,
      };

      addMessage(assistantMessage);
    }, 1000 + Math.random() * 1000) as unknown as number; // Random delay between 1-2 seconds
  }, [addMessage, setIsLoading, dailyChallenges, updateChallengeProgress, completeChallenge]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const clearChat = useCallback(() => {
    // For client-side only, we don't need to clear server history
    // Just reset the local chat state if needed
  }, []);

  return {
    sendMessage,
    clearChat,
    isConnected: true, // Always "connected" for client-side
    isLoading,
    error: null,
  };
};
