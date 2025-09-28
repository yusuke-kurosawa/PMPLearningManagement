# Service Worker Troubleshooting Guide

## Quick Diagnostics

### Check Service Worker Status

```javascript
// In browser console
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW Status:', reg ? 'Registered' : 'Not Registered');
  if (reg) {
    console.log('SW State:', reg.active?.state);
    console.log('SW Version:', reg.active?.scriptURL);
  }
});
```

### Check Cache Status

```javascript
// In browser console
caches.keys().then(keys => {
  console.log('Cache Names:', keys);
  keys.forEach(key => {
    caches.open(key).then(cache => {
      cache.keys().then(requests => {
        console.log(`${key}:`, requests.length, 'items');
      });
    });
  });
});
```

### Monitor Service Worker Messages

```javascript
// In browser console
navigator.serviceWorker.addEventListener('message', event => {
  console.log('SW Message:', event.data);
});
```

## Common Issues

### 1. "Failed to fetch" Errors

**Symptoms**: Console flooded with fetch errors

**Solution**: The fix implemented in v2.1.1 handles this with:
- Development mode detection
- Rate limiting
- Failed URL tracking
- URL validation

**Verification**:
```bash
# Check SW version
grep "CACHE_VERSION" public/sw.js
# Should show: const CACHE_VERSION = '2.1.1';
```

### 2. Service Worker Not Updating

**Cause**: Browser cache or SW lifecycle

**Solutions**:

1. **Hard Refresh**:
   - Chrome: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Firefox: Ctrl+F5 or Cmd+Shift+R

2. **Clear Service Worker**:
   ```javascript
   // In browser console
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(reg => reg.unregister());
   });
   ```

3. **Clear Caches**:
   ```javascript
   // In browser console
   caches.keys().then(keys => {
     keys.forEach(key => caches.delete(key));
   });
   ```

4. **DevTools**:
   - Chrome DevTools → Application → Service Workers → Unregister
   - Clear Cache → Clear storage

### 3. Offline Functionality Not Working

**Checklist**:
- [ ] Service Worker registered successfully
- [ ] Assets precached during install
- [ ] Network tab shows cache hits (from ServiceWorker)
- [ ] No errors in console

**Debug**:
```javascript
// Test offline mode
window.addEventListener('offline', () => {
  console.log('📡 Now offline');
});

window.addEventListener('online', () => {
  console.log('📡 Now online');
});

// Check what's cached
caches.open('pmp-learning-v2.1.1').then(cache => {
  cache.keys().then(requests => {
    console.log('Cached URLs:', requests.map(r => r.url));
  });
});
```

### 4. Development Mode Issues

**Issue**: Service Worker too aggressive during development

**Solution**: Automatic in v2.1.1
- Development mode detected by hostname/port
- Aggressive caching disabled
- Console message: "[SW] Development mode: Skipping aggressive caching"

**Manual Override** (if needed):
```javascript
// In sw.js, force development mode
const IS_DEVELOPMENT = true; // Force development mode
```

### 5. Performance Degradation

**Causes**:
- Too many cache operations
- Large cache size
- Infinite retry loops (fixed in v2.1.1)

**Monitoring**:
```javascript
// Check cache sizes
caches.keys().then(async keys => {
  for (const key of keys) {
    const cache = await caches.open(key);
    const requests = await cache.keys();
    console.log(`${key}: ${requests.length} items`);
  }
});
```

**Cleanup**:
```javascript
// Clear runtime cache (keeps shell cache)
caches.delete('pmp-learning-runtime-v2.1.1');
```

## Development Workflow

### Local Development

```bash
# Start dev server
npm run dev

# Expected console output:
# ✅ [SW] Install event
# ✅ [SW] Development mode: Skipping aggressive caching
# ✅ [SW] Precaching completed
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Expected behavior:
# ✅ Assets cached on first load
# ✅ Offline functionality works
# ✅ No "Failed to fetch" errors
```

### Testing Offline Mode

1. **Visit site while online**
2. **Open DevTools → Network**
3. **Check "Offline" checkbox**
4. **Refresh page**
5. **Verify**: Page loads from cache

## Configuration

### Rate Limiting

Located in `public/sw.js`:

```javascript
const RATE_LIMIT_WINDOW = 5000; // 5 seconds
const MAX_RETRIES_PER_WINDOW = 3; // 3 attempts
```

Adjust if needed for your use case.

### Failed URL Cooldown

```javascript
const FAILED_URL_RETRY_DELAY = 60000; // 1 minute
```

Increase for longer cooldown periods.

### Request Timeout

```javascript
const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds
```

Increase for slower networks.

### Cache Sizes

```javascript
const MAX_CACHE_SIZE = {
  [RUNTIME_CACHE]: 50,
  [IMAGE_CACHE]: 100,
  [DATA_CACHE]: 30
};
```

## Best Practices

### 1. Version Management

Always bump version when changing SW:
```javascript
const CACHE_VERSION = '2.1.2'; // Increment
```

### 2. Testing Strategy

- Test in incognito mode to avoid cache issues
- Test on different browsers (Chrome, Firefox, Safari)
- Test on mobile devices
- Test offline functionality explicitly

### 3. Monitoring

Add custom logging:
```javascript
// In sw.js
console.log('[SW] Custom metric:', {
  timestamp: Date.now(),
  cacheHits: /* your metric */,
  errors: /* error count */
});
```

### 4. Error Handling

Always handle errors gracefully:
```javascript
fetch(url)
  .catch(error => {
    console.error('[SW] Fetch failed:', url, error);
    return caches.match(fallbackUrl);
  });
```

## Advanced Debugging

### Service Worker Lifecycle

```javascript
// Monitor SW lifecycle
navigator.serviceWorker.register('/sw.js').then(reg => {
  reg.installing && console.log('SW installing');
  reg.waiting && console.log('SW waiting');
  reg.active && console.log('SW active');
});
```

### Network Performance

```javascript
// Measure cache performance
performance.getEntriesByType('resource').forEach(entry => {
  console.log(entry.name, {
    duration: entry.duration,
    transferSize: entry.transferSize,
    cached: entry.transferSize === 0
  });
});
```

### Memory Usage

```javascript
// Estimate cache storage usage
navigator.storage.estimate().then(estimate => {
  const usedMB = (estimate.usage / 1024 / 1024).toFixed(2);
  const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2);
  console.log(`Storage: ${usedMB} MB / ${quotaMB} MB`);
});
```

## Resources

- [Service Worker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Cache API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
- [Chrome DevTools - Service Workers](https://developers.google.com/web/tools/chrome-devtools/progressive-web-apps)

## Support

If issues persist:

1. Check the [SERVICE_WORKER_FIX_REPORT.md](../../SERVICE_WORKER_FIX_REPORT.md)
2. Review recent changes: `git log --grep="service worker" --oneline`
3. Open an issue with:
   - Browser version
   - Console errors (full output)
   - Network tab screenshot
   - Steps to reproduce

---

**Last Updated**: 2025-09-28
**SW Version**: 2.1.1
**Status**: ✅ Active