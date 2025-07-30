import { z } from "zod";

// Type definitions for offline memory storage
export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  nickname: string | null;
  theme: string;
  level: number;
  xp: number;
  streak: number;
  lastActiveDate: Date | null;
  completedOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  urgency: string; // immediate, medium, delayed
  completed: boolean;
  completedAt: Date | null;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  userId: string;
  type: string; // streak, level, task_count, etc.
  title: string;
  description: string | null;
  icon: string;
  unlockedAt: Date;
}

export interface DailyStat {
  id: string;
  userId: string;
  date: Date;
  tasksCompleted: number;
  immediateCompleted: number;
  mediumCompleted: number;
  delayedCompleted: number;
  xpEarned: number;
}

// Insert schemas
export const insertTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  urgency: z.enum(["immediate", "medium", "delayed"]),
});

// Types for insertions
export type UpsertUser = Omit<User, 'createdAt' | 'updatedAt'>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
