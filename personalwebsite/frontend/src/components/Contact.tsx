import { motion } from 'framer-motion';
import { Mail, Linkedin, ExternalLink } from 'lucide-react';

export function Contact() {

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'jk2765@cornell.edu',
      href: 'mailto:jk2765@cornell.edu',
      color: 'text-blue-400'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      value: 'linkedin.com/in/jaekim',
      href: 'https://linkedin.com/in/jaekim',
      color: 'text-blue-500'
    }
  ];

  return (
    <section className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Get In <span className="bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent">Touch</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto mb-8"></div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            I'm always interested in discussing new opportunities, collaborations, or just having a chat about AI and healthcare technology.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Let's Connect</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                I'm currently open to discussing new opportunities in AI research, healthcare technology,
                and innovative software development projects. Feel free to reach out!
              </p>
            </div>

            {/* Contact Links */}
            <div className="space-y-4">
              {contactInfo.map((contact, index) => (
                <motion.a
                  key={contact.label}
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`p-3 rounded-lg bg-gray-800 ${contact.color}`}>
                    <contact.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {contact.label}
                    </div>
                    <div className="text-gray-400 text-sm flex items-center gap-1">
                      {contact.value}
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-cyan-400/10 to-yellow-400/10 p-6 rounded-lg border border-gray-700"
            >
              <h4 className="text-lg font-semibold text-white mb-3">Response Time</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                I typically respond to messages within 24 hours. For urgent inquiries or time-sensitive opportunities,
                feel free to mention it in your message and I'll prioritize accordingly.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}