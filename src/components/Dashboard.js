import React, { useState } from 'react';

const Dashboard = () => {
  const [moodEntries, setMoodEntries] = useState([7, 6, 8, 7, 6]);
  const [wellnessStreak, setWellnessStreak] = useState(5);
  const [interventionsCompleted, setInterventionsCompleted] = useState(3);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);

  const calculateOverallScore = () => {
    const avgMood = moodEntries.reduce((a, b) => a + b, 0) / moodEntries.length;
    const streakBonus = Math.min(wellnessStreak * 2, 20);
    const interventionBonus = interventionsCompleted * 5;
    
    return Math.min(Math.round((avgMood / 10) * 70 + streakBonus + interventionBonus), 100);
  };

  const overallScore = calculateOverallScore();
  const currentMood = moodEntries[moodEntries.length - 1];

  const updateMood = (newMood) => {
    const newEntries = [...moodEntries.slice(1), newMood];
    setMoodEntries(newEntries);
    
    // Only increase streak if mood is 6 or above (this is working correctly)
    if (newMood >= 6) {
      setWellnessStreak(prev => prev + 1);
    } else {
      // Reset streak if mood is poor for consecutive days
      const recentLowMoods = newEntries.slice(-2).filter(mood => mood < 6).length;
      if (recentLowMoods >= 2) {
        setWellnessStreak(0);
      }
    }
  };

  const getCouponEligibility = () => {
    if (overallScore >= 80) return { eligible: true, type: 'Premium', reward: 'Free campus meal + study room booking' };
    if (overallScore >= 70) return { eligible: true, type: 'Gold', reward: 'Free coffee + library access' };
    if (overallScore >= 60) return { eligible: true, type: 'Silver', reward: 'Stress-relief kit discount' };
    return { eligible: false, type: null, reward: 'Keep improving your wellness score!' };
  };

  const coupon = getCouponEligibility();

  return (
    <div style={{ padding: '40px' }}>
      <h1>Your Wellness Dashboard</h1>
      
      <div style={{
        background: `linear-gradient(135deg, ${overallScore >= 80 ? '#4caf50' : overallScore >= 60 ? '#ff9800' : '#f44336'} 0%, ${overallScore >= 80 ? '#66bb6a' : overallScore >= 60 ? '#ffb74d' : '#ef5350'} 100%)`,
        padding: '30px',
        borderRadius: '16px',
        textAlign: 'center',
        marginBottom: '30px',
        color: 'white'
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>Overall Wellness Score</h2>
        <div style={{ fontSize: '4rem', fontWeight: 'bold', margin: '10px 0' }}>{overallScore}</div>
        <p style={{ margin: '10px 0', opacity: 0.9 }}>
          Avg Mood: {(moodEntries.reduce((a, b) => a + b, 0) / moodEntries.length).toFixed(1)}/10 | 
          Streak: {wellnessStreak} days | 
          Interventions: {interventionsCompleted}
        </p>
        
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '15px',
          borderRadius: '8px',
          marginTop: '15px'
        }}>
          {coupon.eligible ? (
            <>
              <h4 style={{ margin: '0 0 8px 0' }}>🎁 {coupon.type} Reward Unlocked!</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>{coupon.reward}</p>
            </>
          ) : (
            <>
              <h4 style={{ margin: '0 0 8px 0' }}>🎯 Keep Going!</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>{coupon.reward}</p>
            </>
          )}
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
            {currentMood >= 8 ? '😄' : currentMood >= 6 ? '😊' : currentMood >= 4 ? '😐' : '😞'}
          </div>
          <h3 style={{ margin: '10px 0', color: '#667eea' }}>{currentMood}/10</h3>
          <p style={{ margin: '10px 0', opacity: 0.8 }}>Current Mood</p>
          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '10px' }}>
            {[1,2,3,4,5,6,7,8,9,10].map(mood => (
              <button
                key={mood}
                onClick={() => updateMood(mood)}
                style={{
                  background: mood === currentMood ? '#667eea' : 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: mood === currentMood ? '2px solid white' : 'none',
                  width: '25px',
                  height: '25px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '10px'
                }}
              >
                {mood}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '11px', opacity: 0.7, marginTop: '8px' }}>
            Mood 6+ maintains streak
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔥</div>
          <h3 style={{ margin: '10px 0', color: '#ff6b35' }}>{wellnessStreak} days</h3>
          <p style={{ margin: '10px 0', opacity: 0.8 }}>Wellness Streak</p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🧘‍♀️</div>
          <h3 style={{ margin: '10px 0', color: '#4caf50' }}>{interventionsCompleted}</h3>
          <p style={{ margin: '10px 0', opacity: 0.8 }}>Completed Today</p>
          <button
            onClick={() => setShowBreathingExercise(true)}
            style={{
              background: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '5px'
            }}
          >
            Start Breathing Exercise
          </button>
        </div>
      </div>

      {showBreathingExercise && (
        <BreathingExercise 
          onComplete={() => {
            setShowBreathingExercise(false);
            setInterventionsCompleted(prev => prev + 1);
          }}
          onClose={() => setShowBreathingExercise(false)}
        />
      )}
    </div>
  );
};

