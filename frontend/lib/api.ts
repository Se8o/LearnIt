import axios from 'axios';

/**
 * SECURITY NOTE: localStorage token storage has XSS vulnerability
 * See AuthContext.tsx for planned migration to HttpOnly cookies
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Axios instance for API calls
 * Note: Refresh token logic is handled in AuthContext, not here
 * This eliminates race conditions and centralizes auth state management
 */
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
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  perfectQuizStreak: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: User;
  message?: string;
}

// API Functions
export const topicsApi = {
  getAll: async (signal?: AbortSignal) => {
    const response = await api.get<{ success: boolean; count: number; data: Topic[] }>('/api/topics', { signal });
    return response.data;
  },
  getById: async (id: number, signal?: AbortSignal) => {
    const response = await api.get<{ success: boolean; data: Topic }>(`/api/topics/${id}`, { signal });
    return response.data;
  },
};

export const lessonsApi = {
  getAll: async (signal?: AbortSignal) => {
    const response = await api.get<{ success: boolean; count: number; data: Lesson[] }>('/api/lessons', { signal });
    return response.data;
  },
  getByTopicId: async (topicId: number, signal?: AbortSignal) => {
    const response = await api.get<{ success: boolean; data: Lesson }>(`/api/lessons/${topicId}`, { signal });
    return response.data;
  },
};

export const quizApi = {
  getByTopicId: async (topicId: number, signal?: AbortSignal) => {
    const response = await api.get<{ success: boolean; data: Quiz }>(`/api/quiz/${topicId}`, { signal });
    return response.data;
  },
  submit: async (topicId: number, answers: number[], token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<QuizSubmitResponse>(
      '/api/quiz/submit',
      {
        topicId,
        answers,
      },
      { headers }
    );
    return response.data;
  },
};

export const userProgressApi = {
  get: async (token?: string, signal?: AbortSignal) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<{ success: boolean; data: UserProgress }>('/api/user-progress', { headers, signal });
    return response.data;
  },
  completeLesson: async (topicId: number, lessonId: number, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<{ success: boolean; data: UserProgress }>(
      '/api/user-progress/complete-lesson',
      { topicId, lessonId },
      { headers }
    );
    return response.data;
  },
  saveQuizResult: async (topicId: number, score: any, percentage: number, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<{ success: boolean; data: UserProgress; pointsEarned: number }>(
      '/api/user-progress/save-quiz-result',
      { topicId, score, percentage },
      { headers }
    );
    return response.data;
  },
  reset: async (token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<{ success: boolean; data: UserProgress }>('/api/user-progress/reset', {}, { headers });
    return response.data;
  },
};

export const authApi = {
  register: async (email: string, password: string, name: string) => {
    const response = await api.post<AuthResponse>('/api/auth/register', {
      email,
      password,
      name,
    });
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },
  refresh: async (refreshToken: string) => {
    const response = await api.post<{ success: boolean; accessToken: string; user: User }>('/api/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },
  logout: async (refreshToken: string) => {
    const response = await api.post<{ success: boolean; message: string }>('/api/auth/logout', {
      refreshToken,
    });
    return response.data;
  },
  logoutAll: async (token: string) => {
    const response = await api.post<{ success: boolean; message: string }>(
      '/api/auth/logout-all',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
  getMe: async (token: string) => {
    const response = await api.get<{ success: boolean; user: User }>('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  updateProfile: async (name: string, token: string) => {
    const response = await api.put<{ success: boolean; user: User }>(
      '/api/auth/update-profile',
      { name },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};

export default api;
