import uuid
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.models.emotion import EmotionAnalysis, MoodEntry, Intervention, DailyCheckin, CrisisAlert, MoodType
from app.services.ai_service import AIService

class EmotionService:
    def __init__(self):
        self.ai_service = AIService()
        # Mock storage (in production, use database)
        self.emotions_db = {}
        self.interventions_db = {}
        self.checkins_db = {}
        self.crisis_alerts_db = {}
        
    async def analyze_text_emotion(self, user_id: str, text: str, platform: str = "general") -> EmotionAnalysis:
        """Analyze emotion from text input"""
        sentiment_result = await self.ai_service.analyze_sentiment(text)
        
        # Determine if intervention is needed
        requires_intervention = (
            sentiment_result['label'] in ['negative', 'stressed'] and 
            sentiment_result['confidence'] > 0.7
        )
        
        analysis = EmotionAnalysis(
            user_id=user_id,
            text=text,
            sentiment_label=sentiment_result['label'],
            confidence=sentiment_result['confidence'],
            mood=MoodType(sentiment_result['label']),
            platform=platform,
            requires_intervention=requires_intervention,
            timestamp=datetime.utcnow()
        )
        
        # Store analysis
        analysis_id = str(uuid.uuid4())
        self.emotions_db[analysis_id] = analysis
        
        return analysis

    async def trigger_intervention(self, user_id: str, emotion_analysis: EmotionAnalysis) -> Intervention:
        """Trigger appropriate intervention based on emotion analysis"""
        interventions = {
            'negative': [
                {
                    'type': 'breathing',
                    'title': 'Calm Your Mind',
                    'description': 'Try the 4-7-8 breathing technique: Inhale for 4, hold for 7, exhale for 8',
                    'duration': '3 minutes',
                    'icon': '🫁'
                },
                {
                    'type': 'cognitive',
                    'title': 'Reframe Your Thoughts',
                    'description': 'Ask yourself: "Is this thought helping me right now? What would I tell a friend?"',
                    'duration': '5 minutes',
                    'icon': '🧠'
                }
            ],
            'stressed': [
                {
                    'type': 'time-management',
                    'title': 'Priority Check',
                    'description': 'List your top 3 priorities for today. Focus on just one at a time.',
                    'duration': '5 minutes',
                    'icon': '📝'
                },
                {
                    'type': 'relaxation',
                    'title': 'Progressive Muscle Relaxation',
                    'description': 'Tense and release each muscle group, starting from your toes',
                    'duration': '10 minutes',
                    'icon': '💪'
                }
            ]
        }
        
        mood_interventions = interventions.get(emotion_analysis.mood.value, interventions['negative'])
        selected_intervention = random.choice(mood_interventions)
        
        intervention = Intervention(
            id=str(uuid.uuid4()),
            user_id=user_id,
            type=selected_intervention['type'],
            title=selected_intervention['title'],
            description=selected_intervention['description'],
            duration=selected_intervention['duration'],
            icon=selected_intervention['icon'],
            trigger_reason=f"Detected {emotion_analysis.mood.value} mood with {emotion_analysis.confidence:.0%} confidence",
            created_at=datetime.utcnow()
        )
        
        self.interventions_db[intervention.id] = intervention
        return intervention

    async def get_user_emotion_history(self, user_id: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get user's emotion history"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        user_emotions = [
            {
                'mood': analysis.mood.value,
                'confidence': analysis.confidence,
                'platform': analysis.platform,
                'timestamp': analysis.timestamp.isoformat()
            }
            for analysis in self.emotions_db.values()
            if analysis.user_id == user_id and analysis.timestamp >= cutoff_date
        ]
        
        return sorted(user_emotions, key=lambda x: x['timestamp'], reverse=True)

    async def generate_user_insights(self, user_id: str) -> Dict[str, Any]:
        """Generate personalized insights for user"""
        user_emotions = [
            analysis for analysis in self.emotions_db.values()
            if analysis.user_id == user_id
        ]
        
        if not user_emotions:
            return {
                'patterns': {},
                'triggers': [],
                'recommendations': ['Start tracking your mood to get personalized insights!']
            }
        
        # Analyze mood patterns
        mood_counts = {}
        for emotion in user_emotions:
            mood = emotion.mood.value
            mood_counts[mood] = mood_counts.get(mood, 0) + 1
        
        # Find triggers
        triggers = {}
        for emotion in user_emotions:
            if emotion.platform != 'general':
                triggers[emotion.platform] = triggers.get(emotion.platform, 0) + 1
        
        # Generate recommendations
        recommendations = []
        if mood_counts.get('negative', 0) > mood_counts.get('positive', 0):
            recommendations.append("Consider incorporating daily mindfulness practices")
        if triggers.get('instagram', 0) > 5:
            recommendations.append("Instagram usage shows correlation with mood changes")
        if mood_counts.get('stressed', 0) > 3:
            recommendations.append("Try time management techniques to reduce stress")
        
        return {
            'patterns': mood_counts,
            'triggers': [{'platform': k, 'count': v} for k, v in triggers.items()],
            'recommendations': recommendations
        }

    async def create_mood_entry(self, mood_data: MoodEntry) -> MoodEntry:
        """Create a manual mood entry"""
        entry_id = str(uuid.uuid4())
        mood_data.timestamp = datetime.utcnow()
        
        # Store in emotions_db as well for consistency
        analysis = EmotionAnalysis(
            user_id=mood_data.user_id,
            text=mood_data.notes or f"Manual mood entry: {mood_data.mood.value}",
            sentiment_label=mood_data.mood.value,
            confidence=0.9,  # High confidence for manual entries
            mood=mood_data.mood,
            platform=mood_data.source,
            requires_intervention=False,
            timestamp=mood_data.timestamp
        )
        
        self.emotions_db[entry_id] = analysis
        return mood_data

    async def get_active_interventions(self, user_id: str) -> List[Intervention]:
        """Get active interventions for user"""
        return [
            intervention for intervention in self.interventions_db.values()
            if intervention.user_id == user_id and not intervention.completed
        ]

    async def complete_intervention(self, intervention_id: str, user_id: str, effectiveness_rating: int) -> Dict[str, Any]:
        """Mark intervention as completed"""
        intervention = self.interventions_db.get(intervention_id)
        if not intervention or intervention.user_id != user_id:
            raise Exception("Intervention not found")
        
        intervention.completed = True
        intervention.completed_at = datetime.utcnow()
        intervention.effectiveness_rating = effectiveness_rating
        
        return {
            'success': True,
            'message': 'Intervention completed successfully',
            'effectiveness_rating': effectiveness_rating
        }

    async def get_wellness_streak(self, user_id: str) -> int:
        """Calculate user's wellness streak"""
        # Mock calculation - in production, this would check daily check-ins
        return random.randint(0, 15)

    async def create_daily_checkin(self, user_id: str, mood_score: int, stress_level: int, sleep_hours: float, notes: Optional[str] = None) -> DailyCheckin:
        """Create daily wellness check-in"""
        checkin = DailyCheckin(
            user_id=user_id,
            date=datetime.utcnow().date(),
            mood_score=mood_score,
            stress_level=stress_level,
            sleep_hours=sleep_hours,
            notes=notes
        )
        
        checkin_id = str(uuid.uuid4())
        self.checkins_db[checkin_id] = checkin
        
        return checkin

    async def trigger_crisis_alert(self, user_id: str, severity: str, description: str, location: Optional[str] = None) -> CrisisAlert:
        """Trigger crisis alert"""
        alert = CrisisAlert(
            id=str(uuid.uuid4()),
            user_id=user_id,
            severity=severity,
            description=description,
            location=location,
            counselor_notified=severity in ['high', 'critical'],
            created_at=datetime.utcnow()
        )
        
        self.crisis_alerts_db[alert.id] = alert
        return alert

    async def get_campus_insights(self, timeframe: str = "week", department: Optional[str] = None) -> Dict[str, Any]:
        """Get campus-wide mental health insights"""
        # Mock campus data
        return {
            'total_students': 12847,
            'active_users': 3421,
            'average_mood_score': 6.8,
            'interventions_triggered': 247,
            'support_sessions': 34,
            'trends': {
                'mood_improving': True,
                'stress_levels': 'moderate',
                'high_risk_areas': ['Library - 3rd Floor', 'Engineering Building']
            },
            'department_breakdown': {
                'computer_science': {'avg_mood': 6.2, 'stress_level': 7.8},
                'engineering': {'avg_mood': 6.5, 'stress_level': 7.5},
                'business': {'avg_mood': 7.1, 'stress_level': 6.2}
            }
        }

    async def get_high_risk_alerts(self) -> List[Dict[str, Any]]:
        """Get high-risk student alerts for counselors"""
        return [
            {
                'id': 'alert_1',
                'location': 'Library - 3rd Floor',
                'students_affected': 8,
                'severity': 'high',
                'type': 'academic_stress',
                'timeframe': 'last_24h'
            },
            {
                'id': 'alert_2',
                'location': 'Student Dormitories',
                'students_affected': 6,
                'severity': 'medium',
                'type': 'social_isolation',
                'timeframe': 'last_12h'
            }
        ]

    async def get_active_user_count(self) -> int:
        """Get number of active users"""
        return len(self.emotions_db)

    async def get_daily_analysis_count(self) -> int:
        """Get number of analyses performed today"""
        today = datetime.utcnow().date()
        return len([
            analysis for analysis in self.emotions_db.values()
            if analysis.timestamp.date() == today
        ])

    async def get_intervention_success_rate(self) -> float:
        """Get intervention success rate"""
        completed_interventions = [
            i for i in self.interventions_db.values() if i.completed
        ]
        if not completed_interventions:
            return 0.0
        
        successful = [
            i for i in completed_interventions 
            if i.effectiveness_rating and i.effectiveness_rating >= 6
        ]
        
        return len(successful) / len(completed_interventions) * 100

    async def store_social_media_analysis(self, user_id: str, analysis: Dict[str, Any]) -> None:
        """Store social media analysis result"""
        # Create emotion analysis from social media data
        emotion_analysis = EmotionAnalysis(
            user_id=user_id,
            text=f"Social media interaction on {analysis.get('platform', 'unknown')}",
            sentiment_label=analysis['sentiment']['label'],
            confidence=analysis['sentiment']['confidence'],
            mood=MoodType(analysis['sentiment']['label']),
            platform=analysis.get('platform', 'social_media'),
            triggers=analysis.get('triggers', []),
            requires_intervention=analysis.get('impact_score', 0) > 0.7,
            timestamp=datetime.utcnow()
        )
        
        analysis_id = str(uuid.uuid4())
        self.emotions_db[analysis_id] = emotion_analysis

    async def check_browsing_distress(self, user_id: str, interaction_data: Dict[str, Any]) -> None:
        """Check for browsing distress patterns"""
        distress_indicators = interaction_data.get('distress_indicators', [])
        
        if len(distress_indicators) >= 2:
            # Trigger intervention for distressed browsing
            intervention = Intervention(
                id=str(uuid.uuid4()),
                user_id=user_id,
                type='break',
                title='Take a Digital Break',
                description='Your browsing patterns suggest you might benefit from a short break',
                duration='15 minutes',
                icon='🌿',
                trigger_reason='Distressed browsing patterns detected',
                created_at=datetime.utcnow()
            )
            
            self.interventions_db[intervention.id] = intervention

    async def get_personalized_resources(self, user_id: str) -> List[Dict[str, Any]]:
        """Get personalized mental health resources"""
        return [
            {
                'title': 'Campus Counseling Center',
                'description': 'Free counseling services for all students',
                'type': 'counseling',
                'contact': '(555) 123-4567',
                'availability': '24/7 crisis line'
            },
            {
                'title': 'Mindfulness Meditation Guide',
                'description': 'Learn meditation techniques for stress reduction',
                'type': 'self_help',
                'url': 'https://example.com/mindfulness',
                'duration': '10-20 minutes daily'
            },
            {
                'title': 'Study Skills Workshop',
                'description': 'Improve time management and reduce academic stress',
                'type': 'workshop',
                'schedule': 'Fridays 3-4 PM',
                'location': 'Student Center Room 201'
            }
        ]

    async def get_campus_mental_health_services(self) -> List[Dict[str, Any]]:
        """Get available campus mental health services"""
        return [
            {
                'name': 'Counseling and Psychological Services',
                'description': 'Individual and group therapy, crisis intervention',
                'phone': '(555) 123-4567',
                'email': 'counseling@university.edu',
                'hours': 'Mon-Fri 8AM-5PM',
                'emergency': '24/7 crisis hotline available'
            },
            {
                'name': 'Peer Support Groups',
                'description': 'Student-led support groups for various challenges',
                'contact': 'peersupport@university.edu',
                'meetings': 'Various times throughout the week'
            },
            {
                'name': 'Academic Success Center',
                'description': 'Study skills, time management, stress reduction',
                'phone': '(555) 123-4568',
                'location': 'Library Building, 2nd Floor'
            }
        ]

    async def export_anonymized_data(self, start_date: datetime, end_date: datetime, data_type: str) -> Dict[str, Any]:
        """Export anonymized data for research"""
        # Filter data by date range
        filtered_data = [
            analysis for analysis in self.emotions_db.values()
            if start_date <= analysis.timestamp <= end_date
        ]
        
        # Anonymize data
        anonymized_data = []
        for analysis in filtered_data:
            anonymized_data.append({
                'mood': analysis.mood.value,
                'confidence': analysis.confidence,
                'platform': analysis.platform,
                'timestamp': analysis.timestamp.isoformat(),
                'requires_intervention': analysis.requires_intervention
                # Note: user_id and text are NOT included for privacy
            })
        
        return {
            'data_type': data_type,
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            },
            'total_records': len(anonymized_data),
            'data': anonymized_data
        }