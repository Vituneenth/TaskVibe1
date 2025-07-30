import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { ListTodo, Home, Clock, BarChart3, Trophy, Sun, Moon, Monitor, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: User;
}

export function Sidebar({ user }: SidebarProps) {
  const { theme, setTheme } = useTheme();

  const themeButtons = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "Auto" },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
            <ListTodo className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">TaskVibe</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Stay motivated!</p>
          </div>
        </div>
        
        {/* User Profile Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            {user.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="User profile" 
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {(user.nickname || user.firstName || "U").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {user.nickname || user.firstName || "User"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Level {user.level} Achiever</p>
            </div>
          </div>
          
          {/* Streak Counter */}
          <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <Flame className="text-orange-500 w-4 h-4" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user.streak} day streak!
            </span>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="space-y-2">
          <a href="#" className="flex items-center space-x-3 px-3 py-2 bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg">
            <Home className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Clock className="w-5 h-5" />
            <span>Task History</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Trophy className="w-5 h-5" />
            <span>Achievements</span>
          </a>
        </nav>
        
        {/* Theme Switcher */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
          </div>
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {themeButtons.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value as any)}
                className={cn(
                  "flex-1 px-2 py-1 text-xs font-medium rounded-md transition-colors flex items-center justify-center space-x-1",
                  theme === value
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon className="w-3 h-3" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => window.location.href = "/api/logout"}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
