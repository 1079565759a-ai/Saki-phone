import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Heart, Calendar, Send, Search, MapPin, Star, Plus, 
  Image as ImageIcon, X, Check, Clock, Settings, Map, Camera, FileText,
  Music, Globe, MessageCircle, Book, Smile, Gift, Bell
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { compressImage } from '../utils/image';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
export interface Anniversary {
  id: string;
  title: string;
  date: string;
  isPinned: boolean;
  icon: string;
  repeat: 'yearly' | 'monthly' | 'once';
  reminderTime: string;
  reminderText: string;
  coverImage: string;
  sticker: string;
  stickerPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  isLunar: boolean;
}

export interface Letter {
  id: string;
  sender: 'me' | 'partner';
  date: string;
  content: string;
  sticker: string;
  photo: string;
  status: 'sent' | 'read' | 'replied' | 'unread';
  replyContent?: string;
}

export interface Itinerary {
  id: string;
  sender: 'me' | 'partner';
  destination: string;
  companion: string;
  activity: string;
  departureTime: string;
  expectedReturnTime: string;
  locationShared: boolean;
  photo: string;
  status: 'active' | 'returned';
  aiComment?: string;
}

export interface PhoneCheck {
  id: string;
  initiator: 'me' | 'partner';
  date: string;
  status: 'pending' | 'agreed' | 'rejected';
  details?: {
    onlineStatus: string;
    notes: string;
    itinerary: string;
    diary: string;
    chatHistory: string;
    musicHistory: string;
    browserHistory: string;
  };
}

export interface OurTaleState {
  id: string;
  partnerName: string;
  coverImage: string;
  leftAvatar: string;
  rightAvatar: string;
  anniversaries: Anniversary[];
  letters: Letter[];
  itineraries: Itinerary[];
  phoneChecks: PhoneCheck[];
  phoneCheckSettings: 'auto' | 'ask' | 'forbid';
}

export interface OurTaleRootState {
  spaces: OurTaleState[];
  currentSpaceId: string | null;
}

const defaultState: OurTaleState = {
  id: 'mock',
  partnerName: '宝贝',
  coverImage: 'https://picsum.photos/seed/couple/800/400',
  leftAvatar: 'https://picsum.photos/seed/avatar1/200/200',
  rightAvatar: 'https://picsum.photos/seed/avatar2/200/200',
  anniversaries: [
    {
      id: '1',
      title: '在一起',
      date: '2023-05-20',
      isPinned: true,
      icon: 'heart',
      repeat: 'yearly',
      reminderTime: '1day',
      reminderText: '宝贝，纪念日快到啦～',
      coverImage: 'https://picsum.photos/seed/love/400/300',
      sticker: '💖',
      stickerPosition: 'top-right',
      isLunar: false
    }
  ],
  letters: [
    {
      id: 'mock-letter-1',
      sender: 'partner',
      date: new Date(Date.now() - 7200000).toISOString(),
      content: '今天天气真好，想和你一起去散步 🌸\n\n记得按时吃饭哦！',
      sticker: '💌',
      photo: '',
      status: 'unread'
    }
  ],
  itineraries: [
    {
      id: 'mock-1',
      sender: 'partner',
      destination: '市中心商场',
      companion: '朋友小明',
      activity: '吃饭看电影',
      departureTime: new Date().toISOString(),
      expectedReturnTime: new Date(Date.now() + 2 * 3600000).toISOString(),
      locationShared: true,
      photo: '',
      status: 'active',
      aiComment: '宝贝正在外面玩呢，预计晚上10点回家，目前定位在市中心商场附近。'
    }
  ],
  phoneChecks: [
    {
      id: 'mock-check-1',
      initiator: 'partner',
      date: new Date(Date.now() - 86400000).toISOString(),
      status: 'agreed'
    }
  ],
  phoneCheckSettings: 'ask'
};

// --- Helper Components ---
const EditableImage = ({ src, onChange, className }: { src: string, onChange: (v: string) => void, className?: string }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.6);
        onChange(compressed);
      } catch (err) {
        console.error('Image compression failed', err);
      }
    }
  };

  return (
    <div className={cn("relative group cursor-pointer overflow-hidden", className)} onClick={() => fileInputRef.current?.click()}>
      <img src={src} className="w-full h-full object-cover" alt="editable" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <ImageIcon className="w-6 h-6 text-white" />
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
    </div>
  );
};

