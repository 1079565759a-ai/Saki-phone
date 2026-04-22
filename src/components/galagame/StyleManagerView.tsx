import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Trash2, Edit3 } from 'lucide-react';

interface StyleManagerProps {
  onClose: () => void;
  appState: any;
  updateState: (key: string, value: any) => void;
}

export const StyleManagerView: React.FC<StyleManagerProps> = ({ onClose, appState, updateState }) => {
  const styles = appState.galaStyles || [];
  const [editingStyle, setEditingStyle] = useState<any | null>(null);

  const handleSaveStyle = (style: any) => {
    if (style.id) {
      updateState('galaStyles', styles.map((s: any) => s.id === style.id ? style : s));
    } else {
      updateState('galaStyles', [{ ...style, id: Date.now() }, ...styles]);
    }
    setEditingStyle(null);
  };

  const handleDelete = (id: number) => {
    updateState('galaStyles', styles.filter((s: any) => s.id !== id));
  };

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[110] bg-white flex flex-col">
      <div className="px-8 pt-16 pb-8 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={editingStyle ? () => setEditingStyle(null) : onClose} className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft strokeWidth={1.5} size={20} />
          </button>
          <h2 className="text-[12px] font-serif italic font-bold uppercase tracking-[0.4em] text-gray-900">
            {editingStyle ? 'Edit Style' : 'Writing Styles'}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-12">
        {!editingStyle ? (
          <div className="space-y-4">
            <button 
              onClick={() => setEditingStyle({ name: '新文风', desc: '' })}
              className="w-full py-6 border border-dashed border-gray-300 text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all flex flex-col items-center justify-center gap-2 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Create Style</span>
            </button>
            <div className="grid grid-cols-1 gap-4 pt-4">
              {styles.map((s: any) => (
                <div key={s.id} className="p-6 rounded-lg border border-gray-200 shadow-sm bg-gray-50 flex flex-col gap-2 relative group">
                  <h3 className="text-gray-900 text-sm font-bold">{s.name}</h3>
                  <p className="text-gray-500 text-xs line-clamp-2">{s.desc}</p>
                  
                  <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2 bg-white/80 p-1 rounded backdrop-blur-sm">
                    <button onClick={() => setEditingStyle(s)} className="p-1.5 text-gray-500 hover:text-gray-900"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 pb-24">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Style Name / 文风名称</label>
                <input type="text" value={editingStyle.name || ''} onChange={e => setEditingStyle({...editingStyle, name: e.target.value})} className="w-full border-b border-gray-200 bg-transparent py-2 text-base font-bold outline-none focus:border-gray-900" placeholder="例如：日系轻小说风格 / 古剑奇谈" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Description / 写作风格指令（AI参考）</label>
                <textarea value={editingStyle.desc || ''} onChange={e => setEditingStyle({...editingStyle, desc: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm h-48 resize-none outline-none focus:border-gray-900" placeholder="请以文艺、细腻的笔触，多使用隐喻和景物描写来烘托人物情感，避免直白的叙述..." />
              </div>
            </div>

            <button onClick={() => handleSaveStyle(editingStyle)} className="w-full py-4 bg-gray-900 text-white font-bold tracking-widest uppercase rounded-lg text-sm hover:opacity-90">
              Save Style
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
