import { motion } from 'framer-motion';
import { Award, GraduationCap, TrendingUp, Heart, Target, Users } from 'lucide-react';

export function About() {
  const highlights = [
    {
      icon: TrendingUp,
      title: "Impact Driven",
      description: "25%+ improvement in patient outcomes through AI solutions",
      color: "text-green-400"
    },
    {
      icon: GraduationCap,
      title: "Academic Excellence",
      description: "Finishing Cornell BA/MS '25 with 2 peer-reviewed publications",
      color: "text-blue-400"
    },
    {
      icon: Target,
      title: "AI Specialist",
      description: "Clinical ML, NLP, and real-time biosensor systems",
      color: "text-purple-400"
    },
    {
      icon: Heart,
      title: "Healthcare Focus",
      description: "Bridging AI research with practical healthcare applications",
      color: "text-red-400"
    },
    {
      icon: Users,
      title: "Team Player",
      description: "Collaborative approach to complex technical challenges",
      color: "text-yellow-400"
    },
    {
      icon: Award,
      title: "Proven Results",
      description: "Track record of deploying scalable AI solutions",
      color: "text-cyan-400"
    }
  ];

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            About <span className="bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent">Me</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto mb-8"></div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <p className="text-xl text-gray-300 leading-relaxed">
                Hi! I'm <span className="text-cyan-400 font-semibold">Jae Kim</span>, an AI Engineer focused on healthcare ML.
                I've deployed AI solutions that improve patient outcomes by 25%+ and reduce healthcare costs.
              </p>

              <p className="text-lg text-gray-400 leading-relaxed">
                As a Cornell BA/MS '25 student with 2 peer-reviewed publications, I specialize in clinical machine learning,
                natural language processing, and real-time biosensor systems. I build ML systems that healthcare providers actually use.
              </p>

              <p className="text-lg text-gray-400 leading-relaxed">
                I combine deep technical expertise in AI/ML with a passion for solving real-world healthcare challenges.
                Whether developing predictive models for patient outcomes or building NLP systems for clinical documentation,
                I focus on creating solutions that make a measurable impact on healthcare delivery and patient care.
              </p>

              <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 p-6 rounded-lg border border-purple-500/20">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                  <span>Before this I was...</span>
                </h3>
                <div className="space-y-3 text-gray-300">
                  <p className="flex items-center gap-3">
                    <span className="text-2xl">🍎</span>
                    <span>building an agentic Siri planner powered by Apple Intelligence</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="text-2xl">🎓</span>
                    <span>finishing my BS/MS at Penn</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="text-2xl">🐣</span>
                    <span>being a kid and having fun (I still try to do this)</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">What Drives Me</h3>
              <p className="text-gray-300">
                When I'm not researching or coding, I stay engaged with the latest developments in AI and healthcare technology,
                and I'm always looking for opportunities to apply machine learning to improve healthcare outcomes.
              </p>
            </div>
          </motion.div>

          {/* Highlights grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {highlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg bg-gray-700/50 ${highlight.color}`}>
                    <highlight.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {highlight.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {highlight.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { number: "25%+", label: "Patient Outcome\nImprovement" },
            { number: "2", label: "Peer-Reviewed\nPublications" },
            { number: "4+", label: "Years of\nExperience" },
            { number: "10+", label: "AI Projects\nDelivered" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-800/30 p-6 rounded-lg border border-gray-700"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-gray-400 whitespace-pre-line">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}