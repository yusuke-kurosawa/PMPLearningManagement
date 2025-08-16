# Troubleshooting Guide / トラブルシューティングガイド

> 🔧 **Interactive troubleshooter**: `npm run quickref:troubleshoot`  
> 🤖 **AI-powered diagnosis**: `npm run quickref:diagnose`  
> 📊 **System health check**: `npm run quickref:health`

## 🚨 Common Issues & Solutions

### 🔴 Critical Issues (Fix Immediately)

#### Application Won't Start

```bash
# Symptom: npm run dev fails
Error: Cannot find module 'vite'

# Solution 1: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Solution 2: Clear npm cache
npm cache clean --force
npm install

# Solution 3: Check Node version
node --version  # Should be 18+
nvm use 18      # Switch to Node 18

# Solution 4: Check port availability
lsof -i :5173   # Check if port is in use
kill -9 <PID>   # Kill process using port
```

#### Build Failures

```bash
# Symptom: npm run build fails
Error: Out of memory

# Solution 1: Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Solution 2: Clear build cache
rm -rf dist .vite node_modules/.vite
npm run build

# Solution 3: Check disk space
df -h           # Check available space
du -sh dist/    # Check build size

# Solution 4: Disable source maps (temporary)
GENERATE_SOURCEMAP=false npm run build
```

#### Database Connection Failed

```bash
# Symptom: Database connection timeout
Error: P1001: Can't reach database server

# Solution 1: Check database URL
echo $DATABASE_URL  # Verify connection string

# Solution 2: Test connection
npx prisma db pull  # Test database connection

# Solution 3: Reset Prisma client
npx prisma generate --force

# Solution 4: Check network
ping database-host.com
telnet database-host.com 5432
```

### 🟡 Performance Issues

#### Slow Development Server

```bash
# Symptom: Hot reload takes > 5 seconds

# Solution 1: Exclude large folders
# Add to vite.config.js:
server: {
  watch: {
    ignored: ['**/node_modules/**', '**/dist/**']
  }
}

# Solution 2: Disable pre-bundling for specific deps
optimizeDeps: {
  exclude: ['large-package']
}

# Solution 3: Use SWC instead of Babel
npm install @vitejs/plugin-react-swc
# Update vite.config.js

# Solution 4: Clear Vite cache
rm -rf node_modules/.vite
```

#### High Memory Usage

```bash
# Symptom: Node process using > 2GB RAM

# Monitor memory usage
node --expose-gc --trace-gc npm run dev

# Solution 1: Find memory leaks
npm run dev -- --inspect
# Open chrome://inspect

# Solution 2: Limit concurrent operations
# In package.json:
"scripts": {
  "test": "vitest --max-workers=2"
}

# Solution 3: Use production builds locally
npm run build && npm run preview
```

#### Slow Test Execution

```bash
# Symptom: Tests take > 2 minutes

# Solution 1: Run tests in parallel
npm run test -- --parallel

# Solution 2: Skip slow tests
npm run test -- --exclude="**/*.slow.test.js"

# Solution 3: Use test filters
npm run test -- --grep="critical"

# Solution 4: Clear test cache
rm -rf coverage .vitest
```

### 🟢 Development Issues

#### TypeScript Errors

```typescript
// Symptom: Type errors in IDE but build works

// Solution 1: Restart TS server (VS Code)
Cmd+Shift+P → "TypeScript: Restart TS Server"

// Solution 2: Clear TypeScript cache
rm -rf node_modules/.cache/typescript

// Solution 3: Sync tsconfig
npx tsc --noEmit

// Solution 4: Update TypeScript
npm install -D typescript@latest
```

#### ESLint Not Working

```bash
# Symptom: ESLint not catching errors

# Solution 1: Clear ESLint cache
rm -rf .eslintcache
npm run lint

# Solution 2: Check ESLint config
npx eslint --print-config src/App.jsx

# Solution 3: Reinstall ESLint
npm uninstall eslint && npm install -D eslint

# Solution 4: VS Code settings
# .vscode/settings.json:
{
  "eslint.validate": ["javascript", "javascriptreact"],
  "eslint.workingDirectories": ["./"]
}
```

