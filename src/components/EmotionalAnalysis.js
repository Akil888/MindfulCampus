import React, { useState } from 'react';

const EmotionalAnalysis = () => {
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeEmotion = () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const text = inputText.toLowerCase();
      let emotion, confidence, intervention = null;
      
      // Improved keyword analysis
      if (text.includes('angry') || text.includes('mad') || text.includes('furious') || text.includes('pissed')) {
        emotion = 'Angry';
        confidence = 88;
        intervention = {
          type: 'Anger Management',
          message: 'Take 10 deep breaths and count to 10. Consider what you can control vs. what you cannot.',
          duration: '5 minutes'
        };
      } else if (text.includes('stress') || text.includes('overwhelmed') || text.includes('anxious')) {
        emotion = 'Stressed/Anxious';
        confidence = 85;
        intervention = {
          type: 'Breathing Exercise',
          message: 'Try the 4-7-8 breathing technique: Inhale for 4, hold for 7, exhale for 8',
          duration: '3 minutes'
        };
      } else if (text.includes('sad') || text.includes('depressed') || text.includes('down')) {
        emotion = 'Sad';
        confidence = 82;
        intervention = {
          type: 'Mood Boost',
          message: 'Try reaching out to a friend or doing an activity you enjoy. Consider some light exercise.',
          duration: '10 minutes'
        };
      } else if (text.includes('happy') || text.includes('great') || text.includes('good') || text.includes('excited')) {
        emotion = 'Positive';
        confidence = 90;
      } else {
        emotion = 'Neutral';
        confidence = 65;
      }
      
      setAnalysis({ emotion, confidence, intervention });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1>Emotional Analysis Lab</h1>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type how you're feeling... Try: 'I'm angry about my subject marks' or 'I'm stressed about finals'"
          style={{
            width: '100%',
            height: '120px',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '16px',
            marginBottom: '20px'
          }}
        />
        <button 
          onClick={analyzeEmotion}
          disabled={isAnalyzing || !inputText.trim()}
          style={{
            background: isAnalyzing ? '#666' : '#667eea',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: isAnalyzing ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Emotion'}
        </button>
        
        {analysis && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            background: analysis.emotion.includes('Positive') ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)',
            border: `1px solid ${analysis.emotion.includes('Positive') ? 'rgba(76,175,80,0.3)' : 'rgba(244,67,54,0.3)'}`,
            borderRadius: '8px'
          }}>
            <h3>Analysis Result:</h3>
            <p><strong>Emotion:</strong> {analysis.emotion}</p>
            <p><strong>Confidence:</strong> {analysis.confidence}%</p>
            
            {analysis.intervention && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: 'rgba(102,126,234,0.1)',
                borderRadius: '6px'
              }}>
                <h4>Recommended Intervention:</h4>
                <p><strong>{analysis.intervention.type}</strong></p>
                <p>{analysis.intervention.message}</p>
                <small>Duration: {analysis.intervention.duration}</small>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionalAnalysis;
