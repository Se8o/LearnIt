const { getDb } = require('../setup');
const { mapDbRow, parseJsonField, mapTopicData } = require('../../utils/db-helpers');

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
