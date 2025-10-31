/**
 * Tests for utils.js utility functions
 * Focus on critical security and validation functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Utils.escapeHtml', () => {
  it('should escape < and > characters', () => {
    const result = Utils.escapeHtml('<script>');
    expect(result).toBe('&lt;script&gt;');
  });

  it('should escape & character', () => {
    const result = Utils.escapeHtml('Ben & Jerry');
    expect(result).toBe('Ben &amp; Jerry');
  });

  it('should escape quotes', () => {
    expect(Utils.escapeHtml('"double"')).toBe('&quot;double&quot;');
    expect(Utils.escapeHtml("'single'")).toBe('&#039;single&#039;');
  });

  it('should handle XSS attack attempts', () => {
    const xssAttempts = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      'javascript:alert(1)',
      '<iframe src="javascript:alert(1)">',
    ];

    xssAttempts.forEach(attack => {
      const result = Utils.escapeHtml(attack);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });
  });

  it('should handle empty string', () => {
    expect(Utils.escapeHtml('')).toBe('');
  });

  it('should handle null and undefined', () => {
    expect(Utils.escapeHtml(null)).toBe('');
    expect(Utils.escapeHtml(undefined)).toBe('');
  });

  it('should handle non-string types', () => {
    expect(Utils.escapeHtml(123)).toBe('');
    expect(Utils.escapeHtml(true)).toBe('');
    expect(Utils.escapeHtml({})).toBe('');
    expect(Utils.escapeHtml([])).toBe('');
  });

  it('should escape multiple dangerous characters in one string', () => {
    const dangerous = '<div onclick="alert(\'XSS\')" data-value="test">Content & more</div>';
    const result = Utils.escapeHtml(dangerous);

    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
    expect(result).toContain('&quot;');
    expect(result).toContain('&#039;');
    expect(result).toContain('&amp;');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  it('should escape plant names with special characters', () => {
    // Real-world test case for plant database
    const plantName = "St. John's Wort & Valerian <root>";
    const result = Utils.escapeHtml(plantName);

    expect(result).toBe("St. John&#039;s Wort &amp; Valerian &lt;root&gt;");
  });
});

describe('Utils.isValidString', () => {
  it('should return true for non-empty strings', () => {
    expect(Utils.isValidString('Valerian')).toBe(true);
    expect(Utils.isValidString('a')).toBe(true);
    expect(Utils.isValidString(' text ')).toBe(true);
  });

  it('should return false for empty string', () => {
    expect(Utils.isValidString('')).toBe(false);
  });

  it('should return false for non-strings', () => {
    expect(Utils.isValidString(null)).toBe(false);
    expect(Utils.isValidString(undefined)).toBe(false);
    expect(Utils.isValidString(123)).toBe(false);
    expect(Utils.isValidString(true)).toBe(false);
    expect(Utils.isValidString({})).toBe(false);
    expect(Utils.isValidString([])).toBe(false);
  });
});

describe('Utils.isValidArray', () => {
  it('should return true for non-empty arrays', () => {
    expect(Utils.isValidArray([1, 2, 3])).toBe(true);
    expect(Utils.isValidArray(['a'])).toBe(true);
    expect(Utils.isValidArray([{ name: 'test' }])).toBe(true);
  });

  it('should return false for empty array', () => {
    expect(Utils.isValidArray([])).toBe(false);
  });

  it('should return false for non-arrays', () => {
    expect(Utils.isValidArray(null)).toBe(false);
    expect(Utils.isValidArray(undefined)).toBe(false);
    expect(Utils.isValidArray('string')).toBe(false);
    expect(Utils.isValidArray(123)).toBe(false);
    expect(Utils.isValidArray({})).toBe(false);
  });

  it('should validate plant systems array', () => {
    // Real-world test case
    const validSystems = ['nervous', 'immune'];
    const emptySystems = [];

    expect(Utils.isValidArray(validSystems)).toBe(true);
    expect(Utils.isValidArray(emptySystems)).toBe(false);
  });
});

describe('Utils.safeGet', () => {
  it('should return property value if it exists', () => {
    const obj = { name: 'Valerian', family: 'Valerianaceae' };
    expect(Utils.safeGet(obj, 'name')).toBe('Valerian');
    expect(Utils.safeGet(obj, 'family')).toBe('Valerianaceae');
  });

  it('should return default value if property does not exist', () => {
    const obj = { name: 'Valerian' };
    expect(Utils.safeGet(obj, 'missing', 'default')).toBe('default');
  });

  it('should return empty string as default if not specified', () => {
    const obj = { name: 'Valerian' };
    expect(Utils.safeGet(obj, 'missing')).toBe('');
  });

  it('should handle null and undefined objects', () => {
    expect(Utils.safeGet(null, 'key', 'default')).toBe('default');
    expect(Utils.safeGet(undefined, 'key', 'default')).toBe('default');
  });

  it('should handle non-object types', () => {
    expect(Utils.safeGet('string', 'key', 'default')).toBe('default');
    expect(Utils.safeGet(123, 'key', 'default')).toBe('default');
  });

  it('should access plant properties safely', () => {
    // Real-world test case
    const plant = {
      commonName: 'Valerian',
      botanicalName: 'Valeriana officinalis'
    };

    expect(Utils.safeGet(plant, 'commonName')).toBe('Valerian');
    expect(Utils.safeGet(plant, 'danishName', 'Not available')).toBe('Not available');
  });
});

describe('Utils.debounce', () => {
  it('should debounce function calls', async () => {
    const mockFn = vi.fn();
    const debouncedFn = Utils.debounce(mockFn, 100);

    // Call multiple times rapidly
    debouncedFn();
    debouncedFn();
    debouncedFn();

    // Should not have been called yet
    expect(mockFn).not.toHaveBeenCalled();

    // Wait for debounce delay
    await new Promise(resolve => setTimeout(resolve, 150));

    // Should have been called once
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to debounced function', async () => {
    const mockFn = vi.fn();
    const debouncedFn = Utils.debounce(mockFn, 50);

    debouncedFn('arg1', 'arg2');

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('Utils.logError', () => {
  it('should log errors with namespace and timestamp', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    Utils.logError('TestModule', 'Test error message', { detail: 'error data' });

    expect(consoleSpy).toHaveBeenCalled();
    const callArgs = consoleSpy.mock.calls[0];

    expect(callArgs[0]).toContain('[TestModule]');
    expect(callArgs[0]).toContain('Test error message');

    consoleSpy.mockRestore();
  });
});

describe('Utils.logWarn', () => {
  it('should log warnings with namespace', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    Utils.logWarn('TestModule', 'Test warning');

    expect(consoleSpy).toHaveBeenCalled();
    const callArgs = consoleSpy.mock.calls[0];

    expect(callArgs[0]).toContain('[TestModule]');
    expect(callArgs[0]).toContain('Test warning');

    consoleSpy.mockRestore();
  });
});
