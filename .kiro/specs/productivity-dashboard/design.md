# Design Document: Productivity Dashboard

## Overview

The Productivity Dashboard is a client-side web application built with vanilla HTML, CSS, and JavaScript that provides users with time management and productivity tools. The application consists of four main functional areas: a greeting display with current time/date, a 25-minute focus timer, a task management system, and quick links to favorite websites. All user data persists locally using the browser's Local Storage API, eliminating the need for backend infrastructure.

The design emphasizes simplicity, performance, and maintainability through a modular architecture where each component manages its own state and DOM interactions. The application supports both light and dark themes with user preference persistence.

## Architecture

### System Architecture

The application follows a component-based architecture where each major feature is encapsulated in its own module. The architecture consists of:

1. **Main Application Controller** (`app.js`): Initializes all components and coordinates their lifecycle
2. **Component Modules**: Self-contained modules for each feature (Greeting, Timer, Tasks, Links, Theme)
3. **Storage Service**: Centralized interface for Local Storage operations
4. **DOM Layer**: Direct DOM manipulation within each component

### Component Structure

```
Dashboard Application
├── App Controller
│   └── Initializes and coordinates components
├── Greeting Display Component
│   ├── Time/Date Display
│   └── Personalized Greeting
├── Focus Timer Component
│   ├── Timer State Management
│   └── Control Buttons (Start/Stop/Reset)
├── Task List Component
│   ├── Task CRUD Operations
│   ├── Task Sorting
│   └── Completion Status
├── Quick Links Component
│   ├── Link Management
│   └── URL Validation
├── Theme Manager Component
│   └── Light/Dark Mode Toggle
└── Storage Service
    ├── Save Operations
    ├── Load Operations
    └── Error Handling
```

### Data Flow

1. **Initialization**: App controller loads data from Local Storage via Storage Service
2. **User Interaction**: Component handles event, updates internal state
3. **State Update**: Component updates DOM to reflect new state
4. **Persistence**: Component saves state to Local Storage via Storage Service
5. **Cross-Component Communication**: Minimal; components are largely independent

### Module Organization

```javascript
// Main structure in js/app.js
const App = {
  init() { /* Initialize all components */ },
  components: {
    greeting: GreetingDisplay,
    timer: FocusTimer,
    tasks: TaskList,
    links: QuickLinks,
    theme: ThemeManager
  }
};

// Each component follows this pattern
const ComponentName = {
  state: { /* component state */ },
  init() { /* setup */ },
  render() { /* update DOM */ },
  save() { /* persist to storage */ },
  load() { /* restore from storage */ }
};
```

## Components and Interfaces

### 1. Storage Service

Provides a centralized interface for all Local Storage operations with error handling.

