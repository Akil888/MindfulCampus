import * as tf from '@tensorflow/tfjs';

let sentimentModel = null;
let isModelLoaded = false;

// Mock sentiment analysis using TensorFlow.js patterns
// In a real implementation, you'd load a pre-trained model
export const initializeAI = async () => {
  try {
    console.log('Initializing AI models...');
    
    // Simulate model loading time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a simple mock model for demonstration
    sentimentModel = {
      predict: (text) => {
        // Simple keyword-based sentiment analysis for demo
        const positiveWords = ['good', 'great', 'happy', 'love', 'awesome', 'amazing', 'excellent', 'wonderful', 'fantastic', 'perfect', 'best', 'better', 'beautiful', 'brilliant', 'cheerful', 'delighted', 'excited', 'grateful', 'hopeful', 'inspired', 'joyful', 'optimistic', 'pleased', 'satisfied', 'thrilled'];
        const negativeWords = ['bad', 'sad', 'hate', 'terrible', 'awful', 'horrible', 'worst', 'angry', 'depressed', 'anxious', 'stressed', 'worried', 'frustrated', 'disappointed', 'upset', 'miserable', 'devastated', 'heartbroken', 'lonely', 'overwhelmed', 'exhausted', 'hopeless', 'discouraged', 'bitter', 'resentful'];
        const stressWords = ['exam', 'test', 'deadline', 'assignment', 'project', 'study', 'finals', 'midterm', 'homework', 'workload', 'pressure', 'busy', 'overwhelmed', 'stressed', 'tired', 'exhausted', 'rush', 'panic', 'behind', 'late'];
        
        const words = text.toLowerCase().split(' ');
        let positiveScore = 0;
        let negativeScore = 0;
        let stressScore = 0;
        
        words.forEach(word => {
          if (positiveWords.includes(word)) positiveScore++;
          if (negativeWords.includes(word)) negativeScore++;
          if (stressWords.includes(word)) stressScore++;
        });
        
        // Determine primary sentiment
        if (stressScore > 0 && stressScore >= positiveScore) {
          return { label: 'Stressed', confidence: Math.min(0.7 + stressScore * 0.1, 0.95) };
        } else if (negativeScore > positiveScore) {
          return { label: 'Negative', confidence: Math.min(0.6 + negativeScore * 0.1, 0.95) };
        } else if (positiveScore > negativeScore) {
          return { label: 'Positive', confidence: Math.min(0.6 + positiveScore * 0.1, 0.95) };
        } else {
          return { label: 'Neutral', confidence: 0.5 };
        }
      }
    };
    
    isModelLoaded = true;
    console.log('AI models loaded successfully');
    
  } catch (error) {
    console.error('Failed to initialize AI models:', error);
    throw error;
  }
};

export const analyzeSentiment = async (text) => {
  if (!isModelLoaded || !sentimentModel) {
    throw new Error('AI models not initialized');
  }
  
  try {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const result = sentimentModel.predict(text);
    
    return {
      label: result.label,
      confidence: result.confidence,
      text: text,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Sentiment analysis failed:', error);
    throw error;
  }
};

export const analyzeTypingPatterns = (keystrokes) => {
  // Analyze typing speed, pauses, and patterns
  const avgSpeed = keystrokes.length > 0 ? 
    keystrokes.reduce((sum, k) => sum + (k.speed || 0), 0) / keystrokes.length : 0;
  
  const longPauses = keystrokes.filter(k => k.pause > 2000).length;
  const rapidTyping = keystrokes.filter(k => k.speed > 5).length;
  
  let emotionalState = 'neutral';
  let confidence = 0.5;
  
  if (longPauses > 3) {
    emotionalState = 'contemplative';
    confidence = 0.7;
  } else if (rapidTyping > 5) {
    emotionalState = 'agitated';
    confidence = 0.8;
  } else if (avgSpeed < 2) {
    emotionalState = 'tired';
    confidence = 0.6;
  }
  
  return {
    emotionalState,
    confidence,
    metrics: {
      averageSpeed: avgSpeed,
      longPauses,
      rapidTyping,
      totalKeystrokes: keystrokes.length
    }
  };
};

export const generatePersonalizedIntervention = (mood, userPreferences = {}) => {
  const interventions = {
    negative: [
      {
        type: 'breathing',
        title: 'Calm Your Mind',
        description: 'Try the 4-7-8 breathing technique: Inhale for 4, hold for 7, exhale for 8',
        duration: '3 minutes',
        effectiveness: 0.85
      },
      {
        type: 'cognitive',
        title: 'Reframe Your Thoughts',
        description: 'Ask yourself: "Is this thought helping me right now? What would I tell a friend?"',
        duration: '5 minutes',
        effectiveness: 0.75
      },
      {
        type: 'physical',
        title: 'Take a Walk',
        description: 'A short walk can shift your perspective and boost your mood',
        duration: '10 minutes',
        effectiveness: 0.80
      }
    ],
    stressed: [
      {
        type: 'time-management',
        title: 'Priority Check',
        description: 'List your top 3 priorities for today. Focus on just one at a time.',
        duration: '5 minutes',
        effectiveness: 0.90
      },
      {
        type: 'relaxation',
        title: 'Progressive Muscle Relaxation',
        description: 'Tense and release each muscle group, starting from your toes',
        duration: '10 minutes',
        effectiveness: 0.85
      }
    ],
    anxious: [
      {
        type: 'grounding',
        title: '5-4-3-2-1 Technique',
        description: 'Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste',
        duration: '3 minutes',
        effectiveness: 0.88
      }
    ]
  };
  
  const moodInterventions = interventions[mood.toLowerCase()] || interventions.negative;
  
  // Personalize based on user preferences
  if (userPreferences.preferredDuration) {
    return moodInterventions.filter(i => 
      parseInt(i.duration) <= userPreferences.preferredDuration
    );
  }
  
  return moodInterventions;
};

export const predictMoodTrend = (moodHistory) => {
  if (moodHistory.length < 7) {
    return { trend: 'insufficient_data', confidence: 0 };
  }
  
  // Simple trend analysis based on recent mood patterns
  const recentMoods = moodHistory.slice(-7);
  const moodScores = recentMoods.map(entry => {
    switch (entry.mood) {
      case 'positive': return 2;
      case 'neutral': return 1;
      case 'negative': return -1;
      case 'stressed': return -2;
      default: return 0;
    }
  });
  
  const averageScore = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
  const trend = averageScore > 0.5 ? 'improving' : averageScore < -0.5 ? 'declining' : 'stable';
  
  // Calculate trend strength
  const variance = moodScores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / moodScores.length;
  const confidence = Math.min(Math.abs(averageScore) + (1 / (1 + variance)), 0.95);
  
  return {
    trend,
    confidence,
    averageScore,
    recommendation: generateTrendRecommendation(trend, averageScore)
  };
};

const generateTrendRecommendation = (trend, score) => {
  if (trend === 'declining') {
    return {
      message: "Your mood has been trending downward. Consider reaching out to campus counseling services.",
      priority: 'high',
      actions: ['Schedule counseling appointment', 'Connect with peer support', 'Practice daily mindfulness']
    };
  } else if (trend === 'improving') {
    return {
      message: "Great progress! Keep up the positive momentum with your current wellness practices.",
      priority: 'low',
      actions: ['Maintain current routine', 'Share success with support network', 'Set new wellness goals']
    };
  } else {
    return {
      message: "Your mood has been stable. Consider adding new wellness activities to boost your mental health.",
      priority: 'medium',
      actions: ['Try new stress management techniques', 'Join a support group', 'Increase physical activity']
    };
  }
};