from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class MoodType(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"
    STRESSED = "stressed"

class EmotionAnalysis(BaseModel):
    user_id: str
    text: str
    sentiment_label: str
    confidence: float
    mood: MoodType
    platform: Optional[str] = "general"
    triggers: List[str] = []
    requires_intervention: bool = False
    timestamp: datetime = datetime.now()

class MoodEntry(BaseModel):
    user_id: Optional[str] = None
    mood: MoodType
    intensity: Optional[int] = 5  # 1-10 scale
    notes: Optional[str] = None
    timestamp: datetime = datetime.now()
    source: str = "manual"  # manual, ai_analysis, quick_check

class Intervention(BaseModel):
    id: str
    user_id: str
    type: str  # breathing, mindfulness, movement, etc.
    title: str
    description: str
    duration: str
    icon: str
    trigger_reason: str
    effectiveness_rating: Optional[int] = None
    completed: bool = False
    created_at: datetime = datetime.now()
    completed_at: Optional[datetime] = None

class DailyCheckin(BaseModel):
    user_id: str
    date: datetime
    mood_score: int  # 1-10
    stress_level: int  # 1-10
    sleep_hours: float
    notes: Optional[str] = None
    
class CrisisAlert(BaseModel):
    id: str
    user_id: str
    severity: str  # low, medium, high, critical
    description: str
    location: Optional[str] = None
    resolved: bool = False
    counselor_notified: bool = False
    created_at: datetime = datetime.now()
    resolved_at: Optional[datetime] = None