```javascript
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
      console.error(`Storage error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Load data from Local Storage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Parsed data or default value
   */
  load(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Storage error for key ${key}:`, error);
      return defaultValue;
    }
  }
};
```

**Storage Keys:**
- `dashboard_user_name`: User's custom name
- `dashboard_tasks`: Array of task objects
- `dashboard_links`: Array of quick link objects
- `dashboard_theme`: Theme preference ('light' or 'dark')
- `dashboard_task_sort`: Task sorting preference

### 2. Greeting Display Component

Displays current time, date, and personalized greeting based on time of day.

```javascript
const GreetingDisplay = {
  state: {
    userName: '',
    intervalId: null
  },

  /**
   * Initialize greeting display
   */
  init() {
    this.state.userName = StorageService.load('dashboard_user_name', '');
    this.setupNameInput();
    this.startClock();
  },

  /**
   * Get time-appropriate greeting
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
   * Update time, date, and greeting display
   */
  updateDisplay() {
    const now = new Date();
    // Update time, date, and greeting in DOM
  },

  /**
   * Start clock update interval
   */
  startClock() {
    this.updateDisplay();
    this.state.intervalId = setInterval(() => this.updateDisplay(), 1000);
  }
};
```

### 3. Focus Timer Component

Implements a 25-minute countdown timer with start, stop, and reset controls.

```javascript
const FocusTimer = {
  state: {
    duration: 25 * 60, // 25 minutes in seconds
    remaining: 25 * 60,
    isRunning: false,
    intervalId: null
  },

  /**
   * Initialize timer
   */
  init() {
    this.render();
    this.setupControls();
  },

  /**
   * Start timer countdown
   */
  start() {
    if (this.state.isRunning) return;
    this.state.isRunning = true;
    this.state.intervalId = setInterval(() => this.tick(), 1000);
    this.updateControls();
  },

  /**
   * Stop/pause timer
   */
  stop() {
    this.state.isRunning = false;
    clearInterval(this.state.intervalId);
    this.updateControls();
  },

  /**
   * Reset timer to 25 minutes
   */
  reset() {
    this.stop();
    this.state.remaining = this.state.duration;
    this.render();
  },

  /**
   * Timer tick - decrement and check completion
   */
  tick() {
    this.state.remaining--;
    this.render();
    
    if (this.state.remaining <= 0) {
      this.stop();
      this.showCompletionNotification();
    }
  },

  /**
   * Format seconds as MM:SS
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
};
```

### 4. Task List Component

Manages task creation, editing, completion, deletion, and sorting.

```javascript
const TaskList = {
  state: {
    tasks: [],
    sortMode: 'default', // 'default', 'alphabetical', 'completion'
    editingId: null
  },

  /**
   * Initialize task list
   */
  init() {
    this.state.tasks = StorageService.load('dashboard_tasks', []);
    this.state.sortMode = StorageService.load('dashboard_task_sort', 'default');
    this.render();
    this.setupControls();
  },

  /**
   * Add new task
   * @param {string} text - Task description
   */
  addTask(text) {
    if (!text.trim()) return;
    
    const task = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now()
    };
    
    this.state.tasks.push(task);
    this.save();
    this.render();
  },

  /**
   * Edit existing task
   * @param {number} id - Task ID
   * @param {string} newText - Updated task text
   */
  editTask(id, newText) {
    const task = this.state.tasks.find(t => t.id === id);
    if (task && newText.trim()) {
      task.text = newText.trim();
      this.save();
      this.render();
    }
  },

  /**
   * Toggle task completion status
   * @param {number} id - Task ID
   */
  toggleComplete(id) {
    const task = this.state.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.save();
      this.render();
    }
  },

  /**
   * Delete task
   * @param {number} id - Task ID
   */
  deleteTask(id) {
    this.state.tasks = this.state.tasks.filter(t => t.id !== id);
    this.save();
    this.render();
  },

  /**
   * Sort tasks based on current sort mode
   * @returns {Array} Sorted tasks array
   */
  getSortedTasks() {
    const tasks = [...this.state.tasks];
    
    switch (this.state.sortMode) {
      case 'alphabetical':
        return tasks.sort((a, b) => a.text.localeCompare(b.text));
      case 'completion':
        return tasks.sort((a, b) => a.completed - b.completed);
      default:
        return tasks.sort((a, b) => a.createdAt - b.createdAt);
    }
  },

  /**
   * Change sort mode
   * @param {string} mode - Sort mode ('default', 'alphabetical', 'completion')
   */
  setSortMode(mode) {
    this.state.sortMode = mode;
    StorageService.save('dashboard_task_sort', mode);
    this.render();
  },

  /**
   * Save tasks to storage
   */
  save() {
    StorageService.save('dashboard_tasks', this.state.tasks);
  }
};
```

### 5. Quick Links Component

Manages user-defined website shortcuts with URL validation.

```javascript
const QuickLinks = {
  state: {
    links: []
  },

  /**
   * Initialize quick links
   */
  init() {
    this.state.links = StorageService.load('dashboard_links', []);
    this.render();
    this.setupControls();
  },

  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid URL
   */
  isValidUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  },

  /**
   * Add new quick link
   * @param {string} name - Display name
   * @param {string} url - Link URL
   * @returns {boolean} Success status
   */
  addLink(name, url) {
    if (!name.trim() || !this.isValidUrl(url)) {
      return false;
    }

    const link = {
      id: Date.now(),
      name: name.trim(),
      url: url.trim()
    };

    this.state.links.push(link);
    this.save();
    this.render();
    return true;
  },

  /**
   * Delete quick link
   * @param {number} id - Link ID
   */
  deleteLink(id) {
    this.state.links = this.state.links.filter(l => l.id !== id);
    this.save();
    this.render();
  },

  /**
   * Save links to storage
   */
  save() {
    StorageService.save('dashboard_links', this.state.links);
  }
};
```

### 6. Theme Manager Component

Handles light/dark mode switching with preference persistence.

```javascript
const ThemeManager = {
  state: {
    currentTheme: 'light'
  },

  /**
   * Initialize theme manager
   */
  init() {
    this.state.currentTheme = StorageService.load('dashboard_theme', 'light');
    this.applyTheme(this.state.currentTheme);
    this.setupToggle();
  },

  /**
   * Apply theme to document
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.state.currentTheme = theme;
  },

  /**
   * Toggle between light and dark themes
   */
  toggle() {
    const newTheme = this.state.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    StorageService.save('dashboard_theme', newTheme);
  }
};
```

## Data Models

### Task Object

```javascript
{
  id: number,          // Unique identifier (timestamp)
  text: string,        // Task description
  completed: boolean,  // Completion status
  createdAt: number    // Creation timestamp for default sorting
}
```

### Quick Link Object

```javascript
{
  id: number,    // Unique identifier (timestamp)
  name: string,  // Display name
  url: string    // Full URL (validated)
}
```

### Application State

```javascript
{
  userName: string,           // Custom user name
  tasks: Task[],              // Array of task objects
  links: QuickLink[],         // Array of quick link objects
  theme: 'light' | 'dark',    // Theme preference
  taskSort: 'default' | 'alphabetical' | 'completion'  // Sort preference
}
```

### Local Storage Schema

All data is stored as JSON strings in Local Storage:

| Key | Type | Description |
|-----|------|-------------|
| `dashboard_user_name` | string | User's custom name for greeting |
| `dashboard_tasks` | Task[] | Array of task objects |
| `dashboard_links` | QuickLink[] | Array of quick link objects |
| `dashboard_theme` | string | Theme preference ('light' or 'dark') |
| `dashboard_task_sort` | string | Task sorting mode |


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Time Format Validity

*For any* time value, the time formatting function should produce a valid 12-hour or 24-hour format string with proper hour, minute, and AM/PM indicators (for 12-hour format).

**Validates: Requirements 1.1**

### Property 2: Date Format Completeness

*For any* date value, the date formatting function should include day, month, and year components in the output string.

**Validates: Requirements 1.2**

### Property 3: Greeting Correctness Across All Hours

*For any* hour value (0-23), the greeting function should return the correct time-appropriate greeting: "Good morning" for 5-11, "Good afternoon" for 12-16, "Good evening" for 17-20, and "Good night" for 21-4.

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

### Property 4: Custom Name Inclusion

*For any* non-empty custom name string, the greeting message should contain that exact name when rendered.

**Validates: Requirements 2.1**

### Property 5: Name Storage Round-Trip

*For any* custom name string, saving it to storage and then loading it should return the identical name value.

**Validates: Requirements 2.2, 2.3**

### Property 6: Timer Format Consistency

*For any* number of seconds (0 to 1500), the timer formatting function should produce a string in MM:SS format where MM is zero-padded minutes and SS is zero-padded seconds.

**Validates: Requirements 3.6**

### Property 7: Timer Start Decrements Time

*For any* timer state with remaining time > 0, starting the timer and waiting should result in the remaining time decreasing.

**Validates: Requirements 3.2**

### Property 8: Timer Stop Preserves Time

*For any* running timer state, stopping the timer should preserve the current remaining time without further changes.

**Validates: Requirements 3.3**

### Property 9: Timer Reset Idempotence

*For any* timer state, resetting the timer should always return it to 25 minutes (1500 seconds), regardless of the current remaining time.

**Validates: Requirements 3.4**

### Property 10: Task Addition Increases List Size

*For any* valid (non-empty, non-whitespace) task text and any existing task list, adding the task should increase the list length by exactly one and the new task should appear in the list.

**Validates: Requirements 4.1**

### Property 11: Task Edit Preserves Identity

*For any* task in the list and any valid new text, editing the task should change only the text field while preserving the task ID and maintaining the list size.

**Validates: Requirements 4.2**

### Property 12: Task Completion Toggle

*For any* task in the list, toggling its completion status should flip the completed boolean value while preserving all other task properties.

**Validates: Requirements 4.3**

### Property 13: Task Deletion Removes Task

*For any* task in the list, deleting that task should decrease the list length by exactly one and the task should no longer be findable by its ID.

**Validates: Requirements 4.4**

### Property 14: Default Task Ordering

*For any* task list in default sort mode, tasks should be ordered by their createdAt timestamp in ascending order (oldest first).

**Validates: Requirements 4.5**

### Property 15: Task List Storage Round-Trip

*For any* task list state (including empty, single task, or multiple tasks), saving to storage and then loading should produce an equivalent task list with all task properties preserved.

**Validates: Requirements 4.6, 4.7**

### Property 16: Alphabetical Sort Correctness

*For any* task list with alphabetical sort mode enabled, the displayed tasks should be ordered such that each task's text is lexicographically less than or equal to the next task's text.

**Validates: Requirements 5.2**

### Property 17: Completion Sort Correctness

*For any* task list with completion sort mode enabled, all incomplete tasks (completed: false) should appear before all completed tasks (completed: true) in the displayed list.

**Validates: Requirements 5.3**

### Property 18: Sort Preference Persistence

*For any* sort mode selection ('default', 'alphabetical', 'completion'), saving the preference and then loading should return the same sort mode value.

**Validates: Requirements 5.4**

### Property 19: Quick Link Addition

*For any* valid link name and valid URL, adding the quick link should increase the links list length by exactly one and the new link should appear in the list with both name and URL preserved.

**Validates: Requirements 6.1**

### Property 20: Quick Link Deletion

*For any* quick link in the list, deleting that link should decrease the list length by exactly one and the link should no longer be findable by its ID.

**Validates: Requirements 6.3**

### Property 21: Quick Links Storage Round-Trip

*For any* quick links list state, saving to storage and then loading should produce an equivalent links list with all link properties (name and URL) preserved.

**Validates: Requirements 6.4, 6.5**

### Property 22: URL Validation Correctness

*For any* string input, the URL validation function should return true only for strings that are valid HTTP or HTTPS URLs, and false for all other inputs including malformed URLs, non-HTTP protocols, and non-URL strings.

**Validates: Requirements 6.6**

### Property 23: Theme Application

*For any* theme selection ('light' or 'dark'), applying the theme should set the document's data-theme attribute to exactly that theme value.

**Validates: Requirements 7.2, 7.3**

### Property 24: Theme Preference Persistence

*For any* theme preference ('light' or 'dark'), saving the preference and then loading should return the same theme value.

**Validates: Requirements 7.4, 7.5**

### Property 25: Data Serialization Round-Trip

*For any* valid application data object (tasks, links, name, theme, sort preference), serializing to JSON and then deserializing should produce an equivalent object with all properties preserved.

**Validates: Requirements 8.4**

### Property 26: Corrupted Data Handling

*For any* invalid or corrupted JSON string in storage, attempting to load the data should result in the default empty/initial state without throwing an error, and an error should be logged to the console.

**Validates: Requirements 8.5**

## Error Handling

### Storage Errors

The Storage Service implements try-catch blocks around all Local Storage operations to handle:

- **QuotaExceededError**: When Local Storage is full (typically 5-10MB limit)
  - Log error to console with descriptive message
  - Return false from save operation
  - Application continues with in-memory state

- **SecurityError**: When Local Storage is disabled or blocked by browser settings
  - Log error to console
  - Gracefully degrade to session-only mode (no persistence)
  - Display optional warning to user

- **JSON Parse Errors**: When stored data is corrupted or invalid
  - Log error to console with the problematic key
  - Return default value instead of throwing
  - Allow application to initialize with clean state

### Input Validation Errors

- **Empty Task Text**: Silently ignore, do not add task
- **Invalid URL Format**: Show validation error message, prevent link addition
- **Malformed Data on Load**: Use default values, log error

### Timer Edge Cases

- **Timer at Zero**: Stop timer, show completion notification, prevent negative values
- **Multiple Start Calls**: Ignore subsequent starts while timer is already running
- **Stop on Stopped Timer**: No-op, safe to call multiple times

### Component Initialization Errors

If any component fails to initialize:
- Log error to console with component name
- Continue initializing other components
- Application remains partially functional

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, error conditions, and integration points
- **Property Tests**: Verify universal properties across randomized inputs (minimum 100 iterations each)

Unit tests focus on concrete scenarios while property tests validate general correctness across the input space. Together, they provide complementary coverage where unit tests catch specific bugs and property tests verify that properties hold universally.

### Property-Based Testing Configuration

**Library Selection**: Use **fast-check** for JavaScript property-based testing

**Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must include a comment tag referencing the design document property
- Tag format: `// Feature: productivity-dashboard, Property {number}: {property_text}`

**Example Property Test Structure**:

```javascript
// Feature: productivity-dashboard, Property 3: Greeting Correctness Across All Hours
fc.assert(
  fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
    const greeting = GreetingDisplay.getGreeting(hour);
    
    if (hour >= 5 && hour < 12) {
      return greeting === 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return greeting === 'Good afternoon';
    } else if (hour >= 17 && hour < 21) {
      return greeting === 'Good evening';
    } else {
      return greeting === 'Good night';
    }
  }),
  { numRuns: 100 }
);
```

### Unit Testing Focus Areas

Unit tests should cover:

1. **Specific Examples**:
   - Timer initializes to 25 minutes
   - Empty greeting when no name is set
   - Timer completion notification at zero
   - Default theme is light when no preference exists

2. **Edge Cases**:
   - Empty task list operations
   - Single task in list
   - Task with very long text
   - URL with special characters
   - Midnight hour boundary (23 to 0)

3. **Error Conditions**:
   - Corrupted JSON in Local Storage
   - Invalid URL formats
   - Storage quota exceeded
   - Missing DOM elements

4. **Integration Points**:
   - Component initialization sequence
   - Storage service integration with components
   - Theme application across all components

### Test Organization

```
tests/
├── unit/
│   ├── greeting.test.js
│   ├── timer.test.js
│   ├── tasks.test.js
│   ├── links.test.js
│   ├── theme.test.js
│   └── storage.test.js
└── properties/
    ├── greeting.properties.test.js
    ├── timer.properties.test.js
    ├── tasks.properties.test.js
    ├── links.properties.test.js
    ├── theme.properties.test.js
    └── storage.properties.test.js
```

### Property Test Coverage

Each correctness property from the design document must be implemented as a property-based test:

- Properties 1-3: Greeting display formatting and logic
- Properties 4-5: Name personalization and persistence
- Properties 6-9: Timer operations and formatting
- Properties 10-15: Task management and persistence
- Properties 16-18: Task sorting
- Properties 19-22: Quick links management and validation
- Properties 23-24: Theme management and persistence
- Properties 25-26: Data serialization and error handling

### Testing Tools

- **Test Runner**: Jest or Mocha
- **Property Testing**: fast-check
- **DOM Testing**: jsdom for Node.js environment
- **Assertions**: Chai or Jest assertions
- **Coverage**: Istanbul/nyc for code coverage reporting

### Coverage Goals

- Minimum 80% code coverage for all components
- 100% coverage of error handling paths
- All 26 correctness properties implemented as property tests
- Edge cases covered in unit tests

