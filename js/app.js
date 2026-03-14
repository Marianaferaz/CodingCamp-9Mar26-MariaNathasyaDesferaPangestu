// Productivity Dashboard Application

// Storage Service Module
const StorageService = {
  /**
   * Save data to Local Storage
   * @param {string} key - Storage key
   * @param {any} data - Data to store (will be JSON serialized)
   * @returns {boolean} Success status
   */
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      // Handle specific storage errors
      if (error.name === 'QuotaExceededError') {
        console.error(`Storage quota exceeded for key "${key}". Data not saved.`);
      } else if (error.name === 'SecurityError') {
        console.error(`Security error accessing localStorage for key "${key}". Check browser settings.`);
      } else {
        console.error(`Error saving data for key "${key}":`, error);
      }
      return false;
    }
  },

  /**
   * Load data from Local Storage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist or is invalid
   * @returns {any} Parsed data or default value
   */
  load(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      // Handle JSON parse errors and other storage errors
      if (error instanceof SyntaxError) {
        console.error(`Corrupted JSON data for key "${key}". Returning default value.`);
      } else if (error.name === 'SecurityError') {
        console.error(`Security error accessing localStorage for key "${key}". Returning default value.`);
      } else {
        console.error(`Error loading data for key "${key}":`, error);
      }
      return defaultValue;
    }
  }
};
// Greeting Display Component
const GreetingDisplay = {
  state: {
    userName: '',
    intervalId: null
  },

  /**
   * Initialize greeting display
   * Load user name from storage, setup name input, start clock
   */
  init() {
    // Load user name from storage
    this.state.userName = StorageService.load('dashboard_user_name', '');
    
    // Setup name input event listener
    this.setupNameInput();
    
    // Start the clock to update time every second
    this.startClock();
  },

  /**
   * Setup name input field event listener
   */
  setupNameInput() {
    const nameInput = document.getElementById('user-name-input');
    if (!nameInput) {
      console.error('Name input element not found');
      return;
    }

    // Set current name in input field
    nameInput.value = this.state.userName;

    // Add input event listener to save name on change
    nameInput.addEventListener('input', (event) => {
      const newName = event.target.value.trim();
      this.saveUserName(newName);
    });
  },

  /**
   * Save user name to storage and update state
   * @param {string} name - User name to save
   */
  saveUserName(name) {
    this.state.userName = name;
    StorageService.save('dashboard_user_name', name);
    this.updateDisplay(); // Update greeting with new name
  },

  /**
   * Get time-appropriate greeting based on hour
   * @param {number} hour - Current hour (0-23)
   * @returns {string} Greeting message
   */
  getGreeting(hour) {
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
  },

  /**
   * Format time in 12-hour format with AM/PM
   * @param {Date} date - Date object
   * @returns {string} Formatted time string
   */
  formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    
    // Pad with leading zeros
    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');
    
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds} ${ampm}`;
  },

  /**
   * Format date with day, month, and year
   * @param {Date} date - Date object
   * @returns {string} Formatted date string
   */
  formatDate(date) {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  },

  /**
   * Update time, date, and greeting display in DOM
   */
  updateDisplay() {
    const now = new Date();
    const hour = now.getHours();
    
    // Get DOM elements
    const timeDisplay = document.getElementById('time-display');
    const dateDisplay = document.getElementById('date-display');
    const greetingMessage = document.getElementById('greeting-message');
    
    // Update time display
    if (timeDisplay) {
      timeDisplay.textContent = this.formatTime(now);
    }
    
    // Update date display
    if (dateDisplay) {
      dateDisplay.textContent = this.formatDate(now);
    }
    
    // Update greeting message
    if (greetingMessage) {
      const greeting = this.getGreeting(hour);
      if (this.state.userName) {
        greetingMessage.textContent = `${greeting}, ${this.state.userName}!`;
      } else {
        greetingMessage.textContent = `${greeting}!`;
      }
    }
  },

  /**
   * Start clock update interval (updates every second)
   */
  startClock() {
    // Update immediately
    this.updateDisplay();
    
    // Set interval to update every second
    this.state.intervalId = setInterval(() => {
      this.updateDisplay();
    }, 1000);
  },

  /**
   * Stop clock update interval
   */
  stopClock() {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }
  }
};
// Main Application Controller
const App = {
  /**
   * Initialize all dashboard components
   */
  init() {
    console.log('Initializing Productivity Dashboard...');
    
    try {
      // Initialize components in order
      GreetingDisplay.init();
      FocusTimer.init();
      
      // TODO: Initialize other components as they are implemented
      // TaskList.init();
      // QuickLinks.init();
      // ThemeManager.init();
      
      console.log('Dashboard initialized successfully');
    } catch (error) {
      console.error('Error initializing dashboard:', error);
    }
  }
};

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
// Focus Timer Component
const FocusTimer = {
  state: {
    duration: 25 * 60, // 25 minutes in seconds (1500 seconds)
    remaining: 25 * 60,
    isRunning: false,
    intervalId: null
  },

  /**
   * Initialize timer component
   * Setup event listeners for controls and render initial state
   */
  init() {
    // Load any saved timer state if needed (optional)
    // For now, we'll always start fresh with 25 minutes
    
    // Setup control button event listeners
    this.setupControls();
    
    // Render initial timer display
    this.render();
    
    console.log('Focus Timer initialized');
  },

  /**
   * Setup event listeners for timer control buttons
   */
  setupControls() {
    const startBtn = document.getElementById('timer-start');
    const stopBtn = document.getElementById('timer-stop');
    const resetBtn = document.getElementById('timer-reset');
    
    if (startBtn) {
      startBtn.addEventListener('click', () => this.start());
    } else {
      console.error('Timer start button not found');
    }
    
    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stop());
    } else {
      console.error('Timer stop button not found');
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset());
    } else {
      console.error('Timer reset button not found');
    }
  },

  /**
   * Start timer countdown
   * Begins interval to decrement time every second
   */
  start() {
    // If already running, do nothing
    if (this.state.isRunning) {
      return;
    }
    
    this.state.isRunning = true;
    
    // Start interval to update timer every second
    this.state.intervalId = setInterval(() => this.tick(), 1000);
    
    // Update button states
    this.updateControls();
    
    console.log('Timer started');
  },

  /**
   * Stop/pause timer countdown
   * Clears the update interval
   */
  stop() {
    // If not running, do nothing
    if (!this.state.isRunning) {
      return;
    }
    
    this.state.isRunning = false;
    
    // Clear the update interval
    clearInterval(this.state.intervalId);
    this.state.intervalId = null;
    
    // Update button states
    this.updateControls();
    
    console.log('Timer stopped');
  },

  /**
   * Reset timer to 25 minutes
   * Stops timer if running and resets remaining time
   */
  reset() {
    // Stop timer if it's running
    this.stop();
    
    // Reset remaining time to full duration
    this.state.remaining = this.state.duration;
    
    // Clear any notification
    this.clearNotification();
    
    // Update display
    this.render();
    
    console.log('Timer reset to 25:00');
  },

  /**
   * Timer tick - decrement time and check for completion
   * Called every second while timer is running
   */
  tick() {
    // Decrement remaining time
    this.state.remaining--;
    
    // Update display
    this.render();
    
    // Check if timer has reached zero
    if (this.state.remaining <= 0) {
      this.stop();
      this.showCompletionNotification();
    }
  },

  /**
   * Format seconds as MM:SS
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string (MM:SS)
   */
  formatTime(seconds) {
    // Ensure seconds is not negative
    const safeSeconds = Math.max(0, seconds);
    
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    
    // Pad with leading zeros
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  },

  /**
   * Update timer display in DOM
   */
  render() {
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
      timerDisplay.textContent = this.formatTime(this.state.remaining);
    }
  },

  /**
   * Update control button states (enable/disable)
   */
  updateControls() {
    const startBtn = document.getElementById('timer-start');
    const stopBtn = document.getElementById('timer-stop');
    const resetBtn = document.getElementById('timer-reset');
    
    if (startBtn) {
      startBtn.disabled = this.state.isRunning;
    }
    
    if (stopBtn) {
      stopBtn.disabled = !this.state.isRunning;
    }
    
    if (resetBtn) {
      // Reset button is always enabled
      resetBtn.disabled = false;
    }
  },

  /**
   * Show completion notification when timer reaches zero
   */
  showCompletionNotification() {
    const notification = document.getElementById('timer-notification');
    if (notification) {
      notification.textContent = 'Time\'s up! Focus session complete.';
      notification.classList.add('show');
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        this.clearNotification();
      }, 5000);
    }
    
    // Optional: Play a sound or use browser notifications
    // this.playCompletionSound();
  },

  /**
   * Clear completion notification
   */
  clearNotification() {
    const notification = document.getElementById('timer-notification');
    if (notification) {
      notification.textContent = '';
      notification.classList.remove('show');
    }
  },

  /**
   * Play completion sound (optional enhancement)
   */
  playCompletionSound() {
    // This is an optional enhancement
    // Could use Web Audio API or HTML5 Audio
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  }
};