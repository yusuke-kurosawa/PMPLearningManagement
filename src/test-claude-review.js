/**
 * ファイル説明: {description}
 * 開発者: {developer}
 * 専門分野: {specialization}
 * 作成日: {created}
 * 最終更新: {updated}
 * 依存関係: {dependencies}
 * セキュリティレベル: {security_level}
 */ export function testFunction(a, b) {
  // This function needs improvement
  var result = a + b
  console.log(result)
  return result
}

// Potential security issue
eval('console.log("test")')

// Performance issue
for (let i = 0; i < 1000000; i++) {
  document.getElementById('test')
}

// Unused variable
const unusedVar = 'This is never used'

// Missing error handling
function divideNumbers(a, b) {
  return a / b // No check for division by zero
}

// Inefficient array operation
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
