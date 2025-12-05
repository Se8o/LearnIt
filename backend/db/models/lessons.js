const { getDb } = require('../setup');
const { mapDbRow, parseJsonField, mapTopicData } = require('../../utils/db-helpers');

/**
 * Get all lessons with topic information
 * @returns {Array<Object>} Array of lesson objects with parsed keyPoints and topic data
 */
const getAllLessons = () => {
  const db = getDb();
  const lessons = db.prepare(`
    SELECT l.*, t.title as topic_title, t.category, t.icon, t.color
    FROM lessons l
    LEFT JOIN topics t ON l.topic_id = t.id
  `).all();
  
  return lessons.map(lesson => {
    const mapped = mapDbRow(lesson);
    return {
      ...mapped,
      keyPoints: parseJsonField(lesson.key_points),
      topic: mapTopicData(lesson)
    };
  });
};

/**
 * Get lesson by topic ID with full topic information
 * @param {number} topicId - Topic ID
 * @returns {Object|null} Lesson object with parsed keyPoints and topic data, or null if not found
 */
const getLessonByTopicId = (topicId) => {
  const db = getDb();
  const lesson = db.prepare(`
    SELECT l.*, t.title as topic_title, t.category, t.description, t.difficulty, t.duration, t.icon, t.color
    FROM lessons l
    LEFT JOIN topics t ON l.topic_id = t.id
    WHERE l.topic_id = ?
  `).get(topicId);
  
  if (!lesson) return null;
  
  const mapped = mapDbRow(lesson);
  return {
    ...mapped,
    keyPoints: parseJsonField(lesson.key_points),
    topic: mapTopicData(lesson)
  };
};

/**
 * Create a new lesson
 * @param {Object} lesson - Lesson data
 * @param {number} lesson.topicId - Topic ID
 * @param {string} lesson.title - Lesson title
 * @param {string} lesson.content - Lesson content
 * @param {string} lesson.videoUrl - Video URL
 * @param {string} lesson.videoTitle - Video title
 * @param {number} lesson.estimatedTime - Estimated time in minutes
 * @param {Array<string>} lesson.keyPoints - Key learning points
 * @returns {number} ID of created lesson
 */
const createLesson = (lesson) => {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO lessons (topic_id, title, content, video_url, video_title, estimated_time, key_points)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    lesson.topicId,
    lesson.title,
    lesson.content,
    lesson.videoUrl,
    lesson.videoTitle,
    lesson.estimatedTime,
    JSON.stringify(lesson.keyPoints)
  );
  return result.lastInsertRowid;
};

module.exports = {
  getAllLessons,
  getLessonByTopicId,
  createLesson
};
