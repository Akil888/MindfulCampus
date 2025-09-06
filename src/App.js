import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import EmotionalAnalysis from './components/EmotionalAnalysis';
import PeerSupport from './components/PeerSupport';
import CampusInsights from './components/CampusInsights';
import AdvancedFeatures from './components/AdvancedFeatures';

const Navigation = ({ currentPage, setCurrentPage }) => (
  <div style={{
    background: 'rgba(26,29,41,0.95)',
    padding: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  }}>
    <h2 style={{ margin: 0, color: '#667eea' }}>🧠 MindfulCampus</h2>
    <nav style={{ display: 'flex', gap: '15px' }}>
      {[
        { name: 'Dashboard', icon: '📊' },
        { name: 'Analysis', icon: '🧠' },
        { name: 'Support', icon: '🤝' },
        { name: 'AI Features', icon: '🚀' },
        { name: 'Insights', icon: '📈' }
      ].map(page => (
        <button
          key={page.name}
          onClick={() => setCurrentPage(page.name)}
          style={{
            background: currentPage === page.name ? '#667eea' : 'transparent',
            color: 'white',
            border: '1px solid #667eea',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s ease'
          }}
        >
          <span>{page.icon}</span>
          <span>{page.name}</span>
        </button>
      ))}
    </nav>
  </div>
);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('Dashboard');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        flexDirection: 'column'
      }}>
        <div style={{
          border: '3px solid rgba(255, 255, 255, 0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <h1>🧠 MindfulCampus</h1>
        <p>Loading your mental wellness platform...</p>
        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center', 
          fontSize: '14px', 
          opacity: 0.8 
        }}>
          <div>✨ Initializing AI models...</div>
          <div>🧠 Loading emotion analysis...</div>
          <div>🚀 Preparing advanced features...</div>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const renderPage = () => {
    switch(currentPage) {
      case 'Analysis': return <EmotionalAnalysis />;
      case 'Support': return <PeerSupport />;
      case 'AI Features': return <AdvancedFeatures />;
      case 'Insights': return <CampusInsights />;
      default: return <Dashboard />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1d29 100%)',
      color: 'white'
    }}>
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

export default App;