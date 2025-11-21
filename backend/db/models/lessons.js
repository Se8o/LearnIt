const { getDb } = require('../setup');

const getAllLessons = () => {
  const db = getDb();
  const lessons = db.prepare(`
    SELECT l.*, t.title as topic_title, t.category, t.icon, t.color
    FROM lessons l
    LEFT JOIN topics t ON l.topic_id = t.id
  `).all();
  
  return lessons.map(lesson => ({
    id: lesson.id,
    topicId: lesson.topic_id,
    title: lesson.title,
    content: lesson.content,
    videoUrl: lesson.video_url,
    videoTitle: lesson.video_title,
    estimatedTime: lesson.estimated_time,
    keyPoints: JSON.parse(lesson.key_points),
    topic: {
      id: lesson.topic_id,
      title: lesson.topic_title,
      category: lesson.category,
      icon: lesson.icon,
      color: lesson.color
    }
  }));
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
  
  return {
    id: lesson.id,
    topicId: lesson.topic_id,
    title: lesson.title,
    content: lesson.content,
    videoUrl: lesson.video_url,
    videoTitle: lesson.video_title,
    estimatedTime: lesson.estimated_time,
    keyPoints: JSON.parse(lesson.key_points),
    topic: {
      id: lesson.topic_id,
      title: lesson.topic_title,
      category: lesson.category,
      description: lesson.description,
      difficulty: lesson.difficulty,
      duration: lesson.duration,
      icon: lesson.icon,
      color: lesson.color
    }
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
