# Test Suite Documentation

## Overview

This test suite provides comprehensive testing for the HabitPet application, including unit tests, integration tests, and end-to-end tests.

## Test Structure

```
tests/
├── unit/              # Unit tests for individual functions/components
├── integration/       # Integration tests for API endpoints
├── e2e/              # End-to-end tests with Playwright
├── error-scenarios/  # Error handling and edge case tests
├── utils/            # Test utilities and helpers
├── fixtures/         # Test fixtures (images, data, etc.)
└── setup.ts          # Test setup and global configuration
```

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run in watch mode
npm run test:watch

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

### All Tests
```bash
# Run unit and E2E tests
npm run test:all
```

## Test Utilities

### Mock Camera
`tests/utils/mock-camera.ts` - Utilities for mocking camera access in tests

### Test Images
`tests/utils/test-images.ts` - Test images and image creation utilities

### Test Helpers
`tests/utils/test-helpers.ts` - General test helper functions

## Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/my-function';

describe('myFunction', () => {
  it('should work correctly', () => {
    expect(myFunction()).toBe(expected);
  });
});
```

### Integration Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/analyze-food/route';

describe('POST /api/analyze-food', () => {
  it('should return valid response', async () => {
    // Test implementation
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('should complete food logging flow', async ({ page }) => {
  await page.goto('/add-food');
  // Test implementation
});
```

## Coverage Goals

- **Unit Tests**: 80%+ coverage of utility functions
- **Integration Tests**: 100% coverage of API endpoints
- **E2E Tests**: All critical user flows

## CI/CD

Tests run automatically on:
- Every push to main/develop
- Every pull request
- See `.github/workflows/test.yml` for configuration

