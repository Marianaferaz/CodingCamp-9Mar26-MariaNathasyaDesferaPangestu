# Implementation Plan: Productivity Dashboard

## Overview

This plan implements a client-side productivity dashboard with vanilla HTML, CSS, and JavaScript. The implementation follows a component-based architecture where each module (Greeting, Timer, Tasks, Links, Theme, Storage) is self-contained and manages its own state and DOM interactions. All user data persists in browser Local Storage.

The implementation proceeds in phases: project setup, core infrastructure (Storage Service), individual components, integration, and testing. Each component is built with its core functionality first, followed by optional property-based tests to validate correctness properties.

## Tasks

- [x] 1. Set up project structure and HTML foundation
  - Create directory structure: `css/`, `js/`, `tests/unit/`, `tests/properties/`
  - Create `index.html` with semantic HTML5 structure and component containers
  - Create empty `css/styles.css` and `js/app.js` files
  - Set up basic HTML structure with sections for greeting, timer, tasks, links, and theme toggle
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 2. Implement Storage Service module
  - [x] 2.1 Create StorageService with save and load methods
    - Implement `save(key, data)` with JSON serialization and error handling
    - Implement `load(key, defaultValue)` with JSON deserialization and error handling
    - Add try-catch blocks for QuotaExceededError, SecurityError, and JSON parse errors
    - Log errors to console with descriptive messages
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 2.2 Write property test for data serialization round-trip
    - **Property 25: Data Serialization Round-Trip**
    - **Validates: Requirements 8.4**
  
  - [ ]* 2.3 Write property test for corrupted data handling
    - **Property 26: Corrupted Data Handling**
    - **Validates: Requirements 8.5**

- [x] 3. Implement Greeting Display component
  - [x] 3.1 Create GreetingDisplay module with time/date display
    - Implement `init()` to load user name from storage and start clock
    - Implement `getGreeting(hour)` to return time-appropriate greeting
    - Implement `updateDisplay()` to show current time, date, and greeting
    - Implement `startClock()` with setInterval to update every second
    - Format time in 12-hour format with AM/PM
    - Format date with day, month, and year
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  
  - [x] 3.2 Add custom name personalization
    - Implement name input field and save functionality
    - Include custom name in greeting message when set
    - Show generic greeting when no name is configured
    - Save name to Local Storage on change
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ]* 3.3 Write property tests for greeting component
    - **Property 1: Time Format Validity**
    - **Property 2: Date Format Completeness**
    - **Property 3: Greeting Correctness Across All Hours**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**
  
  - [ ]* 3.4 Write property tests for name personalization
    - **Property 4: Custom Name Inclusion**
    - **Property 5: Name Storage Round-Trip**
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [-] 4. Implement Focus Timer component
  - [ ] 4.1 Create FocusTimer module with countdown logic
    - Implement timer state with 25-minute duration (1500 seconds)
    - Implement `start()` to begin countdown with setInterval
    - Implement `stop()` to pause countdown
    - Implement `reset()` to return to 25 minutes
    - Implement `tick()` to decrement time and check for completion
    - Implement `formatTime(seconds)` to display MM:SS format
    - Update display every second while running
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7_
  
  - [ ] 4.2 Add timer completion notification
    - Show notification when countdown reaches zero
    - Stop timer automatically at completion
    - _Requirements: 3.5_
  
  - [ ]* 4.3 Write property tests for timer operations
    - **Property 6: Timer Format Consistency**
    - **Property 7: Timer Start Decrements Time**
    - **Property 8: Timer Stop Preserves Time**
    - **Property 9: Timer Reset Idempotence**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.6**

- [~] 5. Checkpoint - Verify greeting and timer functionality
  - Ensure greeting updates every second with correct time-based message
  - Ensure timer counts down correctly and can be started, stopped, and reset
  - Ensure all tests pass, ask the user if questions arise

- [~] 6. Implement Task List component
  - [ ] 6.1 Create TaskList module with CRUD operations
    - Implement task state with array of task objects
    - Implement `addTask(text)` to create new task with ID, text, completed, createdAt
    - Implement `editTask(id, newText)` to update task text
    - Implement `toggleComplete(id)` to flip completion status
    - Implement `deleteTask(id)` to remove task from list
    - Implement `save()` to persist tasks to Local Storage
    - Implement `load()` to restore tasks from Local Storage
    - Validate non-empty task text before adding
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [ ] 6.2 Add task sorting functionality
    - Implement `getSortedTasks()` with three sort modes: default, alphabetical, completion
    - Implement `setSortMode(mode)` to change sorting and persist preference
    - Default sort: order by createdAt timestamp
    - Alphabetical sort: order by text using localeCompare
    - Completion sort: incomplete tasks before completed tasks
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ] 6.3 Implement task list UI rendering
    - Render sorted task list with checkboxes for completion
    - Add click handlers for edit, toggle complete, and delete
    - Add input field for new task entry
    - Add sort mode selector
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 6.4 Write property tests for task operations
    - **Property 10: Task Addition Increases List Size**
    - **Property 11: Task Edit Preserves Identity**
    - **Property 12: Task Completion Toggle**
    - **Property 13: Task Deletion Removes Task**
    - **Property 14: Default Task Ordering**
    - **Property 15: Task List Storage Round-Trip**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**
  
  - [ ]* 6.5 Write property tests for task sorting
    - **Property 16: Alphabetical Sort Correctness**
    - **Property 17: Completion Sort Correctness**
    - **Property 18: Sort Preference Persistence**
    - **Validates: Requirements 5.2, 5.3, 5.4**

