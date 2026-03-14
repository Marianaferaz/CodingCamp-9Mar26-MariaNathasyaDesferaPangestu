// Unit tests for Storage Service
// Tests for Requirements: 8.1, 8.2, 8.3, 8.4, 8.5

// Mock localStorage for testing
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    }
  };
})();

// Replace global localStorage with mock for testing
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Import the StorageService (we'll need to adjust for testing environment)
// For now, we'll copy the implementation here for testing
const StorageService = {
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
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

  load(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
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

describe('StorageService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear console.error calls
    console.error = jest.fn();
  });

  describe('save method', () => {
    test('should save data successfully', () => {
      const testData = { tasks: ['task1', 'task2'] };
      const result = StorageService.save('test-key', testData);
      
      expect(result).toBe(true);
      expect(localStorage.getItem('test-key')).toBe(JSON.stringify(testData));
    });

    test('should handle QuotaExceededError', () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const result = StorageService.save('test-key', { data: 'test' });
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Storage quota exceeded for key "test-key". Data not saved.'
      );
      
      // Restore original function
      localStorage.setItem = originalSetItem;
    });

    test('should handle SecurityError', () => {
      // Mock localStorage.setItem to throw SecurityError
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        const error = new Error('Security error');
        error.name = 'SecurityError';
        throw error;
      });

      const result = StorageService.save('test-key', { data: 'test' });
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Security error accessing localStorage for key "test-key". Check browser settings.'
      );
      
      localStorage.setItem = originalSetItem;
    });

    test('should handle generic errors', () => {
      // Mock localStorage.setItem to throw generic error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Generic error');
      });

      const result = StorageService.save('test-key', { data: 'test' });
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Error saving data for key "test-key":',
        expect.any(Error)
      );
      
      localStorage.setItem = originalSetItem;
    });
  });

  describe('load method', () => {
    test('should load existing data successfully', () => {
      const testData = { tasks: ['task1', 'task2'] };
      localStorage.setItem('test-key', JSON.stringify(testData));
      
      const result = StorageService.load('test-key');
      
      expect(result).toEqual(testData);
    });

    test('should return default value for non-existent key', () => {
      const defaultValue = { empty: true };
      const result = StorageService.load('non-existent-key', defaultValue);
      
      expect(result).toBe(defaultValue);
    });

    test('should handle JSON parse errors (corrupted data)', () => {
      // Store invalid JSON
      localStorage.setItem('corrupted-key', 'invalid-json{');
      
      const defaultValue = { default: 'value' };
      const result = StorageService.load('corrupted-key', defaultValue);
      
      expect(result).toBe(defaultValue);
      expect(console.error).toHaveBeenCalledWith(
        'Corrupted JSON data for key "corrupted-key". Returning default value.'
      );
    });

    test('should handle SecurityError on load', () => {
      // Mock localStorage.getItem to throw SecurityError
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn(() => {
        const error = new Error('Security error');
        error.name = 'SecurityError';
        throw error;
      });

      const defaultValue = { default: 'value' };
      const result = StorageService.load('test-key', defaultValue);
      
      expect(result).toBe(defaultValue);
      expect(console.error).toHaveBeenCalledWith(
        'Security error accessing localStorage for key "test-key". Returning default value.'
      );
      
      localStorage.getItem = originalGetItem;
    });

    test('should handle other errors on load', () => {
      // Mock localStorage.getItem to throw generic error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn(() => {
        throw new Error('Generic error');
      });

      const defaultValue = { default: 'value' };
      const result = StorageService.load('test-key', defaultValue);
      
      expect(result).toBe(defaultValue);
      expect(console.error).toHaveBeenCalledWith(
        'Error loading data for key "test-key":',
        expect.any(Error)
      );
      
      localStorage.getItem = originalGetItem;
    });

    test('should handle null value from localStorage', () => {
      // Mock localStorage.getItem to return null
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn(() => null);

      const defaultValue = { default: 'value' };
      const result = StorageService.load('test-key', defaultValue);
      
      expect(result).toBe(defaultValue);
      
      localStorage.getItem = originalGetItem;
    });
  });

  describe('data serialization round-trip', () => {
    test('should preserve data through save and load cycle', () => {
      const testData = {
        tasks: [
          { id: 1, text: 'Task 1', completed: false },
          { id: 2, text: 'Task 2', completed: true }
        ],
        userName: 'Test User',
        theme: 'dark',
        sortMode: 'alphabetical'
      };

      // Save the data
      const saveResult = StorageService.save('dashboard_data', testData);
      expect(saveResult).toBe(true);

      // Load the data
      const loadedData = StorageService.load('dashboard_data', {});
      
      // Verify data integrity
      expect(loadedData).toEqual(testData);
      expect(loadedData.tasks).toHaveLength(2);
      expect(loadedData.tasks[0].id).toBe(1);
      expect(loadedData.tasks[0].text).toBe('Task 1');
      expect(loadedData.tasks[0].completed).toBe(false);
      expect(loadedData.userName).toBe('Test User');
      expect(loadedData.theme).toBe('dark');
      expect(loadedData.sortMode).toBe('alphabetical');
    });

    test('should handle various data types', () => {
      const testCases = [
        { data: 'string value', description: 'string' },
        { data: 123, description: 'number' },
        { data: true, description: 'boolean' },
        { data: null, description: 'null' },
        { data: undefined, description: 'undefined' },
        { data: { nested: { object: 'value' } }, description: 'nested object' },
        { data: [1, 2, 3, 'mixed'], description: 'array' },
        { data: new Date('2024-01-01'), description: 'Date object' }
      ];

      testCases.forEach(({ data, description }) => {
        localStorage.clear();
        
        const saveResult = StorageService.save('test-key', data);
        expect(saveResult).toBe(true);
        
        const loadedData = StorageService.load('test-key');
        
        // Note: JSON.stringify/parse will convert Date to string
        // and undefined will become null in JSON
        if (description === 'Date object') {
          expect(loadedData).toBe(data.toISOString());
        } else if (description === 'undefined') {
          expect(loadedData).toBe(null); // JSON.stringify converts undefined to null
        } else {
          expect(loadedData).toEqual(data);
        }
      });
    });
  });
});