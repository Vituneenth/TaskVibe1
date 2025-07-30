import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@shared/schema";

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask?: Task | null;
}

export function AddTaskModal({ open, onOpenChange, editingTask }: AddTaskModalProps) {
  const [title, setTitle] = useState(editingTask?.title || "");
  const [description, setDescription] = useState(editingTask?.description || "");
  const [urgency, setUrgency] = useState(editingTask?.urgency || "medium");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: { title: string; description?: string; urgency: string }) => {
      const response = await apiRequest("POST", "/api/tasks", taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success!",
        description: "Task added successfully! 🎉",
      });
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (taskData: { title: string; description?: string; urgency: string }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${editingTask?.id}`, taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success!",
        description: "Task updated successfully! ✅",
      });
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setUrgency("medium");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      urgency,
    };

    if (editingTask) {
      updateTaskMutation.mutate(taskData);
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? "Edit Task" : "Add New Task"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              className="h-24 resize-none"
            />
          </div>
          
          <div>
            <Label>Urgency Level</Label>
            <RadioGroup value={urgency} onValueChange={setUrgency} className="mt-2">
              <div className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <RadioGroupItem value="immediate" id="immediate" />
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <Label htmlFor="immediate" className="font-medium">Immediate</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Needs to be done ASAP</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <RadioGroupItem value="medium" id="medium" />
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <Label htmlFor="medium" className="font-medium">Less Immediate</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Important but not urgent</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <RadioGroupItem value="delayed" id="delayed" />
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <Label htmlFor="delayed" className="font-medium">Can Be Delayed</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">When you have time</p>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={!title.trim() || createTaskMutation.isPending || updateTaskMutation.isPending}
            >
              {editingTask ? "Update Task" : "Add Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
