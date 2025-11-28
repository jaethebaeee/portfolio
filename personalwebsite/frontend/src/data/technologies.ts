export interface Technology {
  id: string;
  name: string;
  category: 'programming-languages' | 'frameworks-libraries' | 'tools-platforms' | 'databases' | 'cloud-services' | 'ai-ml';
  proficiency: number; // 1-100
  icon?: string; // emoji or icon name
  color?: string;
  experience: string; // e.g., "3+ years"
  description: string;
  projects: number; // number of projects using this tech
}

export const technologies: Technology[] = [
  // Programming Languages
  {
    id: 'python',
    name: 'Python',
    category: 'programming-languages',
    proficiency: 95,
    icon: '🐍',
    color: '#3776ab',
    experience: '4+ years',
    description: 'Primary language for ML/AI, data science, and backend development',
    projects: 12
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'programming-languages',
    proficiency: 90,
    icon: '📘',
    color: '#3178c6',
    experience: '3+ years',
    description: 'Modern JavaScript with type safety for scalable applications',
    projects: 8
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'programming-languages',
    proficiency: 85,
    icon: '🟨',
    color: '#f7df1e',
    experience: '4+ years',
    description: 'Foundation for web development and interactive applications',
    projects: 10
  },
  {
    id: 'java',
    name: 'Java',
    category: 'programming-languages',
    proficiency: 75,
    icon: '☕',
    color: '#007396',
    experience: '2+ years',
    description: 'Enterprise applications and Android development',
    projects: 3
  },
  {
    id: 'cpp',
    name: 'C++',
    category: 'programming-languages',
    proficiency: 70,
    icon: '⚙️',
    color: '#00599c',
    experience: '2+ years',
    description: 'High-performance computing and system programming',
    projects: 2
  },
  {
    id: 'r',
    name: 'R',
    category: 'programming-languages',
    proficiency: 65,
    icon: '📊',
    color: '#276dc3',
    experience: '1.5+ years',
    description: 'Statistical computing and data visualization',
    projects: 4
  },

  // Frameworks & Libraries
  {
    id: 'react',
    name: 'React',
    category: 'frameworks-libraries',
    proficiency: 90,
    icon: '⚛️',
    color: '#61dafb',
    experience: '3+ years',
    description: 'Modern UI library for building interactive web applications',
    projects: 6
  },
  {
    id: 'tensorflow',
    name: 'TensorFlow',
    category: 'frameworks-libraries',
    proficiency: 85,
    icon: '🧠',
    color: '#ff6f00',
    experience: '3+ years',
    description: 'Deep learning framework for neural networks and ML models',
    projects: 5
  },
  {
    id: 'pytorch',
    name: 'PyTorch',
    category: 'frameworks-libraries',
    proficiency: 80,
    icon: '🔥',
    color: '#ee4c2c',
    experience: '2.5+ years',
    description: 'Research-focused deep learning framework with dynamic computation graphs',
    projects: 4
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'frameworks-libraries',
    proficiency: 85,
    icon: '🟢',
    color: '#339933',
    experience: '3+ years',
    description: 'JavaScript runtime for server-side development',
    projects: 7
  },
  {
    id: 'react-native',
    name: 'React Native',
    category: 'frameworks-libraries',
    proficiency: 75,
    icon: '📱',
    color: '#61dafb',
    experience: '2+ years',
    description: 'Cross-platform mobile app development',
    projects: 2
  },
  {
    id: 'threejs',
    name: 'Three.js',
    category: 'frameworks-libraries',
    proficiency: 70,
    icon: '🎮',
    color: '#049ef4',
    experience: '1+ year',
    description: '3D graphics library for web browsers',
    projects: 1
  },

  // Databases
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'databases',
    proficiency: 80,
    icon: '🐘',
    color: '#4169e1',
    experience: '3+ years',
    description: 'Advanced open-source relational database',
    projects: 5
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'databases',
    proficiency: 75,
    icon: '🍃',
    color: '#47a248',
    experience: '2+ years',
    description: 'NoSQL document database for modern applications',
    projects: 3
  },
  {
    id: 'redis',
    name: 'Redis',
    category: 'databases',
    proficiency: 70,
    icon: '🔴',
    color: '#dc382d',
    experience: '2+ years',
    description: 'In-memory data structure store for caching and messaging',
    projects: 4
  },

  // Cloud & DevOps
  {
    id: 'aws',
    name: 'AWS',
    category: 'cloud-services',
    proficiency: 75,
    icon: '☁️',
    color: '#ff9900',
    experience: '2+ years',
    description: 'Cloud computing platform with extensive services',
    projects: 3
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'tools-platforms',
    proficiency: 80,
    icon: '🐳',
    color: '#2496ed',
    experience: '3+ years',
    description: 'Containerization platform for application deployment',
    projects: 6
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    category: 'tools-platforms',
    proficiency: 65,
    icon: '⭕',
    color: '#326ce5',
    experience: '1.5+ years',
    description: 'Container orchestration for scalable deployments',
    projects: 2
  },

  // AI/ML Specific
  {
    id: 'scikit-learn',
    name: 'Scikit-learn',
    category: 'ai-ml',
    proficiency: 85,
    icon: '🔬',
    color: '#f7931e',
    experience: '3+ years',
    description: 'Machine learning library for classical algorithms',
    projects: 6
  },
  {
    id: 'pandas',
    name: 'Pandas',
    category: 'ai-ml',
    proficiency: 90,
    icon: '🐼',
    color: '#150458',
    experience: '4+ years',
    description: 'Data manipulation and analysis library',
    projects: 10
  },
  {
    id: 'matplotlib',
    name: 'Matplotlib',
    category: 'ai-ml',
    proficiency: 75,
    icon: '📈',
    color: '#11557c',
    experience: '3+ years',
    description: 'Data visualization library for Python',
    projects: 7
  }
];

export const technologyCategories = {
  'programming-languages': {
    name: 'Programming Languages',
    color: '#ff6b6b',
    icon: '💻'
  },
  'frameworks-libraries': {
    name: 'Frameworks & Libraries',
    color: '#4ecdc4',
    icon: '🛠️'
  },
  'databases': {
    name: 'Databases',
    color: '#ffe66d',
    icon: '🗄️'
  },
  'cloud-services': {
    name: 'Cloud Services',
    color: '#a78bfa',
    icon: '☁️'
  },
  'tools-platforms': {
    name: 'Tools & Platforms',
    color: '#f87171',
    icon: '⚙️'
  },
  'ai-ml': {
    name: 'AI/ML',
    color: '#34d399',
    icon: '🤖'
  }
};

export const getTechnologiesByCategory = (category: Technology['category']) =>
  technologies.filter(tech => tech.category === category);

export const getTopTechnologies = (limit = 10) =>
  technologies
    .sort((a, b) => b.proficiency - a.proficiency)
    .slice(0, limit);






