const { getDb } = require('../setup');
const { mapDbRow, parseJsonField, mapTopicData } = require('../../utils/db-helpers');

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

const createQuiz = (quiz) => {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO quizzes (topic_id, title)
    VALUES (?, ?)
  `);
  const result = stmt.run(quiz.topicId, quiz.title);
  return result.lastInsertRowid;
};

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
