import { Achievement } from "@shared/schema";

interface AchievementsProps {
  achievements: Achievement[];
}

export function Achievements({ achievements }: AchievementsProps) {
  if (achievements.length === 0) {
    return (
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Achievements</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Complete tasks to unlock achievements!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Achievements</h3>
        <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium">
          View All
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {achievements.slice(0, 3).map((achievement) => (
          <div
            key={achievement.id}
            className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 dark:from-opacity-20 dark:to-opacity-20 rounded-lg border border-yellow-200 dark:border-yellow-800"
          >
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
              <i className={`${achievement.icon} text-yellow-600 dark:text-yellow-400 text-xl`}></i>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{achievement.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
