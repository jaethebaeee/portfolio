import { motion } from 'framer-motion';

export function About() {

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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <div className="space-y-4">
            <p className="text-xl text-gray-300 leading-relaxed">
              Hi! I'm <span className="text-cyan-400 font-semibold">Jae Kim</span>, an AI Engineer currently at MSKCC
              working on healthcare ML solutions. I've been part of cutting-edge research at Cornell's Sci-Fi Lab and AIR Lab,
              and even contributed to MIT's C-CEM Tasan program during high school.
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
                <span>Research & Work Experience</span>
              </h3>
              <div className="space-y-3 text-gray-300">
                <p className="flex items-center gap-3">
                  <span className="text-2xl">🏥</span>
                  <span>AI Engineer at Memorial Sloan Kettering Cancer Center (MSKCC)</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-2xl">🚀</span>
                  <span>Cornell Sci-Fi Lab Research Assistant</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-2xl">🤖</span>
                  <span>Cornell AIR Lab Researcher</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-2xl">🎓</span>
                  <span>Cornell BA/MS '25 in Information Systems</span>
                </p>
                  <p className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <span>Materials Science Research (High School)</span>
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

        {/* Enhanced Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-white mb-4">By the Numbers</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A snapshot of my journey in healthcare AI and research
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                number: "2",
                label: "Peer-Reviewed Publications",
                description: "Acta Materialia & Computational Oncology",
                icon: "📚",
                color: "from-blue-400 to-cyan-400",
                progress: 100
              },
              {
                number: "4+",
                label: "Years of Experience",
                description: "Healthcare AI & ML Research",
                icon: "⚡",
                color: "from-yellow-400 to-orange-400",
                progress: 85
              },
              {
                number: "10+",
                label: "AI Projects Delivered",
                description: "Clinical & Research Applications",
                icon: "🚀",
                color: "from-green-400 to-teal-400",
                progress: 90
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/20"
                whileHover={{ scale: 1.02, y: -5 }}
              >
                {/* Background glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />

                <div className="relative z-10 text-center">
                  {/* Icon */}
                  <motion.div
                    className="text-4xl mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {stat.icon}
                  </motion.div>

                  {/* Number with animation */}
                  <motion.div
                    className={`text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-3`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.2,
                      type: "spring",
                      stiffness: 200
                    }}
                    viewport={{ once: true }}
                  >
                    {stat.number}
                  </motion.div>

                  {/* Label */}
                  <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {stat.label}
                  </h4>

                  {/* Description */}
                  <p className="text-sm text-gray-400 mb-4">
                    {stat.description}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${stat.progress}%` }}
                      transition={{ duration: 1.5, delay: index * 0.3, ease: "easeOut" }}
                      viewport={{ once: true }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Timeline/Experience highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <h4 className="text-xl font-bold text-white text-center mb-8">Key Milestones</h4>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-cyan-400 to-yellow-400 opacity-30"></div>

              {[
                { year: "2024", event: "Acta Materialia Publication", detail: "Physics-enhanced ML for materials science" },
                { year: "2023", event: "MSKCC AI Engineer", detail: "Cancer subtype classification (92% accuracy)" },
                { year: "2022", event: "Cornell Sci-Fi Lab", detail: "Biosensor analytics with 200+ participants" },
                { year: "2021", event: "Materials Science Research", detail: "High school research with Prof. Tasan" }
              ].map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`relative flex items-center mb-8 ${
                    index % 2 === 0 ? 'justify-start pr-8' : 'justify-end pl-8'
                  }`}
                >
                  <div className={`bg-gray-800/80 p-4 rounded-lg border border-gray-700 max-w-sm ${
                    index % 2 === 0 ? 'text-right' : 'text-left'
                  }`}>
                    <div className="text-cyan-400 font-bold text-sm mb-1">{milestone.year}</div>
                    <div className="text-white font-semibold mb-1">{milestone.event}</div>
                    <div className="text-gray-400 text-sm">{milestone.detail}</div>
                  </div>

                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-cyan-400 to-yellow-400 rounded-full border-4 border-gray-900"></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}