# Materia Medica Tests

This directory contains unit tests for critical security and validation functions.

## Test Coverage

### Security Tests (`utils.test.js`)
- **XSS Prevention**: Tests for HTML escaping to prevent cross-site scripting attacks
- **Input Validation**: Tests for string and array validation utilities
- **Safe Property Access**: Tests for safe object property retrieval
- **Logging Utilities**: Tests for error and warning logging
- **Debouncing**: Tests for function debouncing utility

### Plant Validation Tests (`plant-validation.test.js`)
- **Plant Object Structure**: Validates required fields (commonName, botanicalName, fileSlug, systems)
- **Data Type Validation**: Ensures fields have correct types
- **XSS in Plant Names**: Tests sanitization of plant names with malicious content
- **System Configuration**: Validates body system IDs

## Running Tests

```bash
# Run tests in watch mode (default)
npm test

# Run tests once and exit
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Results

Current test statistics:
- **Total Tests**: 44
- **Test Files**: 2
- **Pass Rate**: 100%
- **Coverage**: Core security and validation functions

## What's NOT Tested

This is intentionally a minimal test suite focused on critical functions:
- ❌ DOM manipulation (manual testing is sufficient)
- ❌ Navigation rendering
- ❌ Search/filter UI logic
- ❌ Plant card rendering
- ❌ Static data file (plants-data.js)

## Why These Tests?

These tests focus on the most critical aspects:

1. **Security**: XSS prevention is critical - any bug here could compromise the site
2. **Data Integrity**: Invalid plant data could crash the application
3. **Utility Functions**: Shared utilities are used everywhere - bugs multiply
4. **Regression Prevention**: Tests catch breaking changes during refactoring

## Adding More Tests

To add tests for new features:

1. Create a new file: `tests/feature-name.test.js`
2. Import from vitest: `import { describe, it, expect } from 'vitest';`
3. Write tests using the same patterns
4. Run `npm test` to verify

## Test Framework

- **Framework**: [Vitest](https://vitest.dev/) - Fast, modern test runner
- **Environment**: jsdom - Simulates browser DOM for testing
- **Globals**: Enabled - No need to import `describe`, `it`, `expect`
