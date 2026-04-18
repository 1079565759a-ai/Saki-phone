import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  PenTool, 
  Plus, 
  ChevronRight, 
  Trash2, 
  Edit3, 
  BarChart2, 
  Image as ImageIcon,
  ArrowLeft,
  Check,
  Camera
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { compressImage } from '../../utils/image';

interface MyWorksViewProps {
  onOpenCreationFlow: () => void;
  appState: any;
  updateState: (key: string, value: any) => void;
}

const MyWorksView: React.FC<MyWorksViewProps> = ({ onOpenCreationFlow, appState, updateState }) => {
  const works = appState.galaMyGames || [];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    const updatedWorks = works.filter((w: any) => w.id !== id);
    updateState('galaMyGames', updatedWorks);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || editingId === null) return;

    try {
      const compressedDataUrl = await compressImage(file);
      const updatedWorks = works.map((w: any) => 
        w.id === editingId ? { ...w, cover: compressedDataUrl } : w
      );
      updateState('galaMyGames', updatedWorks);
    } catch (error) {
      console.error("Failed to process image", error);
    } finally {
      setEditingId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerImageUpload = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    fileInputRef.current?.click();
  };

  if (works.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto pb-24 bg-gradient-to-b from-[#fdfbfb] to-[#f5f1f0] relative h-full">
        {/* Decorative Petals Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50 z-0">
          <div className="absolute w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(252,239,238,0.6)_0%,transparent_60%)] blur-2xl top-10 -left-20" />
          <div className="absolute w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(245,241,240,0.8)_0%,transparent_60%)] blur-3xl bottom-0 -right-20" />
        </div>

        {/* Top Bar */}
        <div className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 z-20">
          <div className="w-9" />
          <div className="flex flex-col items-center select-none">
            <h1 className="text-xl md:text-2xl font-serif text-[#d49a9f] tracking-[0.2em] relative z-10" style={{ textShadow: '0 2px 8px rgba(212,154,159,0.3)' }}>
              我的创作
            </h1>
            <span className="text-[10px] font-serif italic text-[#c5a3a5] mt-0.5 tracking-wider">SakuLove</span>
          </div>
          <button onClick={onOpenCreationFlow} className="p-2 bg-white/50 rounded-full hover:bg-white/80 border border-[#fcefee] text-[#c5a3a5] shadow-sm transition-all focus:outline-none flex items-center justify-center relative active:scale-95">
            <Plus className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="relative z-10 px-6 pt-4 pb-8 mt-16 flex flex-col items-center justify-center text-center opacity-80 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#fcefee] to-[#fdfbfb] shadow-[0_4px_24px_rgba(212,154,159,0.2)] mb-6 flex items-center justify-center relative">
            <div className="absolute w-8 h-8 rotate-45 bg-[#fcefee] rounded-[50%_0_50%_50%]" />
          </div>
          <h2 className="text-[#c5a3a5] font-serif text-lg tracking-[0.2em] font-light mb-3">漫漫樱落，静候心音</h2>
          <p className="text-[#c9b8b8] text-xs font-light tracking-[0.1em] leading-relaxed">
            这里是空白的书页<br/>等待着你写下温柔的篇章
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-gradient-to-b from-[#fdfbfb] to-[#f5f1f0] relative h-full">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

      {/* Decorative Petals Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50 z-0">
        <div className="absolute w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(252,239,238,0.6)_0%,transparent_60%)] blur-2xl top-10 -left-20" />
        <div className="absolute w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(245,241,240,0.8)_0%,transparent_60%)] blur-3xl bottom-0 -right-20" />
      </div>

      {/* Top Bar */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 z-20">
        <div className="w-9" />
        <div className="flex flex-col items-center select-none">
          <h1 className="text-xl md:text-2xl font-serif text-[#d49a9f] tracking-[0.2em] relative z-10" style={{ textShadow: '0 2px 8px rgba(212,154,159,0.3)' }}>
            我的创作
          </h1>
          <span className="text-[10px] font-serif italic text-[#c5a3a5] mt-0.5 tracking-wider">SakuLove</span>
        </div>
        <button onClick={onOpenCreationFlow} className="p-2 bg-white/50 rounded-full hover:bg-white/80 border border-[#fcefee] text-[#c5a3a5] shadow-sm transition-all focus:outline-none flex items-center justify-center relative active:scale-95">
          <Plus className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="relative z-10 px-6 pt-4 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {works.map((work: any) => (
            <motion.div key={work.id} layoutId={`work-${work.id}`} className="group relative rounded-2xl bg-white/60 backdrop-blur-md shadow-[0_8px_24px_rgba(212,154,159,0.08)] border border-[#ede6e6] overflow-hidden flex flex-col">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#fcefee]/50">
                <img src={work.cover} alt={work.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#c5a3a5]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button onClick={(e) => triggerImageUpload(work.id, e)} className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#d49a9f] hover:bg-white shadow-sm">
                    <Camera className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(work.id); }} className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#d49a9f] hover:bg-white shadow-sm">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-[#d49a9f] font-serif text-xs font-bold leading-tight mb-2 line-clamp-2">{work.title}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {work.tags?.slice(0, 2).map((tag: string, idx: number) => (
                      <span key={idx} className="text-[8px] px-1.5 py-0.5 rounded-md bg-[#fcefee] text-[#c5a3a5] tracking-widest">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#c9b8b8] group-hover:text-[#c5a3a5] transition-colors cursor-pointer">
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span className="text-[9px] tracking-widest">数据</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#c9b8b8] group-hover:text-[#c5a3a5] transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); onOpenCreationFlow(); }}>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="text-[9px] tracking-widest">编辑</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyWorksView;
