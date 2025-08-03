// Enhanced Notification Service for My Diary
// Handles browser notifications with Capacitor mobile support

import { Capacitor } from '@capacitor/core';

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.isCapacitor = Capacitor.isNativePlatform();
    this.LocalNotifications = null;
    
    this.init();
  }

  async init() {
    // Initialize platform-specific features
    if (this.isCapacitor) {
      try {
        // Try to import Capacitor LocalNotifications for mobile if available
        if (typeof window !== 'undefined') {
          const { LocalNotifications } = await import('@capacitor/local-notifications');
          this.LocalNotifications = LocalNotifications;
        }
        
        // Request permissions for mobile
        await this.requestPermission();
      } catch (error) {
        console.warn('LocalNotifications not available:', error);
        // Fall back to browser notifications
        this.checkBrowserSupport();
        await this.requestPermission();
      }
    } else {
      // Browser notifications
      this.checkBrowserSupport();
      await this.requestPermission();
    }
  }

  checkBrowserSupport() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }
    return true;
  }

  async requestPermission() {
    try {
      if (this.isCapacitor && this.LocalNotifications) {
        // Mobile: Request permissions through Capacitor
        const permission = await this.LocalNotifications.requestPermissions();
        this.permission = permission.display === 'granted' ? 'granted' : 'denied';
      } else {
        // Browser: Request permission through Notification API
        if ('Notification' in window) {
          this.permission = await Notification.requestPermission();
        }
      }
      
      console.log('📱 Notification permission:', this.permission);
      return this.permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
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

  async testNotification() {
    console.log('🧪 Testing notification system...');
    
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        console.log('❌ Permission denied for notifications');
        return false;
      }
    }

    const success = await this.showNotification(
      '🎉 Test Notification',
      'Your notification system is working perfectly! Ready to keep you on track with your journaling journey.',
      { tag: 'test-notification' }
    );

    if (success) {
      console.log('✅ Test notification sent successfully!');
    } else {
      console.log('❌ Test notification failed');
    }

    return success;
  }

  scheduleReminder(type, time, message) {
    console.log(`⏰ Scheduling ${type} reminder for ${time}`);
    
      const now = new Date();
    const [hours, minutes] = time.split(':');
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // If the time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    
    setTimeout(() => {
      this.showNotification(
        `📝 ${type.charAt(0).toUpperCase() + type.slice(1)} Journal Reminder`,
        message,
        { tag: `${type}-reminder` }
      );
      }, timeUntilReminder);
    
    console.log(`⏰ ${type} reminder scheduled for ${reminderTime.toLocaleString()}`);
  }

  scheduleRandomReminder() {
    // Schedule a random reminder within the next 4-8 hours
    const randomHours = Math.random() * 4 + 4; // 4-8 hours
    const randomTime = randomHours * 60 * 60 * 1000; // Convert to milliseconds
    
    setTimeout(() => {
      const messages = [
        "💭 Take a moment to reflect on your day",
        "✨ What made you smile today?",
        "🌟 Capture today's special moments",
        "💝 What are you grateful for right now?",
        "🎯 How are you progressing toward your goals?",
        "😊 Share what's on your mind today"
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      this.showNotification(
        '📖 Random Journal Prompt',
        randomMessage,
        { tag: 'random-reminder' }
      );
    }, randomTime);
    
    console.log(`🎲 Random reminder scheduled in ${(randomTime / (1000 * 60 * 60)).toFixed(1)} hours`);
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
          icon: '/icons/icon-192x192.svg', // Updated icon path
          badge: '/icons/icon-192x192.svg', // Updated icon path
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
    console.log('📅 Checking due journals...');
    
    try {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const dueJournals = [];

      // Check if today's daily journal is missing
      const dailyEntries = JSON.parse(localStorage.getItem('diary_daily_entries') || '[]');
      const todayDaily = dailyEntries.find(entry => {
        const entryDate = new Date(entry.date).toISOString().split('T')[0];
        return entryDate === currentDate;
      });

      if (!todayDaily) {
        dueJournals.push({
          type: 'daily',
          message: "Don't forget to write your daily journal!",
          route: '/diary/daily'
        });
      }

      // Check for weekly journal (if it's Sunday and no weekly entry this week)
      if (now.getDay() === 0) { // Sunday
        const weeklyEntries = JSON.parse(localStorage.getItem('diary_weekly_entries') || '[]');
        const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekStart = thisWeekStart.toISOString().split('T')[0];
        
        const thisWeekEntry = weeklyEntries.find(entry => {
          const entryDate = new Date(entry.date).toISOString().split('T')[0];
          return entryDate >= weekStart;
        });

        if (!thisWeekEntry) {
          dueJournals.push({
            type: 'weekly',
            message: "Time for your weekly reflection!",
            route: '/diary/weekly'
          });
        }
      }

      // Check for monthly journal (if it's the last day of the month)
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (tomorrow.getDate() === 1) { // Last day of month
        const monthlyEntries = JSON.parse(localStorage.getItem('diary_monthly_entries') || '[]');
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const thisMonthEntry = monthlyEntries.find(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        });

        if (!thisMonthEntry) {
          dueJournals.push({
            type: 'monthly',
            message: "Complete your monthly review!",
            route: '/diary/monthly'
          });
        }
      }

      console.log(`📋 Found ${dueJournals.length} due journals:`, dueJournals);
      return dueJournals;
    } catch (error) {
      console.error('Error checking due journals:', error);
      return [];
    }
  }

  async refresh() {
    console.log('🔄 Refreshing notification service...');
    try {
      await this.requestPermission();
      
      // Re-check due journals
      this.checkDueJournals();
      
      console.log('✅ Notification service refreshed successfully');
    } catch (error) {
      console.error('Error refreshing notification service:', error);
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService; 