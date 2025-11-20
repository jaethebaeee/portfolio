import { useState } from 'react';
import { Header } from './Header';
import { Hero } from './Hero';
import { About } from './About';
import { Projects } from './Projects';
import { Skills } from './Skills';
import { Contact } from './Contact';
import { Footer } from './Footer';
import { ChatWidget } from './ChatWidget';

export function TraditionalWebsite() {
  const [currentSection, setCurrentSection] = useState('hero');

  const scrollToSection = (sectionId: string) => {
    setCurrentSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header onNavigate={scrollToSection} currentSection={currentSection} />

      <main>
        <section id="hero">
          <Hero onNavigate={scrollToSection} />
        </section>

        <section id="about">
          <About />
        </section>

        <section id="projects">
          <Projects />
        </section>

        <section id="skills">
          <Skills />
        </section>

        <section id="contact">
          <Contact />
        </section>
      </main>

      <Footer />

      <ChatWidget />
    </div>
  );
}
