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
      <div className="flex-1 flex flex-col items-center justify-center px-12 text-center space-y-12">
        <div className="w-24 h-24 rounded-none border border-gray-100 flex items-center justify-center bg-white relative group">
          <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-gray-900" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-gray-900" />
          <div className="absolute inset-2 border border-gray-50" />
          <PenTool className="w-8 h-8 text-gray-900" strokeWidth={1} />
        </div>
        <div className="space-y-4">
          <h2 className="text-[11px] font-serif italic font-bold uppercase tracking-[0.4em] text-gray-900">Creative Center</h2>
          <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.25em] leading-relaxed max-w-[280px] mx-auto opacity-60">
            你还没有作品，快去创建一个吧
          </p>
        </div>
        <button 
          onClick={onOpenCreationFlow}
          className="relative group px-12 py-5 bg-gray-900 text-white text-[9px] font-bold tracking-[0.4em] uppercase hover:bg-black transition-all rounded-none overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <div className="relative flex items-center gap-4">
            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
            创建新作品
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-12 pb-24 space-y-12">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-4 h-[1px] bg-gray-900" />
          <h2 className="text-[10px] font-serif italic font-bold uppercase tracking-[0.3em] text-gray-900">My Gallery</h2>
        </div>
        <button 
          onClick={onOpenCreationFlow}
          className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-gray-900 hover:text-gray-600 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          Create New
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {works.map((work: any) => (
          <div key={work.id} className="group bg-white border border-gray-100 p-6 flex flex-col gap-6 hover:border-gray-900 transition-all">
            <div className="flex gap-6">
              <div className="w-32 aspect-[16/9] overflow-hidden border border-gray-50 shrink-0 relative">
                <img src={work.cover} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                <button 
                  onClick={(e) => triggerImageUpload(work.id, e)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="text-[12px] font-bold text-gray-900 uppercase tracking-[0.1em]">{work.title}</h3>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {work.tags?.map((tag: string) => (
                      <span key={tag} className="text-[6px] text-gray-400 border border-gray-100 px-1 py-0.5 uppercase tracking-tighter">#{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-2.5 h-2.5 text-gray-300" strokeWidth={1.5} />
                    <span className="text-[8px] font-mono text-gray-400">{work.plays || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-2.5 h-2.5 text-gray-300" strokeWidth={1.5} />
                    <span className="text-[8px] font-mono text-gray-400">{work.likes || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 border-t border-gray-50 pt-6 gap-px bg-gray-50">
              <button className="bg-white py-3 flex items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-colors">
                <Edit3 className="w-3 h-3" strokeWidth={1.5} />
                Edit
              </button>
              <button className="bg-white py-3 flex items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-colors">
                <BarChart2 className="w-3 h-3" strokeWidth={1.5} />
                Data
              </button>
              <button 
                onClick={() => handleDelete(work.id)}
                className="bg-white py-3 flex items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyWorksView;