// --- Main Component ---
export default function OurTale({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [rootState, setRootState] = useState<OurTaleRootState>(() => {
    const saved = localStorage.getItem('ourtale_root_state');
    if (saved) return JSON.parse(saved);
    
    // Migration
    const oldSaved = localStorage.getItem('ourtale_state');
    if (oldSaved) {
      const oldState = JSON.parse(oldSaved);
      if (oldState.isBound) {
        return {
          spaces: [{ ...oldState, id: 'legacy' }],
          currentSpaceId: 'legacy'
        };
      }
    }
    
    return { spaces: [], currentSpaceId: null };
  });

  const [activeTab, setActiveTab] = useState<'anniversary' | 'message' | 'check' | 'report' | null>(null);

  const activeSpace = rootState.spaces.find(s => s.id === rootState.currentSpaceId);

  useEffect(() => {
    localStorage.setItem('ourtale_root_state', JSON.stringify(rootState));
    if (activeSpace) {
      window.dispatchEvent(new CustomEvent('ourtale_update', { detail: activeSpace }));
    } else {
      window.dispatchEvent(new CustomEvent('ourtale_update', { detail: null }));
    }
  }, [rootState, activeSpace]);

  const updateState = (updates: Partial<OurTaleState>) => {
    if (!rootState.currentSpaceId) return;
    setRootState(prev => ({
      ...prev,
      spaces: prev.spaces.map(s => s.id === prev.currentSpaceId ? { ...s, ...updates } : s)
    }));
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-white flex flex-col overflow-hidden font-sans text-gray-900"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10 relative">
        <button onClick={() => {
          if (activeTab) setActiveTab(null);
          else if (rootState.currentSpaceId) setRootState(prev => ({ ...prev, currentSpaceId: null }));
          else onClose();
        }} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xs font-sans font-bold text-gray-900 uppercase tracking-[0.2em]">
          {!rootState.currentSpaceId ? 'Index' : 
           activeTab === 'anniversary' ? 'Anniversary' :
           activeTab === 'message' ? 'Letters' :
           activeTab === 'check' ? 'Inspection' :
           activeTab === 'report' ? 'Itinerary' : 'OurTale'}
        </h2>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!rootState.currentSpaceId ? (
          <SpacesListScreen 
            rootState={rootState} 
            onSelectSpace={(id) => setRootState(prev => ({ ...prev, currentSpaceId: id }))}
            onCreateSpace={(newSpace) => setRootState(prev => ({ ...prev, spaces: [...prev.spaces, newSpace], currentSpaceId: newSpace.id }))}
          />
        ) : !activeTab && activeSpace ? (
          <MainScreen state={activeSpace} updateState={updateState} onTabSelect={setActiveTab} />
        ) : activeTab === 'anniversary' && activeSpace ? (
          <AnniversaryScreen state={activeSpace} updateState={updateState} />
        ) : activeTab === 'message' && activeSpace ? (
          <MessageScreen state={activeSpace} updateState={updateState} />
        ) : activeTab === 'report' && activeSpace ? (
          <ReportScreen state={activeSpace} updateState={updateState} />
        ) : activeTab === 'check' && activeSpace ? (
          <CheckPhoneScreen state={activeSpace} updateState={updateState} />
        ) : null}
      </div>
    </motion.div>
  );
}

// --- Sub Screens ---

function SpacesListScreen({ rootState, onSelectSpace, onCreateSpace }: { rootState: OurTaleRootState, onSelectSpace: (id: string) => void, onCreateSpace: (space: OurTaleState) => void }) {
  const [isBinding, setIsBinding] = useState(false);

  if (isBinding) {
    return <BindScreen rootState={rootState} onBind={onCreateSpace} onBack={() => setIsBinding(false)} />;
  }

  return (
    <div className="p-6 space-y-4">
      {rootState.spaces.map(space => (
        <div key={space.id} onClick={() => onSelectSpace(space.id)} className="bg-gray-50 p-5 border border-gray-100 rounded-3xl flex items-center gap-4 cursor-pointer hover:border-gray-200 transition-all shadow-sm">
          <div className="flex -space-x-4">
            <img src={space.leftAvatar} className="w-12 h-12 border border-white rounded-full object-cover shadow-sm" />
            <img src={space.rightAvatar} className="w-12 h-12 border border-white rounded-full object-cover shadow-sm" />
          </div>
          <div className="flex-1">
            <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">{space.partnerName}</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Enter Space</p>
          </div>
          <ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
        </div>
      ))}
      
      {rootState.spaces.length < 5 && (
        <button 
          onClick={() => setIsBinding(true)}
          className="w-full py-5 border border-gray-100 bg-gray-50 text-gray-900 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-gray-900 hover:text-white transition-all rounded-3xl shadow-sm"
        >
          <Plus className="w-4 h-4" /> Bind Partner ({rootState.spaces.length}/5)
        </button>
      )}
    </div>
  );
}

function BindScreen({ rootState, onBind, onBack }: { rootState: OurTaleRootState, onBind: (space: OurTaleState) => void, onBack: () => void }) {
  const insStateStr = localStorage.getItem('ins_state');
  let availableAIs: any[] = [];
  if (insStateStr) {
    const insState = JSON.parse(insStateStr);
    const addedIds = insState.myContacts.map((c: any) => c.aiId);
    const boundIds = rootState.spaces.map(s => s.id);
    availableAIs = insState.aiDatabase.filter((ai: any) => addedIds.includes(ai.id) && !boundIds.includes(ai.id));
  }

  return (
    <div className="p-8 bg-white min-h-full">
      <h3 className="text-sm font-sans font-bold text-gray-900 mb-8 uppercase tracking-[0.2em]">Select Partner</h3>
      {availableAIs.length === 0 ? (
        <div className="text-center text-gray-400 mt-20">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold">No available partners.</p>
          <p className="text-[9px] mt-4 text-gray-300 font-bold uppercase tracking-[0.2em]">Add friends in Chat first.</p>
          <button onClick={onBack} className="mt-12 text-gray-900 font-bold text-[10px] uppercase tracking-[0.3em] hover:scale-110 transition-transform">Back</button>
        </div>
      ) : (
        <div className="space-y-4">
          {availableAIs.map(ai => (
            <div key={ai.id} className="bg-gray-50 p-6 border border-gray-100 flex items-center justify-between rounded-[2rem] shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <img src={ai.avatar} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">{ai.nickname}</div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">{ai.insId}</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  const newSpace: OurTaleState = {
                    ...defaultState,
                    id: ai.id,
                    partnerName: ai.nickname,
                    rightAvatar: ai.avatar,
                    anniversaries: [],
                    letters: [],
                    itineraries: [],
                    phoneChecks: []
                  };
                  onBind(newSpace);
                }}
                className="px-6 py-2.5 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-gray-200 hover:bg-black transition-all"
              >
                Bind
              </button>
            </div>
          ))}
          <button onClick={onBack} className="w-full py-5 mt-8 text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] hover:text-gray-900 transition-colors">Cancel</button>
        </div>
      )}
    </div>
  );
}

