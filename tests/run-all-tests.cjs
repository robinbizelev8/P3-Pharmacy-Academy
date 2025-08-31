#!/usr/bin/env node

/**
 * Master Test Runner for Supervisor Dashboard Implementation
 * 
 * This script coordinates all test agents and provides a comprehensive
 * validation of the supervisor dashboard functionality including database,
 * authentication, API integration, UI components, and end-to-end workflows.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class MasterTestRunner {
  constructor() {
    this.startTime = Date.now();
    this.testAgents = [
      {
        name: 'Database Test Agent',
        file: 'database-test-agent.cjs',
        description: 'Validates database schema, storage methods, and data integrity',
        critical: true
      },
      {
        name: 'Authentication Test Agent', 
        file: 'auth-test-agent.cjs',
        description: 'Tests authentication, authorization, and security measures',
        critical: true
      },
      {
        name: 'API Integration Test Agent',
        file: 'api-integration-test-agent.cjs', 
        description: 'Validates API endpoints, request/response handling, and error management',
        critical: true
      },
      {
        name: 'UI Test Agent',
        file: 'ui-test-agent.cjs',
        description: 'Tests user interface components, responsiveness, and accessibility',
        critical: false
      },
      {
        name: 'End-to-End Test Agent',
        file: 'e2e-test-agent.cjs',
        description: 'Validates complete user workflows and system integration',
        critical: true
      }
    ];
    this.results = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m',   // Red
      warn: '\x1b[33m',    // Yellow
      header: '\x1b[35m',  // Magenta
      reset: '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async runTestAgent(agent) {
    return new Promise((resolve, reject) => {
      const agentPath = path.join(__dirname, agent.file);
      
      if (!fs.existsSync(agentPath)) {
        reject(new Error(`Test agent file not found: ${agent.file}`));
        return;
      }

      this.log(`\n${'='.repeat(80)}`, 'header');
      this.log(`🤖 Running: ${agent.name}`, 'header');
      this.log(`📋 Description: ${agent.description}`, 'info');
      this.log(`🔑 Critical: ${agent.critical ? 'Yes' : 'No'}`, 'info');
      this.log(`${'='.repeat(80)}`, 'header');

      const startTime = Date.now();
      const child = spawn('node', [agentPath], {
        stdio: 'pipe',
        cwd: path.dirname(process.cwd()) // Go up one level to project root
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        // Stream output in real-time
        process.stdout.write(output);
      });

      child.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        process.stderr.write(output);
      });

      child.on('close', (code) => {
        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);

        const result = {
          agent: agent.name,
          file: agent.file,
          description: agent.description,
          critical: agent.critical,
          exitCode: code,
          duration,
          passed: code === 0,
          stdout,
          stderr
        };

        this.results.push(result);

        if (code === 0) {
          this.log(`\n✅ ${agent.name} completed successfully in ${duration}s`, 'success');
          resolve(result);
        } else {
          this.log(`\n❌ ${agent.name} failed with exit code ${code} after ${duration}s`, 'error');
          if (agent.critical) {
            reject(new Error(`Critical test agent failed: ${agent.name}`));
          } else {
            this.log(`⚠️  Non-critical test failed, continuing...`, 'warn');
            resolve(result);
          }
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to start test agent ${agent.name}: ${error.message}`));
      });
    });
  }

  async checkPrerequisites() {
    this.log('🔍 Checking prerequisites...', 'info');

    // Check if we're in the right directory
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found. Please run from project root directory.');
    }

    // Check if required directories exist
    const requiredDirs = ['client', 'server', 'shared', 'tests'];
    for (const dir of requiredDirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        throw new Error(`Required directory not found: ${dir}`);
      }
    }

    // Check if test agents exist
    for (const agent of this.testAgents) {
      const agentPath = path.join(process.cwd(), 'tests', agent.file);
      if (!fs.existsSync(agentPath)) {
        throw new Error(`Test agent not found: ${agent.file}`);
      }
    }

    this.log('✅ All prerequisites met', 'success');
  }

  generateSummaryReport() {
    const endTime = Date.now();
    const totalDuration = Math.round((endTime - this.startTime) / 1000);

    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = this.results.filter(r => r.passed === false).length;
    const criticalFailures = this.results.filter(r => !r.passed && r.critical).length;

    this.log('\n' + '='.repeat(80), 'header');
    this.log('📊 SUPERVISOR DASHBOARD TEST SUITE SUMMARY', 'header');
    this.log('='.repeat(80), 'header');

    this.log(`\n📈 Overall Results:`, 'info');
    this.log(`   Total Test Agents: ${this.results.length}`, 'info');
    this.log(`   Passed: ${passedTests}`, passedTests === this.results.length ? 'success' : 'info');
    this.log(`   Failed: ${failedTests}`, failedTests > 0 ? 'error' : 'info');
    this.log(`   Critical Failures: ${criticalFailures}`, criticalFailures > 0 ? 'error' : 'success');
    this.log(`   Total Duration: ${totalDuration} seconds`, 'info');
    this.log(`   Success Rate: ${Math.round((passedTests / this.results.length) * 100)}%`, 'info');

    this.log(`\n📋 Detailed Results:`, 'info');
    this.results.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const critical = result.critical ? '[CRITICAL]' : '[NON-CRITICAL]';
      this.log(`   ${index + 1}. ${status} ${result.agent} ${critical} (${result.duration}s)`, 
        result.passed ? 'success' : 'error');
    });

    // Recommendations based on results
    this.log(`\n💡 Recommendations:`, 'info');
    if (criticalFailures > 0) {
      this.log('   🚨 Critical failures detected! Please fix these issues before deployment:', 'error');
      this.results.filter(r => !r.passed && r.critical).forEach(result => {
        this.log(`      - ${result.agent}: Review ${result.file} output above`, 'error');
      });
    } else if (failedTests > 0) {
      this.log('   ⚠️  Non-critical failures detected. Consider addressing these issues:', 'warn');
      this.results.filter(r => !r.passed && !r.critical).forEach(result => {
        this.log(`      - ${result.agent}: Review ${result.file} output above`, 'warn');
      });
    } else {
      this.log('   🎉 All tests passed! Supervisor dashboard is ready for deployment.', 'success');
      this.log('   📝 Consider running additional manual testing for edge cases.', 'info');
      this.log('   🔄 Set up continuous integration to run these tests automatically.', 'info');
    }

    // Generate JSON report
    const report = {
      timestamp: new Date().toISOString(),
      totalDuration,
      summary: {
        total: this.results.length,
        passed: passedTests,
        failed: failedTests,
        criticalFailures,
        successRate: Math.round((passedTests / this.results.length) * 100)
      },
      results: this.results
    };

    const reportPath = path.join(process.cwd(), 'tests', 'supervisor-dashboard-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`\n📄 Detailed JSON report saved to: ${reportPath}`, 'info');

    return criticalFailures === 0;
  }

  async run() {
    try {
      this.log('🚀 Starting Supervisor Dashboard Test Suite', 'header');
      this.log('🎯 Validating complete supervisor functionality implementation', 'info');
      
      await this.checkPrerequisites();

      this.log(`\n📋 Running ${this.testAgents.length} test agents...`, 'info');

      // Run all test agents sequentially to avoid resource conflicts
      for (const agent of this.testAgents) {
        try {
          await this.runTestAgent(agent);
        } catch (error) {
          this.log(`❌ Critical failure in ${agent.name}: ${error.message}`, 'error');
          // Continue with other tests even if one critical test fails
          // to get a complete picture of the system state
        }
      }

      const success = this.generateSummaryReport();

      if (success) {
        this.log('\n🎉 Test suite completed successfully!', 'success');
        this.log('✅ Supervisor dashboard implementation is ready for production.', 'success');
        process.exit(0);
      } else {
        this.log('\n⚠️  Test suite completed with critical failures.', 'error');
        this.log('🔧 Please address the issues above before deploying.', 'error');
        process.exit(1);
      }

    } catch (error) {
      this.log(`❌ Test suite failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run the master test suite if this file is executed directly
if (require.main === module) {
  const runner = new MasterTestRunner();
  runner.run().catch(error => {
    console.error('❌ Master Test Runner failed:', error);
    process.exit(1);
  });
}

module.exports = MasterTestRunner;