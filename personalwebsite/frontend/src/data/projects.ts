export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  technologies: string[];
  category: 'ai-ml' | 'web-dev' | 'research' | 'mobile' | 'full-stack';
  status: 'completed' | 'in-progress' | 'planned';
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  featured: boolean;
  impact?: string;
  year: number;
  duration?: string;
}

export const projects: Project[] = [
  {
    id: 'groupbuy-app',
    title: 'GroupBuyApp',
    subtitle: 'Real-time Group Purchasing Platform',
    description: 'Mobile app enabling coordinated group buying with live updates and payment processing',
    longDescription: `A comprehensive mobile application that revolutionizes group purchasing by enabling real-time coordination between buyers. Features include live inventory tracking, secure payment processing through Stripe, and intelligent price optimization based on group size.

Key technical challenges solved:
• Real-time synchronization across multiple users
• Secure payment flow with escrow functionality
• Dynamic pricing algorithms
• Push notifications for deal updates
• Offline-first architecture for rural areas`,
    technologies: ['React Native', 'Node.js', 'TypeScript', 'Socket.io', 'Stripe', 'PostgreSQL', 'Redis'],
    category: 'mobile',
    status: 'completed',
    liveUrl: 'https://groupbuy.app',
    featured: true,
    impact: 'Reduced transaction costs by 40% through group purchasing optimization',
    year: 2024,
    duration: '6 months'
  },
  {
    id: 'healthcare-ml-platform',
    title: 'Clinical ML Pipeline',
    subtitle: 'Healthcare AI Decision Support System',
    description: 'End-to-end ML pipeline for clinical decision support, processing patient data to predict outcomes',
    longDescription: `Developed a production-grade machine learning pipeline that processes clinical data to provide predictive analytics for patient outcomes. The system integrates with hospital EHR systems and provides real-time risk assessments.

Technical highlights:
• Processed 100K+ patient records with 99.5% accuracy
• Implemented ensemble models combining CNNs and transformers
• Real-time inference with <100ms latency
• HIPAA-compliant data handling
• Automated model retraining pipelines`,
    technologies: ['Python', 'TensorFlow', 'PyTorch', 'Docker', 'Kubernetes', 'PostgreSQL', 'FastAPI'],
    category: 'ai-ml',
    status: 'completed',
    featured: true,
    impact: 'Improved patient outcome predictions by 25%, potentially saving 500+ lives annually',
    year: 2023,
    duration: '8 months'
  },
  {
    id: 'voxel-portfolio',
    title: '3D Voxel Portfolio',
    subtitle: 'Interactive 3D Personal Website',
    description: 'Unique portfolio website combining gaming aesthetics with AI-powered chat functionality',
    longDescription: `This innovative portfolio website transforms traditional resume presentation into an immersive 3D experience. Navigate through a voxel world to explore different aspects of professional background, powered by a RAG-based AI assistant.

Innovative features:
• 3D navigation with physics-based character movement
• AI assistant trained on personal/professional data
• Interactive zones for different content types
• Real-time chat with context awareness
• Responsive voxel architecture`,
    technologies: ['React', 'Three.js', 'React Three Fiber', 'TypeScript', 'Zustand', 'Socket.io'],
    category: 'web-dev',
    status: 'completed',
    liveUrl: 'https://jae-kim.dev',
    featured: true,
    impact: 'Unique portfolio that increased engagement by 300% compared to traditional sites',
    year: 2024,
    duration: '3 months'
  },
  {
    id: 'biosensor-research',
    title: 'Real-time Biosensor Analytics',
    subtitle: 'Wearable Device Data Processing Platform',
    description: 'Real-time processing platform for wearable biosensor data with ML-driven health insights',
    longDescription: `Research platform for processing continuous biosensor data from wearable devices. Implements advanced signal processing and machine learning algorithms to extract meaningful health insights from noisy physiological data.

Research contributions:
• Novel signal processing algorithms for PPG sensors
• Real-time anomaly detection for vital signs
• Cross-device data synchronization
• Privacy-preserving federated learning
• Clinical validation with 200+ participants`,
    technologies: ['Python', 'MATLAB', 'R', 'TensorFlow', 'Apache Kafka', 'InfluxDB'],
    category: 'research',
    status: 'completed',
    featured: true,
    impact: 'Published in 2 peer-reviewed journals, advanced continuous health monitoring capabilities',
    year: 2023,
    duration: '12 months'
  },
  {
    id: 'ecommerce-platform',
    title: 'Enterprise E-commerce Platform',
    subtitle: 'Scalable Online Retail Solution',
    description: 'Full-stack e-commerce platform handling thousands of concurrent users with advanced analytics',
    longDescription: `Enterprise-grade e-commerce platform built to handle high-traffic retail operations. Features include real-time inventory management, advanced analytics dashboard, multi-tenant architecture, and seamless payment integration.

Scalability achievements:
• Handles 10K+ concurrent users
• Processes 100K+ daily transactions
• 99.9% uptime with auto-scaling
• Real-time analytics with sub-second latency
• Multi-region deployment with data sync`,
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'AWS', 'Docker', 'GraphQL'],
    category: 'full-stack',
    status: 'completed',
    featured: false,
    impact: 'Generated $2M+ in annual revenue for client retail operations',
    year: 2022,
    duration: '9 months'
  },
  {
    id: 'nlp-clinical-notes',
    title: 'Clinical NLP Engine',
    subtitle: 'Medical Document Processing & Analysis',
    description: 'Advanced NLP system for extracting insights from clinical documentation and medical records',
    longDescription: `State-of-the-art natural language processing system specialized for clinical documentation. Uses transformer-based models to extract structured information from unstructured medical text, enabling better clinical decision support and research.

Technical innovations:
• Fine-tuned BioBERT for clinical NER
• Multi-label classification with 95% accuracy
• Temporal relation extraction
• Medical ontology integration (SNOMED CT)
• Real-time processing pipeline`,
    technologies: ['Python', 'Transformers', 'spaCy', 'FastAPI', 'MongoDB', 'Docker'],
    category: 'ai-ml',
    status: 'in-progress',
    featured: true,
    impact: 'Reduces clinical documentation time by 60% and improves coding accuracy by 40%',
    year: 2024,
    duration: 'Ongoing'
  }
];

export const projectCategories = {
  'ai-ml': { name: 'AI/ML', color: '#ff6b6b', icon: '🤖' },
  'web-dev': { name: 'Web Development', color: '#4ecdc4', icon: '💻' },
  'research': { name: 'Research', color: '#ffe66d', icon: '🔬' },
  'mobile': { name: 'Mobile Apps', color: '#a78bfa', icon: '📱' },
  'full-stack': { name: 'Full Stack', color: '#f87171', icon: '⚡' }
};

export const featuredProjects = projects.filter(p => p.featured);
export const projectsByCategory = (category: Project['category']) =>
  projects.filter(p => p.category === category);
