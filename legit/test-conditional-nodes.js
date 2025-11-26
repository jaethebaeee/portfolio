/**
 * Conditional Node Logic Test
 * Tests the logic used by conditional nodes (if/else)
 */

console.log('🧪 Testing Conditional Node Logic...\n');

// Copied from lib/conditional-logic.ts for testing purposes
// (In a real setup with ts-node, we would import this)
function evaluateCondition(condition, variables) {
  const varValue = variables[condition.variable];
  if (varValue === undefined) {
    return false;
  }

  // Operator mapping
  let operator = condition.operator;
  if (operator === 'equals') operator = '==';
  if (operator === 'not_equals') operator = '!=';
  if (operator === 'greater_than') operator = '>';
  if (operator === 'less_than') operator = '<';

  // contains operator (string only)
  if (operator === 'contains') {
    return String(varValue).includes(String(condition.value));
  }

  // Check if numeric comparison needed
  const isNumericOperator = ['>', '<', '>=', '<=', 'greater_than', 'less_than'].includes(operator);
  
  // Check if values can be converted to numbers
  const numVarValue = Number(varValue);
  const numConditionValue = Number(condition.value);
  const areBothNumbers = !isNaN(numVarValue) && !isNaN(numConditionValue);

  if (isNumericOperator || (areBothNumbers && typeof condition.value !== 'string')) {
    // Numeric comparison
    switch (operator) {
      case '>': return numVarValue > numConditionValue;
      case '<': return numVarValue < numConditionValue;
      case '>=': return numVarValue >= numConditionValue;
      case '<=': return numVarValue <= numConditionValue;
      case '==': return numVarValue === numConditionValue;
      case '!=': return numVarValue !== numConditionValue;
    }
  }

  // String comparison (default)
  switch (operator) {
    case '==': return String(varValue) === String(condition.value);
    case '!=': return String(varValue) !== String(condition.value);
    default: return false;
  }
}

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Test 1: Numeric comparisons
test('Numeric comparisons', () => {
  const variables = { age: 25, score: 90 };
  
  assert(evaluateCondition({ variable: 'age', operator: '>', value: 20 }, variables) === true, '25 > 20');
  assert(evaluateCondition({ variable: 'age', operator: '<', value: 30 }, variables) === true, '25 < 30');
  assert(evaluateCondition({ variable: 'score', operator: '>=', value: 90 }, variables) === true, '90 >= 90');
  assert(evaluateCondition({ variable: 'score', operator: '==', value: 90 }, variables) === true, '90 == 90');
  assert(evaluateCondition({ variable: 'age', operator: '==', value: 25 }, variables) === true, '25 == 25');
  assert(evaluateCondition({ variable: 'age', operator: '>', value: 30 }, variables) === false, '25 > 30 should be false');
});

// Test 2: String comparisons
test('String comparisons', () => {
  const variables = { status: 'active', type: 'premium' };
  
  assert(evaluateCondition({ variable: 'status', operator: 'equals', value: 'active' }, variables) === true, 'active == active');
  assert(evaluateCondition({ variable: 'status', operator: '!=', value: 'inactive' }, variables) === true, 'active != inactive');
  assert(evaluateCondition({ variable: 'type', operator: 'contains', value: 'rem' }, variables) === true, 'premium contains rem');
  assert(evaluateCondition({ variable: 'status', operator: 'equals', value: 'inactive' }, variables) === false, 'active == inactive should be false');
});

// Test 3: Mixed types
test('Mixed types handling', () => {
  const variables = { age: '25', count: 10 };
  
  // String variable compared as number
  assert(evaluateCondition({ variable: 'age', operator: '>', value: 20 }, variables) === true, '"25" > 20');
  
  // Number variable compared as string
  assert(evaluateCondition({ variable: 'count', operator: 'equals', value: '10' }, variables) === true, '10 == "10"');
});

// Test 4: Missing variables
test('Missing variables handling', () => {
  const variables = { exists: true };
  
  assert(evaluateCondition({ variable: 'missing', operator: '==', value: true }, variables) === false, 'missing variable returns false');
});

// Run tests
console.log('Running tests...\n');

for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}\n`);
    failed++;
  }
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('\n🎉 All conditional logic tests passed!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed.');
  process.exit(1);
}

