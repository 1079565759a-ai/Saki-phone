import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Plus, Trash2, Camera, X, Image as ImageIcon, Check } from 'lucide-react';
import { compressImage } from '../../utils/image';

interface WorkEditorViewProps {
  work: any;
  onClose: () => void;
  appState: any;
  updateState: (key: string, value: any) => void;
}

export const WorkEditorView: React.FC<WorkEditorViewProps> = ({ work, onClose, appState, updateState }) => {
  const [editingWork, setEditingWork] = useState(work);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chapters = editingWork.chapters || [];
  const stylesList = appState.galaStyles || [];

  const handleSave = () => {
    const updatedGames = (appState.galaMyGames || []).map((g: any) => g.id === editingWork.id ? editingWork : g);
    updateState('galaMyGames', updatedGames);
    onClose();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImage(file);
      setEditingWork({ ...editingWork, cover: compressedDataUrl });
    } catch (error) {
      console.error("Failed to process image", error);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addChapter = () => {
    const newChapter = {
      id: Date.now(),
      title: `第${chapters.length + 1}章`,
      desc: '', // 内容描述
      branchEndings: [''], // 分支结局
      trueEnding: '' // 真实结局
    };
    setEditingWork({ ...editingWork, chapters: [...chapters, newChapter] });
  };

  const updateChapter = (index: number, key: string, value: any) => {
    const newChapters = [...chapters];
    newChapters[index] = { ...newChapters[index], [key]: value };
    setEditingWork({ ...editingWork, chapters: newChapters });
  };

  const removeChapter = (index: number) => {
    const newChapters = [...chapters];
    newChapters.splice(index, 1);
    setEditingWork({ ...editingWork, chapters: newChapters });
  };

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[110] bg-[#fdfbfb] flex flex-col font-sans">
      {/* Top Bar */}
      <div className="px-6 py-6 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
          <ArrowLeft strokeWidth={1.5} size={20} />
        </button>
        <h2 className="text-sm font-serif text-[#d49a9f] tracking-[0.2em] font-bold">作品详细编辑</h2>
        <button onClick={handleSave} className="px-4 py-2 bg-[#d49a9f] text-white text-xs font-bold rounded-full hover:bg-[#c5a3a5] tracking-widest transition-all">保存</button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

        <div className="space-y-10 max-w-sm mx-auto pb-24">
          <div className="space-y-4">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Cover / 首页照片 (可重新上传)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gray-50 cursor-pointer group shadow-sm border border-gray-100"
            >
              {editingWork.cover ? (
                <img src={editingWork.cover} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300"><ImageIcon className="w-8 h-8"/></div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Title / 作品名</label>
            <input type="text" value={editingWork.title} onChange={e => setEditingWork({...editingWork, title: e.target.value})} className="w-full border-b border-gray-200 bg-transparent py-2 text-base font-bold outline-none focus:border-[#d49a9f] text-[#d49a9f]" />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Introduction / 作品简介</label>
            <textarea value={editingWork.intro || ''} onChange={e => setEditingWork({...editingWork, intro: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm h-32 resize-none outline-none focus:border-[#d49a9f] leading-relaxed" />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Worldview / 世界观设定</label>
            {appState.galaWorldviews?.length > 0 ? (
              <select 
                value={editingWork.worldview?.id || ''} 
                onChange={e => {
                  const wv = appState.galaWorldviews.find((w: any) => w.id === parseInt(e.target.value));
                  setEditingWork({...editingWork, worldview: wv});
                }}
                className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-bold outline-none focus:border-[#d49a9f] text-gray-800"
              >
                <option value="">(不使用世界观)</option>
                {appState.galaWorldviews.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-gray-400">暂无世界观，在"我的"中配置</p>
            )}
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Style Reference / 文风设置</label>
            {stylesList.length === 0 ? (
              <p className="text-xs text-gray-400">暂无文风，在"我的" - "我的创作资产"中配置文风</p>
            ) : (
              <select 
                value={editingWork.styleId || ''} 
                onChange={e => setEditingWork({...editingWork, styleId: e.target.value})}
                className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-bold outline-none focus:border-[#d49a9f] text-gray-800"
              >
                <option value="">(不使用特定文风)</option>
                {stylesList.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-[#d49a9f] font-bold uppercase tracking-widest">Chapters / 章节与结局线路</label>
              <button onClick={addChapter} className="text-[8px] font-bold text-[#d49a9f] uppercase bg-[#fcefee] px-3 py-1.5 rounded-full hover:bg-[#ebd5d5] transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3"/> 新增章节
              </button>
            </div>

            <div className="space-y-6">
              {chapters.map((chap: any, cIdx: number) => (
                <div key={chap.id} className="p-5 bg-white border border-[#fcefee] rounded-2xl shadow-[0_4px_16px_rgba(212,154,159,0.05)] relative space-y-4">
                  <button onClick={() => removeChapter(cIdx)} className="absolute top-4 right-4 text-gray-300 hover:text-red-400">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                  
                  <div>
                    <input type="text" value={chap.title} onChange={e => updateChapter(cIdx, 'title', e.target.value)} className="w-3/4 border-b border-gray-100 bg-transparent py-1 text-sm font-bold text-gray-900 outline-none focus:border-[#d49a9f]" placeholder="章节名 (如：第一章·初遇)" />
                  </div>
                  
                  <div>
                    <label className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-1">内容描述 (AI 生成参考)</label>
                    <textarea value={chap.desc} onChange={e => updateChapter(cIdx, 'desc', e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs h-20 resize-none outline-none focus:border-[#d49a9f] transition-all" placeholder="主角来到新的小镇，遇见了..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-between">
                      <span>分支结局 (通往Bad/Normal End)</span>
                      <button onClick={() => updateChapter(cIdx, 'branchEndings', [...chap.branchEndings, ''])} className="text-[#d49a9f]"><Plus className="w-3 h-3"/></button>
                    </label>
                    {chap.branchEndings.map((bEnd: string, bIdx: number) => (
                      <div key={bIdx} className="flex gap-2 items-center">
                        <input type="text" value={bEnd} onChange={e => {
                          const newB = [...chap.branchEndings];
                          newB[bIdx] = e.target.value;
                          updateChapter(cIdx, 'branchEndings', newB);
                        }} className="flex-1 bg-gray-50 border border-gray-100 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-[#d49a9f]" placeholder="例如：选择了放弃，回到了原点..." />
                        <button onClick={() => {
                          const newB = [...chap.branchEndings];
                          newB.splice(bIdx, 1);
                          updateChapter(cIdx, 'branchEndings', newB);
                        }} className="text-gray-300 hover:text-red-400"><X className="w-3 h-3"/></button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-[9px] text-[#d49a9f] font-bold uppercase tracking-widest block mb-1 flex items-center gap-1">
                      <Check className="w-3 h-3"/> 真实结局 (True Ending)
                    </label>
                    <textarea value={chap.trueEnding} onChange={e => updateChapter(cIdx, 'trueEnding', e.target.value)} className="w-full p-3 bg-[#fcefee]/30 border border-[#fcefee] rounded-xl text-xs h-16 resize-none outline-none focus:border-[#d49a9f] transition-all" placeholder="例如：发现了隐藏的真相，与他一起踏上新旅程..." />
                  </div>
                </div>
              ))}
              {chapters.length === 0 && (
                <div className="text-center py-8 opacity-50">
                  <p className="text-[10px] tracking-widest text-[#d49a9f]">暂无章节，点击右上角新增</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
