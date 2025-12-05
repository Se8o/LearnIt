const { getDb } = require('../setup');
const { mapDbRow, parseJsonField, mapTopicData } = require('../../utils/db-helpers');

/**
 * Get quiz by topic ID with questions and topic information
 * @param {number} topicId - Topic ID
 * @returns {Object|null} Quiz object with questions array and topic data, or null if not found
 */
const getQuizByTopicId = (topicId) => {
  const db = getDb();
  
  const quiz = db.prepare(`
    SELECT q.*, t.title as topic_title, t.category, t.icon, t.color
    FROM quizzes q
    LEFT JOIN topics t ON q.topic_id = t.id
    WHERE q.topic_id = ?
  `).get(topicId);
  
  if (!quiz) return null;
  
  const questions = db.prepare(`
    SELECT id, question, options, correct_answer, explanation
    FROM quiz_questions
    WHERE quiz_id = ?
  `).all(quiz.id);
  
  const mapped = mapDbRow(quiz);
  return {
    ...mapped,
    questions: questions.map(q => ({
      id: q.id,
      question: q.question,
      options: parseJsonField(q.options),
      correctAnswer: q.correct_answer,
      explanation: q.explanation
    })),
    topic: mapTopicData(quiz)
  };
};

/**
 * Create a new quiz
 * @param {Object} quiz - Quiz data
 * @param {number} quiz.topicId - Topic ID
 * @param {string} quiz.title - Quiz title
 * @returns {number} ID of created quiz
 */
const createQuiz = (quiz) => {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO quizzes (topic_id, title)
    VALUES (?, ?)
  `);
  const result = stmt.run(quiz.topicId, quiz.title);
  return result.lastInsertRowid;
};

/**
 * Create a new quiz question
 * @param {number} quizId - Quiz ID
 * @param {Object} question - Question data
 * @param {string} question.question - Question text
 * @param {Array<string>} question.options - Answer options
 * @param {number} question.correctAnswer - Index of correct answer (0-based)
 * @param {string} question.explanation - Explanation of correct answer
 * @returns {number} ID of created question
 */
const createQuizQuestion = (quizId, question) => {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, explanation)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    quizId,
    question.question,
    JSON.stringify(question.options),
    question.correctAnswer,
    question.explanation
  );
  return result.lastInsertRowid;
};

module.exports = {
  getQuizByTopicId,
  createQuiz,
  createQuizQuestion
};
