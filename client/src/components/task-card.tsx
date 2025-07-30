import { Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const urgencyConfig = {
  immediate: {
    bgColor: "bg-red-50 dark:bg-red-900 dark:bg-opacity-20",
    borderColor: "border-red-200 dark:border-red-800",
    badgeColor: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
    checkboxColor: "border-red-300 dark:border-red-600 hover:bg-red-500 hover:border-red-500",
  },
  medium: {
    bgColor: "bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20",
    borderColor: "border-yellow-200 dark:border-yellow-800", 
    badgeColor: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
    checkboxColor: "border-yellow-300 dark:border-yellow-600 hover:bg-yellow-500 hover:border-yellow-500",
  },
  delayed: {
    bgColor: "bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20",
    borderColor: "border-blue-200 dark:border-blue-800",
    badgeColor: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
    checkboxColor: "border-blue-300 dark:border-blue-600 hover:bg-blue-500 hover:border-blue-500",
  },
};

const urgencyLabels = {
  immediate: "Due Today",
  medium: "This Week", 
  delayed: "Someday",
};

export function TaskCard({ task, onComplete, onEdit, onDelete }: TaskCardProps) {
  const config = urgencyConfig[task.urgency as keyof typeof urgencyConfig];
  
  return (
    <div className={cn(
      "rounded-lg p-4 hover:shadow-md transition-shadow border",
      config.bgColor,
      config.borderColor
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <button
            onClick={() => onComplete(task.id)}
            className={cn(
              "w-5 h-5 border-2 rounded transition-colors mt-0.5",
              config.checkboxColor
            )}
          >
            <Check className="w-3 h-3 text-white opacity-0 hover:opacity-100" />
          </button>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
            )}
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="secondary" className={config.badgeColor}>
                {urgencyLabels[task.urgency as keyof typeof urgencyLabels]}
              </Badge>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(task.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onEdit(task)}>
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
