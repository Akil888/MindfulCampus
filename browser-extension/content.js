// MindfulCampus Content Script
// This script runs on social media pages to monitor emotional patterns

class MindfulCampusMonitor {
  constructor() {
    this.apiUrl = 'http://localhost:8000';
    this.isEnabled = true;
    this.sessionData = {
      startTime: Date.now(),
      scrollEvents: [],
      clickEvents: [],
      textInteractions: [],
      timeSpent: 0
    };
    this.emotionKeywords = {
      positive: ['happy', 'excited', 'grateful', 'amazing', 'wonderful', 'love', 'blessed', 'fantastic', 'awesome', 'great'],
      negative: ['sad', 'depressed', 'anxious', 'worried', 'stressed', 'hate', 'terrible', 'awful', 'horrible', 'devastated'],
      stress: ['overwhelmed', 'pressure', 'deadline', 'exam', 'finals', 'study', 'homework', 'project', 'assignment', 'busy']
    };
    
    this.init();
  }

  async init() {
    // Check if user is logged in and extension is enabled
    const settings = await this.getSettings();
    if (!settings.enabled) return;

    this.setupEventListeners();
    this.startMonitoring();
    this.createFloatingWidget();
    
    // Send initial page load event
    this.trackPageVisit();
  }

  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['enabled', 'apiToken', 'userId'], (result) => {
        resolve({
          enabled: result.enabled !== false, // Default to true
          apiToken: result.apiToken,
          userId: result.userId
        });
      });
    });
  }

  setupEventListeners() {
    // Track scrolling patterns
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      this.sessionData.scrollEvents.push({
        timestamp: Date.now(),
        scrollY: window.scrollY,
        scrollSpeed: this.calculateScrollSpeed()
      });
      
      scrollTimeout = setTimeout(() => {
        this.analyzeScrollPattern();
      }, 1000);
    });

    // Track click patterns
    document.addEventListener('click', (event) => {
      this.sessionData.clickEvents.push({
        timestamp: Date.now(),
        element: event.target.tagName,
        className: event.target.className,
        text: event.target.textContent?.substring(0, 50)
      });
    });

    // Monitor text input (for typing pattern analysis)
    document.addEventListener('input', (event) => {
      if (event.target.matches('textarea, input[type="text"], [contenteditable]')) {
        this.analyzeTextInput(event);
      }
    });

    // Track time spent on page
    setInterval(() => {
      this.sessionData.timeSpent = Date.now() - this.sessionData.startTime;
    }, 1000);

    // Monitor for emotional content
    this.observeContentChanges();
  }

  calculateScrollSpeed() {
    const events = this.sessionData.scrollEvents;
    if (events.length < 2) return 0;
    
    const last = events[events.length - 1];
    const previous = events[events.length - 2];
    
    const timeDiff = last.timestamp - previous.timestamp;
    const scrollDiff = Math.abs(last.scrollY - previous.scrollY);
    
    return timeDiff > 0 ? scrollDiff / timeDiff : 0;
  }

  analyzeScrollPattern() {
    const events = this.sessionData.scrollEvents.slice(-10); // Last 10 scroll events
    if (events.length < 5) return;

    const avgSpeed = events.reduce((sum, e) => sum + (e.scrollSpeed || 0), 0) / events.length;
    const rapidScrolling = events.filter(e => (e.scrollSpeed || 0) > 5).length;
    
    // Rapid scrolling might indicate anxiety or restlessness
    if (rapidScrolling > 3 && avgSpeed > 3) {
      this.triggerMicroIntervention('breathing', 'Take a moment to breathe deeply');
    }
  }

  analyzeTextInput(event) {
    const text = event.target.value || event.target.textContent;
    if (!text || text.length < 10) return;

    // Analyze emotional content of user's posts/comments
    const sentiment = this.analyzeTextSentiment(text);
    
    this.sessionData.textInteractions.push({
      timestamp: Date.now(),
      length: text.length,
      sentiment: sentiment,
      platform: this.detectPlatform()
    });

    // Send to backend for AI analysis
    this.sendTextForAnalysis(text, sentiment);

    // Trigger intervention if negative sentiment detected
    if (sentiment.label === 'negative' && sentiment.confidence > 0.7) {
      this.suggestPositiveAlternative(text);
    }
  }

  analyzeTextSentiment(text) {
    const words = text.toLowerCase().split(/\W+/);
    let positiveScore = 0;
    let negativeScore = 0;
    let stressScore = 0;

    words.forEach(word => {
      if (this.emotionKeywords.positive.includes(word)) positiveScore++;
      if (this.emotionKeywords.negative.includes(word)) negativeScore++;
      if (this.emotionKeywords.stress.includes(word)) stressScore++;
    });

    let label = 'neutral';
    let confidence = 0.5;

    if (stressScore > 0 && stressScore >= positiveScore) {
      label = 'stressed';
      confidence = Math.min(0.7 + stressScore * 0.1, 0.95);
    } else if (negativeScore > positiveScore) {
      label = 'negative';
      confidence = Math.min(0.6 + negativeScore * 0.1, 0.95);
    } else if (positiveScore > negativeScore) {
      label = 'positive';
      confidence = Math.min(0.6 + positiveScore * 0.1, 0.95);
    }

    return { label, confidence };
  }

  async sendTextForAnalysis(text, sentiment) {
    const settings = await this.getSettings();
    if (!settings.apiToken) return;

    try {
      await fetch(`${this.apiUrl}/emotions/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiToken}`
        },
        body: JSON.stringify({
          text: text,
          platform: this.detectPlatform(),
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to send analysis:', error);
    }
  }

  detectPlatform() {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.includes('facebook')) return 'facebook';
    if (hostname.includes('instagram')) return 'instagram';
    if (hostname.includes('twitter') || hostname.includes('x.com')) return 'twitter';
    if (hostname.includes('discord')) return 'discord';
    if (hostname.includes('reddit')) return 'reddit';
    if (hostname.includes('youtube')) return 'youtube';
    if (hostname.includes('tiktok')) return 'tiktok';
    return 'unknown';
  }

  observeContentChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.analyzeNewContent(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  analyzeNewContent(element) {
    // Look for potentially triggering content
    const textContent = element.textContent?.toLowerCase() || '';
    
    const triggerWords = [
      'suicide', 'depression', 'anxiety', 'panic', 'overwhelmed',
      'hopeless', 'worthless', 'alone', 'isolated', 'stressed'
    ];

    const hasTriggerContent = triggerWords.some(word => textContent.includes(word));
    
    if (hasTriggerContent) {
      this.showContentWarning(element);
    }

    // Analyze emotional tone of feed content
    const sentiment = this.analyzeTextSentiment(textContent);
    if (sentiment.label === 'negative' && sentiment.confidence > 0.6) {
      this.trackNegativeContentExposure();
    }
  }

  showContentWarning(element) {
    const warning = document.createElement('div');
    warning.className = 'mindful-campus-warning';
    warning.innerHTML = `
      <div style="
        background: rgba(255, 193, 7, 0.1);
        border: 1px solid #ffc107;
        border-radius: 8px;
        padding: 12px;
        margin: 8px 0;
        font-size: 14px;
        color: #856404;
        display: flex;
        align-items: center;
        justify-content: space-between;
      ">
        <div>
          <strong>⚠️ Mindful Moment</strong><br>
          This content might affect your wellbeing. Take a breath before engaging.
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #856404;
        ">×</button>
      </div>
    `;
    
    element.parentNode?.insertBefore(warning, element);
  }

  trackNegativeContentExposure() {
    const exposure = {
      timestamp: Date.now(),
      platform: this.detectPlatform(),
      url: window.location.href
    };

    // Store exposure data
    chrome.storage.local.get(['negativeExposure'], (result) => {
      const exposures = result.negativeExposure || [];
      exposures.push(exposure);
      
      // Keep only last 100 exposures
      if (exposures.length > 100) {
        exposures.splice(0, exposures.length - 100);
      }
      
      chrome.storage.local.set({ negativeExposure: exposures });
      
      // Check if intervention is needed
      this.checkExposureIntervention(exposures);
    });
  }

  checkExposureIntervention(exposures) {
    const recentExposures = exposures.filter(
      e => Date.now() - e.timestamp < 30 * 60 * 1000 // Last 30 minutes
    );

    if (recentExposures.length > 5) {
      this.triggerMicroIntervention(
        'break',
        'You\'ve encountered several concerning posts. Consider taking a social media break.'
      );
    }
  }

  createFloatingWidget() {
    const widget = document.createElement('div');
    widget.id = 'mindful-campus-widget';
    widget.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
        cursor: pointer;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
        transition: all 0.3s ease;
      " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        🧠
      </div>
    `;

    widget.addEventListener('click', () => {
      this.showQuickMoodCheck();
    });

    document.body.appendChild(widget);
  }

  showQuickMoodCheck() {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
      " onclick="this.remove()">
        <div style="
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          color: #333;
        " onclick="event.stopPropagation()">
          <h3 style="margin: 0 0 16px 0; color: #667eea;">Quick Mood Check</h3>
          <p style="margin: 0 0 20px 0; color: #666;">How are you feeling right now?</p>
          
          <div style="display: flex; justify-content: space-around; margin-bottom: 20px;">
            <button onclick="this.closest('[onclick]').recordMood('positive')" style="
              background: #4caf50;
              border: none;
              border-radius: 8px;
              padding: 12px;
              color: white;
              cursor: pointer;
              font-size: 24px;
            ">😊</button>
            <button onclick="this.closest('[onclick]').recordMood('neutral')" style="
              background: #ff9800;
              border: none;
              border-radius: 8px;
              padding: 12px;
              color: white;
              cursor: pointer;
              font-size: 24px;
            ">😐</button>
            <button onclick="this.closest('[onclick]').recordMood('negative')" style="
              background: #f44336;
              border: none;
              border-radius: 8px;
              padding: 12px;
              color: white;
              cursor: pointer;
              font-size: 24px;
            ">😞</button>
          </div>
          
          <button onclick="this.closest('div[onclick]').remove()" style="
            width: 100%;
            background: #667eea;
            border: none;
            border-radius: 8px;
            padding: 12px;
            color: white;
            cursor: pointer;
          ">Close</button>
        </div>
      </div>
    `;

    modal.recordMood = async (mood) => {
      await this.recordQuickMood(mood);
      modal.remove();
    };

    document.body.appendChild(modal);
  }

  async recordQuickMood(mood) {
    const settings = await this.getSettings();
    if (!settings.apiToken) return;

    try {
      await fetch(`${this.apiUrl}/emotions/mood-entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiToken}`
        },
        body: JSON.stringify({
          mood: mood,
          timestamp: new Date().toISOString(),
          platform: this.detectPlatform()
        })
      });

      this.showNotification(`Mood recorded: ${mood}`, 'success');
    } catch (error) {
      console.error('Failed to record mood:', error);
    }
  }

  triggerMicroIntervention(type, message) {
    const intervention = document.createElement('div');
    intervention.className = 'mindful-campus-intervention';
    intervention.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 6px 25px rgba(102, 126, 234, 0.3);
        z-index: 10000;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
      ">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <strong>🧘‍♀️ Mindful Moment</strong>
            <p style="margin: 8px 0 0 0; font-size: 14px;">${message}</p>
          </div>
          <button onclick="this.closest('div').closest('div').remove()" style="
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            margin-left: 12px;
          ">×</button>
        </div>
      </div>
    `;

    document.body.appendChild(intervention);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (intervention.parentNode) {
        intervention.remove();
      }
    }, 5000);
  }

  suggestPositiveAlternative(originalText) {
    const suggestions = [
      "Consider reframing this thought more positively",
      "What's one good thing that happened today?",
      "How might you encourage a friend in this situation?",
      "What would you tell someone you care about facing this?",
      "Can you find a silver lining in this experience?"
    ];

    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    this.triggerMicroIntervention('reframe', randomSuggestion);
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      ">
        ${message}
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }

  async trackPageVisit() {
    const settings = await this.getSettings();
    if (!settings.apiToken) return;

    try {
      await fetch(`${this.apiUrl}/extension/page-interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiToken}`
        },
        body: JSON.stringify({
          url: window.location.href,
          platform: this.detectPlatform(),
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Failed to track page visit:', error);
    }
  }

  startMonitoring() {
    // Check for signs of compulsive browsing
    setInterval(() => {
      this.checkBrowsingPatterns();
    }, 60000); // Check every minute

    // Track session duration
    setInterval(() => {
      this.checkSessionDuration();
    }, 300000); // Check every 5 minutes
  }

  checkBrowsingPatterns() {
    const timeSpent = Date.now() - this.sessionData.startTime;
    const scrollEvents = this.sessionData.scrollEvents.length;
    const clickEvents = this.sessionData.clickEvents.length;

    // Excessive scrolling pattern detection
    if (scrollEvents > 100 && timeSpent < 600000) { // 100 scrolls in 10 minutes
      this.triggerMicroIntervention(
        'awareness',
        'You\'ve been scrolling quite a bit. How are you feeling right now?'
      );
    }

    // Rapid clicking pattern
    const recentClicks = this.sessionData.clickEvents.filter(
      click => Date.now() - click.timestamp < 60000 // Last minute
    );

    if (recentClicks.length > 20) {
      this.triggerMicroIntervention(
        'slow-down',
        'Take a moment to slow down and breathe deeply.'
      );
    }
  }

  checkSessionDuration() {
    const timeSpent = Date.now() - this.sessionData.startTime;
    const hoursSpent = timeSpent / (1000 * 60 * 60);

    if (hoursSpent > 2) {
      this.triggerMicroIntervention(
        'break',
        'You\'ve been browsing for over 2 hours. Consider taking a break and going for a walk.'
      );
    } else if (hoursSpent > 1) {
      this.triggerMicroIntervention(
        'check-in',
        'You\'ve been online for an hour. How are you feeling? Remember to stay hydrated!'
      );
    }
  }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .mindful-campus-intervention {
    animation: slideInRight 0.3s ease;
  }

  .mindful-campus-warning {
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
document.head.appendChild(style);

// Initialize the monitor when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MindfulCampusMonitor();
  });
} else {
  new MindfulCampusMonitor();
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getMoodData') {
    const monitor = window.mindfulCampusMonitor;
    if (monitor) {
      sendResponse({
        sessionData: monitor.sessionData,
        platform: monitor.detectPlatform(),
        timeSpent: Date.now() - monitor.sessionData.startTime
      });
    }
  } else if (request.action === 'triggerMoodCheck') {
    const monitor = window.mindfulCampusMonitor;
    if (monitor) {
      monitor.showQuickMoodCheck();
    }
  } else if (request.action === 'enableMonitoring') {
    location.reload(); // Restart monitoring
  }
  
  return true;
});

// Store reference for popup communication
window.mindfulCampusMonitor = new MindfulCampusMonitor();
// Add this to the existing content.js
class DataCollector {
  constructor() {
    this.sessionData = {
      startTime: Date.now(),
      platform: this.detectPlatform(),
      interactions: 0,
      textAnalyzed: 0,
      sentimentScores: []
    };
  }

  detectPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes('facebook')) return 'facebook';
    if (hostname.includes('instagram')) return 'instagram';
    if (hostname.includes('twitter')) return 'twitter';
    return 'unknown';
  }

  async sendMoodToWebApp(emotion, confidence, text) {
    // Send to background script, which forwards to web app
    chrome.runtime.sendMessage({
      action: 'submitMoodData',
      data: {
        mood: emotion.toLowerCase(),
        confidence: confidence,
        context: text.substring(0, 100), // First 100 chars only
        platform: this.sessionData.platform
      }
    });

    this.sessionData.sentimentScores.push({
      emotion: emotion,
      confidence: confidence,
      timestamp: Date.now()
    });
  }

  sendSessionData() {
    // Send collected session data to web app
    chrome.runtime.sendMessage({
      action: 'socialMediaAnalysis',
      data: {
        platform: this.sessionData.platform,
        timeSpent: Date.now() - this.sessionData.startTime,
        interactions: this.sessionData.interactions,
        sentiment: {
          averageConfidence: this.getAverageConfidence(),
          emotionBreakdown: this.getEmotionBreakdown()
        }
      }
    });
  }

  getAverageConfidence() {
    if (this.sessionData.sentimentScores.length === 0) return 0;
    const total = this.sessionData.sentimentScores.reduce((sum, score) => sum + score.confidence, 0);
    return total / this.sessionData.sentimentScores.length;
  }

  getEmotionBreakdown() {
    const emotions = {};
    this.sessionData.sentimentScores.forEach(score => {
      emotions[score.emotion] = (emotions[score.emotion] || 0) + 1;
    });
    return emotions;
  }
}

// Initialize data collector
const dataCollector = new DataCollector();

// Send session data when user leaves page
window.addEventListener('beforeunload', () => {
  dataCollector.sendSessionData();
});
