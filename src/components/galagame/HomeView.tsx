import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  MoreHorizontal, 
  ChevronRight, 
  Star, 
  Search 
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface HomeViewProps {
  onSelectGame: (game: any) => void;
  onOpenStore: () => void;
  onImportGame: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onSelectGame, onOpenStore, onImportGame }) => {
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);

  const banners = [
    { id: 1, cover: 'https://picsum.photos/seed/banner1/1280/720' },
    { id: 2, cover: 'https://picsum.photos/seed/banner2/1280/720' },
    { id: 3, cover: 'https://picsum.photos/seed/banner3/1280/720' },
  ];

  const defaultTags = ['校园', '重生', 'abo', '古风', '病娇', '恐怖', '18禁'];

  const hotGames = [
    { id: 1, title: '月下孤影', author: '作者A', tags: ['武侠', '古风'], rating: 4.8, cover: 'https://picsum.photos/seed/hot1/1280/720' },
    { id: 2, title: '赛博霓虹', author: '作者B', tags: ['科幻', '赛博'], rating: 4.5, cover: 'https://picsum.photos/seed/hot2/1280/720' },
    { id: 3, title: '深宫计', author: '作者C', tags: ['宫斗', '古风'], rating: 4.9, cover: 'https://picsum.photos/seed/hot3/1280/720' },
    { id: 4, title: '末日余生', author: '作者D', tags: ['生存', '末世'], rating: 4.2, cover: 'https://picsum.photos/seed/hot4/1280/720' },
    { id: 5, title: '星际迷航', author: '作者E', tags: ['星际', '科幻'], rating: 4.7, cover: 'https://picsum.photos/seed/hot5/1280/720' },
  ];

  // Only show created or imported games as per prompt
  const displayGames = [
    { id: 101, title: '我的初恋', author: '我', tags: ['校园', '纯爱'], cover: 'https://picsum.photos/seed/my1/1280/720' },
    { id: 102, title: '重生之我是大佬', author: '我', tags: ['重生', '爽文'], cover: 'https://picsum.photos/seed/my2/1280/720' },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Top Bar */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-20">
        <button onClick={onOpenStore} className="p-2 hover:bg-gray-50 transition-colors">
          <ShoppingBag className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
        </button>
        <h1 className="text-[10px] font-serif italic font-bold tracking-[0.3em] uppercase text-gray-900">樱咲Gal机</h1>
        <button onClick={onImportGame} className="p-2 hover:bg-gray-50 transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-6 mb-8">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search works, authors, tags..."
            className="w-full bg-gray-50 border border-gray-100 py-4 pl-12 pr-6 text-[9px] font-bold tracking-widest uppercase placeholder:text-gray-300 focus:outline-none focus:border-gray-900 focus:bg-white transition-all rounded-none"
          />
        </div>
      </div>

      {/* Carousel */}
      <div className="px-6 mb-6">
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4">
          {banners.map(banner => (
            <div key={banner.id} className="min-w-full aspect-[16/9] snap-center rounded-none overflow-hidden border border-gray-100">
              <img src={banner.cover} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          ))}
        </div>
      </div>

      {/* Tag Filter Area */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
          {defaultTags.map(tag => (
            <button 
              key={tag}
              className={cn(
                "px-4 py-1.5 text-[9px] font-bold tracking-widest uppercase border transition-all whitespace-nowrap",
                activeTags.includes(tag) ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-400 border-gray-100 hover:border-gray-900"
              )}
              onClick={() => setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
            >
              {tag}
            </button>
          ))}
          <button 
            onClick={() => setShowTagFilter(true)}
            className="p-1.5 border border-gray-100 text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hot Ranking Area */}
      <section className="mb-12">
        <div className="px-6 flex items-center gap-3 mb-4">
          <div className="w-4 h-[1px] bg-gray-900" />
          <h2 className="text-[10px] font-serif italic font-bold uppercase tracking-[0.3em] text-gray-900">Hot Ranking</h2>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-4 px-6">
          {hotGames.map((game, idx) => (
            <div 
              key={game.id} 
              className="min-w-[200px] group cursor-pointer"
              onClick={() => onSelectGame(game)}
            >
              <div className="aspect-[16/9] relative overflow-hidden border border-gray-100 mb-3">
                <img src={game.cover} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                <div className="absolute top-0 left-0 bg-gray-900 text-white text-[8px] font-mono px-2 py-1">
                  TOP {idx + 1}
                </div>
              </div>
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-gray-900 truncate">{game.title}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[7px] text-gray-400 font-bold tracking-widest uppercase">{game.author}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-2 h-2 text-yellow-400 fill-current" />
                  <span className="text-[7px] font-mono font-bold">{game.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="h-px bg-gray-100 mx-6 mt-8" />
      </section>

      {/* Works Display Area */}
      <section className="px-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-4 h-[1px] bg-gray-900" />
          <h2 className="text-[10px] font-serif italic font-bold uppercase tracking-[0.3em] text-gray-900">My Gallery</h2>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
          {displayGames.map(game => (
            <div 
              key={game.id} 
              className="group cursor-pointer"
              onClick={() => onSelectGame(game)}
            >
              <div className="aspect-[16/9] overflow-hidden border border-gray-100 mb-3">
                <img src={game.cover} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
              </div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-900">{game.title}</h3>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {game.tags.map(tag => (
                  <span key={tag} className="text-[6px] text-gray-400 border border-gray-100 px-1 py-0.5 uppercase tracking-tighter">#{tag}</span>
                ))}
              </div>
              <p className="text-[7px] text-gray-300 font-bold tracking-widest uppercase mt-2">BY {game.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Tag Filter Modal */}
      {showTagFilter && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-white overflow-y-auto px-8 py-12"
        >
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-[12px] font-serif italic font-bold uppercase tracking-[0.4em] text-gray-900">Tag Filter</h2>
            <button onClick={() => setShowTagFilter(false)} className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900">Close</button>
          </div>

          <div className="space-y-12">
            {/* Orientation */}
            <section>
              <h3 className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300 mb-6">Orientation / 性向</h3>
              <div className="grid grid-cols-3 gap-2">
                {['bg', 'bl', 'gl', 'gb', '人外', '其他'].map(tag => (
                  <button 
                    key={tag}
                    className={cn(
                      "py-3 text-[9px] font-bold tracking-widest uppercase border transition-all",
                      activeTags.includes(tag) ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-400 border-gray-100"
                    )}
                    onClick={() => setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            {/* Era */}
            <section>
              <h3 className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300 mb-6">Era / 时代</h3>
              <div className="grid grid-cols-3 gap-2">
                {['现代', '古代', '末世', '无限流', '星际', '其他'].map(tag => (
                  <button 
                    key={tag}
                    className={cn(
                      "py-3 text-[9px] font-bold tracking-widest uppercase border transition-all",
                      activeTags.includes(tag) ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-400 border-gray-100"
                    )}
                    onClick={() => setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            {/* Type */}
            <section>
              <h3 className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300 mb-6">Type / 类型</h3>
              <div className="grid grid-cols-3 gap-2">
                {['abo', '校园', '修仙', '宫廷', '纯爱', '病娇', '恐怖', '18禁', '重生', '悬疑', '科幻', '武侠'].map(tag => (
                  <button 
                    key={tag}
                    className={cn(
                      "py-3 text-[9px] font-bold tracking-widest uppercase border transition-all",
                      activeTags.includes(tag) ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-400 border-gray-100"
                    )}
                    onClick={() => setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-16">
            <button 
              onClick={() => setShowTagFilter(false)}
              className="w-full py-5 bg-gray-900 text-white text-[10px] font-bold tracking-[0.4em] uppercase"
            >
              Apply Filters
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HomeView;
