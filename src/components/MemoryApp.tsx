import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, 
  Search, 
  Plus, 
  X, 
  Calendar, 
  Image as ImageIcon, 
  Tag, 
  MoreVertical,
  ChevronRight,
  Heart,
  Trash2,
  Edit2,
  Filter
} from 'lucide-react';
import { cn } from '../utils/cn';

interface MemoryAppProps {
  onClose: () => void;
  isFullscreen?: boolean;
}

const MemoryApp: React.FC<MemoryAppProps> = ({ onClose, isFullscreen }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'grid'>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const memories = [
    { 
      id: 1, 
      date: "2026.03.25", 
      time: "14:20", 
      content: "今天在公园看到了一只超级可爱的三花猫，它竟然主动蹭了我的手！心情瞬间变好了。🐱✨", 
      tags: ["日常", "治愈"],
      image: "https://picsum.photos/seed/cat/800/600"
    },
    { 
      id: 2, 
      date: "2026.03.24", 
      time: "22:15", 
      content: "终于完成了那个复杂的项目模块，虽然熬了一点夜，但看到代码跑通的那一刻真的很满足。💻🔥", 
      tags: ["工作", "成就感"],
      image: null
    },
    { 
      id: 3, 
      date: "2026.03.22", 
      time: "18:30", 
      content: "和好朋友一起去吃了那家心心念念的日料，三文鱼刺身真的入口即化，太幸福了！🍣❤️", 
      tags: ["美食", "友情"],
      image: "https://picsum.photos/seed/food/800/600"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="absolute inset-0 z-50 bg-[#FCFCFC] flex flex-col font-sans overflow-hidden"
    >
      {/* Header */}
      <div className="h-20 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-200">
            <Book className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Memories</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Memory Fragments</p>
          </div>
        </div>
        {!isFullscreen && (
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="px-6 py-4 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input 
            type="text" 
            placeholder="Search memories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
          />
        </div>
        <button className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        <div className="space-y-8 relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-4 bottom-4 w-px bg-gray-100" />

          {memories.map((memory, index) => (
            <motion.div 
              key={memory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-12"
            >
              {/* Timeline Dot */}
              <div className="absolute left-[13px] top-2 w-2 h-2 rounded-full bg-gray-900 border-4 border-white shadow-sm" />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-900">{memory.date}</span>
                    <span className="text-[10px] text-gray-300 font-bold">{memory.time}</span>
                  </div>
                  <button className="p-1 text-gray-300 hover:text-gray-900 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
                  {memory.image && (
                    <div className="aspect-video rounded-2xl overflow-hidden border border-gray-50">
                      <img 
                        src={memory.image} 
                        alt="memory" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-600 leading-relaxed">{memory.content}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {memory.tags.map(tag => (
                      <span key={tag} className="text-[9px] px-2.5 py-1 bg-gray-50 text-gray-400 rounded-full font-bold tracking-widest uppercase">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-10 right-10 z-30">
        <button 
          onClick={() => setIsAdding(true)}
          className="w-16 h-16 bg-gray-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-gray-400 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Add Memory Modal (Simplified) */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => setIsAdding(false)} className="p-2 text-gray-400">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-bold text-gray-900">记录新记忆</h2>
              <button className="px-6 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold">发布</button>
            </div>
            
            <textarea 
              placeholder="此刻的心情是..." 
              className="flex-1 w-full text-lg text-gray-800 placeholder:text-gray-200 focus:outline-none resize-none"
            />
            
            <div className="flex gap-4 py-8 border-t border-gray-100">
              <button className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors">
                <ImageIcon className="w-5 h-5" />
                <span className="text-xs font-bold">添加图片</span>
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors">
                <Tag className="w-5 h-5" />
                <span className="text-xs font-bold">添加标签</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MemoryApp;
