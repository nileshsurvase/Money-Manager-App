const CACHE_NAME = 'money-manager-v2.0.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const API_CACHE = `${CACHE_NAME}-api`;

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.jsx',
  '/src/index.css',
  // Add other critical assets
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/.netlify/functions/api',
  '/.netlify/functions/auth'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('money-manager-') && 
                     cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== API_CACHE;
            })
            .map((cacheName) => {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests (chrome-extension, etc.)
  if (!['http:', 'https:'].includes(url.protocol)) {
    return;
  }

  // Skip development-specific requests
  if (url.pathname.includes('/@vite/') || 
      url.pathname.includes('/node_modules/') ||
      url.pathname.includes('hot-update') ||
      url.pathname.includes('__vite_ping') ||
      url.searchParams.has('import') ||
      url.searchParams.has('t=')) {
    return;
  }

  // Handle API requests
  if (API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
  }
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && request.method === 'GET') {
      // Only cache GET requests (Cache API doesn't support POST/PUT/DELETE)
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', error);
    
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'You are currently offline. Some features may not be available.'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const dynamicCache = await caches.open(DYNAMIC_CACHE);
  
  // Skip chrome-extension and other unsupported schemes
  const url = new URL(request.url);
  if (!['http:', 'https:'].includes(url.protocol)) {
    console.log('Service Worker: Skipping unsupported scheme:', url.protocol);
    return fetch(request);
  }
  
  // Try cache first
  let cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Try dynamic cache
  cachedResponse = await dynamicCache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Try network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && networkResponse.status < 400) {
      // Only cache successful responses and avoid caching certain file types
      const contentType = networkResponse.headers.get('content-type') || '';
      const isCacheable = !contentType.includes('text/event-stream') && 
                         !url.pathname.includes('hot-update') &&
                         !url.pathname.includes('@vite') &&
                         !url.pathname.includes('node_modules');
      
      if (isCacheable) {
        try {
          await dynamicCache.put(request, networkResponse.clone());
        } catch (cacheError) {
          console.warn('Service Worker: Failed to cache response:', cacheError);
        }
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed for static asset', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await cache.match('/');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    // Return empty response for other requests
    return new Response('', {
      status: 408,
      statusText: 'Request Timeout'
    });
  }
}

// Handle background sync
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'expense-sync') {
    event.waitUntil(syncExpenses());
  } else if (event.tag === 'diary-sync') {
    event.waitUntil(syncDiaryEntries());
  } else if (event.tag === 'goals-sync') {
    event.waitUntil(syncGoals());
  }
});

// Sync functions
async function syncExpenses() {
  try {
    const pendingExpenses = await getStoredData('pending_expenses');
    if (pendingExpenses && pendingExpenses.length > 0) {
      // Sync with server
      const response = await fetch('/.netlify/functions/api/expenses/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expenses: pendingExpenses })
      });
      
      if (response.ok) {
        // Clear pending expenses
        await clearStoredData('pending_expenses');
        console.log('Service Worker: Expenses synced successfully');
      }
    }
  } catch (error) {
    console.error('Service Worker: Expense sync failed', error);
  }
}

async function syncDiaryEntries() {
  try {
    const pendingEntries = await getStoredData('pending_diary_entries');
    if (pendingEntries && pendingEntries.length > 0) {
      // Sync with server
      const response = await fetch('/.netlify/functions/api/diary/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ entries: pendingEntries })
      });
      
      if (response.ok) {
        await clearStoredData('pending_diary_entries');
        console.log('Service Worker: Diary entries synced successfully');
      }
    }
  } catch (error) {
    console.error('Service Worker: Diary sync failed', error);
  }
}

async function syncGoals() {
  try {
    const pendingGoals = await getStoredData('pending_goals');
    if (pendingGoals && pendingGoals.length > 0) {
      // Sync with server
      const response = await fetch('/.netlify/functions/api/goals/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ goals: pendingGoals })
      });
      
      if (response.ok) {
        await clearStoredData('pending_goals');
        console.log('Service Worker: Goals synced successfully');
      }
    }
  } catch (error) {
    console.error('Service Worker: Goals sync failed', error);
  }
}

// Utility functions for storage
async function getStoredData(key) {
  return new Promise((resolve) => {
    // This would integrate with IndexedDB or localStorage
    resolve([]);
  });
}

async function clearStoredData(key) {
  return new Promise((resolve) => {
    // This would clear data from IndexedDB or localStorage
    resolve();
  });
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-144x144.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open ClarityOS',
        icon: '/icons/icon-192x192.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-144x144.svg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('ClarityOS', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Service Worker: Loaded successfully'); 