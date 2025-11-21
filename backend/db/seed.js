const { createTables, getDb } = require('./setup');
const topicsData = require('../data/topics');
const lessonsData = require('../data/lessons');
const quizzesData = require('../data/quizzes');

const seedDatabase = () => {
  console.log('Starting database seeding...');
  
  createTables();
  
  const db = getDb();
  
  const existingTopics = db.prepare('SELECT COUNT(*) as count FROM topics').get();
  if (existingTopics.count > 0) {
    console.log('Database already seeded. Skipping...');
    return;
  }
  
  console.log('Seeding topics...');
  const topicStmt = db.prepare(`
    INSERT INTO topics (id, title, category, description, difficulty, duration, icon, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (const topic of topicsData) {
    topicStmt.run(
      topic.id,
      topic.title,
      topic.category,
      topic.description,
      topic.difficulty,
      topic.duration,
      topic.icon || '',
      topic.color
    );
  }
  console.log(`Seeded ${topicsData.length} topics`);
  
  console.log('Seeding lessons...');
  const lessonStmt = db.prepare(`
    INSERT INTO lessons (id, topic_id, title, content, video_url, video_title, estimated_time, key_points)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (const lesson of lessonsData) {
    lessonStmt.run(
      lesson.id,
      lesson.topicId,
      lesson.title,
      lesson.content,
      lesson.videoUrl,
      lesson.videoTitle,
      lesson.estimatedTime,
      JSON.stringify(lesson.keyPoints)
    );
  }
  console.log(`Seeded ${lessonsData.length} lessons`);
  
  console.log('Seeding quizzes...');
  for (const quiz of quizzesData) {
    const quizResult = db.prepare(`
      INSERT INTO quizzes (id, topic_id, title)
      VALUES (?, ?, ?)
    `).run(quiz.id, quiz.topicId, quiz.title);
    
    const quizId = quiz.id;
    
    const questionStmt = db.prepare(`
      INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, explanation)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    for (const question of quiz.questions) {
      questionStmt.run(
        quizId,
        question.question,
        JSON.stringify(question.options),
        question.correctAnswer,
        question.explanation
      );
    }
  }
  console.log(`Seeded ${quizzesData.length} quizzes`);
  
  console.log('Database seeding completed successfully!');
};

if (require.main === module) {
  seedDatabase();
  process.exit(0);
}

module.exports = { seedDatabase };
