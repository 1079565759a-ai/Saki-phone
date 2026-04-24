import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, User } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ProtagonistManagerProps {
  onClose: () => void;
  appState: any;
  updateState: (key: string, value: any) => void;
}

export const ProtagonistManagerView: React.FC<ProtagonistManagerProps> = ({ onClose, appState, updateState }) => {
  const [protagonist, setProtagonist] = useState(appState.galaProtagonist || {
    nameType: 'custom',
    fixedName: '',
    persona: ''
  });

  const handleSave = () => {
    updateState('galaProtagonist', protagonist);
    onClose();
  };

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[110] bg-white flex flex-col">
      <div className="px-8 pt-16 pb-8 flex items-center justify-between border-b border-gray-100 bg-white/90 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft strokeWidth={1.5} size={20} />
          </button>
          <h2 className="text-[12px] font-serif italic font-bold uppercase tracking-[0.4em] text-gray-900">
            Protagonist / 主人公（我）设置
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-12 space-y-12 pb-24">
        <div className="space-y-4">
          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block flex items-center gap-2">
            <User className="w-3 h-3"/> Name Setting / 姓名设置
          </label>
          <div className="flex flex-col gap-3">
            {[
              { id: 'fixed', label: '固定姓名 (如设定好的主角名)' },
              { id: 'none', label: '无姓名 (始终称呼为你或隐藏姓名)' },
              { id: 'custom', label: '自定义姓名 (开局由玩家填入)' }
            ].map(t => (
              <label key={t.id} className="flex items-center gap-3 cursor-pointer p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition-all">
                <input 
                  type="radio" 
                  name="nameType" 
                  value={t.id} 
                  checked={protagonist.nameType === t.id} 
                  onChange={e => setProtagonist({...protagonist, nameType: e.target.value})}
                  className="w-4 h-4 text-gray-900 accent-gray-900"
                />
                <span className="text-sm font-bold text-gray-700">{t.label}</span>
              </label>
            ))}
          </div>
          {protagonist.nameType === 'fixed' && (
            <div className="pt-4 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Fixed Name / 输入固定姓名</label>
              <input 
                type="text" 
                value={protagonist.fixedName} 
                onChange={e => setProtagonist({...protagonist, fixedName: e.target.value})} 
                className="w-full border-b border-gray-200 bg-transparent py-2 text-base font-bold outline-none focus:border-gray-900" 
                placeholder="例如：林星" 
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Persona / 人设卡 (AI参考)</label>
          <textarea 
            value={protagonist.persona} 
            onChange={e => setProtagonist({...protagonist, persona: e.target.value})} 
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm h-48 resize-none outline-none focus:border-gray-900 leading-relaxed" 
            placeholder="描述主人公的性格、背景、习惯... (不需要立绘)" 
          />
        </div>

        <button onClick={handleSave} className="w-full py-4 bg-gray-900 text-white font-bold tracking-widest uppercase rounded-lg text-sm hover:opacity-90">
          Save Protagonist Settings
        </button>
      </div>
    </motion.div>
  );
};
