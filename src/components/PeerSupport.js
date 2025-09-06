import React, { useState } from 'react';

const PeerSupport = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');

  const peers = [
    { 
      id: 1, 
      name: 'Anonymous Student A', 
      status: 'online', 
      compatibility: 92, 
      lastMsg: 'How do you handle exam stress?',
      messages: [
        { text: "How do you handle exam stress?", isOwn: false, time: "2 hours ago" },
        { text: "I break everything into smaller tasks and take regular breaks. The Pomodoro technique really helps!", isOwn: true, time: "1 hour ago" },
        { text: "That sounds great! I'll try that. Do you have any apps you recommend?", isOwn: false, time: "45 min ago" }
      ]
    },
    { 
      id: 2, 
      name: 'Anonymous Student B', 
      status: 'online', 
      compatibility: 87, 
      lastMsg: 'Thanks for the study tips!',
      messages: [
        { text: "I'm really struggling with time management this semester", isOwn: false, time: "3 hours ago" },
        { text: "I feel you! Have you tried blocking specific hours for different subjects?", isOwn: true, time: "2 hours ago" },
        { text: "Thanks for the study tips! I'll give it a shot", isOwn: false, time: "1 hour ago" },
        { text: "You're welcome! Let me know how it goes", isOwn: true, time: "45 min ago" }
      ]
    },
    { 
      id: 3, 
      name: 'Anonymous Student C', 
      status: 'away', 
      compatibility: 78, 
      lastMsg: 'See you in study group',
      messages: [
        { text: "Are you joining the group study session tomorrow?", isOwn: false, time: "4 hours ago" },
        { text: "Yes! What time is it again?", isOwn: true, time: "3 hours ago" },
        { text: "3 PM in the library. See you in study group", isOwn: false, time: "2 hours ago" }
      ]
    }
  ];

  const groups = [
    { name: 'Study Stress Support', members: 24, active: 8, category: 'Academic' },
    { name: 'Social Anxiety Circle', members: 18, active: 3, category: 'Social' },
    { name: 'Mindfulness & Wellness', members: 42, active: 12, category: 'Wellness' }
  ];

  return (
    <div style={{ padding: '40px' }}>
      <h1>Peer Support Network</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        
        <div>
          <h3>Your Support Connections</h3>
          {peers.map(peer => (
            <div key={peer.id} 
                 onClick={() => setActiveChat(peer)}
                 style={{
              background: activeChat?.id === peer.id ? 'rgba(102,126,234,0.2)' : 'rgba(255,255,255,0.1)',
              padding: '15px',
              margin: '10px 0',
              borderRadius: '8px',
              cursor: 'pointer',
              border: activeChat?.id === peer.id ? '1px solid #667eea' : '1px solid transparent'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {peer.name}
                    <span style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: peer.status === 'online' ? '#4caf50' : '#ff9800' 
                    }}></span>
                  </div>
                  <div style={{ opacity: 0.7, fontSize: '14px' }}>{peer.compatibility}% compatibility</div>
                  <div style={{ opacity: 0.6, fontSize: '12px' }}>"{peer.lastMsg}"</div>
                </div>
              </div>
            </div>
          ))}

          <h3 style={{ marginTop: '30px' }}>Support Groups</h3>
          {groups.map((group, i) => (
            <div key={i} style={{
              background: 'rgba(118,75,162,0.1)',
              padding: '15px',
              margin: '10px 0',
              borderRadius: '8px',
              border: '1px solid rgba(118,75,162,0.3)'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{group.name}</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px' }}>
                {group.members} members • {group.active} active now • {group.category}
              </div>
              <button style={{
                background: '#764ba2',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Join Group
              </button>
            </div>
          ))}
        </div>

        <div>
          {activeChat ? (
            <div style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', height: '500px' }}>
              <div style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                <strong>{activeChat.name}</strong>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>Anonymous • End-to-end encrypted</div>
              </div>
              
              <div style={{ padding: '15px', height: '350px', overflowY: 'auto' }}>
                {activeChat.messages.map((msg, index) => (
                  <div key={index} style={{ marginBottom: '15px', textAlign: msg.isOwn ? 'right' : 'left' }}>
                    <div style={{ 
                      background: msg.isOwn ? '#667eea' : 'rgba(255,255,255,0.1)', 
                      padding: '8px 12px', 
                      borderRadius: '12px', 
                      display: 'inline-block', 
                      maxWidth: '70%' 
                    }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>{msg.time}</div>
                  </div>
                ))}
              </div>
              
              <div style={{ padding: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a supportive message..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '20px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white'
                    }}
                  />
                  <button style={{
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer'
                  }}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ 
              border: '1px dashed rgba(255,255,255,0.3)', 
              borderRadius: '8px', 
              height: '500px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              textAlign: 'center',
              opacity: 0.6
            }}>
              Select a peer to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeerSupport;
