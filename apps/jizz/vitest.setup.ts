import '@testing-library/jest-dom';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Mock ResizeObserver (required by some UI components)
global.ResizeObserver = class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock vi functions that setup file should define
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/jizz/client', () => ({
  JizzClientAdapter: vi.fn().mockImplementation(() => ({
    listPhenomena: vi.fn().mockResolvedValue([]),
    getPhenomenon: vi.fn().mockResolvedValue(null),
    listPerspectives: vi.fn().mockResolvedValue([]),
    listSignals: vi.fn().mockResolvedValue([]),
  })),
}));