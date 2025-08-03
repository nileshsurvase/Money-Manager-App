// Comprehensive Accessibility (A11y) System for ClarityOS
// WCAG 2.1 AA Compliance

// Accessibility configuration
const A11Y_CONFIG = {
  // Enable/disable accessibility features
  enabled: true,
  
  // Screen reader announcements
  announcements: true,
  
  // High contrast mode
  highContrast: false,
  
  // Reduced motion
  reducedMotion: false,
  
  // Large text
  largeText: false,
  
  // Focus management
  focusManagement: true,
  
  // Keyboard navigation
  keyboardNavigation: true
};

// Screen reader utilities
let ariaLiveRegion = null;

// Initialize accessibility features
export const initializeAccessibility = () => {
  if (!A11Y_CONFIG.enabled) return;

  try {
    // Create ARIA live region for announcements
    createAriaLiveRegion();
    
    // Set up keyboard navigation
    setupKeyboardNavigation();
    
    // Set up focus management
    setupFocusManagement();
    
    // Check user preferences
    checkUserPreferences();
    
    // Set up accessibility event listeners
    setupAccessibilityListeners();
    
    console.log('Accessibility features initialized');
  } catch (error) {
    console.error('Accessibility initialization failed:', error);
  }
};

// Create ARIA live region for screen reader announcements
const createAriaLiveRegion = () => {
  if (ariaLiveRegion) return;
  
  ariaLiveRegion = document.createElement('div');
  ariaLiveRegion.setAttribute('aria-live', 'polite');
  ariaLiveRegion.setAttribute('aria-atomic', 'true');
  ariaLiveRegion.setAttribute('class', 'sr-only');
  ariaLiveRegion.style.cssText = `
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  `;
  
  document.body.appendChild(ariaLiveRegion);
};

// Announce message to screen readers
export const announceToScreenReader = (message, priority = 'polite') => {
  if (!A11Y_CONFIG.announcements || !ariaLiveRegion) return;
  
  ariaLiveRegion.setAttribute('aria-live', priority);
  ariaLiveRegion.textContent = message;
  
  // Clear after announcement
  setTimeout(() => {
    if (ariaLiveRegion) {
      ariaLiveRegion.textContent = '';
    }
  }, 1000);
};

// Keyboard navigation setup
const setupKeyboardNavigation = () => {
  if (!A11Y_CONFIG.keyboardNavigation) return;
  
  // Tab trap for modals
  document.addEventListener('keydown', handleKeyboardNavigation);
  
  // Skip links
  addSkipLinks();
};

// Handle keyboard navigation
const handleKeyboardNavigation = (event) => {
  const { key, ctrlKey, altKey, shiftKey } = event;
  
  // Escape key - close modals/dropdowns
  if (key === 'Escape') {
    closeActiveModals();
    return;
  }
  
  // Alt + 1-4 - Quick app switching
  if (altKey && ['1', '2', '3', '4'].includes(key)) {
    event.preventDefault();
    const appIndex = parseInt(key) - 1;
    const apps = ['money-manager', 'my-diary', 'goals', 'freedomos'];
    if (apps[appIndex]) {
      switchToApp(apps[appIndex]);
    }
    return;
  }
  
  // Ctrl + K - Global search
  if (ctrlKey && key === 'k') {
    event.preventDefault();
    openGlobalSearch();
    return;
  }
  
  // Arrow keys for navigation
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
    handleArrowNavigation(event);
  }
  
  // Enter and Space for activation
  if (['Enter', ' '].includes(key)) {
    handleActivation(event);
  }
};

// Add skip links for keyboard users
const addSkipLinks = () => {
  const skipLinks = document.createElement('div');
  skipLinks.className = 'skip-links';
  skipLinks.innerHTML = `
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <a href="#navigation" class="skip-link">Skip to navigation</a>
    <a href="#search" class="skip-link">Skip to search</a>
  `;
  
  // Style skip links
  const style = document.createElement('style');
  style.textContent = `
    .skip-links {
      position: absolute;
      top: -40px;
      left: 6px;
      z-index: 9999;
    }
    
    .skip-link {
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      z-index: 10000;
    }
    
    .skip-link:focus {
      top: 6px;
    }
  `;
  
  document.head.appendChild(style);
  document.body.insertBefore(skipLinks, document.body.firstChild);
};

