import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  Search,
  Star,
  ChevronRight
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

  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-white relative">

      {/* Top Bar - keeping the pink text and style as requested */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <button onClick={onOpenStore} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-600 shadow-sm transition-all focus:outline-none relative z-10 w-9 h-9 flex items-center justify-center">
          <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <div className="flex flex-col items-center select-none">
          <h1 className="text-xl md:text-2xl font-serif text-[#d49a9f] tracking-[0.2em] relative z-10" style={{ textShadow: '0 2px 8px rgba(212,154,159,0.3)' }}>
            樱之恋
          </h1>
          <span className="text-[10px] font-serif italic text-[#c5a3a5] mt-0.5 tracking-wider">SakuLove</span>
        </div>
        <button onClick={() => setShowTagFilter(true)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-[#d49a9f] shadow-sm transition-all focus:outline-none relative z-10 w-9 h-9 flex items-center justify-center">
          <Search className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="relative z-10 px-6 py-6 space-y-10">
        
        {/* Search Bar Replica - standard UI format */}
        <div className="flex items-center gap-3 w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder="探索未知的世界..." className="bg-transparent flex-1 outline-none text-sm text-gray-900 placeholder:text-gray-400" />
        </div>

        {/* Banner Section */}
        {banners.length > 0 && (
          <div className="w-full flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar -mx-6 px-6">
            {banners.map((banner: any, i: number) => (
              <motion.div 
                key={i}
                className="w-[85%] shrink-0 snap-center rounded-2xl overflow-hidden aspect-[16/9] relative shadow-sm cursor-pointer border border-gray-100"
                whileTap={{ scale: 0.98 }}
              >
                <img src={banner.image || banner.cover} alt={banner.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-white text-lg tracking-widest font-bold mb-1 truncate">{banner.title || '活动焦点'}</h2>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Hot Games Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 tracking-wide">热门推荐</h3>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
            {hotGames.map((game: any, idx: number) => (
              <div key={idx} onClick={() => onSelectGame(game)} className="w-32 shrink-0 cursor-pointer space-y-2">
                <div className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-gray-100 relative group">
                  <img src={game.cover} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1 text-white text-[10px]">
                    <Star className="w-3 h-3 fill-current text-yellow-400" />
                    {game.rating || '5.0'}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 truncate">{game.title}</h4>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{game.author}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* My Games Library (as original layout typically has) */}
        {myGames.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 tracking-wide">我的作品库</h3>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {myGames.map((game: any, idx: number) => (
                <div key={idx} onClick={() => onSelectGame(game)} className="cursor-pointer space-y-2">
                  <div className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-gray-100 group">
                    <img src={game.cover} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 truncate">{game.title}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {game.tags?.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
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
