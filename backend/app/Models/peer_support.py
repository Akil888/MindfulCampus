from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PeerMatch(BaseModel):
    id: str
    user1_id: str
    user2_id: str
    compatibility_score: float
    shared_challenges: List[str]
    status: str  # pending, active, inactive
    created_at: datetime = datetime.now()

class SupportGroup(BaseModel):
    id: str
    name: str
    description: str
    category: str  # academic, social, wellness, etc.
    max_members: int = 50
    current_members: int = 0
    is_active: bool = True
    created_at: datetime = datetime.now()
    moderator_id: Optional[str] = None

class Message(BaseModel):
    id: str
    sender_id: str
    recipient_id: Optional[str] = None  # None for group messages
    group_id: Optional[str] = None
    content: str
    message_type: str = "text"  # text, image, intervention_share
    is_anonymous: bool = True
    sent_at: datetime = datetime.now()
    read_at: Optional[datetime] = None

class PeerConnection(BaseModel):
    id: str
    requester_id: str
    requested_id: str
    status: str  # pending, accepted, declined, blocked
    created_at: datetime = datetime.now()
    accepted_at: Optional[datetime] = None