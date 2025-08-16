#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Find all TypeScript and JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = []
  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const itemPath = path.join(dir, item)
    const stat = fs.statSync(itemPath)
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
      files.push(...findFiles(itemPath, extensions))
    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
      files.push(itemPath)
    }
  }
  
  return files
}

// Check if error variable is actually used in the catch block
function isErrorUsed(catchBlock) {
  // Remove the first line (catch statement)
  const lines = catchBlock.split('\n').slice(1)
  const blockContent = lines.join('\n')
  
  // Check for various error usages
  const patterns = [
    /error\s*instanceof/,
    /error\.message/,
    /error\.stack/,
    /error\.name/,
    /error\.code/,
    /console\.\w+\([^)]*error/,
    /logger\.\w+\([^)]*error/,
    /throw\s+error/,
    /Error\([^)]*error/,
    /JSON\.stringify\([^)]*error/,
    /\`[^`]*\${[^}]*error/,
    /['"][^'"]*['"].*error/,
  ]
  
  return patterns.some(pattern => pattern.test(blockContent))
}

// Process a file and fix unused error variables
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false
  
  // Find all catch blocks
  const catchRegex = /catch\s*\(\s*error\s*\)\s*{/g
  let match
  const replacements = []
  
  while ((match = catchRegex.exec(content)) !== null) {
    const startIdx = match.index
    const catchStart = startIdx + match[0].length
    
    // Find the matching closing brace
    let braceCount = 1
    let idx = catchStart
    while (braceCount > 0 && idx < content.length) {
      if (content[idx] === '{') braceCount++
      else if (content[idx] === '}') braceCount--
      idx++
    }
    
    const catchBlock = content.substring(catchStart, idx - 1)
    
    // Check if error is used
    if (!isErrorUsed(catchBlock)) {
      replacements.push({
        start: startIdx,
        end: catchStart,
        original: match[0],
        replacement: match[0].replace('error', '_error')
      })
    }
  }
  
  // Apply replacements in reverse order to maintain indices
  for (let i = replacements.length - 1; i >= 0; i--) {
    const r = replacements[i]
    content = content.substring(0, r.start) + r.replacement + content.substring(r.end)
    modified = true
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`Fixed: ${filePath}`)
    return 1
  }
  
  return 0
}

// Main
const srcDir = path.join(__dirname, '..', 'src')
const files = findFiles(srcDir)
let fixedCount = 0

console.log(`Found ${files.length} files to check...`)

for (const file of files) {
  fixedCount += processFile(file)
}

console.log(`\nFixed ${fixedCount} files`)