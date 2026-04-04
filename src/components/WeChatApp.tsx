import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, X } from 'lucide-react';
import { cn } from '../utils/cn';
import LoginScreen from './LoginScreen';

interface User {
  nickname: string;
  password: string;
  avatar: string | null;
}

interface WeChatAppProps {
  onClose: () => void;
  isFullscreen?: boolean;
  isLoggedIn: boolean;
  registeredUser: User | null;
  onRegister: (user: User) => void;
  onLogin: (user: User) => void;
}

export default function WeChatApp({ 
  onClose, 
  isFullscreen, 
  isLoggedIn, 
  registeredUser, 
  onRegister, 
  onLogin 
}: WeChatAppProps) {
  const [currentPage, setCurrentPage] = useState(0);

  if (!isLoggedIn) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "absolute inset-0 bg-[#F5F5F7]",
          isFullscreen && "pt-safe pb-safe"
        )}
      >
        <div className="absolute top-4 left-4 z-[110]">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
        </div>
        <LoginScreen 
          registeredUser={registeredUser}
          onRegister={onRegister}
          onLogin={onLogin}
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "absolute inset-0 bg-white flex flex-col overflow-hidden",
        isFullscreen && "pt-safe pb-safe"
      )}
    >
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-gray-50">
        <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </button>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                currentPage === i ? "bg-gray-900 w-4" : "bg-gray-200"
              )} 
            />
          ))}
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
          <X className="w-6 h-6 text-gray-900" />
        </button>
      </div>

      {/* Pages Container */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-full h-full shrink-0 flex items-center justify-center bg-white">
              {/* Blank Page */}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Bar (Empty as requested, just for switching) */}
      <div className="h-16 border-t border-gray-50 flex items-center justify-around px-4">
        {[0, 1, 2, 3].map((i) => (
          <button 
            key={i} 
            onClick={() => setCurrentPage(i)}
            className={cn(
              "w-10 h-10 rounded-xl transition-all",
              currentPage === i ? "bg-gray-100 scale-110" : "bg-transparent"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full mx-auto",
              currentPage === i ? "bg-gray-900" : "bg-gray-300"
            )} />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
