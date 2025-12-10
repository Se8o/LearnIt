const { getDb } = require('../setup');
const { GAMIFICATION } = require('../../config/constants');

/**
 * Get user progress
 * @param {string|number} userId - User ID (auto-converted to string for SQLite)
 * @returns {Object} Complete user progress data
 */
const getUserProgress = (userId = 'default') => {
  // Ensure userId is string for consistent database queries
  userId = String(userId);
  const db = getDb();
  
  // Optimized: Single query to get all progress data
  // Using UNION ALL to combine lessons, quizzes, and stats in one database round-trip
  const result = db.prepare(`
    -- Get completed lessons
    SELECT 
      'lesson' as data_type,
      topic_id as topicId, 
      lesson_id as lessonId, 
      completed_at as completedAt,
      NULL as correct_answers,
      NULL as total_questions,
      NULL as percentage
    FROM user_progress
    WHERE user_id = ? AND type = 'lesson'
    
    UNION ALL
    
    -- Get quiz results
    SELECT 
      'quiz' as data_type,
      topic_id as topicId,
      NULL as lessonId,
      completed_at as completedAt,
      correct_answers,
      total_questions,
      percentage
    FROM quiz_results
    WHERE user_id = ?
  `).all(userId, userId);
  
  // Get user stats separately (single row, less data)
  const stats = db.prepare(`
    SELECT 
      total_points as totalPoints, 
      level, 
      badges, 
      current_streak as currentStreak, 
      longest_streak as longestStreak, 
      last_activity_date as lastActivityDate,
      perfect_quiz_streak as perfectQuizStreak
    FROM user_stats
    WHERE user_id = ?
  `).get(userId) || { 
    totalPoints: 0, level: 1, badges: '[]', currentStreak: 0, 
    longestStreak: 0, lastActivityDate: null, perfectQuizStreak: 0 
  };
  
  // Separate the combined results
  const completedLessons = result
    .filter(r => r.data_type === 'lesson')
    .map(r => ({
      topicId: r.topicId,
      lessonId: r.lessonId,
      completedAt: r.completedAt
    }));
  
  const quizResults = result
    .filter(r => r.data_type === 'quiz')
    .map(r => ({
      topicId: r.topicId,
      score: {
        correct: r.correct_answers,
        total: r.total_questions
      },
      percentage: r.percentage,
      completedAt: r.completedAt
    }));
  
  return {
    completedLessons,
    quizResults,
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
  
  // Optimized: Single query to get all needed stats
  const stats = db.prepare(`
    SELECT last_activity_date, current_streak, longest_streak 
    FROM user_stats 
    WHERE user_id = ?
  `).get(userId);
  
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
    
    // Atomic update of all streak-related fields
    db.prepare(`
      UPDATE user_stats 
      SET current_streak = ?, 
          longest_streak = ?, 
          last_activity_date = ?, 
          total_points = total_points + ?
      WHERE user_id = ?
    `).run(newStreak, newLongestStreak, today, bonusPoints, userId);
    
    updateBadges(userId);
  }
};

/**
 * Complete a lesson
 * @param {string|number} userId - User ID (auto-converted to string for SQLite)
 * @param {number} topicId - Topic ID
 * @param {number} lessonId - Lesson ID
 * @returns {Object} Updated user progress
 */
const completeLesson = (userId = 'default', topicId, lessonId) => {
  userId = String(userId);
  const db = getDb();
  
  // Check if lesson already completed
  const existing = db.prepare(`
    SELECT id FROM user_progress 
    WHERE user_id = ? AND topic_id = ? AND lesson_id = ? AND type = 'lesson'
  `).get(userId, topicId, lessonId);
  
  if (existing) {
    return getUserProgress(userId);
  }
  
  // Use transaction for atomic operations
  const transaction = db.transaction(() => {
    // Insert lesson completion
    db.prepare(`
      INSERT INTO user_progress (user_id, topic_id, lesson_id, completed_at, type)
      VALUES (?, ?, ?, ?, 'lesson')
    `).run(userId, topicId, lessonId, new Date().toISOString());
    
    // Update points
    db.prepare(`
      UPDATE user_stats 
      SET total_points = total_points + 10
      WHERE user_id = ?
    `).run(userId);
    
    // Update streak and level/badges
    updateStreak(userId);
    updateLevel(userId);
  });
  
  transaction();
  
  return getUserProgress(userId);
};

