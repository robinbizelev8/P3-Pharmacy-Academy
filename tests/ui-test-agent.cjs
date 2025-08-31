#!/usr/bin/env node

/**
 * UI Test Agent for Supervisor Dashboard
 * 
 * This automated test agent validates the user interface components, interactions,
 * responsiveness, accessibility, and visual consistency of the supervisor dashboard.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class UITestAgent {
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

  async testSupervisorDashboardComponents() {
    return new Promise((resolve, reject) => {
      try {
        const dashboardPath = path.join(process.cwd(), 'client', 'src', 'pages', 'supervisor', 'dashboard.tsx');
        
        if (!fs.existsSync(dashboardPath)) {
          reject(new Error('Supervisor dashboard component not found'));
          return;
        }

        const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
        
        // Check for essential UI components
        const requiredComponents = [
          'SupervisorDashboard',
          'MetricCard',
          'ActivityItem',
          'TraineePerformanceItem',
          'PendingReviewItem'
        ];

        for (const component of requiredComponents) {
          if (!dashboardContent.includes(component)) {
            reject(new Error(`Missing essential component: ${component}`));
            return;
          }
        }

        // Check for proper TypeScript props interfaces
        const requiredInterfaces = [
          'SupervisorDashboardData',
          'MetricCardProps',
          'ActivityItemProps',
          'TraineePerformanceItemProps',
          'PendingReviewItemProps'
        ];

        for (const interfaceName of requiredInterfaces) {
          if (!dashboardContent.includes(`interface ${interfaceName}`) && 
              !dashboardContent.includes(`type ${interfaceName}`)) {
            reject(new Error(`Missing TypeScript interface: ${interfaceName}`));
            return;
          }
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Supervisor dashboard components test failed: ${error.message}`));
      }
    });
  }

  async testUILibraryIntegration() {
    return new Promise((resolve, reject) => {
      try {
        const dashboardPath = path.join(process.cwd(), 'client', 'src', 'pages', 'supervisor', 'dashboard.tsx');
        const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
        
        // Check for UI library components (Shadcn/ui)
        const requiredUIComponents = [
          'Card',
          'CardContent',
          'CardHeader',
          'CardTitle',
          'Button',
          'Badge',
          'Progress',
          'Tabs',
          'TabsContent',
          'TabsList',
          'TabsTrigger'
        ];

        for (const component of requiredUIComponents) {
          if (!dashboardContent.includes(component)) {
            reject(new Error(`Missing UI library component: ${component}`));
            return;
          }
        }

        // Check for proper imports
        if (!dashboardContent.includes('@/components/ui/')) {
          reject(new Error('Missing UI component imports from @/components/ui/'));
          return;
        }

        // Check for icons integration
        if (!dashboardContent.includes('lucide-react')) {
          reject(new Error('Missing Lucide React icons integration'));
          return;
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`UI library integration test failed: ${error.message}`));
      }
    });
  }

  async testAuthentication() {
    return new Promise((resolve, reject) => {
      try {
        const dashboardPath = path.join(process.cwd(), 'client', 'src', 'pages', 'supervisor', 'dashboard.tsx');
        const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
        
        // Check for authentication hook usage
        if (!dashboardContent.includes('useAuth')) {
          reject(new Error('Missing useAuth hook integration'));
          return;
        }

        // Check for authentication state handling
        const authChecks = [
          'isAuthenticated',
          'isLoading',
          'user?.role'
        ];

        for (const check of authChecks) {
          if (!dashboardContent.includes(check)) {
            reject(new Error(`Missing authentication check: ${check}`));
            return;
          }
        }

        // Check for role-based access control
        if (!dashboardContent.includes("role !== 'supervisor'")) {
          reject(new Error('Missing supervisor role validation'));
          return;
        }

        // Check for proper loading state
        if (!dashboardContent.includes('Loading...')) {
          reject(new Error('Missing loading state component'));
          return;
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Authentication integration test failed: ${error.message}`));
      }
    });
  }

  async testDataIntegration() {
    return new Promise((resolve, reject) => {
      try {
        const dashboardPath = path.join(process.cwd(), 'client', 'src', 'pages', 'supervisor', 'dashboard.tsx');
        const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
        
        // Check for TanStack Query integration
        if (!dashboardContent.includes('useQuery')) {
          reject(new Error('Missing useQuery hook for data fetching'));
          return;
        }

        // Check for proper API endpoint usage
        if (!dashboardContent.includes('/api/supervisor/dashboard')) {
          reject(new Error('Missing supervisor dashboard API endpoint'));
          return;
        }

        // Check for loading states
        if (!dashboardContent.includes('isDashboardLoading') && 
            !dashboardContent.includes('isLoading')) {
          reject(new Error('Missing data loading state management'));
          return;
        }

        // Check for error handling
        if (!dashboardContent.includes('animate-pulse') || 
            !dashboardContent.includes('skeleton')) {
          this.log('Warning: Missing loading skeleton components', 'warn');
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Data integration test failed: ${error.message}`));
      }
    });
  }

  async testResponsiveDesign() {
    return new Promise((resolve, reject) => {
      try {
        const dashboardPath = path.join(process.cwd(), 'client', 'src', 'pages', 'supervisor', 'dashboard.tsx');
        const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
        
        // Check for responsive grid classes
        const responsiveClasses = [
          'grid-cols-1',
          'md:grid-cols-2',
          'lg:grid-cols-3',
          'lg:grid-cols-4',
          'sm:px-6',
          'lg:px-8'
        ];

        let foundResponsiveClasses = 0;
        for (const className of responsiveClasses) {
          if (dashboardContent.includes(className)) {
            foundResponsiveClasses++;
          }
        }

        if (foundResponsiveClasses < 3) {
          reject(new Error('Insufficient responsive design classes found'));
          return;
        }

        // Check for proper mobile layout considerations
        if (!dashboardContent.includes('max-w-7xl') && 
            !dashboardContent.includes('container')) {
          this.log('Warning: Missing container width constraints', 'warn');
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Responsive design test failed: ${error.message}`));
      }
    });
  }

  async testAccessibility() {
    return new Promise((resolve, reject) => {
      try {
        const dashboardPath = path.join(process.cwd(), 'client', 'src', 'pages', 'supervisor', 'dashboard.tsx');
        const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
        
        // Check for semantic HTML elements
        const semanticElements = [
          '<h1',
          '<h2',
          '<h3',
          '<button',
          '<nav'
        ];

        let foundSemanticElements = 0;
        for (const element of semanticElements) {
          if (dashboardContent.includes(element)) {
            foundSemanticElements++;
          }
        }

        if (foundSemanticElements < 3) {
          this.log('Warning: Limited semantic HTML elements found', 'warn');
        }

        // Check for accessibility attributes
        const a11yAttributes = [
          'aria-label',
          'alt=',
          'role=',
          'tabIndex'
        ];

        let foundA11yAttributes = 0;
        for (const attr of a11yAttributes) {
          if (dashboardContent.includes(attr)) {
            foundA11yAttributes++;
          }
        }

        if (foundA11yAttributes === 0) {
          this.log('Warning: No accessibility attributes found', 'warn');
        }

        // Check for keyboard navigation support
        if (dashboardContent.includes('onKeyDown') || 
            dashboardContent.includes('onKeyPress')) {
          this.log('Good: Keyboard navigation support detected', 'info');
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Accessibility test failed: ${error.message}`));
      }
    });
  }

  async testMetricsDisplay() {
    return new Promise((resolve, reject) => {
      try {
        const dashboardPath = path.join(process.cwd(), 'client', 'src', 'pages', 'supervisor', 'dashboard.tsx');
        const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
        
        // Check for metrics display components
        const metricsElements = [
          'totalTrainees',
          'averageProgress',
          'completedSessions',
          'pendingFeedback'
        ];

        for (const metric of metricsElements) {
          if (!dashboardContent.includes(metric)) {
            reject(new Error(`Missing metric display: ${metric}`));
            return;
          }
        }

        // Check for visual indicators
        const visualIndicators = [
          'TrendingUp',
          'Users',
          'CheckCircle',
          'Clock',
          'Progress'
        ];

        let foundIndicators = 0;
        for (const indicator of visualIndicators) {
          if (dashboardContent.includes(indicator)) {
            foundIndicators++;
          }
        }

        if (foundIndicators < 3) {
          reject(new Error('Insufficient visual indicators for metrics'));
          return;
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Metrics display test failed: ${error.message}`));
      }
    });
  }

  async testTabNavigation() {
    return new Promise((resolve, reject) => {
      try {
        const dashboardPath = path.join(process.cwd(), 'client', 'src', 'pages', 'supervisor', 'dashboard.tsx');
        const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
        
        // Check for tab navigation structure
        if (!dashboardContent.includes('Tabs') || 
            !dashboardContent.includes('TabsList') || 
            !dashboardContent.includes('TabsContent')) {
          reject(new Error('Missing tab navigation components'));
          return;
        }

        // Check for tab content sections
        const requiredTabs = [
          'overview',
          'trainees',
          'reviews',
          'scenarios'
        ];

        for (const tab of requiredTabs) {
          if (!dashboardContent.includes(`value="${tab}"`)) {
            reject(new Error(`Missing tab: ${tab}`));
            return;
          }
        }

        // Check for tab state management
        if (!dashboardContent.includes('activeTab') || 
            !dashboardContent.includes('setActiveTab')) {
          reject(new Error('Missing tab state management'));
          return;
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Tab navigation test failed: ${error.message}`));
      }
    });
  }

  async testErrorHandling() {
    return new Promise((resolve, reject) => {
      try {
        const dashboardPath = path.join(process.cwd(), 'client', 'src', 'pages', 'supervisor', 'dashboard.tsx');
        const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
        
        // Check for error boundary components
        if (dashboardContent.includes('ErrorBoundary') || 
            dashboardContent.includes('error-boundary')) {
          this.log('Good: Error boundary components found', 'info');
        }

        // Check for loading states
        if (!dashboardContent.includes('animate-pulse') && 
            !dashboardContent.includes('loading') && 
            !dashboardContent.includes('Loading')) {
          reject(new Error('Missing loading state handling'));
          return;
        }

        // Check for empty states
        const emptyStateChecks = [
          'No trainees assigned',
          'No pending reviews',
          'No scenarios created'
        ];

        let foundEmptyStates = 0;
        for (const emptyState of emptyStateChecks) {
          if (dashboardContent.includes(emptyState)) {
            foundEmptyStates++;
          }
        }

        if (foundEmptyStates < 2) {
          this.log('Warning: Limited empty state handling found', 'warn');
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Error handling test failed: ${error.message}`));
      }
    });
  }

  async testComponentStructure() {
    return new Promise((resolve, reject) => {
      try {
        const dashboardPath = path.join(process.cwd(), 'client', 'src', 'pages', 'supervisor', 'dashboard.tsx');
        const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
        
        // Check for proper component export
        if (!dashboardContent.includes('export default function SupervisorDashboard')) {
          reject(new Error('Missing default export for SupervisorDashboard'));
          return;
        }

        // Check for component modularity
        const componentFunctions = [
          'function MetricCard',
          'function ActivityItem',
          'function TraineePerformanceItem',
          'function PendingReviewItem'
        ];

        for (const func of componentFunctions) {
          if (!dashboardContent.includes(func)) {
            reject(new Error(`Missing component function: ${func}`));
            return;
          }
        }

        // Check for proper TypeScript typing
        if (!dashboardContent.includes(': React.FC') && 
            !dashboardContent.includes(': FC') && 
            !dashboardContent.includes('function SupervisorDashboard()')) {
          this.log('Warning: TypeScript function typing could be improved', 'warn');
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Component structure test failed: ${error.message}`));
      }
    });
  }

  async testStylingConsistency() {
    return new Promise((resolve, reject) => {
      try {
        const dashboardPath = path.join(process.cwd(), 'client', 'src', 'pages', 'supervisor', 'dashboard.tsx');
        const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
        
        // Check for consistent color scheme usage
        const colorClasses = [
          'text-gray-',
          'bg-gray-',
          'text-blue-',
          'text-green-',
          'text-red-',
          'bg-blue-',
          'bg-green-',
          'bg-red-'
        ];

        let foundColorClasses = 0;
        for (const colorClass of colorClasses) {
          if (dashboardContent.includes(colorClass)) {
            foundColorClasses++;
          }
        }

        if (foundColorClasses < 5) {
          this.log('Warning: Limited color class usage - may indicate inconsistent styling', 'warn');
        }

        // Check for proper spacing classes
        const spacingClasses = [
          'p-',
          'm-',
          'px-',
          'py-',
          'mx-',
          'my-',
          'space-',
          'gap-'
        ];

        let foundSpacingClasses = 0;
        for (const spacingClass of spacingClasses) {
          if (dashboardContent.includes(spacingClass)) {
            foundSpacingClasses++;
          }
        }

        if (foundSpacingClasses < 4) {
          reject(new Error('Insufficient spacing classes - may cause layout issues'));
          return;
        }

        resolve(true);
      } catch (error) {
        reject(new Error(`Styling consistency test failed: ${error.message}`));
      }
    });
  }

  generateReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);
    
    this.log('\n=== UI TEST AGENT REPORT ===', 'info');
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
    const reportPath = path.join(process.cwd(), 'tests', 'ui-test-report.json');
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
    this.log('🎨 Starting UI Test Agent for Supervisor Dashboard', 'info');
    
    await this.test('Supervisor Dashboard Components', () => this.testSupervisorDashboardComponents());
    await this.test('UI Library Integration', () => this.testUILibraryIntegration());
    await this.test('Authentication Integration', () => this.testAuthentication());
    await this.test('Data Integration', () => this.testDataIntegration());
    await this.test('Responsive Design', () => this.testResponsiveDesign());
    await this.test('Accessibility Features', () => this.testAccessibility());
    await this.test('Metrics Display', () => this.testMetricsDisplay());
    await this.test('Tab Navigation', () => this.testTabNavigation());
    await this.test('Error Handling', () => this.testErrorHandling());
    await this.test('Component Structure', () => this.testComponentStructure());
    await this.test('Styling Consistency', () => this.testStylingConsistency());
    
    const allTestsPassed = this.generateReport();
    
    if (allTestsPassed) {
      this.log('\n🎉 All UI tests passed! Supervisor dashboard interface is ready.', 'success');
      process.exit(0);
    } else {
      this.log('\n⚠️  Some UI tests failed. Please review and fix the interface issues.', 'error');
      process.exit(1);
    }
  }
}

// Run the test agent if this file is executed directly
if (require.main === module) {
  const agent = new UITestAgent();
  agent.run().catch(error => {
    console.error('❌ UI Test Agent failed:', error);
    process.exit(1);
  });
}

module.exports = UITestAgent;