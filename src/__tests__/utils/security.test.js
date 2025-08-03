import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  sanitizeExpenseData,
  sanitizeBudgetData,
  isValidEmail,
  isValidAmount,
  isValidDate,
  isRateLimited
} from '../../utils/security';

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('removes HTML tags from input', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello';
      const result = sanitizeInput(maliciousInput);
      expect(result).toBe('Hello');
    });

    it('trims whitespace', () => {
      const input = '  Hello World  ';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello World');
    });

    it('handles non-string input', () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
    });
  });

  describe('sanitizeExpenseData', () => {
    it('sanitizes expense data correctly', () => {
      const expense = {
        description: '<script>alert("xss")</script>Lunch',
        category: '  Food  ',
        amount: '25.50',
        notes: 'Some <b>notes</b>'
      };

      const result = sanitizeExpenseData(expense);
      
      expect(result.description).toBe('Lunch');
      expect(result.category).toBe('Food');
      expect(result.amount).toBe(25.50);
      expect(result.notes).toBe('Some notes');
    });

    it('handles missing fields', () => {
      const expense = {};
      const result = sanitizeExpenseData(expense);
      
      expect(result.description).toBe('');
      expect(result.category).toBe('');
      expect(result.amount).toBe(0);
      expect(result.notes).toBe('');
      expect(result.date).toBeDefined();
    });
  });

  describe('sanitizeBudgetData', () => {
    it('sanitizes budget data correctly', () => {
      const budget = {
        category: '  Entertainment  ',
        amount: '100.00',
        name: '<script>Budget</script>Monthly Budget',
        description: 'Budget for <b>entertainment</b>'
      };

      const result = sanitizeBudgetData(budget);
      
      expect(result.category).toBe('Entertainment');
      expect(result.amount).toBe(100);
      expect(result.name).toBe('Monthly Budget');
      expect(result.description).toBe('Budget for entertainment');
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test.example.com')).toBe(false);
    });
  });

  describe('isValidAmount', () => {
    it('validates correct amounts', () => {
      expect(isValidAmount('25.50')).toBe(true);
      expect(isValidAmount('0')).toBe(true);
      expect(isValidAmount('1000')).toBe(true);
      expect(isValidAmount(25.50)).toBe(true);
    });

    it('rejects invalid amounts', () => {
      expect(isValidAmount('-10')).toBe(false);
      expect(isValidAmount('abc')).toBe(false);
      expect(isValidAmount('1000000000')).toBe(false); // Too large
    });
  });

  describe('isValidDate', () => {
    it('validates correct dates', () => {
      expect(isValidDate('2023-12-25')).toBe(true);
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate('December 25, 2023')).toBe(true);
    });

    it('rejects invalid dates', () => {
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate('2023-13-25')).toBe(false);
      expect(isValidDate('')).toBe(false);
    });
  });

  describe('isRateLimited', () => {
    it('allows requests within rate limit', () => {
      const key = 'test-key-1';
      expect(isRateLimited(key, 5, 60000)).toBe(false);
      expect(isRateLimited(key, 5, 60000)).toBe(false);
    });

    it('blocks requests exceeding rate limit', () => {
      const key = 'test-key-2';
      
      // Make requests up to the limit
      for (let i = 0; i < 3; i++) {
        expect(isRateLimited(key, 3, 60000)).toBe(false);
      }
      
      // Next request should be rate limited
      expect(isRateLimited(key, 3, 60000)).toBe(true);
    });
  });
}); 