#!/bin/bash

# Install Performance Optimization Dependencies
echo "📦 Installing performance optimization dependencies..."

# Vite plugins
npm install --save-dev \
  rollup-plugin-visualizer \
  vite-plugin-compression \
  vite-plugin-pwa \
  @vitejs/plugin-legacy \
  vite-plugin-static-copy \
  lightningcss

# React optimization plugins
npm install --save-dev \
  @babel/plugin-transform-react-constant-elements \
  @babel/plugin-transform-react-inline-elements

# PWA dependencies
npm install --save-dev \
  workbox-window \
  workbox-precaching \
  workbox-routing \
  workbox-strategies

echo "✅ Dependencies installed successfully!"

echo "📊 Generating initial bundle analysis..."
npm run build -- --analyze

echo "🎯 Performance optimization setup complete!"
echo ""
echo "Next steps:"
echo "1. Replace vite.config.mjs with vite.config.optimized.mjs"
echo "2. Import and use optimized components"
echo "3. Run 'npm run build' to test the optimized build"
echo "4. Check dist/bundle-stats.html for bundle analysis"