- [~] 7. Implement Quick Links component
  - [ ] 7.1 Create QuickLinks module with link management
    - Implement links state with array of link objects
    - Implement `isValidUrl(url)` to validate HTTP/HTTPS URLs
    - Implement `addLink(name, url)` to create new link with validation
    - Implement `deleteLink(id)` to remove link from list
    - Implement `save()` to persist links to Local Storage
    - Implement `load()` to restore links from Local Storage
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6_
  
  - [ ] 7.2 Implement quick links UI
    - Render links list with clickable links that open in new tab
    - Add input fields for link name and URL
    - Add delete button for each link
    - Show validation error for invalid URLs
    - _Requirements: 6.1, 6.2, 6.3, 6.6_
  
  - [ ]* 7.3 Write property tests for quick links
    - **Property 19: Quick Link Addition**
    - **Property 20: Quick Link Deletion**
    - **Property 21: Quick Links Storage Round-Trip**
    - **Property 22: URL Validation Correctness**
    - **Validates: Requirements 6.1, 6.3, 6.4, 6.5, 6.6**

- [~] 8. Implement Theme Manager component
  - [ ] 8.1 Create ThemeManager module with light/dark mode
    - Implement theme state with current theme value
    - Implement `applyTheme(theme)` to set data-theme attribute on document
    - Implement `toggle()` to switch between light and dark themes
    - Load saved theme preference from Local Storage on init
    - Save theme preference to Local Storage on change
    - Default to light theme if no preference exists
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [ ]* 8.2 Write property tests for theme management
    - **Property 23: Theme Application**
    - **Property 24: Theme Preference Persistence**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5**

- [~] 9. Checkpoint - Verify all components work independently
  - Ensure tasks can be added, edited, completed, deleted, and sorted
  - Ensure quick links can be added, deleted, and opened in new tabs
  - Ensure theme toggle switches between light and dark modes
  - Ensure all data persists across page reloads
  - Ensure all tests pass, ask the user if questions arise

- [~] 10. Implement CSS styling
  - [ ] 10.1 Create base styles and layout
    - Define CSS custom properties for light theme colors
    - Define CSS custom properties for dark theme colors using [data-theme="dark"]
    - Create responsive grid/flexbox layout for dashboard components
    - Style typography with readable font sizes and line heights
    - Ensure sufficient color contrast for accessibility
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ] 10.2 Style individual components
    - Style greeting display with prominent time and date
    - Style timer with large countdown display and control buttons
    - Style task list with checkboxes, edit/delete buttons, and sort controls
    - Style quick links as clickable cards or buttons
    - Style theme toggle button
    - Add hover and focus states for interactive elements
    - _Requirements: 12.1, 12.2, 12.3, 12.5_
  
  - [ ] 10.3 Add responsive design and polish
    - Ensure layout works on mobile, tablet, and desktop screens
    - Add smooth transitions for theme switching
    - Add visual feedback for button clicks (within 100ms)
    - Ensure minimal, clean aesthetic without clutter
    - _Requirements: 9.2, 12.5_

- [~] 11. Create App Controller and integrate components
  - [ ] 11.1 Create main App object in app.js
    - Implement `App.init()` to initialize all components in correct order
    - Initialize StorageService first
    - Initialize all components: GreetingDisplay, FocusTimer, TaskList, QuickLinks, ThemeManager
    - Add error handling for component initialization failures
    - Call App.init() on DOMContentLoaded event
    - _Requirements: 11.4, 11.5_
  
  - [ ] 11.2 Verify component integration
    - Test that all components load data from storage on init
    - Test that all components save data to storage on changes
    - Test that theme applies to all components
    - Verify no component initialization errors in console
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [~] 12. Performance optimization and browser compatibility
  - [ ] 12.1 Optimize performance
    - Ensure initial page load completes within 2 seconds
    - Verify timer updates don't cause visible lag or jitter
    - Ensure Local Storage operations don't block UI
    - Add debouncing to frequent save operations if needed
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ] 12.2 Test browser compatibility
    - Test in latest Chrome, Firefox, Edge, and Safari
    - Verify all Web APIs used are supported (Local Storage, Date, setInterval)
    - Fix any browser-specific issues
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 13. Final integration testing and polish
  - [ ]* 13.1 Run all unit tests
    - Execute all unit tests for components
    - Verify edge cases and error conditions
    - Ensure 80% code coverage minimum
  
  - [ ]* 13.2 Run all property-based tests
    - Execute all 26 property tests with 100 iterations each
    - Verify all correctness properties hold
    - Fix any property violations discovered
  
  - [ ] 13.3 End-to-end manual testing
    - Test complete user workflow: set name, start timer, add tasks, add links, switch theme
    - Test data persistence by closing and reopening browser
    - Test error scenarios: invalid URLs, empty inputs, corrupted storage
    - Verify all requirements are met
    - _Requirements: All_

- [ ] 14. Final checkpoint - Complete implementation
  - Ensure all components are fully functional and integrated
  - Ensure all data persists correctly across sessions
  - Ensure UI is responsive and performs well
  - Ensure code is clean, well-organized, and follows best practices
  - Ask the user if any final adjustments are needed

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation uses vanilla JavaScript with no frameworks or build tools
- All data is stored client-side using Local Storage API
- Property tests use fast-check library with minimum 100 iterations
- Unit tests and property tests are complementary - both provide value
- Checkpoints ensure incremental validation and user feedback opportunities
