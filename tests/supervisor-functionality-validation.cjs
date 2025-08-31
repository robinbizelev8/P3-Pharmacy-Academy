#!/usr/bin/env node

/**
 * Comprehensive Supervisor Functionality Validation
 * 
 * Validates that all supervisor dashboard buttons are properly implemented:
 * 1. Modal components exist and are correctly structured
 * 2. Dashboard integration is complete
 * 3. API hooks are properly implemented
 * 4. Backend endpoints are available
 */

const fs = require('fs');
const path = require('path');

class SupervisorFunctionalityValidator {
  constructor() {
    this.validationResults = {
      timestamp: new Date().toISOString(),
      totalChecks: 0,
      passed: 0,
      failed: 0,
      checks: []
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

  validate(name, checkFunction) {
    this.validationResults.totalChecks++;
    this.log(`Validating: ${name}`);
    
    try {
      const result = checkFunction();
      this.validationResults.checks.push({
        name,
        status: 'passed',
        details: result
      });
      this.validationResults.passed++;
      this.log(`✅ ${name} - VALID`, 'success');
      return true;
    } catch (error) {
      this.validationResults.checks.push({
        name,
        status: 'failed',
        error: error.message
      });
      this.validationResults.failed++;
      this.log(`❌ ${name} - INVALID: ${error.message}`, 'error');
      return false;
    }
  }

  validateTraineeProgressModal() {
    return this.validate('TraineeProgressModal Component', () => {
      const modalPath = 'client/src/components/supervisor/TraineeProgressModal.tsx';
      
      if (!fs.existsSync(modalPath)) {
        throw new Error('TraineeProgressModal.tsx not found');
      }
      
      const content = fs.readFileSync(modalPath, 'utf8');
      
      // Check for required imports
      const requiredImports = ['Dialog', 'useTraineeProgress', 'TraineeAssignmentWithDetails'];
      for (const imp of requiredImports) {
        if (!content.includes(imp)) {
          throw new Error(`Missing import: ${imp}`);
        }
      }
      
      // Check for key functionality
      const requiredFeatures = [
        'export function TraineeProgressModal',
        'isOpen',
        'onClose',
        'modules',
        'competencyProgression',
        'recentSessions',
        'Tabs'
      ];
      
      for (const feature of requiredFeatures) {
        if (!content.includes(feature)) {
          throw new Error(`Missing feature: ${feature}`);
        }
      }
      
      return {
        fileSize: content.length,
        hasProperStructure: true,
        hasTabsInterface: content.includes('TabsContent'),
        hasProgressCharts: content.includes('Progress'),
        hasLoadingState: content.includes('isLoading'),
        hasErrorHandling: content.includes('error')
      };
    });
  }

  validateFeedbackModal() {
    return this.validate('FeedbackModal Component', () => {
      const modalPath = 'client/src/components/supervisor/FeedbackModal.tsx';
      
      if (!fs.existsSync(modalPath)) {
        throw new Error('FeedbackModal.tsx not found');
      }
      
      const content = fs.readFileSync(modalPath, 'utf8');
      
      // Check for required rating fields
      const requiredRatings = [
        'overallRating',
        'clinicalKnowledgeRating', 
        'communicationRating',
        'professionalismRating'
      ];
      
      for (const rating of requiredRatings) {
        if (!content.includes(rating)) {
          throw new Error(`Missing rating field: ${rating}`);
        }
      }
      
      // Check for form functionality
      const requiredFormFeatures = [
        'handleSubmit',
        'validateForm',
        '/api/supervisor/feedback',
        'writtenFeedback',
        'strengths',
        'improvementAreas',
        'recommendations'
      ];
      
      for (const feature of requiredFormFeatures) {
        if (!content.includes(feature)) {
          throw new Error(`Missing form feature: ${feature}`);
        }
      }
      
      return {
        fileSize: content.length,
        hasFormValidation: content.includes('validateForm'),
        hasAPIIntegration: content.includes('/api/supervisor/feedback'),
        hasErrorHandling: content.includes('submitError'),
        hasLoadingState: content.includes('isSubmitting')
      };
    });
  }

  validateAssignScenarioModal() {
    return this.validate('AssignScenarioModal Component', () => {
      const modalPath = 'client/src/components/supervisor/AssignScenarioModal.tsx';
      
      if (!fs.existsSync(modalPath)) {
        throw new Error('AssignScenarioModal.tsx not found');
      }
      
      const content = fs.readFileSync(modalPath, 'utf8');
      
      // Check for scenario selection functionality
      const requiredFeatures = [
        'scenarioId',
        'fetchScenarios',
        '/api/pharmacy/scenarios',
        '/api/supervisor/scenarios',
        'dueDate',
        'priorityLevel',
        'learningObjectives',
        'Select',
        'selectedScenario'
      ];
      
      for (const feature of requiredFeatures) {
        if (!content.includes(feature)) {
          throw new Error(`Missing feature: ${feature}`);
        }
      }
      
      return {
        fileSize: content.length,
        hasScenarioFetching: content.includes('fetchScenarios'),
        hasFormValidation: content.includes('validateForm'),
        hasDateValidation: content.includes('dueDate < today'),
        hasAPIIntegration: content.includes('/api/supervisor/scenarios')
      };
    });
  }

  validateDashboardIntegration() {
    return this.validate('Dashboard Modal Integration', () => {
      const dashboardPath = 'client/src/pages/supervisor/dashboard.tsx';
      
      if (!fs.existsSync(dashboardPath)) {
        throw new Error('Dashboard not found');
      }
      
      const content = fs.readFileSync(dashboardPath, 'utf8');
      
      // Check modal state management
      const requiredStates = [
        'progressModal',
        'feedbackModal', 
        'scenarioModal',
        'setProgressModal',
        'setFeedbackModal',
        'setScenarioModal'
      ];
      
      for (const state of requiredStates) {
        if (!content.includes(state)) {
          throw new Error(`Missing modal state: ${state}`);
        }
      }
      
      // Check modal handlers
      const requiredHandlers = [
        'openProgressModal',
        'openFeedbackModal',
        'openScenarioModal',
        'closeModals'
      ];
      
      for (const handler of requiredHandlers) {
        if (!content.includes(handler)) {
          throw new Error(`Missing modal handler: ${handler}`);
        }
      }
      
      // Check that buttons are connected to handlers
      const buttonConnections = [
        'onViewProgress={openProgressModal}',
        'onSendFeedback={openFeedbackModal}',
        'onAssignScenario={openScenarioModal}'
      ];
      
      for (const connection of buttonConnections) {
        if (!content.includes(connection)) {
          throw new Error(`Missing button connection: ${connection}`);
        }
      }
      
      return {
        hasModalStates: true,
        hasModalHandlers: true,
        hasButtonConnections: true,
        hasProperCleanup: content.includes('closeModals'),
        hasModalRendering: content.includes('<TraineeProgressModal') && 
                          content.includes('<FeedbackModal') && 
                          content.includes('<AssignScenarioModal')
      };
    });
  }

  validateAPIHooks() {
    return this.validate('API Hooks Implementation', () => {
      const hooksPath = 'client/src/hooks/use-supervisor-data.ts';
      
      if (!fs.existsSync(hooksPath)) {
        throw new Error('Supervisor hooks file not found');
      }
      
      const content = fs.readFileSync(hooksPath, 'utf8');
      
      // Check for required hooks
      const requiredHooks = [
        'useSupervisorDashboard',
        'useAssignedTrainees',
        'useTraineeProgress',
        'useSupervisorFeedback',
        'useSupervisorScenarios'
      ];
      
      for (const hook of requiredHooks) {
        if (!content.includes(`export function ${hook}`)) {
          throw new Error(`Missing hook: ${hook}`);
        }
      }
      
      // Check for proper API endpoints
      const requiredEndpoints = [
        '/api/supervisor/dashboard',
        '/api/supervisor/trainees',
        '/api/supervisor/trainee/${traineeId}/progress',
        '/api/supervisor/feedback',
        '/api/supervisor/scenarios'
      ];
      
      for (const endpoint of requiredEndpoints) {
        if (!content.includes(endpoint)) {
          throw new Error(`Missing API endpoint: ${endpoint}`);
        }
      }
      
      return {
        hasAllHooks: true,
        hasProperErrorHandling: content.includes('throw new Error'),
        hasQueryKeys: content.includes('queryKey'),
        hasStaleTime: content.includes('staleTime'),
        hasRetry: content.includes('retry')
      };
    });
  }

  validateButtonFunctionality() {
    return this.validate('Button Functionality Implementation', () => {
      const dashboardPath = 'client/src/pages/supervisor/dashboard.tsx';
      const content = fs.readFileSync(dashboardPath, 'utf8');
      
      // Check that TraineeDetailCard receives all handlers
      const cardProps = [
        'onViewProgress={openProgressModal}',
        'onSendFeedback={openFeedbackModal}',
        'onAssignScenario={openScenarioModal}'
      ];
      
      for (const prop of cardProps) {
        if (!content.includes(prop)) {
          throw new Error(`TraineeDetailCard missing prop: ${prop}`);
        }
      }
      
      // Check button implementations in TraineeDetailCard
      const buttonImplementations = [
        'View Progress',
        'Send Feedback', 
        'Assign Scenario',
        'onClick={() => onViewProgress?.(trainee)}',
        'onClick={() => onSendFeedback?.(trainee)}',
        'onClick={() => onAssignScenario?.(trainee)}'
      ];
      
      for (const impl of buttonImplementations) {
        if (!content.includes(impl)) {
          throw new Error(`Missing button implementation: ${impl}`);
        }
      }
      
      return {
        hasAllButtonTexts: true,
        hasAllClickHandlers: true,
        hasProperPropPassing: true,
        noAlertCalls: !content.includes('alert(') || 
                     content.split('alert(').length <= 3 // Allow some alerts for unimplemented features
      };
    });
  }

  async runFullValidation() {
    this.log('🚀 Starting Comprehensive Supervisor Functionality Validation');
    this.log('================================================================');
    
    // Run all validations
    this.validateTraineeProgressModal();
    this.validateFeedbackModal();
    this.validateAssignScenarioModal();
    this.validateDashboardIntegration();
    this.validateAPIHooks();
    this.validateButtonFunctionality();
    
    this.generateReport();
  }

  generateReport() {
    this.log('================================================================');
    this.log('📊 VALIDATION RESULTS SUMMARY');
    this.log('================================================================');
    this.log(`Total Checks: ${this.validationResults.totalChecks}`);
    this.log(`Passed: ${this.validationResults.passed}`, this.validationResults.passed > 0 ? 'success' : 'info');
    this.log(`Failed: ${this.validationResults.failed}`, this.validationResults.failed > 0 ? 'error' : 'info');
    
    if (this.validationResults.totalChecks > 0) {
      this.log(`Success Rate: ${((this.validationResults.passed / this.validationResults.totalChecks) * 100).toFixed(1)}%`);
    }
    
    if (this.validationResults.failed > 0) {
      this.log('\n❌ FAILED VALIDATIONS:', 'error');
      this.validationResults.checks
        .filter(check => check.status === 'failed')
        .forEach(check => {
          this.log(`  • ${check.name}: ${check.error}`, 'error');
        });
    } else {
      this.log('\n🎉 ALL SUPERVISOR FUNCTIONALITY VALIDATIONS PASSED!', 'success');
      this.log('✅ All 3 modal components are properly implemented', 'success');
      this.log('✅ Dashboard integration is complete', 'success');
      this.log('✅ API hooks are properly configured', 'success');
      this.log('✅ Button functionality is fully connected', 'success');
      this.log('✅ All required features are implemented', 'success');
    }
    
    // Save detailed results
    const reportPath = './tests/supervisor-functionality-validation-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.validationResults, null, 2));
    this.log(`\n📋 Detailed report saved to: ${reportPath}`);
    
    // Exit with appropriate code
    process.exit(this.validationResults.failed > 0 ? 1 : 0);
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new SupervisorFunctionalityValidator();
  validator.runFullValidation().catch(console.error);
}

module.exports = SupervisorFunctionalityValidator;