const BreathingExercise = ({ onComplete, onClose }) => {
  const [phase, setPhase] = useState('ready');
  const [count, setCount] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [timer, setTimer] = useState(null);

  const startExercise = () => {
    setPhase('inhale');
    setCount(4);
    setCycle(0);
    
    const intervalId = setInterval(() => {
      setCount(prevCount => {
        if (prevCount > 1) {
          return prevCount - 1;
        }
        
        // Move to next phase when count reaches 0
        setPhase(prevPhase => {
          if (prevPhase === 'inhale') {
            setCount(7);
            return 'hold';
          } else if (prevPhase === 'hold') {
            setCount(8);
            return 'exhale';
          } else if (prevPhase === 'exhale') {
            setCycle(prevCycle => {
              const newCycle = prevCycle + 1;
              if (newCycle >= 4) {
                clearInterval(intervalId);
                setTimeout(() => onComplete(), 500);
                return newCycle;
              }
              setCount(4);
              return newCycle;
            });
            return 'inhale';
          }
          return prevPhase;
        });
        
        return prevCount - 1;
      });
    }, 1000);
    
    setTimer(intervalId);
  };

  const stopExercise = () => {
    if (timer) {
      clearInterval(timer);
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#1a1d29',
        padding: '40px',
        borderRadius: '16px',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h3>4-7-8 Breathing Exercise</h3>
        
        <div style={{
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: phase === 'inhale' ? '#4caf50' : phase === 'hold' ? '#ff9800' : phase === 'exhale' ? '#2196f3' : '#666',
          margin: '20px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          color: 'white',
          transform: phase === 'inhale' ? 'scale(1.2)' : 'scale(1)',
          transition: 'all 1s ease'
        }}>
          {phase === 'ready' ? '🫁' : count}
        </div>
        
        <p style={{ fontSize: '18px', marginBottom: '20px' }}>
          {phase === 'ready' && 'Click start to begin 4 cycles of breathing'}
          {phase === 'inhale' && 'Breathe In Slowly...'}
          {phase === 'hold' && 'Hold Your Breath...'}
          {phase === 'exhale' && 'Breathe Out Slowly...'}
        </p>
        
        <p style={{ marginBottom: '20px' }}>Cycle: {cycle + 1}/4</p>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {phase === 'ready' ? (
            <button onClick={startExercise} style={{
              background: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              Start Exercise
            </button>
          ) : (
            <button onClick={stopExercise} style={{
              background: '#f44336',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              Stop Exercise
            </button>
          )}
          
          <button onClick={onClose} style={{
            background: '#666',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
