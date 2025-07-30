import {
  users,
  tasks,
  achievements,
  dailyStats,
  type User,
  type UpsertUser,
  type Task,
  type InsertTask,
  type Achievement,
  type DailyStat,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStats(userId: string, updates: Partial<User>): Promise<User>;
  
  // Task operations
  createTask(userId: string, task: InsertTask): Promise<Task>;
  getUserTasks(userId: string, completed?: boolean): Promise<Task[]>;
  updateTask(taskId: string, userId: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(taskId: string, userId: string): Promise<void>;
  completeTask(taskId: string, userId: string): Promise<Task>;
  
  // Achievement operations
  getUserAchievements(userId: string): Promise<Achievement[]>;
  addAchievement(userId: string, achievement: Omit<Achievement, 'id' | 'userId' | 'unlockedAt'>): Promise<Achievement>;
  
  // Stats operations
  getUserDailyStats(userId: string, date: Date): Promise<DailyStat | undefined>;
  updateDailyStats(userId: string, date: Date, updates: Partial<DailyStat>): Promise<DailyStat>;
  getUserStats(userId: string): Promise<{
    totalCompleted: number;
    todayCompleted: number;
    immediateCount: number;
    mediumCount: number;
    delayedCount: number;
    recentAchievements: Achievement[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStats(userId: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Task operations
  async createTask(userId: string, task: InsertTask): Promise<Task> {
    // Get max priority for this urgency level to append at the end
    const [maxPriorityResult] = await db
      .select({ maxPriority: sql<number>`COALESCE(MAX(priority), 0)` })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.urgency, task.urgency), eq(tasks.completed, false)));
    
    const [newTask] = await db
      .insert(tasks)
      .values({
        ...task,
        userId,
        priority: (maxPriorityResult?.maxPriority || 0) + 1,
      })
      .returning();
    return newTask;
  }

  async getUserTasks(userId: string, completed = false): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.completed, completed)))
      .orderBy(desc(tasks.urgency), tasks.priority, desc(tasks.createdAt));
  }

  async updateTask(taskId: string, userId: string, updates: Partial<Task>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();
    return task;
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    await db.delete(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
  }

  async completeTask(taskId: string, userId: string): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ 
        completed: true, 
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();
    
    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Update daily stats
    const existingStats = await this.getUserDailyStats(userId, today);
    const newStats = {
      tasksCompleted: (existingStats?.tasksCompleted || 0) + 1,
      xpEarned: (existingStats?.xpEarned || 0) + this.getXPForUrgency(task.urgency),
    } as any;
    
    // Update urgency-specific completed count
    if (task.urgency === 'immediate') {
      newStats.immediateCompleted = (existingStats?.immediateCompleted || 0) + 1;
    } else if (task.urgency === 'medium') {
      newStats.mediumCompleted = (existingStats?.mediumCompleted || 0) + 1;
    } else if (task.urgency === 'delayed') {
      newStats.delayedCompleted = (existingStats?.delayedCompleted || 0) + 1;
    }
    
    await this.updateDailyStats(userId, today, newStats);
    
    // Update user XP
    const user = await this.getUser(userId);
    if (user) {
      const currentXP = user.xp || 0;
      const currentLevel = user.level || 1;
      const newXP = currentXP + this.getXPForUrgency(task.urgency);
      const newLevel = Math.floor(newXP / 100) + 1;
      
      await this.updateUserStats(userId, {
        xp: newXP,
        level: newLevel,
        lastActiveDate: new Date(),
      });
      
      // Check for level up achievement
      if (newLevel > currentLevel) {
        await this.addAchievement(userId, {
          type: 'level',
          title: 'Level Up!',
          description: `Reached Level ${newLevel}`,
          icon: 'fas fa-rocket',
        });
      }
    }
    
    return task;
  }

  private getXPForUrgency(urgency: string): number {
    switch (urgency) {
      case 'immediate': return 15;
      case 'medium': return 10;
      case 'delayed': return 5;
      default: return 5;
    }
  }

  // Achievement operations
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.unlockedAt));
  }

  async addAchievement(userId: string, achievement: Omit<Achievement, 'id' | 'userId' | 'unlockedAt'>): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values({
        ...achievement,
        userId,
      })
      .returning();
    return newAchievement;
  }

  // Stats operations
  async getUserDailyStats(userId: string, date: Date): Promise<DailyStat | undefined> {
    const [stats] = await db
      .select()
      .from(dailyStats)
      .where(and(eq(dailyStats.userId, userId), eq(dailyStats.date, date)));
    return stats;
  }

  async updateDailyStats(userId: string, date: Date, updates: Partial<DailyStat>): Promise<DailyStat> {
    const existing = await this.getUserDailyStats(userId, date);
    
    if (existing) {
      const [updated] = await db
        .update(dailyStats)
        .set(updates)
        .where(and(eq(dailyStats.userId, userId), eq(dailyStats.date, date)))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(dailyStats)
        .values({
          userId,
          date,
          ...updates,
        })
        .returning();
      return created;
    }
  }

  async getUserStats(userId: string): Promise<{
    totalCompleted: number;
    todayCompleted: number;
    immediateCount: number;
    mediumCount: number;
    delayedCount: number;
    recentAchievements: Achievement[];
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get total completed tasks
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.completed, true)));
    
    // Get today's completed tasks
    const [todayResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(and(
        eq(tasks.userId, userId), 
        eq(tasks.completed, true),
        gte(tasks.completedAt, today)
      ));
    
    // Get pending task counts by urgency
    const [immediateResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.completed, false), eq(tasks.urgency, 'immediate')));
    
    const [mediumResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.completed, false), eq(tasks.urgency, 'medium')));
    
    const [delayedResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.completed, false), eq(tasks.urgency, 'delayed')));
    
    // Get recent achievements
    const recentAchievements = await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.unlockedAt))
      .limit(3);
    
    return {
      totalCompleted: totalResult?.count || 0,
      todayCompleted: todayResult?.count || 0,
      immediateCount: immediateResult?.count || 0,
      mediumCount: mediumResult?.count || 0,
      delayedCount: delayedResult?.count || 0,
      recentAchievements,
    };
  }
}

export const storage = new DatabaseStorage();
