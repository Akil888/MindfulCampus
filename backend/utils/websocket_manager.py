import json
import logging
from typing import Dict, List, Any
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        # Store active connections: user_id -> websocket
        self.active_connections: Dict[str, WebSocket] = {}
        # Store counselor connections separately
        self.counselor_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept websocket connection and store it"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected via WebSocket")

    async def disconnect(self, user_id: str):
        """Remove websocket connection"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"User {user_id} disconnected from WebSocket")

    async def send_to_user(self, user_id: str, message: Dict[str, Any]):
        """Send message to specific user"""
        if user_id in self.active_connections:
            try:
                websocket = self.active_connections[user_id]
                await websocket.send_text(json.dumps(message))
                logger.debug(f"Sent message to user {user_id}: {message.get('type', 'unknown')}")
            except Exception as e:
                logger.error(f"Failed to send message to user {user_id}: {e}")
                # Remove dead connection
                await self.disconnect(user_id)

    async def broadcast_to_all(self, message: Dict[str, Any]):
        """Broadcast message to all connected users"""
        disconnected_users = []
        
        for user_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Failed to send broadcast to user {user_id}: {e}")
                disconnected_users.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected_users:
            await self.disconnect(user_id)

    async def broadcast_to_counselors(self, message: Dict[str, Any]):
        """Send message to all connected counselors"""
        disconnected_counselors = []
        
        for counselor_id, websocket in self.counselor_connections.items():
            try:
                await websocket.send_text(json.dumps(message))
                logger.info(f"Alert sent to counselor {counselor_id}")
            except Exception as e:
                logger.error(f"Failed to send alert to counselor {counselor_id}: {e}")
                disconnected_counselors.append(counselor_id)
        
        # Clean up disconnected counselors
        for counselor_id in disconnected_counselors:
            if counselor_id in self.counselor_connections:
                del self.counselor_connections[counselor_id]

    async def send_bulk_notification(self, message: str, target_group: str = "all") -> Dict[str, int]:
        """Send bulk notification to specified group"""
        notification = {
            "type": "bulk_notification",
            "message": message,
            "timestamp": "2024-01-01T00:00:00Z"  # Would use real timestamp
        }
        
        count = 0
        
        if target_group == "all":
            await self.broadcast_to_all(notification)
            count = len(self.active_connections)
        elif target_group == "counselors":
            await self.broadcast_to_counselors(notification)
            count = len(self.counselor_connections)
        elif target_group == "at_risk":
            # Would implement logic to identify at-risk users
            # For now, send to all
            await self.broadcast_to_all(notification)
            count = len(self.active_connections)
        
        return {"count": count}

    async def connect_counselor(self, websocket: WebSocket, counselor_id: str):
        """Connect a counselor for crisis alerts"""
        await websocket.accept()
        self.counselor_connections[counselor_id] = websocket
        logger.info(f"Counselor {counselor_id} connected for crisis monitoring")

    async def disconnect_counselor(self, counselor_id: str):
        """Disconnect a counselor"""
        if counselor_id in self.counselor_connections:
            del self.counselor_connections[counselor_id]
            logger.info(f"Counselor {counselor_id} disconnected")

    async def send_intervention_notification(self, user_id: str, intervention: Dict[str, Any]):
        """Send intervention notification to user"""
        message = {
            "type": "intervention_triggered",
            "data": intervention,
            "timestamp": "2024-01-01T00:00:00Z"
        }
        await self.send_to_user(user_id, message)

    async def send_peer_message_notification(self, recipient_id: str, sender_name: str, preview: str):
        """Send notification about new peer message"""
        message = {
            "type": "new_peer_message",
            "data": {
                "sender_name": sender_name,
                "preview": preview[:50] + "..." if len(preview) > 50 else preview
            },
            "timestamp": "2024-01-01T00:00:00Z"
        }
        await self.send_to_user(recipient_id, message)

    async def send_group_activity_notification(self, group_members: List[str], activity: Dict[str, Any]):
        """Send notification about group activity"""
        message = {
            "type": "group_activity",
            "data": activity,
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
        for member_id in group_members:
            await self.send_to_user(member_id, message)

    async def send_wellness_reminder(self, user_id: str, reminder_type: str, content: str):
        """Send wellness reminder to user"""
        message = {
            "type": "wellness_reminder",
            "data": {
                "reminder_type": reminder_type,
                "content": content
            },
            "timestamp": "2024-01-01T00:00:00Z"
        }
        await self.send_to_user(user_id, message)

    async def get_connection_stats(self) -> Dict[str, int]:
        """Get statistics about active connections"""
        return {
            "total_connections": len(self.active_connections),
            "counselor_connections": len(self.counselor_connections),
            "active_users": len(self.active_connections),
            "total_capacity": 1000  # Mock capacity limit
        }

    async def ping_all_connections(self):
        """Send ping to all connections to check if they're still alive"""
        ping_message = {
            "type": "ping",
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
        # Ping regular users
        disconnected_users = []
        for user_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(json.dumps(ping_message))
            except Exception:
                disconnected_users.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected_users:
            await self.disconnect(user_id)
        
        # Ping counselors
        disconnected_counselors = []
        for counselor_id, websocket in self.counselor_connections.items():
            try:
                await websocket.send_text(json.dumps(ping_message))
            except Exception:
                disconnected_counselors.append(counselor_id)
        
        # Clean up disconnected counselors
        for counselor_id in disconnected_counselors:
            await self.disconnect_counselor(counselor_id)