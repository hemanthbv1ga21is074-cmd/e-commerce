import { describe, it, expect } from 'vitest';
import {
  generateTotpSecret,
  calculateTotpCode,
  verifyTotp,
  generateBackupCodes,
  verifyAndConsumeBackupCode,
  hashSha256,
} from '../utils/totp.js';

describe('TOTP and 2FA Utilities', () => {
  it('generates valid TOTP secret and verifies accurate codes', () => {
    const { secret, otpauthUrl } = generateTotpSecret('admin@stylebazaar.com');
    expect(secret).toHaveLength(32);
    expect(otpauthUrl).toContain('otpauth://totp/');
    expect(otpauthUrl).toContain('secret=' + secret);

    const currentCounter = Math.floor(Date.now() / 1000 / 30);
    const code = calculateTotpCode(secret, currentCounter);
    expect(code).toHaveLength(6);

    // Valid code verification
    expect(verifyTotp(code, secret)).toBe(true);

    // Invalid code verification
    const invalidCode = code === '000000' ? '999999' : '000000';
    expect(verifyTotp(invalidCode, secret)).toBe(false);
  });

  it('generates and consumes single-use backup codes', () => {
    const { rawCodes, hashedCodes } = generateBackupCodes(10);
    expect(rawCodes).toHaveLength(10);
    expect(hashedCodes).toHaveLength(10);

    const firstCode = rawCodes[0];
    const result1 = verifyAndConsumeBackupCode(firstCode, hashedCodes);
    expect(result1.valid).toBe(true);
    expect(result1.remainingHashedCodes).toHaveLength(9);

    // Cannot reuse the same code
    const result2 = verifyAndConsumeBackupCode(firstCode, result1.remainingHashedCodes);
    expect(result2.valid).toBe(false);
    expect(result2.remainingHashedCodes).toHaveLength(9);
  });
});
