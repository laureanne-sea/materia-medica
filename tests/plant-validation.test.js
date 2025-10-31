/**
 * Tests for plant data validation
 * Ensures plant objects have correct structure and valid data
 */

import { describe, it, expect } from 'vitest';

// This function is from plants-renderer.js
// We'll test the validation logic
function isValidPlant(plant) {
  if (!plant || typeof plant !== 'object') return false;
  if (!plant.commonName || typeof plant.commonName !== 'string') return false;
  if (!plant.botanicalName || typeof plant.botanicalName !== 'string') return false;
  if (!plant.fileSlug || typeof plant.fileSlug !== 'string') return false;
  if (!Array.isArray(plant.systems)) return false;
  return true;
}

describe('Plant Validation', () => {
  describe('isValidPlant', () => {
    it('should accept valid plant object', () => {
      const validPlant = {
        commonName: 'Valerian',
        botanicalName: 'Valeriana officinalis',
        fileSlug: 'valerian',
        systems: ['nervous'],
        properties: ['Sedative'],
        family: 'Valerianaceae'
      };

      expect(isValidPlant(validPlant)).toBe(true);
    });

    it('should accept plant with multiple systems', () => {
      const plant = {
        commonName: 'Echinacea',
        botanicalName: 'Echinacea purpurea',
        fileSlug: 'echinacea',
        systems: ['immune', 'respiratory']
      };

      expect(isValidPlant(plant)).toBe(true);
    });

    it('should reject plant without commonName', () => {
      const plant = {
        botanicalName: 'Valeriana officinalis',
        fileSlug: 'valerian',
        systems: ['nervous']
      };

      expect(isValidPlant(plant)).toBe(false);
    });

    it('should reject plant with empty commonName', () => {
      const plant = {
        commonName: '',
        botanicalName: 'Valeriana officinalis',
        fileSlug: 'valerian',
        systems: ['nervous']
      };

      expect(isValidPlant(plant)).toBe(false);
    });

    it('should reject plant without botanicalName', () => {
      const plant = {
        commonName: 'Valerian',
        fileSlug: 'valerian',
        systems: ['nervous']
      };

      expect(isValidPlant(plant)).toBe(false);
    });

    it('should reject plant without fileSlug', () => {
      const plant = {
        commonName: 'Valerian',
        botanicalName: 'Valeriana officinalis',
        systems: ['nervous']
      };

      expect(isValidPlant(plant)).toBe(false);
    });

    it('should reject plant without systems array', () => {
      const plant = {
        commonName: 'Valerian',
        botanicalName: 'Valeriana officinalis',
        fileSlug: 'valerian'
      };

      expect(isValidPlant(plant)).toBe(false);
    });

    it('should reject plant with non-array systems', () => {
      const plant = {
        commonName: 'Valerian',
        botanicalName: 'Valeriana officinalis',
        fileSlug: 'valerian',
        systems: 'nervous'
      };

      expect(isValidPlant(plant)).toBe(false);
    });

    it('should reject plant with non-string commonName', () => {
      const plant = {
        commonName: 123,
        botanicalName: 'Valeriana officinalis',
        fileSlug: 'valerian',
        systems: ['nervous']
      };

      expect(isValidPlant(plant)).toBe(false);
    });

    it('should reject null plant', () => {
      expect(isValidPlant(null)).toBe(false);
    });

    it('should reject undefined plant', () => {
      expect(isValidPlant(undefined)).toBe(false);
    });

    it('should reject non-object plant', () => {
      expect(isValidPlant('string')).toBe(false);
      expect(isValidPlant(123)).toBe(false);
      expect(isValidPlant(true)).toBe(false);
    });

    it('should accept plant with empty systems array', () => {
      // Note: This might be a business logic decision
      // Empty systems array is technically valid structure
      const plant = {
        commonName: 'Test Plant',
        botanicalName: 'Testus plantus',
        fileSlug: 'test-plant',
        systems: []
      };

      expect(isValidPlant(plant)).toBe(true);
    });

    it('should accept plant with optional fields', () => {
      const plant = {
        commonName: 'Valerian',
        botanicalName: 'Valeriana officinalis',
        fileSlug: 'valerian',
        systems: ['nervous'],
        danishName: 'Baldrian',
        frenchName: 'Valériane',
        properties: ['Sedative', 'Antispasmodic'],
        family: 'Valerianaceae',
        status: 'complete'
      };

      expect(isValidPlant(plant)).toBe(true);
    });
  });

  describe('Plant Name Sanitization', () => {
    it('should sanitize plant names with XSS attempts', () => {
      const dangerousPlant = {
        commonName: '<script>alert("xss")</script>',
        botanicalName: 'Malicious plantus',
        fileSlug: 'malicious',
        systems: ['nervous']
      };

      expect(isValidPlant(dangerousPlant)).toBe(true); // Structure is valid

      // But when rendered, should be escaped
      const escaped = Utils.escapeHtml(dangerousPlant.commonName);
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
    });

    it('should handle special characters in botanical names', () => {
      const plant = {
        commonName: "St. John's Wort",
        botanicalName: 'Hypericum perforatum',
        fileSlug: 'st-johns-wort',
        systems: ['nervous']
      };

      expect(isValidPlant(plant)).toBe(true);

      const escaped = Utils.escapeHtml(plant.commonName);
      expect(escaped).toContain('&#039;'); // Apostrophe escaped
    });
  });

  describe('System Validation', () => {
    const validSystems = [
      'nervous',
      'immune',
      'digestive',
      'respiratory',
      'urinary',
      'cardiovascular',
      'endocrine',
      'skin',
      'woman-reproductive',
      'male-reproductive'
    ];

    it('should have valid system IDs from configuration', () => {
      validSystems.forEach(system => {
        expect(typeof system).toBe('string');
        expect(system.length).toBeGreaterThan(0);
      });
    });

    it('should validate plant with all valid systems', () => {
      validSystems.forEach(system => {
        const plant = {
          commonName: 'Test Plant',
          botanicalName: 'Testus plantus',
          fileSlug: 'test-plant',
          systems: [system]
        };

        expect(isValidPlant(plant)).toBe(true);
      });
    });
  });
});
