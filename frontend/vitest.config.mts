/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment configuration
    environment: 'jsdom',
    
    // Setup files
    setupFiles: ['./src/test-utils/setup.ts'],
    
    // Global test configuration
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-utils/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        'src/app/layout.tsx', // Exclude due to complex Clerk setup
        'src/middleware.ts',  // Exclude middleware from coverage
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 80,
          statements: 80,
        },
      },
    },
    
    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    
    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'coverage',
    ],
    
    // Test timeout
    testTimeout: 10000,
    
    // Hooks timeout
    hookTimeout: 10000,
    
    // Mock configuration
    clearMocks: true,
    restoreMocks: true,
    
    // Reporter configuration
    reporter: ['verbose', 'html'],
    
    // Watch configuration
    watch: false,
    
    // Parallel execution
    threads: true,
    maxThreads: 4,
    minThreads: 1,
  },
  
  // Resolve configuration for imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // Define global variables for tests
  define: {
    'process.env.NODE_ENV': '"test"',
  },
})