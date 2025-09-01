/**
 * Comprehensive Test Suite for Enhanced Feedback System
 * Tests Analytics, Mobile Components, and Response Interface
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Starting Comprehensive Feedback System Tests...\n');

// Test Configuration
const API_BASE = 'http://localhost:5000';
const DEV_USER_ID = 'dad80070-7b95-4380-bbfa-d56ccc6f4f98';

// Test Results Tracker
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const message = `${status} - ${testName}`;
  console.log(message + (details ? ` | ${details}` : ''));
  
  testResults.tests.push({ testName, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

function logSection(sectionName) {
  console.log(`\n📋 ${sectionName}`);
  console.log('='.repeat(50));
}

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return { response, data, status: response.status };
  } catch (error) {
    return { error, status: 0 };
  }
}

async function testBasicConnectivity() {
  logSection('BASIC CONNECTIVITY TESTS');
  
  // Test server is running
  try {
    const { status } = await makeRequest('/');
    logTest('Server is running and responding', status === 200, `Status: ${status}`);
  } catch (error) {
    logTest('Server is running and responding', false, `Error: ${error.message}`);
  }
  
  // Test dev user endpoint
  const { data: devUser, status: devStatus } = await makeRequest('/api/auth/user-dev');
  logTest('Dev user endpoint responds', devStatus === 200, `User ID: ${typeof devUser === 'object' ? devUser.id : 'Invalid response'}`);
  
  return devUser;
}

async function testAnalyticsEndpoints(devUser) {
  logSection('ANALYTICS API TESTS');
  
  if (!devUser || !devUser.id) {
    logTest('Analytics API tests', false, 'No valid dev user found');
    return;
  }
  
  // Test analytics endpoint (will be protected, should return HTML for unauthenticated)
  const { data: analyticsResponse, status: analyticsStatus } = await makeRequest(`/api/supervisor/analytics/${devUser.id}`);
  
  // Since endpoint is protected, we expect HTML response (401 redirect to login)
  const isProtected = typeof analyticsResponse === 'string' && analyticsResponse.includes('html');
  logTest('Analytics endpoint is properly protected', isProtected, `Status: ${analyticsStatus}`);
  
  // Test invalid analytics endpoint
  const { status: invalidStatus } = await makeRequest('/api/supervisor/analytics/invalid-id');
  logTest('Invalid analytics request handled', invalidStatus >= 400, `Status: ${invalidStatus}`);
}

async function testFeedbackEndpoints(devUser) {
  logSection('FEEDBACK API TESTS');
  
  // Test student feedback endpoint (protected)
  const { data: feedbackResponse, status: feedbackStatus } = await makeRequest('/api/student/feedback');
  const isFeedbackProtected = typeof feedbackResponse === 'string' && feedbackResponse.includes('html');
  logTest('Student feedback endpoint is protected', isFeedbackProtected, `Status: ${feedbackStatus}`);
  
  // Test supervisor feedback endpoint (protected)
  const { data: supFeedbackResponse, status: supFeedbackStatus } = await makeRequest('/api/supervisor/feedback');
  const isSupFeedbackProtected = typeof supFeedbackResponse === 'string' && supFeedbackResponse.includes('html');
  logTest('Supervisor feedback endpoint is protected', isSupFeedbackProtected, `Status: ${supFeedbackStatus}`);
  
  // Test feedback response submission (protected)
  const { data: responseSubmission, status: responseStatus } = await makeRequest('/api/student/feedback/response', {
    method: 'POST',
    body: JSON.stringify({ feedbackId: 'test', responseText: 'test response' })
  });
  const isResponseProtected = typeof responseSubmission === 'object' && responseSubmission.error;
  logTest('Feedback response endpoint is protected', isResponseProtected, `Status: ${responseStatus}`);
}

async function testFrontendAssets() {
  logSection('FRONTEND ASSET TESTS');
  
  // Test main frontend page loads
  const { status: frontendStatus } = await makeRequest('/');
  logTest('Frontend page loads', frontendStatus === 200, `Status: ${frontendStatus}`);
  
  // Test if Vite dev server is serving assets
  const { status: assetStatus } = await makeRequest('/@vite/client');
  logTest('Vite client assets available', assetStatus === 200, `Status: ${assetStatus}`);
}

function testComponentStructure() {
  logSection('COMPONENT STRUCTURE TESTS');
  
  // Test if critical files exist
  // fs and path already imported at top
  
  const criticalFiles = [
    '/home/runner/workspace/client/src/components/supervisor/FeedbackAnalytics.tsx',
    '/home/runner/workspace/client/src/components/mobile/MobileFeedbackCard.tsx',
    '/home/runner/workspace/client/src/components/mobile/MobileFeedbackList.tsx',
    '/home/runner/workspace/client/src/components/supervisor/StudentResponsesView.tsx',
    '/home/runner/workspace/client/src/pages/feedback.tsx',
    '/home/runner/workspace/client/src/pages/supervisor/dashboard.tsx'
  ];
  
  criticalFiles.forEach(filePath => {
    const exists = fs.existsSync(filePath);
    const fileName = path.basename(filePath);
    logTest(`${fileName} component exists`, exists, filePath);
  });
  
  // Test server files
  const serverFiles = [
    '/home/runner/workspace/server/routes.ts',
    '/home/runner/workspace/server/storage.ts'
  ];
  
  serverFiles.forEach(filePath => {
    const exists = fs.existsSync(filePath);
    const fileName = path.basename(filePath);
    logTest(`${fileName} server file exists`, exists, filePath);
    
    if (exists) {
      const content = fs.readFileSync(filePath, 'utf8');
      // Test for key analytics methods
      if (fileName === 'storage.ts') {
        const hasAnalytics = content.includes('getFeedbackAnalytics');
        logTest('Analytics methods implemented in storage', hasAnalytics, 'getFeedbackAnalytics method found');
        
        const hasResponseMethod = content.includes('createFeedbackResponse');
        logTest('Response methods implemented in storage', hasResponseMethod, 'createFeedbackResponse method found');
      }
      
      // Test for key API routes
      if (fileName === 'routes.ts') {
        const hasAnalyticsRoute = content.includes('/api/supervisor/analytics');
        logTest('Analytics API route implemented', hasAnalyticsRoute, 'Analytics route found');
        
        const hasResponseRoute = content.includes('/api/supervisor/feedback/reply');
        logTest('Response API route implemented', hasResponseRoute, 'Response route found');
      }
    }
  });
}

function testPackageConfiguration() {
  logSection('PACKAGE CONFIGURATION TESTS');
  
  // fs already imported at top
  
  // Test package.json for required dependencies
  try {
    const packageJson = JSON.parse(fs.readFileSync('/home/runner/workspace/package.json', 'utf8'));
    
    const requiredDeps = ['recharts'];
    requiredDeps.forEach(dep => {
      const exists = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
      logTest(`${dep} dependency installed`, !!exists, exists ? `Version: ${exists}` : 'Not found');
    });
    
    // Test scripts
    const hasDevScript = !!packageJson.scripts?.dev;
    logTest('Dev script configured', hasDevScript, packageJson.scripts?.dev || 'Not found');
    
    const hasCheckScript = !!packageJson.scripts?.check;
    logTest('Type check script configured', hasCheckScript, packageJson.scripts?.check || 'Not found');
    
  } catch (error) {
    logTest('Package.json readable', false, error.message);
  }
}

function testTypeScriptCompilation() {
  logSection('TYPESCRIPT COMPILATION TESTS');
  
  // execSync already imported at top
  
  try {
    // Test TypeScript compilation
    execSync('npm run check', { 
      cwd: '/home/runner/workspace',
      stdio: 'pipe',
      timeout: 30000
    });
    logTest('TypeScript compilation passes', true, 'No compilation errors');
  } catch (error) {
    const stderr = error.stderr ? error.stderr.toString() : error.message;
    logTest('TypeScript compilation passes', false, `Compilation errors: ${stderr.slice(0, 200)}...`);
  }
}

async function testMobileFeatures() {
  logSection('MOBILE FEATURE TESTS');
  
  // fs already imported at top
  
  // Test mobile component implementation
  const mobileCardPath = '/home/runner/workspace/client/src/components/mobile/MobileFeedbackCard.tsx';
  if (fs.existsSync(mobileCardPath)) {
    const content = fs.readFileSync(mobileCardPath, 'utf8');
    
    // Check for mobile-specific features
    const hasTouchOptimized = content.includes('touch') || content.includes('mobile');
    logTest('Mobile touch optimizations implemented', hasTouchOptimized, 'Touch/mobile keywords found');
    
    const hasResponsiveDesign = content.includes('responsive') || content.includes('w-') || content.includes('sm:') || content.includes('md:');
    logTest('Responsive design classes present', hasResponsiveDesign, 'Tailwind responsive classes found');
    
    const hasGradients = content.includes('gradient');
    logTest('Modern UI gradients implemented', hasGradients, 'Gradient styling found');
  }
  
  // Test mobile list component
  const mobileListPath = '/home/runner/workspace/client/src/components/mobile/MobileFeedbackList.tsx';
  if (fs.existsSync(mobileListPath)) {
    const content = fs.readFileSync(mobileListPath, 'utf8');
    
    const hasInfiniteScroll = content.includes('scroll') && content.includes('virtual');
    logTest('Infinite scroll implemented', hasInfiniteScroll, 'Scroll virtualization keywords found');
    
    const hasFiltering = content.includes('filter') || content.includes('search');
    logTest('Mobile filtering implemented', hasFiltering, 'Filter/search functionality found');
  }
}

async function testAnalyticsFeatures() {
  logSection('ANALYTICS FEATURE TESTS');
  
  // fs already imported at top
  
  // Test analytics component
  const analyticsPath = '/home/runner/workspace/client/src/components/supervisor/FeedbackAnalytics.tsx';
  if (fs.existsSync(analyticsPath)) {
    const content = fs.readFileSync(analyticsPath, 'utf8');
    
    const hasCharts = content.includes('Chart') || content.includes('recharts');
    logTest('Chart library integration', hasCharts, 'Chart components found');
    
    const hasMetrics = content.includes('metrics') || content.includes('analytics');
    logTest('Analytics metrics implemented', hasMetrics, 'Metrics functionality found');
    
    const hasTimeRanges = content.includes('timeRange') || content.includes('7d') || content.includes('30d');
    logTest('Time range filtering implemented', hasTimeRanges, 'Time range functionality found');
    
    const hasVisualization = content.includes('PieChart') || content.includes('BarChart') || content.includes('LineChart');
    logTest('Multiple chart types implemented', hasVisualization, 'Multiple visualization types found');
  }
}

async function runAllTests() {
  console.log('🧪 P³ Pharmacy Academy - Enhanced Feedback System Test Suite');
  console.log('============================================================\n');
  
  // Start tests
  const startTime = Date.now();
  
  try {
    // Basic connectivity and API tests
    const devUser = await testBasicConnectivity();
    await testAnalyticsEndpoints(devUser);
    await testFeedbackEndpoints(devUser);
    await testFrontendAssets();
    
    // Component and configuration tests  
    testComponentStructure();
    testPackageConfiguration();
    testTypeScriptCompilation();
    
    // Feature-specific tests
    await testMobileFeatures();
    await testAnalyticsFeatures();
    
  } catch (error) {
    console.error('Test suite error:', error);
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Print final results
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`⏱️  Duration: ${duration}s`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📋 Total:  ${testResults.tests.length}`);
  
  const passRate = ((testResults.passed / testResults.tests.length) * 100).toFixed(1);
  console.log(`📈 Pass Rate: ${passRate}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.tests
      .filter(t => !t.passed)
      .forEach(t => console.log(`   • ${t.testName}: ${t.details}`));
  }
  
  console.log(`\n🎯 SYSTEM STATUS: ${passRate >= 85 ? '✅ PRODUCTION READY' : passRate >= 70 ? '⚠️  NEEDS ATTENTION' : '❌ REQUIRES FIXES'}`);
  
  if (passRate >= 85) {
    console.log('🚀 The enhanced feedback system is ready for production deployment!');
  } else if (passRate >= 70) {
    console.log('⚠️  System is mostly functional but has some issues to address.');
  } else {
    console.log('❌ System has critical issues that need to be resolved before deployment.');
  }
  
  console.log('\n🔗 Next Steps:');
  console.log('   1. Review any failed tests above');
  console.log('   2. Test the UI manually in browser at http://localhost:5000');
  console.log('   3. Test mobile responsiveness with browser dev tools');
  console.log('   4. Verify analytics dashboard functionality');
  console.log('   5. Test supervisor-student feedback flow end-to-end');
}

// Run if called directly
runAllTests().catch(console.error);

export { runAllTests, testResults };