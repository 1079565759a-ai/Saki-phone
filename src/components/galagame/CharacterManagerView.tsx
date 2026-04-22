import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, Image as ImageIcon, Trash2, Edit3, Camera, X } from 'lucide-react';
import { compressImage } from '../../utils/image';

interface CharacterManagerProps {
  onClose: () => void;
  appState: any;
  updateState: (key: string, value: any) => void;
}

export const CharacterManagerView: React.FC<CharacterManagerProps> = ({ onClose, appState, updateState }) => {
  const characters = appState.galaCharacters || [];
  const [editingChar, setEditingChar] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadKey, setCurrentUploadKey] = useState<string>(''); // e.g., 'photo', 'emotions.happy'

  const handleSaveChar = (char: any) => {
    if (char.id) {
      updateState('galaCharacters', characters.map((c: any) => c.id === char.id ? char : c));
    } else {
      updateState('galaCharacters', [{ ...char, id: Date.now() }, ...characters]);
    }
    setEditingChar(null);
  };

  const handleDelete = (id: number) => {
    updateState('galaCharacters', characters.filter((c: any) => c.id !== id));
  };

  const handleUploadClick = (key: string) => {
    setCurrentUploadKey(key);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingChar) return;
    try {
      const dataUrl = await compressImage(file);
      if (currentUploadKey === 'photo') {
        setEditingChar({ ...editingChar, photo: dataUrl });
      } else if (currentUploadKey.startsWith('emotions.')) {
        const emoKey = currentUploadKey.split('.')[1];
        setEditingChar({
          ...editingChar,
          emotions: {
            ...editingChar.emotions,
            [emoKey]: dataUrl
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddCustomEmotion = () => {
    const emotionName = prompt('请输入新情绪名称（如：害羞、震惊、吃醋）');
    if (emotionName && emotionName.trim()) {
      setEditingChar({
        ...editingChar,
        emotions: {
          ...editingChar.emotions,
          [emotionName.trim()]: ''
        }
      });
    }
  };

  const handleRemoveCustomEmotion = (emoKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newEmotions = { ...editingChar.emotions };
    delete newEmotions[emoKey];
    setEditingChar({ ...editingChar, emotions: newEmotions });
  };

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[110] bg-white flex flex-col">
      <div className="px-8 pt-16 pb-8 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={editingChar ? () => setEditingChar(null) : onClose} className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft strokeWidth={1.5} size={20} />
          </button>
          <h2 className="text-[12px] font-serif italic font-bold uppercase tracking-[0.4em] text-gray-900">
            {editingChar ? 'Edit Character' : 'Characters'}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-12">
        {!editingChar ? (
          <div className="space-y-4">
            <button 
              onClick={() => setEditingChar({ name: '新角色', persona: '', desc: '', photo: '', emotions: { happy: '', angry: '', sad: '', joy: '', other: [] } })}
              className="w-full py-6 border border-dashed border-gray-300 text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all flex flex-col items-center justify-center gap-2 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Create Character</span>
            </button>
            <div className="grid grid-cols-2 gap-4 pt-4">
              {characters.map((c: any) => (
                <div key={c.id} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-100 group shadow-sm bg-gray-50">
                  {c.photo ? <img src={c.photo} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-6 h-6 text-gray-300"/></div>}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <h3 className="text-white text-sm font-bold truncate">{c.name}</h3>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button onClick={() => setEditingChar(c)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 hover:scale-110 transition-transform"><Edit3 className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(c.id)} className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 pb-24">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            
            <div className="flex gap-6 items-start">
              <div onClick={() => handleUploadClick('photo')} className="w-32 aspect-[3/4] bg-gray-50 border border-gray-200 rounded-lg overflow-hidden relative cursor-pointer group flex-shrink-0">
                {editingChar.photo ? <img src={editingChar.photo} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><Camera className="w-6 h-6 text-gray-300"/></div>}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-white text-[10px] font-bold">主立绘</span></div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Name / 名字</label>
                  <input type="text" value={editingChar.name || ''} onChange={e => setEditingChar({...editingChar, name: e.target.value})} className="w-full border-b border-gray-200 bg-transparent py-2 text-base font-bold outline-none focus:border-gray-900" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Persona / 人设属性</label>
                  <input type="text" placeholder="傲娇 / 话少 / 冰雪聪明..." value={editingChar.persona || ''} onChange={e => setEditingChar({...editingChar, persona: e.target.value})} className="w-full border-b border-gray-200 bg-transparent py-2 text-sm outline-none focus:border-gray-900" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Description / 详细设定</label>
              <textarea value={editingChar.desc || ''} onChange={e => setEditingChar({...editingChar, desc: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm h-32 resize-none outline-none focus:border-gray-900" placeholder="角色的过往、性格细节、口癖..." />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Emotions / 情绪立绘</label>
                <button onClick={handleAddCustomEmotion} className="text-[8px] font-bold uppercase tracking-widest text-gray-900 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> 添加其他情绪
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {Object.keys(editingChar.emotions || {}).map((emo) => {
                  const defaultLabel = emo === 'happy' ? '喜' : emo === 'angry' ? '怒' : emo === 'sad' ? '哀' : emo === 'joy' ? '乐' : emo;
                  const isCustom = !['happy', 'angry', 'sad', 'joy'].includes(emo);
                  return (
                    <div key={emo} className="space-y-2 flex flex-col items-center relative">
                      <div onClick={() => handleUploadClick(`emotions.${emo}`)} className="w-full aspect-[3/4] bg-gray-50 border border-gray-200 rounded-lg overflow-hidden relative cursor-pointer group">
                        {editingChar.emotions?.[emo] ? <img src={editingChar.emotions[emo]} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><Plus className="w-4 h-4 text-gray-300"/></div>}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera className="w-4 h-4 text-white"/></div>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1">
                        {defaultLabel}
                        {isCustom && (
                          <button onClick={(e) => handleRemoveCustomEmotion(emo, e)} className="text-gray-300 hover:text-red-500 ml-1">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button onClick={() => handleSaveChar(editingChar)} className="w-full py-4 bg-gray-900 text-white font-bold tracking-widest uppercase rounded-lg text-sm hover:opacity-90">
              Save Character
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
