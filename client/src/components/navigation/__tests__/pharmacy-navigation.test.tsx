import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PharmacyNavigation } from '../pharmacy-navigation';

// Mock the hooks using vi.mock factory functions
vi.mock('wouter', () => ({
  useLocation: vi.fn(() => ['/supervisor/dashboard', vi.fn()]),
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('../../hooks/use-auth', () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      role: 'supervisor',
      email: 'supervisor@test.com'
    },
    isAuthenticated: true,
    isLoading: false,
  })),
}));

// Mock the logo import
vi.mock('../../../assets/generated_images/P3_Pharmacy_Academy_Logo_e0d57123.png', () => ({
  default: '/mock-logo.png'
}));

// Mock fetch for logout
global.fetch = vi.fn();

describe('PharmacyNavigation', () => {
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
    
    // Get the mocked functions
    const { useLocation } = await import('wouter');
    const { useAuth } = await import('../../hooks/use-auth');
    mockUseLocation = useLocation as any;
    mockUseAuth = useAuth as any;
    
    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Role-based Navigation', () => {
    it('renders supervisor navigation items for supervisor role', () => {
      mockUseAuth.mockReturnValue({
        user: { role: 'supervisor', firstName: 'John', lastName: 'Doe' },
        isAuthenticated: true,
      });

      renderWithProviders(<PharmacyNavigation />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Trainees')).toBeInTheDocument();
      expect(screen.getByText('Feedback')).toBeInTheDocument();
      
      // Should not show student navigation items
      expect(screen.queryByText('Prepare')).not.toBeInTheDocument();
      expect(screen.queryByText('Practice')).not.toBeInTheDocument();
      expect(screen.queryByText('Perform')).not.toBeInTheDocument();
    });

    it('renders student navigation items for student role', () => {
      mockUseAuth.mockReturnValue({
        user: { role: 'student', firstName: 'Jane', lastName: 'Doe' },
        isAuthenticated: true,
      });

      renderWithProviders(<PharmacyNavigation />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Prepare')).toBeInTheDocument();
      expect(screen.getByText('Practice')).toBeInTheDocument();
      expect(screen.getByText('Perform')).toBeInTheDocument();
      
      // Should not show supervisor navigation items
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Trainees')).not.toBeInTheDocument();
    });
  });

  describe('Active State Detection', () => {
    it('highlights active navigation item correctly for exact match', () => {
      mockUseLocation.mockReturnValue(['/supervisor/dashboard', vi.fn()]);
      mockUseAuth.mockReturnValue({
        user: { role: 'supervisor', firstName: 'John', lastName: 'Doe' },
        isAuthenticated: true,
      });

      renderWithProviders(<PharmacyNavigation />);

      const dashboardLink = screen.getByText('Dashboard').closest('div');
      expect(dashboardLink).toHaveClass('bg-gradient-to-br');
    });

    it('highlights active navigation item for query parameter routes', () => {
      mockUseLocation.mockReturnValue(['/supervisor/dashboard?tab=trainees', vi.fn()]);
      mockUseAuth.mockReturnValue({
        user: { role: 'supervisor', firstName: 'John', lastName: 'Doe' },
        isAuthenticated: true,
      });

      renderWithProviders(<PharmacyNavigation />);

      const traineesLink = screen.getByText('Trainees').closest('div');
      expect(traineesLink).toHaveClass('bg-gradient-to-br');
    });

    it('does not highlight inactive navigation items', () => {
      mockUseLocation.mockReturnValue(['/feedback', vi.fn()]);
      mockUseAuth.mockReturnValue({
        user: { role: 'supervisor', firstName: 'John', lastName: 'Doe' },
        isAuthenticated: true,
      });

      renderWithProviders(<PharmacyNavigation />);

      const dashboardLink = screen.getByText('Dashboard').closest('div');
      expect(dashboardLink).not.toHaveClass('bg-gradient-to-br');
      expect(dashboardLink).toHaveClass('hover:bg-white/70');
    });
  });

  describe('User Information Display', () => {
    it('displays user name and role correctly', () => {
      mockUseAuth.mockReturnValue({
        user: {
          firstName: 'John',
          lastName: 'Doe',
          role: 'supervisor'
        },
        isAuthenticated: true,
      });

      renderWithProviders(<PharmacyNavigation />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('supervisor')).toBeInTheDocument();
    });

    it('displays user initials in avatar', () => {
      mockUseAuth.mockReturnValue({
        user: {
          firstName: 'John',
          lastName: 'Doe',
          role: 'supervisor'
        },
        isAuthenticated: true,
      });

      renderWithProviders(<PharmacyNavigation />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('generates correct hrefs for supervisor navigation items', () => {
      mockUseAuth.mockReturnValue({
        user: { role: 'supervisor', firstName: 'John', lastName: 'Doe' },
        isAuthenticated: true,
      });

      renderWithProviders(<PharmacyNavigation />);

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      const traineesLink = screen.getByText('Trainees').closest('a');
      const feedbackLink = screen.getByText('Feedback').closest('a');

      expect(dashboardLink).toHaveAttribute('href', '/supervisor/dashboard');
      expect(traineesLink).toHaveAttribute('href', '/supervisor/dashboard?tab=trainees');
      expect(feedbackLink).toHaveAttribute('href', '/feedback');
    });

    it('generates correct hrefs for student navigation items', () => {
      mockUseAuth.mockReturnValue({
        user: { role: 'student', firstName: 'Jane', lastName: 'Doe' },
        isAuthenticated: true,
      });

      renderWithProviders(<PharmacyNavigation />);

      const homeLink = screen.getByText('Home').closest('a');
      const prepareLink = screen.getByText('Prepare').closest('a');
      const practiceLink = screen.getByText('Practice').closest('a');
      const performLink = screen.getByText('Perform').closest('a');

      expect(homeLink).toHaveAttribute('href', '/');
      expect(prepareLink).toHaveAttribute('href', '/prepare');
      expect(practiceLink).toHaveAttribute('href', '/practice');
      expect(performLink).toHaveAttribute('href', '/perform');
    });
  });

  describe('Enhanced Active State Function', () => {
    it('correctly identifies active state for exact matches', () => {
      mockUseLocation.mockReturnValue(['/supervisor/dashboard', vi.fn()]);
      mockUseAuth.mockReturnValue({
        user: { role: 'supervisor', firstName: 'John', lastName: 'Doe' },
        isAuthenticated: true,
      });

      renderWithProviders(<PharmacyNavigation />);
      
      // Dashboard should be active
      const dashboardLink = screen.getByText('Dashboard').closest('div');
      expect(dashboardLink).toHaveClass('bg-gradient-to-br');
    });

    it('correctly identifies active state for query parameter routes', () => {
      mockUseLocation.mockReturnValue(['/supervisor/dashboard?tab=trainees&other=param', vi.fn()]);
      mockUseAuth.mockReturnValue({
        user: { role: 'supervisor', firstName: 'John', lastName: 'Doe' },
        isAuthenticated: true,
      });

      renderWithProviders(<PharmacyNavigation />);
      
      // Trainees should be active even with additional query params
      const traineesLink = screen.getByText('Trainees').closest('div');
      expect(traineesLink).toHaveClass('bg-gradient-to-br');
    });

    it('does not match partial query parameters', () => {
      mockUseLocation.mockReturnValue(['/supervisor/dashboard?tab=other', vi.fn()]);
      mockUseAuth.mockReturnValue({
        user: { role: 'supervisor', firstName: 'John', lastName: 'Doe' },
        isAuthenticated: true,
      });

      renderWithProviders(<PharmacyNavigation />);
      
      // Trainees should NOT be active with different tab param
      const traineesLink = screen.getByText('Trainees').closest('div');
      expect(traineesLink).not.toHaveClass('bg-gradient-to-br');
    });
  });
});