// src/redirectBlocker.ts
import { App } from '@capacitor/app';

// ===========================================
// REDIRECT BLOCKER CONFIGURATION
// ===========================================

// Whitelist: URLs that ARE allowed (your app's domains)
const ALLOWED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  // Add your app's actual domain(s) here:
  // 'yourdomain.com',
  // 'app.yourdomain.com'
];

// Optional: Specific patterns you want to allow (regex)
const ALLOWED_PATTERNS = [
  // Example: /^https?:\/\/(www\.)?yourdomain\.com/
];

/**
 * Check if a URL should be blocked
 */
function shouldBlockUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // Allow same-domain navigation
    if (ALLOWED_DOMAINS.some(domain => urlObj.hostname.includes(domain))) {
      return false;
    }
    
    // Check against allowed patterns
    if (ALLOWED_PATTERNS.some(pattern => pattern.test(url))) {
      return false;
    }
    
    // Block everything else
    return true;
  } catch (e) {
    // Invalid URL, block it
    return true;
  }
}

/**
 * Initialize redirect blocking
 */
export function initRedirectBlocker() {
  // 1. Block app URL events (deep links, custom schemes)
  App.addListener('appUrlOpen', (event) => {
    const url = event.url;
    console.log('App URL open attempted:', url);
    
    if (shouldBlockUrl(url)) {
      console.warn('Blocked external redirect:', url);
      // Optionally show a message to the user
      alert('External links are not allowed in this app.');
      return;
    }
    
    // If allowed, handle the URL (you might want to navigate within your app)
    console.log('Allowed URL:', url);
  });

  // 2. Block window.open attempts
  const originalOpen = window.open;
  window.open = function(url, ...args) {
    if (url && shouldBlockUrl(url)) {
      console.warn('Blocked window.open redirect:', url);
      return null;
    }
    return originalOpen.call(window, url, ...args);
  };

  // 3. Intercept link clicks in the DOM
  document.addEventListener('click', (e) => {
    let target = e.target as HTMLElement | null;
    
    // Traverse up to find an <a> tag
    while (target && target.tagName !== 'A') {
      target = target.parentElement;
    }
    
    if (target && target.tagName === 'A') {
      const href = (target as HTMLAnchorElement).getAttribute('href');
      
      if (href && shouldBlockUrl(href)) {
        e.preventDefault();
        e.stopPropagation();
        console.warn('Blocked link click:', href);
        alert('External links are not allowed in this app.');
        return false;
      }
    }
  }, true); // Use capture phase to catch it early

  // 4. Monitor navigation attempts (for SPAs)
  if (window.history && window.history.pushState) {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(state, title, url) {
      if (url && shouldBlockUrl(url)) {
        console.warn('Blocked history.pushState:', url);
        return;
      }
      return originalPushState.call(window.history, state, title, url);
    };
    
    window.history.replaceState = function(state, title, url) {
      if (url && shouldBlockUrl(url)) {
        console.warn('Blocked history.replaceState:', url);
        return;
      }
      return originalReplaceState.call(window.history, state, title, url);
    };
  }

  // 5. Block programmatic location changes
  let lastLocation = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastLocation) {
      if (shouldBlockUrl(window.location.href)) {
        console.warn('Blocked location change:', window.location.href);
        // Revert to previous location
        window.location.href = lastLocation;
      } else {
        lastLocation = window.location.href;
      }
    }
  }, 100);

  console.log('✅ Redirect blocker initialized');
}

// ===========================================
// OPTIONAL: Less aggressive version
// ===========================================

/**
 * Alternative: Only block obvious external redirects
 * This allows more flexibility for your app's internal navigation
 */
export function initLightweightRedirectBlocker() {
  // Only block obvious external protocols
  const BLOCKED_PROTOCOLS = ['http:', 'https:', 'tel:', 'mailto:', 'sms:'];
  
  function isExternalProtocol(url) {
    try {
      const protocol = new URL(url).protocol;
      return BLOCKED_PROTOCOLS.includes(protocol);
    } catch {
      return false;
    }
  }
  
  // Block app URL events
  App.addListener('appUrlOpen', (event) => {
    if (isExternalProtocol(event.url)) {
      console.warn('Blocked external protocol:', event.url);
      return;
    }
  });
  
  // Block link clicks to external domains
  document.addEventListener('click', (e) => {
    let target = e.target as HTMLElement | null;
    while (target && target.tagName !== 'A') {
      target = target.parentElement;
    }
    
    if (target && target.tagName === 'A') {
      const href = (target as HTMLAnchorElement).getAttribute('href');
      if (href && isExternalProtocol(href) && !href.startsWith(window.location.origin)) {
        e.preventDefault();
        console.warn('Blocked external link:', href);
      }
    }
  }, true);
  
  console.log('✅ Lightweight redirect blocker initialized');
}

// ===========================================
// USAGE
// ===========================================
// Call one of these functions when your app starts:
// initRedirectBlocker(); // More strict
// OR
// initLightweightRedirectBlocker(); // Less strict