function MainScreen({ state, updateState, onTabSelect }: { state: OurTaleState, updateState: (s: Partial<OurTaleState>) => void, onTabSelect: (tab: any) => void }) {
  return (
    <div className="relative pb-20">
      {/* Cover Photo */}
      <div className="h-72 relative border-b border-gray-100 overflow-hidden">
        <EditableImage 
          src={state.coverImage} 
          onChange={(v) => updateState({ coverImage: v })}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
      </div>

      {/* Avatars */}
      <div className="absolute top-[14rem] left-0 right-0 px-10 flex justify-between pointer-events-none">
        <div className="w-24 h-24 border-4 border-white rounded-3xl overflow-hidden shadow-xl pointer-events-auto bg-white rotate-[-6deg]">
          <EditableImage 
            src={state.leftAvatar} 
            onChange={(v) => updateState({ leftAvatar: v })}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-24 h-24 border-4 border-white rounded-3xl overflow-hidden shadow-xl pointer-events-auto bg-white rotate-[6deg]">
          <EditableImage 
            src={state.rightAvatar} 
            onChange={(v) => updateState({ rightAvatar: v })}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Feed Area - Dynamic Entrances */}
      <div className="mt-20 px-6 space-y-6">
        {[
          { 
            id: 'anniversary', 
            icon: Calendar, 
            label: 'Anniversary', 
            color: 'text-gray-900', 
            bg: 'bg-white',
            desc: 'Recording every significant moment.',
            time: 'Just now',
            user: 'Me'
          },
          { 
            id: 'message', 
            icon: Send, 
            label: 'Letters', 
            color: 'text-gray-900', 
            bg: 'bg-white',
            desc: 'A new letter is waiting to be read.',
            time: '2h ago',
            user: state.partnerName
          },
          { 
            id: 'check', 
            icon: Search, 
            label: 'Inspection', 
            color: 'text-gray-900', 
            bg: 'bg-white',
            desc: 'Initiated a status check request.',
            time: 'Yesterday',
            user: 'Me'
          },
          { 
            id: 'report', 
            icon: MapPin, 
            label: 'Itinerary', 
            color: 'text-gray-900', 
            bg: 'bg-white',
            desc: 'Report: Dining out with friends, returning around 10 PM.',
            time: 'Yesterday',
            user: state.partnerName
          }
        ].map(feed => (
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            key={feed.id}
            onClick={() => onTabSelect(feed.id)}
            className="bg-gray-50 p-6 border border-gray-100 rounded-[2.5rem] cursor-pointer shadow-sm hover:border-gray-200 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <img src={feed.user === 'Me' ? state.leftAvatar : state.rightAvatar} className="w-10 h-10 border border-white rounded-full object-cover shadow-sm" />
              <div>
                <div className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">{feed.user}</div>
                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">{feed.time}</div>
              </div>
            </div>
            <div className="text-[11px] text-gray-600 mb-5 pl-1 leading-relaxed uppercase tracking-wide">
              "{feed.desc}"
            </div>
            <div className="pl-1">
              <div className={cn("inline-flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-2xl font-bold text-[9px] uppercase tracking-[0.2em] shadow-sm", feed.bg, feed.color)}>
                <feed.icon className="w-3.5 h-3.5" />
                {feed.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Anniversary Screen ---
function AnniversaryScreen({ state, updateState }: { state: OurTaleState, updateState: (s: Partial<OurTaleState>) => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const calculateDays = (dateStr: string) => {
    const start = new Date(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAdd = (newAnniversary: Anniversary) => {
    updateState({ anniversaries: [...state.anniversaries, newAnniversary] });
    setIsAdding(false);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-full relative">
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <div className="text-6xl animate-bounce">✨</div>
          </motion.div>
        )}
      </AnimatePresence>

      {isAdding ? (
        <AddAnniversaryForm onSave={handleAdd} onCancel={() => setIsAdding(false)} />
      ) : (
        <>
          {state.anniversaries.map((anniversary) => {
            const days = calculateDays(anniversary.date);
            const isFuture = days < 0;
            return (
              <motion.div 
                layoutId={anniversary.id}
                key={anniversary.id} 
                className="bg-gray-50 border border-gray-100 rounded-[2.5rem] overflow-hidden relative shadow-sm"
              >
                <div className="h-40 relative border-b border-gray-100">
                  <img src={anniversary.coverImage} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent" />
                  <div className={cn(
                    "absolute text-2xl",
                    anniversary.stickerPosition === 'top-left' ? 'top-4 left-4' :
                    anniversary.stickerPosition === 'top-right' ? 'top-4 right-4' :
                    anniversary.stickerPosition === 'bottom-left' ? 'bottom-4 left-4' : 'bottom-4 right-4'
                  )}>
                    {anniversary.sticker}
                  </div>
                </div>
                <div className="p-6 relative">
                  <button 
                    onClick={() => {
                      const newAnns = state.anniversaries.map(a => ({ ...a, isPinned: a.id === anniversary.id }));
                      updateState({ anniversaries: newAnns });
                    }}
                    className={cn("absolute -top-7 right-7 w-14 h-14 border border-gray-100 rounded-2xl flex items-center justify-center shadow-lg transition-all", 
                      anniversary.isPinned ? "bg-gray-900 text-white" : "bg-white text-gray-300"
                    )}
                  >
                    <Star className={cn("w-6 h-6", anniversary.isPinned && "fill-current")} />
                  </button>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-sans font-bold text-gray-900 uppercase tracking-tight">{anniversary.title}</h3>
                  </div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-6">{anniversary.date} {anniversary.isLunar ? '(Lunar)' : '(Solar)'}</div>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{isFuture ? 'Remaining' : 'Elapsed'}</span>
                    <span className="text-5xl font-sans font-black text-gray-900 tracking-tighter">{Math.abs(days)}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Days</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-6 border border-gray-100 bg-gray-50 text-gray-900 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-gray-900 hover:text-white transition-all rounded-[2rem] shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Anniversary
          </button>
        </>
      )}
    </div>
  );
}

function AddAnniversaryForm({ onSave, onCancel }: { onSave: (a: Anniversary) => void, onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [icon, setIcon] = useState('heart');
  const [isLunar, setIsLunar] = useState(false);
  const [repeat, setRepeat] = useState<'yearly' | 'monthly' | 'once'>('yearly');
  const [reminderTime, setReminderTime] = useState('1day');
  const [sticker, setSticker] = useState('🌸');
  const [stickerPosition, setStickerPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('top-right');

  const presets = ['Together', 'Confession', 'First Kiss', 'First Date', 'Birthday', 'Valentine', 'Anniversary', 'Wedding', 'Hug', 'Meeting'];
  const icons = [
    { id: 'heart', emoji: '💖' },
    { id: 'cake', emoji: '🎂' },
    { id: 'gift', emoji: '🎁' },
    { id: 'star', emoji: '⭐' },
    { id: 'flower', emoji: '🌸' },
    { id: 'animal', emoji: '🐱' }
  ];
  const stickers = ['🌸', '✨', '🎀', '🎈', '🎉', '💖', '🧸', '🦋'];

  return (
    <div className="bg-white p-8 border border-gray-100 rounded-[2.5rem] shadow-sm space-y-8">
      <h3 className="text-sm font-sans font-bold text-gray-900 mb-8 uppercase tracking-[0.2em]">New Anniversary</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest">Name</label>
          <input 
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 px-5 py-4 text-gray-900 focus:border-gray-900 outline-none rounded-2xl text-sm font-sans font-medium transition-all"
            placeholder="e.g. Together, Birthday"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {presets.map(p => (
              <button 
                key={p} onClick={() => setTitle(p)}
                className="text-[8px] bg-white text-gray-400 px-3 py-1.5 border border-gray-100 rounded-lg uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all shadow-sm"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest">Icon</label>
          <div className="flex gap-3">
            {icons.map(ic => (
              <button 
                key={ic.id} onClick={() => setIcon(ic.id)}
                className={cn("w-12 h-12 border border-gray-100 rounded-2xl flex items-center justify-center text-xl transition-all shadow-sm", icon === ic.id ? "bg-gray-900 text-white" : "bg-white text-gray-400 hover:bg-gray-50")}
              >
                {ic.emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest">Date</label>
          <input 
            type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 px-5 py-4 text-gray-900 focus:border-gray-900 outline-none rounded-2xl text-sm font-sans font-medium transition-all"
          />
        </div>
        
        <div className="flex items-center justify-between bg-gray-50 p-5 border border-gray-100 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lunar Calendar</span>
          <button 
            onClick={() => setIsLunar(!isLunar)}
            className={cn("w-12 h-6 border border-gray-100 rounded-full transition-all relative", isLunar ? "bg-gray-900" : "bg-white")}
          >
            <div className={cn("w-4 h-4 border border-gray-100 rounded-full absolute top-0.5 transition-transform bg-white shadow-sm", isLunar ? "translate-x-6" : "translate-x-1")} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest">Repeat</label>
            <select 
              value={repeat} onChange={e => setRepeat(e.target.value as any)}
              className="w-full bg-gray-50 border border-gray-100 px-5 py-4 text-gray-900 outline-none appearance-none rounded-2xl text-sm font-sans font-medium transition-all"
            >
              <option value="yearly">Yearly</option>
              <option value="monthly">Monthly</option>
              <option value="once">Once</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest">Reminder</label>
            <select 
              value={reminderTime} onChange={e => setReminderTime(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 px-5 py-4 text-gray-900 outline-none appearance-none rounded-2xl text-sm font-sans font-medium transition-all"
            >
              <option value="0day">On day</option>
              <option value="1day">1 day before</option>
              <option value="3day">3 days before</option>
              <option value="7day">7 days before</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest">Decoration</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {stickers.map(s => (
              <button 
                key={s} onClick={() => setSticker(s)}
                className={cn("w-10 h-10 border border-gray-100 rounded-xl flex items-center justify-center text-lg transition-all shadow-sm", sticker === s ? "bg-gray-900 text-white scale-110" : "bg-white hover:bg-gray-50")}
              >
                {s}
              </button>
            ))}
          </div>
          <select 
            value={stickerPosition} onChange={e => setStickerPosition(e.target.value as any)}
            className="w-full bg-gray-50 border border-gray-100 px-5 py-4 text-gray-900 outline-none appearance-none rounded-2xl text-sm font-sans font-medium transition-all"
          >
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom-right">Bottom Right</option>
          </select>
        </div>

        <div className="flex gap-4 pt-6">
          <button onClick={onCancel} className="flex-1 py-4 bg-white text-gray-400 border border-gray-100 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:text-gray-900 transition-colors shadow-sm">Cancel</button>
          <button 
            onClick={() => onSave({
              id: Date.now().toString(),
              title: title || 'Untitled',
              date: date || new Date().toISOString().split('T')[0],
              isPinned: false,
              icon,
              repeat,
              reminderTime,
              reminderText: 'Honey, the anniversary is coming!',
              coverImage: 'https://picsum.photos/seed/love2/400/300',
              sticker,
              stickerPosition,
              isLunar
            })} 
            className="flex-1 py-4 bg-gray-900 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-gray-200 hover:bg-black transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Message Screen ---
function MessageScreen({ state, updateState }: { state: OurTaleState, updateState: (s: Partial<OurTaleState>) => void }) {
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState('');

  const handleSend = () => {
    if (!content.trim()) return;
    const newLetter: Letter = {
      id: Date.now().toString(),
      sender: 'me',
      date: new Date().toISOString(),
      content,
      sticker: '💌',
      photo: '',
      status: 'sent'
    };
    updateState({ letters: [newLetter, ...state.letters] });
    setIsWriting(false);
    setContent('');
  };

  return (
    <div className="p-6 h-full flex flex-col bg-white">
      {isWriting ? (
        <div className="flex-1 flex flex-col bg-gray-50 p-8 border border-gray-100 rounded-[2.5rem] relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">To: {state.partnerName}</div>
            <div className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">{new Date().toLocaleDateString()}</div>
          </div>
          <textarea 
            value={content}
            onChange={e => setContent(e.target.value)}
            className="flex-1 w-full resize-none bg-transparent outline-none text-gray-900 leading-relaxed z-10 font-sans font-medium text-sm placeholder:text-gray-300"
            placeholder="Write your thoughts..."
          />
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100 z-10">
            <div className="flex gap-3">
              <button className="p-3 bg-white text-gray-400 border border-gray-100 rounded-2xl hover:text-gray-900 transition-colors shadow-sm"><Smile className="w-5 h-5" /></button>
              <button className="p-3 bg-white text-gray-400 border border-gray-100 rounded-2xl hover:text-gray-900 transition-colors shadow-sm"><ImageIcon className="w-5 h-5" /></button>
            </div>
            <button onClick={handleSend} className="px-8 py-3.5 bg-gray-900 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-gray-200">
              Send Letter
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-6 overflow-y-auto pb-24">
            {state.letters.map(letter => (
              <div key={letter.id} className="bg-gray-50 p-6 border border-gray-100 rounded-[2.5rem] shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-gray-100 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">{letter.sticker}</div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">{letter.sender === 'me' ? 'Me' : state.partnerName}</div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">{new Date(letter.date).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-[8px] font-bold text-gray-400 bg-white px-3 py-1 border border-gray-100 rounded-lg uppercase tracking-widest shadow-sm">
                    {letter.sender === 'me' ? (letter.status === 'sent' ? 'Sent' : 'Read') : (letter.status === 'unread' ? 'Unread' : 'Read')}
                  </div>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed uppercase tracking-wide line-clamp-3">"{letter.content}"</p>
              </div>
            ))}
            {state.letters.length === 0 && (
              <div className="text-center text-gray-300 mt-20 text-[10px] font-bold uppercase tracking-[0.2em]">No letters yet.</div>
            )}
          </div>
          <button 
            onClick={() => setIsWriting(true)}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 px-10 py-5 bg-gray-900 text-white font-bold text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-gray-300 flex items-center gap-3 rounded-[2rem] hover:bg-black transition-all"
          >
            <Send className="w-4 h-4" /> Write Letter
          </button>
        </>
      )}
    </div>
  );
}

// --- Report Screen ---
function ReportScreen({ state, updateState }: { state: OurTaleState, updateState: (s: Partial<OurTaleState>) => void }) {
  const [view, setView] = useState<'me' | 'partner'>('me');
  const [destination, setDestination] = useState('');
  const [companion, setCompanion] = useState('');
  const [activity, setActivity] = useState('');

  const handleReport = () => {
    const newItinerary: Itinerary = {
      id: Date.now().toString(),
      sender: 'me',
      destination,
      companion,
      activity,
      departureTime: new Date().toISOString(),
      expectedReturnTime: new Date(Date.now() + 4 * 3600000).toISOString(),
      locationShared: true,
      photo: '',
      status: 'active',
      aiComment: 'Report received. Stay safe and return soon. 💖'
    };
    updateState({ itineraries: [newItinerary, ...state.itineraries] });
    setDestination(''); setCompanion(''); setActivity('');
  };

  const activeMyItinerary = state.itineraries.find(i => i.sender === 'me' && i.status === 'active');

  return (
    <div className="p-8 bg-white min-h-full">
      <div className="flex bg-gray-50 p-1.5 border border-gray-100 rounded-2xl mb-8 shadow-sm">
        <button 
          onClick={() => setView('me')}
          className={cn("flex-1 py-3 text-[10px] uppercase tracking-[0.2em] font-bold transition-all rounded-xl", view === 'me' ? "bg-gray-900 text-white shadow-lg shadow-gray-200" : "text-gray-400 hover:text-gray-900")}
        >
          Report
        </button>
        <button 
          onClick={() => setView('partner')}
          className={cn("flex-1 py-3 text-[10px] uppercase tracking-[0.2em] font-bold transition-all rounded-xl", view === 'partner' ? "bg-gray-900 text-white shadow-lg shadow-gray-200" : "text-gray-400 hover:text-gray-900")}
        >
          Partner
        </button>
      </div>

      {view === 'me' ? (
        activeMyItinerary ? (
          <div className="bg-gray-50 p-8 border border-gray-100 rounded-[2.5rem] shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-gray-900 font-bold text-[10px] uppercase tracking-[0.2em]">
                <MapPin className="w-4 h-4" /> In Progress
              </div>
              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">ETA 22:00</div>
            </div>
            <div className="space-y-6 mb-8">
              <div className="flex gap-4 text-[11px]">
                <span className="text-gray-400 w-20 uppercase tracking-widest font-bold">To</span>
                <span className="font-bold text-gray-900 uppercase tracking-wide">{activeMyItinerary.destination}</span>
              </div>
              <div className="flex gap-4 text-[11px]">
                <span className="text-gray-400 w-20 uppercase tracking-widest font-bold">With</span>
                <span className="font-bold text-gray-900 uppercase tracking-wide">{activeMyItinerary.companion}</span>
              </div>
              <div className="flex gap-4 text-[11px]">
                <span className="text-gray-400 w-20 uppercase tracking-widest font-bold">Activity</span>
                <span className="font-bold text-gray-900 uppercase tracking-wide">{activeMyItinerary.activity}</span>
              </div>
            </div>
            <div className="bg-white p-6 border border-gray-100 rounded-2xl text-[11px] text-gray-600 mb-8 flex gap-4 shadow-sm">
              <div className="w-10 h-10 border border-gray-100 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 text-xl shadow-sm">🤖</div>
              <div className="leading-relaxed uppercase tracking-wide">"{activeMyItinerary.aiComment}"</div>
            </div>
            <button 
              onClick={() => {
                const newItin = state.itineraries.map(i => i.id === activeMyItinerary.id ? { ...i, status: 'returned' as const } : i);
                updateState({ itineraries: newItin });
              }}
              className="w-full py-5 bg-gray-900 text-white font-bold text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-gray-200 hover:bg-black transition-all"
            >
              Returned Home
            </button>
          </div>
        ) : (
          <div className="bg-white p-8 border border-gray-100 rounded-[2.5rem] shadow-sm space-y-6">
            <input 
              type="text" placeholder="Destination?" value={destination} onChange={e => setDestination(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 px-5 py-4 text-gray-900 focus:border-gray-900 outline-none rounded-2xl text-sm font-sans font-medium transition-all"
            />
            <input 
              type="text" placeholder="With whom?" value={companion} onChange={e => setCompanion(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 px-5 py-4 text-gray-900 focus:border-gray-900 outline-none rounded-2xl text-sm font-sans font-medium transition-all"
            />
            <input 
              type="text" placeholder="Activity?" value={activity} onChange={e => setActivity(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 px-5 py-4 text-gray-900 focus:border-gray-900 outline-none rounded-2xl text-sm font-sans font-medium transition-all"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 mb-2 ml-2 uppercase tracking-widest">Departure</label>
                <input type="time" className="w-full bg-gray-50 border border-gray-100 px-5 py-4 text-gray-900 outline-none rounded-2xl text-sm font-sans font-medium transition-all" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 mb-2 ml-2 uppercase tracking-widest">Return</label>
                <input type="time" className="w-full bg-gray-50 border border-gray-100 px-5 py-4 text-gray-900 outline-none rounded-2xl text-sm font-sans font-medium transition-all" />
              </div>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-5 border border-gray-100 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 text-[10px] font-bold text-gray-900 uppercase tracking-[0.2em]">
                <MapPin className="w-4 h-4" /> Location Share
              </div>
              <button className="w-12 h-6 border border-gray-100 bg-gray-900 rounded-full relative transition-all">
                <div className="w-4 h-4 border border-gray-100 bg-white rounded-full absolute top-1 translate-x-7 shadow-sm" />
              </button>
            </div>
            <button className="w-full py-5 border border-gray-100 bg-white text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:text-gray-900 transition-all rounded-2xl shadow-sm">
              <Camera className="w-4 h-4" /> Upload Photo
            </button>
            <button 
              onClick={handleReport}
              className="w-full py-5 bg-gray-900 text-white font-bold text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-gray-200 hover:bg-black transition-all mt-4"
            >
              Confirm Report
            </button>
          </div>
        )
      ) : (
        state.itineraries.find(i => i.sender === 'partner' && i.status === 'active') ? (
          (() => {
            const activePartnerItinerary = state.itineraries.find(i => i.sender === 'partner' && i.status === 'active')!;
            return (
              <div className="bg-gray-50 p-8 border border-gray-100 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3 text-gray-900 font-bold text-[10px] uppercase tracking-[0.2em]">
                    <MapPin className="w-4 h-4" /> Partner Active
                  </div>
                  <div className="text-[9px] font-bold text-white bg-gray-900 px-4 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-gray-200">
                    2h Remaining
                  </div>
                </div>
                
                <div className="h-40 bg-white border border-gray-100 rounded-2xl mb-8 overflow-hidden relative shadow-sm">
                  <img src="https://picsum.photos/seed/map/400/200" className="w-full h-full object-cover opacity-20 grayscale" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-xl p-1">
                      <img src={state.rightAvatar} className="w-full h-full border border-gray-100 rounded-xl object-cover" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="flex gap-4 text-[11px]">
                    <span className="text-gray-400 w-20 uppercase tracking-widest font-bold">To</span>
                    <span className="font-bold text-gray-900 uppercase tracking-wide">{activePartnerItinerary.destination}</span>
                  </div>
                  <div className="flex gap-4 text-[11px]">
                    <span className="text-gray-400 w-20 uppercase tracking-widest font-bold">With</span>
                    <span className="font-bold text-gray-900 uppercase tracking-wide">{activePartnerItinerary.companion}</span>
                  </div>
                  <div className="flex gap-4 text-[11px]">
                    <span className="text-gray-400 w-20 uppercase tracking-widest font-bold">Activity</span>
                    <span className="font-bold text-gray-900 uppercase tracking-wide">{activePartnerItinerary.activity}</span>
                  </div>
                </div>
                <div className="bg-white p-6 border border-gray-100 rounded-2xl text-[11px] text-gray-600 flex gap-4 shadow-sm">
                  <div className="w-10 h-10 border border-gray-100 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 text-xl shadow-sm">🤖</div>
                  <div className="leading-relaxed uppercase tracking-wide">"{activePartnerItinerary.aiComment}"</div>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="text-center text-gray-300 mt-20 text-[10px] font-bold uppercase tracking-[0.3em]">No active reports.</div>
        )
      )}
    </div>
  );
}

// --- Check Phone Screen ---
function CheckPhoneScreen({ state, updateState }: { state: OurTaleState, updateState: (s: Partial<OurTaleState>) => void }) {
  const [view, setView] = useState<'me' | 'partner'>('me');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<PhoneCheck | null>(null);

  const handleInitiateCheck = () => {
    setIsChecking(true);
    // Simulate partner agreeing
    setTimeout(() => {
      setIsChecking(false);
      const newCheck: PhoneCheck = {
        id: Date.now().toString(),
        initiator: 'me',
        date: new Date().toISOString(),
        status: 'agreed',
        details: {
          onlineStatus: 'Online',
          notes: 'Buy a cake for honey',
          itinerary: 'Meeting this afternoon',
          diary: 'Missing her today',
          chatHistory: 'Normal',
          musicHistory: 'Jay Chou - Love Confession',
          browserHistory: 'How to choose gifts for girlfriend'
        }
      };
      setCheckResult(newCheck);
      updateState({ phoneChecks: [newCheck, ...state.phoneChecks] });
    }, 2000);
  };

  return (
    <div className="p-8 bg-white min-h-full">
      <div className="flex bg-gray-50 p-1.5 border border-gray-100 rounded-2xl mb-8 shadow-sm">
        <button 
          onClick={() => { setView('me'); setCheckResult(null); }}
          className={cn("flex-1 py-3 text-[10px] uppercase tracking-[0.2em] font-bold transition-all rounded-xl", view === 'me' ? "bg-gray-900 text-white shadow-lg shadow-gray-200" : "text-gray-400 hover:text-gray-900")}
        >
          Inspect
        </button>
        <button 
          onClick={() => { setView('partner'); setCheckResult(null); }}
          className={cn("flex-1 py-3 text-[10px] uppercase tracking-[0.2em] font-bold transition-all rounded-xl", view === 'partner' ? "bg-gray-900 text-white shadow-lg shadow-gray-200" : "text-gray-400 hover:text-gray-900")}
        >
          Settings
        </button>
      </div>

      {view === 'me' ? (
        checkResult ? (
          <div className="bg-gray-50 p-8 border border-gray-100 rounded-[2.5rem] shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-sans font-bold text-gray-900 uppercase tracking-[0.2em]">Result</h3>
              <span className="text-[9px] font-bold text-gray-900 bg-white px-3 py-1.5 border border-gray-100 rounded-lg uppercase tracking-widest shadow-sm">Agreed</span>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Status', value: checkResult.details?.onlineStatus, icon: Globe },
                { label: 'Notes', value: checkResult.details?.notes, icon: FileText },
                { label: 'Itinerary', value: checkResult.details?.itinerary, icon: MapPin },
                { label: 'Diary', value: checkResult.details?.diary, icon: Book },
                { label: 'Chats', value: checkResult.details?.chatHistory, icon: MessageCircle },
                { label: 'Music', value: checkResult.details?.musicHistory, icon: Music },
                { label: 'Browser', value: checkResult.details?.browserHistory, icon: Search },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 border border-gray-100 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <item.icon className="w-4 h-4 text-gray-900" />
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-400 mb-1 uppercase tracking-widest font-bold">{item.label}</div>
                    <div className="text-[11px] font-bold text-gray-900 uppercase tracking-wide">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setCheckResult(null)}
              className="w-full py-5 bg-white text-gray-900 border border-gray-100 font-bold text-[10px] uppercase tracking-[0.3em] mt-8 rounded-2xl shadow-sm hover:bg-gray-50 transition-all"
            >
              Back
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-40 h-40 bg-gray-50 border border-gray-100 rounded-[2.5rem] flex items-center justify-center mb-10 relative shadow-sm">
              <Search className="w-14 h-14 text-gray-900" />
              {isChecking && (
                <motion.div 
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 border-2 border-transparent border-t-gray-900 rounded-[2.5rem]"
                />
              )}
            </div>
            <button 
              onClick={handleInitiateCheck}
              disabled={isChecking}
              className="px-10 py-5 bg-gray-900 text-white font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-gray-200 disabled:opacity-50 mb-12 rounded-[2rem] hover:bg-black transition-all"
            >
              {isChecking ? 'Sending Request...' : 'Initiate Inspection'}
            </button>
            
            <div className="w-full">
              <h4 className="text-[10px] font-bold text-gray-400 mb-6 uppercase tracking-widest px-2">History</h4>
              <div className="space-y-4">
                {state.phoneChecks.filter(c => c.initiator === 'me').map(check => (
                  <div key={check.id} className="bg-gray-50 p-6 border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                      <div className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">{new Date(check.date).toLocaleString()}</div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">To {state.partnerName}</div>
                    </div>
                    <div className={cn("text-[9px] font-bold px-3 py-1.5 border border-gray-100 rounded-lg uppercase tracking-widest shadow-sm", 
                      check.status === 'agreed' ? "text-gray-900 bg-white" : 
                      check.status === 'rejected' ? "text-white bg-gray-900" : "text-gray-400 bg-white"
                    )}>
                      {check.status === 'agreed' ? 'Agreed' : check.status === 'rejected' ? 'Rejected' : 'Pending'}
                    </div>
                  </div>
                ))}
                {state.phoneChecks.filter(c => c.initiator === 'me').length === 0 && (
                  <div className="text-center text-gray-300 text-[10px] font-bold uppercase tracking-[0.3em] py-8">No history.</div>
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="space-y-8">
          <div className="bg-gray-50 p-8 border border-gray-100 rounded-[2.5rem] shadow-sm">
            <h3 className="text-sm font-sans font-bold text-gray-900 mb-8 uppercase tracking-[0.2em]">Settings</h3>
            <div className="space-y-4">
              {[
                { id: 'auto', label: 'Auto Agree', desc: 'Automatically allow inspection' },
                { id: 'ask', label: 'Ask Each Time', desc: 'Manual confirmation required' },
                { id: 'forbid', label: 'Forbid', desc: 'Automatically reject requests' }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => updateState({ phoneCheckSettings: opt.id as any })}
                  className={cn("w-full flex items-center justify-between p-6 border rounded-2xl transition-all text-left shadow-sm", 
                    state.phoneCheckSettings === opt.id ? "border-gray-900 bg-white" : "border-gray-100 bg-gray-50 hover:bg-white"
                  )}
                >
                  <div>
                    <div className="text-[11px] font-bold text-gray-900 mb-1 uppercase tracking-widest">{opt.label}</div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">{opt.desc}</div>
                  </div>
                  {state.phoneCheckSettings === opt.id && <Check className="w-4 h-4 text-gray-900" />}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full">
            <h4 className="text-[10px] font-bold text-gray-400 mb-6 px-4 uppercase tracking-widest">Received History</h4>
            <div className="space-y-4">
              {state.phoneChecks.filter(c => c.initiator === 'partner').map(check => (
                <div key={check.id} className="bg-gray-50 p-6 border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">{new Date(check.date).toLocaleString()}</div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">{state.partnerName} requested</div>
                  </div>
                  <div className={cn("text-[9px] font-bold px-3 py-1.5 border border-gray-100 rounded-lg uppercase tracking-widest shadow-sm", 
                    check.status === 'agreed' ? "text-gray-900 bg-white" : 
                    check.status === 'rejected' ? "text-white bg-gray-900" : "text-gray-400 bg-white"
                  )}>
                    {check.status === 'agreed' ? 'Agreed' : check.status === 'rejected' ? 'Rejected' : 'Pending'}
                  </div>
                </div>
              ))}
              {state.phoneChecks.filter(c => c.initiator === 'partner').length === 0 && (
                <div className="text-center text-gray-300 text-[10px] font-bold uppercase tracking-[0.3em] py-8">No history.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
