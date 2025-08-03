// Notification Service for Diary App
import { hasEntryForToday, getTodaysDue } from './diaryStorage';
import { Capacitor } from '@capacitor/core';

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.reminders = this.loadReminders();
    this.intervals = new Map();
    this.isCapacitor = Capacitor.isNativePlatform();
    this.LocalNotifications = null;
    this.init();
  }

  async init() {
    try {
      if (this.isCapacitor) {
        // Import Capacitor LocalNotifications for mobile
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        this.LocalNotifications = LocalNotifications;
        
        // Request permissions for mobile
        const permResult = await LocalNotifications.requestPermissions();
        this.permission = permResult.display === 'granted' ? 'granted' : 'denied';
        console.log('Mobile notification permission:', this.permission);
      } else {
        // Web browser notifications
        if (!('Notification' in window)) {
          console.warn('This browser does not support notifications');
          this.permission = 'denied';
          return;
        }
        
        // Get current permission status
        this.permission = Notification.permission;
        console.log('Web notification permission:', this.permission);
      }
      
      // Setup existing reminders only if permission is granted
      if (this.permission === 'granted') {
        this.setupAllReminders();
      }
      
      // Check for due journals on app load
      setTimeout(() => {
        this.checkDueJournals();
      }, 2000); // Wait 2 seconds after app loads
    } catch (error) {
      console.error('Error initializing notification service:', error);
      this.permission = 'denied';
    }
  }

  loadReminders() {
    try {
      const stored = localStorage.getItem('diary_reminders');
      return stored ? JSON.parse(stored) : {
        daily: { enabled: false, time: '20:00', message: 'Time for your daily journal!' },
        weekly: { enabled: false, time: '19:00', message: 'Weekly reflection time!' },
        monthly: { enabled: false, time: '18:00', message: 'Monthly review time!' },
        random: { enabled: false, frequency: 3, message: 'How are you feeling?' }
      };
    } catch (error) {
      console.error('Error loading reminders:', error);
      return {};
    }
  }

  saveReminders() {
    try {
      localStorage.setItem('diary_reminders', JSON.stringify(this.reminders));
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  }

  updateReminder(type, settings) {
    this.reminders[type] = { ...this.reminders[type], ...settings };
    this.saveReminders();
    
    // Clear existing reminder
    this.clearReminder(type);
    
    // Setup new reminder if enabled
    if (settings.enabled) {
      this.setupReminder(type);
    }
  }

  setupAllReminders() {
    Object.keys(this.reminders).forEach(type => {
      if (this.reminders[type].enabled) {
        this.setupReminder(type);
      }
    });
  }

  setupReminder(type) {
    const reminder = this.reminders[type];
    if (!reminder.enabled) return;

    switch (type) {
      case 'daily':
        this.setupDailyReminder();
        break;
      case 'weekly':
        this.setupWeeklyReminder();
        break;
      case 'monthly':
        this.setupMonthlyReminder();
        break;
      case 'random':
        this.setupRandomReminder();
        break;
    }
  }

  setupDailyReminder() {
    const reminder = this.reminders.daily;
    const [hours, minutes] = reminder.time.split(':').map(Number);
    
    const scheduleDaily = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
      
      // If time has passed today, schedule for tomorrow
      if (today <= now) {
        today.setDate(today.getDate() + 1);
      }
      
      const timeUntilReminder = today.getTime() - now.getTime();
      
      const timeoutId = setTimeout(() => {
        // Check if daily entry is already completed
        if (!hasEntryForToday('daily')) {
          this.showNotification('Daily Journal Reminder', reminder.message, {
            icon: '📝',
            tag: 'daily-reminder'
          });
        }
        
        // Schedule next day
        scheduleDaily();
      }, timeUntilReminder);
      
      this.intervals.set('daily', timeoutId);
    };
    
    scheduleDaily();
  }

  setupWeeklyReminder() {
    const reminder = this.reminders.weekly;
    const [hours, minutes] = reminder.time.split(':').map(Number);
    
    const scheduleWeekly = () => {
      const now = new Date();
        const nextSunday = new Date(now);
  
  // Find next Sunday (day 0)
  const daysUntilSunday = (7 - now.getDay()) % 7;
  if (daysUntilSunday === 0 && (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes))) {
    nextSunday.setDate(now.getDate() + 7);
  } else {
    nextSunday.setDate(now.getDate() + daysUntilSunday);
  }
  
  nextSunday.setHours(hours, minutes, 0, 0);
  
  const timeUntilReminder = nextSunday.getTime() - now.getTime();
      
      const timeoutId = setTimeout(() => {
        if (!hasEntryForToday('weekly')) {
          this.showNotification('Weekly Journal Reminder', reminder.message, {
            icon: '📖',
            tag: 'weekly-reminder'
          });
        }
        
        // Schedule next week
        scheduleWeekly();
      }, timeUntilReminder);
      
      this.intervals.set('weekly', timeoutId);
    };
    
    scheduleWeekly();
  }

  setupMonthlyReminder() {
    const reminder = this.reminders.monthly;
    const [hours, minutes] = reminder.time.split(':').map(Number);
    
    const scheduleMonthly = () => {
      const now = new Date();
      const nextFirst = new Date(now.getFullYear(), now.getMonth(), 1, hours, minutes);
      
      // If it's past the 1st of this month, schedule for next month
      if (now.getDate() > 1 || (now.getDate() === 1 && (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)))) {
        nextFirst.setMonth(nextFirst.getMonth() + 1);
      }
      
      const timeUntilReminder = nextFirst.getTime() - now.getTime();
      
      const timeoutId = setTimeout(() => {
        if (!hasEntryForToday('monthly')) {
          this.showNotification('Monthly Journal Reminder', reminder.message, {
            icon: '📅',
            tag: 'monthly-reminder'
          });
        }
        
        // Schedule next month
        scheduleMonthly();
      }, timeUntilReminder);
      
      this.intervals.set('monthly', timeoutId);
    };
    
    scheduleMonthly();
  }

  setupRandomReminder() {
    const reminder = this.reminders.random;
    
    const scheduleRandom = () => {
      // Random interval between 2-6 hours
      const minHours = 2;
      const maxHours = 6;
      const randomHours = Math.random() * (maxHours - minHours) + minHours;
      const randomMillis = randomHours * 60 * 60 * 1000;
      
      const timeoutId = setTimeout(() => {
        // Only show random reminders during waking hours (8 AM - 10 PM)
        const now = new Date();
        const hour = now.getHours();
        
        if (hour >= 8 && hour <= 22) {
          this.showNotification('Journal Check-in', reminder.message, {
            icon: '💭',
            tag: 'random-reminder',
            silent: true
          });
        }
        
        // Schedule next random reminder
        scheduleRandom();
      }, randomMillis);
      
      this.intervals.set('random', timeoutId);
    };
    
    scheduleRandom();
  }

  clearReminder(type) {
    if (this.intervals.has(type)) {
      clearTimeout(this.intervals.get(type));
      this.intervals.delete(type);
    }
  }

  clearAllReminders() {
    this.intervals.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.intervals.clear();
  }

  async showNotification(title, body, options = {}) {
    // Check permission
    if (this.permission !== 'granted') {
      console.log('Notification permission not granted:', this.permission);
      return;
    }

    try {
      if (this.isCapacitor && this.LocalNotifications) {
        // Use Capacitor LocalNotifications for mobile
        const notificationId = Date.now();
        await this.LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: notificationId,
              schedule: { at: new Date(Date.now() + 1000) }, // Schedule 1 second from now
              sound: 'default',
              attachments: [],
              actionTypeId: '',
              extra: {
                tag: options.tag || 'diary-notification',
                route: this.getRouteFromTag(options.tag)
              }
            }
          ]
        });

        // Listen for notification actions
        this.LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
          if (notification.notification.extra?.route) {
            window.location.href = notification.notification.extra.route;
          }
        });
      } else {
        // Web browser notifications
        if (!('Notification' in window)) {
          console.warn('Notifications not supported in this browser');
          return;
        }

        const defaultOptions = {
          body,
          icon: '/icons/icon-192x192.svg',
          badge: '/icons/icon-192x192.svg',
          tag: 'diary-notification',
          requireInteraction: true,
          silent: false,
          ...options
        };

        const notification = new Notification(title, defaultOptions);
        
        notification.onclick = () => {
          window.focus();
          notification.close();
          
          // Navigate to appropriate journal page
          const route = this.getRouteFromTag(options.tag);
          window.location.href = route;
        };
        
        // Auto-close after 10 seconds
        setTimeout(() => {
          notification.close();
        }, 10000);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  getRouteFromTag(tag) {
    if (tag?.includes('daily')) {
      return '/diary/daily';
    } else if (tag?.includes('weekly')) {
      return '/diary/weekly';
    } else if (tag?.includes('monthly')) {
      return '/diary/monthly';
    } else {
      return '/diary';
    }
  }

  checkDueJournals() {
    const dueToday = getTodaysDue();
    
    if (dueToday.length > 0) {
      // Show a summary notification for all due journals
      const types = dueToday.map(item => item.type).join(', ');
      this.showNotification(
        'Journals Due Today', 
        `You have ${dueToday.length} journal entries due today: ${types}`,
        {
          icon: '📝',
          tag: 'due-summary'
        }
      );
    }
  }

  // Method to show motivational notifications
  showMotivationalNotification() {
    const motivationalMessages = [
      "You're doing great with your journaling journey! 🌟",
      "Self-reflection is a superpower. Keep it up! 💪",
      "Every entry is a step towards better self-awareness 🧠",
      "Your thoughts matter. Write them down! ✍️",
      "Consistency builds habits. You've got this! 🔥"
    ];
    
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    
    this.showNotification('Journaling Motivation', randomMessage, {
      icon: '🌈',
      tag: 'motivation',
      silent: true
    });
  }

  // Test notification method
  async testNotification() {
    await this.showNotification('🧪 Test Notification', 'This is a test notification from ClarityOS Diary! If you can see this, notifications are working perfectly. 🎉', {
      icon: '🧪',
      tag: 'test'
    });
  }

  getReminders() {
    return this.reminders;
  }

  getReminderStatus() {
    // Update permission status from browser
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
    
    return {
      permission: this.permission,
      activeReminders: Array.from(this.intervals.keys()),
      totalReminders: Object.values(this.reminders).filter(r => r.enabled).length,
      supported: 'Notification' in window
    };
  }

  // Method to refresh the service after permission changes
  async refresh() {
    try {
      if (this.isCapacitor && this.LocalNotifications) {
        // Check mobile permissions
        const permResult = await this.LocalNotifications.checkPermissions();
        this.permission = permResult.display === 'granted' ? 'granted' : 'denied';
      } else if ('Notification' in window) {
        this.permission = Notification.permission;
      }
      
      // Clear existing reminders
      this.clearAllReminders();
      
      // Setup reminders if permission is granted
      if (this.permission === 'granted') {
        this.setupAllReminders();
      }
    } catch (error) {
      console.error('Error refreshing notification service:', error);
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService; 
      return '/diary/daily';
    } else if (tag?.includes('weekly')) {
      return '/diary/weekly';
    } else if (tag?.includes('monthly')) {
      return '/diary/monthly';
    } else {
      return '/diary';
    }
  }

  checkDueJournals() {
    const dueToday = getTodaysDue();
    
    if (dueToday.length > 0) {
      // Show a summary notification for all due journals
      const types = dueToday.map(item => item.type).join(', ');
      this.showNotification(
        'Journals Due Today', 
        `You have ${dueToday.length} journal entries due today: ${types}`,
        {
          icon: '📝',
          tag: 'due-summary'
        }
      );
    }
  }

  // Method to show motivational notifications
  showMotivationalNotification() {
    const motivationalMessages = [
      "You're doing great with your journaling journey! 🌟",
      "Self-reflection is a superpower. Keep it up! 💪",
      "Every entry is a step towards better self-awareness 🧠",
      "Your thoughts matter. Write them down! ✍️",
      "Consistency builds habits. You've got this! 🔥"
    ];
    
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    
    this.showNotification('Journaling Motivation', randomMessage, {
      icon: '🌈',
      tag: 'motivation',
      silent: true
    });
  }

  // Test notification method
  async testNotification() {
    await this.showNotification('🧪 Test Notification', 'This is a test notification from ClarityOS Diary! If you can see this, notifications are working perfectly. 🎉', {
      icon: '🧪',
      tag: 'test'
    });
  }

  getReminders() {
    return this.reminders;
  }

  getReminderStatus() {
    // Update permission status from browser
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
    
    return {
      permission: this.permission,
      activeReminders: Array.from(this.intervals.keys()),
      totalReminders: Object.values(this.reminders).filter(r => r.enabled).length,
      supported: 'Notification' in window
    };
  }

  // Method to refresh the service after permission changes
  async refresh() {
    try {
      if (this.isCapacitor && this.LocalNotifications) {
        // Check mobile permissions
        const permResult = await this.LocalNotifications.checkPermissions();
        this.permission = permResult.display === 'granted' ? 'granted' : 'denied';
      } else if ('Notification' in window) {
        this.permission = Notification.permission;
      }
      
      // Clear existing reminders
      this.clearAllReminders();
      
      // Setup reminders if permission is granted
      if (this.permission === 'granted') {
        this.setupAllReminders();
      }
    } catch (error) {
      console.error('Error refreshing notification service:', error);
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService; 