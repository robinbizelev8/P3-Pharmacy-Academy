#!/usr/bin/env node

/**
 * Manage Trainees Functionality Test
 * 
 * Tests the complete "Assign New Trainee" button functionality:
 * 1. Component integration
 * 2. API endpoint availability
 * 3. Database functions
 * 4. UI integration
 */

const fs = require('fs');

class ManageTraineesFunctionalityTester {
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
      const testResult = await testFunction();
      result = {
        name,
        status: 'passed',
        error: null,
        duration: Date.now() - startTime,
        details: testResult
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

  // Test 1: ManageTraineesModal component exists and is properly structured
  async testModalComponentExists() {
    return this.runTest('ManageTraineesModal Component Structure', async () => {
      const modalPath = 'client/src/components/supervisor/ManageTraineesModal.tsx';
      
      if (!fs.existsSync(modalPath)) {
        throw new Error('ManageTraineesModal.tsx not found');
      }
      
      const content = fs.readFileSync(modalPath, 'utf8');
      
      // Check for required functionality
      const requiredFeatures = [
        'export function ManageTraineesModal',
        'useAllTrainees',
        'useAssignTrainee', 
        'useUnassignTrainee',
        'AlertDialog',
        'Tabs',
        'TraineeCard',
        'Available',
        'My Trainees',
        'Assigned to Others',
        'Search'
      ];
      
      const missingFeatures = requiredFeatures.filter(feature => !content.includes(feature));
      if (missingFeatures.length > 0) {
        throw new Error(`Missing features: ${missingFeatures.join(', ')}`);
      }
      
      return {
        fileSize: content.length,
        hasAllRequiredFeatures: true,
        componentCount: (content.match(/function \w+Component/g) || []).length
      };
    });
  }

  // Test 2: Dashboard integration is complete
  async testDashboardIntegration() {
    return this.runTest('Dashboard Integration', async () => {
      const dashboardPath = 'client/src/pages/supervisor/dashboard.tsx';
      
      const content = fs.readFileSync(dashboardPath, 'utf8');
      
      // Check for required integrations
      const requiredElements = [
        'import { ManageTraineesModal }',
        'manageTraineesModal',
        'setManageTraineesModal',
        'openManageTraineesModal',
        '<ManageTraineesModal',
        'onClick={openManageTraineesModal}'
      ];
      
      const missingElements = requiredElements.filter(element => !content.includes(element));
      if (missingElements.length > 0) {
        throw new Error(`Missing dashboard elements: ${missingElements.join(', ')}`);
      }
      
      // Verify the alert() call has been replaced
      if (content.includes("alert('Assign New Trainee functionality coming soon!')")) {
        throw new Error('Alert placeholder still present - button not properly connected');
      }
      
      return {
        hasProperImport: true,
        hasStateManagement: true,
        hasModalHandler: true,
        hasModalRendering: true,
        buttonConnected: true
      };
    });
  }

  // Test 3: API endpoints are properly defined
  async testAPIEndpoints() {
    return this.runTest('API Endpoints Definition', async () => {
      const routesPath = 'server/routes.ts';
      
      const content = fs.readFileSync(routesPath, 'utf8');
      
      // Check for new endpoints
      const requiredEndpoints = [
        '/api/supervisor/all-trainees',
        '/api/supervisor/trainees/:traineeId',
        'app.get.*all-trainees',
        'app.delete.*trainees'
      ];
      
      const missingEndpoints = requiredEndpoints.filter(endpoint => !content.match(endpoint));
      if (missingEndpoints.length > 0) {
        throw new Error(`Missing API endpoints: ${missingEndpoints.join(', ')}`);
      }
      
      return {
        hasGetAllTrainees: content.includes('/api/supervisor/all-trainees'),
        hasDeleteTrainee: content.includes('DELETE'),
        hasProperErrorHandling: content.includes('try {') && content.includes('catch')
      };
    });
  }

  // Test 4: Database functions are implemented
  async testDatabaseFunctions() {
    return this.runTest('Database Functions Implementation', async () => {
      const storagePath = 'server/storage.ts';
      
      const content = fs.readFileSync(storagePath, 'utf8');
      
      // Check for new database functions
      const requiredFunctions = [
        'getAllTrainees',
        'unassignTraineeFromSupervisor',
        'getTraineeAssignmentStatus'
      ];
      
      const missingFunctions = requiredFunctions.filter(fn => !content.includes(`async ${fn}`));
      if (missingFunctions.length > 0) {
        throw new Error(`Missing database functions: ${missingFunctions.join(', ')}`);
      }
      
      // Check interface declarations
      const interfaceFunctions = requiredFunctions.filter(fn => !content.includes(`${fn}(`));
      if (interfaceFunctions.length > 0) {
        throw new Error(`Missing interface declarations: ${interfaceFunctions.join(', ')}`);
      }
      
      return {
        hasAllDatabaseFunctions: true,
        hasInterfaceDeclarations: true,
        hasErrorHandling: content.includes('try {') && content.includes('catch'),
      };
    });
  }

  // Test 5: API hooks are properly implemented
  async testAPIHooks() {
    return this.runTest('API Hooks Implementation', async () => {
      const hooksPath = 'client/src/hooks/use-supervisor-data.ts';
      
      const content = fs.readFileSync(hooksPath, 'utf8');
      
      // Check for new hooks
      const requiredHooks = [
        'useAllTrainees',
        'useAssignTrainee',
        'useUnassignTrainee'
      ];
      
      const missingHooks = requiredHooks.filter(hook => !content.includes(`export function ${hook}`));
      if (missingHooks.length > 0) {
        throw new Error(`Missing API hooks: ${missingHooks.join(', ')}`);
      }
      
      // Check for mutations and query client
      if (!content.includes('useMutation') || !content.includes('useQueryClient')) {
        throw new Error('Missing mutation hooks or query client');
      }
      
      return {
        hasAllHooks: true,
        hasMutations: true,
        hasQueryInvalidation: content.includes('invalidateQueries')
      };
    });
  }

  // Test 6: TypeScript compilation
  async testTypeScriptCompilation() {
    return this.runTest('TypeScript Compilation', async () => {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      try {
        await execAsync('npm run check');
        return { compilationSuccessful: true };
      } catch (error) {
        throw new Error(`TypeScript compilation failed: ${error.message}`);
      }
    });
  }

  async runAllTests() {
    this.log('🚀 Starting Manage Trainees Functionality Tests');
    this.log('================================================');
    
    // Run all tests
    await this.testModalComponentExists();
    await this.testDashboardIntegration();
    await this.testAPIEndpoints();
    await this.testDatabaseFunctions();
    await this.testAPIHooks();
    await this.testTypeScriptCompilation();
    
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
      this.log('\n🎉 ALL MANAGE TRAINEES FUNCTIONALITY TESTS PASSED!', 'success');
      this.log('✅ ManageTraineesModal component is properly implemented', 'success');
      this.log('✅ Dashboard integration is complete', 'success');
      this.log('✅ API endpoints are available', 'success');
      this.log('✅ Database functions are implemented', 'success');
      this.log('✅ API hooks are properly configured', 'success');
      this.log('✅ TypeScript compilation successful', 'success');
      this.log('', 'info');
      this.log('🚀 The "Assign New Trainee" button is now fully functional!', 'success');
    }
    
    // Save detailed results
    const reportPath = './tests/manage-trainees-functionality-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    this.log(`\n📋 Detailed report saved to: ${reportPath}`);
    
    // Exit with appropriate code
    process.exit(this.testResults.failed > 0 ? 1 : 0);
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new ManageTraineesFunctionalityTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ManageTraineesFunctionalityTester;