/**
 * Save quiz result
 * @param {string|number} userId - User ID (auto-converted to string for SQLite)
 * @param {number} topicId - Topic ID
 * @param {Object} score - Score object with correct and total
 * @param {number} percentage - Quiz percentage score
 * @returns {Object} Progress and points earned
 */
const saveQuizResult = (userId = 'default', topicId, score, percentage) => {
  userId = String(userId);
  const db = getDb();
  
  const points = Math.round(percentage / 10);
  const isPerfect = percentage === GAMIFICATION.PERFECT_SCORE;
  
  // Use transaction for atomic operations
  const transaction = db.transaction(() => {
    // Insert quiz result
    db.prepare(`
      INSERT INTO quiz_results (user_id, topic_id, correct_answers, total_questions, percentage, completed_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, topicId, score.correct, score.total, percentage, new Date().toISOString());
    
    // Update points and perfect quiz streak in single query
    if (isPerfect) {
      db.prepare(`
        UPDATE user_stats 
        SET total_points = total_points + ?, 
            perfect_quiz_streak = perfect_quiz_streak + 1
        WHERE user_id = ?
      `).run(points, userId);
    } else {
      db.prepare(`
        UPDATE user_stats 
        SET total_points = total_points + ?, 
            perfect_quiz_streak = 0
        WHERE user_id = ?
      `).run(points, userId);
    }
    
    // Update streak, level, and badges
    updateStreak(userId);
    updateLevel(userId);
    updateBadges(userId, percentage);
  });
  
  transaction();
  
  return {
    progress: getUserProgress(userId),
    pointsEarned: points
  };
};

const updateLevel = (userId) => {
  userId = String(userId);
  const db = getDb();
  
  // Optimized: Calculate and update level in single operation
  const stats = db.prepare(`
    SELECT total_points 
    FROM user_stats 
    WHERE user_id = ?
  `).get(userId);
  
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
  
  // Optimized: Get all needed data in fewer queries
  const stats = db.prepare(`
    SELECT badges, current_streak, perfect_quiz_streak 
    FROM user_stats 
    WHERE user_id = ?
  `).get(userId);
  
  const badges = JSON.parse(stats.badges);
  let newBadges = false;
  
  // Perfect Score - 100% v kvízu
  if (percentage === GAMIFICATION.PERFECT_SCORE && !badges.includes('perfect-score')) {
    badges.push('perfect-score');
    newBadges = true;
  }
  
  // Optimized: Get lesson count and categories in single query with JOIN
  const lessonStats = db.prepare(`
    SELECT 
      COUNT(*) as lesson_count,
      COUNT(DISTINCT t.category) as category_count,
      (SELECT COUNT(DISTINCT category) FROM topics) as total_categories
    FROM user_progress up
    LEFT JOIN topics t ON up.topic_id = t.id
    WHERE up.user_id = ? AND up.type = 'lesson'
  `).get(userId);
  
  const lessonCount = lessonStats.lesson_count;
  
  // Beginner - 3 dokončené lekce
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
    SELECT COUNT(*) as count 
    FROM quiz_results 
    WHERE user_id = ? AND percentage = ?
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
  if (lessonStats.category_count >= lessonStats.total_categories && 
      lessonStats.total_categories > 0 && 
      !badges.includes('all-topics')) {
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
 * @returns {Object} Reset user progress
 */
const resetProgress = (userId = 'default') => {
  userId = String(userId);
  const db = getDb();
  
  // Use transaction for atomic reset operation
  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM user_progress WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM quiz_results WHERE user_id = ?').run(userId);
    db.prepare(`
      UPDATE user_stats 
      SET total_points = 0, 
          level = 1, 
          badges = '[]', 
          current_streak = 0, 
          longest_streak = 0, 
          last_activity_date = NULL, 
          perfect_quiz_streak = 0
      WHERE user_id = ?
    `).run(userId);
  });
  
  transaction();
  
  return getUserProgress(userId);
};

module.exports = {
  getUserProgress,
  completeLesson,
  saveQuizResult,
  resetProgress
};
