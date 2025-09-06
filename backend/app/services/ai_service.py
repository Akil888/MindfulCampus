import asyncio
from typing import Dict, List, Any
import logging
import random
from datetime import datetime

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.models_loaded = False
        self.emotion_keywords = {
            'positive': ['happy', 'excited', 'grateful', 'amazing', 'wonderful', 'love', 'blessed', 'fantastic', 'awesome', 'great'],
            'negative': ['sad', 'depressed', 'anxious', 'worried', 'stressed', 'hate', 'terrible', 'awful', 'horrible', 'devastated'],
            'stress': ['overwhelmed', 'pressure', 'deadline', 'exam', 'finals', 'study', 'homework', 'project', 'assignment', 'busy']
        }

    async def initialize(self):
        """Initialize AI models (simulated for demo)"""
        logger.info("Initializing AI models...")
        # Simulate model loading time
        await asyncio.sleep(2)
        self.models_loaded = True
        logger.info("AI models loaded successfully")

    def is_ready(self) -> bool:
        return self.models_loaded

    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text"""
        if not self.models_loaded:
            raise Exception("AI models not loaded")

        # Simple keyword-based analysis for demo
        words = text.lower().split()
        
        positive_score = sum(1 for word in words if word in self.emotion_keywords['positive'])
        negative_score = sum(1 for word in words if word in self.emotion_keywords['negative'])
        stress_score = sum(1 for word in words if word in self.emotion_keywords['stress'])
        
        # Determine sentiment
        if stress_score > 0 and stress_score >= positive_score:
            label = 'stressed'
            confidence = min(0.7 + stress_score * 0.1, 0.95)
        elif negative_score > positive_score:
            label = 'negative'
            confidence = min(0.6 + negative_score * 0.1, 0.95)
        elif positive_score > negative_score:
            label = 'positive'
            confidence = min(0.6 + positive_score * 0.1, 0.95)
        else:
            label = 'neutral'
            confidence = 0.5

        return {
            'label': label,
            'confidence': confidence,
            'scores': {
                'positive': positive_score,
                'negative': negative_score,
                'stress': stress_score
            }
        }

    async def analyze_typing_patterns(self, keystroke_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze typing patterns for emotional indicators"""
        if not keystroke_data:
            return {'emotional_state': 'neutral', 'confidence': 0.5}

        avg_speed = sum(k.get('speed', 0) for k in keystroke_data) / len(keystroke_data)
        long_pauses = len([k for k in keystroke_data if k.get('pause', 0) > 2000])
        rapid_typing = len([k for k in keystroke_data if k.get('speed', 0) > 5])

        emotional_state = 'neutral'
        confidence = 0.5

        if long_pauses > 3:
            emotional_state = 'contemplative'
            confidence = 0.7
        elif rapid_typing > 5:
            emotional_state = 'agitated'
            confidence = 0.8
        elif avg_speed < 2:
            emotional_state = 'tired'
            confidence = 0.6

        return {
            'emotional_state': emotional_state,
            'confidence': confidence,
            'metrics': {
                'average_speed': avg_speed,
                'long_pauses': long_pauses,
                'rapid_typing': rapid_typing
            }
        }

    async def analyze_social_media_content(self, url: str, content: str, platform: str, interaction_time: float) -> Dict[str, Any]:
        """Analyze social media content for emotional impact"""
        sentiment = await self.analyze_sentiment(content)
        
        # Simulate content impact analysis
        impact_score = random.uniform(0.3, 0.9)
        if sentiment['label'] == 'negative':
            impact_score += 0.2
        
        triggers = []
        if 'exam' in content.lower() or 'test' in content.lower():
            triggers.append('academic_stress')
        if 'lonely' in content.lower() or 'alone' in content.lower():
            triggers.append('social_isolation')

        return {
            'sentiment': sentiment,
            'impact_score': min(impact_score, 1.0),
            'triggers': triggers,
            'recommendation': self._get_content_recommendation(sentiment['label']),
            'platform': platform,
            'interaction_time': interaction_time
        }

    async def analyze_page_interaction(self, url: str, time_spent: float, scroll_pattern: List[float], click_pattern: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze page interaction patterns"""
        distress_indicators = []
        
        # Rapid scrolling pattern
        if len(scroll_pattern) > 10 and time_spent < 300:  # Many scrolls in 5 minutes
            distress_indicators.append('rapid_scrolling')
        
        # Excessive clicking
        if len(click_pattern) > 20 and time_spent < 300:
            distress_indicators.append('excessive_clicking')
        
        # Long session time
        if time_spent > 7200:  # 2 hours
            distress_indicators.append('excessive_usage')

        return {
            'distress_indicators': distress_indicators,
            'engagement_score': min(time_spent / 1800, 1.0),  # Normalize to 30 minutes
            'interaction_intensity': len(click_pattern) / max(time_spent / 60, 1),  # Clicks per minute
            'recommendations': self._get_usage_recommendations(distress_indicators)
        }

    def _get_content_recommendation(self, sentiment: str) -> str:
        recommendations = {
            'negative': 'Consider taking a break from social media and try a breathing exercise.',
            'stressed': 'This content might be adding to your stress. Would you like to see some calming content instead?',
            'positive': 'Great to see positive content! Keep engaging with uplifting posts.',
            'neutral': 'Balance is key. Mix positive content with your current browsing.'
        }
        return recommendations.get(sentiment, 'Stay mindful of how content affects your mood.')

    def _get_usage_recommendations(self, indicators: List[str]) -> List[str]:
        recommendations = []
        if 'rapid_scrolling' in indicators:
            recommendations.append('Try slowing down your browsing pace')
        if 'excessive_clicking' in indicators:
            recommendations.append('Take breaks between interactions')
        if 'excessive_usage' in indicators:
            recommendations.append('Consider setting usage limits')
        return recommendations

    async def get_system_load(self) -> Dict[str, Any]:
        """Get current system load metrics"""
        return {
            'cpu_usage': random.uniform(20, 80),
            'memory_usage': random.uniform(30, 70),
            'active_analyses': random.randint(50, 200),
            'queue_length': random.randint(0, 10)
        }

    def get_model_status(self) -> Dict[str, str]:
        """Get status of AI models"""
        return {
            'sentiment_model': 'healthy' if self.models_loaded else 'loading',
            'typing_analysis': 'healthy' if self.models_loaded else 'loading',
            'pattern_recognition': 'healthy' if self.models_loaded else 'loading'
        }