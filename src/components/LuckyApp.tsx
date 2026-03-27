import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Moon, 
  Sun, 
  Star, 
  X, 
  RotateCcw, 
  Share2,
  Heart,
  Zap,
  Cloud,
  Trophy
} from 'lucide-react';
import { cn } from '../utils/cn';

interface LuckyAppProps {
  onClose: () => void;
  isFullscreen?: boolean;
}

const LuckyApp: React.FC<LuckyAppProps> = ({ onClose, isFullscreen }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fortunes = [
    { 
      id: 1, 
      title: "大吉", 
      desc: "万事如意，心想事成。今天会有意想不到的好消息哦！", 
      color: "bg-pink-400", 
      icon: Trophy,
      stats: { love: 5, work: 5, luck: 5 }
    },
    { 
      id: 2, 
      title: "中吉", 
      desc: "平稳中带着小确幸。适合去尝试一些新鲜事物。", 
      color: "bg-blue-400", 
      icon: Sparkles,
      stats: { love: 4, work: 3, luck: 4 }
    },
    { 
      id: 3, 
      title: "小吉", 
      desc: "细水长流的幸运。适合静下心来读一本书。", 
      color: "bg-green-400", 
      icon: Cloud,
      stats: { love: 3, work: 4, luck: 3 }
    },
    { 
      id: 4, 
      title: "末吉", 
      desc: "虽然平凡，但也是一种幸福。注意休息，保持好心情。", 
      color: "bg-orange-400", 
      icon: Sun,
      stats: { love: 2, work: 3, luck: 2 }
    }
  ];

  const handleDraw = () => {
    setIsDrawing(true);
    setResult(null);
    setTimeout(() => {
      const random = fortunes[Math.floor(Math.random() * fortunes.length)];
      setResult(random);
      setIsDrawing(false);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="absolute inset-0 z-50 bg-[#0A0A0A] flex flex-col font-sans overflow-hidden"
    >
      {/* Mystical Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,100,200,0.15),transparent_70%)]" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]" />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0.1, x: Math.random() * 400, y: Math.random() * 800 }}
            animate={{ 
              y: [null, Math.random() * -100],
              opacity: [0.1, 0.5, 0.1]
            }}
            transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, ease: "linear" }}
            className="absolute w-1 h-1 bg-white rounded-full"
          />
        ))}
      </div>

      {/* Header */}
      <div className="h-16 px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-pink-400" />
          <span className="text-xs font-bold text-pink-400 uppercase tracking-[0.4em]">幸运签</span>
        </div>
        {!isFullscreen && (
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 z-10">
        <AnimatePresence mode="wait">
          {!result && !isDrawing && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-8"
            >
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-48 h-48 rounded-full border border-white/10 flex items-center justify-center"
                >
                  <div className="w-40 h-40 rounded-full border border-pink-400/20 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border border-blue-400/20" />
                  </div>
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-pink-400 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-widest">今日运势</h2>
                <p className="text-xs text-gray-400 tracking-[0.2em]">点击下方按钮，抽取你的今日专属幸运</p>
              </div>
              <button 
                onClick={handleDraw}
                className="px-12 py-4 bg-white text-black rounded-full font-bold text-sm tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
              >
                开始抽取
              </button>
            </motion.div>
          )}

          {isDrawing && (
            <motion.div 
              key="drawing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="relative w-40 h-60">
                {[...Array(3)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ 
                      x: [0, (i - 1) * 40, 0],
                      rotate: [0, (i - 1) * 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                    className="absolute inset-0 bg-white/5 border border-white/20 rounded-2xl backdrop-blur-md"
                  />
                ))}
              </div>
              <p className="text-pink-400 text-xs font-bold tracking-[0.5em] animate-pulse">正在感应星象...</p>
            </motion.div>
          )}

          {result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-xs bg-white rounded-[2.5rem] p-8 space-y-8 shadow-2xl shadow-pink-500/20"
            >
              <div className="flex flex-col items-center gap-4">
                <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-lg", result.color)}>
                  <result.icon className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-black text-gray-900 tracking-[0.5em] ml-[0.5em]">{result.title}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-2">Today's Fortune</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed text-center">{result.desc}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '恋爱', val: result.stats.love, icon: Heart },
                    { label: '事业', val: result.stats.work, icon: Zap },
                    { label: '财运', val: result.stats.luck, icon: Star },
                  ].map(stat => (
                    <div key={stat.label} className="flex flex-col items-center gap-1">
                      <stat.icon className="w-3 h-3 text-pink-400" />
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={cn("w-1 h-1 rounded-full", i < stat.val ? "bg-pink-400" : "bg-gray-200")} />
                        ))}
                      </div>
                      <span className="text-[8px] font-bold text-gray-400">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleDraw}
                  className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-black transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  重新抽取
                </button>
                <button className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Quote */}
      <div className="px-8 pb-12 z-10 text-center">
        <p className="text-[10px] text-gray-500 font-medium tracking-widest italic opacity-50">
          "星辰的指引，只为遇见更好的你"
        </p>
      </div>
    </motion.div>
  );
};

export default LuckyApp;
