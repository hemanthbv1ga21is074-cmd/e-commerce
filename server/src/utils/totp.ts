import crypto from 'crypto';

// RFC 4648 Base32 alphabet
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

export function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) {
      throw new Error(`Invalid Base32 character: ${cleaned[i]}`);
    }
    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generate a cryptographically secure Base32 secret for TOTP (160-bit key)
 */
export function generateTotpSecret(email: string, issuer = 'StyleBazaar Admin'): { secret: string; otpauthUrl: string } {
  const randomBytes = crypto.randomBytes(20);
  const secret = base32Encode(randomBytes);
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  const otpauthUrl = `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;

  return { secret, otpauthUrl };
}

/**
 * Calculate TOTP code for a given timestamp counter
 */
export function calculateTotpCode(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter), 0);

  const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const codeInt =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const code = (codeInt % 1000000).toString().padStart(6, '0');
  return code;
}

/**
 * Verify a 6-digit TOTP code with time drift window (default ±1 period = 30 seconds)
 */
export function verifyTotp(token: string, secret: string, windowSteps = 1): boolean {
  if (!token || !secret) return false;
  const sanitizedToken = token.trim();
  if (sanitizedToken.length !== 6 || !/^\d{6}$/.test(sanitizedToken)) return false;

  const currentCounter = Math.floor(Date.now() / 1000 / 30);

  for (let offset = -windowSteps; offset <= windowSteps; offset++) {
    const expected = calculateTotpCode(secret, currentCounter + offset);
    if (crypto.timingSafeEqual(Buffer.from(sanitizedToken), Buffer.from(expected))) {
      return true;
    }
  }

  return false;
}

/**
 * Hash a sensitive string (token, backup code, session key) using SHA-256
 */
export function hashSha256(value: string): string {
  return crypto.createHash('sha256').update(value.trim()).digest('hex');
}

/**
 * Generate 10 single-use 8-character backup codes formatted as XXXX-XXXX
 */
export function generateBackupCodes(count = 10): { rawCodes: string[]; hashedCodes: string[] } {
  const rawCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const formatted = `${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
    rawCodes.push(formatted);
    hashedCodes.push(hashSha256(formatted));
  }

  return { rawCodes, hashedCodes };
}

/**
 * Verify and consume a backup code against an array of hashed backup codes
 */
export function verifyAndConsumeBackupCode(
  rawCode: string,
  hashedCodes: string[]
): { valid: boolean; remainingHashedCodes: string[] } {
  const normalized = rawCode.trim().toUpperCase();
  const targetHash = hashSha256(normalized);

  const index = hashedCodes.findIndex((h) => h === targetHash);
  if (index === -1) {
    return { valid: false, remainingHashedCodes: hashedCodes };
  }

  const remaining = [...hashedCodes];
  remaining.splice(index, 1);
  return { valid: true, remainingHashedCodes: remaining };
}
