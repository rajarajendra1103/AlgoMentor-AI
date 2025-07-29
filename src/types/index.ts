export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  photo?: string;
  completedEducation: string;
  currentEducation: string;
  collegeName: string;
  courseName: string;
  mobile: string;
  linkedIn?: string;
  createdAt: Date;
}

export interface Course {
  id: string;
  name: string;
  category: 'language' | 'database' | 'web' | 'dsa';
  icon: string;
  description: string;
  color: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  code?: string;
  completed: boolean;
  duration: number;
}

export interface Quiz {
  id: string;
  type: 'mcq' | 'fill-code' | 'execution';
  question: string;
  options?: string[];
  correctAnswer: string;
  code?: string;
  explanation: string;
}

export interface TestResult {
  id: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  date: Date;
}

export interface StudyPlan {
  dailyHours: number;
  startDate: Date;
  roadmap: string[];
  currentTopic: string;
  progress: number;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  topics: string[];
}

export interface StudySession {
  id: string;
  date: Date;
  topic: string;
  duration: number;
  completed: boolean;
  progress: number;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'fill-code' | 'execution';
  question: string;
  options?: string[];
  correctAnswer: string;
  code?: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface VisualizationStep {
  id: string;
  line: number;
  description: string;
  variables: Record<string, any>;
  memory: any[];
  callStack: string[];
}

export interface AINote {
  id: string;
  topic: string;
  concept: string;
  types?: string[];
  syntax: string;
  flowchart?: string;
  exampleCode: string;
  errorProneCode: string;
  realWorldUse: string;
  youtubeVideos: YouTubeVideo[];
  createdAt: Date;
}

export interface YouTubeVideo {
  title: string;
  channel: string;
  url: string;
  language: string;
  duration: string;
}

export interface Book {
  title: string;
  author: string;
  isbn?: string;
  coverUrl?: string;
  readUrl: string;
  downloadUrl?: string;
}