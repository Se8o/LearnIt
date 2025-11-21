const { getDb } = require('../setup');
const bcrypt = require('bcryptjs');
const { AppError } = require('../../middleware/errorHandler');

const createUser = async (email, password, name) => {
  const db = getDb();
  
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingUser) {
    throw new AppError('Tento email je již zaregistrován', 409);
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  const stmt = db.prepare(`
    INSERT INTO users (email, password_hash, name, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const now = new Date().toISOString();
  const result = stmt.run(email, passwordHash, name, now, now);
  const userId = result.lastInsertRowid;
  
  db.prepare(`
    INSERT INTO user_stats (user_id, total_points, level, badges)
    VALUES (?, 0, 1, '[]')
  `).run(String(userId));
  
  return {
    id: userId,
    email,
    name,
    createdAt: now
  };
};

const getUserByEmail = (email) => {
  const db = getDb();
  return db.prepare(`
    SELECT id, email, password_hash as passwordHash, name, created_at as createdAt
    FROM users 
    WHERE email = ?
  `).get(email);
};

const getUserById = (id) => {
  const db = getDb();
  return db.prepare(`
    SELECT id, email, name, created_at as createdAt
    FROM users 
    WHERE id = ?
  `).get(id);
};

const validatePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const updateUser = (id, updates) => {
  const db = getDb();
  const { name } = updates;
  
  const stmt = db.prepare(`
    UPDATE users 
    SET name = ?, updated_at = ?
    WHERE id = ?
  `);
  
  stmt.run(name, new Date().toISOString(), id);
  return getUserById(id);
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  validatePassword,
  updateUser
};
