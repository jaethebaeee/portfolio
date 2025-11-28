import React, { useCallback, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useStore from '@/stores/useStore';
import { ChatMessage } from '@/types';

// Static knowledge base for the AI assistant
const STATIC_KNOWLEDGE_BASE = [
  {
    title: 'Academic Overview',
    content: "Hi! I'm Jae Kim, a Cornell BA/MS '25 candidate with research experience in machine learning and data science. I have 2 peer-reviewed publications and specialize in computer science applications across domains, with expertise in ML algorithms, data processing, and computational methods.",
  },
  {
    title: 'Research Expertise',
    content: "My research focuses on: Machine Learning Algorithms, Large-Scale Data Processing, Signal Processing, Natural Language Processing, Statistical Modeling, and Computational Methods for Data-Driven Discovery across domains.",
  },
  {
    title: 'Publications & Research',
    content: "Key research includes: Acta Materialia publication on physics-enhanced machine learning for metallic materials (2024), MSKCC computational oncology research developing ML models for cancer subtype classification (92% accuracy), and biosensor analytics research at Cornell Sci Fi Lab with 200+ participants.",
  },
  {
    title: 'MSKCC Research',
    content: "At Memorial Sloan Kettering Cancer Center, I developed advanced machine learning models for complex data classification using multi-modal data integration. Research focused on scalable ML algorithms with 92% accuracy and applications for computational analysis of large-scale datasets.",
  },
  {
    title: 'Academic Background',
    content: "I am completing my BA/MS in Computer Science at Cornell University with research experience in machine learning and data science. My work has resulted in peer-reviewed publications and collaborations with leading research institutions including MSKCC and Cornell's Sci Fi Lab.",
  },
  {
    title: 'Technical Skills',
    content: "Core competencies include: Python, R, TensorFlow, PyTorch, Machine Learning, Deep Learning, Clinical NLP, Signal Processing, Multi-omics Analysis, and Biomedical Data Science.",
  },
  {
    title: 'Contact Information',
    content: "You can reach out through the contact form on this website. I'm interested in discussing PhD opportunities in healthcare AI, computational biology, or clinical machine learning research.",
  },
];

export const useChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addMessage } = useStore();
  const typingTimeoutRef = useRef<number | null>(null);

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

    // Simulate typing delay
    typingTimeoutRef.current = setTimeout(() => {
      const query = messageText.toLowerCase();

      // Simple rule-based responses based on query patterns
      let response = '';

      if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
        response = "Hi there! I'm Jae's AI assistant. I'm here to help you learn more about Jae's research background in healthcare AI and computational biology. What would you like to know about his academic work and publications?";
      } else if (query.includes('skill') || query.includes('technology') || query.includes('tech')) {
        response = "Jae specializes in research technologies including Python, R, TensorFlow, PyTorch, Machine Learning, Clinical NLP, Biomedical Signal Processing, and Multi-omics Data Analysis. His work focuses on healthcare AI applications and computational biology.";
      } else if (query.includes('project') || query.includes('work') || query.includes('research')) {
        response = "Jae's research includes MSKCC computational oncology (cancer subtype classification), Cornell Sci Fi Lab biosensor analytics (wearable device processing), materials science EML research (physics-enhanced ML), and clinical NLP systems. Each project demonstrates his expertise in healthcare AI and computational methods.";
      } else if (query.includes('experience') || query.includes('background')) {
        response = "Jae is a Cornell BA/MS '25 candidate with research experience at Memorial Sloan Kettering Cancer Center and Cornell's Sci Fi Lab. He has 2 peer-reviewed publications and specializes in clinical machine learning, computational oncology, and biomedical signal processing.";
      } else if (query.includes('contact') || query.includes('reach') || query.includes('email')) {
        response = "You can reach out through the contact form on this website. Jae is interested in discussing PhD opportunities in healthcare AI, computational biology, or clinical machine learning research!";
      } else if (query.includes('education') || query.includes('degree') || query.includes('university')) {
        response = "Jae is completing his BA/MS in Computer Science at Cornell University with a focus on healthcare AI and computational biology. His research has resulted in peer-reviewed publications and collaborations with leading medical institutions.";
      } else if (query.includes('mskcc') || query.includes('memorial sloan') || query.includes('cancer') || query.includes('oncology')) {
        response = "At Memorial Sloan Kettering Cancer Center, Jae developed machine learning models for cancer subtype classification using multi-omics data integration. His research focused on translational oncology with 92% accuracy in cancer subtype prediction and applications for personalized cancer treatment.";
      } else if (query.includes('publication') || query.includes('paper') || query.includes('journal')) {
        response = "Jae has published in Acta Materialia (2024) on physics-enhanced machine learning for metallic materials yield strength prediction, and has additional research in computational oncology and biosensor analytics with clinical validation on 200+ participants.";
      } else if (query.includes('ai') || query.includes('machine learning') || query.includes('ml')) {
        response = "Jae specializes in healthcare AI and computational biology, with research in clinical machine learning, computational oncology, and biomedical signal processing. His work includes ML models for cancer classification (92% accuracy) and clinical NLP systems with 94% accuracy in medical concept extraction.";
      } else {
        response = "I'd be happy to help you learn more about Jae's research! Feel free to ask about his publications, healthcare AI work, computational biology research, academic background, or anything else related to his research expertise.";
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
  }, [addMessage, setIsLoading]);

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
