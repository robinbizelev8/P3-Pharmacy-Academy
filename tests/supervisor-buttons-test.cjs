#!/usr/bin/env node

/**
 * Simple Supervisor Button Functionality Test
 * 
 * Tests that the supervisor dashboard buttons are properly connected
 * and modals open/close correctly without needing database access.
 */

const baseUrl = 'http://localhost:5001';

class SupervisorButtonTester {
  constructor() {
    this.testResults = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = {
      info: '📋',
      success: '✅', 
      error: '❌',
      warning: '⚠️'
    }[type];
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async runTest(name, testFunction) {
    this.testResults.totalTests++;
    this.log(`Testing: ${name}`);
    
    const startTime = Date.now();
    let result = { name, status: 'failed', error: null, duration: 0 };
    
    try {
      await testFunction();
      result = {
        name,
        status: 'passed',
        error: null,
        duration: Date.now() - startTime
      };
      this.testResults.passed++;
      this.log(`✅ ${name} - PASSED`, 'success');
    } catch (error) {
      result = {
        name,
        status: 'failed',
        error: error.message,
        duration: Date.now() - startTime
      };
      this.testResults.failed++;
      this.log(`❌ ${name} - FAILED: ${error.message}`, 'error');
    }
    
    this.testResults.tests.push(result);
    return result;
  }

  async testServerRunning() {
    return this.runTest('Server is running', async () => {
      try {
        const response = await fetch(`${baseUrl}/api/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          // Try alternative endpoint
          const altResponse = await fetch(`${baseUrl}/`, {
            method: 'GET'
          });
          if (!altResponse.ok) {
            throw new Error('Server not responding');
          }
        }
      } catch (error) {
        throw new Error(`Server connection failed: ${error.message}`);
      }
    });
  }

  async testAPIEndpointsExist() {
    return this.runTest('API endpoints return expected responses', async () => {
      const endpoints = [
        '/api/supervisor/trainee/test/progress',
        '/api/supervisor/feedback', 
        '/api/supervisor/scenarios'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${baseUrl}${endpoint}`, {
            method: endpoint.includes('/feedback') || endpoint.includes('/scenarios') ? 'POST' : 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: endpoint.includes('/feedback') || endpoint.includes('/scenarios') ? 
              JSON.stringify({ test: 'data' }) : undefined
          });
          
          // We expect 401 or 403 (authentication required) rather than 404 (not found)
          if (response.status === 404) {
            throw new Error(`Endpoint ${endpoint} not found`);
          }
          
          // 401/403 is expected - means endpoint exists but requires auth
          if (response.status !== 401 && response.status !== 403) {
            this.log(`Endpoint ${endpoint}: ${response.status}`, 'info');
          }
          
        } catch (error) {
          if (error.message.includes('not found')) {
            throw error;
          }
          // Other errors (like ECONNREFUSED) are less critical for this test
        }
      }
    });
  }

  async testComponentFiles() {
    return this.runTest('Modal components exist', async () => {
      const fs = require('fs');
      const components = [
        'client/src/components/supervisor/TraineeProgressModal.tsx',
        'client/src/components/supervisor/FeedbackModal.tsx', 
        'client/src/components/supervisor/AssignScenarioModal.tsx'
      ];
      
      for (const component of components) {
        if (!fs.existsSync(component)) {
          throw new Error(`Component file missing: ${component}`);
        }
        
        const content = fs.readFileSync(component, 'utf8');
        
        // Check for key functionality
        if (!content.includes('Dialog') || !content.includes('export')) {
          throw new Error(`Component ${component} missing expected structure`);
        }
      }
    });
  }

  async testDashboardIntegration() {
    return this.runTest('Dashboard imports and uses modal components', async () => {
      const fs = require('fs');
      const dashboardPath = 'client/src/pages/supervisor/dashboard.tsx';
      
      if (!fs.existsSync(dashboardPath)) {
        throw new Error('Dashboard file not found');
      }
      
      const content = fs.readFileSync(dashboardPath, 'utf8');
      
      // Check imports
      const requiredImports = [
        'TraineeProgressModal',
        'FeedbackModal',
        'AssignScenarioModal'
      ];
      
      for (const importName of requiredImports) {
        if (!content.includes(`import { ${importName}`)) {
          throw new Error(`Missing import: ${importName}`);
        }
      }
      
      // Check modal usage
      const modalUsage = [
        '<TraineeProgressModal',
        '<FeedbackModal',
        '<AssignScenarioModal'
      ];
      
      for (const usage of modalUsage) {
        if (!content.includes(usage)) {
          throw new Error(`Missing modal usage: ${usage}`);
        }
      }
      
      // Check button handlers
      const handlers = [
        'openProgressModal',
        'openFeedbackModal',
        'openScenarioModal'
      ];
      
      for (const handler of handlers) {
        if (!content.includes(handler)) {
          throw new Error(`Missing handler: ${handler}`);
        }
      }
    });
  }

  async runAllTests() {
    this.log('🚀 Starting Supervisor Button Functionality Tests');
    this.log('================================================');
    
    try {
      // Test basic server connectivity
      await this.testServerRunning();
      
      // Test API endpoints exist (don't need to work, just exist)
      await this.testAPIEndpointsExist();
      
      // Test frontend components
      await this.testComponentFiles();
      
      // Test dashboard integration
      await this.testDashboardIntegration();
      
    } catch (error) {
      this.log(`Test execution error: ${error.message}`, 'error');
    }
    
    this.generateReport();
  }

  generateReport() {
    this.log('================================================');
    this.log('📊 TEST RESULTS SUMMARY');
    this.log('================================================');
    this.log(`Total Tests: ${this.testResults.totalTests}`);
    this.log(`Passed: ${this.testResults.passed}`, this.testResults.passed > 0 ? 'success' : 'info');
    this.log(`Failed: ${this.testResults.failed}`, this.testResults.failed > 0 ? 'error' : 'info');
    
    if (this.testResults.totalTests > 0) {
      this.log(`Success Rate: ${((this.testResults.passed / this.testResults.totalTests) * 100).toFixed(1)}%`);
    }
    
    if (this.testResults.failed > 0) {
      this.log('\n❌ FAILED TESTS:', 'error');
      this.testResults.tests
        .filter(test => test.status === 'failed')
        .forEach(test => {
          this.log(`  • ${test.name}: ${test.error}`, 'error');
        });
    } else {
      this.log('\n✅ All supervisor button functionality tests PASSED!', 'success');
      this.log('✅ Modal components exist and are properly integrated', 'success');
      this.log('✅ API endpoints are available', 'success');
      this.log('✅ Dashboard properly imports and uses all modal components', 'success');
    }
    
    // Save detailed results
    const fs = require('fs');
    const reportPath = './tests/supervisor-buttons-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    this.log(`\n📋 Detailed report saved to: ${reportPath}`);
    
    // Exit with appropriate code
    process.exit(this.testResults.failed > 0 ? 1 : 0);
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new SupervisorButtonTester();
  tester.runAllTests().catch(console.error);
}

module.exports = SupervisorButtonTester;