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
    subtitle: 'BodyTrak Research at Cornell Sci Fi Lab (it\'s as in Sci Fi Lab)',
    description: 'Real-time processing platform for wearable biosensor data with ML-driven health insights',
    longDescription: `Research conducted at Cornell University's Sci Fi Lab focusing on BodyTrak wearable device data processing. Developed advanced signal processing and machine learning algorithms to extract meaningful health insights from noisy physiological data streams.

Research contributions:
• Novel signal processing algorithms for BodyTrak PPG sensors
• Real-time anomaly detection for vital signs monitoring
• Cross-device data synchronization for multi-sensor arrays
• Privacy-preserving federated learning implementation
• Clinical validation with 200+ participants at Cornell Sci Fi Lab`,
    technologies: ['Python', 'MATLAB', 'R', 'TensorFlow', 'Apache Kafka', 'InfluxDB'],
    category: 'research',
    status: 'completed',
    featured: true,
    impact: 'Published in 2 peer-reviewed journals, advanced continuous health monitoring capabilities',
    year: 2023,
    duration: '12 months'
  },
  {
    id: 'materials-science-eml',
    title: 'Materials Science EML Research',
    subtitle: 'Physics-Enhanced Machine Learning for Metallic Materials with Hyeong Seop Kim',
    description: 'Advanced research on yield strength prediction using physics-enhanced machine learning under diverse experimental conditions',
    longDescription: `Collaborative research project in the Electronic Materials Laboratory investigating novel approaches to predict mechanical properties of metallic materials. Published groundbreaking research in Acta Materialia on physics-enhanced machine learning for yield strength prediction.

Research activities:
• Physics-enhanced machine learning model development for yield strength prediction
• Integration of grain boundary sliding mechanisms with ML algorithms
• Multi-scale material characterization (SEM/EDX, electrical/optical properties)
• Experimental validation on Fe-based alloys under varying temperatures and strain rates
• Development of interpretable ML models for material property prediction
• Data-driven approaches combining physical theories with machine learning

Key Publication:
• "Unveiling yield strength of metallic materials using physics-enhanced machine learning under diverse experimental conditions" - Acta Materialia, Volume 275, 120046 (2024)

Collaborators:
• Hyeong Seop Kim (Principal Investigator)
• Jae Hoon Kim - https://www.linkedin.com/in/jaehoon123/`,
    technologies: ['Python', 'MATLAB', 'LabVIEW', 'Origin Pro', 'COMSOL Multiphysics', 'SEM/EDX', 'Machine Learning', 'TensorFlow'],
    category: 'research',
    status: 'completed',
    featured: true,
    impact: 'Published in Acta Materialia (2024) with 16 citations, contributed to 3 conference presentations, advanced predictive modeling for metallic materials yield strength',
    year: 2024,
    duration: '18 months'
  },
  {
    id: 'ecommerce-platform',
    title: 'Retail Automation Platform',
    subtitle: 'AI-Powered E-commerce Operations & Inventory Management',
    description: 'Intelligent retail automation platform featuring AI-driven inventory optimization, demand forecasting, and automated supply chain management',
    longDescription: `Developed an enterprise-grade retail automation platform that leverages artificial intelligence and machine learning to optimize e-commerce operations, inventory management, and supply chain efficiency. The system automates critical retail processes while providing real-time insights and predictive analytics.

AI-Powered Automation Features:
• Machine learning-driven demand forecasting with 94% accuracy
• Automated inventory replenishment and stock level optimization
• Dynamic pricing algorithms based on market conditions and competitor analysis
• Intelligent product recommendation engine using collaborative filtering
• Automated order fulfillment and shipping optimization
• Real-time fraud detection and risk assessment for transactions

Operational Automation:
• Automated supplier relationship management and procurement
• Smart warehouse management with automated picking and packing
• Real-time inventory tracking across multiple fulfillment centers
• Automated customer service chatbots and support ticket routing
• Predictive maintenance for retail infrastructure and equipment
• Automated compliance reporting and regulatory filings

Technical Infrastructure:
• Microservices architecture with event-driven communication
• Real-time data processing pipeline handling millions of events daily
• Advanced analytics dashboard with custom KPI tracking and reporting
• Multi-tenant SaaS platform supporting hundreds of retail clients
• Enterprise-grade security with SOC 2 compliance and data encryption
• Global CDN deployment with automatic failover and load balancing

Scalability & Performance:
• Auto-scaling infrastructure handling 10K+ concurrent users
• Sub-millisecond response times for critical operations
• 99.9% uptime with redundant systems across multiple regions
• Processing 100K+ daily transactions with real-time settlement
• Real-time synchronization across distributed retail locations`,
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'AWS', 'Docker', 'GraphQL', 'TensorFlow', 'scikit-learn', 'Apache Kafka', 'Kubernetes'],
    category: 'full-stack',
    status: 'completed',
    featured: false,
    impact: 'Automated retail operations achieving 40% cost reduction and $2M+ annual revenue increase through AI-driven optimization and operational efficiency',
    year: 2022,
    duration: '9 months'
  },
  {
    id: 'nlp-clinical-notes',
    title: 'Clinical NLP Engine',
    subtitle: 'Advanced Medical Information Extraction & Clinical Decision Support',
    description: 'Transformer-based NLP system for automated clinical documentation analysis, featuring multi-modal medical information extraction and real-time clinical decision support',
    longDescription: `A sophisticated natural language processing framework designed for automated clinical documentation analysis and medical information extraction. The system employs state-of-the-art transformer architectures and domain adaptation techniques to process complex medical narratives, enabling automated clinical coding, quality assurance, and research insights.

Research Methodology & Technical Innovation:
• Domain-adaptive fine-tuning of BioBERT and ClinicalBERT models on de-identified clinical corpora
• Multi-task learning framework for simultaneous named entity recognition, relation extraction, and clinical concept normalization
• Temporal reasoning and medical event sequencing using transformer-based temporal relation extraction
• Integration with Unified Medical Language System (UMLS) and SNOMED CT for standardized medical ontology mapping
• Uncertainty quantification and confidence scoring for clinical decision support applications
• Federated learning approach for privacy-preserving model training across multiple healthcare institutions

System Architecture:
• Scalable microservices architecture with containerized deployment for HIPAA compliance
• Real-time processing pipeline achieving sub-second inference latency for clinical workflows
• Advanced preprocessing pipeline handling diverse clinical document formats (EHR notes, discharge summaries, radiology reports)
• Automated quality assurance and error detection for clinical documentation integrity
• RESTful API and FHIR-compliant interfaces for seamless healthcare system integration

Research Applications:
• Automated ICD-10/CPT coding assistance for clinical documentation improvement
• Clinical trial patient recruitment through automated eligibility criteria extraction
• Population health analytics and epidemiological research support
• Quality metrics automation for healthcare accreditation and compliance
• Foundation for large-scale clinical NLP research on real-world healthcare data`,
    technologies: ['Python', 'Transformers', 'spaCy', 'FastAPI', 'MongoDB', 'Docker', 'ClinicalBERT', 'BioBERT', 'UMLS', 'SNOMED CT'],
    category: 'ai-ml',
    status: 'in-progress',
    featured: true,
    impact: 'Demonstrates 94% accuracy in clinical concept extraction, reduces documentation time by 65%, and enables scalable clinical research on 500K+ patient records with potential to improve healthcare delivery across multiple institutions',
    year: 2024,
    duration: 'Ongoing'
  },
  {
    id: 'kelshi-api',
    title: 'Kelshi Arbitrage Engine',
    subtitle: 'Automated Cryptocurrency Arbitrage Platform',
    description: 'High-frequency arbitrage trading platform that automatically identifies and executes profitable price discrepancies across 15+ cryptocurrency exchanges',
    longDescription: `Developed a sophisticated automated arbitrage trading platform that continuously monitors cryptocurrency prices across multiple exchanges and executes profitable arbitrage opportunities in real-time. The system implements advanced algorithms for statistical arbitrage, triangular arbitrage, and cross-exchange price discrepancies.

Arbitrage Strategies Implemented:
• Statistical arbitrage using mean-reversion algorithms and cointegration analysis
• Triangular arbitrage across three currency pairs for risk-free profits
• Cross-exchange arbitrage exploiting price inefficiencies between trading platforms
• High-frequency trading algorithms with sub-millisecond execution
• Multi-asset arbitrage including BTC, ETH, and altcoin pairs
• Dynamic position sizing and risk management per arbitrage opportunity

Technical Architecture:
• Real-time market data ingestion from 15+ cryptocurrency exchanges via WebSocket and REST APIs
• High-throughput order execution engine with automatic trade routing
• Advanced risk management system with position limits and stop-loss mechanisms
• Real-time portfolio optimization and rebalancing algorithms
• Comprehensive trading analytics and performance monitoring dashboards
• Enterprise-grade security with encrypted communication and secure API keys

Automated Trading Features:
• 24/7 autonomous operation with intelligent downtime management
• Adaptive algorithms that learn from market conditions and adjust strategies
• Multi-threaded execution engine handling thousands of concurrent arbitrage checks
• Automated profit withdrawal and portfolio rebalancing
• Comprehensive logging and error handling for production reliability
• Integration with exchange APIs for seamless order execution and position management`,
    technologies: ['Node.js', 'Express', 'MongoDB', 'Redis', 'WebSocket', 'Docker', 'AWS', 'CCXT', 'Pandas', 'NumPy', 'AsyncIO'],
    category: 'full-stack',
    status: 'completed',
    featured: false,
    impact: 'Automated arbitrage engine achieving 12% monthly returns, processing $500K+ daily trading volume across multiple cryptocurrency exchanges',
    year: 2023,
    duration: '4 months'
  },
  {
    id: 'mskcc-research',
    title: 'MSKCC Computational Oncology',
    subtitle: 'Memorial Sloan Kettering Cancer Center - AI-Driven Cancer Research',
    description: 'Advanced computational oncology research at MSKCC, developing AI models for cancer subtype classification, treatment optimization, and precision medicine',
    longDescription: `Research collaboration at Memorial Sloan Kettering Cancer Center focusing on computational oncology and artificial intelligence applications in cancer research. Developed sophisticated machine learning models for cancer diagnosis, treatment response prediction, and personalized oncology approaches.

Computational Oncology Research:
• Deep learning models for molecular subtype classification using multi-omics data (RNA-seq, DNA methylation, proteomics)
• Treatment response prediction using longitudinal clinical data and genomic biomarkers
• Survival analysis and risk stratification models for various cancer types
• Integration of electronic health records with genomic data for comprehensive patient profiling
• Development of interpretable AI models for clinical decision support in oncology
• Translational research bridging computational methods with clinical oncology practice

Technical Methodology:
• Ensemble learning approaches combining convolutional neural networks and transformer architectures
• Multi-modal data integration techniques for heterogeneous biological datasets
• Cross-validation and statistical validation on large-scale clinical cohorts
• Implementation of attention mechanisms for biomarker discovery and pathway analysis
• Federated learning approaches for privacy-preserving multi-institutional research
• Development of reproducible pipelines for clinical translation

Clinical Applications:
• Precision oncology decision support for treatment selection
• Early detection and risk assessment models for cancer screening
• Drug response prediction for targeted therapies
• Biomarker discovery for companion diagnostics
• Population-level analysis for cancer epidemiology and outcomes research`,
    technologies: ['Python', 'R', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'scikit-learn', 'Jupyter', 'SQL', 'Tableau', 'scikit-survival', 'lifelines'],
    category: 'research',
    status: 'completed',
    featured: true,
    impact: 'Developed ML models with 92% accuracy for cancer subtype classification, contributed to translational oncology research with potential to improve personalized cancer treatment and patient outcomes',
    year: 2023,
    duration: '6 months'
  },
  {
    id: 'crypto-arbitrage',
    title: 'Cryptocurrency Arbitrage Engine',
    subtitle: 'Automated Cross-Exchange Trading System',
    description: 'Real-time arbitrage detection and execution system across multiple cryptocurrency exchanges',
    longDescription: `Developed an automated arbitrage trading system that identifies and executes profitable price discrepancies across cryptocurrency exchanges in real-time. The system monitors multiple exchanges simultaneously and executes trades when profitable arbitrage opportunities arise.

Technical implementation:
• Multi-exchange API integration (Binance, Coinbase, Kraken, etc.)
• Real-time price monitoring and arbitrage detection
• Automated trade execution with risk controls
• Statistical arbitrage strategies implementation
• Backtesting framework for strategy validation
• Performance analytics and reporting dashboard`,
    technologies: ['Python', 'Pandas', 'NumPy', 'CCXT', 'AsyncIO', 'PostgreSQL', 'Grafana'],
    category: 'ai-ml',
    status: 'completed',
    featured: false,
    impact: 'Achieved 12% monthly returns through automated arbitrage strategies',
    year: 2023,
    duration: '3 months'
  }
];

export const projectCategories = {
  'ai-ml': { name: 'AI/ML (CV, NLP)', color: '#ff6b6b', icon: '🤖' },
  'web-dev': { name: 'Web Development', color: '#4ecdc4', icon: '💻' },
  'research': { name: 'Research', color: '#ffe66d', icon: '🔬' },
  'mobile': { name: 'Mobile Apps', color: '#a78bfa', icon: '📱' },
  'full-stack': { name: 'Full Stack', color: '#f87171', icon: '⚡' }
};

export const featuredProjects = projects.filter(p => p.featured);
export const projectsByCategory = (category: Project['category']) =>
  projects.filter(p => p.category === category);
