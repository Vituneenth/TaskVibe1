import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListTodo, Target, Trophy, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo and Title */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center">
            <ListTodo className="text-white w-8 h-8" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">TaskVibe</h1>
            <p className="text-gray-600 dark:text-gray-400">Stay motivated, stay organized</p>
          </div>
        </div>

        {/* Hero Description */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Transform Your Productivity with 
            <span className="text-indigo-600 dark:text-indigo-400"> Gamified </span>
            Task Management
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A minimal yet colorful app that organizes your tasks by urgency, keeps you motivated with streaks and achievements, and gently nudges you toward success.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="text-red-600 dark:text-red-400 w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Urgency System</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Organize tasks by immediate, less immediate, and delayed priorities with beautiful color coding.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-purple-600 dark:text-purple-400 w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Gamified Progress</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Earn XP, level up, maintain streaks, and unlock achievements as you complete tasks.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="text-green-600 dark:text-green-400 w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Visual Progress</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Visual cues and progress tracking to keep you motivated and on track with your goals.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Button
            size="lg"
            className="px-8 py-3 text-lg font-semibold"
            onClick={() => window.location.href = "/api/login"}
          >
            Get Started with TaskVibe
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click to start using TaskVibe locally on your device
          </p>
        </div>
      </div>
    </div>
  );
}
