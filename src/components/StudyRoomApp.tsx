import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, 
  Coffee, 
  BookOpen, 
  Music, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings,
  X,
  Volume2,
  VolumeX,
  Wind,
  CloudRain,
  Flame
} from 'lucide-react';
import { cn } from '../utils/cn';

interface StudyRoomAppProps {
  onClose: () => void;
  isFullscreen?: boolean;
}

const StudyRoomApp: React.FC<StudyRoomAppProps> = ({ onClose, isFullscreen }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [ambient, setAmbient] = useState<'none' | 'rain' | 'fire' | 'wind'>('none');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Logic for switching modes could go here
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const handleModeChange = (newMode: 'work' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 z-50 bg-[#F5F5F5] flex flex-col font-sans overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 w-40 h-40 bg-pink-400 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-10 w-60 h-60 bg-blue-400 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="h-16 px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-gray-400" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">自习室</span>
        </div>
        {!isFullscreen && (
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 z-10">
        {/* Mode Switcher */}
        <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl flex gap-1 shadow-sm border border-white mb-12">
          <button 
            onClick={() => handleModeChange('work')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold transition-all",
              mode === 'work' ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
            )}
          >
            专注
          </button>
          <button 
            onClick={() => handleModeChange('break')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold transition-all",
              mode === 'break' ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
            )}
          >
            休息
          </button>
        </div>

        {/* Timer Display */}
        <div className="relative mb-16">
          <div className="w-64 h-64 rounded-full border-4 border-white shadow-2xl flex flex-col items-center justify-center bg-white/30 backdrop-blur-xl">
            <motion.span 
              key={timeLeft}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-mono font-bold tracking-tighter text-gray-900"
            >
              {formatTime(timeLeft)}
            </motion.span>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-2">
              {mode === 'work' ? 'Deep Focus' : 'Short Break'}
            </p>
          </div>
          
          {/* Progress Ring (Visual Only) */}
          <svg className="absolute inset-0 -rotate-90 w-full h-full pointer-events-none">
            <circle 
              cx="128" cy="128" r="124" 
              fill="none" 
              stroke="rgba(0,0,0,0.05)" 
              strokeWidth="4" 
            />
            <motion.circle 
              cx="128" cy="128" r="124" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="4" 
              strokeDasharray="779"
              strokeDashoffset={779 - (779 * (timeLeft / (mode === 'work' ? 25 * 60 : 5 * 60)))}
              className={cn("transition-all duration-1000", mode === 'work' ? "text-pink-400" : "text-blue-400")}
            />
          </svg>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8">
          <button 
            onClick={resetTimer}
            className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-sm border border-white transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleTimer}
            className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transition-all active:scale-95",
              isActive ? "bg-white text-gray-900" : "bg-gray-900 text-white"
            )}
          >
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          <button className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-sm border border-white transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Ambient Sound Bar */}
      <div className="px-8 pb-12 z-10">
        <div className="bg-white/60 backdrop-blur-md p-4 rounded-[2rem] border border-white shadow-sm flex items-center justify-between">
          <div className="flex gap-4">
            <button 
              onClick={() => setAmbient('rain')}
              className={cn("p-2 rounded-xl transition-all", ambient === 'rain' ? "bg-blue-50 text-blue-500" : "text-gray-300")}
            >
              <CloudRain className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setAmbient('fire')}
              className={cn("p-2 rounded-xl transition-all", ambient === 'fire' ? "bg-orange-50 text-orange-500" : "text-gray-300")}
            >
              <Flame className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setAmbient('wind')}
              className={cn("p-2 rounded-xl transition-all", ambient === 'wind' ? "bg-green-50 text-green-500" : "text-gray-300")}
            >
              <Wind className="w-5 h-5" />
            </button>
          </div>
          <div className="h-6 w-px bg-gray-100" />
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default StudyRoomApp;