// Focus management
const setupFocusManagement = () => {
  if (!A11Y_CONFIG.focusManagement) return;
  
  // Track focus for restoration
  let lastFocusedElement = null;
  
  document.addEventListener('focusin', (event) => {
    lastFocusedElement = event.target;
  });
  
  // Focus trap for modals
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      trapFocusInModal(event);
    }
  });
  
  // Store last focused element for restoration
  window.lastFocusedElement = lastFocusedElement;
};

// Trap focus within modal
const trapFocusInModal = (event) => {
  const modal = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
  if (!modal) return;
  
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  } else {
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
};

// Check user preferences from system/browser
const checkUserPreferences = () => {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    A11Y_CONFIG.reducedMotion = true;
    document.documentElement.classList.add('reduce-motion');
    announceToScreenReader('Reduced motion enabled');
  }
  
  // Check for high contrast preference
  if (window.matchMedia('(prefers-contrast: high)').matches) {
    A11Y_CONFIG.highContrast = true;
    document.documentElement.classList.add('high-contrast');
    announceToScreenReader('High contrast mode enabled');
  }
  
  // Check for color scheme preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }
  
  // Load saved preferences
  loadAccessibilityPreferences();
};

// Load accessibility preferences from storage
const loadAccessibilityPreferences = () => {
  try {
    const preferences = JSON.parse(localStorage.getItem('clarityos_a11y_preferences') || '{}');
    
    Object.keys(preferences).forEach(key => {
      if (A11Y_CONFIG.hasOwnProperty(key)) {
        A11Y_CONFIG[key] = preferences[key];
      }
    });
    
    applyAccessibilitySettings();
  } catch (error) {
    console.warn('Error loading accessibility preferences:', error);
  }
};

// Save accessibility preferences
export const saveAccessibilityPreferences = () => {
  try {
    localStorage.setItem('clarityos_a11y_preferences', JSON.stringify(A11Y_CONFIG));
  } catch (error) {
    console.warn('Error saving accessibility preferences:', error);
  }
};

// Apply accessibility settings
const applyAccessibilitySettings = () => {
  const html = document.documentElement;
  
  // High contrast
  if (A11Y_CONFIG.highContrast) {
    html.classList.add('high-contrast');
  } else {
    html.classList.remove('high-contrast');
  }
  
  // Reduced motion
  if (A11Y_CONFIG.reducedMotion) {
    html.classList.add('reduce-motion');
  } else {
    html.classList.remove('reduce-motion');
  }
  
  // Large text
  if (A11Y_CONFIG.largeText) {
    html.classList.add('large-text');
  } else {
    html.classList.remove('large-text');
  }
};

// Toggle accessibility features
export const toggleHighContrast = () => {
  A11Y_CONFIG.highContrast = !A11Y_CONFIG.highContrast;
  applyAccessibilitySettings();
  saveAccessibilityPreferences();
  announceToScreenReader(`High contrast ${A11Y_CONFIG.highContrast ? 'enabled' : 'disabled'}`);
};

export const toggleReducedMotion = () => {
  A11Y_CONFIG.reducedMotion = !A11Y_CONFIG.reducedMotion;
  applyAccessibilitySettings();
  saveAccessibilityPreferences();
  announceToScreenReader(`Reduced motion ${A11Y_CONFIG.reducedMotion ? 'enabled' : 'disabled'}`);
};

export const toggleLargeText = () => {
  A11Y_CONFIG.largeText = !A11Y_CONFIG.largeText;
  applyAccessibilitySettings();
  saveAccessibilityPreferences();
  announceToScreenReader(`Large text ${A11Y_CONFIG.largeText ? 'enabled' : 'disabled'}`);
};

// ARIA helpers
export const setAriaLabel = (element, label) => {
  if (element && label) {
    element.setAttribute('aria-label', label);
  }
};

export const setAriaDescribedBy = (element, describedById) => {
  if (element && describedById) {
    element.setAttribute('aria-describedby', describedById);
  }
};

export const setAriaExpanded = (element, expanded) => {
  if (element) {
    element.setAttribute('aria-expanded', expanded.toString());
  }
};

export const setAriaHidden = (element, hidden) => {
  if (element) {
    element.setAttribute('aria-hidden', hidden.toString());
  }
};

// Focus utilities
export const focusElement = (element, options = {}) => {
  if (!element) return;
  
  element.focus(options);
  
  // Announce focus change if needed
  const label = element.getAttribute('aria-label') || 
                element.getAttribute('title') || 
                element.textContent?.trim();
  
  if (label && options.announce) {
    announceToScreenReader(`Focused on ${label}`);
  }
};

