import {
  type User,
  type UpsertUser,
  type Task,
  type InsertTask,
  type Achievement,
  type DailyStat,
} from "@shared/schema";

export interface IStorage {
  // User operations
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

export class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private tasks: Map<string, Task> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private dailyStats: Map<string, DailyStat> = new Map();
  private idCounter = 1;

  private generateId(): string {
    return `id-${this.idCounter++}`;
  }

  private formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    const user: User = {
      ...existingUser,
      ...userData,
      id: userData.id,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  async updateUserStats(userId: string, updates: Partial<User>): Promise<User> {
    const existingUser = this.users.get(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }
    const updatedUser: User = {
      ...existingUser,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Task operations
  async createTask(userId: string, task: InsertTask): Promise<Task> {
    // Get max priority for this urgency level
    const userTasks = Array.from(this.tasks.values()).filter(
      t => t.userId === userId && t.urgency === task.urgency && !t.completed
    );
    const maxPriority = userTasks.reduce((max, t) => Math.max(max, t.priority || 0), 0);

    const newTask: Task = {
      ...task,
      id: this.generateId(),
      userId,
      completed: false,
      completedAt: null,
      priority: maxPriority + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(newTask.id, newTask);
    return newTask;
  }

  async getUserTasks(userId: string, completed = false): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId && task.completed === completed)
      .sort((a, b) => {
        // Sort by urgency priority, then by task priority, then by creation date
        const urgencyOrder = { immediate: 3, medium: 2, delayed: 1 };
        const aUrgency = urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 0;
        const bUrgency = urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 0;
        
        if (aUrgency !== bUrgency) return bUrgency - aUrgency;
        if ((a.priority || 0) !== (b.priority || 0)) return (a.priority || 0) - (b.priority || 0);
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }

  async updateTask(taskId: string, userId: string, updates: Partial<Task>): Promise<Task> {
    const existingTask = this.tasks.get(taskId);
    if (!existingTask || existingTask.userId !== userId) {
      throw new Error('Task not found');
    }
    const updatedTask: Task = {
      ...existingTask,
      ...updates,
      updatedAt: new Date(),
    };
    this.tasks.set(taskId, updatedTask);
    return updatedTask;
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task || task.userId !== userId) {
      throw new Error('Task not found');
    }
    this.tasks.delete(taskId);
  }

  async completeTask(taskId: string, userId: string): Promise<Task> {
    const task = this.tasks.get(taskId);
    if (!task || task.userId !== userId) {
      throw new Error('Task not found');
    }

    const completedTask: Task = {
      ...task,
      completed: true,
      completedAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(taskId, completedTask);

    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
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

    // Update user XP and level
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

    return completedTask;
  }

  async uncompleteTask(taskId: string, userId: string): Promise<Task> {
    const task = this.tasks.get(taskId);
    if (!task || task.userId !== userId) {
      throw new Error('Task not found');
    }

    const uncompletedTask: Task = {
      ...task,
      completed: false,
      completedAt: null,
      updatedAt: new Date(),
    };
    this.tasks.set(taskId, uncompletedTask);

    // Reverse daily stats changes
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingStats = await this.getUserDailyStats(userId, today);
    if (existingStats) {
      const newStats = {
        tasksCompleted: Math.max(0, (existingStats.tasksCompleted || 0) - 1),
        xpEarned: Math.max(0, (existingStats.xpEarned || 0) - this.getXPForUrgency(task.urgency)),
      } as any;
      
      // Update urgency-specific completed count
      if (task.urgency === 'immediate') {
        newStats.immediateCompleted = Math.max(0, (existingStats.immediateCompleted || 0) - 1);
      } else if (task.urgency === 'medium') {
        newStats.mediumCompleted = Math.max(0, (existingStats.mediumCompleted || 0) - 1);
      } else if (task.urgency === 'delayed') {
        newStats.delayedCompleted = Math.max(0, (existingStats.delayedCompleted || 0) - 1);
      }
      
      await this.updateDailyStats(userId, today, newStats);
    }

    // Reverse user XP and level changes
    const user = await this.getUser(userId);
    if (user) {
      const xpToRemove = this.getXPForUrgency(task.urgency);
      const newXP = Math.max(0, (user.xp || 0) - xpToRemove);
      const newLevel = Math.max(1, Math.floor(newXP / 100) + 1);
      
      await this.updateUserStats(userId, {
        xp: newXP,
        level: newLevel,
      });
    }

    return uncompletedTask;
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
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.userId === userId)
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
  }

  async addAchievement(userId: string, achievement: Omit<Achievement, 'id' | 'userId' | 'unlockedAt'>): Promise<Achievement> {
    const newAchievement: Achievement = {
      ...achievement,
      id: this.generateId(),
      userId,
      unlockedAt: new Date(),
    };
    this.achievements.set(newAchievement.id, newAchievement);
    return newAchievement;
  }

  // Stats operations
  async getUserDailyStats(userId: string, date: Date): Promise<DailyStat | undefined> {
    const dateKey = this.formatDateKey(date);
    const statsKey = `${userId}-${dateKey}`;
    return this.dailyStats.get(statsKey);
  }

  async updateDailyStats(userId: string, date: Date, updates: Partial<DailyStat>): Promise<DailyStat> {
    const dateKey = this.formatDateKey(date);
    const statsKey = `${userId}-${dateKey}`;
    const existing = this.dailyStats.get(statsKey);
    
    const stats: DailyStat = {
      id: existing?.id || this.generateId(),
      userId,
      date,
      tasksCompleted: 0,
      immediateCompleted: 0,
      mediumCompleted: 0,
      delayedCompleted: 0,
      xpEarned: 0,
      ...existing,
      ...updates,
    };
    
    this.dailyStats.set(statsKey, stats);
    return stats;
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
    
    const allTasks = Array.from(this.tasks.values()).filter(task => task.userId === userId);
    
    // Get total completed tasks
    const totalCompleted = allTasks.filter(task => task.completed).length;
    
    // Get today's completed tasks
    const todayCompleted = allTasks.filter(task => 
      task.completed && 
      task.completedAt && 
      task.completedAt >= today
    ).length;
    
    // Get pending task counts by urgency
    const pendingTasks = allTasks.filter(task => !task.completed);
    const immediateCount = pendingTasks.filter(task => task.urgency === 'immediate').length;
    const mediumCount = pendingTasks.filter(task => task.urgency === 'medium').length;
    const delayedCount = pendingTasks.filter(task => task.urgency === 'delayed').length;
    
    // Get recent achievements
    const recentAchievements = Array.from(this.achievements.values())
      .filter(achievement => achievement.userId === userId)
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
      .slice(0, 3);
    
    return {
      totalCompleted,
      todayCompleted,
      immediateCount,
      mediumCount,
      delayedCount,
      recentAchievements,
    };
  }
}

export const storage = new MemoryStorage();