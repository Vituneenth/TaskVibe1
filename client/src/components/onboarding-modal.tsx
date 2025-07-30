import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { Rocket, Sun, Moon, Monitor } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [nickname, setNickname] = useState("");
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", "/api/user/onboarding", {
        nickname: nickname.trim(),
        theme,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome to TaskVibe!",
        description: "Let's get you organized and motivated! 🚀",
      });
      onComplete();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    completeMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" hideCloseButton>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to TaskVibe!</h2>
          <p className="text-gray-600 dark:text-gray-300">Let's get you organized and motivated</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="nickname">What should we call you?</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              required
            />
          </div>
          
          <div>
            <Label>Choose your theme:</Label>
            <div className="flex space-x-3 mt-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex-1 p-3 border-2 rounded-lg transition-colors ${
                  theme === "light" 
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900" 
                    : "border-gray-300 dark:border-gray-600 hover:border-indigo-500"
                }`}
              >
                <Sun className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">Light</div>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex-1 p-3 border-2 rounded-lg transition-colors ${
                  theme === "dark" 
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900" 
                    : "border-gray-300 dark:border-gray-600 hover:border-indigo-500"
                }`}
              >
                <Moon className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">Dark</div>
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`flex-1 p-3 border-2 rounded-lg transition-colors ${
                  theme === "system" 
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900" 
                    : "border-gray-300 dark:border-gray-600 hover:border-indigo-500"
                }`}
              >
                <Monitor className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">Auto</div>
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!nickname.trim() || completeMutation.isPending}
          >
            Let's Get Started! 🚀
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
