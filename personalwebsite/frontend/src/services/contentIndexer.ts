import { projects } from '../data/projects';
import { technologies as techData } from '../data/technologies';

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    type: 'project' | 'technology' | 'skill' | 'experience';
    title: string;
    category?: string;
    tags: string[];
    source: string;
  };
  embedding?: number[];
}

class ContentIndexer {
  private documents: DocumentChunk[] = [];

  constructor() {
    this.initializeDocuments();
  }

  private initializeDocuments() {
    // Index projects
    projects.forEach(project => {
      this.documents.push({
        id: `project-${project.id}`,
        content: `${project.title}: ${project.description}\n\n${project.longDescription}`,
        metadata: {
          type: 'project',
          title: project.title,
          category: project.category,
          tags: [...project.technologies, project.category],
          source: 'projects'
        }
      });
    });

    // Index technologies
    techData.forEach(tech => {
      this.documents.push({
        id: `tech-${tech.name.toLowerCase().replace(/\s+/g, '-')}`,
        content: `${tech.name}: ${tech.description}\n\nCategory: ${tech.category}\nProficiency: ${tech.proficiency}`,
        metadata: {
          type: 'technology',
          title: tech.name,
          category: tech.category,
          tags: [tech.category, tech.name],
          source: 'technologies'
        }
      });
    });

    // Index skills and experience (we can add more structured data later)
    const skillsContent = `
      Core Skills:
      - Full-Stack Development (React, Node.js, TypeScript, Python)
      - Machine Learning & AI (TensorFlow, PyTorch, NLP, Computer Vision)
      - Research & Development (Academic publications, clinical ML, materials science)
      - Cloud & DevOps (AWS, Docker, Kubernetes, CI/CD)
      - Mobile Development (React Native, iOS/Android)
      - Data Engineering (PostgreSQL, Redis, Apache Kafka, real-time processing)

      Professional Experience:
      - ML Engineer at Memorial Sloan Kettering Cancer Center
      - Research Assistant at Cornell Sci Fi Lab (BodyTrak wearable research)
      - Materials Science Research at Columbia University (Electronic Materials Lab)
      - Full-Stack Developer with expertise in scalable web applications
      - Healthcare AI specialist with HIPAA-compliant system development
      - Cryptocurrency trading system development and arbitrage platforms
    `;

    this.documents.push({
      id: 'skills-overview',
      content: skillsContent,
      metadata: {
        type: 'skill',
        title: 'Professional Skills & Experience',
        tags: ['full-stack', 'ai-ml', 'research', 'healthcare', 'blockchain'],
        source: 'profile'
      }
    });
  }

  getAllDocuments(): DocumentChunk[] {
    return this.documents;
  }

  searchDocuments(query: string, limit: number = 5): DocumentChunk[] {
    // Simple text-based search for now (we'll add embeddings later)
    const queryLower = query.toLowerCase();

    return this.documents
      .filter(doc =>
        doc.content.toLowerCase().includes(queryLower) ||
        doc.metadata.title.toLowerCase().includes(queryLower) ||
        doc.metadata.tags.some(tag => tag.toLowerCase().includes(queryLower))
      )
      .slice(0, limit);
  }

  getDocumentsByType(type: DocumentChunk['metadata']['type']): DocumentChunk[] {
    return this.documents.filter(doc => doc.metadata.type === type);
  }

  getDocumentsByCategory(category: string): DocumentChunk[] {
    return this.documents.filter(doc =>
      doc.metadata.category === category ||
      doc.metadata.tags.includes(category)
    );
  }
}

export const contentIndexer = new ContentIndexer();
