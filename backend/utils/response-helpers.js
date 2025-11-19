/**
 * Quiz utility functions
 * Helper functions for quiz scoring and feedback
 */

/**
 * Calculates quiz feedback based on score percentage
 * @param {number} percentage - Score percentage (0-100)
 * @returns {Object} - {feedback: string, level: string}
 */
const getQuizFeedback = (percentage) => {
  if (percentage >= 90) {
    return {
      feedback: 'Výborně! Máš tématu opravdu rozumíš! 🌟',
      level: 'excellent'
    };
  } else if (percentage >= 70) {
    return {
      feedback: 'Dobrá práce! Pár věcí bys mohl/a ještě zopakovat. 👍',
      level: 'good'
    };
  } else if (percentage >= 50) {
    return {
      feedback: 'Není to špatné, ale doporučuji si lekci zopakovat. 📚',
      level: 'average'
    };
  } else {
    return {
      feedback: 'Zkus si lekci projít znovu a pak to zkus ještě jednou. 💪',
      level: 'needs-improvement'
    };
  }
};

/**
 * Calculates quiz score
 * @param {Array} results - Array of quiz results with isCorrect property
 * @returns {Object} - {correct, total, percentage}
 */
const calculateQuizScore = (results) => {
  const correctCount = results.filter(r => r.isCorrect).length;
  const totalQuestions = results.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  
  return {
    correct: correctCount,
    total: totalQuestions,
    percentage
  };
};

module.exports = {
  getQuizFeedback,
  calculateQuizScore
};
