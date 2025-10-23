/**
 * Test file for keyword filtering functionality
 * Run this to verify the keyword blocking system works correctly
 */

import { checkForBlockedKeywords, getBlockedContentMessage, sanitizeText } from './keywordFilter';

// Test cases for different categories of blocked content
const testCases = [
  // Safe content (should not be blocked)
  { input: 'apple watch', expected: false, category: 'Safe Content' },
  { input: 'wireless headphones', expected: false, category: 'Safe Content' },
  { input: 'gaming laptop', expected: false, category: 'Safe Content' },
  
  // CSAM keywords (should be blocked)
  { input: 'child porn', expected: true, category: 'Child Sexual Abuse/Exploitation' },
  { input: 'underage sex', expected: true, category: 'Child Sexual Abuse/Exploitation' },
  { input: 'teen sex', expected: true, category: 'Child Sexual Abuse/Exploitation' },
  
  // Sexual content (should be blocked)
  { input: 'porn videos', expected: true, category: 'Sexual Content' },
  { input: 'nude pics', expected: true, category: 'Sexual Content' },
  { input: 'xxx content', expected: true, category: 'Sexual Content' },
  
  // Violence (should be blocked)
  { input: 'how to kill', expected: true, category: 'Violence/Gore' },
  { input: 'bomb tutorial', expected: true, category: 'Violence/Gore' },
  { input: 'torture methods', expected: true, category: 'Violence/Gore' },
  
  // Self-harm (should be blocked)
  { input: 'suicide method', expected: true, category: 'Self-harm/Suicide' },
  { input: 'how to cut myself', expected: true, category: 'Self-harm/Suicide' },
  
  // Terrorism (should be blocked)
  { input: 'isis recruitment', expected: true, category: 'Terrorism/Extremism' },
  { input: 'jihad bomb', expected: true, category: 'Terrorism/Extremism' },
  
  // Hate speech (should be blocked)
  { input: 'white supremacy', expected: true, category: 'Hate Speech' },
  { input: 'nazi propaganda', expected: true, category: 'Hate Speech' },
  
  // Drugs/Crime (should be blocked)
  { input: 'buy cocaine', expected: true, category: 'Illegal Drugs/Crime' },
  { input: 'fake passport', expected: true, category: 'Illegal Drugs/Crime' },
  { input: 'gun for sale', expected: true, category: 'Illegal Drugs/Crime' },
  
  // Non-consensual (should be blocked)
  { input: 'rape porn', expected: true, category: 'Non-consensual Content' },
  { input: 'forced sex', expected: true, category: 'Non-consensual Content' },
  
  // Fraud (should be blocked)
  { input: 'free credit card', expected: true, category: 'Fraud/Scams' },
  { input: 'hacking service', expected: true, category: 'Fraud/Scams' },
  
  // Profanity (should be blocked)
  { input: 'fuck this shit', expected: true, category: 'Profanity' },
  { input: 'stupid bitch', expected: true, category: 'Profanity' },
  
  // Edge cases
  { input: '', expected: false, category: 'Empty String' },
  { input: '   ', expected: false, category: 'Whitespace Only' },
  { input: 'normal product search', expected: false, category: 'Normal Search' },
];

// Run tests
console.log('🧪 Running Keyword Filter Tests...\n');

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  const result = checkForBlockedKeywords(testCase.input);
  const passed = result.isBlocked === testCase.expected;
  
  if (passed) {
    passedTests++;
    console.log(`✅ Test ${index + 1}: PASSED`);
    console.log(`   Input: "${testCase.input}"`);
    console.log(`   Expected: ${testCase.expected ? 'BLOCKED' : 'ALLOWED'}`);
    console.log(`   Result: ${result.isBlocked ? 'BLOCKED' : 'ALLOWED'}`);
    if (result.isBlocked) {
      console.log(`   Category: ${result.category}`);
      console.log(`   Matched Keywords: ${result.matchedKeywords.join(', ')}`);
    }
  } else {
    failedTests++;
    console.log(`❌ Test ${index + 1}: FAILED`);
    console.log(`   Input: "${testCase.input}"`);
    console.log(`   Expected: ${testCase.expected ? 'BLOCKED' : 'ALLOWED'}`);
    console.log(`   Result: ${result.isBlocked ? 'BLOCKED' : 'ALLOWED'}`);
    if (result.isBlocked) {
      console.log(`   Category: ${result.category}`);
      console.log(`   Matched Keywords: ${result.matchedKeywords.join(', ')}`);
    }
  }
  console.log('');
});

console.log('📊 Test Results Summary:');
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📈 Success Rate: ${((passedTests / testCases.length) * 100).toFixed(1)}%`);

// Test sanitization function
console.log('\n🧹 Testing Text Sanitization...');
const sanitizationTests = [
  'This contains fuck and shit words',
  'Buy cocaine online now',
  'Normal product description',
  'child porn is blocked content'
];

sanitizationTests.forEach((text, index) => {
  const sanitized = sanitizeText(text);
  console.log(`Test ${index + 1}:`);
  console.log(`  Original: "${text}"`);
  console.log(`  Sanitized: "${sanitized}"`);
  console.log('');
});

// Test error messages
console.log('💬 Testing Error Messages...');
const categories = [
  'Child Sexual Abuse/Exploitation',
  'Sexual Content',
  'Violence/Gore',
  'Self-harm/Suicide',
  'Terrorism/Extremism',
  'Hate Speech',
  'Illegal Drugs/Crime',
  'Non-consensual Content',
  'Fraud/Scams',
  'Profanity'
];

categories.forEach(category => {
  const message = getBlockedContentMessage(category);
  console.log(`${category}: "${message}"`);
});

console.log('\n🎉 Keyword Filter Testing Complete!');

export { testCases };
