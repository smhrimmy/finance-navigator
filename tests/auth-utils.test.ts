import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, generateToken, verifyToken } from '../api/lib/auth-utils';

describe('Authentication Utilities', () => {
  it('should hash a password correctly', async () => {
    const password = 'mySecurePassword123';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash).toHaveLength(60); // bcrypt hash length
  });

  it('should verify a correct password', async () => {
    const password = 'password123';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const password = 'password123';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword('wrongpassword', hash);
    expect(isValid).toBe(false);
  });

  it('should generate and verify a JWT token', () => {
    const userId = 'user_12345';
    const token = generateToken(userId);
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(userId);
  });

  it('should return null for invalid token', () => {
    const invalidToken = 'invalid.token.string';
    const decoded = verifyToken(invalidToken);
    expect(decoded).toBeNull();
  });
});
