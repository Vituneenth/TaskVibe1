import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Task } from "@shared/schema";

import { Sidebar } from "@/components/sidebar";
import { StatsCards } from "@/components/stats-cards";
import { TaskBuckets } from "@/components/task-buckets";
import { Achievements } from "@/components/achievements";
import { AddTaskModal } from "@/components/add-task-modal";
import { OnboardingModal } from "@/components/onboarding-modal";
import { NotificationToast } from "@/components/notification-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedUrgency, setSelectedUrgency] = useState<"immediate" | "medium" | "delayed">("medium");
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
    enabled: !!user,
    retry: false,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    enabled: !!user,
    retry: false,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["/api/achievements"],
    enabled: !!user,
    retry: false,
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/complete`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      toast({
        title: "Great job!",
        description: "Task completed!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Task deleted",
        description: "Task has been removed.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddTask = (urgency: "immediate" | "medium" | "delayed") => {
    setSelectedUrgency(urgency);
    setEditingTask(null);
    setAddTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setAddTaskModalOpen(true);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Show loading state
  if (isLoading || tasksLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if no user
  if (!user) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        <Sidebar user={user} />
        
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getGreeting()}, {user.nickname || user.firstName || "there"}!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  You've completed <span className="font-semibold text-indigo-600 dark:text-indigo-400">{stats?.todayCompleted || 0}</span> tasks today
                </p>
              </div>
              
              <Button onClick={() => handleAddTask("medium")} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </Button>
            </div>
            
            {/* Progress Overview */}
            <div className="flex items-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Immediate: <span className="font-semibold">{stats?.immediateCount || 0}</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Less Immediate: <span className="font-semibold">{stats?.mediumCount || 0}</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Can Be Delayed: <span className="font-semibold">{stats?.delayedCount || 0}</span>
                </span>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            {stats && (
              <StatsCards 
                stats={stats} 
                user={{
                  streak: user.streak,
                  level: user.level,
                  xp: user.xp,
                }}
              />
            )}
            
            <TaskBuckets
              tasks={tasks}
              onCompleteTask={(taskId) => completeTaskMutation.mutate(taskId)}
              onEditTask={handleEditTask}
              onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
              onAddTask={handleAddTask}
            />
            
            <Achievements achievements={achievements} />
          </main>
        </div>
      </div>

      {/* Modals */}
      <OnboardingModal
        open={user && !user.completedOnboarding}
        onComplete={() => queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] })}
      />

      <AddTaskModal
        open={addTaskModalOpen}
        onOpenChange={setAddTaskModalOpen}
        editingTask={editingTask}
        defaultUrgency={selectedUrgency}
      />

      {/* Notification Toast */}
      {notification && (
        <NotificationToast
          title={notification.title}
          message={notification.message}
          onDismiss={() => setNotification(null)}
        />
      )}
    </>
  );
}
