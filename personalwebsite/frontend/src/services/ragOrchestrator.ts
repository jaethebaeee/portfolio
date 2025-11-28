import OpenAI from 'openai';
import { DocumentChunk, contentIndexer } from './contentIndexer';
import { VectorSearch, SearchResult } from './vectorSearch';

export interface RAGQuery {
  query: string;
  context?: string;
  maxResults?: number;
}

export interface RAGResponse {
  answer: string;
  sources: DocumentChunk[];
  confidence: number;
}

export class RAGOrchestrator {
  private openai: OpenAI | null = null;
  private vectorSearch: VectorSearch;

  constructor() {
    this.vectorSearch = new VectorSearch(contentIndexer.getAllDocuments());

    // Initialize OpenAI client if API key is available
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true // Note: In production, this should be done server-side
      });
    }
  }

  async query(query: RAGQuery): Promise<RAGResponse> {
    const { query: userQuery, context = '', maxResults = 5 } = query;

    // Retrieve relevant documents
    const searchResults = this.vectorSearch.hybridSearch(userQuery, maxResults);

    if (searchResults.length === 0) {
      return {
        answer: "I couldn't find relevant information in my knowledge base to answer your question. Could you try rephrasing it or asking about Jae's projects, technologies, or experience?",
        sources: [],
        confidence: 0
      };
    }

    // Prepare context for LLM
    const retrievedContent = searchResults
      .map(result => `[${result.document.metadata.title}]\n${result.document.content}`)
      .join('\n\n');

    const fullContext = context ? `${context}\n\n${retrievedContent}` : retrievedContent;

    // Generate response using LLM
    if (this.openai) {
      try {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant helping users learn about Jae Kim's professional background, projects, and expertise. You have access to detailed information about his portfolio including projects, technologies, and experience.

Use the provided context to give accurate, helpful answers. Be conversational but professional. If asked about specific projects or technologies, provide relevant details. If the context doesn't contain enough information to fully answer a question, acknowledge this and suggest what you can tell them about.

Key areas of expertise to highlight when relevant:
- Machine Learning & AI (healthcare, clinical NLP, computer vision)
- Full-Stack Development (React, Node.js, TypeScript, Python)
- Research (Cornell Sci Fi Lab, MSKCC, Columbia Materials Science)
- Entrepreneurship (GroupBuy app, Kelshi arbitrage engine)

Always cite specific projects, technologies, or experiences when relevant.`
            },
            {
              role: 'user',
              content: `Context:\n${fullContext}\n\nQuestion: ${userQuery}`
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        });

        const answer = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response at this time.';

        return {
          answer,
          sources: searchResults.map(r => r.document),
          confidence: Math.min(searchResults[0]?.score || 0, 1)
        };
      } catch (error) {
        console.error('OpenAI API error:', error);
        // Fall back to simple response generation
      }
    }

    // Fallback: Generate simple response based on retrieved content
    const topResult = searchResults[0];
    const answer = this.generateFallbackResponse(userQuery, topResult);

    return {
      answer,
      sources: searchResults.map(r => r.document),
      confidence: Math.min(topResult.score, 1)
    };
  }

  private generateFallbackResponse(query: string, topResult: SearchResult): string {
    const { document } = topResult;

    // Simple keyword-based response generation
    const queryLower = query.toLowerCase();

    if (queryLower.includes('project') || queryLower.includes('work')) {
      return `Based on Jae's portfolio, here's what I can tell you about his work: ${document.content.substring(0, 300)}...`;
    }

    if (queryLower.includes('skill') || queryLower.includes('technology')) {
      return `Jae has expertise in various technologies. From what I can see: ${document.content.substring(0, 300)}...`;
    }

    if (queryLower.includes('experience') || queryLower.includes('background')) {
      return `Here's some information about Jae's professional background: ${document.content.substring(0, 300)}...`;
    }

    // Generic response
    return `I found some relevant information: ${document.metadata.title} - ${document.content.substring(0, 200)}...`;
  }

  // Get suggestions for follow-up questions
  getSuggestions(query: string): string[] {
    const searchResults = this.vectorSearch.hybridSearch(query, 3);
    const queryLower = query.toLowerCase();

    const baseSuggestions = [
      "What inspired you to work in healthcare AI?",
      "How do you approach complex data science problems?",
      "What's your most challenging project to date?",
      "How has your research impacted real patients?",
      "What emerging technologies excite you most?",
      "How do you collaborate with medical professionals?"
    ];

    // Context-aware suggestions based on query content
    const contextualSuggestions = [];

    if (queryLower.includes('project') || queryLower.includes('research') || queryLower.includes('work')) {
      contextualSuggestions.push(
        "Can you walk me through your MSKCC oncology research?",
        "What was your most technically challenging project?",
        "How do you validate healthcare AI models?",
        "What's the clinical impact of your biosensor work?"
      );
    }

    if (queryLower.includes('skill') || queryLower.includes('tech') || queryLower.includes('technology')) {
      contextualSuggestions.push(
        "How do you choose between TensorFlow and PyTorch?",
        "What's your approach to clinical NLP challenges?",
        "How do you handle multi-omics data integration?",
        "What tools do you use for biomedical signal processing?"
      );
    }

    if (queryLower.includes('education') || queryLower.includes('cornell') || queryLower.includes('university')) {
      contextualSuggestions.push(
        "What unique aspects of Cornell shaped your research?",
        "How does your CS background help with biomedical problems?",
        "What courses were most valuable for your healthcare AI work?",
        "How did your Cornell experience prepare you for MSKCC research?"
      );
    }

    if (queryLower.includes('ai') || queryLower.includes('ml') || queryLower.includes('machine learning')) {
      contextualSuggestions.push(
        "How do you ensure AI models are safe for healthcare?",
        "What's your approach to model interpretability in medicine?",
        "How do you handle bias in healthcare AI systems?",
        "What metrics matter most in clinical ML models?"
      );
    }

    if (queryLower.includes('future') || queryLower.includes('career') || queryLower.includes('phd')) {
      contextualSuggestions.push(
        "What PhD programs are you considering?",
        "How do you see healthcare AI evolving?",
        "What research directions excite you most?",
        "How can we improve AI adoption in healthcare?"
      );
    }

    // Content-based suggestions from search results
    if (searchResults.some(r => r.document.metadata.type === 'project')) {
      contextualSuggestions.unshift("Can you dive deeper into your project methodology?");
    }

    if (searchResults.some(r => r.document.metadata.category === 'ai-ml')) {
      contextualSuggestions.unshift("What were the biggest technical challenges in your AI work?");
    }

    // Combine and deduplicate suggestions
    const allSuggestions = [...contextualSuggestions, ...baseSuggestions];
    const uniqueSuggestions = Array.from(new Set(allSuggestions));

    return uniqueSuggestions.slice(0, 6);
  }
}

export const ragOrchestrator = new RAGOrchestrator();
