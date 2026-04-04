import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Heart, 
  Plus, 
  Sparkles, 
  Send, 
  User, 
  Settings, 
  MoreHorizontal, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Camera, 
  Smile, 
  Image as ImageIcon,
  MessageCircle,
  ArrowRight,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { compressImage } from '../utils/image';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Interfaces ---
export interface CharCharacter {
  id: string;
  name: string;
  title: string;
  avatar: string;
  tags: string[];
  description: string;
  persona: string;
  greeting: string;
  affection: number;
  mood: string;
  isFavorite: boolean;
}

export interface PersonaMask {
  id: string;
  name: string;
  avatar: string;
  description: string;
  boundCharacterIds: string[];
}

interface CharAppProps {
  onClose: () => void;
  appState: any;
  updateState: (key: string, value: any) => void;
  setIsChatOpen: (v: boolean) => void;
  isFullscreen?: boolean;
}

// --- Components ---

export default function CharApp({ onClose, appState, updateState, setIsChatOpen, isFullscreen }: CharAppProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'detail' | 'masks' | 'create'>('list');
  const [selectedCharId, setSelectedCharId] = useState<string | null>(appState.selectedCharId);
  const [selectedMaskId, setSelectedMaskId] = useState<string | null>(appState.selectedMaskId);
  const [isCreating, setIsCreating] = useState(false);

  const characters: CharCharacter[] = appState.charCharacters || [];
  const masks: PersonaMask[] = appState.personaMasks || [];
  const selectedChar = characters.find(c => c.id === selectedCharId) || null;

  useEffect(() => {
    updateState('selectedCharId', selectedCharId);
  }, [selectedCharId]);

  useEffect(() => {
    updateState('selectedMaskId', selectedMaskId);
  }, [selectedMaskId]);

  const handleCharClick = (char: CharCharacter) => {
    setSelectedCharId(char.id);
    setActiveTab('detail');
  };

  const handleCreateChar = (newChar: CharCharacter) => {
    const updatedChars = [...characters, newChar];
    updateState('charCharacters', updatedChars);
    setIsCreating(false);
  };

  const handleUpdateChar = (updatedChar: CharCharacter) => {
    const updatedChars = characters.map(c => c.id === updatedChar.id ? updatedChar : c);
    updateState('charCharacters', updatedChars);
  };

  const handleDeleteChar = (id: string) => {
    const updatedChars = characters.filter(c => c.id !== id);
    updateState('charCharacters', updatedChars);
    if (selectedCharId === id) {
      setSelectedCharId(null);
      setActiveTab('list');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 bg-[#FFF9FB] flex flex-col overflow-hidden font-sans text-gray-800"
    >
      <AnimatePresence mode="wait">
        {activeTab === 'list' && (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 overflow-hidden"
          >
            <CharList 
              characters={characters} 
              onCharClick={handleCharClick} 
              onClose={onClose} 
              onOpenMasks={() => setActiveTab('masks')}
              onOpenCreate={() => setIsCreating(true)}
            />
          </motion.div>
        )}
        {activeTab === 'detail' && selectedChar && (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-hidden"
          >
            <CharDetail 
              character={selectedChar} 
              onBack={() => setActiveTab('list')} 
              onUpdate={handleUpdateChar}
              onDelete={handleDeleteChar}
              setIsChatOpen={setIsChatOpen}
              onClose={onClose}
              updateAppState={updateState}
            />
          </motion.div>
        )}
        {activeTab === 'masks' && (
          <motion.div 
            key="masks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 overflow-hidden"
          >
            <MaskManagement 
              masks={masks} 
              onBack={() => setActiveTab('list')} 
              updateState={updateState}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Character Modal */}
      <AnimatePresence>
        {isCreating && (
          <CreateCharModal 
            onClose={() => setIsCreating(false)} 
            onCreate={handleCreateChar} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- 1. Char List (Home) ---
function CharList({ characters, onCharClick, onClose, onOpenMasks, onOpenCreate }: { 
  characters: CharCharacter[], 
  onCharClick: (c: CharCharacter) => void, 
  onClose: () => void,
  onOpenMasks: () => void,
  onOpenCreate: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pt-12 pb-4 px-6 flex items-center justify-between bg-white/40 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 font-serif">Meet</h1>
        <button onClick={onOpenMasks} className="p-2 -mr-2 text-gray-400 hover:text-gray-900 transition-colors">
          <User className="w-6 h-6" />
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          {characters.map(char => (
            <motion.div 
              key={char.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCharClick(char)}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-pink-50/50 group relative"
            >
              <div className="aspect-[3/4] relative">
                <img src={char.avatar} className="w-full h-full object-cover" alt={char.name} referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-sm font-bold truncate">{char.name}</div>
                  <div className="text-[10px] opacity-80 truncate">{char.title}</div>
                </div>
                <button className="absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors">
                  <Heart className={cn("w-3.5 h-3.5", char.isFavorite && "fill-pink-500 text-pink-500")} />
                </button>
              </div>
              <div className="p-3 flex flex-wrap gap-1">
                {char.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[8px] px-2 py-0.5 bg-pink-50 text-pink-400 rounded-full font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
          
          {/* Add Button */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenCreate}
            className="aspect-[3/4] bg-white rounded-3xl border-2 border-dashed border-pink-100 flex flex-col items-center justify-center gap-2 text-pink-200 hover:text-pink-400 hover:border-pink-300 transition-all"
          >
            <Plus className="w-8 h-8" />
            <span className="text-xs font-bold">Create</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// --- 2. Char Detail ---
function CharDetail({ character, onBack, onUpdate, onDelete, setIsChatOpen, onClose, updateAppState }: { 
  character: CharCharacter, 
  onBack: () => void, 
  onUpdate: (c: CharCharacter) => void,
  onDelete: (id: string) => void,
  setIsChatOpen: (v: boolean) => void,
  onClose: () => void,
  updateAppState: (k: string, v: any) => void
}) {
  const handleStartChat = () => {
    updateAppState('selectedCharId', character.id);
    onClose();
    setIsChatOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Hero */}
      <div className="h-[50vh] relative">
        <img src={character.avatar} className="w-full h-full object-cover" alt={character.name} referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        
        <button 
          onClick={onBack}
          className="absolute top-12 left-6 w-10 h-10 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 font-serif mb-1">{character.name}</h2>
              <p className="text-sm text-pink-400 font-medium">{character.title}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onUpdate({ ...character, isFavorite: !character.isFavorite })}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-pink-500 transition-colors"
              >
                <Heart className={cn("w-6 h-6", character.isFavorite && "fill-pink-500 text-pink-500")} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 overflow-y-auto px-8 pb-32">
        <div className="flex gap-4 mb-8">
          <div className="flex-1 bg-pink-50/50 rounded-2xl p-4 border border-pink-50">
            <div className="text-[10px] text-pink-300 font-bold uppercase tracking-widest mb-1">好感度</div>
            <div className="text-lg font-bold text-pink-500">{character.affection}%</div>
          </div>
          <div className="flex-1 bg-blue-50/50 rounded-2xl p-4 border border-blue-50">
            <div className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mb-1">心情</div>
            <div className="text-lg font-bold text-blue-500">{character.mood}</div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">角色简介</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{character.description}</p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">性格标签</h3>
            <div className="flex flex-wrap gap-2">
              {character.tags.map(tag => (
                <span key={tag} className="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-full text-xs font-medium border border-gray-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-white via-white to-transparent">
        <button 
          onClick={handleStartChat}
          className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          开始聊天
        </button>
        <div className="text-center text-[10px] text-gray-400 font-medium mt-4">
          角色已就绪，点击上方按钮或前往“通讯”界面开启对话
        </div>
      </div>
    </div>
  );
}

// --- 4. Mask Management ---
function MaskManagement({ masks, onBack, updateState }: { 
  masks: PersonaMask[], 
  onBack: () => void,
  updateState: (k: string, v: any) => void
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingMask, setEditingMask] = useState<PersonaMask | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    const updated = masks.filter(m => m.id !== id);
    updateState('personaMasks', updated);
  };

  const handleSave = (mask: PersonaMask) => {
    if (editingMask) {
      const updated = masks.map(m => m.id === mask.id ? mask : m);
      updateState('personaMasks', updated);
    } else {
      const updated = [...masks, { ...mask, id: `mask-${Date.now()}` }];
      updateState('personaMasks', updated);
    }
    setIsCreating(false);
    setEditingMask(null);
    setTempAvatar(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 400, 400, 0.7);
        setTempAvatar(compressed);
      } catch (err) {
        console.error('Image compression failed', err);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFF9FB]">
      {/* Header */}
      <div className="pt-12 pb-4 px-6 flex items-center justify-between bg-white/40 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 font-serif">人设面具</h1>
        <button 
          onClick={() => setIsCreating(true)}
          className="p-2 -mr-2 text-pink-400 hover:text-pink-600 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {masks.map(mask => (
          <div key={mask.id} className="bg-white rounded-3xl p-5 border border-pink-50 shadow-sm flex items-center gap-4 group">
            <img src={mask.avatar} className="w-16 h-16 rounded-2xl object-cover border border-gray-100" alt={mask.name} referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 truncate">{mask.name}</h3>
              <p className="text-[10px] text-gray-400 line-clamp-2 mt-1">{mask.description}</p>
            </div>
            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => { setEditingMask(mask); setTempAvatar(mask.avatar); setIsCreating(true); }}
                className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(mask.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {masks.length === 0 && (
          <div className="text-center py-20 text-gray-300">
            <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-xs font-medium">暂无人设面具，点击右上角创建</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6 font-serif">
                  {editingMask ? '编辑人设' : '创建人设'}
                </h2>
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <img 
                        src={tempAvatar || editingMask?.avatar || "https://picsum.photos/seed/mask/200/200"} 
                        className="w-24 h-24 rounded-3xl object-cover border-4 border-pink-50 shadow-lg" 
                        alt="avatar"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-3xl">
                        <Camera className="w-6 h-6" />
                      </div>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">人设名称</label>
                      <input 
                        type="text" 
                        defaultValue={editingMask?.name}
                        placeholder="给你的面具起个名字"
                        className="w-full bg-transparent outline-none text-sm font-bold text-gray-800"
                        id="mask-name"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">身份描述</label>
                      <textarea 
                        defaultValue={editingMask?.description}
                        placeholder="描述这个身份的性格、背景..."
                        className="w-full bg-transparent outline-none text-sm text-gray-600 h-24 resize-none"
                        id="mask-desc"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex border-t border-gray-50">
                <button 
                  onClick={() => { setIsCreating(false); setEditingMask(null); setTempAvatar(null); }}
                  className="flex-1 py-6 text-sm font-bold text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    const name = (document.getElementById('mask-name') as HTMLInputElement).value;
                    const desc = (document.getElementById('mask-desc') as HTMLTextAreaElement).value;
                    if (name) {
                      handleSave({
                        id: editingMask?.id || '',
                        name,
                        description: desc,
                        avatar: tempAvatar || editingMask?.avatar || `https://picsum.photos/seed/${Date.now()}/200/200`,
                        boundCharacterIds: editingMask?.boundCharacterIds || []
                      });
                    }
                  }}
                  className="flex-1 py-6 text-sm font-bold text-pink-500 hover:bg-pink-50 transition-colors border-l border-gray-50"
                >
                  保存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- 5. Create Character Modal ---
function CreateCharModal({ onClose, onCreate }: { onClose: () => void, onCreate: (c: CharCharacter) => void }) {
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    persona: '',
    greeting: '',
    tags: [] as string[],
    avatar: `https://picsum.photos/seed/${Date.now()}/400/600`
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = () => {
    onCreate({
      ...formData,
      id: `char-${Date.now()}`,
      affection: 0,
      mood: '平静',
      isFavorite: false
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 1200, 0.6);
        setFormData(f => ({ ...f, avatar: compressed }));
      } catch (err) {
        console.error('Image compression failed', err);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-end sm:items-center justify-center"
    >
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-white rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 font-serif">创建新角色</h2>
            <button onClick={onClose} className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-8">
            {step === 1 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <img src={formData.avatar} className="w-32 h-40 rounded-[2rem] object-cover border-4 border-pink-50 shadow-xl" alt="" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-[2rem]">
                      <Camera className="w-8 h-8" />
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">角色姓名</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                      placeholder="例如：林深"
                      className="w-full bg-transparent outline-none text-sm font-bold text-gray-800"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">角色头衔</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                      placeholder="例如：森林守护者"
                      className="w-full bg-transparent outline-none text-sm font-bold text-gray-800"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Persona (AI Prompt)</label>
                    <textarea 
                      value={formData.persona}
                      onChange={e => setFormData(f => ({ ...f, persona: e.target.value }))}
                      placeholder="Describe how the AI should speak and act..."
                      className="w-full bg-transparent outline-none text-sm text-gray-600 h-32 resize-none"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Greeting</label>
                    <input 
                      type="text" 
                      value={formData.greeting}
                      onChange={e => setFormData(f => ({ ...f, greeting: e.target.value }))}
                      placeholder="What will the character say when they first meet you?"
                      className="w-full bg-transparent outline-none text-sm text-gray-600"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="p-8 bg-gray-50 flex gap-4">
          {step > 1 && (
            <button 
              onClick={handleBack}
              className="px-8 py-4 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
            >
              Back
            </button>
          )}
          <button 
            onClick={step === 2 ? handleSubmit : handleNext}
            disabled={step === 1 && !formData.name}
            className="flex-1 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-xl shadow-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
          >
            <span>{step === 2 ? 'Finish' : 'Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
