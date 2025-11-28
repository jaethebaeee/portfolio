import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Hero } from './Hero';
import { BrowserRouter } from 'react-router-dom';

describe('Hero Component', () => {
  it('renders hero content', () => {
    render(
      <BrowserRouter>
        <Hero onNavigate={() => {}} />
      </BrowserRouter>
    );

    expect(screen.getByText('Hi, I\'m')).toBeInTheDocument();
    expect(screen.getByText('Jae Kim')).toBeInTheDocument();
    expect(screen.getByText('AI Engineer • Healthcare ML')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(
      <BrowserRouter>
        <Hero onNavigate={() => {}} />
      </BrowserRouter>
    );

    expect(screen.getByText('View My Work')).toBeInTheDocument();
    expect(screen.getByText('Get In Touch')).toBeInTheDocument();
  });

  it('renders social links', () => {
    render(
      <BrowserRouter>
        <Hero onNavigate={() => {}} />
      </BrowserRouter>
    );

    const githubLink = screen.getByLabelText('GitHub');
    const linkedinLink = screen.getByLabelText('LinkedIn');
    const emailLink = screen.getByLabelText('Email');

    expect(githubLink).toBeInTheDocument();
    expect(linkedinLink).toBeInTheDocument();
    expect(emailLink).toBeInTheDocument();
  });
});
