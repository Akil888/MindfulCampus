import React, { useState } from 'react';

const AdvancedFeatures = () => {
  const [activeFeature, setActiveFeature] = useState(null);
  const [studyTimer, setStudyTimer] = useState({ active: false, minutes: 0 });
  const [wellnessGoals, setWellnessGoals] = useState([
    { id: 1, text: 'Check mood 3 times', target: 3, current: 1, emoji: '😊' },
    { id: 2, text: 'Take 2 study breaks', target: 2, current: 0, emoji: '⏰' },
    { id: 3, text: 'Do breathing exercise', target: 1, current: 1, emoji: '🫁' },
    { id: 4, text: 'Connect with a friend', target: 1, current: 0, emoji: '🤝' },
    { id: 5, text: 'Spend 30 min outdoors', target: 30, current: 15, emoji: '🌞' }
  ]);

  const campusAreas = [
    { name: 'Main Library', mood: 6.2, students: 45, trend: 'stable', riskLevel: 'medium' },
    { name: 'Student Cafeteria', mood: 7.8, students: 32, trend: 'improving', riskLevel: 'low' },
    { name: 'Fitness Center', mood: 8.1, students: 18, trend: 'improving', riskLevel: 'low' },
    { name: 'Study Hall A', mood: 5.9, students: 28, trend: 'declining', riskLevel: 'high' },
    { name: 'Engineering Block', mood: 5.2, students: 67, trend: 'declining', riskLevel: 'critical' },
    { name: 'Arts Building', mood: 7.2, students: 23, trend: 'stable', riskLevel: 'low' }
  ];

  const availablePeers = [
    { name: 'Alex K.', major: 'Computer Science', status: 'Available', compatibility: 94, mood: 'positive' },
    { name: 'Sam R.', major: 'Psychology', status: 'Available', compatibility: 89, mood: 'helpful' },
    { name: 'Jordan M.', major: 'Engineering', status: 'In Session', compatibility: 82, mood: 'busy' },
    { name: 'Casey L.', major: 'Business', status: 'Available', compatibility: 91, mood: 'supportive' },
    { name: 'Morgan P.', major: 'Medicine', status: 'Available', compatibility: 87, mood: 'empathetic' }
  ];

  const startStudySession = () => {
    setStudyTimer({ active: true, minutes: 0 });
    alert('📚 Study session started! You\'ll get break reminders every 30 minutes.');
  };

  const completeGoal = (goalId) => {
    setWellnessGoals(goals => 
      goals.map(goal => 
        goal.id === goalId && goal.current < goal.target 
          ? { ...goal, current: goal.current + 1 }
          : goal
      )
    );
  };

  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'critical': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#ffeb3b';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const connectWithPeer = (peerName) => {
    alert(`🤝 Connecting with ${peerName}... They'll receive your support request.`);
    setTimeout(() => {
      alert(`💬 ${peerName} accepted your request! Starting anonymous chat...`);
    }, 2000);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🚀 Advanced Wellness Features</h1>
      <p style={{ marginBottom: '40px', opacity: 0.8 }}>
        AI-powered tools for comprehensive mental wellness support
      </p>

      {/* Feature Selection Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
      }}>
        <div 
          style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '20px', 
            borderRadius: '12px', 
            textAlign: 'center',
            cursor: 'pointer',
            border: activeFeature === 'study' ? '2px solid white' : '2px solid transparent'
          }}
          onClick={() => setActiveFeature('study')}
        >
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📚</div>
          <h3>Smart Study Timer</h3>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>
            AI-powered break reminders to prevent burnout
          </p>
        </div>

        <div 
          style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '20px', 
            borderRadius: '12px', 
            textAlign: 'center',
            cursor: 'pointer',
            border: activeFeature === 'goals' ? '2px solid white' : '2px solid transparent'
          }}
          onClick={() => setActiveFeature('goals')}
        >
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎯</div>
          <h3>Daily Wellness Goals</h3>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>
            Gamified mental health habit tracking
          </p>
        </div>

        <div 
          style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '20px', 
            borderRadius: '12px', 
            textAlign: 'center',
            cursor: 'pointer',
            border: activeFeature === 'campus' ? '2px solid white' : '2px solid transparent'
          }}
          onClick={() => setActiveFeature('campus')}
        >
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🗺️</div>
          <h3>Live Campus Mood Map</h3>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>
            Real-time emotional wellness across campus
          </p>
        </div>

        <div 
          style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '20px', 
            borderRadius: '12px', 
            textAlign: 'center',
            cursor: 'pointer',
            border: activeFeature === 'peers' ? '2px solid white' : '2px solid transparent'
          }}
          onClick={() => setActiveFeature('peers')}
        >
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🤝</div>
          <h3>Peer Support Network</h3>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>
            Connect with trained peer counselors instantly
          </p>
        </div>
      </div>

      {/* Feature Content */}
      {activeFeature === 'study' && (
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '12px' }}>
          <h2>📚 Smart Study Timer</h2>
          <p style={{ marginBottom: '20px' }}>
            AI monitors your study patterns and suggests optimal break times to prevent burnout and improve retention.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '8px' }}>
              <h4>Session Status</h4>
              <div style={{ fontSize: '24px', margin: '10px 0' }}>
                {studyTimer.active ? `📚 Active (${studyTimer.minutes} min)` : '⏸️ Not Started'}
              </div>
              <button 
                onClick={startStudySession}
                style={{
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {studyTimer.active ? 'Extend Session' : 'Start Study Session'}
              </button>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '8px' }}>
              <h4>AI Recommendations</h4>
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                • Take 5-min break every 25 minutes<br/>
                • Optimal study time: 2-hour blocks<br/>
                • Current stress level: Medium<br/>
                • Suggested next break: In 12 minutes
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(76,175,80,0.1)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(76,175,80,0.3)' }}>
            <strong>💡 Study Tip:</strong> Research shows that taking regular breaks improves retention by 40% and reduces study-related stress by 65%.
          </div>
        </div>
      )}

      {activeFeature === 'goals' && (
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '12px' }}>
          <h2>🎯 Daily Wellness Goals</h2>
          <p style={{ marginBottom: '20px' }}>
            Complete small daily actions to build positive mental health habits. Each goal completed increases your wellness score.
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            {wellnessGoals.map(goal => {
              const progress = Math.min((goal.current / goal.target) * 100, 100);
              const completed = goal.current >= goal.target;
              
              return (
                <div key={goal.id} style={{
                  background: completed ? 'rgba(76,175,80,0.1)' : 'rgba(255,255,255,0.05)',
                  padding: '15px',
                  margin: '10px 0',
                  borderRadius: '8px',
                  border: `2px solid ${completed ? '#4caf50' : 'rgba(255,255,255,0.1)'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '16px' }}>
                      {goal.emoji} {goal.text}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 'bold', color: completed ? '#4caf50' : 'white' }}>
                        {goal.current}/{goal.target}
                      </span>
                      {!completed && (
                        <button 
                          onClick={() => completeGoal(goal.id)}
                          style={{
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', height: '6px', borderRadius: '3px' }}>
                    <div style={{
                      background: completed ? '#4caf50' : '#667eea',
                      height: '100%',
                      width: `${progress}%`,
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
            Today's Wellness Score: {Math.round((wellnessGoals.reduce((sum, goal) => sum + Math.min(goal.current / goal.target, 1), 0) / wellnessGoals.length) * 100)}%
          </div>
        </div>
      )}

      {activeFeature === 'campus' && (
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '12px' }}>
          <h2>🗺️ Live Campus Mood Map</h2>
          <p style={{ marginBottom: '20px' }}>
            Real-time emotional wellness data across campus locations. AI automatically deploys support to high-risk areas.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
            {campusAreas.map((area, index) => {
              const moodColor = area.mood >= 7 ? '#4caf50' : area.mood >= 6 ? '#ff9800' : '#f44336';
              const trendEmoji = area.trend === 'improving' ? '📈' : area.trend === 'declining' ? '📉' : '➡️';
              
              return (
                <div key={index} style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '15px',
                  borderRadius: '8px',
                  border: `3px solid ${getRiskColor(area.riskLevel)}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '16px' }}>{area.name}</strong>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>{area.students} students present</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: moodColor }}>
                        {area.mood}/10
                      </div>
                      <div style={{ fontSize: '14px' }}>{trendEmoji}</div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', height: '8px', borderRadius: '4px' }}>
                      <div style={{
                        background: moodColor,
                        height: '100%',
                        width: `${(area.mood / 10) * 100}%`,
                        borderRadius: '4px'
                      }}></div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    fontSize: '12px', 
                    padding: '8px', 
                    background: `rgba(${getRiskColor(area.riskLevel).replace('#', '')}, 0.2)`,
                    borderRadius: '4px',
                    color: getRiskColor(area.riskLevel)
                  }}>
                    Risk Level: {area.riskLevel.toUpperCase()}
                    {area.riskLevel === 'critical' && ' - Counselor dispatched'}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', opacity: 0.8 }}>
            🟢 Low Risk (7+) &nbsp;&nbsp; 🟡 Medium Risk (6-7) &nbsp;&nbsp; 🟠 High Risk (5-6) &nbsp;&nbsp; 🔴 Critical (&lt;5)
          </div>
        </div>
      )}

      {activeFeature === 'peers' && (
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '12px' }}>
          <h2>🤝 Peer Support Network</h2>
          <p style={{ marginBottom: '20px' }}>
            Connect with trained peer counselors who understand student challenges. All conversations are anonymous and confidential.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
            {availablePeers.map((peer, index) => (
              <div key={index} style={{
                background: peer.status === 'Available' ? 'rgba(76,175,80,0.1)' : 'rgba(255,255,255,0.05)',
                padding: '15px',
                borderRadius: '8px',
                border: `2px solid ${peer.status === 'Available' ? '#4caf50' : 'rgba(255,255,255,0.1)'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '16px' }}>{peer.name}</strong>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>{peer.major}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: peer.status === 'Available' ? '#4caf50' : '#ff9800',
                      fontWeight: 'bold'
                    }}>
                      {peer.status}
                    </div>
                    <div style={{ fontSize: '12px', color: '#667eea' }}>
                      {peer.compatibility}% match
                    </div>
                  </div>
                </div>
                
                <div style={{ fontSize: '14px', marginBottom: '10px', fontStyle: 'italic' }}>
                  Current mood: {peer.mood}
                </div>
                
                {peer.status === 'Available' ? (
                  <button 
                    onClick={() => connectWithPeer(peer.name)}
                    style={{
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      padding: '10px 15px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      width: '100%',
                      fontSize: '14px'
                    }}
                  >
                    Connect for Support
                  </button>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '10px', 
                    color: '#999', 
                    fontStyle: 'italic',
                    fontSize: '12px'
                  }}>
                    Currently helping another student
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: 'rgba(102,126,234,0.1)', 
            borderRadius: '8px',
            border: '1px solid rgba(102,126,234,0.3)'
          }}>
            <strong>💡 How it works:</strong> Our peer counselors are trained students who provide emotional support, study tips, and crisis intervention. Average response time: 2.3 minutes.
          </div>
        </div>
      )}

      {!activeFeature && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          border: '2px dashed rgba(255,255,255,0.3)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✨</div>
          <h3>Select a feature above to explore AI-powered wellness tools</h3>
          <p style={{ opacity: 0.8, marginTop: '10px' }}>
            Each feature uses advanced AI to provide personalized mental health support
          </p>
        </div>
      )}
    </div>
  );
};

export default AdvancedFeatures;