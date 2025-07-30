import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle2, Clock, AlertCircle, Undo2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { format } from "date-fns";
import type { Task } from "@shared/schema";

export default function TaskHistory() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: completedTasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks/completed"],
  });

  const uncompleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiRequest("POST", `/api/tasks/${taskId}/uncomplete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/completed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Task restored",
        description: "Task moved back to active list",
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
        description: "Failed to restore task",
        variant: "destructive",
      });
    },
  });

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "immediate":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "medium":
        return <Clock className="w-4 h-4 text-orange-500" />;
      case "delayed":
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "immediate":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "delayed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "immediate":
        return "Immediate";
      case "medium":
        return "Less Immediate";
      case "delayed":
        return "Can Be Delayed";
      default:
        return urgency;
    }
  };

  const filterTasksByUrgency = (tasks: Task[], urgency: string) => {
    return tasks.filter(task => task.urgency === urgency);
  };

  const TaskList = ({ tasks, urgency }: { tasks: Task[], urgency: string }) => (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No completed {getUrgencyLabel(urgency).toLowerCase()} tasks yet
        </div>
      ) : (
        tasks.map((task) => (
          <Card key={task.id} className="transition-all hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getUrgencyIcon(task.urgency)}
                    <Badge className={getUrgencyColor(task.urgency)}>
                      {getUrgencyLabel(task.urgency)}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {task.description}
                    </p>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Completed: {task.completedAt ? format(new Date(task.completedAt), "MMM d, yyyy 'at' h:mm a") : "Unknown"}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => uncompleteTaskMutation.mutate(task.id)}
                  disabled={uncompleteTaskMutation.isPending}
                  className="ml-4"
                >
                  <Undo2 className="w-4 h-4 mr-1" />
                  Restore
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Task History
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage your completed tasks
              </p>
            </div>
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const immediateTasks = filterTasksByUrgency(completedTasks, "immediate");
  const mediumTasks = filterTasksByUrgency(completedTasks, "medium");
  const delayedTasks = filterTasksByUrgency(completedTasks, "delayed");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {user && <Sidebar user={user} />}
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Task History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage your completed tasks. Click "Restore" to move tasks back to your active list.
            </p>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All ({completedTasks.length})
              </TabsTrigger>
              <TabsTrigger value="immediate">
                Immediate ({immediateTasks.length})
              </TabsTrigger>
              <TabsTrigger value="medium">
                Less Immediate ({mediumTasks.length})
              </TabsTrigger>
              <TabsTrigger value="delayed">
                Can Be Delayed ({delayedTasks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <TaskList tasks={completedTasks} urgency="all" />
            </TabsContent>

            <TabsContent value="immediate">
              <TaskList tasks={immediateTasks} urgency="immediate" />
            </TabsContent>

            <TabsContent value="medium">
              <TaskList tasks={mediumTasks} urgency="medium" />
            </TabsContent>

            <TabsContent value="delayed">
              <TaskList tasks={delayedTasks} urgency="delayed" />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}