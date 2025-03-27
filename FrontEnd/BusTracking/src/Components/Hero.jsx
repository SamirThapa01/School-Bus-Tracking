import React from 'react';
import './signup';
import { Bus, ChevronRight } from 'lucide-react';

const Hero = () => {
  return (
    <header className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-tag">Real-Time School Bus Tracking</div>
          <h1 className="hero-title">
            Ensuring <span className="text-blue">Safety</span> & <span className="text-green">Peace of Mind</span>
          </h1>
          <p className="hero-description">
            Advanced GPS tracking system that keeps you connected with your child's school transportation.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary">
              Get Started <ChevronRight className="btn-icon" />
            </button>
            <button className="btn btn-secondary">Learn More</button>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-background-blob"></div>
          <Bus className="hero-bus-icon" />
        </div>
      </div>
    </header>
  );
};

export default Hero;