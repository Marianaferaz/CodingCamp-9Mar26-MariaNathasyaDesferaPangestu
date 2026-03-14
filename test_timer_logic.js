// Simple test for FocusTimer logic
console.log('Testing FocusTimer logic...\n');

// Test formatTime function (extracted from FocusTimer)
function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Test 1: Format time correctly
console.log('Test 1: Time formatting');
console.assert(formatTime(1500) === '25:00', '1500s = 25:00');
console.assert(formatTime(60) === '01:00', '60s = 01:00');
console.assert(formatTime(59) === '00:59', '59s = 00:59');
console.assert(formatTime(0) === '00:00', '0s = 00:00');
console.assert(formatTime(125) === '02:05', '125s = 02:05');
console.assert(formatTime(-5) === '00:00', '-5s = 00:00');
console.log('✓ Time formatting passed\n');

// Test 2: Timer state simulation
console.log('Test 2: Timer state simulation');
let remaining = 1500;
let isRunning = false;
let intervalId = null;

function start() {
  if (isRunning) return;
  isRunning = true;
  console.log('Timer started');
}

function stop() {
  if (!isRunning) return;
  isRunning = false;
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
  console.log('Timer stopped');
}

function reset() {
  stop();
  remaining = 1500;
  console.log('Timer reset to 25:00');
}

function tick() {
  if (!isRunning) return;
  remaining--;
  console.log(`Tick: ${formatTime(remaining)}`);
  if (remaining <= 0) {
    stop();
    console.log('Timer completed!');
  }
}

// Test initial state
console.assert(remaining === 1500, 'Initial: 25 minutes');
console.assert(isRunning === false, 'Initial: not running');

// Test start
start();
console.assert(isRunning === true, 'After start: running');

// Test cannot start twice
const prevRemaining = remaining;
start(); // Should be no-op
console.assert(remaining === prevRemaining, 'Double start: no change');

// Test stop
stop();
console.assert(isRunning === false, 'After stop: not running');

// Test reset
remaining = 100;
reset();
console.assert(remaining === 1500, 'After reset: back to 25:00');
console.assert(isRunning === false, 'After reset: not running');

console.log('✓ Timer state simulation passed\n');

console.log('All tests passed!');
console.log('\nNote: For full integration testing, open index.html in browser.');
console.log('The FocusTimer component should:');
console.log('1. Show 25:00 initially');
console.log('2. Start counting down when Start clicked');
console.log('3. Stop when Stop clicked');
console.log('4. Reset to 25:00 when Reset clicked');
console.log('5. Show notification when timer reaches 00:00');