#### Git Hook Failures

```bash
# Symptom: Pre-commit hooks not running

# Solution 1: Reinstall hooks
npm run idd:hooks:install

# Solution 2: Check hook permissions
chmod +x .github/hooks/*
ls -la .git/hooks/

# Solution 3: Bypass hooks (emergency)
git commit --no-verify -m "Emergency fix"

# Solution 4: Debug hooks
sh -x .git/hooks/pre-commit
```

## 🌐 Browser Issues

### Chrome DevTools Issues

```javascript
// Symptom: Source maps not working
"DevTools failed to load source map"

// Solution 1: Enable source maps
// In vite.config.js:
build: {
  sourcemap: true
}

// Solution 2: Clear Chrome cache
// DevTools → Settings → Network → Disable cache

// Solution 3: Use different port
npm run dev -- --port 3000
```

### Safari Compatibility

```css
/* Symptom: Styles broken in Safari */

/* Solution 1: Add vendor prefixes */
.element {
  -webkit-appearance: none;
  appearance: none;
}

/* Solution 2: Check Safari support */
/* Visit: caniuse.com */

/* Solution 3: Polyfills */
npm install core-js
// In main.jsx:
import 'core-js/stable';
```

### Mobile Device Issues

```javascript
// Symptom: App not accessible on mobile

// Solution 1: Use network IP
npm run dev -- --host
// Access via: http://192.168.1.x:5173

// Solution 2: Use ngrok
npx ngrok http 5173
// Access via ngrok URL

// Solution 3: Check firewall
sudo ufw allow 5173  // Linux
// Windows: Add firewall exception
```

## 🔒 Authentication Issues

### Login Failures

```javascript
// Symptom: "Invalid credentials" but credentials are correct

// Solution 1: Check Supabase status
// Visit: status.supabase.com

// Solution 2: Verify environment variables
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)

// Solution 3: Clear auth tokens
localStorage.removeItem('supabase.auth.token')
sessionStorage.clear()

// Solution 4: Check CORS settings
// In Supabase dashboard → Authentication → URL Configuration
```

### Session Expiry

```javascript
// Symptom: Users logged out unexpectedly

// Solution 1: Extend session timeout
// supabase.js:
const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Solution 2: Implement refresh logic
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully')
  }
})
```

## 📦 Dependency Issues

### Package Installation Failures

```bash
# Symptom: npm install fails with errors

# Solution 1: Use specific npm version
npm install -g npm@9
npm install

# Solution 2: Clear all caches
npm cache clean --force
rm -rf ~/.npm
rm -rf node_modules package-lock.json
npm install

# Solution 3: Use yarn instead
rm package-lock.json
yarn install

# Solution 4: Install with legacy peer deps
npm install --legacy-peer-deps
```

### Version Conflicts

```bash
# Symptom: Peer dependency warnings

# Solution 1: Check dependency tree
npm ls react  # Check React versions
npm ls       # Full dependency tree

# Solution 2: Use resolutions (package.json)
"overrides": {
  "react": "18.2.0"
}

# Solution 3: Update all dependencies
npm update
npm audit fix

# Solution 4: Use exact versions
npm install package@1.2.3 --save-exact
```

## 🚀 Deployment Issues

### GitHub Pages 404

```yaml
# Symptom: Routes return 404 on GitHub Pages

# Solution 1: Use HashRouter
// App.jsx:
import { HashRouter } from 'react-router-dom';

# Solution 2: Configure base path
// vite.config.js:
export default {
  base: '/PMPLearningManagement/'
}

# Solution 3: Add 404.html
cp dist/index.html dist/404.html

# Solution 4: Check deployment branch
git branch -r  # Should have gh-pages
```

### Build Size Too Large

