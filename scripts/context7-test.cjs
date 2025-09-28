#!/usr/bin/env node

// Context7 Configuration Test Script
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const CONFIG_FILE = path.join(process.env.HOME, '.config', 'Claude', 'claude_desktop_config.json');

console.log('🧪 Context7 MCP Configuration Test');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function testConfiguration() {
    try {
        // 1. Check configuration file
        console.log('📋 Checking configuration file...');
        if (!fs.existsSync(CONFIG_FILE)) {
            console.error('❌ Configuration file not found:', CONFIG_FILE);
            return;
        }
        
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        const context7Config = config.mcpServers?.context7;
        
        if (!context7Config) {
            console.error('❌ Context7 not configured in MCP servers');
            return;
        }
        
        console.log('✅ Configuration file found and valid\n');
        
        // 2. Check environment variables
        console.log('🔧 Configuration Settings:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const env = context7Config.env || {};
        const settings = context7Config.settings || {};
        
        console.log('Cache TTL:', env.CONTEXT7_CACHE_TTL || 'Not set', '(', Math.floor((env.CONTEXT7_CACHE_TTL || 86400) / 86400), 'days)');
        console.log('Cache Size:', env.CONTEXT7_MAX_CACHE_SIZE || 'Not set');
        console.log('Request Timeout:', env.CONTEXT7_REQUEST_TIMEOUT || 'Not set', 'ms');
        console.log('Concurrent Requests:', env.CONTEXT7_CONCURRENT_REQUESTS || 'Not set');
        console.log('Rate Limit:', env.CONTEXT7_RATE_LIMIT || 'Not set', 'req/min');
        console.log('Memory Limit:', env.NODE_OPTIONS || 'Not set');
        
        // 3. Check advanced features
        console.log('\n⚡ Advanced Features:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const features = {
            'Compression': env.CONTEXT7_ENABLE_COMPRESSION === 'true',
            'Streaming': env.CONTEXT7_ENABLE_STREAMING === 'true',
            'Prefetch': env.CONTEXT7_ENABLE_PREFETCH === 'true',
            'Smart Caching': env.CONTEXT7_SMART_CACHING === 'true',
            'Predictive Loading': env.CONTEXT7_PREDICTIVE_LOADING === 'true',
            'Connection Pooling': env.CONTEXT7_CONNECTION_POOLING === 'true',
            'Upstash Integration': env.UPSTASH_REDIS_REST_URL ? true : false
        };
        
        for (const [feature, enabled] of Object.entries(features)) {
            console.log(`${enabled ? '✅' : '⚠️ '} ${feature}: ${enabled ? 'Enabled' : 'Disabled'}`);
        }
        
        // 4. Check documentation sources
        console.log('\n📚 Documentation Sources:', settings.documentation?.sources?.length || 0, 'sources configured');
        if (settings.documentation?.sources?.length > 0) {
            console.log('   Primary sources:', settings.documentation.sources.slice(0, 5).join(', '));
        }
        
        // 5. Performance metrics
        console.log('\n📊 Performance Configuration:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const caching = settings.caching || {};
        const performance = settings.performance || {};
        
        console.log('Cache Strategy:', caching.strategy || 'Default');
        console.log('Prefetch Depth:', caching.prefetch?.depth || 'Not set');
        console.log('Batch Size:', performance.batchSize || 'Not set');
        console.log('Connection Pool:', performance.connectionPooling?.enabled ? 
            `${performance.connectionPooling.minConnections}-${performance.connectionPooling.maxConnections} connections` : 
            'Disabled');
        
        // 6. Check MCP connection
        console.log('\n🔌 Testing MCP Connection:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        try {
            const { stdout } = await execAsync('claude mcp list 2>/dev/null');
            if (stdout.includes('context7') && stdout.includes('Connected')) {
                console.log('✅ Context7 MCP server is connected');
            } else {
                console.log('⚠️  Context7 MCP server status unknown');
            }
        } catch (error) {
            console.log('⚠️  Could not check MCP connection status');
        }
        
        // 7. Summary
        console.log('\n🎯 Configuration Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const score = Object.values(features).filter(v => v).length;
        const maxScore = Object.keys(features).length;
        const percentage = Math.round((score / maxScore) * 100);
        
        console.log(`Optimization Score: ${score}/${maxScore} (${percentage}%)`);
        
        if (percentage >= 80) {
            console.log('✅ Excellent! Configuration is highly optimized');
        } else if (percentage >= 60) {
            console.log('🟡 Good! Configuration has room for improvement');
        } else {
            console.log('⚠️  Configuration needs optimization for best performance');
        }
        
        // Recommendations
        if (!features['Upstash Integration']) {
            console.log('\n💡 Recommendation: Add Upstash for persistent caching');
            console.log('   Run: ./scripts/context7-upstash-setup.sh');
        }
        
        console.log('\n✅ Test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testConfiguration();
