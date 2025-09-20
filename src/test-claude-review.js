const { logger } = require('services/logger')

// Test file for Claude AI review
export function testFunction(a, b) {
  // This function needs improvement
  const result = a + b
  logger.info(result)
  return result
}

// Potential security issue
eval('logger.info("test")')

// Performance issue
for (let i = 0; i < 1000000; i++) {
  document.getElementById('test')
}

// Missing error handling
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
function divideNumbers(a, b) {
  return a / b // No check for division by zero
}

// Inefficient array operation
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
function findDuplicates(arr) {
  const duplicates = []
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j] && !duplicates.includes(arr[i])) {
        duplicates.push(arr[i])
      }
    }
  }
  return duplicates
}
