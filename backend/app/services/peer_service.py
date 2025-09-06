import uuid
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.models.peer_support import PeerMatch, SupportGroup, Message, PeerConnection

class PeerSupportService:
    def __init__(self):
        # Mock storage (in production, use database)
        self.matches_db = {}
        self.groups_db = {}
        self.messages_db = {}
        self.connections_db = {}
        
        # Initialize with some mock support groups
        self._initialize_mock_groups()

    def _initialize_mock_groups(self):
        """Initialize with mock support groups"""
        mock_groups = [
            {
                'name': 'Study Stress Support',
                'description': 'A safe space for students dealing with academic pressure',
                'category': 'academic',
                'max_members': 50,
                'current_members': 24
            },
            {
                'name': 'Social Anxiety Circle',
                'description': 'Connect with others who understand social challenges',
                'category': 'social',
                'max_members': 30,
                'current_members': 18
            },
            {
                'name': 'Mindfulness & Wellness',
                'description': 'Daily practices for mental health and well-being',
                'category': 'wellness',
                'max_members': 60,
                'current_members': 42
            },
            {
                'name': 'Graduate School Prep',
                'description': 'Support for students preparing for graduate studies',
                'category': 'academic',
                'max_members': 25,
                'current_members': 15
            }
        ]
        
        for group_data in mock_groups:
            group_id = str(uuid.uuid4())
            group = SupportGroup(
                id=group_id,
                name=group_data['name'],
                description=group_data['description'],
                category=group_data['category'],
                max_members=group_data['max_members'],
                current_members=group_data['current_members'],
                created_at=datetime.utcnow()
            )
            self.groups_db[group_id] = group

    async def find_peer_matches(self, user_id: str) -> List[Dict[str, Any]]:
        """Find potential peer matches for user"""
        # Mock peer matching algorithm
        mock_peers = [
            {
                'id': str(uuid.uuid4()),
                'name': 'Anonymous Student A',
                'compatibility_score': 92,
                'shared_challenges': ['Academic Stress', 'Social Anxiety'],
                'major': 'Computer Science',
                'year': 'Junior',
                'status': 'online',
                'last_active': '2 min ago'
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Anonymous Student B',
                'compatibility_score': 87,
                'shared_challenges': ['Time Management', 'Perfectionism'],
                'major': 'Psychology',
                'year': 'Senior',
                'status': 'online',
                'last_active': '5 min ago'
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Anonymous Student C',
                'compatibility_score': 78,
                'shared_challenges': ['Academic Pressure', 'Sleep Issues'],
                'major': 'Engineering',
                'year': 'Sophomore',
                'status': 'away',
                'last_active': '1 hour ago'
            }
        ]
        
        return mock_peers

    async def create_peer_connection(self, requester_id: str, requested_id: str) -> PeerConnection:
        """Create a peer connection request"""
        connection = PeerConnection(
            id=str(uuid.uuid4()),
            requester_id=requester_id,
            requested_id=requested_id,
            status='pending',
            created_at=datetime.utcnow()
        )
        
        self.connections_db[connection.id] = connection
        return connection

    async def get_available_support_groups(self, user_id: str) -> List[Dict[str, Any]]:
        """Get available support groups"""
        groups_data = []
        for group in self.groups_db.values():
            groups_data.append({
                'id': group.id,
                'name': group.name,
                'description': group.description,
                'category': group.category,
                'current_members': group.current_members,
                'max_members': group.max_members,
                'is_full': group.current_members >= group.max_members,
                'created_at': group.created_at.isoformat(),
                'active_now': random.randint(2, 12)  # Mock active users
            })
        
        return groups_data

    async def join_support_group(self, user_id: str, group_id: str) -> Dict[str, Any]:
        """Join a support group"""
        group = self.groups_db.get(group_id)
        if not group:
            raise Exception("Support group not found")
        
        if group.current_members >= group.max_members:
            raise Exception("Support group is full")
        
        # Add user to group (in production, track membership in database)
        group.current_members += 1
        
        return {
            'success': True,
            'message': f'Successfully joined {group.name}',
            'group_id': group_id,
            'member_count': group.current_members
        }

    async def get_peer_messages(self, user_id: str, peer_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get messages between user and peer"""
        # Mock conversation history
        mock_messages = [
            {
                'id': str(uuid.uuid4()),
                'sender_id': peer_id,
                'content': "Hey! I saw you're also dealing with academic stress. How do you manage during finals week?",
                'sent_at': (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                'is_own': False
            },
            {
                'id': str(uuid.uuid4()),
                'sender_id': user_id,
                'content': "Hi! I try to break everything into smaller tasks and take regular breaks. What about you?",
                'sent_at': (datetime.utcnow() - timedelta(hours=2, minutes=-2)).isoformat(),
                'is_own': True
            },
            {
                'id': str(uuid.uuid4()),
                'sender_id': peer_id,
                'content': "That's a great approach! I've been using the Pomodoro technique lately. It really helps with focus.",
                'sent_at': (datetime.utcnow() - timedelta(hours=1, minutes=55)).isoformat(),
                'is_own': False
            },
            {
                'id': str(uuid.uuid4()),
                'sender_id': user_id,
                'content': "I should try that! Do you have any good apps you'd recommend for the Pomodoro technique?",
                'sent_at': (datetime.utcnow() - timedelta(hours=1, minutes=50)).isoformat(),
                'is_own': True
            },
            {
                'id': str(uuid.uuid4()),
                'sender_id': peer_id,
                'content': "I use Forest - it's really motivating because you grow virtual trees while studying. Plus it helps me stay off my phone!",
                'sent_at': (datetime.utcnow() - timedelta(minutes=30)).isoformat(),
                'is_own': False
            }
        ]
        
        return mock_messages

    async def send_peer_message(self, sender_id: str, recipient_id: str, content: str) -> Message:
        """Send message to peer"""
        message = Message(
            id=str(uuid.uuid4()),
            sender_id=sender_id,
            recipient_id=recipient_id,
            content=content,
            sent_at=datetime.utcnow()
        )
        
        self.messages_db[message.id] = message
        return message

    async def send_group_message(self, sender_id: str, group_id: str, content: str) -> Message:
        """Send message to support group"""
        group = self.groups_db.get(group_id)
        if not group:
            raise Exception("Support group not found")
        
        message = Message(
            id=str(uuid.uuid4()),
            sender_id=sender_id,
            group_id=group_id,
            content=content,
            sent_at=datetime.utcnow()
        )
        
        self.messages_db[message.id] = message
        return message

    async def get_group_messages(self, group_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get messages from support group"""
        # Mock group conversation
        mock_messages = [
            {
                'id': str(uuid.uuid4()),
                'sender_name': 'Anonymous Student D',
                'content': "Just wanted to share that I finally finished my research paper! Thanks everyone for the support this week.",
                'sent_at': (datetime.utcnow() - timedelta(hours=3)).isoformat(),
                'message_type': 'celebration'
            },
            {
                'id': str(uuid.uuid4()),
                'sender_name': 'Anonymous Student E',
                'content': "That's amazing! Congratulations! 🎉",
                'sent_at': (datetime.utcnow() - timedelta(hours=2, minutes=58)).isoformat(),
                'message_type': 'support'
            },
            {
                'id': str(uuid.uuid4()),
                'sender_name': 'Anonymous Student F',
                'content': "I'm struggling with my midterm prep. Any tips for managing anxiety during exams?",
                'sent_at': (datetime.utcnow() - timedelta(hours=1)).isoformat(),
                'message_type': 'help_request'
            },
            {
                'id': str(uuid.uuid4()),
                'sender_name': 'Anonymous Student G',
                'content': "What helps me is creating a study schedule and breaking it into small chunks. Also, deep breathing exercises before each study session!",
                'sent_at': (datetime.utcnow() - timedelta(minutes=45)).isoformat(),
                'message_type': 'advice'
            }
        ]
        
        return mock_messages

    async def get_user_support_stats(self, user_id: str) -> Dict[str, Any]:
        """Get user's peer support statistics"""
        return {
            'active_connections': random.randint(8, 15),
            'support_points_given': random.randint(40, 80),
            'support_points_received': random.randint(35, 70),
            'groups_joined': random.randint(2, 5),
            'messages_sent': random.randint(50, 200),
            'support_rating': round(random.uniform(4.5, 5.0), 1),
            'hours_this_month': random.randint(15, 40)
        }

    async def report_user(self, reporter_id: str, reported_id: str, reason: str, description: str) -> Dict[str, Any]:
        """Report a user for inappropriate behavior"""
        report_id = str(uuid.uuid4())
        
        # In production, this would create a report record and notify moderators
        return {
            'report_id': report_id,
            'status': 'submitted',
            'message': 'Report submitted successfully. Our moderation team will review it within 24 hours.',
            'follow_up': 'You will receive an email update once the report has been processed.'
        }

    async def block_user(self, blocker_id: str, blocked_id: str) -> Dict[str, Any]:
        """Block a user from contacting the current user"""
        # In production, this would update the database to prevent communication
        return {
            'success': True,
            'message': 'User has been blocked successfully',
            'blocked_user_id': blocked_id
        }

    async def get_peer_recommendations(self, user_id: str) -> List[Dict[str, Any]]:
        """Get personalized peer recommendations"""
        return [
            {
                'type': 'study_buddy',
                'title': 'Find a Study Buddy',
                'description': 'Connect with someone in your major for collaborative studying',
                'action': 'Browse Computer Science students',
                'potential_matches': 12
            },
            {
                'type': 'wellness_partner',
                'title': 'Wellness Accountability Partner',
                'description': 'Team up with someone for daily wellness check-ins',
                'action': 'Join Wellness Circle',
                'potential_matches': 8
            },
            {
                'type': 'mentor_connection',
                'title': 'Connect with a Senior Student',
                'description': 'Get guidance from students who have been in your situation',
                'action': 'Browse Senior Mentors',
                'potential_matches': 5
            }
        ]

    async def schedule_group_session(self, group_id: str, organizer_id: str, title: str, description: str, scheduled_time: datetime) -> Dict[str, Any]:
        """Schedule a group support session"""
        session_id = str(uuid.uuid4())
        
        return {
            'session_id': session_id,
            'group_id': group_id,
            'title': title,
            'description': description,
            'scheduled_time': scheduled_time.isoformat(),
            'organizer_id': organizer_id,
            'status': 'scheduled',
            'attendees': [],
            'max_attendees': 15
        }

    async def join_group_session(self, session_id: str, user_id: str) -> Dict[str, Any]:
        """Join a scheduled group session"""
        return {
            'success': True,
            'session_id': session_id,
            'message': 'Successfully joined the session',
            'reminder_set': True
        }

    async def get_crisis_support_contacts(self) -> List[Dict[str, Any]]:
        """Get emergency/crisis support contacts"""
        return [
            {
                'name': 'Campus Crisis Hotline',
                'phone': '(555) 123-HELP',
                'availability': '24/7',
                'type': 'crisis',
                'description': 'Immediate support for students in crisis'
            },
            {
                'name': 'National Suicide Prevention Lifeline',
                'phone': '988',
                'availability': '24/7',
                'type': 'national_crisis',
                'description': 'National crisis support and suicide prevention'
            },
            {
                'name': 'Campus Counseling Center',
                'phone': '(555) 123-4567',
                'availability': 'Mon-Fri 8AM-5PM',
                'type': 'counseling',
                'description': 'Professional counseling services'
            },
            {
                'name': 'Peer Crisis Support',
                'contact': 'crisis-chat@university.edu',
                'availability': '24/7',
                'type': 'peer_crisis',
                'description': 'Trained peer counselors for immediate support'
            }
        ]

    async def create_support_group(self, creator_id: str, name: str, description: str, category: str, max_members: int = 30) -> SupportGroup:
        """Create a new support group"""
        group = SupportGroup(
            id=str(uuid.uuid4()),
            name=name,
            description=description,
            category=category,
            max_members=max_members,
            current_members=1,  # Creator is first member
            moderator_id=creator_id,
            created_at=datetime.utcnow()
        )
        
        self.groups_db[group.id] = group
        return group

    async def moderate_message(self, message_id: str, moderator_id: str, action: str, reason: str) -> Dict[str, Any]:
        """Moderate a message (remove, flag, etc.)"""
        message = self.messages_db.get(message_id)
        if not message:
            raise Exception("Message not found")
        
        return {
            'success': True,
            'action': action,
            'message_id': message_id,
            'moderator_id': moderator_id,
            'reason': reason,
            'timestamp': datetime.utcnow().isoformat()
        }

    async def get_moderation_queue(self, moderator_id: str) -> List[Dict[str, Any]]:
        """Get messages that need moderation"""
        # Mock moderation queue
        return [
            {
                'message_id': str(uuid.uuid4()),
                'content': 'This message was reported for review',
                'sender_id': 'anonymous',
                'group_id': str(uuid.uuid4()),
                'reported_by': 'anonymous',
                'report_reason': 'inappropriate_content',
                'timestamp': datetime.utcnow().isoformat()
            }
        ]