import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Topic {
  id: number;
  title: string;
  category: string;
  description: string;
  difficulty: string;
  duration: number;
  icon: string;
  color: string;
}

export interface Lesson {
  id: number;
  topicId: number;
  title: string;
  content: string;
  videoUrl: string;
  videoTitle: string;
  estimatedTime: number;
  keyPoints: string[];
  topic: Topic;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}

export interface Quiz {
  id: number;
  topicId: number;
  title: string;
  questions: QuizQuestion[];
  topic: Topic;
}

export interface QuizResult {
  questionId: number;
  question: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizSubmitResponse {
  success: boolean;
  data: {
    results: QuizResult[];
    score: {
      correct: number;
      total: number;
      percentage: number;
    };
    feedback: string;
    level: string;
  };
}

export interface UserProgress {
  completedLessons: Array<{
    topicId: number;
    lessonId: number;
    completedAt: string;
  }>;
  quizResults: Array<any>;
  totalPoints: number;
  level: number;
  badges: string[];
}

// API Functions
export const topicsApi = {
  getAll: async () => {
    const response = await api.get<{ success: boolean; count: number; data: Topic[] }>('/api/topics');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get<{ success: boolean; data: Topic }>(`/api/topics/${id}`);
    return response.data;
  },
};

export const lessonsApi = {
  getAll: async () => {
    const response = await api.get<{ success: boolean; count: number; data: Lesson[] }>('/api/lessons');
    return response.data;
  },
  getByTopicId: async (topicId: number) => {
    const response = await api.get<{ success: boolean; data: Lesson }>(`/api/lessons/${topicId}`);
    return response.data;
  },
};

export const quizApi = {
  getByTopicId: async (topicId: number) => {
    const response = await api.get<{ success: boolean; data: Quiz }>(`/api/quiz/${topicId}`);
    return response.data;
  },
  submit: async (topicId: number, answers: number[]) => {
    const response = await api.post<QuizSubmitResponse>('/api/quiz/submit', {
      topicId,
      answers,
    });
    return response.data;
  },
};

export const userProgressApi = {
  get: async () => {
    const response = await api.get<{ success: boolean; data: UserProgress }>('/api/user-progress');
    return response.data;
  },
  completeLesson: async (topicId: number, lessonId: number) => {
    const response = await api.post<{ success: boolean; data: UserProgress }>(
      '/api/user-progress/complete-lesson',
      { topicId, lessonId }
    );
    return response.data;
  },
  saveQuizResult: async (topicId: number, score: any, percentage: number) => {
    const response = await api.post<{ success: boolean; data: UserProgress; pointsEarned: number }>(
      '/api/user-progress/save-quiz-result',
      { topicId, score, percentage }
    );
    return response.data;
  },
  reset: async () => {
    const response = await api.post<{ success: boolean; data: UserProgress }>('/api/user-progress/reset');
    return response.data;
  },
};

export default api;
