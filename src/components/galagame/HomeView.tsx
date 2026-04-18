import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  MoreHorizontal, 
  ChevronRight, 
  Search,
  LogOut
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface HomeViewProps {
  onSelectGame: (game: any) => void;
  onOpenStore: () => void;
  onImportGame: () => void;
  appState: any;
  updateState: (key: string, value: any) => void;
  onClose: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onSelectGame, onOpenStore, onImportGame, appState, updateState, onClose }) => {
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);

  // Soft Sakura color theme: bg-[#fcf8f8] (misty white), text-[#c5a3a5] / text-[#d49a9f] (pink), border-[#ede6e6] (beige)
  const defaultTags = ['校园', '纯爱', '治愈', '古风', '奇幻', '日常', '恋爱'];

  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-gradient-to-b from-[#fdfbfb] to-[#f5f1f0]">
      {/* Top Bar */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 z-20">
        <button onClick={onOpenStore} className="p-2 bg-white/50 rounded-full hover:bg-white/80 border border-[#fcefee] text-[#c5a3a5] shadow-sm transition-all focus:outline-none">
          <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <div className="flex flex-col items-center select-none">
          <h1 className="text-xl md:text-2xl font-serif text-[#d49a9f] tracking-[0.2em] relative z-10" style={{ textShadow: '0 2px 8px rgba(212,154,159,0.3)' }}>
            樱之恋
          </h1>
          <span className="text-[10px] font-serif italic text-[#c5a3a5] mt-0.5 tracking-wider">SakuLove</span>
        </div>
        <button onClick={onClose} className="p-2 bg-white/50 rounded-full hover:bg-white/80 border border-[#fcefee] text-[#c5a3a5] shadow-sm transition-all focus:outline-none flex items-center gap-1 group">
          <LogOut className="w-4 h-4 ml-0.5" strokeWidth={2} />
          <span className="hidden group-hover:inline-block text-[10px] font-medium px-1">退出</span>
        </button>
      </div>

      {/* Aesthetic Empty State / Welcome Message */}
      <div className="mt-8 px-8 flex flex-col items-center justify-center text-center opacity-80 pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#fcefee] to-[#fdfbfb] shadow-[0_4px_24px_rgba(212,154,159,0.2)] mb-6 flex items-center justify-center relative">
          {/* A soft flower / petal shape graphic */}
          <div className="absolute w-8 h-8 rotate-45 bg-[#fcefee] rounded-[50%_0_50%_50%]" />
        </div>
        <h2 className="text-[#c5a3a5] font-serif text-lg tracking-[0.2em] font-light mb-3">漫漫樱落，静候君音</h2>
        <p className="text-[#c9b8b8] text-xs font-light tracking-[0.1em] leading-relaxed">
          目前还没有收录的作品哦<br/>所有的故事都等待着盛开
        </p>
      </div>

      {/* Decorative Petals */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50 z-0">
        <div className="absolute w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(252,239,238,0.6)_0%,transparent_60%)] blur-2xl top-10 -left-20" />
        <div className="absolute w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(245,241,240,0.8)_0%,transparent_60%)] blur-3xl bottom-0 -right-20" />
      </div>

      {/* Detailed Tag Filter Modal */}
      {showTagFilter && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-[100] bg-[#fdfbfb] overflow-y-auto px-8 py-12"
        >
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-[14px] font-serif text-[#d49a9f] tracking-[0.2em]">筛选心动标签</h2>
            <button onClick={() => setShowTagFilter(false)} className="text-[10px] text-[#c9b8b8] hover:text-[#c5a3a5] tracking-widest px-3 py-1 border border-[#ede6e6] rounded-full">关闭</button>
          </div>

          <div className="space-y-10">
            <section>
              <h3 className="text-[10px] text-[#c9b8b8] tracking-[0.2em] mb-4">故事类型</h3>
              <div className="grid grid-cols-3 gap-3">
                {defaultTags.map(tag => (
                  <button 
                    key={tag}
                    className={cn(
                      "py-2 text-[11px] tracking-widest rounded-lg border transition-all duration-300",
                      activeTags.includes(tag) 
                        ? "bg-[#d49a9f] text-white border-[#d49a9f] shadow-[0_2px_12px_rgba(212,154,159,0.3)]" 
                        : "bg-white/50 text-[#c5a3a5] border-[#ede6e6] hover:bg-[#fcefee]"
                    )}
                    onClick={() => setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-16 text-center">
            <button 
              onClick={() => setShowTagFilter(false)}
              className="px-12 py-3 bg-[#d49a9f] text-white text-[11px] rounded-full tracking-[0.3em] shadow-[0_4px_16px_rgba(212,154,159,0.4)] hover:bg-[#c59196] transition-colors"
            >
              寻觅邂逅
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HomeView;
