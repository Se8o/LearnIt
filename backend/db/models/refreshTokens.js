const { getDb } = require('../setup');
const crypto = require('crypto');
const { config } = require('../../config/env');
const { TOKENS } = require('../../config/constants');
const { mapDbRow } = require('../../utils/db-helpers');

/**
 * Vytvoření refresh tokenu pro uživatele
 */
const createRefreshToken = (userId) => {
  const db = getDb();
  
  // Generovat náhodný token
  const token = crypto.randomBytes(40).toString('hex');
  
  // Vypočítat expiraci
  const expiresAt = new Date();
  const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
  const expiryDays = parseInt(refreshTokenExpiry.replace('d', '')) || TOKENS.REFRESH_TOKEN_DEFAULT_EXPIRY_DAYS;
  expiresAt.setDate(expiresAt.getDate() + expiryDays);
  
  // Uložit do databáze
  const stmt = db.prepare(`
    INSERT INTO refresh_tokens (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `);
  
  stmt.run(userId, token, expiresAt.toISOString());
  
  return token;
};

/**
 * Najít refresh token
 */
const findRefreshToken = (token) => {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM refresh_tokens 
    WHERE token = ? AND revoked = 0
  `).get(token);
};

/**
 * Ověřit platnost refresh tokenu
 */
const verifyRefreshToken = (token) => {
  const refreshToken = findRefreshToken(token);
  
  if (!refreshToken) {
    return { valid: false, userId: null };
  }
  
  const now = new Date();
  const expiresAt = new Date(refreshToken.expires_at);
  
  if (now > expiresAt) {
    return { valid: false, userId: null };
  }
  
  return { 
    valid: true, 
    userId: refreshToken.user_id 
  };
};

/**
 * Revokovat refresh token (odhlášení)
 */
const revokeRefreshToken = (token) => {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE refresh_tokens 
    SET revoked = 1 
    WHERE token = ?
  `);
  
  return stmt.run(token);
};

/**
 * Revokovat všechny refresh tokeny uživatele
 */
const revokeAllUserTokens = (userId) => {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE refresh_tokens 
    SET revoked = 1 
    WHERE user_id = ? AND revoked = 0
  `);
  
  return stmt.run(userId);
};

/**
 * Smazat expirované tokeny (cleanup)
 */
const deleteExpiredTokens = () => {
  const db = getDb();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    DELETE FROM refresh_tokens 
    WHERE expires_at < ? OR revoked = 1
  `);
  
  return stmt.run(now);
};

/**
 * Získat všechny aktivní tokeny uživatele
 */
const getUserActiveTokens = (userId) => {
  const db = getDb();
  const now = new Date().toISOString();
  
  const tokens = db.prepare(`
    SELECT id, created_at, expires_at 
    FROM refresh_tokens 
    WHERE user_id = ? AND revoked = 0 AND expires_at > ?
    ORDER BY created_at DESC
  `).all(userId, now);
  
  return tokens.map(mapDbRow);
};

module.exports = {
  createRefreshToken,
  findRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  deleteExpiredTokens,
  getUserActiveTokens
};
