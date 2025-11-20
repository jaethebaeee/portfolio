export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string | Date;
  sources?: KnowledgeSource[];
}

export interface KnowledgeSource {
  id: string;
  title: string;
  content: string;
  metadata: {
    type: 'resume' | 'project' | 'skill' | 'experience' | 'education' | 'general';
    relevance_score: number;
    section?: string;
    url?: string;
    date?: string;
  };
}

export interface ChatResponse {
  message: string;
  sources: KnowledgeSource[];
  confidence: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  sessionId: string | null;
  error: string | null;
  isConnected: boolean;
}

export interface AppState {
  chat: ChatState;
  ui: {
    isChatOpen: boolean;
    isDarkMode: boolean;
    isMenuOpen: boolean;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
}

export interface ZoneContent {
  title: string;
  content?: string;
  subtitle?: string;
  highlights?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  skills?: Array<{
    name: string;
    level: number;
  }>;
  contact?: {
    email: string;
    linkedin: string;
    github: string;
  };
  projects?: Array<{
    id: string;
    title: string;
    subtitle: string;
    description: string;
    technologies: string[];
    features: string[];
    impact: string;
    status: string;
    links: {
      demo: string;
      github: string;
    };
    color: string;
  }>;
  openSource?: {
    title: string;
    description: string;
    contributions: string[];
  };
  skillCategories?: Array<{
    id: string;
    title: string;
    icon: string;
    proficiency: number;
    skills: Array<{
      name: string;
      level: number;
    }>;
    description: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    status: string;
  }>;
  showTechStack?: boolean;
}
