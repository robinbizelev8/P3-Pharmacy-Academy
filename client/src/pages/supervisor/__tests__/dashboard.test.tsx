import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock external dependencies
vi.mock('wouter', () => ({
  useLocation: vi.fn(() => ['/supervisor/dashboard', vi.fn()]),
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('../../../hooks/use-auth', () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: 'supervisor-123',
      firstName: 'John',
      lastName: 'Supervisor',
      role: 'supervisor',
      email: 'supervisor@test.com'
    },
    isAuthenticated: true,
    isLoading: false,
  })),
}));

vi.mock('../../../hooks/use-supervisor-data', () => ({
  useSupervisorDashboard: vi.fn(() => ({
    data: {
      assignedTrainees: [],
      pendingReviews: [],
      recentActivity: [],
      performanceMetrics: {
        totalTrainees: 5,
        averageProgress: 75,
        completedSessions: 25,
        pendingFeedback: 3,
        averageTraineeProgress: 80
      },
      analytics: {
        competencyBreakdown: {},
        moduleProgress: {},
        improvementTrends: []
      }
    },
    isLoading: false,
    error: null
  })),
  useAssignedTrainees: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null
  }))
}));

// Mock supervisor components
vi.mock('../../../components/supervisor/TraineeProgressModal', () => ({
  TraineeProgressModal: ({ isOpen, onClose }: any) => 
    isOpen ? <div data-testid="trainee-progress-modal">Trainee Progress Modal</div> : null
}));

vi.mock('../../../components/supervisor/FeedbackModal', () => ({
  FeedbackModal: ({ isOpen, onClose }: any) => 
    isOpen ? <div data-testid="feedback-modal">Feedback Modal</div> : null
}));

vi.mock('../../../components/supervisor/AssignScenarioModal', () => ({
  AssignScenarioModal: ({ isOpen, onClose }: any) => 
    isOpen ? <div data-testid="assign-scenario-modal">Assign Scenario Modal</div> : null
}));

vi.mock('../../../components/supervisor/ManageTraineesModal', () => ({
  ManageTraineesModal: ({ isOpen, onClose }: any) => 
    isOpen ? <div data-testid="manage-trainees-modal">Manage Trainees Modal</div> : null
}));

vi.mock('../../../components/supervisor/StudentResponsesView', () => ({
  StudentResponsesView: () => <div data-testid="student-responses-view">Student Responses View</div>
}));

vi.mock('../../../components/supervisor/FeedbackAnalytics', () => ({
  FeedbackAnalytics: () => <div data-testid="feedback-analytics">Feedback Analytics</div>
}));

