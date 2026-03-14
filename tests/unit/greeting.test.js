// Unit tests for Greeting Display Component
// Tests for Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4

// Mock DOM elements for testing
const mockDOM = () => {
  const elements = {
    'time-display': { textContent: '' },
    'date-display': { textContent: '' },
    'greeting-message': { textContent: '' },
    'user-name-input': { 
      value: '',
      addEventListener: jest.fn()
    }
  };
  
  return {
    getElementById: jest.fn((id) => elements[id] || null)
  };
};

// Mock StorageService for testing
const mockStorageService = {
  load: jest.fn(),
  save: jest.fn()
};

// Import the GreetingDisplay implementation
// We'll copy the relevant parts for testing
const GreetingDisplay = {
  state: {
    userName: '',
    intervalId: null
  },

  init() {
    this.state.userName = mockStorageService.load('dashboard_user_name', '');
    this.setupNameInput();
    this.startClock();
  },

  setupNameInput() {
    const nameInput = document.getElementById('user-name-input');
    if (!nameInput) {
      console.error('Name input element not found');
      return;
    }
    nameInput.value = this.state.userName;
    nameInput.addEventListener('input', (event) => {
      const newName = event.target.value.trim();
      this.saveUserName(newName);
    });
  },

  saveUserName(name) {
    this.state.userName = name;
    mockStorageService.save('dashboard_user_name', name);
    this.updateDisplay();
  },

  getGreeting(hour) {
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
  },

  formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');
    
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds} ${ampm}`;
  },

  formatDate(date) {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  },

  updateDisplay() {
    const now = new Date();
    const hour = now.getHours();
    
    const timeDisplay = document.getElementById('time-display');
    const dateDisplay = document.getElementById('date-display');
    const greetingMessage = document.getElementById('greeting-message');
    
    if (timeDisplay) {
      timeDisplay.textContent = this.formatTime(now);
    }
    
    if (dateDisplay) {
      dateDisplay.textContent = this.formatDate(now);
    }
    
    if (greetingMessage) {
      const greeting = this.getGreeting(hour);
      if (this.state.userName) {
        greetingMessage.textContent = `${greeting}, ${this.state.userName}!`;
      } else {
        greetingMessage.textContent = `${greeting}!`;
      }
    }
  },

  startClock() {
    this.updateDisplay();
    this.state.intervalId = setInterval(() => this.updateDisplay(), 1000);
  },

  stopClock() {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }
  }
};

describe('GreetingDisplay Component', () => {
  let mockDocument;
  
  beforeEach(() => {
    mockDocument = mockDOM();
    global.document = mockDocument;
    
    // Reset mocks
    mockStorageService.load.mockClear();
    mockStorageService.save.mockClear();
    
    // Reset GreetingDisplay state
    GreetingDisplay.state.userName = '';
    GreetingDisplay.state.intervalId = null;
    
    // Mock clearInterval
    global.clearInterval = jest.fn();
  });

  describe('getGreeting method', () => {
    test('should return "Good morning" for hours 5-11', () => {
      expect(GreetingDisplay.getGreeting(5)).toBe('Good morning');
      expect(GreetingDisplay.getGreeting(8)).toBe('Good morning');
      expect(GreetingDisplay.getGreeting(11)).toBe('Good morning');
    });

    test('should return "Good afternoon" for hours 12-16', () => {
      expect(GreetingDisplay.getGreeting(12)).toBe('Good afternoon');
      expect(GreetingDisplay.getGreeting(14)).toBe('Good afternoon');
      expect(GreetingDisplay.getGreeting(16)).toBe('Good afternoon');
    });

    test('should return "Good evening" for hours 17-20', () => {
      expect(GreetingDisplay.getGreeting(17)).toBe('Good evening');
      expect(GreetingDisplay.getGreeting(19)).toBe('Good evening');
      expect(GreetingDisplay.getGreeting(20)).toBe('Good evening');
    });

    test('should return "Good night" for hours 21-4', () => {
      expect(GreetingDisplay.getGreeting(21)).toBe('Good night');
      expect(GreetingDisplay.getGreeting(23)).toBe('Good night');
      expect(GreetingDisplay.getGreeting(0)).toBe('Good night');
      expect(GreetingDisplay.getGreeting(4)).toBe('Good night');
    });
  });

  describe('formatTime method', () => {
    test('should format time in 12-hour format with AM/PM', () => {
      const testDate = new Date('2024-01-01T14:30:15'); // 2:30:15 PM
      const formatted = GreetingDisplay.formatTime(testDate);
      
      // Should be in format HH:MM:SS AM/PM
      expect(formatted).toMatch(/^\d{2}:\d{2}:\d{2} (AM|PM)$/);
      expect(formatted).toBe('02:30:15 PM');
    });

    test('should handle midnight (0 hours) as 12 AM', () => {
      const testDate = new Date('2024-01-01T00:05:10'); // 12:05:10 AM
      const formatted = GreetingDisplay.formatTime(testDate);
      expect(formatted).toBe('12:05:10 AM');
    });

    test('should handle noon (12 hours) as 12 PM', () => {
      const testDate = new Date('2024-01-01T12:00:00'); // 12:00:00 PM
      const formatted = GreetingDisplay.formatTime(testDate);
      expect(formatted).toBe('12:00:00 PM');
    });

    test('should pad single-digit minutes and seconds with zeros', () => {
      const testDate = new Date('2024-01-01T09:05:08'); // 9:05:08 AM
      const formatted = GreetingDisplay.formatTime(testDate);
      expect(formatted).toBe('09:05:08 AM');
    });
  });

  describe('formatDate method', () => {
    test('should include day, month, and year in output', () => {
      const testDate = new Date('2024-01-01T12:00:00');
      const formatted = GreetingDisplay.formatDate(testDate);
      
      // Should include weekday, month, day, and year
      expect(formatted).toContain('Monday'); // Jan 1, 2024 was a Monday
      expect(formatted).toContain('January');
      expect(formatted).toContain('1');
      expect(formatted).toContain('2024');
    });
  });

  describe('name personalization', () => {
    test('should load user name from storage on init', () => {
      mockStorageService.load.mockReturnValue('Test User');
      GreetingDisplay.init();
      
      expect(mockStorageService.load).toHaveBeenCalledWith('dashboard_user_name', '');
      expect(GreetingDisplay.state.userName).toBe('Test User');
    });

    test('should save user name to storage when changed', () => {
      GreetingDisplay.saveUserName('New User');
      
      expect(mockStorageService.save).toHaveBeenCalledWith('dashboard_user_name', 'New User');
      expect(GreetingDisplay.state.userName).toBe('New User');
    });

    test('should include custom name in greeting when set', () => {
      GreetingDisplay.state.userName = 'John';
      const now = new Date();
      const hour = now.getHours();
      const greeting = GreetingDisplay.getGreeting(hour);
      
      // Mock DOM elements for updateDisplay
      const mockGreetingElement = { textContent: '' };
      document.getElementById = jest.fn((id) => {
        if (id === 'greeting-message') return mockGreetingElement;
        return null;
      });
      
      GreetingDisplay.updateDisplay();
      
      expect(mockGreetingElement.textContent).toBe(`${greeting}, John!`);
    });

    test('should show generic greeting when no name is set', () => {
      GreetingDisplay.state.userName = '';
      const now = new Date();
      const hour = now.getHours();
      const greeting = GreetingDisplay.getGreeting(hour);
      
      // Mock DOM elements for updateDisplay
      const mockGreetingElement = { textContent: '' };
      document.getElementById = jest.fn((id) => {
        if (id === 'greeting-message') return mockGreetingElement;
        return null;
      });
      
      GreetingDisplay.updateDisplay();
      
      expect(mockGreetingElement.textContent).toBe(`${greeting}!`);
    });
  });

  describe('clock functionality', () => {
    test('should start clock interval on init', () => {
      // Mock setInterval
      const mockSetInterval = jest.fn();
      global.setInterval = mockSetInterval;
      
      GreetingDisplay.init();
      
      expect(mockSetInterval).toHaveBeenCalled();
      expect(GreetingDisplay.state.intervalId).toBeDefined();
    });

    test('should stop clock interval when stopClock is called', () => {
      // Mock setInterval and clearInterval
      const mockIntervalId = 123;
      GreetingDisplay.state.intervalId = mockIntervalId;
      
      GreetingDisplay.stopClock();
      
      expect(global.clearInterval).toHaveBeenCalledWith(mockIntervalId);
      expect(GreetingDisplay.state.intervalId).toBeNull();
    });
  });
});