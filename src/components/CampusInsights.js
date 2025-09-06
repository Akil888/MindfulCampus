import React, { useState } from 'react';

const CampusInsights = () => {
  const [timeframe, setTimeframe] = useState('week');
  
  const getStatsForTimeframe = (timeframe) => {
    const baseStats = {
      day: { activeUsers: 1205, avgMood: 6.3, interventions: 89, sessions: 12 },
      week: { activeUsers: 3421, avgMood: 6.8, interventions: 247, sessions: 34 },
      month: { activeUsers: 8764, avgMood: 7.1, interventions: 892, sessions: 156 }
    };
    return baseStats[timeframe] || baseStats.week;
  };

  const stats = getStatsForTimeframe(timeframe);

  const departments = [
    { name: 'Computer Science', students: 2340, avgMood: 6.2, riskLevel: 'Medium' },
    { name: 'Engineering', students: 1890, avgMood: 6.5, riskLevel: 'Medium' },
    { name: 'Business', students: 2120, avgMood: 7.1, riskLevel: 'Low' },
    { name: 'Medicine', students: 980, avgMood: 5.8, riskLevel: 'High' }
  ];

  const alerts = [
    { 
      location: 'Library - 3rd Floor', 
      students: 8, 
      severity: 'High', 
      type: 'Academic Stress',
      description: 'AI detected: Unusual concentration of students showing signs of academic stress during examination period. Patterns include extended study sessions, irregular sleep schedules, and increased search queries for stress-related content.'
    },
    { 
      location: 'Engineering Block', 
      students: 12, 
      severity: 'Medium', 
      type: 'Exam Anxiety',
      description: 'Algorithm identified: Increased anxiety patterns among engineering students before placement interviews. Based on typing speed analysis, mood check-ins, and time spent in building.'
    }
  ];

  // Indian Professional Support Directory
  const counselorContacts = [
    {
      name: "Dr. Priya Sharma",
      title: "Chief Counseling Psychologist",
      phone: "+91 98765 43210",
      email: "priya.sharma@university.ac.in",
      specialties: ["Academic Stress", "Career Anxiety", "Depression"],
      availability: "Mon-Fri 9AM-6PM",
      languages: ["Hindi", "English", "Tamil"]
    },
    {
      name: "Dr. Rajesh Kumar",
      title: "Student Wellness Coordinator",
      phone: "+91 98765 43211",
      email: "rajesh.kumar@university.ac.in",
      specialties: ["Exam Anxiety", "Time Management", "Study Skills"],
      availability: "Mon-Sat 10AM-5PM",
      languages: ["Hindi", "English", "Telugu"]
    },
    {
      name: "Ms. Anita Mehta, M.Phil Psychology",
      title: "Crisis Intervention Specialist",
      phone: "+91 98765 43212",
      email: "anita.mehta@university.ac.in",
      specialties: ["Crisis Support", "Trauma Counseling", "Family Issues"],
      availability: "24/7 On-Call",
      languages: ["Hindi", "English", "Gujarati", "Marathi"]
    },
    {
      name: "Dr. S. Krishnamurthy",
      title: "Psychiatric Consultant",
      phone: "+91 98765 43213",
      email: "krishnamurthy@university.ac.in",
      specialties: ["Clinical Depression", "Anxiety Disorders", "Medication Management"],
      availability: "Tue, Thu, Sat 2PM-6PM",
      languages: ["Tamil", "English", "Hindi", "Malayalam"]
    }
  ];

  // Indian Emergency Contacts
  const emergencyContacts = [
    { 
      name: "Campus Crisis Helpline", 
      number: "+91 9876543578", 
      availability: "24/7", 
      type: "Campus Emergency",
      description: "Immediate campus mental health support"
    },
    { 
      name: "Vandrevala Foundation Helpline", 
      number: "1860 266 2345", 
      availability: "24/7", 
      type: "National Mental Health Crisis",
      description: "Free mental health support across India"
    },
    { 
      name: "KIRAN Mental Health Helpline", 
      number: "1800-599-0019", 
      availability: "24/7", 
      type: "Government Mental Health Support",
      description: "Ministry of Social Justice helpline"
    },
    { 
      name: "Campus Security", 
      number: "+91 98765 43200", 
      availability: "24/7", 
      type: "Security Emergency",
      description: "Campus safety and emergency response"
    },
    { 
      name: "Snehi Helpline (Delhi)", 
      number: "011-65978181", 
      availability: "24/7", 
      type: "Suicide Prevention",
      description: "Emotional support and suicide prevention"
    },
    { 
      name: "MPower Helpline", 
      number: "1800-120-820050", 
      availability: "Mon-Sat 10AM-6PM", 
      type: "Youth Mental Health",
      description: "Mental health support for young adults"
    }
  ];

  return (
    <div style={{ padding: '40px' }}>
      <h1>Campus Mental Health Insights</h1>
      
      {/* Controls */}
      <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
        <label>
          Timeframe: 
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} 
                  style={{ marginLeft: '8px', padding: '4px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            <option value="day">Last 24 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </label>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👥</div>
          <h3 style={{ color: '#667eea', margin: '10px 0' }}>{stats.activeUsers.toLocaleString()}</h3>
          <p style={{ margin: '5px 0', opacity: 0.9 }}>Active Users</p>
          <small style={{ color: '#4caf50' }}>+12% from previous {timeframe}</small>
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>😊</div>
          <h3 style={{ color: '#667eea', margin: '10px 0' }}>{stats.avgMood}/10</h3>
          <p style={{ margin: '5px 0', opacity: 0.9 }}>Avg Mood Score</p>
          <small style={{ color: '#4caf50' }}>+0.3 from previous {timeframe}</small>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🧘‍♀️</div>
          <h3 style={{ color: '#667eea', margin: '10px 0' }}>{stats.interventions}</h3>
          <p style={{ margin: '5px 0', opacity: 0.9 }}>Interventions</p>
          <small style={{ color: '#f44336' }}>-8% from previous {timeframe}</small>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🤝</div>
          <h3 style={{ color: '#667eea', margin: '10px 0' }}>{stats.sessions}</h3>
          <p style={{ margin: '5px 0', opacity: 0.9 }}>Support Sessions</p>
          <small style={{ color: '#4caf50' }}>+15% from previous {timeframe}</small>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
        {/* Risk Alerts */}
        <div>
          <h3>AI-Powered Risk Detection</h3>
          {alerts.map((alert, i) => (
            <div key={i} style={{
              background: alert.severity === 'High' ? 'rgba(244,67,54,0.1)' : 'rgba(255,152,0,0.1)',
              border: `1px solid ${alert.severity === 'High' ? 'rgba(244,67,54,0.3)' : 'rgba(255,152,0,0.3)'}`,
              padding: '15px',
              margin: '10px 0',
              borderRadius: '8px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{alert.location}</div>
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                {alert.students} students showing {alert.type} indicators
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px' }}>
                {alert.description}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                Severity: {alert.severity}
              </div>
            </div>
          ))}
        </div>

        {/* Department Analysis */}
        <div>
          <h3>Departmental Risk Assessment</h3>
          {departments.map((dept, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '15px',
              margin: '10px 0',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{dept.name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>{dept.students.toLocaleString()} students</div>
                  <div style={{ fontSize: '12px' }}>Avg Mood: {dept.avgMood}/10</div>
                </div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  background: dept.riskLevel === 'High' ? 'rgba(244,67,54,0.2)' : 
                            dept.riskLevel === 'Medium' ? 'rgba(255,152,0,0.2)' : 'rgba(76,175,80,0.2)',
                  color: dept.riskLevel === 'High' ? '#f44336' : 
                        dept.riskLevel === 'Medium' ? '#ff9800' : '#4caf50'
                }}>
                  {dept.riskLevel} Risk
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indian Professional Support Directory */}
      <div style={{ marginBottom: '40px' }}>
        <h3>Campus Mental Health Professionals</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {counselorContacts.map((counselor, i) => (
            <div key={i} style={{
              background: 'rgba(102,126,234,0.1)',
              border: '1px solid rgba(102,126,234,0.3)',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#667eea' }}>{counselor.name}</h4>
              <p style={{ margin: '4px 0', fontSize: '14px', opacity: 0.9 }}>{counselor.title}</p>
              <p style={{ margin: '8px 0', fontSize: '14px' }}>📞 {counselor.phone}</p>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>✉️ {counselor.email}</p>
              <p style={{ margin: '8px 0', fontSize: '12px' }}>🕒 {counselor.availability}</p>
              <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                <strong style={{ fontSize: '12px' }}>Languages:</strong>
                <div style={{ marginTop: '4px' }}>
                  {counselor.languages.map((lang, j) => (
                    <span key={j} style={{
                      display: 'inline-block',
                      background: 'rgba(76,175,80,0.2)',
                      color: '#4caf50',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      margin: '2px'
                    }}>
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '10px' }}>
                <strong style={{ fontSize: '12px' }}>Specialties:</strong>
                <div style={{ marginTop: '4px' }}>
                  {counselor.specialties.map((specialty, j) => (
                    <span key={j} style={{
                      display: 'inline-block',
                      background: 'rgba(255,255,255,0.2)',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      margin: '2px'
                    }}>
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indian Emergency Contacts */}
      <div>
        <h3>Emergency & Crisis Support (India)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
          {emergencyContacts.map((contact, i) => (
            <div key={i} style={{
              background: 'rgba(244,67,54,0.1)',
              border: '1px solid rgba(244,67,54,0.3)',
              padding: '15px',
              borderRadius: '8px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#f44336' }}>{contact.name}</h4>
              <p style={{ margin: '4px 0', fontSize: '18px', fontWeight: 'bold' }}>{contact.number}</p>
              <p style={{ margin: '4px 0', fontSize: '12px' }}>{contact.availability}</p>
              <p style={{ margin: '4px 0', fontSize: '12px', opacity: 0.8 }}>{contact.type}</p>
              <p style={{ margin: '4px 0', fontSize: '11px', opacity: 0.7 }}>{contact.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampusInsights;
