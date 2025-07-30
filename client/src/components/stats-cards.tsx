import { CheckCircle, Flame, BarChart3, Trophy, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalCompleted: number;
    todayCompleted: number;
    immediateCount: number;
    mediumCount: number;
    delayedCount: number;
  };
  user: {
    streak: number;
    level: number;
    xp: number;
  };
}

export function StatsCards({ stats, user }: StatsCardsProps) {
  const productivityScore = Math.min(100, Math.round((stats.todayCompleted / Math.max(1, stats.todayCompleted + stats.immediateCount + stats.mediumCount)) * 100));
  const levelProgress = ((user.xp % 100) / 100) * 100;
  const nextLevelXP = (user.level * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasks Completed</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalCompleted}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
            <CheckCircle className="text-green-600 dark:text-green-400 w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <TrendingUp className="text-green-500 w-4 h-4 mr-1" />
          <span className="text-green-600 dark:text-green-400 font-medium">+{stats.todayCompleted}</span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">today</span>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{user.streak}</p>
          </div>
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
            <Flame className="text-orange-600 dark:text-orange-400 w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className="text-orange-600 dark:text-orange-400 font-medium">Keep it up!</span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">Stay consistent</span>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Productivity Score</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{productivityScore}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
            <BarChart3 className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${productivityScore}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Level Progress</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{user.level}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
            <Trophy className="text-purple-600 dark:text-purple-400 w-6 h-6" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500 dark:text-gray-400">{user.xp} / {nextLevelXP} XP</span>
            <span className="text-purple-600 dark:text-purple-400 font-medium">{Math.round(levelProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
