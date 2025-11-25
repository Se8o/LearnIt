const { getDb } = require('../setup');

/**
 * Get user progress
 * @param {string|number} userId - User ID (auto-converted to string for SQLite)
 */
const getUserProgress = (userId = 'default') => {
  // Ensure userId is string for consistent database queries
  userId = String(userId);
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
    SELECT total_points as totalPoints, level, badges, current_streak as currentStreak, 
           longest_streak as longestStreak, last_activity_date as lastActivityDate,
           perfect_quiz_streak as perfectQuizStreak
    FROM user_stats
    WHERE user_id = ?
  `).get(userId) || { 
    totalPoints: 0, level: 1, badges: '[]', currentStreak: 0, 
    longestStreak: 0, lastActivityDate: null, perfectQuizStreak: 0 
  };
  
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
    badges: JSON.parse(stats.badges),
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    lastActivityDate: stats.lastActivityDate,
    perfectQuizStreak: stats.perfectQuizStreak
  };
};

const updateStreak = (userId) => {
  userId = String(userId);
  const db = getDb();
  const stats = db.prepare('SELECT last_activity_date, current_streak, longest_streak FROM user_stats WHERE user_id = ?').get(userId);
  
  const today = new Date().toISOString().split('T')[0];
  const lastActivity = stats.last_activity_date;
  
  let newStreak = stats.current_streak;
  let bonusPoints = 0;
  
  if (!lastActivity || lastActivity !== today) {
    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
        bonusPoints = Math.min(newStreak * 2, 20); // Max 20 bonus points
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }
    
    const newLongestStreak = Math.max(newStreak, stats.longest_streak);
    
    db.prepare(`
      UPDATE user_stats 
      SET current_streak = ?, longest_streak = ?, last_activity_date = ?, total_points = total_points + ?
      WHERE user_id = ?
    `).run(newStreak, newLongestStreak, today, bonusPoints, userId);
    
    updateBadges(userId);
  }
};

/**
 * Complete a lesson
 * @param {string|number} userId - User ID (auto-converted to string for SQLite)
 */
const completeLesson = (userId = 'default', topicId, lessonId) => {
  userId = String(userId);
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
  
  updateStreak(userId);
  updateLevel(userId);
  
  return getUserProgress(userId);
};

/**
 * Save quiz result
 * @param {string|number} userId - User ID (auto-converted to string for SQLite)
 */
const saveQuizResult = (userId = 'default', topicId, score, percentage) => {
  userId = String(userId);
  const db = getDb();
  
  db.prepare(`
    INSERT INTO quiz_results (user_id, topic_id, correct_answers, total_questions, percentage, completed_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, topicId, score.correct, score.total, percentage, new Date().toISOString());
  
  const points = Math.round(percentage / 10);
  
  // Update perfect quiz streak
  if (percentage === GAMIFICATION.PERFECT_SCORE) {
    db.prepare(`
      UPDATE user_stats 
      SET total_points = total_points + ?, perfect_quiz_streak = perfect_quiz_streak + 1
      WHERE user_id = ?
    `).run(points, userId);
  } else {
    db.prepare(`
      UPDATE user_stats 
      SET total_points = total_points + ?, perfect_quiz_streak = 0
      WHERE user_id = ?
    `).run(points, userId);
  }
  
  updateStreak(userId);
  updateLevel(userId);
  updateBadges(userId, percentage);
  
  return {
    progress: getUserProgress(userId),
    pointsEarned: points
  };
};

const updateLevel = (userId) => {
  userId = String(userId);
  const db = getDb();
  const stats = db.prepare('SELECT total_points FROM user_stats WHERE user_id = ?').get(userId);
  const newLevel = Math.floor(stats.total_points / GAMIFICATION.POINTS_PER_LEVEL) + 1;
  
  db.prepare(`
    UPDATE user_stats 
    SET level = ?
    WHERE user_id = ?
  `).run(newLevel, userId);
};

const updateBadges = (userId, percentage = null) => {
  userId = String(userId);
  const db = getDb();
  const stats = db.prepare('SELECT badges, current_streak, perfect_quiz_streak FROM user_stats WHERE user_id = ?').get(userId);
  const badges = JSON.parse(stats.badges);
  let newBadges = false;
  
  // Perfect Score - 100% v kvízu
  if (percentage === GAMIFICATION.PERFECT_SCORE && !badges.includes('perfect-score')) {
    badges.push('perfect-score');
    newBadges = true;
  }
  
  // Beginner - 3 dokončené lekce
  const lessonCount = db.prepare(`
    SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND type = 'lesson'
  `).get(userId).count;
  
  if (lessonCount >= 3 && !badges.includes('beginner')) {
    badges.push('beginner');
    newBadges = true;
  }
  
  // Bookworm - 20 dokončených lekcí
  if (lessonCount >= 20 && !badges.includes('bookworm')) {
    badges.push('bookworm');
    newBadges = true;
  }
  
  // Week Warrior - 7 dní v řadě
  if (stats.current_streak >= GAMIFICATION.STREAK.WEEK_WARRIOR_DAYS && !badges.includes('week-warrior')) {
    badges.push('week-warrior');
    newBadges = true;
  }
  
  // Quiz Master - 10 perfektních kvízů (celkem)
  const perfectQuizCount = db.prepare(`
    SELECT COUNT(*) as count FROM quiz_results WHERE user_id = ? AND percentage = ?
  `).get(userId, GAMIFICATION.PERFECT_SCORE).count;
  
  if (perfectQuizCount >= 10 && !badges.includes('quiz-master')) {
    badges.push('quiz-master');
    newBadges = true;
  }
  
  // Perfectionist - 5 perfektních kvízů v řadě
  if (stats.perfect_quiz_streak >= 5 && !badges.includes('perfectionist')) {
    badges.push('perfectionist');
    newBadges = true;
  }
  
  // All Topics - Alespoň 1 lekce z každé kategorie
  const categories = db.prepare(`
    SELECT DISTINCT t.category
    FROM user_progress up
    JOIN topics t ON up.topic_id = t.id
    WHERE up.user_id = ? AND up.type = 'lesson'
  `).all(userId);
  
  const totalCategories = db.prepare('SELECT COUNT(DISTINCT category) as count FROM topics').get().count;
  
  if (categories.length >= totalCategories && totalCategories > 0 && !badges.includes('all-topics')) {
    badges.push('all-topics');
    newBadges = true;
  }
  
  if (newBadges) {
    db.prepare(`
      UPDATE user_stats 
      SET badges = ?
      WHERE user_id = ?
    `).run(JSON.stringify(badges), userId);
  }
};

/**
 * Reset user progress
 * @param {string|number} userId - User ID (auto-converted to string for SQLite)
 */
const resetProgress = (userId = 'default') => {
  userId = String(userId);
  const db = getDb();
  
  db.prepare('DELETE FROM user_progress WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM quiz_results WHERE user_id = ?').run(userId);
  db.prepare(`
    UPDATE user_stats 
    SET total_points = 0, level = 1, badges = '[]', current_streak = 0, 
        longest_streak = 0, last_activity_date = NULL, perfect_quiz_streak = 0
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
