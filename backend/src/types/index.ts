import { Request } from 'express';

// User types
export interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  created_at: string;
  updated_at?: string;
}

export interface UserCreateInput {
  email: string;
  password: string;
  name: string;
}

export interface UserUpdateInput {
  name?: string;
}

export interface SafeUser {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

// Token types
export interface RefreshTokenData {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
  revoked: number;
}

export interface TokenVerificationResult {
  valid: boolean;
  userId: number | null;
}

export interface JWTPayload {
  id: number;
  email: string;
}

// Topic types
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

// Lesson types
export interface Lesson {
  id: number;
  topic_id: number;
  title: string;
  content: string;
  video_url: string | null;
  video_title: string | null;
  estimated_time: number;
  key_points: string;
}

export interface LessonWithTopic extends Lesson {
  topic: Topic;
}

// Quiz types
export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question: string;
  options: string;
  correct_answer: number;
  explanation: string;
}

export interface Quiz {
  id: number;
  topic_id: number;
  title: string;
  questions: QuizQuestion[];
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
  results: QuizResult[];
  score: {
    correct: number;
    total: number;
    percentage: number;
  };
  feedback: string;
  level: string;
}

// User Progress types
export interface UserProgress {
  id: number;
  user_id: number | null;
  topic_id: number;
  lesson_id: number | null;
  quiz_score: number | null;
  quiz_percentage: number | null;
  completed_at: string;
}

export interface UserStats {
  id: number;
  user_id: string;
  total_points: number;
  level: number;
  badges: string;
}

// Express Request types
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any[];
  statusCode?: number;
  stack?: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}

// Config types
export interface Config {
  port: number;
  nodeEnv: string;
  jwt: {
    secret: string;
    refreshSecret: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
  };
  cors: {
    origin: string[];
  };
  logging: {
    level: string;
  };
  security: {
    bcryptRounds: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
}
