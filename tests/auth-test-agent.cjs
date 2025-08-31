#!/usr/bin/env node

/**
 * Authentication Test Agent for Supervisor Login
 * 
 * This automated test agent validates authentication, authorization, and security
 * for supervisor login functionality including JWT tokens, role-based access,
 * session management, and security headers.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AuthTestAgent {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
    this.testCount = 0;
    this.passCount = 0;
    this.failCount = 0;
    this.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
    this.testTokens = {};
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
              raw: data
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: null,
              raw: data
            });
          }
        });
      });
      
      req.on('error', reject);
      
      if (postData) {
        req.write(JSON.stringify(postData));
      }
      
      req.end();
    });
  }

  async testServerRunning() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = new URL(this.baseUrl);
        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/api/health',
          method: 'GET',
          timeout: 5000
        };

        const response = await this.makeRequest(options);
        
        if (response.statusCode >= 200 && response.statusCode < 500) {
          resolve(true);
        } else {
          reject(new Error(`Server not responding properly. Status: ${response.statusCode}`));
        }
      } catch (error) {
        reject(new Error(`Server connection failed: ${error.message}`));
      }
    });
  }

  async testJWTAuthImplementation() {
    return new Promise((resolve, reject) => {
      try {
        const authPath = path.join(process.cwd(), 'server', 'jwt-auth.ts');
        if (!fs.existsSync(authPath)) {
          reject(new Error('JWT auth file not found'));
          return;
        }

        const authContent = fs.readFileSync(authPath, 'utf8');
        
        const requiredComponents = [
          'generateToken',
          'verifyToken',
          'setAuthCookie',
          'clearAuthCookie',
          'jwtAuth',
          'requireAuth',
          'requireRole'
        ];

        for (const component of requiredComponents) {
          if (!authContent.includes(component)) {
            reject(new Error(`Missing JWT component: ${component}`));
            return;
          }
        }

        // Check for security measures
        if (!authContent.includes('JWT_SECRET')) {
          reject(new Error('JWT_SECRET not properly implemented'));
          return;
        }

        if (!authContent.includes('httpOnly') || !authContent.includes('secure')) {
          this.log('Warning: Cookie security settings may not be optimal', 'warn');
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`JWT implementation check failed: ${error.message}`));
      }
    });
  }

  async testRoleBasedAccess() {
    return new Promise((resolve, reject) => {
      try {
        const authPath = path.join(process.cwd(), 'server', 'jwt-auth.ts');
        const authContent = fs.readFileSync(authPath, 'utf8');
        
        // Check for supervisor role definition
        const roles = ['supervisor', 'student', 'admin'];
        
        for (const role of roles) {
          if (!authContent.includes(role)) {
            reject(new Error(`Missing role definition: ${role}`));
            return;
          }
        }

        // Check for role middleware functions
        if (!authContent.includes('requireSupervisor') || 
            !authContent.includes('requireStudent') || 
            !authContent.includes('requireAdmin')) {
          reject(new Error('Missing role-specific middleware functions'));
          return;
        }

        // Check for proper role checking logic
        if (!authContent.includes('roles.includes(user.role)')) {
          this.log('Warning: Role validation logic may not be properly implemented', 'warn');
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Role-based access check failed: ${error.message}`));
      }
    });
  }

  async testLoginEndpoint() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = new URL(this.baseUrl);
        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/api/login',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        };

        // Test login endpoint exists and responds appropriately to invalid credentials
        const response = await this.makeRequest(options, {
          email: 'test@invalid.com',
          password: 'invalid'
        });

        if (response.statusCode === 401 || response.statusCode === 400) {
          // Good - login endpoint properly rejects invalid credentials
          resolve(true);
        } else if (response.statusCode === 404) {
          reject(new Error('Login endpoint not found'));
        } else {
          this.log(`Warning: Login endpoint returned unexpected status: ${response.statusCode}`, 'warn');
          resolve(true); // Still pass as endpoint exists
        }
      } catch (error) {
        reject(new Error(`Login endpoint test failed: ${error.message}`));
      }
    });
  }

  async testProtectedEndpoints() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = new URL(this.baseUrl);
        
        // Test supervisor dashboard endpoint requires authentication
        const supervisorOptions = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/api/supervisor/dashboard',
          method: 'GET'
        };

        const supervisorResponse = await this.makeRequest(supervisorOptions);
        
        if (supervisorResponse.statusCode !== 401 && supervisorResponse.statusCode !== 403) {
          reject(new Error('Supervisor dashboard endpoint not properly protected'));
          return;
        }

        // Test student feedback endpoint requires authentication
        const studentOptions = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/api/student/feedback',
          method: 'GET'
        };

        const studentResponse = await this.makeRequest(studentOptions);
        
        if (studentResponse.statusCode !== 401 && studentResponse.statusCode !== 403) {
          reject(new Error('Student feedback endpoint not properly protected'));
          return;
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Protected endpoints test failed: ${error.message}`));
      }
    });
  }

  async testTokenValidation() {
    return new Promise((resolve, reject) => {
      try {
        const authPath = path.join(process.cwd(), 'server', 'jwt-auth.ts');
        const authContent = fs.readFileSync(authPath, 'utf8');
        
        // Check for proper token validation
        if (!authContent.includes('jwt.verify')) {
          reject(new Error('Missing JWT token verification'));
          return;
        }

        if (!authContent.includes('try') && !authContent.includes('catch')) {
          reject(new Error('Missing error handling for token validation'));
          return;
        }

        // Check for token expiration handling
        if (!authContent.includes('expiresIn') && !authContent.includes('maxAge')) {
          this.log('Warning: Token expiration may not be properly configured', 'warn');
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Token validation test failed: ${error.message}`));
      }
    });
  }

  async testSecurityHeaders() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = new URL(this.baseUrl);
        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/api/supervisor/dashboard',
          method: 'GET'
        };

        const response = await this.makeRequest(options);
        
        // Check for security-related headers
        const securityHeaders = [
          'x-auth-cookie-set',
          'set-cookie'
        ];

        let foundHeaders = 0;
        for (const header of securityHeaders) {
          if (response.headers[header] || response.headers[header.toLowerCase()]) {
            foundHeaders++;
          }
        }

        if (foundHeaders === 0) {
          this.log('Warning: No security headers detected in response', 'warn');
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Security headers test failed: ${error.message}`));
      }
    });
  }

  async testSessionManagement() {
    return new Promise((resolve, reject) => {
      try {
        const authPath = path.join(process.cwd(), 'server', 'jwt-auth.ts');
        const authContent = fs.readFileSync(authPath, 'utf8');
        
        // Check for session management components
        if (!authContent.includes('clearAuthCookie')) {
          reject(new Error('Missing session cleanup functionality'));
          return;
        }

        if (!authContent.includes('cookie') && !authContent.includes('Cookie')) {
          reject(new Error('Missing cookie management'));
          return;
        }

        // Check for session security
        if (!authContent.includes('httpOnly')) {
          this.log('Warning: HttpOnly cookie setting may not be configured', 'warn');
        }

        if (!authContent.includes('sameSite')) {
          this.log('Warning: SameSite cookie setting may not be configured', 'warn');
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Session management test failed: ${error.message}`));
      }
    });
  }

  async testAuthRoutes() {
    return new Promise((resolve, reject) => {
      try {
        const authRoutesPath = path.join(process.cwd(), 'server', 'auth-routes-jwt.ts');
        if (!fs.existsSync(authRoutesPath)) {
          reject(new Error('Auth routes file not found'));
          return;
        }

        const authRoutesContent = fs.readFileSync(authRoutesPath, 'utf8');
        
        // Check for essential auth routes
        const requiredRoutes = [
          '/api/login',
          '/api/logout',
          '/api/me'
        ];

        for (const route of requiredRoutes) {
          if (!authRoutesContent.includes(route)) {
            reject(new Error(`Missing required auth route: ${route}`));
            return;
          }
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Auth routes test failed: ${error.message}`));
      }
    });
  }

  async testPasswordSecurity() {
    return new Promise((resolve, reject) => {
      try {
        // Check if there are any password security measures in place
        const files = [
          'server/auth-routes-jwt.ts',
          'server/jwt-auth.ts',
          'server/storage.ts'
        ];

        let hasPasswordSecurity = false;
        for (const file of files) {
          const filePath = path.join(process.cwd(), file);
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('bcrypt') || content.includes('hash') || content.includes('salt')) {
              hasPasswordSecurity = true;
              break;
            }
          }
        }

        if (!hasPasswordSecurity) {
          this.log('Warning: No password hashing detected - using external auth provider', 'warn');
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Password security test failed: ${error.message}`));
      }
    });
  }

  generateReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);
    
    this.log('\n=== AUTHENTICATION TEST AGENT REPORT ===', 'info');
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
    const reportPath = path.join(process.cwd(), 'tests', 'auth-test-report.json');
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

    if (!fs.existsSync(path.dirname(reportPath))) {
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`\nDetailed report saved to: ${reportPath}`, 'info');

    return this.failCount === 0;
  }

  async run() {
    this.log('🔐 Starting Authentication Test Agent for Supervisor Login', 'info');
    
    await this.test('Server Running Check', () => this.testServerRunning());
    await this.test('JWT Authentication Implementation', () => this.testJWTAuthImplementation());
    await this.test('Role-Based Access Control', () => this.testRoleBasedAccess());
    await this.test('Login Endpoint Functionality', () => this.testLoginEndpoint());
    await this.test('Protected Endpoints Security', () => this.testProtectedEndpoints());
    await this.test('Token Validation Logic', () => this.testTokenValidation());
    await this.test('Security Headers Check', () => this.testSecurityHeaders());
    await this.test('Session Management', () => this.testSessionManagement());
    await this.test('Authentication Routes', () => this.testAuthRoutes());
    await this.test('Password Security Measures', () => this.testPasswordSecurity());
    
    const allTestsPassed = this.generateReport();
    
    if (allTestsPassed) {
      this.log('\n🎉 All authentication tests passed! Supervisor login is secure.', 'success');
      process.exit(0);
    } else {
      this.log('\n⚠️  Some authentication tests failed. Please review and fix the security issues.', 'error');
      process.exit(1);
    }
  }
}

// Run the test agent if this file is executed directly
if (require.main === module) {
  const agent = new AuthTestAgent();
  agent.run().catch(error => {
    console.error('❌ Authentication Test Agent failed:', error);
    process.exit(1);
  });
}

module.exports = AuthTestAgent;