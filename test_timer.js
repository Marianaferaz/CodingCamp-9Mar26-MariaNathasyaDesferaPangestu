// Simple test for timer logic
console.log("Testing timer logic...\n");

// Test the formatTime function (from our timer)
function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Test cases for formatTime
console.log("Testing formatTime function:");
console.log("1500 seconds =", formatTime(1500), "(expected: 25:00)");
console.log("60 seconds =", formatTime(60), "(expected: 01:00)");
console.log("59 seconds =", formatTime(59), "(expected: 00:59)");
console.log("0 seconds =", formatTime(0), "(expected: 00:00)");
console.log("125 seconds =", formatTime(125), "(expected: 02:05)");
console.log("Negative seconds =", formatTime(-5), "(expected: 00:00)");

// Test timer state machine
class Timer {
  constructor() {
    this.duration = 25 * 60; // 25 minutes in seconds
    this.remaining = this.duration;
    this.isRunning = false;
    this.intervalId = null;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("Timer started");
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    console.log("Timer stopped");
  }

  reset() {
    this.stop();
    this.remaining = this.duration;
    console.log("Timer reset to", this.remaining, "seconds");
  }

  tick() {
    if (this.isRunning && this.remaining > 0) {
      this.remaining--;
      console.log(`Tick: ${formatTime(this.remaining)} remaining`);
      if (this.remaining <= 0) {
        console.log("Timer completed!");
        this.stop();
      }
    }
  }
}

console.log("\nTesting Timer class:");
const timer = new Timer();
console.log("Initial timer state - Remaining:", timer.remaining, "seconds");
console.log("Formatted time:", formatTime(timer.remaining));

timer.start();
timer.tick(); // Shouldn't decrement because timer isn't "running" in our simple test
timer.stop();
timer.reset();

console.log("\nAll timer logic tests completed!");