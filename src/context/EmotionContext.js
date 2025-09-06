import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { analyzeSentiment } from '../services/aiService';

const EmotionContext = createContext();

const initialState = {
  currentMood: 'neutral',
  moodHistory: [],
  interventions: [],
  wellnessStreak: 0,
  socialMediaActivity: [],
  isAnalyzing: false,
  insights: {
    triggers: [],
    patterns: {},
    recommendations: []
  }
};

const emotionReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_MOOD':
      return {
        ...state,
        currentMood: action.payload,
        moodHistory: [
          ...state.moodHistory,
          { mood: action.payload, timestamp: new Date().toISOString() }
        ].slice(-50) // Keep last 50 entries
      };
    
    case 'ADD_INTERVENTION':
      return {
        ...state,
        interventions: [action.payload, ...state.interventions].slice(0, 20)
      };
    
    case 'UPDATE_WELLNESS_STREAK':
      return {
        ...state,
        wellnessStreak: action.payload
      };
    
    case 'ADD_SOCIAL_ACTIVITY':
      return {
        ...state,
        socialMediaActivity: [
          action.payload,
          ...state.socialMediaActivity
        ].slice(0, 100) // Keep last 100 activities
      };
    
    case 'SET_ANALYZING':
      return {
        ...state,
        isAnalyzing: action.payload
      };
    
    case 'UPDATE_INSIGHTS':
      return {
        ...state,
        insights: action.payload
      };
    
    case 'LOAD_STATE':
      return {
        ...state,
        ...action.payload
      };
    
    default:
      return state;
  }
};

export const EmotionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(emotionReducer, initialState);

  // Load saved state on initialization
  useEffect(() => {
    const savedState = localStorage.getItem('mindfulcampus_emotion_state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'LOAD_STATE', payload: parsedState });
      } catch (error) {
        console.error('Failed to load emotion state:', error);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('mindfulcampus_emotion_state', JSON.stringify(state));
  }, [state]);

  const analyzeMood = async (text) => {
    dispatch({ type: 'SET_ANALYZING', payload: true });
    
    try {
      const sentiment = await analyzeSentiment(text);
      const mood = sentiment.label.toLowerCase();
      
      dispatch({ type: 'SET_CURRENT_MOOD', payload: mood });
      
      // Trigger intervention if negative mood detected
      if (mood === 'negative' && Math.random() > 0.3) {
        triggerIntervention(mood);
      }
      
      return sentiment;
    } catch (error) {
      console.error('Failed to analyze mood:', error);
      return null;
    } finally {
      dispatch({ type: 'SET_ANALYZING', payload: false });
    }
  };

  const triggerIntervention = (mood) => {
    const interventions = {
      negative: [
        {
          type: 'breathing',
          title: 'Take a Deep Breath',
          description: 'Try the 4-7-8 breathing technique to calm your mind',
          duration: '2 minutes',
          icon: '🫁'
        },
        {
          type: 'movement',
          title: 'Quick Stretch',
          description: 'Stand up and do some gentle stretches',
          duration: '3 minutes',
          icon: '🤸‍♀️'
        },
        {
          type: 'positive',
          title: 'Positive Affirmation',
          description: 'Remind yourself: "This feeling is temporary, and I am resilient"',
          duration: '1 minute',
          icon: '💝'
        }
      ],
      stressed: [
        {
          type: 'meditation',
          title: 'Mini Meditation',
          description: 'Focus on your breath for just 5 minutes',
          duration: '5 minutes',
          icon: '🧘‍♀️'
        },
        {
          type: 'nature',
          title: 'Look Outside',
          description: 'Take a moment to observe nature or look out a window',
          duration: '2 minutes',
          icon: '🌿'
        }
      ]
    };

    const availableInterventions = interventions[mood] || interventions.negative;
    const intervention = availableInterventions[Math.floor(Math.random() * availableInterventions.length)];
    
    dispatch({
      type: 'ADD_INTERVENTION',
      payload: {
        ...intervention,
        timestamp: new Date().toISOString(),
        id: Date.now()
      }
    });
  };

  const addSocialActivity = (activity) => {
    dispatch({
      type: 'ADD_SOCIAL_ACTIVITY',
      payload: {
        ...activity,
        timestamp: new Date().toISOString(),
        id: Date.now()
      }
    });
  };

  const updateWellnessStreak = (streak) => {
    dispatch({ type: 'UPDATE_WELLNESS_STREAK', payload: streak });
  };

  const generateInsights = () => {
    const { moodHistory, socialMediaActivity } = state;
    
    // Analyze mood patterns
    const moodCounts = moodHistory.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    // Find triggers
    const triggers = socialMediaActivity
      .filter(activity => activity.sentiment === 'negative')
      .map(activity => activity.platform)
      .reduce((acc, platform) => {
        acc[platform] = (acc[platform] || 0) + 1;
        return acc;
      }, {});

    // Generate recommendations
    const recommendations = [];
    if (moodCounts.negative > moodCounts.positive) {
      recommendations.push("Consider limiting social media during evening hours");
      recommendations.push("Try incorporating 10 minutes of daily meditation");
    }
    if (triggers.instagram > 5) {
      recommendations.push("Instagram usage shows correlation with negative mood");
    }

    const insights = {
      triggers: Object.entries(triggers).map(([platform, count]) => ({ platform, count })),
      patterns: moodCounts,
      recommendations
    };

    dispatch({ type: 'UPDATE_INSIGHTS', payload: insights });
    return insights;
  };

  const contextValue = {
    ...state,
    analyzeMood,
    addSocialActivity,
    updateWellnessStreak,
    generateInsights,
    triggerIntervention
  };

  return (
    <EmotionContext.Provider value={contextValue}>
      {children}
    </EmotionContext.Provider>
  );
};

export const useEmotion = () => {
  const context = useContext(EmotionContext);
  if (!context) {
    throw new Error('useEmotion must be used within an EmotionProvider');
  }
  return context;
};