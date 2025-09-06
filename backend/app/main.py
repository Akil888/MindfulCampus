from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
import json
import asyncio
from datetime import datetime, timedelta
import uuid
import logging
from contextlib import asynccontextmanager


# Import custom modules
from app.models.user import User, UserCreate, UserResponse
from app.models.emotion import EmotionAnalysis, MoodEntry, Intervention
from app.models.peer_support import PeerMatch, SupportGroup, Message
from app.services.ai_service import AIService
from app.services.auth_service import AuthService
from app.services.emotion_service import EmotionService
from app.services.peer_service import PeerSupportService
from app.utils.websocket_manager import WebSocketManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global instances
ai_service = AIService()
auth_service = AuthService()
emotion_service = EmotionService()
peer_service = PeerSupportService()
websocket_manager = WebSocketManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting MindfulCampus API...")
    await ai_service.initialize()
    logger.info("AI models loaded successfully")
    yield
    # Shutdown
    logger.info("Shutting down MindfulCampus API...")

app = FastAPI(
    title="MindfulCampus API",
    description="AI-powered mental wellness ecosystem for students",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        user = await auth_service.verify_token(credentials.credentials)
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0",
        "services": {
            "ai_service": ai_service.is_ready(),
            "emotion_service": True,
            "peer_service": True
        }
    }

# Authentication endpoints
@app.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    try:
        user = await auth_service.create_user(user_data)
        return user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/login")
async def login(email: str, password: str):
    try:
        result = await auth_service.authenticate_user(email, password)
        return result
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/auth/refresh")
async def refresh_token(refresh_token: str):
    try:
        result = await auth_service.refresh_access_token(refresh_token)
        return result
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# Emotion analysis endpoints
@app.post("/emotions/analyze")
async def analyze_emotion(
    text: str,
    platform: str = "general",
    current_user: User = Depends(get_current_user)
):
    try:
        analysis = await emotion_service.analyze_text_emotion(
            user_id=current_user.id,
            text=text,
            platform=platform
        )
        
        # Trigger intervention if needed
        if analysis.requires_intervention:
            intervention = await emotion_service.trigger_intervention(
                user_id=current_user.id,
                emotion_analysis=analysis
            )
            # Send real-time notification via WebSocket
            await websocket_manager.send_to_user(
                current_user.id,
                {
                    "type": "intervention",
                    "data": intervention.dict()
                }
            )
        
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/emotions/history")
async def get_emotion_history(
    days: int = 30,
    current_user: User = Depends(get_current_user)
):
    try:
        history = await emotion_service.get_user_emotion_history(
            user_id=current_user.id,
            days=days
        )
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/emotions/insights")
async def get_emotion_insights(current_user: User = Depends(get_current_user)):
    try:
        insights = await emotion_service.generate_user_insights(current_user.id)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/emotions/mood-entry")
