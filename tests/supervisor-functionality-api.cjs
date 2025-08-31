#!/usr/bin/env node

/**
 * Supervisor Functionality API Test Agent
 * 
 * Tests all three supervisor button functionalities:
 * 1. View Progress - GET /api/supervisor/trainee/:id/progress
 * 2. Send Feedback - POST /api/supervisor/feedback
 * 3. Assign Scenario - POST /api/supervisor/scenarios
 */

const { Pool } = require('@neondatabase/serverless');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

class SupervisorFunctionalityTester {
  constructor() {
    this.baseUrl = process.env.BASE_URL || 'http://localhost:5001';
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.testResults = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
    this.supervisorAuth = null;
    this.testTraineeId = null;
    this.testScenarioId = null;
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

  async setup() {
    this.log('Setting up test environment...');
    
    try {
      // Create test supervisor account if not exists
      await this.ensureTestSupervisor();
      
      // Login as supervisor
      await this.loginSupervisor();
      
      // Ensure test trainee exists
      await this.ensureTestTrainee();
      
      // Ensure test scenario exists
      await this.ensureTestScenario();
      
      this.log('Test environment setup complete', 'success');
    } catch (error) {
      this.log(`Setup failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async ensureTestSupervisor() {
    const supervisorEmail = 'test-supervisor@test.com';
    
    // Check if supervisor exists
    const checkQuery = 'SELECT id FROM users WHERE email = $1';
    const existing = await this.pool.query(checkQuery, [supervisorEmail]);
    
    if (existing.rows.length === 0) {
      // Create test supervisor
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
      
      const insertQuery = `
        INSERT INTO users (email, first_name, last_name, role, provider, hashed_password, email_verified, supervisor_certified, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id
      `;
      
      await this.pool.query(insertQuery, [
        supervisorEmail,
        'Test',
        'Supervisor',
        'supervisor',
        'email',
        hashedPassword,
        true,
        true
      ]);
      
      this.log('Created test supervisor account');
    }
  }

  async ensureTestTrainee() {
    const traineeEmail = 'test-trainee@test.com';
    
    // Check if trainee exists
    const checkQuery = 'SELECT id FROM users WHERE email = $1';
    const existing = await this.pool.query(checkQuery, [traineeEmail]);
    
    if (existing.rows.length === 0) {
      // Create test trainee
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
      
      const insertQuery = `
        INSERT INTO users (email, first_name, last_name, role, provider, hashed_password, email_verified, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id
      `;
      
      const result = await this.pool.query(insertQuery, [
        traineeEmail,
        'Test',
        'Trainee',
        'student',
        'email',
        hashedPassword,
        true
      ]);
      
      this.testTraineeId = result.rows[0].id;
      
      // Assign trainee to supervisor
      const supervisorResult = await this.pool.query('SELECT id FROM users WHERE email = $1', ['test-supervisor@test.com']);
      const supervisorId = supervisorResult.rows[0].id;
      
      await this.pool.query(`
        INSERT INTO trainee_assignments (supervisor_id, trainee_id, status, assigned_at, created_at, updated_at)
        VALUES ($1, $2, 'active', NOW(), NOW(), NOW())
      `, [supervisorId, this.testTraineeId]);
      
      this.log('Created test trainee and assignment');
    } else {
      this.testTraineeId = existing.rows[0].id;
    }
  }

  async ensureTestScenario() {
    // Check if test scenario exists
    const checkQuery = 'SELECT id FROM pharmacy_scenarios WHERE title LIKE $1 LIMIT 1';
    const existing = await this.pool.query(checkQuery, ['%Test%']);
    
    if (existing.rows.length > 0) {
      this.testScenarioId = existing.rows[0].id;
    } else {
      // Create test scenario
      const insertQuery = `
        INSERT INTO pharmacy_scenarios (title, description, module, therapeutic_area, difficulty, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id
      `;
      
      const result = await this.pool.query(insertQuery, [
        'Test Scenario for API Testing',
        'A test scenario used for automated API testing',
        'practice',
        'cardiovascular',
        'beginner'
      ]);
      
      this.testScenarioId = result.rows[0].id;
      this.log('Created test scenario');
    }
  }

  async loginSupervisor() {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test-supervisor@test.com',
        password: 'TestPassword123!'
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    // Extract auth cookie
    const cookies = response.headers.get('set-cookie');
    if (cookies) {
      this.supervisorAuth = cookies.split(';')[0];
    }

    this.log('Logged in as supervisor');
  }

  async runTest(name, testFunction) {
    this.totalTests++;
    this.log(`Running test: ${name}`);
    
    const startTime = Date.now();
    let result = { name, status: 'failed', error: null, duration: 0, details: {} };
    
    try {
      const testResult = await testFunction();
      result = {
        name,
        status: 'passed',
        error: null,
        duration: Date.now() - startTime,
        details: testResult || {}
      };
      this.passed++;
      this.log(`✅ ${name} - PASSED`, 'success');
    } catch (error) {
      result = {
        name,
        status: 'failed',
        error: error.message,
        duration: Date.now() - startTime,
        details: {}
      };
      this.failed++;
      this.log(`❌ ${name} - FAILED: ${error.message}`, 'error');
    }
    
    this.testResults.tests.push(result);
    return result;
  }

  // Test 1: View Progress API
  async testViewProgress() {
    return this.runTest('View Trainee Progress API', async () => {
      const response = await fetch(`${this.baseUrl}/api/supervisor/trainee/${this.testTraineeId}/progress`, {
        headers: {
          'Cookie': this.supervisorAuth,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data.trainee) {
        throw new Error('Response missing trainee information');
      }
      
      if (!data.modules) {
        throw new Error('Response missing modules data');
      }
      
      if (!data.competencyProgression) {
        throw new Error('Response missing competency progression');
      }
      
      if (typeof data.totalSessionsCompleted !== 'number') {
        throw new Error('Response missing or invalid totalSessionsCompleted');
      }
      
      if (typeof data.averageScore !== 'number') {
        throw new Error('Response missing or invalid averageScore');
      }

      return {
        traineeId: data.trainee.id,
        totalSessions: data.totalSessionsCompleted,
        averageScore: data.averageScore,
        modules: Object.keys(data.modules),
        competencies: Object.keys(data.competencyProgression)
      };
    });
  }

  // Test 2: Send Feedback API
  async testSendFeedback() {
    return this.runTest('Send Supervisor Feedback API', async () => {
      const feedbackData = {
        traineeId: this.testTraineeId,
        feedbackType: 'general_review',
        overallRating: 4,
        clinicalKnowledgeRating: 4,
        communicationRating: 3,
        professionalismRating: 5,
        writtenFeedback: 'Test feedback for API testing',
        strengths: ['Good clinical reasoning', 'Excellent communication'],
        improvementAreas: ['Time management', 'Documentation'],
        recommendations: 'Continue practicing complex cases',
        actionItems: ['Review cardiovascular protocols', 'Practice patient counseling'],
        nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
      };

      const response = await fetch(`${this.baseUrl}/api/supervisor/feedback`, {
        method: 'POST',
        headers: {
          'Cookie': this.supervisorAuth,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API returned ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      
      // Validate response
      if (!result.id) {
        throw new Error('Response missing feedback ID');
      }
      
      // Verify feedback was stored in database
      const dbCheck = await this.pool.query(
        'SELECT * FROM supervisor_feedback WHERE id = $1',
        [result.id]
      );
      
      if (dbCheck.rows.length === 0) {
        throw new Error('Feedback not found in database');
      }
      
      const storedFeedback = dbCheck.rows[0];
      
      if (storedFeedback.trainee_id !== this.testTraineeId) {
        throw new Error('Stored feedback has incorrect trainee ID');
      }
      
      if (parseFloat(storedFeedback.overall_rating) !== feedbackData.overallRating) {
        throw new Error('Stored feedback has incorrect overall rating');
      }

      return {
        feedbackId: result.id,
        storedData: {
          overallRating: parseFloat(storedFeedback.overall_rating),
          writtenFeedback: storedFeedback.written_feedback,
          strengths: storedFeedback.strengths,
          improvementAreas: storedFeedback.improvement_areas
        }
      };
    });
  }

  // Test 3: Assign Scenario API
  async testAssignScenario() {
    return this.runTest('Assign Scenario to Trainee API', async () => {
      const assignmentData = {
        scenarioId: this.testScenarioId,
        targetTraineeId: this.testTraineeId,
        assignmentInstructions: 'Complete this scenario for API testing purposes',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        priorityLevel: 'medium',
        learningObjectives: ['Practice clinical reasoning', 'Improve medication counseling'],
        assessmentCriteria: 'Focus on accuracy and communication skills',
        completionRequired: true
      };

      const response = await fetch(`${this.baseUrl}/api/supervisor/scenarios`, {
        method: 'POST',
        headers: {
          'Cookie': this.supervisorAuth,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API returned ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      
      // Validate response
      if (!result.id) {
        throw new Error('Response missing assignment ID');
      }
      
      // Verify assignment was stored in database
      const dbCheck = await this.pool.query(
        'SELECT * FROM supervisor_scenarios WHERE id = $1',
        [result.id]
      );
      
      if (dbCheck.rows.length === 0) {
        throw new Error('Scenario assignment not found in database');
      }
      
      const storedAssignment = dbCheck.rows[0];
      
      if (storedAssignment.target_trainee_id !== this.testTraineeId) {
        throw new Error('Stored assignment has incorrect trainee ID');
      }
      
      if (storedAssignment.scenario_id !== this.testScenarioId) {
        throw new Error('Stored assignment has incorrect scenario ID');
      }
      
      if (storedAssignment.priority_level !== assignmentData.priorityLevel) {
        throw new Error('Stored assignment has incorrect priority level');
      }

      return {
        assignmentId: result.id,
        storedData: {
          scenarioId: storedAssignment.scenario_id,
          traineeId: storedAssignment.target_trainee_id,
          priorityLevel: storedAssignment.priority_level,
          dueDate: storedAssignment.due_date,
          learningObjectives: storedAssignment.learning_objectives
        }
      };
    });
  }

  // Integration test: Full workflow
  async testFullWorkflow() {
    return this.runTest('Full Supervisor Workflow Integration', async () => {
      // 1. Get initial progress
      const initialProgress = await fetch(`${this.baseUrl}/api/supervisor/trainee/${this.testTraineeId}/progress`, {
        headers: { 'Cookie': this.supervisorAuth }
      });
      
      if (!initialProgress.ok) {
        throw new Error('Failed to get initial progress');
      }
      
      const progressData = await initialProgress.json();
      
      // 2. Submit feedback
      const feedbackResponse = await fetch(`${this.baseUrl}/api/supervisor/feedback`, {
        method: 'POST',
        headers: {
          'Cookie': this.supervisorAuth,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          traineeId: this.testTraineeId,
          feedbackType: 'progress_check',
          overallRating: 4,
          clinicalKnowledgeRating: 4,
          communicationRating: 4,
          professionalismRating: 4,
          writtenFeedback: 'Integration test feedback',
          strengths: ['Integration testing'],
          improvementAreas: ['None for test'],
          recommendations: 'Continue testing'
        })
      });
      
      if (!feedbackResponse.ok) {
        throw new Error('Failed to submit feedback in workflow');
      }
      
      const feedbackResult = await feedbackResponse.json();
      
      // 3. Assign scenario
      const scenarioResponse = await fetch(`${this.baseUrl}/api/supervisor/scenarios`, {
        method: 'POST',
        headers: {
          'Cookie': this.supervisorAuth,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scenarioId: this.testScenarioId,
          targetTraineeId: this.testTraineeId,
          assignmentInstructions: 'Integration test scenario',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priorityLevel: 'high',
          learningObjectives: ['Integration testing'],
          completionRequired: true
        })
      });
      
      if (!scenarioResponse.ok) {
        throw new Error('Failed to assign scenario in workflow');
      }
      
      const scenarioResult = await scenarioResponse.json();
      
      // 4. Verify all operations completed
      return {
        progressCheck: { traineeId: progressData.trainee.id },
        feedbackSubmitted: { id: feedbackResult.id },
        scenarioAssigned: { id: scenarioResult.id },
        workflowComplete: true
      };
    });
  }

  async runAllTests() {
    this.log('🚀 Starting Supervisor Functionality API Tests');
    this.log('================================================');
    
    try {
      await this.setup();
      
      // Run individual functionality tests
      await this.testViewProgress();
      await this.testSendFeedback();
      await this.testAssignScenario();
      
      // Run integration test
      await this.testFullWorkflow();
      
    } catch (error) {
      this.log(`Test execution failed: ${error.message}`, 'error');
    }
    
    await this.generateReport();
  }

  async generateReport() {
    this.testResults.totalTests = this.totalTests;
    this.testResults.passed = this.passed;
    this.testResults.failed = this.failed;
    
    this.log('================================================');
    this.log('📊 TEST RESULTS SUMMARY');
    this.log('================================================');
    this.log(`Total Tests: ${this.totalTests}`);
    this.log(`Passed: ${this.passed}`, this.passed > 0 ? 'success' : 'info');
    this.log(`Failed: ${this.failed}`, this.failed > 0 ? 'error' : 'info');
    this.log(`Success Rate: ${((this.passed / this.totalTests) * 100).toFixed(1)}%`);
    
    if (this.failed > 0) {
      this.log('\n❌ FAILED TESTS:', 'error');
      this.testResults.tests
        .filter(test => test.status === 'failed')
        .forEach(test => {
          this.log(`  • ${test.name}: ${test.error}`, 'error');
        });
    }
    
    // Save detailed results
    const fs = require('fs');
    const reportPath = './tests/supervisor-functionality-api-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    this.log(`\n📋 Detailed report saved to: ${reportPath}`);
    
    // Close database connection
    await this.pool.end();
    
    // Exit with appropriate code
    process.exit(this.failed > 0 ? 1 : 0);
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new SupervisorFunctionalityTester();
  tester.runAllTests().catch(console.error);
}

module.exports = SupervisorFunctionalityTester;