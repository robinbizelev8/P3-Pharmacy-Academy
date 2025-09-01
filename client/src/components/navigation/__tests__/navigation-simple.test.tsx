import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Simple component test to verify testing infrastructure
describe('Navigation Testing Infrastructure', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Hello Test</div>;
    
    render(<TestComponent />);
    
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });

  it('should work with React Query', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const TestComponent = () => <div>React Query Test</div>;
    
    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>
    );
    
    expect(screen.getByText('React Query Test')).toBeInTheDocument();
  });

  it('should handle mocked functions', () => {
    const mockFn = vi.fn(() => 'mocked result');
    
    expect(mockFn()).toBe('mocked result');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});