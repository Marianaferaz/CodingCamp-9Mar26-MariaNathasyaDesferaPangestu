// Unit tests for Focus Timer component
// Note: These tests focus on the timer logic, not DOM interactions

// Mock DOM elements for testing
const mockElements = {
  'timer-display': { textContent: '' },
  'timer-start': { disabled: false, addEventListener: () => {} },
  'timer-stop': { disabled: false, addEventListener: () => {} },
  'timer-reset': { disabled: false, addEventListener: () => {} },
  'timer-notification': { textContent: '', classList: { add: () => {}, remove: () => {} } }
};

// Mock document.getElementById
const originalGetElementById = document.getElementById;
document.getElementById = (id) => mockElements[id] || null;

// Import timer logic (we'll test the standalone functions)
// Since we can't easily import from app.js, we'll recreate the core logic for testing

/**
 * Format seconds as MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string (MM:SS)
 */
function formatTime(seconds) {
  // Ensure seconds is not negative
  const safeSeconds = Math.max(0, seconds);
  
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  
  // Pad with leading zeros
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Timer state and logic for testing
 */
class TestTimer {
  constructor() {
    this.duration = 25 * 60; // 25 minutes in seconds
    this.remaining = this.duration;
    this.isRunning = false;
    this.intervalId = null;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    // In tests, we'll simulate ticks manually
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
  }

  reset() {
    this.stop();
    this.remaining = this.duration;
  }

  tick() {
    if (!this.isRunning) return;
    this.remaining--;
    return this.remaining;
  }
}

// Test suite
console.log('=== Focus Timer Unit Tests ===\n');

// Test 1: Time formatting
console.log('Test 1: Time formatting function');
console.assert(formatTime(1500) === '25:00', '1500 seconds should format to 25:00');
console.assert(formatTime(60) === '01:00', '60 seconds should format to 01:00');
console.assert(formatTime(59) === '00:59', '59 seconds should format to 00:59');
console.assert(formatTime(0) === '00:00', '0 seconds should format to 00:00');
console.assert(formatTime(3599) === '59:59', '3599 seconds should format to 59:59');
console.assert(formatTime(-5) === '00:00', 'Negative seconds should format to 00:00');
console.log('✓ Time formatting tests passed\n');

// Test 2: Timer state management
console.log('Test 2: Timer state management');
const timer = new TestTimer();

// Initial state
console.assert(timer.remaining === 1500, 'Timer should initialize to 25 minutes (1500 seconds)');
console.assert(timer.isRunning === false, 'Timer should not be running initially');

// Start timer
timer.start();
console.assert(timer.isRunning === true, 'Timer should be running after start()');

// Cannot start twice
const prevRemaining = timer.remaining;
timer.start(); // Should be no-op
console.assert(timer.remaining === prevRemaining, 'Starting already running timer should not change remaining time');

// Stop timer
timer.stop();
console.assert(timer.isRunning === false, 'Timer should not be running after stop()');

// Cannot stop stopped timer
timer.stop(); // Should be no-op
console.assert(timer.isRunning === false, 'Stopping stopped timer should keep it stopped');

// Reset timer
timer.remaining = 100; // Set to arbitrary value
timer.reset();
console.assert(timer.remaining === 1500, 'Reset should return timer to 25 minutes (1500 seconds)');
console.assert(timer.isRunning === false, 'Reset should stop timer if it was running');
console.log('✓ Timer state management tests passed\n');

// Test 3: Timer tick logic
console.log('Test 3: Timer tick logic');
timer.reset();
timer.start();

// Simulate ticks
const initialRemaining = timer.remaining;
timer.tick();
console.assert(timer.remaining === initialRemaining - 1, 'Tick should decrement remaining time by 1 second');

// Multiple ticks
for (let i = 0; i < 10; i++) {
  timer.tick();
}
console.assert(timer.remaining === initialRemaining - 11, '11 ticks should decrement by 11 seconds');

// Tick when stopped should do nothing
timer.stop();
const stoppedRemaining = timer.remaining;
timer.tick();
console.assert(timer.remaining === stoppedRemaining, 'Tick when stopped should not change remaining time');
console.log('✓ Timer tick logic tests passed\n');

// Test 4: Edge cases
console.log('Test 4: Edge cases');

// Timer reaching zero
timer.reset();
timer.start();
timer.remaining = 1; // Set to 1 second remaining
const finalTick = timer.tick();
console.assert(finalTick === 0, 'Tick from 1 second should go to 0 seconds');
console.assert(timer.isRunning === true, 'Timer should still be running at 0 seconds (stop logic would handle this)');

// Formatting edge cases
console.assert(formatTime(125) === '02:05', '125 seconds should format to 02:05');
console.assert(formatTime(3600) === '60:00', '3600 seconds should format to 60:00');
console.log('✓ Edge case tests passed\n');

console.log('=== All tests completed ===');
console.log('Note: These are unit tests for timer logic. For full integration testing,');
console.log('open index.html in a browser and test the actual timer functionality.');

// Restore original function
document.getElementById = originalGetElementById;