const { getDb } = require('../setup');

const getUserProgress = (userId = 'default') => {
  const db = getDb();
  
  const completedLessons = db.prepare(`
    SELECT topic_id as topicId, lesson_id as lessonId, completed_at as completedAt
    FROM user_progress
    WHERE user_id = ? AND type = 'lesson'
  `).all(userId);
  
  const quizResults = db.prepare(`
    SELECT topic_id as topicId, correct_answers, total_questions, percentage, completed_at as completedAt
    FROM quiz_results
    WHERE user_id = ?
  `).all(userId);
  
  const stats = db.prepare(`
    SELECT total_points as totalPoints, level, badges
    FROM user_stats
    WHERE user_id = ?
  `).get(userId) || { totalPoints: 0, level: 1, badges: '[]' };
  
  return {
    completedLessons,
    quizResults: quizResults.map(r => ({
      topicId: r.topicId,
      score: {
        correct: r.correct_answers,
        total: r.total_questions
      },
      percentage: r.percentage,
      completedAt: r.completedAt
    })),
    totalPoints: stats.totalPoints,
    level: stats.level,
    badges: JSON.parse(stats.badges)
  };
};

const completeLesson = (userId = 'default', topicId, lessonId) => {
  const db = getDb();
  
  const existing = db.prepare(`
    SELECT id FROM user_progress 
    WHERE user_id = ? AND topic_id = ? AND lesson_id = ? AND type = 'lesson'
  `).get(userId, topicId, lessonId);
  
  if (existing) {
    return getUserProgress(userId);
  }
  
  db.prepare(`
    INSERT INTO user_progress (user_id, topic_id, lesson_id, completed_at, type)
    VALUES (?, ?, ?, ?, 'lesson')
  `).run(userId, topicId, lessonId, new Date().toISOString());
  
  db.prepare(`
    UPDATE user_stats 
    SET total_points = total_points + 10
    WHERE user_id = ?
  `).run(userId);
  
  updateLevel(userId);
  
  return getUserProgress(userId);
};

const saveQuizResult = (userId = 'default', topicId, score, percentage) => {
  const db = getDb();
  
  db.prepare(`
    INSERT INTO quiz_results (user_id, topic_id, correct_answers, total_questions, percentage, completed_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, topicId, score.correct, score.total, percentage, new Date().toISOString());
  
  const points = Math.round(percentage / 10);
  db.prepare(`
    UPDATE user_stats 
    SET total_points = total_points + ?
    WHERE user_id = ?
  `).run(points, userId);
  
  updateLevel(userId);
  updateBadges(userId, percentage);
  
  return {
    progress: getUserProgress(userId),
    pointsEarned: points
  };
};

const updateLevel = (userId) => {
  const db = getDb();
  const stats = db.prepare('SELECT total_points FROM user_stats WHERE user_id = ?').get(userId);
  const newLevel = Math.floor(stats.total_points / 100) + 1;
  
  db.prepare(`
    UPDATE user_stats 
    SET level = ?
    WHERE user_id = ?
  `).run(newLevel, userId);
};

const updateBadges = (userId, percentage) => {
  const db = getDb();
  const stats = db.prepare('SELECT badges FROM user_stats WHERE user_id = ?').get(userId);
  const badges = JSON.parse(stats.badges);
  
  if (percentage === 100 && !badges.includes('perfect-score')) {
    badges.push('perfect-score');
  }
  
  const lessonCount = db.prepare(`
    SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND type = 'lesson'
  `).get(userId).count;
  
  if (lessonCount >= 3 && !badges.includes('beginner')) {
    badges.push('beginner');
  }
  
  db.prepare(`
    UPDATE user_stats 
    SET badges = ?
    WHERE user_id = ?
  `).run(JSON.stringify(badges), userId);
};

const resetProgress = (userId = 'default') => {
  const db = getDb();
  
  db.prepare('DELETE FROM user_progress WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM quiz_results WHERE user_id = ?').run(userId);
  db.prepare(`
    UPDATE user_stats 
    SET total_points = 0, level = 1, badges = '[]'
    WHERE user_id = ?
  `).run(userId);
  
  return getUserProgress(userId);
};

module.exports = {
  getUserProgress,
  completeLesson,
  saveQuizResult,
  resetProgress
};
