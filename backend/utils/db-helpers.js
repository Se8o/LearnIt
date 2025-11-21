/**
 * Database helper utilities
 * Reduces code duplication in model layer
 */

/**
 * Maps database row to camelCase object
 * @param {Object} row - Database row with snake_case columns
 * @param {Object} mapping - Column name mapping (optional)
 * @returns {Object} Mapped object with camelCase properties
 */
const mapDbRow = (row, mapping = {}) => {
  if (!row) return null;
  
  const defaultMapping = {
    topic_id: 'topicId',
    video_url: 'videoUrl',
    video_title: 'videoTitle',
    estimated_time: 'estimatedTime',
    key_points: 'keyPoints',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    password_hash: 'passwordHash',
    correct_answer: 'correctAnswer',
    user_id: 'userId',
    expires_at: 'expiresAt',
    topic_title: 'topicTitle',
    total_points: 'totalPoints'
  };
  
  const fullMapping = { ...defaultMapping, ...mapping };
  const result = {};
  
  for (const [key, value] of Object.entries(row)) {
    const newKey = fullMapping[key] || key;
    result[newKey] = value;
  }
  
  return result;
};

/**
 * Parses JSON field from database
 * @param {string} jsonString - JSON string from database
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed value or default
 */
const parseJsonField = (jsonString, defaultValue = []) => {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Maps topic data from database row
 * @param {Object} row - Database row containing topic fields
 * @returns {Object} Topic object
 */
const mapTopicData = (row) => {
  if (!row) return null;
  return {
    id: row.topic_id || row.id,
    title: row.topic_title || row.title,
    category: row.category,
    description: row.description,
    difficulty: row.difficulty,
    duration: row.duration,
    icon: row.icon,
    color: row.color
  };
};

module.exports = {
  mapDbRow,
  parseJsonField,
  mapTopicData
};
