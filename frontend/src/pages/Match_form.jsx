import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Match_form.css';

export default function MatchForm() {
  const [location, setLocation] = useState('');
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [fileName, setFileName] = useState('Upload Resume (PDF, DOC, DOCX, TXT)');
  const [resumeFile, setResumeFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (allowedTypes.includes(fileExtension)) {
        setResumeFile(file);
        setFileName(file.name);
        setError('');
      } else {
        setError('Please upload a valid file format: PDF, DOC, DOCX, or TXT');
        setResumeFile(null);
        setFileName('Upload Resume (PDF, DOC, DOCX, TXT)');
      }
    } else {
      setFileName('Upload Resume (PDF, DOC, DOCX, TXT)');
    }
  };

  const handleHome = () => {
    navigate('/dashboard');
  };

  const handleAdmin = () => {
    navigate('/dashboard');
  };

  const handleSectorChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedSectors([...selectedSectors, value]);
    } else {
      setSelectedSectors(selectedSectors.filter(sector => sector !== value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Show loading state
    setIsLoading(true);
    setError('');
    setMatches([]);

    try {
      const applicantData = {
        applicant_id: 1,
        name: "Alok Kumar",
        skills: ["Python", "SQL", "Machine Learning"],
        qualifications: "B.Tech CS",
        sector_interest: selectedSectors,
        location_preference: location,
        is_rural_district: false
      };

      console.log('Sending data:', applicantData);

      const response = await fetch('http://127.0.0.1:8000/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicantData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMatches(data.matches || []);

    } catch (error) {
      console.error('Error:', error);
      setError(`Error finding matches. Please try again. ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const displayMatches = () => {
    if (error) {
      return (
        <div className="error-message">
          {error}
        </div>
      );
    }

    if (matches.length === 0 && !isLoading) {
      return (
        <div className="no-matches">
          <p>No matching internships found. Try different preferences.</p>
        </div>
      );
    }

    if (matches.length > 0) {
      return (
        <div className="matches-found">
          <h2>Found {matches.length} matching internships:</h2>
          {matches.map((match, index) => (
            <div key={index} className="match-card">
              <div className="match-header">
                <h3>Match Score: {(match.score * 100).toFixed(1)}%</h3>
              </div>
              <div className="match-details">
                <p><strong>Position:</strong> {match.title}</p>
                <p><strong>Company:</strong> {match.company}</p>
                <p><strong>Location:</strong> {match.location}</p>
                <p><strong>Required Skills:</strong> {match.required_skills.join(', ')}</p>
              </div>
              <button className="apply-button">Apply Now</button>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="match-form-page">
      <header className="modern-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">InternnX</div>
            <span className="logo-subtitle">AI-Powered Internship Platform</span>
          </div>
          <nav className="nav-section">
            <button className="nav-btn" onClick={handleHome}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
            <button className="nav-btn" onClick={handleAdmin}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin
            </button>
          </nav>
        </div>
      </header>

      <main>
        <div className="container">
          <h2>Let's Find Your Match</h2>

          <form id="match-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="resume">Upload Resume (PDF, DOC, DOCX, TXT)</label>
              <div className="file-upload-box">
                <input 
                  type="file" 
                  id="resume" 
                  name="resume" 
                  accept=".pdf,.doc,.docx,.txt" 
                  className="file-input" 
                  onChange={handleFileChange}
                />
                <label htmlFor="resume" className="file-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                  <span id="file-name">{fileName}</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location Preference</label>
              <input 
                type="text" 
                id="location" 
                name="location" 
                placeholder="e.g., New Delhi, Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Sector Interests</label>
              <div className="sector-interests">
                <label><input type="checkbox" name="sector" value="Technology" onChange={handleSectorChange} /> Technology</label>
                <label><input type="checkbox" name="sector" value="E-commerce" onChange={handleSectorChange} /> E-commerce</label>
                <label><input type="checkbox" name="sector" value="Analytics" onChange={handleSectorChange} /> Analytics</label>
                <label><input type="checkbox" name="sector" value="Marketing" onChange={handleSectorChange} /> Marketing</label>
                <label><input type="checkbox" name="sector" value="Design" onChange={handleSectorChange} /> Design</label>
                <label><input type="checkbox" name="sector" value="Finance" onChange={handleSectorChange} /> Finance</label>
              </div>
            </div>

            <button type="submit" id="submit-button" className="find-matches-btn" disabled={isLoading}>
              {isLoading ? 'Finding Matches...' : 'FIND MY MATCHES'}
            </button>
          </form>

          <div id="results-container" className="results-container">
            {isLoading && (
              <div className="loading">
                <div className="loader"></div>
                <p>Searching for matches...</p>
              </div>
            )}
            {displayMatches()}
          </div>
        </div>
      </main>
    </div>
  );
}