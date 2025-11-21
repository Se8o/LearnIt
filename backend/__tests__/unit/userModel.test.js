const bcrypt = require('bcryptjs');
const { getDb } = require('../../db/setup');
const { createUser, getUserByEmail, getUserById, validatePassword, updateUser } = require('../../db/models/users');

describe('User Model', () => {
  let db;
  
  beforeAll(() => {
    db = getDb();
  });
  
  beforeEach(() => {
    // Clean users table before each test
    db.prepare('DELETE FROM users').run();
  });

  describe('create', () => {
    test('should create user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const user = await createUser(userData.email, userData.password, userData.name);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.createdAt).toBeDefined();
      
      // Verify password is hashed in database
      const dbUser = getUserByEmail(userData.email);
      expect(dbUser.passwordHash).toBeDefined();
      expect(dbUser.passwordHash).not.toBe(userData.password);
      const isMatch = await bcrypt.compare(userData.password, dbUser.passwordHash);
      expect(isMatch).toBe(true);
    });

    test('should throw error for duplicate email', async () => {
      await createUser('test@example.com', 'password123', 'Test User');

      await expect(
        createUser('test@example.com', 'password456', 'Another User')
      ).rejects.toThrow();
    });

    test('should throw error for missing fields', async () => {
      await expect(createUser('', 'password', 'name')).rejects.toThrow();
      await expect(createUser('email@test.com', '', 'name')).rejects.toThrow();
      await expect(createUser('email@test.com', 'password', '')).rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    test('should find user by email', async () => {
      const email = 'test@example.com';
      await createUser(email, 'password123', 'Test User');

      const user = getUserByEmail(email);

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
    });

    test('should return undefined for non-existent email', () => {
      const user = getUserByEmail('nonexistent@example.com');
      expect(user).toBeUndefined();
    });

    test('should be case-insensitive', async () => {
      await createUser('Test@Example.com', 'password123', 'Test User');

      const user = getUserByEmail('test@example.com');
      expect(user).toBeDefined();
    });
  });

  describe('findById', () => {
    test('should find user by id', async () => {
      const created = await createUser('test@example.com', 'password123', 'Test User');

      const user = getUserById(created.id);

      expect(user).toBeDefined();
      expect(user.id).toBe(created.id);
      expect(user.email).toBe(created.email);
    });

    test('should return undefined for non-existent id', () => {
      const user = getUserById(99999);
      expect(user).toBeUndefined();
    });
  });

  describe('verifyPassword', () => {
    test('should verify correct password', async () => {
      const password = 'password123';
      await createUser('test@example.com', password, 'Test User');
      const user = getUserByEmail('test@example.com');

      const isValid = await validatePassword(password, user.passwordHash);

      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      await createUser('test@example.com', 'password123', 'Test User');
      const user = getUserByEmail('test@example.com');

      const isValid = await validatePassword('wrongpassword', user.passwordHash);

      expect(isValid).toBe(false);
    });
  });

  describe('updateProfile', () => {
    test('should update user name', async () => {
      const user = await createUser('test@example.com', 'password123', 'Test User');

      const updated = updateUser(user.id, { name: 'Updated Name' });

      expect(updated).toBeDefined();
      expect(updated.name).toBe('Updated Name');
      expect(updated.email).toBe(user.email);
    });

    test('should throw error for non-existent user', () => {
      expect(() => updateUser(99999, { name: 'New Name' })).toThrow();
    });

    test('should throw error for empty name', () => {
      expect(() => updateUser(1, { name: '' })).toThrow();
    });
  });
});
