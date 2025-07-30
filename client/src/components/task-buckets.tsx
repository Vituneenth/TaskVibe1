import { Task } from "@shared/schema";
import { TaskCard } from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { Flame, Clock, PauseCircle, Plus } from "lucide-react";

interface TaskBucketsProps {
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (urgency: string) => void;
}

const bucketConfig = {
  immediate: {
    title: "Immediate",
    subtitle: "Get these done first! 🔥",
    icon: Flame,
    bgGradient: "bg-gradient-to-r from-red-500 to-orange-500",
    addButtonColor: "border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20",
  },
  medium: {
    title: "Less Immediate", 
    subtitle: "Important but not urgent ⏰",
    icon: Clock,
    bgGradient: "bg-gradient-to-r from-yellow-500 to-orange-400",
    addButtonColor: "border-yellow-300 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900 dark:hover:bg-opacity-20",
  },
  delayed: {
    title: "Can Be Delayed",
    subtitle: "When you have time 🧘‍♀️", 
    icon: PauseCircle,
    bgGradient: "bg-gradient-to-r from-blue-500 to-cyan-500",
    addButtonColor: "border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 dark:hover:bg-opacity-20",
  },
};

export function TaskBuckets({ tasks, onCompleteTask, onEditTask, onDeleteTask, onAddTask }: TaskBucketsProps) {
  const groupedTasks = {
    immediate: tasks.filter(task => task.urgency === 'immediate'),
    medium: tasks.filter(task => task.urgency === 'medium'),
    delayed: tasks.filter(task => task.urgency === 'delayed'),
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {Object.entries(bucketConfig).map(([urgency, config]) => {
        const bucketTasks = groupedTasks[urgency as keyof typeof groupedTasks];
        const Icon = config.icon;
        
        return (
          <div key={urgency} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className={`${config.bgGradient} px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon className="text-white w-5 h-5" />
                  <h3 className="text-lg font-semibold text-white">{config.title}</h3>
                </div>
                <span className="bg-white bg-opacity-20 text-white px-2 py-1 rounded-full text-sm font-medium">
                  {bucketTasks.length}
                </span>
              </div>
              <p className="text-white text-opacity-90 text-sm mt-1">{config.subtitle}</p>
            </div>
            
            <div className="p-4 space-y-3">
              {bucketTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={onCompleteTask}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
              
              {bucketTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Icon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No tasks in this bucket</p>
                </div>
              )}
              
              <Button
                variant="outline"
                className={`w-full border-2 border-dashed ${config.addButtonColor} transition-colors`}
                onClick={() => onAddTask(urgency)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add {config.title.toLowerCase()} task
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
