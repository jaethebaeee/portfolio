import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ResumeItem {
  heading: string;
  subtitle?: string;
  points: string[];
}

interface ResumeSection {
  title: string;
  items: ResumeItem[];
}

const RESUME_SECTIONS: ResumeSection[] = [
  {
    title: 'Experience',
    items: [
      {
        heading: 'Software Engineer — KakaoTalk (Kakao)',
        subtitle: 'Messaging Platform Team · Seoul, South Korea · Jun 2025–Present',
        points: [
          'Implement REST API endpoints for partner app integrations serving 47M+ daily active users with OAuth 2.0 security.',
          'Build SDK utilities for automated message templating and webhook event parsing across iOS/Android clients.',
          'Contribute to Redis-powered notification delivery pipeline and study distributed systems at production scale.',
        ],
      },
      {
        heading: 'Machine Learning Research Intern — Memorial Sloan Kettering Cancer Center',
        subtitle: 'Computational Oncology · New York, NY · Summer 2024',
        points: [
          'Trained ensemble models on 15,000+ EHRs achieving 0.89 AUC for 6-month cancer risk prediction.',
          'Integrated predictions into oncology workflows with SHAP explainability per FDA guidance.',
        ],
      },
      {
        heading: 'Research Engineer — EmBODY Lab / AC Lab',
        subtitle: 'Affective Computing & LLM Systems · Atlanta, GA · Jan–Aug 2024',
        points: [
          'Built the ACES coaching system for autistic adults using GPT-4, raising task completion from 58% to 84%.',
          'Engineered real-time biosignal pipeline (EMG/GSR/HR @1kHz) feeding an XGBoost emotion classifier (76% accuracy).',
        ],
      },
      {
        heading: 'Machine Learning Researcher — POSTECH Materials Science',
        subtitle: 'Computational Materials Lab · Pohang, South Korea · Summer 2023',
        points: [
          'Developed hybrid physics-augmented neural networks predicting metal yield strength within 8% MAPE across 300–1200K.',
          'Co-authored an Acta Materialia publication while evaluating 2,400 mechanical tests.',
        ],
      },
      {
        heading: 'Research Assistant — AIR Lab, Cornell Tech',
        subtitle: 'Robotics & Wearable Systems · New York, NY · Fall 2023',
        points: [
          'Implemented EMG signal ML pipelines enabling wearable-to-robotic control with 25% better reliability.',
        ],
      },
      {
        heading: 'Researcher — SciFi Lab, Cornell University',
        subtitle: 'Human-Computer Interaction · Ithaca, NY · 2021–2022',
        points: [
          'Built a CNN-based 2D→3D pose estimator for egocentric wearables and co-authored BodyTrak (ACM IMWUT).',
        ],
      },
    ],
  },
  {
    title: 'Selected Projects',
    items: [
      {
        heading: 'OddStalks — Sports Arbitrage Platform',
        points: [
          'Django/Redis engine polling 15 APIs every 200ms, detecting +EV opportunities with <100ms latency.',
          'Kelly Criterion position sizing across 50K+ daily odds updates.',
        ],
      },
      {
        heading: 'Wearable Hexapod (Chingu)',
        points: [
          'Ergonomic hexapod device with QtPy microcontroller and custom 3D-printed housing for biomechanical feedback research.',
        ],
      },
      {
        heading: 'Spatial Audio Tools',
        points: [
          '3D audio placement pipeline using HRTF-based positioning for immersive virtual concert experiences.',
        ],
      },
    ],
  },
  {
    title: 'Skills & Tools',
    items: [
      {
        heading: 'Programming',
        points: ['Python, C++, JavaScript/TypeScript, Swift, R, Java, MATLAB'],
      },
      {
        heading: 'ML/AI',
        points: ['PyTorch, TensorFlow, sklearn, LLM fine-tuning (GPT-4, RLHF), Transformers, ONNX'],
      },
      {
        heading: 'Health Tech',
        points: ['Biosignals (EMG/GSR/HR), wearable systems, mHealth apps, HIPAA-compliant architectures'],
      },
      {
        heading: 'Cloud / Infrastructure',
        points: ['AWS, GCP, Redis, distributed systems'],
      },
      {
        heading: 'Tools',
        points: ['Git, KakaoTalk API, REST API design, Arduino, embedded systems'],
      },
    ],
  },
];

export function ResumeOverlay({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="pixel-panel relative max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-3xl border-white/70 bg-gradient-to-br from-[#0c1723] via-[#161b30] to-[#11121b] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40"
              aria-label="Close resume overlay"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center">
              <p className="pixel-font text-xs uppercase tracking-[0.6em] text-amber-300">Jae Hoon Kim</p>
              <h1 className="pixel-font text-3xl text-white/90">Resume Snapshot</h1>
              <p className="pixel-font text-[0.65rem] text-gray-200">
                New York, NY · jk2765@cornell.edu · github.com/jae · KakaoTalk ID available
              </p>
            </div>

            <div className="mt-6 space-y-6">
              {RESUME_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h2 className="pixel-font text-lg text-yellow-400">{section.title}</h2>
                  <div className="mt-3 space-y-4">
                    {section.items.map((item) => (
                      <div key={item.heading} className="space-y-2 rounded-2xl border border-white/30 bg-white/5 px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <p className="pixel-font text-sm font-semibold text-white">{item.heading}</p>
                          {item.subtitle && (
                            <p className="pixel-font text-[0.55rem] uppercase text-blue-300">{item.subtitle}</p>
                          )}
                        </div>
                        <ul className="ml-4 list-disc space-y-1 text-[0.75rem] leading-relaxed text-gray-200">
                          {item.points.map((point) => (
                            <li key={point} className="pixel-font text-xs text-gray-200">{point}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
