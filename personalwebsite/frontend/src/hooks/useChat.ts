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
    content: "You can reach out through the contact form on this website. I'm interested in discussing PhD opportunities in computer science, machine learning, data science, or computational research.",
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
        response = "👋 **Hello!** I'm Jae's AI assistant. I'm passionate about his research in healthcare AI and computational biology. Jae is a Cornell BA/MS '25 candidate who specializes in clinical machine learning and biomedical data science. What aspect of his work interests you most - his research projects, technical skills, or academic background?";
      } else if (query.includes('skill') || query.includes('technology') || query.includes('tech')) {
        response = "🛠️ **Jae's Technical Expertise:**\n\n**Core Technologies:** Python, R, TensorFlow, PyTorch\n**Specializations:** Machine Learning, Deep Learning, Clinical NLP, Biomedical Signal Processing\n**Data Science:** Multi-omics Analysis, Statistical Modeling, Computational Methods\n\nHis work focuses on **healthcare AI applications** and **computational biology**. He has practical experience with clinical data processing, medical concept extraction (94% accuracy), and developing ML models for real-world healthcare challenges.";
      } else if (query.includes('project') || query.includes('work') || query.includes('research')) {
        response = "🔬 **Jae's Research Portfolio:**\n\n**🏥 MSKCC Computational Oncology:** Developed ML models for cancer subtype classification using multi-omics data integration. Achieved 92% accuracy in translational oncology research for personalized cancer treatment.\n\n**📱 Cornell Sci Fi Lab Biosensor Analytics:** Built wearable device processing systems for biomedical signal analysis, validated on 200+ participants.\n\n**🏭 Materials Science EML Research:** Physics-enhanced machine learning for metallic materials yield strength prediction (published in Acta Materialia, 2024).\n\n**💬 Clinical NLP Systems:** Medical concept extraction with 94% accuracy for healthcare applications.\n\nEach project demonstrates his expertise in applying AI to solve real-world healthcare and scientific problems.";
      } else if (query.includes('experience') || query.includes('background')) {
        response = "🎓 **Jae's Professional Journey:**\n\n**Education:** Cornell University BA/MS in Computer Science ('25)\n**Research Experience:** Memorial Sloan Kettering Cancer Center + Cornell Sci Fi Lab\n**Publications:** 2 peer-reviewed papers in computational oncology and materials science\n\nHis work spans **clinical machine learning**, **computational oncology**, and **biomedical signal processing**. Jae has collaborated with leading medical institutions and contributed to both fundamental research and translational applications that impact patient care.\n\nWhat specific aspect would you like to know more about?";
      } else if (query.includes('contact') || query.includes('reach') || query.includes('email')) {
        response = "📬 **Getting in Touch:**\n\nYou can reach Jae through the **contact form** on this website, or connect with him on **LinkedIn**. He's particularly interested in discussing:\n\n• **PhD opportunities** in healthcare AI and computational biology\n• **Research collaborations** in clinical machine learning\n• **Career opportunities** in AI-driven healthcare solutions\n\nJae is passionate about applying AI to solve real-world healthcare challenges and would love to connect with like-minded researchers and practitioners!";
      } else if (query.includes('education') || query.includes('degree') || query.includes('university')) {
        response = "🏛️ **Academic Background:**\n\n**Institution:** Cornell University\n**Program:** BA/MS in Computer Science (Expected 2025)\n**Focus Areas:** Healthcare AI, Computational Biology, Machine Learning\n**Research Collaborations:** Memorial Sloan Kettering Cancer Center, Cornell Sci Fi Lab\n\nHis academic journey combines rigorous computer science training with hands-on research experience in healthcare applications. This unique blend allows him to tackle complex biomedical problems using cutting-edge AI techniques.\n\nThe Cornell program has provided him with both theoretical foundations and practical skills for real-world impact in healthcare AI.";
      } else if (query.includes('mskcc') || query.includes('memorial sloan') || query.includes('cancer') || query.includes('oncology')) {
        response = "🏥 **MSKCC Research Experience:**\n\nAt Memorial Sloan Kettering Cancer Center, Jae developed advanced **machine learning models for cancer subtype classification**. His work focused on:\n\n• **Multi-omics data integration** combining genomics, proteomics, and clinical data\n• **Translational oncology** applications for personalized medicine\n• **Clinical validation** with 92% accuracy in cancer subtype prediction\n\nThis research directly contributes to **personalized cancer treatment** by helping oncologists identify the most effective therapies for individual patients. His work demonstrates how AI can improve cancer care outcomes through better patient stratification.";
      } else if (query.includes('publication') || query.includes('paper') || query.includes('journal')) {
        response = "📚 **Research Publications:**\n\n**1. Acta Materialia (2024):** Physics-enhanced machine learning for metallic materials yield strength prediction. This work developed novel ML approaches that incorporate physical principles to improve material property predictions.\n\n**2. Computational Oncology Research:** Cancer subtype classification using multi-omics data integration (92% accuracy). This research has direct applications in personalized cancer treatment.\n\n**3. Biosensor Analytics:** Wearable device processing systems validated on 200+ participants at Cornell Sci Fi Lab.\n\nJae's publications span **materials science** and **healthcare AI**, showcasing his ability to apply computational methods across diverse domains.";
      } else if (query.includes('ai') || query.includes('machine learning') || query.includes('ml')) {
        response = "🤖 **Healthcare AI Expertise:**\n\nJae specializes in **healthcare AI** and **computational biology** with proven results:\n\n**Clinical ML Models:** Cancer classification (92% accuracy), Medical concept extraction (94% accuracy)\n**Data Processing:** Multi-omics analysis, biomedical signal processing, clinical NLP\n**Applications:** Personalized medicine, disease diagnosis, treatment optimization\n\nHis work demonstrates how **AI can transform healthcare** by processing complex medical data to provide actionable insights for clinicians and researchers. He combines deep technical expertise with domain knowledge in healthcare challenges.\n\nWhat specific AI application in healthcare interests you?";
      } else {
        response = "💭 **I'd love to help you learn more about Jae!**\n\nHis expertise spans **healthcare AI**, **computational biology**, and **clinical machine learning**. He has hands-on experience with real-world medical data and has published research in both **computational oncology** and **materials science**.\n\nTry asking about:\n• His research projects at MSKCC or Cornell\n• Specific technologies he works with\n• His academic background and publications\n• How he applies AI to healthcare challenges\n\nWhat aspect of his work would you like to explore?";
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
