const crypto = require('crypto');
const { getDb } = require('../../db/setup');
const RefreshToken = require('../../db/models/refreshTokens');
const { createUser } = require('../../db/models/users');

describe('RefreshToken Model', () => {
  let db;
  let testUser;

  beforeAll(() => {
    db = getDb();
  });

  beforeEach(async () => {
    // Clean tables before each test
    db.prepare('DELETE FROM refresh_tokens').run();
    db.prepare('DELETE FROM user_stats').run();
    db.prepare('DELETE FROM users').run();
    
    // Create test user
    testUser = await createUser('test@example.com', 'password123', 'Test User');
  });

  describe('createRefreshToken', () => {
    test('should create refresh token for user', () => {
      const token = RefreshToken.createRefreshToken(testUser.id);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(80); // 40 bytes = 80 hex characters
    });

    test('should create unique tokens', () => {
      const token1 = RefreshToken.createRefreshToken(testUser.id);
      const token2 = RefreshToken.createRefreshToken(testUser.id);

      expect(token1).not.toBe(token2);
    });

    test('should set expiry date', () => {
      const token = RefreshToken.createRefreshToken(testUser.id);
      
      const stored = RefreshToken.findRefreshToken(token);
      expect(stored).toBeDefined();
      expect(new Date(stored.expires_at)).toBeInstanceOf(Date);
    });
  });

  describe('findRefreshToken', () => {
    test('should find existing token', () => {
      const token = RefreshToken.createRefreshToken(testUser.id);

      const found = RefreshToken.findRefreshToken(token);

      expect(found).toBeDefined();
      expect(found.token).toBe(token);
      expect(found.user_id).toBe(testUser.id);
    });

    test('should return undefined for non-existent token', () => {
      const found = RefreshToken.findRefreshToken('nonexistent-token');
      expect(found).toBeUndefined();
    });
  });

  describe('verifyRefreshToken', () => {
    test('should verify valid token', () => {
      const token = RefreshToken.createRefreshToken(testUser.id);

      const result = RefreshToken.verifyRefreshToken(token);

      expect(result.valid).toBe(true);
      expect(result.userId).toBe(testUser.id);
    });

    test('should reject non-existent token', () => {
      const result = RefreshToken.verifyRefreshToken('nonexistent');

      expect(result.valid).toBe(false);
      expect(result.userId).toBeNull();
    });

    test('should reject revoked token', () => {
      const token = RefreshToken.createRefreshToken(testUser.id);
      RefreshToken.revokeRefreshToken(token);

      const result = RefreshToken.verifyRefreshToken(token);

      expect(result.valid).toBe(false);
    });

    test('should reject expired token', () => {
      const token = RefreshToken.createRefreshToken(testUser.id);
      
      // Manually expire the token
      db.prepare(
        "UPDATE refresh_tokens SET expires_at = datetime('now', '-1 day') WHERE token = ?"
      ).run(token);

      const result = RefreshToken.verifyRefreshToken(token);

      expect(result.valid).toBe(false);
    });
  });

  describe('revokeRefreshToken', () => {
    test('should revoke token', () => {
      const token = RefreshToken.createRefreshToken(testUser.id);

      RefreshToken.revokeRefreshToken(token);

      // Token should now be invalid
      const result = RefreshToken.verifyRefreshToken(token);
      expect(result.valid).toBe(false);
    });

    test('should not throw for non-existent token', () => {
      expect(() => {
        RefreshToken.revokeRefreshToken('nonexistent');
      }).not.toThrow();
    });
  });

  describe('revokeAllUserTokens', () => {
    test('should revoke all user tokens', () => {
      const token1 = RefreshToken.createRefreshToken(testUser.id);
      const token2 = RefreshToken.createRefreshToken(testUser.id);

      RefreshToken.revokeAllUserTokens(testUser.id);

      expect(RefreshToken.verifyRefreshToken(token1).valid).toBe(false);
      expect(RefreshToken.verifyRefreshToken(token2).valid).toBe(false);
    });

    test('should not affect other users tokens', async () => {
      const user2 = await createUser('user2@example.com', 'password123', 'User 2');
      
      const token1 = RefreshToken.createRefreshToken(testUser.id);
      const token2 = RefreshToken.createRefreshToken(user2.id);

      RefreshToken.revokeAllUserTokens(testUser.id);

      expect(RefreshToken.verifyRefreshToken(token1).valid).toBe(false);
      expect(RefreshToken.verifyRefreshToken(token2).valid).toBe(true);
    });
  });

  describe('deleteExpiredTokens', () => {
    test('should delete expired tokens', () => {
      const token1 = RefreshToken.createRefreshToken(testUser.id);
      
      // Create expired token
      db.prepare(
        `INSERT INTO refresh_tokens (user_id, token, expires_at) 
         VALUES (?, ?, datetime('now', '-1 day'))`
      ).run(testUser.id, 'expired-token');

      RefreshToken.deleteExpiredTokens();

      expect(RefreshToken.findRefreshToken(token1)).toBeDefined();
      expect(RefreshToken.findRefreshToken('expired-token')).toBeUndefined();
    });
  });

  describe('getUserActiveTokens', () => {
    test('should return all active tokens for user', () => {
      RefreshToken.createRefreshToken(testUser.id);
      RefreshToken.createRefreshToken(testUser.id);

      const tokens = RefreshToken.getUserActiveTokens(testUser.id);

      expect(tokens).toHaveLength(2);
    });

    test('should not include revoked tokens', () => {
      const token1 = RefreshToken.createRefreshToken(testUser.id);
      RefreshToken.createRefreshToken(testUser.id);
      
      RefreshToken.revokeRefreshToken(token1);

      const tokens = RefreshToken.getUserActiveTokens(testUser.id);

      expect(tokens).toHaveLength(1);
    });

    test('should not include expired tokens', () => {
      RefreshToken.createRefreshToken(testUser.id);
      
      db.prepare(
        `INSERT INTO refresh_tokens (user_id, token, expires_at) 
         VALUES (?, ?, datetime('now', '-1 day'))`
      ).run(testUser.id, 'expired-token');

      const tokens = RefreshToken.getUserActiveTokens(testUser.id);

      expect(tokens).toHaveLength(1);
    });
  });
});
