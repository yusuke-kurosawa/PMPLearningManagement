# Upstash API Key Setup Guide for Context7 MCP Integration

## Overview

This comprehensive guide will walk you through setting up an Upstash API key to enhance Context7 MCP server functionality. Upstash provides Redis-compatible cloud storage that enables persistent caching, improved performance, and advanced analytics for the Context7 system.

## Table of Contents

- [1. Upstash Account Creation](#1-upstash-account-creation)
- [2. API Key Generation](#2-api-key-generation)
- [3. Context7 Configuration](#3-context7-configuration)
- [4. Security Considerations](#4-security-considerations)
- [5. Verification Steps](#5-verification-steps)
- [6. Troubleshooting](#6-troubleshooting)
- [7. Performance Benefits](#7-performance-benefits)
- [8. Automation Tools](#8-automation-tools)

---

## 1. Upstash Account Creation

### Step 1.1: Registration Process

1. **Visit Upstash Website**
   ```
   https://upstash.com
   ```

2. **Click "Sign Up" or "Get Started"**
   - Located in the top-right corner of the homepage

3. **Choose Registration Method**
   - **GitHub**: Recommended for developers (fastest setup)
   - **Google**: Alternative OAuth option
   - **Email**: Manual registration with email verification

4. **GitHub Registration (Recommended)**
   ```
   Click "Continue with GitHub"
   → Authorize Upstash app
   → Complete profile setup
   ```

5. **Manual Email Registration**
   ```
   Enter email address
   → Create secure password (min 8 chars, mixed case, numbers, symbols)
   → Verify email address
   → Complete profile setup
   ```

### Step 1.2: Account Verification

1. **Email Verification**
   - Check your email inbox for verification link
   - Click the verification link
   - Return to Upstash dashboard

2. **Profile Completion**
   - Add company name (optional)
   - Select use case: "Application Development"
   - Choose primary programming language: "JavaScript/TypeScript"

3. **Initial Dashboard Tour**
   - Take the optional guided tour
   - Familiarize yourself with the console layout

### Step 1.3: Dashboard Navigation

The Upstash dashboard consists of:

- **Databases**: Manage Redis instances
- **QStash**: Message queuing service
- **Vector**: Vector database service
- **Settings**: Account and billing settings
- **API Keys**: Access key management

---

## 2. API Key Generation

### Step 2.1: Access API Key Section

1. **Navigate to API Keys**
   ```
   Dashboard → Settings → API Keys
   ```
   OR
   ```
   Direct URL: https://console.upstash.com/account/api
   ```

2. **Understanding Key Types**
   - **Global API Key**: Access to all Upstash services
   - **Database-specific Key**: Access to specific Redis database
   - **Read-only Key**: Limited permissions for monitoring

### Step 2.2: Create Global API Key

1. **Click "Create API Key"**

2. **Configure Key Settings**
   ```
   Name: Context7-MCP-Production
   Description: Context7 MCP Server Integration for PMP Learning Management
   Permissions: Full Access (recommended)
   Expiration: Never (for production) or Custom date (for testing)
   ```

3. **Generate and Copy Key**
   ```
   Click "Create"
   → Copy API Key immediately (it won't be shown again)
   → Copy API Secret
   → Save both values securely
   ```

### Step 2.3: Create Database (Optional but Recommended)

1. **Create Redis Database**
   ```
   Databases → Create Database
   → Name: context7-cache
   → Region: Choose closest to your location
   → Type: Regional (free tier available)
   → Click "Create"
   ```

2. **Get Database Credentials**
   ```
   Database Details → Connect → Node.js
   → Copy UPSTASH_REDIS_REST_URL
   → Copy UPSTASH_REDIS_REST_TOKEN
   ```

### Step 2.4: Security Best Practices

- **Immediate Storage**: Copy keys immediately as they're shown only once
- **Secure Storage**: Use password manager or encrypted storage
- **Environment Variables**: Never hardcode keys in source code
- **Principle of Least Privilege**: Use minimal required permissions
- **Regular Rotation**: Rotate keys every 90 days

---

## 3. Context7 Configuration

### Step 3.1: Update .context7rc Configuration

1. **Edit .context7rc file**
   ```bash
   # Open the configuration file
   nano .context7rc
   ```

2. **Add Upstash Configuration**
   ```bash
   # Upstash API Configuration
   UPSTASH_API_KEY=your_global_api_key_here
   UPSTASH_API_SECRET=your_api_secret_here
   UPSTASH_API_ENDPOINT=https://api.upstash.com

   # Optional: Database-specific configuration
   UPSTASH_REDIS_REST_URL=https://your-database-endpoint.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_database_token_here

   # Enhanced caching with Upstash
   CONTEXT7_ENABLE_UPSTASH=true
   CONTEXT7_UPSTASH_CACHE_TTL=86400
   CONTEXT7_UPSTASH_MAX_CACHE_SIZE=500MB
   CONTEXT7_UPSTASH_COMPRESSION=true
   ```

### Step 3.2: Update context7.config.js

1. **Add Upstash Configuration Section**
   ```javascript
   // Add to context7.config.js
   export default {
     // ... existing configuration

     // Upstash Integration
     upstash: {
       enabled: process.env.CONTEXT7_ENABLE_UPSTASH === 'true',
       apiKey: process.env.UPSTASH_API_KEY,
       apiSecret: process.env.UPSTASH_API_SECRET,
       endpoint: process.env.UPSTASH_API_ENDPOINT || 'https://api.upstash.com',

       redis: {
         restUrl: process.env.UPSTASH_REDIS_REST_URL,
         restToken: process.env.UPSTASH_REDIS_REST_TOKEN,
         maxRetries: 3,
         retryDelayMs: 1000,
       },

       caching: {
         defaultTtl: 86400, // 24 hours
         maxCacheSize: '500MB',
         compressionLevel: 6,
         keyPrefix: 'context7:',
       },

       monitoring: {
         enabled: true,
         metricsInterval: 300000, // 5 minutes
         alertThresholds: {
           errorRate: 0.05,
           responseTime: 2000,
         },
       },
     },

     // ... rest of configuration
   };
   ```

### Step 3.3: Claude Desktop Configuration

If using Claude Desktop, update your MCP configuration:

1. **Locate Claude Desktop Config**
   ```bash
   # macOS
   ~/Library/Application Support/Claude/claude_desktop_config.json

   # Windows
   %APPDATA%\Claude\claude_desktop_config.json

   # Linux
   ~/.config/claude/claude_desktop_config.json
   ```

2. **Update MCP Configuration**
   ```json
   {
     "mcpServers": {
       "context7": {
         "command": "npx",
         "args": ["context7-mcp"],
         "env": {
           "UPSTASH_API_KEY": "your_api_key_here",
           "UPSTASH_API_SECRET": "your_api_secret_here",
           "UPSTASH_REDIS_REST_URL": "your_database_url_here",
           "UPSTASH_REDIS_REST_TOKEN": "your_database_token_here",
           "CONTEXT7_ENABLE_UPSTASH": "true"
         }
       }
     }
   }
   ```

### Step 3.4: Environment Variable Setup

1. **Create .env.local file**
   ```bash
   # Create environment file for local development
   cat > .env.local << 'EOF'
   # Upstash Configuration
   UPSTASH_API_KEY=your_global_api_key_here
   UPSTASH_API_SECRET=your_api_secret_here
   UPSTASH_API_ENDPOINT=https://api.upstash.com
   UPSTASH_REDIS_REST_URL=https://your-database-endpoint.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_database_token_here

   # Context7 Upstash Integration
   CONTEXT7_ENABLE_UPSTASH=true
   CONTEXT7_UPSTASH_CACHE_TTL=86400
   CONTEXT7_UPSTASH_MAX_CACHE_SIZE=500MB
   CONTEXT7_UPSTASH_COMPRESSION=true
   EOF
   ```

2. **Update .gitignore**
   ```bash
   # Ensure sensitive files are ignored
   echo ".env.local" >> .gitignore
   echo ".context7rc.local" >> .gitignore
   ```

3. **Production Environment Variables**
   ```bash
   # For production deployment
   export UPSTASH_API_KEY="your_api_key"
   export UPSTASH_API_SECRET="your_api_secret"
   export CONTEXT7_ENABLE_UPSTASH="true"
   ```

---

## 4. Security Considerations

### Step 4.1: Safe Storage of API Keys

1. **Password Manager Storage**
   ```
   Tool: 1Password, Bitwarden, LastPass, etc.
   Entry Type: Secure Note or API Key
   Fields:
   - API Key
   - API Secret
   - Database URL
   - Database Token
   - Creation Date
   - Expiration Date (if applicable)
   ```

2. **Environment Variable Best Practices**
   ```bash
   # Use environment-specific files
   .env.development    # Development settings
   .env.staging        # Staging settings
   .env.production     # Production settings
   .env.local          # Local overrides (gitignored)
   ```

3. **File Permissions**
   ```bash
   # Secure environment files
   chmod 600 .env.*
   chmod 600 .context7rc*
   ```

### Step 4.2: Key Rotation Strategy

1. **Regular Rotation Schedule**
   ```
   Development: Every 30 days
   Staging: Every 60 days
   Production: Every 90 days
   Compromised: Immediately
   ```

2. **Rotation Process**
   ```bash
   # 1. Generate new API key in Upstash console
   # 2. Update environment variables
   # 3. Test functionality
   # 4. Revoke old key
   # 5. Update documentation
   ```

3. **Monitoring for Suspicious Activity**
   ```
   Check Upstash dashboard regularly for:
   - Unusual API usage patterns
   - Failed authentication attempts
   - Unexpected geographic access
   - High bandwidth usage
   ```

### Step 4.3: Network Security

1. **IP Whitelisting (Enterprise)**
   ```
   Upstash Console → Database → Security → IP Whitelist
   Add your server IP addresses
   ```

2. **TLS/SSL Configuration**
   ```javascript
   // Ensure TLS is enabled
   upstash: {
     redis: {
       tls: true,
       validateCertificates: true,
     },
   }
   ```

---

## 5. Verification Steps

### Step 5.1: Basic Connectivity Test

1. **Test API Key Validity**
   ```bash
   curl -X GET "https://api.upstash.com/v2/redis/databases" \
        -H "Authorization: Bearer $UPSTASH_API_KEY"
   ```

2. **Expected Response**
   ```json
   [
     {
       "database_id": "xxx-xxx-xxx",
       "database_name": "context7-cache",
       "database_type": "Pay as You Go",
       "region": "us-east-1",
       "created_at": 1234567890
     }
   ]
   ```

### Step 5.2: Context7 Integration Test

1. **Start Context7 with Upstash Enabled**
   ```bash
   # Set environment variables
   export CONTEXT7_ENABLE_UPSTASH=true
   export UPSTASH_API_KEY="your_key"

   # Start Context7 MCP server
   npx context7-mcp
   ```

2. **Check Logs for Upstash Connection**
   ```
   Look for log messages:
   ✓ Upstash API key validated
   ✓ Connected to Upstash Redis
   ✓ Cache system initialized
   ✓ Enhanced features enabled
   ```

### Step 5.3: Performance Comparison

1. **Benchmark Without Upstash**
   ```bash
   # Disable Upstash temporarily
   export CONTEXT7_ENABLE_UPSTASH=false

   # Run performance test
   time curl -X POST "http://localhost:3001/api/context" \
        -H "Content-Type: application/json" \
        -d '{"query": "React hooks best practices"}'
   ```

2. **Benchmark With Upstash**
   ```bash
   # Enable Upstash
   export CONTEXT7_ENABLE_UPSTASH=true

   # Run same performance test
   time curl -X POST "http://localhost:3001/api/context" \
        -H "Content-Type: application/json" \
        -d '{"query": "React hooks best practices"}'
   ```

3. **Expected Improvements**
   ```
   Response Time: 30-50% faster (after cache warmup)
   Cache Hit Rate: 70-90% for repeated queries
   Memory Usage: 20-40% reduction
   Bandwidth: 40-60% reduction for large responses
   ```

### Step 5.4: Feature Verification

1. **Enhanced Caching**
   ```bash
   # Test persistent cache
   curl -X GET "http://localhost:3001/api/cache/stats"
   ```

2. **Analytics and Monitoring**
   ```bash
   # Check monitoring endpoint
   curl -X GET "http://localhost:3001/api/monitoring/upstash"
   ```

3. **Expected Enhanced Features**
   ```
   ✓ Persistent cache across restarts
   ✓ Distributed caching for multiple instances
   ✓ Advanced analytics and metrics
   ✓ Automatic cache invalidation
   ✓ Compression and optimization
   ✓ Rate limiting and throttling
   ```

---

## 6. Troubleshooting

### Step 6.1: Common Issues and Solutions

#### Issue: API Key Authentication Failed

**Symptoms:**
```
Error: Unauthorized - Invalid API key
Context7 starting without Upstash integration
```

**Solutions:**
```bash
# 1. Verify API key format
echo $UPSTASH_API_KEY | wc -c  # Should be 32+ characters

# 2. Check for extra spaces or characters
echo "'$UPSTASH_API_KEY'"

# 3. Test key directly with Upstash API
curl -X GET "https://api.upstash.com/v2/redis/databases" \
     -H "Authorization: Bearer $UPSTASH_API_KEY"

# 4. Regenerate API key if necessary
```

#### Issue: Redis Connection Failed

**Symptoms:**
```
Error: Failed to connect to Upstash Redis
Redis operations falling back to local cache
```

**Solutions:**
```bash
# 1. Verify Redis URL and token
curl -X GET "$UPSTASH_REDIS_REST_URL/ping" \
     -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"

# 2. Check network connectivity
ping your-database-endpoint.upstash.io

# 3. Verify TLS settings
curl -vvv "$UPSTASH_REDIS_REST_URL/ping" \
     -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"

# 4. Test with different region endpoint
```

#### Issue: Performance Not Improved

**Symptoms:**
```
No noticeable performance improvement
Cache hit rate remains low
Memory usage unchanged
```

**Solutions:**
```bash
# 1. Verify Upstash is actually enabled
curl -X GET "http://localhost:3001/api/status" | grep upstash

# 2. Check cache configuration
curl -X GET "http://localhost:3001/api/cache/config"

# 3. Monitor cache hit rate over time
curl -X GET "http://localhost:3001/api/monitoring/cache-stats"

# 4. Warm up cache with common queries
```

### Step 6.2: Rate Limit Monitoring

1. **Check Current Usage**
   ```bash
   curl -X GET "https://api.upstash.com/v2/redis/databases/usage" \
        -H "Authorization: Bearer $UPSTASH_API_KEY"
   ```

2. **Monitor Rate Limits**
   ```javascript
   // Add to monitoring configuration
   monitoring: {
     rateLimits: {
       alertThreshold: 80, // Alert at 80% of limit
       checkInterval: 60000, // Check every minute
     },
   }
   ```

### Step 6.3: Debug Mode

1. **Enable Debug Logging**
   ```bash
   export CONTEXT7_DEBUG=true
   export CONTEXT7_LOG_LEVEL=debug
   export UPSTASH_DEBUG=true
   ```

2. **Check Debug Logs**
   ```bash
   tail -f ~/.context7/logs/debug.log | grep -i upstash
   ```

---

## 7. Performance Benefits

### Step 7.1: Expected Improvements

With Upstash integration, you should see:

1. **Response Time Improvements**
   ```
   First Request: Similar to baseline (cache miss)
   Subsequent Requests: 30-80% faster (cache hits)
   Complex Queries: 50-90% faster (cached computations)
   ```

2. **Resource Usage Optimization**
   ```
   Memory Usage: 20-40% reduction
   CPU Usage: 15-30% reduction
   Network Bandwidth: 40-70% reduction
   Disk I/O: 60-80% reduction
   ```

3. **Scalability Benefits**
   ```
   Concurrent Users: 2-5x improvement
   Request Throughput: 3-10x improvement
   Cache Hit Rate: 70-95% (after warmup)
   ```

### Step 7.2: Monitoring Metrics

Track these key performance indicators:

1. **Cache Performance**
   ```
   Cache Hit Rate: Target >80%
   Cache Miss Rate: Target <20%
   Average Response Time: Target <500ms
   Cache Memory Usage: Monitor growth
   ```

2. **Upstash Metrics**
   ```
   API Request Count: Monitor usage limits
   Redis Memory Usage: Track data storage
   Network Transfer: Monitor bandwidth usage
   Error Rate: Target <1%
   ```

### Step 7.3: Optimization Tips

1. **Cache TTL Optimization**
   ```javascript
   // Optimize TTL based on content type
   caching: {
     documentation: 86400,      // 24 hours
     codeExamples: 43200,       // 12 hours
     searchResults: 3600,       // 1 hour
     userPreferences: 2592000,  // 30 days
   }
   ```

2. **Compression Settings**
   ```javascript
   // Adjust compression based on data size
   compression: {
     threshold: 1024,       // Compress files >1KB
     level: 6,              // Balance speed vs ratio
     algorithm: 'gzip',     // Standard compression
   }
   ```

---

## 8. Automation Tools

The following automation scripts are provided to simplify the setup process:

### Available Scripts

1. **`scripts/upstash-setup.js`** - Interactive setup wizard
2. **`scripts/upstash-validate.js`** - Configuration validation
3. **`scripts/upstash-test.js`** - Performance testing
4. **`scripts/upstash-troubleshoot.js`** - Troubleshooting assistant

### Quick Setup

```bash
# Run the interactive setup wizard
npm run upstash:setup

# Validate configuration
npm run upstash:validate

# Run performance tests
npm run upstash:test

# Troubleshooting
npm run upstash:troubleshoot
```

### Manual Script Usage

```bash
# Interactive setup
node scripts/upstash-setup.js

# Validation only
node scripts/upstash-validate.js

# Performance comparison
node scripts/upstash-test.js --compare

# Troubleshooting with debug output
node scripts/upstash-troubleshoot.js --debug
```

---

## Conclusion

This guide provides comprehensive instructions for integrating Upstash with Context7 MCP server. The integration enables:

- **Persistent caching** across application restarts
- **Improved performance** through Redis-based storage
- **Advanced analytics** and monitoring capabilities
- **Scalable architecture** for multiple instances
- **Enhanced reliability** with automatic failover

For additional support or questions, refer to:
- [Upstash Documentation](https://docs.upstash.com/)
- [Context7 GitHub Repository](https://github.com/context7/context7)
- [Project Issue Tracker](https://github.com/yusuke-kurosawa/PMPLearningManagement/issues)

---

**Last Updated:** 2025-01-20
**Version:** 1.0
**Compatibility:** Context7 MCP v2.0+, Upstash API v2