describe('SupervisorDashboard', () => {
  let queryClient: QueryClient;
  let mockUseLocation: any;
  let mockUseAuth: any;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset window.history for each test
    Object.defineProperty(window, 'history', {
      value: {
        pushState: vi.fn(),
      },
      writable: true
    });

    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('URL Parameter Handling', () => {
    it('should read tab parameter from URL on mount', async () => {
      // Mock URL with tab parameter
      Object.defineProperty(window, 'location', {
        value: {
          search: '?tab=trainees'
        },
        writable: true
      });

      const SupervisorDashboard = (await import('../dashboard')).default;
      renderWithProviders(<SupervisorDashboard />);

      // Should show trainees tab as active
      await waitFor(() => {
        const traineesTab = screen.getByRole('tab', { name: /trainees/i });
        expect(traineesTab).toHaveAttribute('data-state', 'active');
      });
    });

    it('should default to overview tab when no tab parameter is provided', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: ''
        },
        writable: true
      });

      const SupervisorDashboard = (await import('../dashboard')).default;
      renderWithProviders(<SupervisorDashboard />);

      await waitFor(() => {
        const overviewTab = screen.getByRole('tab', { name: /overview/i });
        expect(overviewTab).toHaveAttribute('data-state', 'active');
      });
    });

    it('should handle invalid tab parameters gracefully', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?tab=invalid-tab'
        },
        writable: true
      });

      const SupervisorDashboard = (await import('../dashboard')).default;
      renderWithProviders(<SupervisorDashboard />);

      // Should fall back to overview tab
      await waitFor(() => {
        const overviewTab = screen.getByRole('tab', { name: /overview/i });
        expect(overviewTab).toHaveAttribute('data-state', 'active');
      });
    });
  });

  describe('Tab Navigation and URL Updates', () => {
    it('should update URL when tab changes', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '',
          pathname: '/supervisor/dashboard'
        },
        writable: true
      });

      const pushStateSpy = vi.spyOn(window.history, 'pushState');

      const SupervisorDashboard = (await import('../dashboard')).default;
      renderWithProviders(<SupervisorDashboard />);

      // Click on trainees tab
      const traineesTab = screen.getByRole('tab', { name: /trainees/i });
      fireEvent.click(traineesTab);

      await waitFor(() => {
        expect(pushStateSpy).toHaveBeenCalledWith(
          {},
          '',
          '/supervisor/dashboard?tab=trainees'
        );
      });
    });

    it('should not add query parameter for overview tab', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?tab=trainees',
          pathname: '/supervisor/dashboard'
        },
        writable: true
      });

      const pushStateSpy = vi.spyOn(window.history, 'pushState');

      const SupervisorDashboard = (await import('../dashboard')).default;
      renderWithProviders(<SupervisorDashboard />);

      // Click on overview tab
      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      fireEvent.click(overviewTab);

      await waitFor(() => {
        expect(pushStateSpy).toHaveBeenCalledWith(
          {},
          '',
          '/supervisor/dashboard'
        );
      });
    });
  });

  describe('Authentication and Authorization', () => {
    it('should redirect non-supervisors to appropriate dashboard', async () => {
      const { useAuth } = await import('../../../hooks/use-auth');
      const mockUseAuth = useAuth as any;
      
      mockUseAuth.mockReturnValue({
        user: { role: 'student' },
        isAuthenticated: true,
        isLoading: false
      });

      // Mock window.location.href setter
      delete (window as any).location;
      window.location = { href: '' } as any;

      const SupervisorDashboard = (await import('../dashboard')).default;
      renderWithProviders(<SupervisorDashboard />);

      // Should redirect student to /dashboard
      await waitFor(() => {
        expect(window.location.href).toBe('/dashboard');
      });
    });

    it('should redirect unauthenticated users to login', async () => {
      const { useAuth } = await import('../../../hooks/use-auth');
      const mockUseAuth = useAuth as any;
      
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });

      // Mock window.location.href setter
      delete (window as any).location;
      window.location = { href: '' } as any;

      const SupervisorDashboard = (await import('../dashboard')).default;
      renderWithProviders(<SupervisorDashboard />);

      await waitFor(() => {
        expect(window.location.href).toBe('/login');
      });
    });

    it('should show loading state while checking authentication', async () => {
      const { useAuth } = await import('../../../hooks/use-auth');
      const mockUseAuth = useAuth as any;
      
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true
      });

      const SupervisorDashboard = (await import('../dashboard')).default;
      renderWithProviders(<SupervisorDashboard />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Dashboard Data Loading', () => {
    it('should show loading state while fetching dashboard data', async () => {
      const { useSupervisorDashboard } = await import('../../../hooks/use-supervisor-data');
      const mockUseSupervisorDashboard = useSupervisorDashboard as any;
      
      mockUseSupervisorDashboard.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      const SupervisorDashboard = (await import('../dashboard')).default;
      renderWithProviders(<SupervisorDashboard />);

      // Should show loading skeleton
      expect(screen.getAllByRole('generic')).toHaveLength.greaterThan(0);
    });

    it('should show error state when dashboard fails to load', async () => {
      const { useSupervisorDashboard } = await import('../../../hooks/use-supervisor-data');
      const mockUseSupervisorDashboard = useSupervisorDashboard as any;
      
      mockUseSupervisorDashboard.mockReturnValue({
        data: null,
        isLoading: false,
        error: { message: 'Failed to load dashboard' }
      });

      const SupervisorDashboard = (await import('../dashboard')).default;
      renderWithProviders(<SupervisorDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Dashboard')).toBeInTheDocument();
        expect(screen.getByText(/Failed to load dashboard/)).toBeInTheDocument();
      });
    });

    it('should display dashboard metrics when data is loaded', async () => {
      const SupervisorDashboard = (await import('../dashboard')).default;
      renderWithProviders(<SupervisorDashboard />);

      await waitFor(() => {
        // Should show metrics based on mocked data
        expect(screen.getByText('5')).toBeInTheDocument(); // totalTrainees
        expect(screen.getByText('25')).toBeInTheDocument(); // completedSessions
        expect(screen.getByText('3')).toBeInTheDocument(); // pendingFeedback
      });
    });
  });

  describe('Tab Content Rendering', () => {
    it('should render different content for each tab', async () => {
      const SupervisorDashboard = (await import('../dashboard')).default;
      renderWithProviders(<SupervisorDashboard />);

      // Test each tab
      const tabs = ['overview', 'trainees', 'reviews', 'analytics', 'scenarios'];
      
      for (const tab of tabs) {
        const tabElement = screen.getByRole('tab', { name: new RegExp(tab, 'i') });
        fireEvent.click(tabElement);

        await waitFor(() => {
          expect(tabElement).toHaveAttribute('data-state', 'active');
        });
      }
    });
  });
});