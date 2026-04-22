import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Image as ImageIcon, Trash2, Edit3, X, Camera } from 'lucide-react';
import { compressImage } from '../../utils/image';

interface SceneManagerProps {
  onClose: () => void;
  appState: any;
  updateState: (key: string, value: any) => void;
}

export const SceneManagerView: React.FC<SceneManagerProps> = ({ onClose, appState, updateState }) => {
  const scenes = appState.galaScenes || [];
  const [editingScene, setEditingScene] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveScene = (scene: any) => {
    if (scene.id) {
      updateState('galaScenes', scenes.map((s: any) => s.id === scene.id ? scene : s));
    } else {
      updateState('galaScenes', [{ ...scene, id: Date.now() }, ...scenes]);
    }
    setEditingScene(null);
  };

  const handleDelete = (id: number) => {
    updateState('galaScenes', scenes.filter((s: any) => s.id !== id));
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingScene) return;
    try {
      const dataUrl = await compressImage(file);
      setEditingScene({
        ...editingScene,
        images: [...(editingScene.images || []), dataUrl]
      });
    } catch (err) {
      console.error(err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...editingScene.images];
    newImages.splice(index, 1);
    setEditingScene({ ...editingScene, images: newImages });
  };

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[110] bg-white flex flex-col">
      <div className="px-8 pt-16 pb-8 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={editingScene ? () => setEditingScene(null) : onClose} className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft strokeWidth={1.5} size={20} />
          </button>
          <h2 className="text-[12px] font-serif italic font-bold uppercase tracking-[0.4em] text-gray-900">
            {editingScene ? 'Edit Scene' : 'Scenes'}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-12">
        {!editingScene ? (
          <div className="space-y-4">
            <button 
              onClick={() => setEditingScene({ name: '新地点', desc: '', images: [] })}
              className="w-full py-6 border border-dashed border-gray-300 text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all flex flex-col items-center justify-center gap-2 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Create Location</span>
            </button>
            <div className="grid grid-cols-1 gap-4 pt-4">
              {scenes.map((s: any) => (
                <div key={s.id} className="relative aspect-[16/9] rounded-lg overflow-hidden border border-gray-100 group shadow-sm bg-gray-50">
                  {s.images && s.images[0] ? <img src={s.images[0]} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-6 h-6 text-gray-300"/></div>}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-white text-base font-bold truncate">{s.name}</h3>
                    <p className="text-white/80 text-xs truncate">{s.desc}</p>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                    <button onClick={() => setEditingScene(s)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 hover:scale-110 transition-transform"><Edit3 className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(s.id)} className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 pb-24">
            <input type="file" ref={fileInputRef} onChange={handleUploadImage} accept="image/*" className="hidden" />
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Location Name / 地点名称</label>
                <input type="text" value={editingScene.name || ''} onChange={e => setEditingScene({...editingScene, name: e.target.value})} className="w-full border-b border-gray-200 bg-transparent py-2 text-base font-bold outline-none focus:border-gray-900" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Description / 地景描述 AI辅助参考</label>
                <textarea value={editingScene.desc || ''} onChange={e => setEditingScene({...editingScene, desc: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm h-32 resize-none outline-none focus:border-gray-900" placeholder="黄昏时分的旧校舍，阳光透过破裂的窗户洒在地面..." />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block">Images / 场景组图</label>
              <div className="grid grid-cols-3 gap-4">
                {(editingScene.images || []).map((img: string, idx: number) => (
                  <div key={idx} className="aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 relative group">
                    <img src={img} className="w-full h-full object-cover" />
                    <button onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 bg-black/60 w-6 h-6 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button onClick={() => fileInputRef.current?.click()} className="aspect-[4/3] border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-gray-400">
                  <Camera className="w-5 h-5"/>
                  <span className="text-[10px] font-bold">Add Image</span>
                </button>
              </div>
            </div>

            <button onClick={() => handleSaveScene(editingScene)} className="w-full py-4 bg-gray-900 text-white font-bold tracking-widest uppercase rounded-lg text-sm hover:opacity-90 mt-8">
              Save Location
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