export const restoreFocus = () => {
  if (window.lastFocusedElement && document.contains(window.lastFocusedElement)) {
    window.lastFocusedElement.focus();
  }
};

// Color contrast utilities
export const checkColorContrast = (foreground, background) => {
  const getLuminance = (color) => {
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return {
    ratio,
    AA: ratio >= 4.5,
    AAA: ratio >= 7
  };
};

// Keyboard navigation helpers
const handleArrowNavigation = (event) => {
  const focusedElement = document.activeElement;
  const parent = focusedElement.closest('[role="menu"], [role="listbox"], [role="grid"]');
  
  if (!parent) return;
  
  const items = parent.querySelectorAll('[role="menuitem"], [role="option"], [role="gridcell"]');
  const currentIndex = Array.from(items).indexOf(focusedElement);
  
  if (currentIndex === -1) return;
  
  let nextIndex;
  
  switch (event.key) {
    case 'ArrowDown':
      nextIndex = (currentIndex + 1) % items.length;
      break;
    case 'ArrowUp':
      nextIndex = (currentIndex - 1 + items.length) % items.length;
      break;
    case 'ArrowRight':
      nextIndex = Math.min(currentIndex + 1, items.length - 1);
      break;
    case 'ArrowLeft':
      nextIndex = Math.max(currentIndex - 1, 0);
      break;
    default:
      return;
  }
  
  event.preventDefault();
  items[nextIndex].focus();
};

const handleActivation = (event) => {
  const element = event.target;
  
  if (element.hasAttribute('role')) {
    const role = element.getAttribute('role');
    
    if (['button', 'menuitem', 'option'].includes(role)) {
      event.preventDefault();
      element.click();
    }
  }
};

// Utility functions for common accessibility tasks
const closeActiveModals = () => {
  const modals = document.querySelectorAll('[role="dialog"]:not([aria-hidden="true"])');
  modals.forEach(modal => {
    const closeButton = modal.querySelector('[aria-label*="close"], [data-dismiss="modal"]');
    if (closeButton) {
      closeButton.click();
    }
  });
};

const switchToApp = (appId) => {
  const appButton = document.querySelector(`[data-app="${appId}"]`);
  if (appButton) {
    appButton.click();
    announceToScreenReader(`Switched to ${appId.replace('-', ' ')}`);
  }
};

const openGlobalSearch = () => {
  const searchInput = document.querySelector('[role="search"] input, [type="search"]');
  if (searchInput) {
    searchInput.focus();
    announceToScreenReader('Global search opened');
  }
};

// Set up accessibility event listeners
const setupAccessibilityListeners = () => {
  // Listen for preference changes
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    A11Y_CONFIG.reducedMotion = e.matches;
    applyAccessibilitySettings();
  });
  
  window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
    A11Y_CONFIG.highContrast = e.matches;
    applyAccessibilitySettings();
  });
  
  // Listen for keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    // Alt + A - Accessibility menu
    if (event.altKey && event.key === 'a') {
      event.preventDefault();
      openAccessibilityMenu();
    }
  });
};

const openAccessibilityMenu = () => {
  // This would open an accessibility settings panel
  announceToScreenReader('Accessibility menu opened');
};

// Accessibility testing utilities
export const runAccessibilityAudit = () => {
  const issues = [];
  
  // Check for missing alt text
  const images = document.querySelectorAll('img:not([alt])');
  if (images.length > 0) {
    issues.push(`${images.length} images missing alt text`);
  }
  
  // Check for missing form labels
  const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
  const unlabeledInputs = Array.from(inputs).filter(input => {
    const label = document.querySelector(`label[for="${input.id}"]`);
    return !label;
  });
  
  if (unlabeledInputs.length > 0) {
    issues.push(`${unlabeledInputs.length} form inputs missing labels`);
  }
  
  // Check for low contrast
  // This would require more complex color analysis
  
  return issues;
};

// Export configuration for external access
export const getAccessibilityConfig = () => ({ ...A11Y_CONFIG });

export const updateAccessibilityConfig = (updates) => {
  Object.assign(A11Y_CONFIG, updates);
  applyAccessibilitySettings();
  saveAccessibilityPreferences();
};

export default {
  initialize: initializeAccessibility,
  announce: announceToScreenReader,
  toggleHighContrast,
  toggleReducedMotion,
  toggleLargeText,
  focusElement,
  restoreFocus,
  checkColorContrast,
  runAccessibilityAudit,
  getConfig: getAccessibilityConfig,
  updateConfig: updateAccessibilityConfig
}; 