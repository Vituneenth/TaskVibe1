import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationToastProps {
  title: string;
  message: string;
  onView?: () => void;
  onDismiss: () => void;
}

export function NotificationToast({ title, message, onView, onDismiss }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div className={`fixed top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm transform transition-transform duration-300 z-50 ${
      isVisible ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center flex-shrink-0">
          <Bell className="text-indigo-600 dark:text-indigo-400 w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm">{title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{message}</p>
          <div className="flex space-x-2 mt-2">
            {onView && (
              <button 
                onClick={onView}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
              >
                View Tasks
              </button>
            )}
            <button 
              onClick={handleDismiss}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Dismiss
            </button>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 flex-shrink-0 p-1"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
