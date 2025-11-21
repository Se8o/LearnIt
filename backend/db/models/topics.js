const { getDb } = require('../setup');

const getAllTopics = () => {
  const db = getDb();
  return db.prepare('SELECT * FROM topics').all();
};

const getTopicById = (id) => {
  const db = getDb();
  return db.prepare('SELECT * FROM topics WHERE id = ?').get(id);
};

const getTopicsByCategory = (category) => {
  const db = getDb();
  return db.prepare('SELECT * FROM topics WHERE LOWER(category) = LOWER(?)').all(category);
};

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
