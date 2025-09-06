// Background script for MindfulCampus Extension

class MindfulCampusExtension {
  constructor() {
    this.apiUrl = 'http://localhost:8000';
    this.webAppUrl = 'http://localhost:3000';
    this.userData = null;
    this.isApiOnline = false;
    this.init();
  }

  init() {
    console.log('MindfulCampus Background Script initialized');
    this.setupEventListeners();
    this.loadUserData();
    this.checkApiStatus();
    this.startDemoMode(); // For hackathon demo
  }

  async loadUserData() {
    try {
      const result = await chrome.storage.sync.get(['userToken', 'userId']);
      if (result.userToken && result.userId) {
        this.userData = result;
        console.log('User data loaded:', this.userData);
      } else {
        console.log('No user data found, using demo mode');
        await this.setupDemoUser();
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      await this.setupDemoUser();
    }
  }

  async setupDemoUser() {
    const demoData = {
      userToken: 'demo_token_' + Date.now(),
      userId: 'demo_user_' + Math.random().toString(36).substr(2, 9),
      userName: 'Demo Student',
      userEmail: 'demo@university.edu'
    };
    
    try {
      await chrome.storage.sync.set(demoData);
      this.userData = demoData;
      console.log('Demo user setup complete:', demoData);
    } catch (error) {
      console.error('Failed to setup demo user:', error);
    }
  }

  async checkApiStatus() {
    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        this.isApiOnline = true;
        console.log('API is online');
      } else {
        throw new Error('API health check failed');
      }
    } catch (error) {
      this.isApiOnline = false;
      console.warn('API is offline, running in demo mode:', error.message);
    }
  }

  setupEventListeners() {
    // Listen for messages from content scripts and popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Background received message:', request);
      
      try {
        switch (request.action) {
          case 'submitMoodData':
            this.sendMoodDataToWebApp(request.data);
            sendResponse({ success: true });
            break;
            
          case 'socialMediaAnalysis':
            this.sendSocialMediaData(request.data);
            sendResponse({ success: true });
            break;
            
          case 'getApiStatus':
            sendResponse({ isOnline: this.isApiOnline });
            break;
            
          case 'getUserData':
            sendResponse({ userData: this.userData });
            break;
            
          default:
            console.warn('Unknown action:', request.action);
            sendResponse({ error: 'Unknown action' });
        }
      } catch (error) {
        console.error('Error handling message:', error);
        sendResponse({ error: error.message });
      }
      
      return true; // Keep message channel open for async response
    });

    // Listen for extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      console.log('MindfulCampus extension installed:', details);
      this.setupInitialData();
    });

    // Listen for tab updates to track navigation
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.trackPageVisit(tab.url);
      }
    });
  }

  async setupInitialData() {
    try {
      // Set default settings
      await chrome.storage.sync.set({
        enabled: true,
        demoMode: true,
        installDate: new Date().toISOString()
      });
      
      console.log('Initial data setup complete');
    } catch (error) {
      console.error('Failed to setup initial data:', error);
    }
  }

  async sendMoodDataToWebApp(moodData) {
    console.log('Processing mood data:', moodData);
    
    // Store locally first
    await this.storeMoodLocally(moodData);
    
    // Try to send to API if online
    if (this.isApiOnline && this.userData?.userToken) {
      try {
        const response = await fetch(`${this.apiUrl}/emotions/mood-entry`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.userData.userToken}`
          },
          body: JSON.stringify({
            mood: moodData.mood,
            confidence: moodData.confidence || 0.8,
            source: 'chrome_extension',
            timestamp: new Date().toISOString(),
            context: moodData.context || 'Extension mood entry'
          })
        });

        if (response.ok) {
          console.log('Mood data successfully sent to API');
          await this.updateWellnessScore();
        } else {
          throw new Error(`API request failed: ${response.status}`);
        }
      } catch (error) {
        console.error('Failed to send mood data to API:', error);
        // Data is already stored locally, so continue gracefully
      }
    } else {
      console.log('API offline or no token, mood stored locally only');
    }
  }

  async storeMoodLocally(moodData) {
    try {
      const result = await chrome.storage.local.get(['moodHistory']);
      const history = result.moodHistory || [];
      
      history.push({
        ...moodData,
        timestamp: new Date().toISOString(),
        id: Date.now()
      });
      
      // Keep only last 100 entries
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
      
      await chrome.storage.local.set({ moodHistory: history });
      console.log('Mood stored locally:', moodData);
    } catch (error) {
      console.error('Failed to store mood locally:', error);
    }
  }

  async sendSocialMediaData(socialData) {
    console.log('Processing social media data:', socialData);
    
    // Store locally
    await this.storeSocialDataLocally(socialData);
    
    // Try to send to API if online
    if (this.isApiOnline && this.userData?.userToken) {
      try {
        const response = await fetch(`${this.apiUrl}/extension/social-activity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.userData.userToken}`
          },
          body: JSON.stringify({
            platform: socialData.platform,
            timeSpent: socialData.timeSpent,
            interactions: socialData.interactions,
            sentimentData: socialData.sentiment,
            timestamp: new Date().toISOString()
          })
        });

        if (response.ok) {
          console.log('Social media data sent successfully');
        } else {
          throw new Error(`API request failed: ${response.status}`);
        }
      } catch (error) {
        console.error('Failed to send social media data:', error);
      }
    }
  }

  async storeSocialDataLocally(socialData) {
    try {
      const result = await chrome.storage.local.get(['socialHistory']);
      const history = result.socialHistory || [];
      
      history.push({
        ...socialData,
        timestamp: new Date().toISOString(),
        id: Date.now()
      });
      
      // Keep only last 50 entries
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }
      
      await chrome.storage.local.set({ socialHistory: history });
      console.log('Social data stored locally');
    } catch (error) {
      console.error('Failed to store social data locally:', error);
    }
  }

  trackPageVisit(url) {
    const socialPlatforms = {
      'facebook.com': 'facebook',
      'instagram.com': 'instagram', 
      'twitter.com': 'twitter',
      'x.com': 'twitter',
      'tiktok.com': 'tiktok',
      'youtube.com': 'youtube',
      'reddit.com': 'reddit'
    };

    const platform = Object.keys(socialPlatforms).find(domain => url.includes(domain));
    
    if (platform) {
      console.log(`Tracking visit to ${socialPlatforms[platform]}`);
      // Could store visit data here
    }
  }

  async updateWellnessScore() {
    try {
      // Get recent mood data
      const result = await chrome.storage.local.get(['moodHistory']);
      const history = result.moodHistory || [];
      
      if (history.length === 0) return;
      
      // Calculate simple wellness score
      const recentMoods = history.slice(-7); // Last 7 entries
      const positiveCount = recentMoods.filter(m => m.mood === 'positive').length;
      const score = Math.round((positiveCount / recentMoods.length) * 100);
      
      await chrome.storage.local.set({ wellnessScore: score });
      console.log(`Updated wellness score: ${score}`);
      
    } catch (error) {
      console.error('Failed to update wellness score:', error);
    }
  }

  // Demo mode for hackathon
  startDemoMode() {
    console.log('🎭 Starting hackathon demo mode...');
    
    // Show demo notifications periodically
    setTimeout(() => {
      this.showDemoNotification();
    }, 10000); // After 10 seconds
    
    // Generate demo data
    this.generateDemoData();
  }

  showDemoNotification() {
    if (typeof chrome.notifications !== 'undefined') {
      chrome.notifications.create('demo-notification', {
        type: 'basic',
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiM2NjdlZWEiPjxjaXJjbGUgY3g9IjI0IiBjeT0iMjQiIHI9IjI0Ii8+PC9zdmc+',
        title: '🧠 MindfulCampus Alert',
        message: 'AI detected stress patterns. Would you like a breathing exercise?',
        buttons: [
          { title: 'Yes, help me' },
          { title: 'Not now' }
        ]
      });
    }
  }

  async generateDemoData() {
    try {
      // Generate some demo mood history
      const demoMoods = [
        { mood: 'positive', confidence: 0.85, context: 'Good morning mood check' },
        { mood: 'neutral', confidence: 0.7, context: 'Midday check-in' },
        { mood: 'stressed', confidence: 0.9, context: 'Before exam preparation' },
        { mood: 'positive', confidence: 0.8, context: 'After study break' }
      ];

      const timestamps = demoMoods.map((_, i) => 
        new Date(Date.now() - (3 - i) * 24 * 60 * 60 * 1000).toISOString()
      );

      const moodHistory = demoMoods.map((mood, i) => ({
        ...mood,
        timestamp: timestamps[i],
        id: Date.now() + i
      }));

      await chrome.storage.local.set({ 
        moodHistory,
        wellnessScore: 75,
        demoDataGenerated: true
      });

      console.log('Demo data generated successfully');
    } catch (error) {
      console.error('Failed to generate demo data:', error);
    }
  }

  // Handle notification clicks
  setupNotificationHandlers() {
    if (typeof chrome.notifications !== 'undefined') {
      chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
        if (notificationId === 'demo-notification') {
          if (buttonIndex === 0) { // "Yes, help me"
            // Open breathing exercise
            chrome.tabs.create({ url: chrome.runtime.getURL('popup/popup.html') });
          }
          chrome.notifications.clear(notificationId);
        }
      });

      chrome.notifications.onClicked.addListener((notificationId) => {
        if (notificationId === 'demo-notification') {
          chrome.tabs.create({ url: chrome.runtime.getURL('popup/popup.html') });
          chrome.notifications.clear(notificationId);
        }
      });
    }
  }

  // Utility methods for demo
  async getDemoStats() {
    return {
      totalUsers: 3421,
      averageMood: 6.8,
      interventionsTriggered: 247,
      crisesPrevented: 12,
      wellnessImprovement: '23%'
    };
  }

  async simulateCrisisIntervention() {
    console.log('🚨 Simulating crisis intervention for demo...');
    
    const steps = [
      'Unusual typing pattern detected',
      'Negative sentiment analysis confirmed', 
      'Risk level elevated to HIGH',
      'Peer counselor notified',
      'Intervention successful'
    ];

    for (let i = 0; i < steps.length; i++) {
      console.log(`Step ${i + 1}: ${steps[i]}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return {
      success: true,
      timeToIntervention: '2.3 minutes',
      outcome: 'Crisis prevented, student connected with support'
    };
  }
}

// Initialize the extension
const mindfulExtension = new MindfulCampusExtension();

// Set up notification handlers
mindfulExtension.setupNotificationHandlers();

// Export for testing
if (typeof module !== 'undefined') {
  module.exports = MindfulCampusExtension;
}