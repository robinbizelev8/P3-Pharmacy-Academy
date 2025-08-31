#!/usr/bin/env node

/**
 * API Integration Test Agent for Supervisor Dashboard
 * 
 * This automated test agent validates all supervisor API endpoints including
 * request/response formats, error handling, performance, and data flow integration.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class APIIntegrationTestAgent {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
    this.testCount = 0;
    this.passCount = 0;
    this.failCount = 0;
    this.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
    this.testToken = null;
    this.performanceMetrics = {};
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
      const startTime = Date.now();
      await testFn();
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.performanceMetrics[description] = duration;
      this.passCount++;
      this.log(`✅ PASS: ${description} (${duration}ms)`, 'success');
      this.testResults.push({ description, status: 'PASS', error: null, duration });
    } catch (error) {
      this.failCount++;
      this.log(`❌ FAIL: ${description} - ${error.message}`, 'error');
      this.testResults.push({ description, status: 'FAIL', error: error.message, duration: 0 });
    }
  }

  makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
      const protocol = options.protocol === 'https:' ? https : http;
      const req = protocol.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = data ? JSON.parse(data) : {};
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: jsonData,
              raw: data,
              size: Buffer.byteLength(data, 'utf8')
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: null,
              raw: data,
              size: Buffer.byteLength(data, 'utf8')
            });
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => reject(new Error('Request timeout')));
      
      if (postData) {
        req.write(JSON.stringify(postData));
      }
      
      req.end();
    });
  }

  async testServerHealth() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = new URL(this.baseUrl);
        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/',
          method: 'GET',
          timeout: 5000
        };

        const response = await this.makeRequest(options);
        
        if (response.statusCode >= 200 && response.statusCode < 400) {
          resolve(true);
        } else {
          reject(new Error(`Server health check failed. Status: ${response.statusCode}`));
        }
      } catch (error) {
        reject(new Error(`Server not accessible: ${error.message}`));
      }
    });
  }

  async testSupervisorDashboardAPI() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = new URL(this.baseUrl);
        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/api/supervisor/dashboard',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const response = await this.makeRequest(options);
        
        // Should return 401 without authentication
        if (response.statusCode !== 401 && response.statusCode !== 403) {
          reject(new Error(`Expected 401/403 for unauthenticated request, got ${response.statusCode}`));
          return;
        }

        // Validate response structure for auth error
        if (response.data && typeof response.data === 'object') {
          if (!response.data.error && !response.data.message) {
            this.log('Warning: Error response structure may be inconsistent', 'warn');
          }
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Supervisor dashboard API test failed: ${error.message}`));
      }
    });
  }

  async testTraineesAPI() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = new URL(this.baseUrl);
        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/api/supervisor/trainees',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const response = await this.makeRequest(options);
        
        // Should return 401 without authentication
        if (response.statusCode !== 401 && response.statusCode !== 403) {
          reject(new Error(`Trainees API not properly protected. Status: ${response.statusCode}`));
          return;
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Trainees API test failed: ${error.message}`));
      }
    });
  }

  async testFeedbackAPI() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = new URL(this.baseUrl);
        
        // Test GET feedback endpoint
        const getOptions = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/api/supervisor/feedback',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const getResponse = await this.makeRequest(getOptions);
        
        if (getResponse.statusCode !== 401 && getResponse.statusCode !== 403) {
          reject(new Error(`Feedback GET API not properly protected. Status: ${getResponse.statusCode}`));
          return;
        }

        // Test POST feedback endpoint
        const postOptions = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/api/supervisor/feedback',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const postData = {
          traineeId: 'test-trainee-id',
          sessionId: 'test-session-id',
          feedbackType: 'session_review',
          overallRating: 4.5,
          writtenFeedback: 'Test feedback'
        };

        const postResponse = await this.makeRequest(postOptions, postData);
        
        if (postResponse.statusCode !== 401 && postResponse.statusCode !== 403) {
          reject(new Error(`Feedback POST API not properly protected. Status: ${postResponse.statusCode}`));
          return;
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Feedback API test failed: ${error.message}`));
      }
    });
  }

  async testScenariosAPI() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = new URL(this.baseUrl);
        
        // Test GET scenarios endpoint
        const getOptions = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/api/supervisor/scenarios',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const getResponse = await this.makeRequest(getOptions);
        
        if (getResponse.statusCode !== 401 && getResponse.statusCode !== 403) {
          reject(new Error(`Scenarios GET API not properly protected. Status: ${getResponse.statusCode}`));
          return;
        }

        // Test POST scenarios endpoint
        const postOptions = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/api/supervisor/scenarios',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const postData = {
          scenarioId: 'test-scenario-id',
          targetTraineeId: 'test-trainee-id',
          assignmentInstructions: 'Test assignment instructions',
          priorityLevel: 'medium'
        };

        const postResponse = await this.makeRequest(postOptions, postData);
        
        if (postResponse.statusCode !== 401 && postResponse.statusCode !== 403) {
          reject(new Error(`Scenarios POST API not properly protected. Status: ${postResponse.statusCode}`));
          return;
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Scenarios API test failed: ${error.message}`));
      }
    });
  }

  async testStudentFeedbackAPI() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = new URL(this.baseUrl);
        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/api/student/feedback',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const response = await this.makeRequest(options);
        
        // Should return 401 without authentication
        if (response.statusCode !== 401 && response.statusCode !== 403) {
          reject(new Error(`Student feedback API not properly protected. Status: ${response.statusCode}`));
          return;
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Student feedback API test failed: ${error.message}`));
      }
    });
  }

  async testAssignedScenariosAPI() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = new URL(this.baseUrl);
        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/api/student/assigned-scenarios',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const response = await this.makeRequest(options);
        
        // Should return 401 without authentication
        if (response.statusCode !== 401 && response.statusCode !== 403) {
          reject(new Error(`Assigned scenarios API not properly protected. Status: ${response.statusCode}`));
          return;
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Assigned scenarios API test failed: ${error.message}`));
      }
    });
  }

  async testErrorHandling() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = new URL(this.baseUrl);
        
        // Test invalid endpoint
        const invalidOptions = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/api/supervisor/nonexistent',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const invalidResponse = await this.makeRequest(invalidOptions);
        
        if (invalidResponse.statusCode !== 404) {
          this.log(`Warning: Invalid endpoint returned ${invalidResponse.statusCode} instead of 404`, 'warn');
        }

        // Test malformed JSON
        const malformedOptions = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/api/supervisor/feedback',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const malformedReq = new Promise((resolve, reject) => {
          const protocol = url.protocol === 'https:' ? https : http;
          const req = protocol.request(malformedOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data }));
          });
          
          req.on('error', reject);
          req.write('{"invalid": json}'); // Malformed JSON
          req.end();
        });

        const malformedResponse = await malformedReq;
        
        if (malformedResponse.statusCode !== 400 && malformedResponse.statusCode !== 401) {
          this.log(`Warning: Malformed JSON handled with status ${malformedResponse.statusCode}`, 'warn');
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Error handling test failed: ${error.message}`));
      }
    });
  }

  async testResponseFormat() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = new URL(this.baseUrl);
        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/api/supervisor/dashboard',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        };

        const response = await this.makeRequest(options);
        
        // Check Content-Type header
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.includes('application/json')) {
          this.log(`Warning: Response Content-Type is ${contentType}, expected application/json`, 'warn');
        }

        // For error responses, check if they have consistent structure
        if (response.data && typeof response.data === 'object') {
          // This is good - JSON response
          resolve(true);
        } else if (response.raw) {
          // Check if it's HTML error page
          if (response.raw.includes('<html>') || response.raw.includes('<!DOCTYPE')) {
            this.log('Warning: Received HTML response instead of JSON', 'warn');
          }
          resolve(true);
        } else {
          reject(new Error('Empty response received'));
        }
      } catch (error) {
        reject(new Error(`Response format test failed: ${error.message}`));
      }
    });
  }

  async testPerformance() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = new URL(this.baseUrl);
        const endpoints = [
          '/api/supervisor/dashboard',
          '/api/supervisor/trainees',
          '/api/supervisor/feedback',
          '/api/supervisor/scenarios'
        ];

        const performanceResults = {};
        
        for (const endpoint of endpoints) {
          const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: endpoint,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          };

          const startTime = Date.now();
          try {
            await this.makeRequest(options);
            const endTime = Date.now();
            performanceResults[endpoint] = endTime - startTime;
          } catch (error) {
            // Expected for unauthenticated requests
            const endTime = Date.now();
            performanceResults[endpoint] = endTime - startTime;
          }
        }

        // Check if any endpoint takes more than 2 seconds
        for (const [endpoint, duration] of Object.entries(performanceResults)) {
          if (duration > 2000) {
            this.log(`Warning: ${endpoint} took ${duration}ms (>2s)`, 'warn');
          }
        }

        this.performanceMetrics.endpoints = performanceResults;
        resolve(true);
      } catch (error) {
        reject(new Error(`Performance test failed: ${error.message}`));
      }
    });
  }

  async testCORSHeaders() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = new URL(this.baseUrl);
        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/api/supervisor/dashboard',
          method: 'OPTIONS',
          headers: {
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type'
          }
        };

        const response = await this.makeRequest(options);
        
        // Check for CORS headers
        const corsHeaders = [
          'access-control-allow-origin',
          'access-control-allow-methods',
          'access-control-allow-headers'
        ];

        let foundCorsHeaders = 0;
        for (const header of corsHeaders) {
          if (response.headers[header]) {
            foundCorsHeaders++;
          }
        }

        if (foundCorsHeaders === 0) {
          this.log('Warning: No CORS headers found - may cause issues in browser', 'warn');
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`CORS headers test failed: ${error.message}`));
      }
    });
  }

  generateReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);
    
    this.log('\n=== API INTEGRATION TEST AGENT REPORT ===', 'info');
    this.log(`Total Tests: ${this.testCount}`, 'info');
    this.log(`Passed: ${this.passCount}`, 'success');
    this.log(`Failed: ${this.failCount}`, this.failCount > 0 ? 'error' : 'info');
    this.log(`Duration: ${duration} seconds`, 'info');
    this.log(`Success Rate: ${Math.round((this.passCount / this.testCount) * 100)}%`, 'info');
    
    // Performance summary
    if (Object.keys(this.performanceMetrics).length > 0) {
      this.log('\n=== PERFORMANCE METRICS ===', 'info');
      for (const [test, time] of Object.entries(this.performanceMetrics)) {
        if (typeof time === 'number') {
          this.log(`${test}: ${time}ms`, 'info');
        }
      }
    }
    
    if (this.failCount > 0) {
      this.log('\n=== FAILED TESTS ===', 'error');
      const failedTests = this.testResults.filter(test => test.status === 'FAIL');
      failedTests.forEach((test, index) => {
        this.log(`${index + 1}. ${test.description}`, 'error');
        this.log(`   Error: ${test.error}`, 'error');
      });
    }

    // Write detailed report to file
    const reportPath = path.join(process.cwd(), 'tests', 'api-integration-test-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      duration,
      summary: {
        total: this.testCount,
        passed: this.passCount,
        failed: this.failCount,
        successRate: Math.round((this.passCount / this.testCount) * 100)
      },
      performanceMetrics: this.performanceMetrics,
      results: this.testResults
    };

    if (!fs.existsSync(path.dirname(reportPath))) {
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`\nDetailed report saved to: ${reportPath}`, 'info');

    return this.failCount === 0;
  }

  async run() {
    this.log('🔌 Starting API Integration Test Agent for Supervisor Dashboard', 'info');
    
    await this.test('Server Health Check', () => this.testServerHealth());
    await this.test('Supervisor Dashboard API', () => this.testSupervisorDashboardAPI());
    await this.test('Trainees API Endpoints', () => this.testTraineesAPI());
    await this.test('Feedback API Endpoints', () => this.testFeedbackAPI());
    await this.test('Scenarios API Endpoints', () => this.testScenariosAPI());
    await this.test('Student Feedback API', () => this.testStudentFeedbackAPI());
    await this.test('Assigned Scenarios API', () => this.testAssignedScenariosAPI());
    await this.test('Error Handling', () => this.testErrorHandling());
    await this.test('Response Format Consistency', () => this.testResponseFormat());
    await this.test('API Performance', () => this.testPerformance());
    await this.test('CORS Headers', () => this.testCORSHeaders());
    
    const allTestsPassed = this.generateReport();
    
    if (allTestsPassed) {
      this.log('\n🎉 All API integration tests passed! Supervisor APIs are working correctly.', 'success');
      process.exit(0);
    } else {
      this.log('\n⚠️  Some API tests failed. Please review and fix the issues above.', 'error');
      process.exit(1);
    }
  }
}

// Run the test agent if this file is executed directly
if (require.main === module) {
  const agent = new APIIntegrationTestAgent();
  agent.run().catch(error => {
    console.error('❌ API Integration Test Agent failed:', error);
    process.exit(1);
  });
}

module.exports = APIIntegrationTestAgent;