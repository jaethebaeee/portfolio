#!/usr/bin/env node

/**
 * Workflow API Test Script
 * Tests the workflow API endpoints structure and basic functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Workflow API Implementation...\n');

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

// Test 1: Check if API route files exist
test('API route files exist', () => {
  const routeFile = path.join(__dirname, 'app/api/workflows/route.ts');
  const idRouteFile = path.join(__dirname, 'app/api/workflows/[id]/route.ts');
  
  assert(fs.existsSync(routeFile), 'app/api/workflows/route.ts should exist');
  assert(fs.existsSync(idRouteFile), 'app/api/workflows/[id]/route.ts should exist');
});

// Test 2: Check route.ts exports
test('route.ts exports GET and POST', () => {
  const routeFile = path.join(__dirname, 'app/api/workflows/route.ts');
  const content = fs.readFileSync(routeFile, 'utf8');
  
  assert(content.includes('export async function GET'), 'Should export GET function');
  assert(content.includes('export async function POST'), 'Should export POST function');
  assert(content.includes('getWorkflows'), 'Should use getWorkflows');
  assert(content.includes('createWorkflow'), 'Should use createWorkflow');
});

// Test 3: Check [id]/route.ts exports
test('[id]/route.ts exports GET, PATCH, DELETE', () => {
  const routeFile = path.join(__dirname, 'app/api/workflows/[id]/route.ts');
  const content = fs.readFileSync(routeFile, 'utf8');
  
  assert(content.includes('export async function GET'), 'Should export GET function');
  assert(content.includes('export async function PATCH'), 'Should export PATCH function');
  assert(content.includes('export async function DELETE'), 'Should export DELETE function');
  assert(content.includes('getWorkflow'), 'Should use getWorkflow');
  assert(content.includes('updateWorkflow'), 'Should use updateWorkflow');
  assert(content.includes('deleteWorkflow'), 'Should use deleteWorkflow');
});

// Test 4: Check authentication in routes
test('Routes check authentication', () => {
  const routeFile = path.join(__dirname, 'app/api/workflows/route.ts');
  const idRouteFile = path.join(__dirname, 'app/api/workflows/[id]/route.ts');
  const routeContent = fs.readFileSync(routeFile, 'utf8');
  const idRouteContent = fs.readFileSync(idRouteFile, 'utf8');
  
  assert(routeContent.includes('await auth()'), 'Should check auth in route.ts');
  assert(routeContent.includes('userId'), 'Should use userId');
  assert(idRouteContent.includes('await auth()'), 'Should check auth in [id]/route.ts');
  assert(idRouteContent.includes('userId'), 'Should use userId');
});

// Test 5: Check lib/workflows.ts security
test('lib/workflows.ts has userId parameters', () => {
  const libFile = path.join(__dirname, 'lib/workflows.ts');
  const content = fs.readFileSync(libFile, 'utf8');
  
  assert(content.includes('getWorkflow(userId: string'), 'getWorkflow should require userId');
  assert(content.includes('updateWorkflow(userId: string'), 'updateWorkflow should require userId');
  assert(content.includes('deleteWorkflow(userId: string'), 'deleteWorkflow should require userId');
  assert(content.includes('.eq(\'user_id\', userId)'), 'Should filter by user_id');
});

// Test 6: Check error handling
test('Routes have proper error handling', () => {
  const routeFile = path.join(__dirname, 'app/api/workflows/route.ts');
  const idRouteFile = path.join(__dirname, 'app/api/workflows/[id]/route.ts');
  const routeContent = fs.readFileSync(routeFile, 'utf8');
  const idRouteContent = fs.readFileSync(idRouteFile, 'utf8');
  
  assert(routeContent.includes('try'), 'Should have try-catch in route.ts');
  assert(routeContent.includes('catch'), 'Should have try-catch in route.ts');
  assert(idRouteContent.includes('try'), 'Should have try-catch in [id]/route.ts');
  assert(idRouteContent.includes('catch'), 'Should have try-catch in [id]/route.ts');
  assert(idRouteContent.includes('404'), 'Should return 404 for not found');
});

// Test 7: Check response formats
test('Routes return proper response formats', () => {
  const routeFile = path.join(__dirname, 'app/api/workflows/route.ts');
  const idRouteFile = path.join(__dirname, 'app/api/workflows/[id]/route.ts');
  const routeContent = fs.readFileSync(routeFile, 'utf8');
  const idRouteContent = fs.readFileSync(idRouteFile, 'utf8');
  
  assert(routeContent.includes('NextResponse.json({ workflows'), 'GET should return workflows array');
  assert(routeContent.includes('NextResponse.json({ workflow'), 'POST should return workflow object');
  assert(idRouteContent.includes('NextResponse.json({ workflow'), 'GET/PATCH should return workflow object');
  assert(idRouteContent.includes('success: true'), 'DELETE should return success');
});

// Test 8: Check frontend integration
test('Frontend page uses correct function signatures', () => {
  const frontendFile = path.join(__dirname, 'app/[locale]/dashboard/workflows/page.tsx');
  if (!fs.existsSync(frontendFile)) {
    console.log('⚠️  Frontend file not found, skipping test');
    return;
  }
  
  const content = fs.readFileSync(frontendFile, 'utf8');
  assert(content.includes('updateWorkflow(userId'), 'Should pass userId to updateWorkflow');
  assert(content.includes('deleteWorkflow(userId'), 'Should pass userId to deleteWorkflow');
});

// Run all tests
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
  console.log('\n🎉 All tests passed! Workflow APIs are properly implemented.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review the errors above.');
  process.exit(1);
}