async def create_mood_entry(
    mood_data: MoodEntry,
    current_user: User = Depends(get_current_user)
):
    try:
        mood_data.user_id = current_user.id
        entry = await emotion_service.create_mood_entry(mood_data)
        return entry
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Peer support endpoints
@app.get("/peer-support/matches")
async def get_peer_matches(current_user: User = Depends(get_current_user)):
    try:
        matches = await peer_service.find_peer_matches(current_user.id)
        return matches
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/peer-support/connect")
async def connect_with_peer(
    peer_id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        connection = await peer_service.create_peer_connection(
            current_user.id,
            peer_id
        )
        return connection
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/peer-support/groups")
async def get_support_groups(current_user: User = Depends(get_current_user)):
    try:
        groups = await peer_service.get_available_support_groups(current_user.id)
        return groups
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/peer-support/groups/{group_id}/join")
async def join_support_group(
    group_id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        result = await peer_service.join_support_group(current_user.id, group_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/peer-support/messages/{peer_id}")
async def get_peer_messages(
    peer_id: str,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    try:
        messages = await peer_service.get_peer_messages(
            current_user.id,
            peer_id,
            limit
        )
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Campus insights endpoints (for counselors/administrators)
@app.get("/campus/insights")
async def get_campus_insights(
    timeframe: str = "week",
    department: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    try:
        # Check if user has permission to view campus insights
        if not current_user.is_counselor and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        insights = await emotion_service.get_campus_insights(
            timeframe=timeframe,
            department=department
        )
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/campus/risk-alerts")
async def get_risk_alerts(current_user: User = Depends(get_current_user)):
    try:
        if not current_user.is_counselor and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        alerts = await emotion_service.get_high_risk_alerts()
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket endpoints for real-time features
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket_manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle different message types
            if message_data.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
            elif message_data.get("type") == "peer_message":
                # Handle peer-to-peer messaging
                await peer_service.send_peer_message(
                    sender_id=user_id,
                    recipient_id=message_data.get("recipient_id"),
                    content=message_data.get("content")
                )
            
    except WebSocketDisconnect:
        await websocket_manager.disconnect(user_id)

# Intervention endpoints
@app.get("/interventions/active")
async def get_active_interventions(current_user: User = Depends(get_current_user)):
    try:
        interventions = await emotion_service.get_active_interventions(current_user.id)
        return interventions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/interventions/{intervention_id}/complete")
async def complete_intervention(
    intervention_id: str,
    effectiveness_rating: int = Field(..., ge=1, le=10),
    current_user: User = Depends(get_current_user)
):
    try:
        result = await emotion_service.complete_intervention(
            intervention_id=intervention_id,
            user_id=current_user.id,
            effectiveness_rating=effectiveness_rating
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Wellness tracking endpoints
@app.get("/wellness/streak")
async def get_wellness_streak(current_user: User = Depends(get_current_user)):
    try:
        streak = await emotion_service.get_wellness_streak(current_user.id)
        return {"streak_days": streak}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/wellness/daily-checkin")
async def daily_wellness_checkin(
    mood_score: int,
    stress_level: int,
    sleep_hours: float,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    # Validate inputs
    if mood_score < 1 or mood_score > 10:
        raise HTTPException(status_code=400, detail="Mood score must be between 1 and 10")
    if stress_level < 1 or stress_level > 10:
        raise HTTPException(status_code=400, detail="Stress level must be between 1 and 10")
    if sleep_hours < 0 or sleep_hours > 24:
        raise HTTPException(status_code=400, detail="Sleep hours must be between 0 and 24")
    
    try:
        checkin = await emotion_service.create_daily_checkin(
            user_id=current_user.id,
            mood_score=mood_score,
            stress_level=stress_level,
            sleep_hours=sleep_hours,
            notes=notes
        )
        return checkin
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Analytics endpoints
@app.get("/analytics/typing-patterns")
async def analyze_typing_patterns(
    keystroke_data: List[Dict[str, Any]],
    current_user: User = Depends(get_current_user)
):
    try:
        analysis = await ai_service.analyze_typing_patterns(keystroke_data)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/social-media-impact")
async def get_social_media_impact(
    platform: Optional[str] = None,
    days: int = 30,
    current_user: User = Depends(get_current_user)
):
    try:
        impact_analysis = await emotion_service.analyze_social_media_impact(
            user_id=current_user.id,
            platform=platform,
            days=days
        )
        return impact_analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Crisis intervention endpoints
@app.post("/crisis/alert")
async def trigger_crisis_alert(
    severity: str = Field(..., regex="^(low|medium|high|critical)$"),
    description: str,
    location: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    try:
        alert = await emotion_service.trigger_crisis_alert(
            user_id=current_user.id,
            severity=severity,
            description=description,
            location=location
        )
        
        # Immediately notify counseling services for high/critical alerts
        if severity in ["high", "critical"]:
            await websocket_manager.broadcast_to_counselors({
                "type": "crisis_alert",
                "data": alert.dict(),
                "timestamp": datetime.utcnow().isoformat()
            })
        
        return alert
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Resource endpoints
@app.get("/resources/recommendations")
async def get_personalized_resources(current_user: User = Depends(get_current_user)):
    try:
        resources = await emotion_service.get_personalized_resources(current_user.id)
        return resources
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/resources/campus-services")
async def get_campus_services():
    try:
        services = await emotion_service.get_campus_mental_health_services()
        return services
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Browser extension endpoints
@app.post("/extension/social-media-analysis")
async def analyze_social_media_content(
    url: str,
    content: str,
    platform: str,
    interaction_time: float,
    current_user: User = Depends(get_current_user)
):
    try:
        analysis = await ai_service.analyze_social_media_content(
            url=url,
            content=content,
            platform=platform,
            interaction_time=interaction_time
        )
        
        # Store the analysis for the user
        await emotion_service.store_social_media_analysis(
            user_id=current_user.id,
            analysis=analysis
        )
        
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extension/page-interaction")
async def track_page_interaction(
    url: str,
    time_spent: float,
    scroll_pattern: List[float],
    click_pattern: List[Dict[str, Any]],
    current_user: User = Depends(get_current_user)
):
    try:
        interaction_analysis = await ai_service.analyze_page_interaction(
            url=url,
            time_spent=time_spent,
            scroll_pattern=scroll_pattern,
            click_pattern=click_pattern
        )
        
        # Check for signs of distress in browsing patterns
        if interaction_analysis.get("distress_indicators", []):
            await emotion_service.check_browsing_distress(
                user_id=current_user.id,
                interaction_data=interaction_analysis
            )
        
        return interaction_analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Admin endpoints
@app.get("/admin/system-health")
async def get_system_health(current_user: User = Depends(get_current_user)):
    try:
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        health_data = {
            "active_users": await emotion_service.get_active_user_count(),
            "daily_analyses": await emotion_service.get_daily_analysis_count(),
            "intervention_success_rate": await emotion_service.get_intervention_success_rate(),
            "system_load": await ai_service.get_system_load(),
            "database_status": "healthy",  # Would check actual DB status
            "ai_model_status": ai_service.get_model_status()
        }
        
        return health_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/bulk-notification")
async def send_bulk_notification(
    message: str,
    target_group: str = "all",  # all, at_risk, counselors
    current_user: User = Depends(get_current_user)
):
    try:
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        result = await websocket_manager.send_bulk_notification(
            message=message,
            target_group=target_group
        )
        
        return {"sent_to": result["count"], "message": "Notification sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Data export endpoints (for research, with proper anonymization)
@app.get("/export/anonymized-data")
async def export_anonymized_data(
    start_date: datetime,
    end_date: datetime,
    data_type: str = "mood_trends",
    current_user: User = Depends(get_current_user)
):
    try:
        if not current_user.is_admin and not current_user.is_researcher:
            raise HTTPException(status_code=403, detail="Research access required")
        
        anonymized_data = await emotion_service.export_anonymized_data(
            start_date=start_date,
            end_date=end_date,
            data_type=data_type
        )
        
        return anonymized_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {"error": "Endpoint not found", "status_code": 404}

@app.exception_handler(500)
async def server_error_handler(request, exc):
    logger.error(f"Server error: {str(exc)}")
    return {"error": "Internal server error", "status_code": 500}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )