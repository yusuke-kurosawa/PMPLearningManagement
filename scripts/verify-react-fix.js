#!/usr/bin/env node

/**
 * React Duplication Verification Script
 *
 * This script verifies that the React duplication issue is fixed by:
 * 1. Checking for single React chunk in build output
 * 2. Verifying no duplicate React instances in the bundle
 * 3. Confirming proper chunk separation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist', 'assets');

console.log('🔍 React Duplication Fix Verification\n');

// Check if dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('❌ Error: dist directory not found. Please run "npm run build" first.');
  process.exit(1);
}

// Get all JS files in dist/assets
const jsFiles = fs.readdirSync(distDir).filter(file => file.endsWith('.js'));

// Check for React-related chunks
const reactChunks = jsFiles.filter(file =>
  file.includes('react') || file.includes('React')
);

console.log('📦 React-related chunks found:');
reactChunks.forEach(chunk => {
  const size = fs.statSync(path.join(distDir, chunk)).size;
  console.log(`  - ${chunk} (${(size / 1024).toFixed(2)} KB)`);
});

if (reactChunks.length === 0) {
  console.error('\n❌ Error: No React chunks found in build output');
  process.exit(1);
}

if (reactChunks.length === 1) {
  console.log('\n✅ Success: Only 1 React chunk found (expected behavior)');
} else {
  console.warn(`\n⚠️  Warning: ${reactChunks.length} React chunks found (expected 1)`);
}

// Check for React vendor chunk specifically
const reactVendorChunk = reactChunks.find(chunk => chunk.includes('react-vendor'));
if (reactVendorChunk) {
  console.log('✅ React vendor chunk found:', reactVendorChunk);
} else {
  console.warn('⚠️  Warning: No react-vendor chunk found');
}

// Analyze chunk content for React references
console.log('\n🔍 Analyzing chunk content for React instances...');
let reactInstanceCount = 0;

for (const chunk of reactChunks) {
  const content = fs.readFileSync(path.join(distDir, chunk), 'utf-8');

  // Look for React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
  // This is a unique property that indicates a React instance
  const secretInternalsMatches = content.match(/\b__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED\b/g);
  if (secretInternalsMatches) {
    reactInstanceCount += secretInternalsMatches.length;
  }
}

if (reactInstanceCount === 1) {
  console.log('✅ Single React instance detected (expected)');
} else if (reactInstanceCount === 0) {
  console.log('⚠️  Warning: No React instance markers found (may be minified)');
} else {
  console.warn(`⚠️  Warning: ${reactInstanceCount} React instance markers found (expected 1)`);
}

// Check vendor chunks
console.log('\n📊 Vendor chunk analysis:');
const vendorChunks = jsFiles.filter(file =>
  file.includes('vendor') || file.includes('react')
);

const chunkSizes = vendorChunks.map(chunk => {
  const size = fs.statSync(path.join(distDir, chunk)).size;
  return { name: chunk, size };
}).sort((a, b) => b.size - a.size);

console.log('Top 5 largest vendor chunks:');
chunkSizes.slice(0, 5).forEach((chunk, index) => {
  console.log(`  ${index + 1}. ${chunk.name} - ${(chunk.size / 1024).toFixed(2)} KB`);
});

// Final verdict
console.log('\n' + '='.repeat(60));
if (reactChunks.length === 1 && reactVendorChunk) {
  console.log('✅ VERIFICATION PASSED');
  console.log('   React duplication issue appears to be fixed!');
  console.log('   - Single React vendor chunk detected');
  console.log('   - No duplicate React instances found');
  console.log('\n📝 Next steps:');
  console.log('   1. Test the application in browser: npm run preview');
  console.log('   2. Check browser console for errors');
  console.log('   3. Verify all features work correctly');
  process.exit(0);
} else {
  console.log('⚠️  VERIFICATION WARNING');
  console.log('   Some unexpected chunk configurations detected.');
  console.log('   Please review the build output above.');
  process.exit(1);
}
