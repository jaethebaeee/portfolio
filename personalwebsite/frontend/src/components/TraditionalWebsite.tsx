import { useState } from 'react';
import { Header } from './Header';
import { Hero } from './Hero';
import { About } from './About';
import { Projects } from './Projects';
import { Skills } from './Skills';
import { Contact } from './Contact';
import { Footer } from './Footer';
import { VintageNavigationButtons } from './UI/VintageNavButton';

interface TraditionalWebsiteProps {
  onBack?: () => void;
  onForward?: () => void;
}

export function TraditionalWebsite({ onBack, onForward }: TraditionalWebsiteProps = {}) {
  const [currentSection, setCurrentSection] = useState('hero');

  const scrollToSection = (sectionId: string) => {
    setCurrentSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="h-screen text-white overflow-y-auto">
      <Header
        onNavigate={scrollToSection}
        currentSection={currentSection}
        onLaunchPortfolio={onForward}
      />

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

      {/* Vintage Navigation Buttons */}
      <VintageNavigationButtons
        onBack={onBack}
        canGoBack={!!onBack}
        delay={1.2}
      />
    </div>
  );
}
