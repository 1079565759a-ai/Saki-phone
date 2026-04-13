import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  MoreHorizontal, 
  ChevronRight, 
  Star, 
  Search,
  Camera
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { compressImage } from '../../utils/image';

interface HomeViewProps {
  onSelectGame: (game: any) => void;
  onOpenStore: () => void;
  onImportGame: () => void;
  appState: any;
  updateState: (key: string, value: any) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onSelectGame, onOpenStore, onImportGame, appState, updateState }) => {
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingImage, setEditingImage] = useState<{ type: string, id: number } | null>(null);

  const banners = appState.galaBanners || [];
  const hotGames = appState.galaHotGames || [];
  const displayGames = appState.galaMyGames || [];

  const defaultTags = ['校园', '重生', 'abo', '古风', '病娇', '恐怖', '18禁'];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingImage) return;

    try {
      const compressedDataUrl = await compressImage(file);
      
      if (editingImage.type === 'banner') {
        const updatedBanners = banners.map((b: any) => 
          b.id === editingImage.id ? { ...b, cover: compressedDataUrl } : b
        );
        updateState('galaBanners', updatedBanners);
      } else if (editingImage.type === 'hot') {
        const updatedHot = hotGames.map((g: any) => 
          g.id === editingImage.id ? { ...g, cover: compressedDataUrl } : g
        );
        updateState('galaHotGames', updatedHot);
      } else if (editingImage.type === 'my') {
        const updatedMy = displayGames.map((g: any) => 
          g.id === editingImage.id ? { ...g, cover: compressedDataUrl } : g
        );
        updateState('galaMyGames', updatedMy);
      }
    } catch (error) {
      console.error("Failed to process image", error);
    } finally {
      setEditingImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerImageUpload = (type: string, id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingImage({ type, id });
    fileInputRef.current?.click();
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />
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
          {banners.map((banner: any) => (
            <div key={banner.id} className="min-w-full aspect-[16/9] snap-center rounded-none overflow-hidden border border-gray-100 relative group">
              <img src={banner.cover} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button 
                onClick={(e) => triggerImageUpload('banner', banner.id, e)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
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
          {hotGames.map((game: any, idx: number) => (
            <div 
              key={game.id} 
              className="min-w-[200px] group cursor-pointer"
              onClick={() => onSelectGame(game)}
            >
              <div className="aspect-[16/9] relative overflow-hidden border border-gray-100 mb-3">
                <img src={game.cover} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                <div className="absolute top-0 left-0 bg-gray-900 text-white text-[8px] font-mono px-2 py-1 z-10">
                  TOP {idx + 1}
                </div>
                <button 
                  onClick={(e) => triggerImageUpload('hot', game.id, e)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
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
          {displayGames.map((game: any) => (
            <div 
              key={game.id} 
              className="group cursor-pointer"
              onClick={() => onSelectGame(game)}
            >
              <div className="aspect-[16/9] overflow-hidden border border-gray-100 mb-3 relative">
                <img src={game.cover} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                <button 
                  onClick={(e) => triggerImageUpload('my', game.id, e)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-900">{game.title}</h3>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {game.tags.map((tag: string) => (
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