```bash
# Symptom: Build exceeds 5MB

# Solution 1: Analyze bundle
npm run build:analyze

# Solution 2: Code splitting
// Use React.lazy for routes
const Dashboard = lazy(() => import('./Dashboard'));

# Solution 3: Tree shaking
// Remove unused imports
// Use production builds of libraries

# Solution 4: Optimize images
npm install -D imagemin
npm run optimize:images
```

## 🔍 Debugging Techniques

### Enable Debug Mode

```bash
# Development debugging
DEBUG=* npm run dev
DEBUG=vite:* npm run dev
DEBUG=app:* npm run dev

# Production debugging
localStorage.setItem('debug', '*');

# React DevTools
# Install browser extension
# Press Ctrl+Shift+J → Components tab
```

### Performance Profiling

```javascript
// React Profiler
import { Profiler } from 'react'

;<Profiler id="Dashboard" onRender={callback}>
  <Dashboard />
</Profiler>

// Browser Performance
// DevTools → Performance → Record
// DevTools → Lighthouse → Generate report
```

### Network Debugging

```bash
# Monitor network requests
# DevTools → Network tab

# Use proxy for debugging
npm run dev -- --proxy http://localhost:3001

# Log all API calls
// In services/api.js:
axios.interceptors.request.use(request => {
  console.log('Starting Request:', request);
  return request;
});
```

## 🆘 Emergency Procedures

### Complete Reset

```bash
#!/bin/bash
# emergency-reset.sh

echo "⚠️  Complete project reset..."

# Backup current state
git stash
git checkout -b backup-$(date +%s)

# Clean everything
git clean -fdx
git reset --hard HEAD

# Reinstall
npm ci
npx prisma generate
npm run build

echo "✅ Reset complete"
```

### Rollback Deployment

```bash
# Find last working commit
git log --oneline -10

# Rollback to specific commit
git revert HEAD
git push origin main

# Or force rollback (dangerous)
git reset --hard <commit-hash>
git push --force origin main
```

### Database Recovery

```bash
# Backup current database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20240301.sql

# Reset and reseed
npx prisma migrate reset
npx prisma db seed
```

## 📊 Health Checks

### System Health Check Script

```bash
#!/bin/bash
# health-check.sh

echo "🏥 System Health Check"

# Check Node
node --version || echo "❌ Node not found"

# Check npm
npm --version || echo "❌ npm not found"

# Check dependencies
npm ls --depth=0 || echo "⚠️  Dependency issues"

# Check database
npx prisma db pull || echo "❌ Database unreachable"

# Check build
npm run build || echo "❌ Build failed"

# Check tests
npm run test -- --run || echo "⚠️  Tests failing"

echo "✅ Health check complete"
```

### Monitoring Commands

```bash
# Real-time monitoring
npm run monitor

# Check system resources
top -p $(pgrep -f "node.*dev")
iostat -x 1
netstat -tuln

# Check logs
tail -f logs/app.log
journalctl -f -u app.service
```

## 🔗 Useful Resources

### Documentation Links

- [Vite Troubleshooting](https://vitejs.dev/guide/troubleshooting.html)
- [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)
- [Prisma Debugging](https://www.prisma.io/docs/concepts/components/prisma-client/debugging)
- [GitHub Pages Troubleshooting](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors)

### Support Channels

```yaml
Internal:
  Slack: #dev-help
  Email: dev-support@pmp-learning.com
  Wiki: internal.wiki/troubleshooting

External:
  GitHub Issues: github.com/org/repo/issues
  Stack Overflow: [pmp-learning] tag
  Discord: discord.gg/pmplearning
```

## 🎯 Quick Fix Checklist

When something goes wrong, try these in order:

1. ✅ Clear cache and reinstall

   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```

2. ✅ Check environment variables

   ```bash
   npm run env:check
   ```

3. ✅ Restart development server

   ```bash
   npm run dev
   ```

4. ✅ Run health check

   ```bash
   npm run health:check
   ```

5. ✅ Check recent commits

   ```bash
   git log --oneline -5
   ```

6. ✅ Consult team
   ```bash
   npm run help:request
   ```

---

_Troubleshooting guide is continuously updated based on reported issues. Last update: Check with `npm run quickref:status`_
