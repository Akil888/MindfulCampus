class MindfulCampusPopup {
  constructor() {
    this.apiUrl = 'http://localhost:8000';
    this.currentMood = 'unknown';
    this.stats = {
      wellnessStreak: 0,
      dailyCheckins: 0,
      timeOnline: 0,
      interventionsToday: 0
    };
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    try {
      console.log('Initializing MindfulCampus popup...');
      await this.loadUserData();
      this.setupEventListeners();
      this.updateUI();
      this.startUpdateInterval();
    } catch (error) {
      console.error('Failed to initialize popup:', error);
      this.showError('Failed to initialize. Using demo mode.');
      this.initDemoMode();
    }
  }

  initDemoMode() {
    console.log('Running in demo mode...');
    this.currentMood = 'neutral';
    this.stats = {
      wellnessStreak: 7,
      dailyCheckins: 3,
      timeOnline: 45,
      interventionsToday: 2
    };
    this.setupEventListeners();
    this.updateUI();
    this.hideLoading();
  }

  async loadUserData() {
    try {
      const settings = await this.getSettings();
      
      if (!settings.apiToken) {
        console.log('No API token found, showing login prompt');
        this.showLoginPrompt();
        return;
      }

      // Try to load data, fall back to demo mode if API is down
      try {
        await Promise.all([
          this.loadCurrentMood(),
          this.loadStats(),
          this.loadActiveInterventions()
        ]);
        this.updateConnectionStatus(true);
      } catch (apiError) {
        console.warn('API unavailable, using demo data:', apiError);
        this.initDemoMode();
        this.updateConnectionStatus(false);
        return;
      }
      
    } catch (error) {
      console.error('Failed to load user data:', error);
      this.initDemoMode();
    } finally {
      this.hideLoading();
    }
  }

  async getSettings() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(['enabled', 'apiToken', 'userId'], (result) => {
          resolve({
            enabled: result.enabled !== false,
            apiToken: result.apiToken || 'demo_token',
            userId: result.userId || 'demo_user'
          });
        });
      } else {
        // Fallback for testing
        resolve({
          enabled: true,
          apiToken: 'demo_token',
          userId: 'demo_user'
        });
      }
    });
  }

  async loadCurrentMood() {
    // Simulate API call with demo data
    const moods = ['positive', 'neutral', 'negative', 'stressed'];
    this.currentMood = moods[Math.floor(Math.random() * moods.length)];
    this.lastMoodUpdate = new Date();
  }

  async loadStats() {
    // Generate realistic demo stats
    this.stats = {
      wellnessStreak: Math.floor(Math.random() * 15) + 1,
      dailyCheckins: Math.floor(Math.random() * 5) + 1,
      timeOnline: Math.floor(Math.random() * 120) + 15,
      interventionsToday: Math.floor(Math.random() * 4)
    };
  }

  async loadActiveInterventions() {
    // Demo intervention
    if (Math.random() > 0.7) {
      this.showIntervention({
        id: 'demo_intervention',
        title: 'Take a Deep Breath',
        description: 'Try the 4-7-8 breathing technique to calm your mind',
        duration: '3 minutes',
        type: 'breathing'
      });
    }
  }

  setupEventListeners() {
    console.log('Setting up event listeners...');

    // Mood buttons
    const moodButtons = document.querySelectorAll('.mood-btn');
    console.log(`Found ${moodButtons.length} mood buttons`);
    
    moodButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        console.log('Mood button clicked:', e.target.dataset.mood);
        const mood = e.target.dataset.mood;
        if (mood) {
          this.recordMood(mood);
        }
      });
    });

    // Quick actions - Check if elements exist before adding listeners
    const quickMoodBtn = document.getElementById('quick-mood-btn');
    if (quickMoodBtn) {
      quickMoodBtn.addEventListener('click', () => this.triggerQuickMoodCheck());
    }

    const breathingBtn = document.getElementById('breathing-exercise-btn');
    if (breathingBtn) {
      breathingBtn.addEventListener('click', () => this.startBreathingExercise());
    }

    const supportBtn = document.getElementById('support-network-btn');
    if (supportBtn) {
      supportBtn.addEventListener('click', () => this.openSupportNetwork());
    }

    const insightsBtn = document.getElementById('insights-btn');
    if (insightsBtn) {
      insightsBtn.addEventListener('click', () => this.openInsights());
    }

    console.log('Event listeners setup complete');
  }

  async recordMood(mood) {
    console.log(`Recording mood: ${mood}`);
    
    try {
      // Update local state immediately for responsive UI
      this.currentMood = mood;
      this.lastMoodUpdate = new Date();
      this.stats.dailyCheckins++;
      this.updateUI();
      
      // Show success message
      this.showSuccessMessage(`Mood recorded: ${this.getMoodEmoji(mood)}`);
      
      // Try to send to API (will fail gracefully if offline)
      try {
        const settings = await this.getSettings();
        const response = await fetch(`${this.apiUrl}/emotions/mood-entry`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiToken}`
          },
          body: JSON.stringify({
            mood: mood,
            timestamp: new Date().toISOString(),
            source: 'extension_popup'
          })
        });

        if (!response.ok) {
          throw new Error('API request failed');
        }
        
        console.log('Mood successfully sent to API');
      } catch (apiError) {
        console.warn('Failed to send mood to API (using local storage):', apiError);
        // Store locally if API is unavailable
        this.storeMoodLocally(mood);
      }
      
    } catch (error) {
      console.error('Failed to record mood:', error);
      this.showErrorMessage('Failed to record mood');
    }
  }

  storeMoodLocally(mood) {
    const moodEntry = {
      mood: mood,
      timestamp: new Date().toISOString(),
      source: 'extension_popup_offline'
    };
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['offlineMoods'], (result) => {
        const moods = result.offlineMoods || [];
        moods.push(moodEntry);
        chrome.storage.local.set({ offlineMoods: moods });
      });
    }
  }

  triggerQuickMoodCheck() {
    console.log('Quick mood check triggered');
    // Send message to content script or close popup
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'triggerMoodCheck' });
        }
      });
    } catch (error) {
      console.warn('Cannot communicate with content script:', error);
    }
    window.close();
  }

  startBreathingExercise() {
    console.log('Starting breathing exercise');
    this.showBreathingExercise();
  }

  showBreathingExercise() {
    const content = document.getElementById('main-content');
    if (!content) {
      console.error('Main content element not found');
      return;
    }

    content.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <h3 style="margin-bottom: 20px;">4-7-8 Breathing Exercise</h3>
        <div id="breathing-circle" style="
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: linear-gradient(45deg, #667eea, #764ba2);
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          transition: transform 4s ease-in-out;
        ">
          Ready?
        </div>
        <div id="breathing-instruction" style="font-size: 16px; margin-bottom: 20px;">
          Click Start to begin
        </div>
        <button id="start-breathing" class="btn btn-primary" style="margin-right: 10px;">
          Start Exercise
        </button>
        <button id="back-to-main" class="btn">
          Back
        </button>
      </div>
    `;

    // Set up breathing exercise listeners
    const startBtn = document.getElementById('start-breathing');
    const backBtn = document.getElementById('back-to-main');
    
    if (startBtn) {
      startBtn.addEventListener('click', () => this.runBreathingCycle());
    }
    
    if (backBtn) {
      backBtn.addEventListener('click', () => this.resetToMainView());
    }
  }

  runBreathingCycle() {
    console.log('Running breathing cycle');
    const circle = document.getElementById('breathing-circle');
    const instruction = document.getElementById('breathing-instruction');
    
    if (!circle || !instruction) return;

    let step = 0;
    const steps = ['Inhale (4s)', 'Hold (7s)', 'Exhale (8s)', 'Rest (2s)'];
    const durations = [4000, 7000, 8000, 2000];

    const cycle = () => {
      instruction.textContent = steps[step];
      
      if (step === 0) { // Inhale
        circle.style.transform = 'scale(1.3)';
      } else if (step === 2) { // Exhale
        circle.style.transform = 'scale(1)';
      }

      setTimeout(() => {
        step = (step + 1) % 4;
        if (step === 0) {
          instruction.textContent = 'Cycle complete. Continue?';
          setTimeout(cycle, 1000);
        } else {
          cycle();
        }
      }, durations[step]);
    };

    cycle();
  }

  openSupportNetwork() {
    this.openWebApp('#/support');
  }

  openInsights() {
    this.openWebApp('#/insights');
  }

  openWebApp(path = '') {
    try {
      chrome.tabs.create({ url: `http://localhost:3000${path}` });
      window.close();
    } catch (error) {
      console.error('Failed to open web app:', error);
      this.showErrorMessage('Cannot open web app. Make sure it\'s running on localhost:3000');
    }
  }

  showIntervention(intervention) {
    const section = document.getElementById('intervention-section');
    const content = document.getElementById('intervention-content');
    
    if (!section || !content) return;
    
    content.innerHTML = `
      <div class="intervention-card">
        <div class="intervention-text">
          <strong>${intervention.title}</strong><br>
          ${intervention.description}
        </div>
        <div class="intervention-actions">
          <button class="btn btn-primary" onclick="window.mindfulPopup.startIntervention('${intervention.id}')">
            Start (${intervention.duration})
          </button>
          <button class="btn" onclick="window.mindfulPopup.dismissIntervention('${intervention.id}')">
            Later
          </button>
        </div>
      </div>
    `;
    
    section.classList.remove('hidden');
  }

  startIntervention(id) {
    console.log(`Starting intervention: ${id}`);
    this.showSuccessMessage('Intervention started! 🎉');
    this.dismissIntervention(id);
  }

  dismissIntervention(id) {
    const section = document.getElementById('intervention-section');
    if (section) {
      section.classList.add('hidden');
    }
  }

  updateUI() {
    console.log('Updating UI with current data');
    
    // Update current mood display
    const moodEmoji = document.getElementById('current-mood-emoji');
    const moodLabel = document.getElementById('current-mood-label');
    const moodTime = document.getElementById('current-mood-time');
    
    if (moodEmoji) moodEmoji.textContent = this.getMoodEmoji(this.currentMood);
    if (moodLabel) moodLabel.textContent = this.getMoodLabel(this.currentMood);
    if (moodTime && this.lastMoodUpdate) {
      moodTime.textContent = `Last updated: ${this.lastMoodUpdate.toLocaleTimeString()}`;
    }

    // Update stats
    const elements = {
      'wellness-streak': this.stats.wellnessStreak,
      'daily-checkins': this.stats.dailyCheckins,
      'time-online': `${this.stats.timeOnline}m`,
      'interventions-today': this.stats.interventionsToday
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });

    // Highlight current mood button
    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.mood === this.currentMood) {
        btn.classList.add('active');
      }
    });
  }

  getMoodEmoji(mood) {
    const emojis = {
      positive: '😊',
      neutral: '😐',
      negative: '😞',
      stressed: '😰',
      unknown: '🤔'
    };
    return emojis[mood] || '🤔';
  }

  getMoodLabel(mood) {
    const labels = {
      positive: 'Positive',
      neutral: 'Neutral',
      negative: 'Negative',
      stressed: 'Stressed',
      unknown: 'Unknown'
    };
    return labels[mood] || 'Unknown';
  }

  updateConnectionStatus(connected) {
    const indicator = document.getElementById('connection-status');
    const text = document.getElementById('status-text');
    
    if (indicator && text) {
      if (connected) {
        indicator.className = 'status-indicator status-online';
        text.textContent = 'Connected to MindfulCampus';
      } else {
        indicator.className = 'status-indicator status-offline';
        text.textContent = 'Demo Mode (API Offline)';
      }
    }
  }

  hideLoading() {
    const loading = document.getElementById('loading');
    const mainContent = document.getElementById('main-content');
    
    if (loading) loading.classList.add('hidden');
    if (mainContent) mainContent.classList.remove('hidden');
  }

  showLoginPrompt() {
    const content = document.getElementById('main-content');
    if (!content) return;

    content.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 48px; margin-bottom: 20px;">🔐</div>
        <h3 style="margin-bottom: 16px;">Welcome to MindfulCampus!</h3>
        <p style="margin-bottom: 24px; opacity: 0.9; font-size: 14px;">
          Please log in to start tracking your mental wellness journey.
        </p>
        <button id="login-btn" class="btn btn-primary" style="width: 100%; padding: 12px;">
          Open MindfulCampus & Login
        </button>
        <button id="demo-btn" class="btn" style="width: 100%; padding: 12px; margin-top: 10px;">
          Try Demo Mode
        </button>
      </div>
    `;

    const loginBtn = document.getElementById('login-btn');
    const demoBtn = document.getElementById('demo-btn');

    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.openWebApp('/login'));
    }

    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        this.initDemoMode();
        this.resetToMainView();
      });
    }

    this.hideLoading();
  }

  showSuccessMessage(message) {
    this.showMessage(message, 'success');
  }

  showErrorMessage(message) {
    this.showMessage(message, 'error');
  }

  showError(message) {
    this.showMessage(message, 'error');
  }

  showMessage(message, type) {
    console.log(`${type.toUpperCase()}: ${message}`);
    
    const messageEl = document.createElement('div');
    messageEl.innerHTML = `
      <div style="
        position: fixed;
        top: 10px;
        left: 10px;
        right: 10px;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        padding: 12px;
        border-radius: 6px;
        font-size: 12px;
        text-align: center;
        z-index: 1000;
        animation: slideDown 0.3s ease;
      ">
        ${message}
      </div>
    `;

    document.body.appendChild(messageEl);

    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove();
      }
    }, 3000);
  }

  resetToMainView() {
    window.location.reload();
  }

  startUpdateInterval() {
    // Update stats every 30 seconds
    setInterval(() => {
      // Simulate some activity
      if (Math.random() > 0.8) {
        this.stats.timeOnline += Math.floor(Math.random() * 5) + 1;
        this.updateUI();
      }
    }, 30000);
  }
}

// Initialize popup when DOM is ready
const popup = new MindfulCampusPopup();

// Make it globally accessible for onclick handlers
window.mindfulPopup = popup;

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);