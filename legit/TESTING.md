# Testing Guide

This project uses [Vitest](https://vitest.dev/) for unit and integration testing, along with [React Testing Library](https://testing-library.com/react) for component testing.

## Quick Start

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test
```

### Run tests once (CI mode)
```bash
npm test:run
```

### Run tests with UI
```bash
npm test:ui
```

### Generate coverage report
```bash
npm test:coverage
```

## Test Structure

Tests are located in the `__tests__` directory and follow the naming convention `*.test.ts` or `*.test.tsx`.

```
__tests__/
  ├── csv-import.test.ts          # CSV import utility tests
  ├── workflow-templates.test.ts   # Workflow template tests
  └── test-utils.tsx               # Testing utilities and helpers
```

## Writing Tests

### Example: Testing a utility function

```typescript
import { describe, it, expect } from 'vitest';
import { normalizePhoneNumber } from '@/lib/csv-import';

describe('normalizePhoneNumber', () => {
  it('should normalize Korean phone numbers', () => {
    expect(normalizePhoneNumber('010-1234-5678')).toBe('01012345678');
  });
});
```

### Example: Testing a React component

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { MyComponent } from '@/components/my-component';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Test Utilities

The `__tests__/test-utils.tsx` file provides:
- Custom `render` function with React Query provider
- Re-exports from `@testing-library/react`

## Mocking

Common mocks are set up in `vitest.setup.ts`:
- `next/navigation` - Router and navigation hooks
- `next-intl` - Internationalization
- `sonner` - Toast notifications

## Coverage

Coverage reports are generated in the `coverage/` directory. The configuration excludes:
- `node_modules/`
- Configuration files
- Type definition files

## Best Practices

1. **Test behavior, not implementation** - Focus on what the code does, not how it does it
2. **Use descriptive test names** - Test names should clearly describe what is being tested
3. **Keep tests isolated** - Each test should be independent and not rely on other tests
4. **Mock external dependencies** - Mock API calls, database queries, and external services
5. **Test edge cases** - Include tests for error conditions and boundary cases

## Current Test Coverage

- ✅ CSV import utilities (phone normalization, date parsing, validation)
- ✅ Workflow template library (import/export, validation)
- 🔄 Component tests (to be added)
- 🔄 API route tests (to be added)
- 🔄 Integration tests (to be added)

## Adding New Tests

1. Create a test file in `__tests__/` with the pattern `*.test.ts` or `*.test.tsx`
2. Import necessary testing utilities
3. Write test cases using `describe` and `it` blocks
4. Run tests to verify they pass

## CI/CD Integration

Tests run automatically in CI/CD pipelines. Make sure all tests pass before merging pull requests.

