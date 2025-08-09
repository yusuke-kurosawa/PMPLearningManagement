import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { vi } from 'vitest';

// Test providers wrapper
interface TestProvidersProps {
  children: ReactNode;
  session?: Session | null;
  queryClient?: QueryClient;
}

export function TestProviders({ 
  children, 
  session = null,
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}: TestProvidersProps) {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}

// Custom render function
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    session?: Session | null;
    queryClient?: QueryClient;
  }
) {
  const { session, queryClient, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders session={session} queryClient={queryClient}>
        {children}
      </TestProviders>
    ),
    ...renderOptions,
  });
}

// Mock session factory
export function createMockSession(overrides?: Partial<Session>): Session {
  return {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      image: null,
      role: 'USER',
      ...overrides?.user,
    },
    expires: '2025-12-31T23:59:59.999Z',
    ...overrides,
  } as Session;
}

// Wait utilities
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const waitForAsync = async (
  callback: () => boolean | Promise<boolean>,
  options = { timeout: 5000, interval: 100 }
) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < options.timeout) {
    const result = await callback();
    if (result) return true;
    await waitFor(options.interval);
  }
  
  throw new Error('Timeout waiting for condition');
};

// Mock fetch response
export function mockFetch(response: any, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
    headers: new Headers(),
  });
}

// Performance measurement
export class PerformanceObserver {
  private marks = new Map<string, number>();
  
  mark(name: string) {
    this.marks.set(name, performance.now());
  }
  
  measure(name: string, startMark: string, endMark?: string) {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();
    
    if (!start) throw new Error(`Mark "${startMark}" not found`);
    if (endMark && !this.marks.has(endMark)) {
      throw new Error(`Mark "${endMark}" not found`);
    }
    
    return end! - start;
  }
  
  clear() {
    this.marks.clear();
  }
}

// Assertion helpers
export const assertDefined = <T>(value: T | undefined | null): T => {
  expect(value).toBeDefined();
  expect(value).not.toBeNull();
  return value as T;
};

export const assertType = <T>(value: unknown, type: string): T => {
  expect(typeof value).toBe(type);
  return value as T;
};

// Error boundary for tests
export class TestError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'TestError';
  }
}

// Mock console methods
export const mockConsole = () => {
  const originalConsole = { ...console };
  
  const mocks = {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
    debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
  };
  
  return {
    mocks,
    restore: () => {
      Object.entries(mocks).forEach(([key, mock]) => {
        mock.mockRestore();
      });
    },
  };
};

// Test data cleanup
export const cleanupTestData = async () => {
  // Clear all localStorage
  localStorage.clear();
  
  // Clear all sessionStorage
  sessionStorage.clear();
  
  // Clear all cookies
  document.cookie.split(';').forEach((c) => {
    document.cookie = c
      .replace(/^ +/, '')
      .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
  });
  
  // Clear all timers
  vi.clearAllTimers();
  
  // Clear all mocks
  vi.clearAllMocks();
};

export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';