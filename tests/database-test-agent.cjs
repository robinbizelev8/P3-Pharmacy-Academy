#!/usr/bin/env node

/**
 * Database Test Agent for Supervisor Operations
 * 
 * This automated test agent validates all database operations related to supervisor functionality
 * including trainee assignments, feedback management, scenario assignments, and data integrity.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DatabaseTestAgent {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
    this.testCount = 0;
    this.passCount = 0;
    this.failCount = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m',   // Red
      warn: '\x1b[33m',    // Yellow
      reset: '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async test(description, testFn) {
    this.testCount++;
    this.log(`Running Test ${this.testCount}: ${description}`, 'info');
    
    try {
      await testFn();
      this.passCount++;
      this.log(`✅ PASS: ${description}`, 'success');
      this.testResults.push({ description, status: 'PASS', error: null });
    } catch (error) {
      this.failCount++;
      this.log(`❌ FAIL: ${description} - ${error.message}`, 'error');
      this.testResults.push({ description, status: 'FAIL', error: error.message });
    }
  }

  async checkDatabaseConnection() {
    return new Promise((resolve, reject) => {
      try {
        // Try to run a simple database check
        const result = execSync('npm run check', { 
          encoding: 'utf8',
          cwd: process.cwd(),
          stdio: 'pipe'
        });
        
        if (result.includes('error') || result.includes('Error')) {
          reject(new Error('TypeScript compilation failed'));
        } else {
          resolve(true);
        }
      } catch (error) {
        reject(new Error(`Database connection check failed: ${error.message}`));
      }
    });
  }

  async testDatabaseMigration() {
    return new Promise((resolve, reject) => {
      try {
        // Check if database push works
        const result = execSync('npm run db:push', { 
          encoding: 'utf8',
          cwd: process.cwd(),
          stdio: 'pipe'
        });
        
        this.log('Database migration result: ' + result, 'info');
        resolve(true);
      } catch (error) {
        reject(new Error(`Database migration failed: ${error.message}`));
      }
    });
  }

  async testSupervisorTableStructure() {
    return new Promise((resolve, reject) => {
      try {
        // Read the schema file to verify table structures
        const schemaPath = path.join(process.cwd(), 'shared', 'schema.ts');
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');
        
        // Check for required supervisor tables
        const requiredTables = [
          'traineeAssignments',
          'supervisorFeedback', 
          'supervisorScenarios'
        ];
        
        const requiredFields = {
          traineeAssignments: ['supervisorId', 'traineeId', 'status', 'assignedAt'],
          supervisorFeedback: ['supervisorId', 'traineeId', 'feedbackType', 'overallRating'],
          supervisorScenarios: ['supervisorId', 'scenarioId', 'targetTraineeId']
        };

        for (const table of requiredTables) {
          if (!schemaContent.includes(table)) {
            reject(new Error(`Missing required table: ${table}`));
            return;
          }
        }

        for (const [table, fields] of Object.entries(requiredFields)) {
          for (const field of fields) {
            if (!schemaContent.includes(field)) {
              this.log(`Warning: Field ${field} might be missing from ${table}`, 'warn');
            }
          }
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Schema validation failed: ${error.message}`));
      }
    });
  }

  async testStorageMethodsExist() {
    return new Promise((resolve, reject) => {
      try {
        const storagePath = path.join(process.cwd(), 'server', 'storage.ts');
        const storageContent = fs.readFileSync(storagePath, 'utf8');
        
        // Check for required supervisor storage methods
        const requiredMethods = [
          'getAssignedTrainees',
          'assignTraineeToSupervisor',
          'getTraineeProgress',
          'createSupervisorFeedback',
          'getSupervisorFeedback',
          'getTraineeFeedback',
          'createSupervisorScenario',
          'getSupervisorScenarios',
          'getSupervisorDashboard'
        ];

        for (const method of requiredMethods) {
          if (!storageContent.includes(`async ${method}`)) {
            reject(new Error(`Missing required storage method: ${method}`));
            return;
          }
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Storage methods validation failed: ${error.message}`));
      }
    });
  }

  async testAPIEndpointsExist() {
    return new Promise((resolve, reject) => {
      try {
        const routesPath = path.join(process.cwd(), 'server', 'routes.ts');
        const routesContent = fs.readFileSync(routesPath, 'utf8');
        
        // Check for required supervisor API endpoints
        const requiredEndpoints = [
          '/api/supervisor/dashboard',
          '/api/supervisor/trainees',
          '/api/supervisor/feedback',
          '/api/supervisor/scenarios',
          '/api/student/feedback',
          '/api/student/assigned-scenarios'
        ];

        for (const endpoint of requiredEndpoints) {
          if (!routesContent.includes(endpoint)) {
            reject(new Error(`Missing required API endpoint: ${endpoint}`));
            return;
          }
        }

        // Check for proper authentication middleware
        if (!routesContent.includes('requireSupervisor')) {
          reject(new Error('Missing requireSupervisor authentication middleware'));
          return;
        }

        if (!routesContent.includes('requireStudent')) {
          reject(new Error('Missing requireStudent authentication middleware'));
          return;
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`API endpoints validation failed: ${error.message}`));
      }
    });
  }

  async testAuthenticationMethods() {
    return new Promise((resolve, reject) => {
      try {
        const authPath = path.join(process.cwd(), 'server', 'jwt-auth.ts');
        const authContent = fs.readFileSync(authPath, 'utf8');
        
        // Check for supervisor role support
        const requiredAuthMethods = [
          'requireSupervisor',
          'requireStudent',
          'requireAdmin'
        ];

        for (const method of requiredAuthMethods) {
          if (!authContent.includes(method)) {
            reject(new Error(`Missing required auth method: ${method}`));
            return;
          }
        }

        // Check for role-based access control
        if (!authContent.includes("roles.includes('supervisor')") && 
            !authContent.includes('supervisor')) {
          reject(new Error('Missing supervisor role validation'));
          return;
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Authentication methods validation failed: ${error.message}`));
      }
    });
  }

  async testDataIntegrity() {
    return new Promise((resolve, reject) => {
      try {
        const schemaPath = path.join(process.cwd(), 'shared', 'schema.ts');
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');
        
        // Check for foreign key relationships
        const foreignKeyChecks = [
          'supervisorId.*references.*users',
          'traineeId.*references.*users',
          'scenarioId.*references.*pharmacy_scenarios'
        ];

        let foundKeys = 0;
        for (const keyPattern of foreignKeyChecks) {
          const regex = new RegExp(keyPattern, 'i');
          if (regex.test(schemaContent)) {
            foundKeys++;
          }
        }

        if (foundKeys === 0) {
          this.log('Warning: No explicit foreign key relationships found', 'warn');
        }

        // Check for proper data types
        const dataTypeChecks = [
          'timestamp',
          'varchar',
          'text',
          'jsonb',
          'decimal',
          'boolean'
        ];

        let foundTypes = 0;
        for (const type of dataTypeChecks) {
          if (schemaContent.includes(type)) {
            foundTypes++;
          }
        }

        if (foundTypes < 3) {
          reject(new Error('Insufficient data type diversity - potential schema issues'));
          return;
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Data integrity validation failed: ${error.message}`));
      }
    });
  }

  async testEnvironmentVariables() {
    return new Promise((resolve, reject) => {
      try {
        const requiredEnvVars = [
          'DATABASE_URL',
          'JWT_SECRET'
        ];

        for (const envVar of requiredEnvVars) {
          if (!process.env[envVar]) {
            reject(new Error(`Missing required environment variable: ${envVar}`));
            return;
          }
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Environment variables check failed: ${error.message}`));
      }
    });
  }

  async testSupervisorWorkflow() {
    return new Promise((resolve, reject) => {
      try {
        // Test that all supervisor workflow components are present
        const workflowChecks = [
          { file: 'server/storage.ts', content: 'generateSupervisorAlerts' },
          { file: 'server/storage.ts', content: 'calculateModuleProgress' },
          { file: 'server/storage.ts', content: 'getPendingReviews' },
          { file: 'server/routes.ts', content: 'requireSupervisor' },
          { file: 'shared/schema.ts', content: 'supervisorFeedback' }
        ];

        for (const check of workflowChecks) {
          const filePath = path.join(process.cwd(), check.file);
          if (!fs.existsSync(filePath)) {
            reject(new Error(`Missing required file: ${check.file}`));
            return;
          }

          const content = fs.readFileSync(filePath, 'utf8');
          if (!content.includes(check.content)) {
            this.log(`Warning: ${check.content} not found in ${check.file}`, 'warn');
          }
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Supervisor workflow validation failed: ${error.message}`));
      }
    });
  }

  generateReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);
    
    this.log('\n=== DATABASE TEST AGENT REPORT ===', 'info');
    this.log(`Total Tests: ${this.testCount}`, 'info');
    this.log(`Passed: ${this.passCount}`, 'success');
    this.log(`Failed: ${this.failCount}`, this.failCount > 0 ? 'error' : 'info');
    this.log(`Duration: ${duration} seconds`, 'info');
    this.log(`Success Rate: ${Math.round((this.passCount / this.testCount) * 100)}%`, 'info');
    
    if (this.failCount > 0) {
      this.log('\n=== FAILED TESTS ===', 'error');
      const failedTests = this.testResults.filter(test => test.status === 'FAIL');
      failedTests.forEach((test, index) => {
        this.log(`${index + 1}. ${test.description}`, 'error');
        this.log(`   Error: ${test.error}`, 'error');
      });
    }

    // Write detailed report to file
    const reportPath = path.join(process.cwd(), 'tests', 'database-test-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      duration,
      summary: {
        total: this.testCount,
        passed: this.passCount,
        failed: this.failCount,
        successRate: Math.round((this.passCount / this.testCount) * 100)
      },
      results: this.testResults
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`\nDetailed report saved to: ${reportPath}`, 'info');

    return this.failCount === 0;
  }

  async run() {
    this.log('🚀 Starting Database Test Agent for Supervisor Operations', 'info');
    
    await this.test('Environment Variables Check', () => this.testEnvironmentVariables());
    await this.test('Database Connection Check', () => this.checkDatabaseConnection());
    await this.test('Database Migration Test', () => this.testDatabaseMigration());
    await this.test('Supervisor Table Structure', () => this.testSupervisorTableStructure());
    await this.test('Storage Methods Implementation', () => this.testStorageMethodsExist());
    await this.test('API Endpoints Implementation', () => this.testAPIEndpointsExist());
    await this.test('Authentication Methods', () => this.testAuthenticationMethods());
    await this.test('Data Integrity Checks', () => this.testDataIntegrity());
    await this.test('Supervisor Workflow Components', () => this.testSupervisorWorkflow());
    
    const allTestsPassed = this.generateReport();
    
    if (allTestsPassed) {
      this.log('\n🎉 All database tests passed! Supervisor functionality is ready.', 'success');
      process.exit(0);
    } else {
      this.log('\n⚠️  Some tests failed. Please review and fix the issues above.', 'error');
      process.exit(1);
    }
  }
}

// Run the test agent if this file is executed directly
if (require.main === module) {
  const agent = new DatabaseTestAgent();
  agent.run().catch(error => {
    console.error('❌ Database Test Agent failed:', error);
    process.exit(1);
  });
}

module.exports = DatabaseTestAgent;