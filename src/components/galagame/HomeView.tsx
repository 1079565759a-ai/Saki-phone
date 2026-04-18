import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  Search,
  Heart,
  Star
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

const HomeView: React.FC<HomeViewProps> = ({ onSelectGame, onOpenStore, appState }) => {
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);

  const defaultTags = ['校园', '纯爱', '治愈', '古风', '奇幻', '日常', '恋爱'];
  
  const banners = appState.galaBanners || [];
  const hotGames = appState.galaHotGames || [];
  const myGames = appState.galaMyGames || [];
  
  // Combine all works and remove duplicates just in case, but usually we just list them in sections
  const latestWorks = [...myGames, ...hotGames].slice(0, 10);

  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-gradient-to-b from-[#fdfbfb] to-[#f5f1f0] relative">
      {/* Decorative Petals Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50 z-0">
        <div className="absolute w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(252,239,238,0.6)_0%,transparent_60%)] blur-2xl top-10 -left-20" />
        <div className="absolute w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(245,241,240,0.8)_0%,transparent_60%)] blur-3xl bottom-0 -right-20" />
      </div>

      {/* Top Bar */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 z-20">
        <button onClick={onOpenStore} className="p-2 bg-white/50 rounded-full hover:bg-white/80 border border-[#fcefee] text-[#c5a3a5] shadow-sm transition-all focus:outline-none relative z-10 w-9 h-9 flex items-center justify-center">
          <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <div className="flex flex-col items-center select-none">
          <h1 className="text-xl md:text-2xl font-serif text-[#d49a9f] tracking-[0.2em] relative z-10" style={{ textShadow: '0 2px 8px rgba(212,154,159,0.3)' }}>
            樱之恋
          </h1>
          <span className="text-[10px] font-serif italic text-[#c5a3a5] mt-0.5 tracking-wider">SakuLove</span>
        </div>
        <button onClick={() => setShowTagFilter(true)} className="p-2 bg-white/50 rounded-full hover:bg-white/80 border border-[#fcefee] text-[#c5a3a5] shadow-sm transition-all focus:outline-none relative z-10 w-9 h-9 flex items-center justify-center">
          <Search className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="relative z-10 px-6 space-y-10">
        {/* Banner Section */}
        {banners.length > 0 && (
          <div className="w-full flex gap-4 overflow-x-auto snap-x snap-mandatory pt-2 pb-4 no-scrollbar">
            {banners.map((banner: any, i: number) => (
              <motion.div 
                key={i}
                className="w-full shrink-0 snap-center rounded-3xl overflow-hidden aspect-[21/9] relative shadow-[0_8px_24px_rgba(212,154,159,0.15)] cursor-pointer group"
                whileTap={{ scale: 0.98 }}
              >
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#c5a3a5]/80 via-[#c5a3a5]/20 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <h2 className="text-white font-serif text-lg tracking-widest font-bold mb-1 shadow-sm">{banner.title}</h2>
                  <p className="text-white/80 text-[10px] tracking-wider line-clamp-1">{banner.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stories Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[#d49a9f] font-serif text-[13px] tracking-[0.2em] font-bold">精选连载 / 最新创作</h2>
          </div>
          
          {latestWorks.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center text-center opacity-80 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#fcefee] to-[#fdfbfb] shadow-[0_4px_24px_rgba(212,154,159,0.2)] mb-6 flex items-center justify-center relative">
                <div className="absolute w-8 h-8 rotate-45 bg-[#fcefee] rounded-[50%_0_50%_50%]" />
              </div>
              <h2 className="text-[#c5a3a5] font-serif text-lg tracking-[0.2em] font-light mb-3">漫漫樱落，静候心音</h2>
              <p className="text-[#c9b8b8] text-xs font-light tracking-[0.1em] leading-relaxed">
                目前还没有收录的作品哦<br/>所有的故事都等待着盛开
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {latestWorks.map((game: any, idx: number) => (
                <motion.div 
                  key={idx}
                  onClick={() => onSelectGame(game)}
                  className="group relative rounded-2xl bg-white/60 backdrop-blur-md shadow-[0_8px_24px_rgba(212,154,159,0.08)] border border-[#ede6e6] overflow-hidden flex flex-col cursor-pointer transition-transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#fcefee]/50">
                    <img 
                      src={game.cover} 
                      alt={game.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#c5a3a5]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-[#d49a9f] font-serif text-xs font-bold leading-tight mb-2 line-clamp-2">{game.title}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {game.tags?.slice(0, 2).map((tag: string, tidx: number) => (
                          <span key={tidx} className="text-[8px] px-1.5 py-0.5 rounded-md bg-[#fcefee] text-[#c5a3a5] tracking-widest">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 text-[#c9b8b8]" />
                        <span className="text-[9px] text-[#c9b8b8]">{game.likes || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-[#f6d365]" fill="#f6d365" />
                        <span className="text-[9px] text-[#c9b8b8]">{game.rating || '5.0'}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
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
