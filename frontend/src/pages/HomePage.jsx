import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo" onClick={() => navigate('/')}>
            <span className="logo-text">InternnX</span>
          </div>
          <div className="nav-buttons">
            <button className="nav-btn" onClick={() => navigate('/')}>Home</button>
            <button className="nav-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">AI-Powered Internship Matching</h1>
            <p className="hero-subtitle">Find your perfect internship opportunity with our intelligent matching system</p>
            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Students</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">5,000+</div>
                <div className="stat-label">Companies</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-label">Success Rate</div>
              </div>
            </div>

            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate('/match_form')}>Find Matches</button>
              <button className="btn-secondary" onClick={() => navigate('/register')}>Register</button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="floating-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Upload Resume</h3>
              <p>Upload your resume and tell us about your preferences</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Matching</h3>
              <p>Our AI analyzes your profile and finds the best matches</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Get Hired</h3>
              <p>Apply to internships that match your skills and interests</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Find Your Perfect Internship?</h2>
          <p>Join thousands of students who have found their dream internships</p>
          <button className="btn-primary-large" onClick={() => navigate('/match_form')}>Get Started Now</button>
        </div>
      </section>
    </div>
  );
}