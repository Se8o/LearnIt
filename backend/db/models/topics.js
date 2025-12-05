const { getDb } = require('../setup');

/**
 * Get all topics
 * @returns {Array<Object>} Array of topic objects
 */
const getAllTopics = () => {
  const db = getDb();
  return db.prepare('SELECT * FROM topics').all();
};

/**
 * Get topic by ID
 * @param {number} id - Topic ID
 * @returns {Object|undefined} Topic object or undefined if not found
 */
const getTopicById = (id) => {
  const db = getDb();
  return db.prepare('SELECT * FROM topics WHERE id = ?').get(id);
};

/**
 * Get topics by category (case-insensitive)
 * @param {string} category - Category name
 * @returns {Array<Object>} Array of topic objects
 */
const getTopicsByCategory = (category) => {
  const db = getDb();
  return db.prepare('SELECT * FROM topics WHERE LOWER(category) = LOWER(?)').all(category);
};

/**
 * Create a new topic
 * @param {Object} topic - Topic data
 * @param {string} topic.title - Topic title
 * @param {string} topic.category - Category name
 * @param {string} topic.description - Topic description
 * @param {string} topic.difficulty - Difficulty level
 * @param {string} topic.duration - Duration estimate
 * @param {string} [topic.icon] - Icon name
 * @param {string} topic.color - Color code
 * @returns {number} ID of created topic
 */
const createTopic = (topic) => {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO topics (title, category, description, difficulty, duration, icon, color)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    topic.title,
    topic.category,
    topic.description,
    topic.difficulty,
    topic.duration,
    topic.icon || '',
    topic.color
  );
  return result.lastInsertRowid;
};

module.exports = {
  getAllTopics,
  getTopicById,
  getTopicsByCategory,
  createTopic
};
