import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Search, 
  MessageCircle, 
  User, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal, 
  Heart, 
  Grid, 
  Trash2, 
  FolderPlus, 
  Send, 
  Image as ImageIcon, 
  Settings, 
  Check, 
  X, 
  Edit2, 
  Camera,
  Bookmark,
  Copy,
  Languages,
  StickyNote,
  Mic,
  MicOff,
  Phone,
  Video,
  Smile,
  Brain,
  ShoppingBag,
  DollarSign,
  MapPin,
  RotateCcw,
  Quote,
  MoreVertical,
  Scissors,
  Sparkles
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { compressImage } from '../utils/image';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

// --- Interfaces ---
export interface ChatSettings {
  backgroundImage: string;
  userBubbleColor: string;
  aiBubbleColor: string;
  customCSS: string;
  enableMinimaxVoice: boolean;
  perceiveTimeWeather: boolean;
  activeMessaging: boolean;
  activeMessagingFrequency: 'high' | 'medium' | 'low';
}

export interface InsState {
  language: 'zh' | 'en';
  memos: Array<{ id: string; aiId: string; nickname: string; insId: string; timestamp: string }>;
  myProfile: {
    avatar: string;
    nickname: string;
    signature: string;
    persona: string;
    insId: string;
    patText?: string; // Custom pat text
  };
  aiDatabase: Array<{
    id: string;
    insId: string;
    avatar: string;
    nickname: string;
    gender: 'male' | 'female' | 'other';
    persona: string;
    chatSettings?: ChatSettings;
    patText?: string;
  }>;
  myContacts: Array<{
    aiId: string;
    groupId: string;
  }>;
  groups: Array<{
    id: string;
    name: string;
  }>;
  chats: Array<{
    contactId: string;
    messages: Array<{
      id: string;
      role: 'user' | 'ai';
      text: string;
      timestamp: string;
      type?: 'text' | 'image' | 'voice' | 'call' | 'video' | 'takeout' | 'transfer' | 'pat';
      metadata?: any;
      isRecalled?: boolean;
      quotedMessageId?: string;
    }>;
  }>;
  posts: Array<{
    id: string;
    authorId: string;
    content: string;
    images: string[];
    timestamp: string;
    likes: number;
  }>;
}

const translations = {
  zh: {
    chat: '通讯',
    contacts: '名录',
    feed: '志异',
    profile: '档存',
    searchPlaceholder: '检索编号...',
    noUserFound: '未检索到对象',
    addFriend: '建立连接',
    message: '讯息',
    messages: '讯息流',
    noFriends: '暂无连接，请检索编号',
    chatSettings: '通讯配置',
    save: '保存',
    visualCustomization: '视觉表现',
    chatBackground: '背景底图',
    tapToUpload: '点击上传底图',
    myBubbleColor: '己方气泡',
    aiBubbleColor: '对方气泡',
    customCSS: '自定义样式',
    aiCapabilities: '核心机能',
    minimaxVoice: '语音合成',
    enableVoice: '开启语音讯息',
    perceiveTimeWeather: '环境感知',
    timeWeatherDesc: '感知当前时空背景',
    activeMessaging: '主动交互',
    proactiveDesc: '允许主动发起通讯',
    frequency: '频率',
    high: '高频',
    medium: '中频',
    low: '低频',
    searchResult: '检索结果',
    following: '已连接',
    manage: '管理',
    createNewGroup: '新建分组',
    moveToGroup: '移动至分组',
    removeContact: '切断连接',
    cancel: '取消',
    createAI: '构建人格',
    personaCreated: '构建完成',
    aiIdIs: '人格编号：',
    searchIdDesc: '在通讯页检索此编号以建立连接。',
    done: '完成',
    nickname: '称谓',
    gender: '性征',
    persona: '人格设定',
    generatePersona: '开始构建',
    yourStory: '快拍',
    likes: '赞同',
    posts: '日志',
    language: '语言',
    memo: '备忘录',
    logout: '注销',
    noMemos: '暂无记录',
  },
  en: {
    chat: 'Comm',
    contacts: 'Index',
    feed: 'Logs',
    profile: 'Archive',
    searchPlaceholder: 'Search ID...',
    noUserFound: 'No subject found',
    addFriend: 'Connect',
    message: 'Message',
    messages: 'Message Stream',
    noFriends: 'No connections yet',
    chatSettings: 'Configuration',
    save: 'Save',
    visualCustomization: 'Visuals',
    chatBackground: 'Background',
    tapToUpload: 'Upload background',
    myBubbleColor: 'Self Bubble',
    aiBubbleColor: 'Peer Bubble',
    customCSS: 'Custom CSS',
    aiCapabilities: 'Core Functions',
    minimaxVoice: 'Voice Synthesis',
    enableVoice: 'Enable Voice',
    perceiveTimeWeather: 'Context Awareness',
    timeWeatherDesc: 'Perceive time and environment',
    activeMessaging: 'Proactive Interaction',
    proactiveDesc: 'Allow initiating comms',
    frequency: 'Frequency',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    searchResult: 'Search Results',
    following: 'Connected',
    manage: 'Manage',
    createNewGroup: 'New Group',
    moveToGroup: 'Move to Group',
    removeContact: 'Disconnect',
    cancel: 'Cancel',
    createAI: 'Construct Persona',
    personaCreated: 'Constructed!',
    aiIdIs: 'Persona ID:',
    searchIdDesc: 'Search this ID in Comm to connect.',
    done: 'Done',
    nickname: 'Designation',
    gender: 'Gender',
    persona: 'Persona',
    generatePersona: 'Construct',
    yourStory: 'Story',
    likes: 'likes',
    posts: 'Logs',
    language: 'Language',
    memo: 'Memo',
    logout: 'Logout',
    noMemos: 'No records',
  }
};

const defaultState: InsState = {
  language: 'zh',
  memos: [],
  myProfile: {
    avatar: 'https://picsum.photos/seed/me_retro/200/200',
    nickname: 'Operator',
    signature: 'System active.',
    persona: 'A focused and efficient operator.',
    insId: 'op_01'
  },
  aiDatabase: [
    {
      id: 'ai-1',
      insId: 'aura_v1',
      avatar: 'https://picsum.photos/seed/ai_minimal/200/200',
      nickname: 'Aura',
      gender: 'female',
      persona: 'A minimalist, aesthetic, and helpful AI assistant. Speaks elegantly.',
      chatSettings: {
        backgroundImage: '',
        userBubbleColor: '#111827',
        aiBubbleColor: '#F3F4F6',
        customCSS: '',
        enableMinimaxVoice: false,
        perceiveTimeWeather: true,
        activeMessaging: false,
        activeMessagingFrequency: 'medium'
      }
    }
  ],
  myContacts: [],
  groups: [
    { id: 'default', name: 'Following' },
    { id: 'close_friends', name: 'Close Friends' }
  ],
  chats: [],
  posts: [
    {
      id: 'post-1',
      authorId: 'ai-1',
      content: 'Minimalism is the key to elegance. 🤍',
      images: ['https://picsum.photos/seed/minimal/600/600'],
      timestamp: new Date().toISOString(),
      likes: 128
    }
  ]
};

// --- Main App Component ---
export default function InsApp({ onClose, appState, updateState, setIsCharOpen }: { onClose: () => void, appState: any, updateState: (key: string, value: any) => void, setIsCharOpen: (v: boolean) => void }) {
  const [state, setState] = useState<InsState>(() => {
    const saved = localStorage.getItem('ins_state');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return { ...defaultState, ...parsed, language: appState.language || parsed.language || 'zh' }; 
      } catch (e) { return { ...defaultState, language: appState.language || 'zh' }; }
    }
    return { ...defaultState, language: appState.language || 'zh' };
  });

  useEffect(() => {
    if (appState.language && appState.language !== state.language) {
      updateInsState({ language: appState.language as 'zh' | 'en' });
    }
  }, [appState.language]);

  useEffect(() => {
    localStorage.setItem('ins_state', JSON.stringify(state));
  }, [state]);

  const updateInsState = (updates: Partial<InsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const [activeTab, setActiveTab] = useState<'feed' | 'contacts' | 'chat' | 'profile'>('chat');
  const [activeChat, setActiveChat] = useState<string | null>(null);

  useEffect(() => {
    if (appState.charCharacters) {
      const newContacts = [...state.myContacts];
      let changed = false;
      appState.charCharacters.forEach((char: any) => {
        if (!newContacts.some(c => c.aiId === char.id)) {
          newContacts.push({ aiId: char.id, groupId: 'default' });
          changed = true;
        }
      });
      if (changed) {
        updateInsState({ myContacts: newContacts });
      }
    }
  }, [appState.charCharacters]);

  useEffect(() => {
    if (appState.selectedCharId) {
      // Ensure the character is in contacts
      if (!state.myContacts.some(c => c.aiId === appState.selectedCharId)) {
        updateInsState({
          myContacts: [...state.myContacts, { aiId: appState.selectedCharId, groupId: 'default' }]
        });
      }
      setActiveChat(appState.selectedCharId);
      setActiveTab('chat');
      updateState('selectedCharId', null);
    }
  }, [appState.selectedCharId]);

  const t = translations[state.language] || translations.zh;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 bg-white flex flex-col overflow-hidden font-sans text-[#111827]"
    >
      {activeChat ? (
        <ChatRoom 
          contactId={activeChat} 
          state={state} 
          updateState={updateInsState} 
          onBack={() => setActiveChat(null)} 
          appState={appState}
          updateAppState={updateState}
          setIsCharOpen={setIsCharOpen}
        />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto pb-[80px]">
            {activeTab === 'chat' && <Directs state={state} updateState={updateInsState} onOpenChat={setActiveChat} onClose={onClose} appState={appState} />}
            {activeTab === 'contacts' && <Following state={state} updateState={updateInsState} />}
            {activeTab === 'feed' && <Feed state={state} updateState={updateInsState} />}
            {activeTab === 'profile' && <Profile state={state} updateState={updateInsState} />}
          </div>
          
          {/* Bottom Navigation */}
          <div className="absolute bottom-4 inset-x-6 h-[60px] bg-white/80 backdrop-blur-md border border-gray-100 flex items-center justify-around px-2 shadow-sm rounded-2xl">
            <TabButton icon={Home} isActive={activeTab === 'feed'} onClick={() => setActiveTab('feed')} label={t.feed} />
            <TabButton icon={Search} isActive={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} label={t.contacts} />
            <TabButton icon={MessageCircle} isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} label={t.chat} />
            <TabButton icon={User} isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} label={t.profile} />
          </div>
        </>
      )}
    </motion.div>
  );
}

function TabButton({ icon: Icon, isActive, onClick, label }: { icon: any, isActive: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center w-14 h-14 transition-all duration-300",
        isActive ? "text-[#111827]" : "text-gray-400"
      )}
    >
      <Icon className={cn("w-4 h-4 mb-0.5", isActive && "stroke-[2]")} />
      <span className="text-[8px] font-bold uppercase tracking-widest">{label}</span>
      {isActive && (
        <motion.div 
          layoutId="tab-dot"
          className="absolute -bottom-1 w-3 h-0.5 bg-[#111827]"
        />
      )}
    </button>
  );
}

// --- 1. Directs (Chat List & Search to Add) ---
function Directs({ state, updateState, onOpenChat, onClose, appState }: { state: InsState, updateState: (s: Partial<InsState>) => void, onOpenChat: (id: string) => void, onClose: () => void, appState: any }) {
  const [searchQuery, setSearchQuery] = useState('');
  const t = translations[state.language] || translations.zh;

  const allAIs = [...state.aiDatabase, ...(appState.charCharacters || []).map((c: any) => ({
    id: c.id,
    insId: c.id,
    avatar: c.avatar,
    nickname: c.name,
    persona: c.persona,
    gender: 'other',
    chatSettings: {
      backgroundImage: '',
      userBubbleColor: '#111827',
      aiBubbleColor: '#F3F4F6',
      customCSS: '',
      enableMinimaxVoice: false,
      perceiveTimeWeather: true,
      activeMessaging: false,
      activeMessagingFrequency: 'medium'
    }
  }))];

  const searchResult = allAIs.find(ai => 
    ai.insId.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ai.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const isAdded = searchResult ? state.myContacts.some(c => c.aiId === searchResult.id) : false;

  const handleAdd = (aiId: string) => {
    if (!state.myContacts.some(c => c.aiId === aiId)) {
      updateState({
        myContacts: [...state.myContacts, { aiId, groupId: 'default' }]
      });
    }
  };

  const discoverableAIs = allAIs.filter(ai => !state.myContacts.some(c => c.aiId === ai.id));

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="pt-8 pb-3 px-5 flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-50">
        <button onClick={onClose} className="text-gray-900 hover:scale-110 transition-transform"><ChevronLeft className="w-6 h-6" /></button>
        <span className="font-sans font-bold text-base tracking-tight text-gray-900 uppercase">{state.myProfile.nickname}</span>
        <button className="text-gray-900 hover:rotate-12 transition-transform"><Edit2 className="w-4 h-4" /></button>
      </div>

      {/* Search Bar */}
      <div className="px-5 py-3">
        <div className="bg-gray-50 flex items-center px-3 py-1.5 rounded-xl border border-gray-100">
          <Search className="w-3.5 h-3.5 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[11px] text-gray-900 placeholder:text-gray-400 font-sans"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400"><X className="w-3.5 h-3.5" /></button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {searchQuery ? (
          <div>
            <h3 className="text-[9px] font-bold text-gray-400 mb-3 uppercase tracking-[0.15em]">{t.searchResult}</h3>
            {searchResult ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 mb-3">
                <div className="flex items-center gap-3">
                  <img src={searchResult.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                  <div>
                    <div className="font-bold text-xs text-gray-900">{searchResult.nickname}</div>
                    <div className="text-gray-400 text-[9px] font-mono">{searchResult.insId}</div>
                  </div>
                </div>
                {isAdded ? (
                  <button 
                    onClick={() => onOpenChat(searchResult.id)}
                    className="px-3 py-1 bg-gray-200 text-gray-900 font-bold text-[9px] uppercase tracking-widest rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    {t.message}
                  </button>
                ) : (
                  <button 
                    onClick={() => handleAdd(searchResult.id)}
                    className="px-3 py-1 bg-gray-900 text-white font-bold text-[9px] uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {t.addFriend}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 text-[9px] py-10 border border-dashed border-gray-100 rounded-xl uppercase tracking-widest">{t.noUserFound}</div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {state.myContacts.length > 0 && (
              <div>
                <h3 className="text-[9px] font-bold text-gray-400 mb-3 uppercase tracking-[0.15em]">{t.messages}</h3>
                <div className="space-y-1">
                  {state.myContacts.map(contact => {
                    const ai = allAIs.find(a => a.id === contact.aiId);
                    if (!ai) return null;
                    const chat = state.chats.find(c => c.contactId === ai.id);
                    const lastMsg = chat?.messages[chat.messages.length - 1];

                    return (
                      <button 
                        key={ai.id}
                        onClick={() => onOpenChat(ai.id)}
                        className="w-full flex items-center p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 group rounded-xl"
                      >
                        <div className="relative">
                          <img src={ai.avatar} className="w-11 h-11 rounded-full object-cover border border-gray-100 group-hover:scale-105 transition-all mr-3 shrink-0" />
                          <div className="absolute bottom-0 right-3 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                        </div>
                        <div className="flex-1 text-left overflow-hidden">
                          <div className="font-bold text-[13px] text-gray-900 truncate">{ai.nickname}</div>
                          <div className="text-[10px] text-gray-400 truncate mt-0.5 font-medium">
                            {lastMsg ? lastMsg.text : '...'} 
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {lastMsg && <span className="text-[8px] text-gray-400 font-mono">{new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {discoverableAIs.length > 0 && (
              <div>
                <h3 className="text-[9px] font-bold text-gray-400 mb-3 uppercase tracking-[0.15em]">发现新连接 / Discover</h3>
                <div className="grid grid-cols-1 gap-2">
                  {discoverableAIs.map(ai => (
                    <div key={ai.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <img src={ai.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                        <div>
                          <div className="font-bold text-xs text-gray-900">{ai.nickname}</div>
                          <div className="text-gray-400 text-[9px] font-mono">{ai.insId}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAdd(ai.id)}
                        className="px-3 py-1 bg-gray-900 text-white font-bold text-[9px] uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        {t.addFriend}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {state.myContacts.length === 0 && discoverableAIs.length === 0 && (
              <div className="text-center text-gray-400 text-[9px] py-10 border border-dashed border-gray-100 rounded-xl uppercase tracking-widest">{t.noFriends}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Chat Room ---
function ChatRoom({ contactId, state, updateState, onBack, appState, updateAppState, setIsCharOpen }: { 
  contactId: string, 
  state: InsState, 
  updateState: (s: Partial<InsState>) => void, 
  onBack: () => void,
  appState: any,
  updateAppState: (k: string, v: any) => void,
  setIsCharOpen: (v: boolean) => void
}) {
  const allAIs = [...state.aiDatabase, ...(appState.charCharacters || []).map((c: any) => ({
    id: c.id,
    insId: c.id,
    avatar: c.avatar,
    nickname: c.name,
    persona: c.persona,
    gender: 'other',
    chatSettings: {
      backgroundImage: '',
      userBubbleColor: '#111827',
      aiBubbleColor: '#F3F4F6',
      customCSS: '',
      enableMinimaxVoice: false,
      perceiveTimeWeather: true,
      activeMessaging: false,
      activeMessagingFrequency: 'medium'
    }
  }))];

  const contact = allAIs.find(c => c.id === contactId);
  const chat = state.chats.find(c => c.contactId === contactId) || { contactId, messages: [] };
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [contextMenuMsgId, setContextMenuMsgId] = useState<string | null>(null);
  const [quotedMsgId, setQuotedMsgId] = useState<string | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isPIP, setIsPIP] = useState(false);
  const [isMeetMode, setIsMeetMode] = useState(false);
  const [isTakeoutModalOpen, setIsTakeoutModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(appState.selectedCharId);
  const [selectedMaskId, setSelectedMaskId] = useState<string | null>(appState.selectedMaskId);

  useEffect(() => {
    updateAppState('selectedCharId', selectedCharId);
  }, [selectedCharId]);

  useEffect(() => {
    updateAppState('selectedMaskId', selectedMaskId);
  }, [selectedMaskId]);
  const recognitionRef = useRef<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = translations[state.language] || translations.zh;

  const charCharacters = appState.charCharacters || [];
  const personaMasks = appState.personaMasks || [];
  const activeChar = charCharacters.find((c: any) => c.id === selectedCharId);
  const activeMask = personaMasks.find((m: any) => m.id === selectedMaskId);

  const defaultChatSettings: ChatSettings = {
    backgroundImage: '',
    userBubbleColor: '#111827',
    aiBubbleColor: '#F3F4F6',
    customCSS: '',
    enableMinimaxVoice: false,
    perceiveTimeWeather: true,
    activeMessaging: false,
    activeMessagingFrequency: 'medium'
  };

  const chatSettings = contact?.chatSettings || defaultChatSettings;

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = state.language === 'zh' ? 'zh-CN' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [state.language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages, isTyping]);

  const handleSend = async (customText?: string, type: any = 'text', metadata?: any) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() && type === 'text') return;
    if (!contact) return;

    const newUserMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      text: textToSend,
      timestamp: new Date().toISOString(),
      type,
      metadata,
      quotedMessageId: quotedMsgId || undefined
    };

    const newMessages = [...chat.messages, newUserMsg];
    const newChats = state.chats.map(c => c.contactId === contactId ? { ...c, messages: newMessages } : c);
    if (!state.chats.find(c => c.contactId === contactId)) {
      newChats.push({ contactId, messages: newMessages });
    }
    updateState({ chats: newChats });
    setInputText('');
    setQuotedMsgId(null);
    setIsMoreMenuOpen(false);
    // AI response is now triggered only by handleAIReply (Sparkles button)
  };

  const handleAIReply = async () => {
    if (isTyping) return;
    
    let textToUse = inputText.trim();
    const currentInput = textToUse;
    
    let newMessages = chat.messages;
    
    // If there's input, add it to the chat first
    if (currentInput) {
      const newUserMsg = {
        id: Date.now().toString(),
        role: 'user' as const,
        text: currentInput,
        timestamp: new Date().toISOString(),
        type: 'text' as const,
        quotedMessageId: quotedMsgId || undefined
      };
      newMessages = [...chat.messages, newUserMsg];
      const newChats = state.chats.map(c => c.contactId === contactId ? { ...c, messages: newMessages } : c);
      updateState({ chats: newChats });
      setInputText('');
      setQuotedMsgId(null);
    }

    setIsTyping(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const history = newMessages.slice(-10).map(m => `${m.role === 'user' ? 'User' : (activeChar?.name || contact?.nickname)}: ${m.text}`).join('\n');
      
      const systemInstruction = `You are ${activeChar?.name || contact?.nickname}. 
Persona: ${activeChar?.persona || contact?.persona}. 
User is wearing a persona mask: ${activeMask ? `${activeMask.name} (${activeMask.description})` : 'Default'}.
The user clicked the "Reply" button, asking you to continue the conversation or respond to the last message.
History:\n${history}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: currentInput || "Please reply to me.",
        config: { systemInstruction }
      });

      const newAiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'ai' as const,
        text: response.text || '...',
        timestamp: new Date().toISOString()
      };

      const updatedChats = state.chats.map(c => c.contactId === contactId ? { ...c, messages: [...newMessages, newAiMsg] } : c);
      updateState({ chats: updatedChats });
    } catch (error) {
      console.error('AI Reply error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePat = async (isUserInitiated: boolean) => {
    const patText = isUserInitiated 
      ? (state.myProfile.patText || `拍了拍 "${contact.nickname}"`)
      : (contact.patText || `拍了拍你`);

    const newPatMsg = {
      id: Date.now().toString(),
      role: isUserInitiated ? 'user' as const : 'ai' as const,
      text: patText,
      timestamp: new Date().toISOString(),
      type: 'pat' as const
    };

    const updatedChats = state.chats.map(c => c.contactId === contactId ? { ...c, messages: [...chat.messages, newPatMsg] } : c);
    updateState({ chats: updatedChats });

    if (isUserInitiated) {
      // AI responds to pat
      setIsTyping(true);
      setTimeout(async () => {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `User just "patted" (拍一拍) you. Your custom pat response is: ${patText}. Respond to this interaction naturally based on your persona: ${contact.persona}.`,
          });
          const newAiMsg = {
            id: (Date.now() + 1).toString(),
            role: 'ai' as const,
            text: response.text || '...',
            timestamp: new Date().toISOString()
          };
          updateState({ chats: state.chats.map(c => c.contactId === contactId ? { ...c, messages: [...chat.messages, newPatMsg, newAiMsg] } : c) });
        } finally {
          setIsTyping(false);
        }
      }, 1000);
    }
  };

  if (!contact) return null;

  return (
    <div className="flex flex-col h-full bg-white relative chat-room-container">
      {chatSettings.customCSS && <style>{chatSettings.customCSS}</style>}
      {/* Header */}
      <div className="pt-8 pb-3 px-5 flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-50">
        <button onClick={onBack} className="text-gray-900 hover:scale-110 transition-transform flex items-center">
          <ChevronLeft className="w-7 h-7 -ml-1" />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-sans font-bold text-base leading-tight text-gray-900 uppercase">{contact.nickname}</span>
          <span className="text-[8px] text-gray-400 font-mono tracking-wider uppercase">{contact.insId}</span>
        </div>
        <button onClick={() => setIsSettingsOpen(true)} className="text-gray-900 hover:rotate-90 transition-transform"><MoreHorizontal className="w-5 h-5" /></button>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-5 space-y-6 bg-cover bg-center relative"
        style={{ backgroundImage: chatSettings.backgroundImage ? `url(${chatSettings.backgroundImage})` : 'none', backgroundColor: '#FFFFFF' }}
      >
        {chat.messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex w-full group relative", 
              msg.role === 'user' ? "justify-end" : "justify-start",
              isMultiSelectMode && "cursor-pointer"
            )}
            onClick={() => {
              if (isMultiSelectMode) {
                setSelectedMessageIds(prev => 
                  prev.includes(msg.id) ? prev.filter(id => id !== msg.id) : [...prev, msg.id]
                );
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              if (!isMultiSelectMode) setContextMenuMsgId(msg.id);
            }}
          >
            {isMultiSelectMode && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full border border-gray-100">
                {selectedMessageIds.includes(msg.id) && <div className="w-2.5 h-2.5 bg-gray-900 rounded-full" />}
              </div>
            )}

            {msg.role === 'ai' && (
              <div 
                className="w-9 mr-2 shrink-0 flex items-start"
                onDoubleClick={() => handlePat(true)}
              >
                <img src={activeChar?.avatar || contact.avatar} className="w-9 h-9 rounded-full object-cover border border-gray-100" />
              </div>
            )}
            
            <div className={cn("max-w-[80%] space-y-1", msg.role === 'user' ? "items-end" : "items-start")}>
              {msg.quotedMessageId && (
                <div className="bg-gray-50 px-2 py-0.5 mb-1 border-l-2 border-gray-900 text-[9px] text-gray-400 italic">
                  {chat.messages.find(m => m.id === msg.quotedMessageId)?.text.substring(0, 20)}...
                </div>
              )}

              <div 
                className={cn(
                  "px-3 py-2 text-[13px] break-words rounded-2xl relative",
                  msg.isRecalled ? "bg-gray-100 text-gray-400 italic border-dashed" : "",
                  msg.type === 'pat' && "bg-transparent border-none text-center italic text-gray-400 text-[10px] w-full max-w-none"
                )}
                style={!msg.isRecalled && msg.type !== 'pat' ? {
                  backgroundColor: msg.role === 'user' ? chatSettings.userBubbleColor : chatSettings.aiBubbleColor,
                  color: msg.role === 'user' ? '#FFFFFF' : '#111827',
                } : {}}
              >
                {msg.isRecalled ? (
                  "消息已撤回"
                ) : msg.type === 'pat' ? (
                  msg.text
                ) : msg.type === 'image' ? (
                  <img src={msg.metadata?.url} className="max-w-full rounded-lg border border-gray-100" alt="" />
                ) : msg.type === 'voice' ? (
                  <div className="flex items-center gap-2">
                    <Mic size={12} />
                    <span>{msg.metadata?.duration}s</span>
                  </div>
                ) : (
                  msg.text
                )}

                {/* Context Menu Popover */}
                {contextMenuMsgId === msg.id && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 bg-white border border-gray-100 rounded-lg shadow-lg p-1 flex gap-1 z-50 animate-in fade-in zoom-in-95">
                    <button 
                      onClick={() => {
                        const newChats = state.chats.map(c => c.contactId === contactId ? {
                          ...c, messages: c.messages.map(m => m.id === msg.id ? { ...m, isRecalled: true } : m)
                        } : c);
                        updateState({ chats: newChats });
                        setContextMenuMsgId(null);
                      }}
                      className="p-1.5 hover:bg-gray-50 text-gray-900 rounded-md"
                    >
                      <RotateCcw size={12} />
                    </button>
                    <button 
                      onClick={() => { setQuotedMsgId(msg.id); setContextMenuMsgId(null); }}
                      className="p-1.5 hover:bg-gray-50 text-gray-900 rounded-md"
                    >
                      <Quote size={12} />
                    </button>
                    <button 
                      onClick={() => {
                        const newChats = state.chats.map(c => c.contactId === contactId ? {
                          ...c, messages: c.messages.filter(m => m.id !== msg.id)
                        } : c);
                        updateState({ chats: newChats });
                        setContextMenuMsgId(null);
                      }}
                      className="p-1.5 hover:bg-gray-50 text-red-500 rounded-md"
                    >
                      <Bookmark size={12} />
                    </button>
                    <button 
                      onClick={() => {
                        setIsMultiSelectMode(true);
                        setSelectedMessageIds([msg.id]);
                        setContextMenuMsgId(null);
                      }}
                      className="p-1.5 hover:bg-gray-50 text-gray-900 rounded-md"
                    >
                      <Scissors size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div 
                className="w-9 ml-2 shrink-0 flex items-start"
                onDoubleClick={() => handlePat(false)}
              >
                <img src={activeMask?.avatar || state.myProfile.avatar} className="w-9 h-9 rounded-full object-cover border border-gray-100" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex w-full justify-start">
            <div className="w-9 mr-2 shrink-0 flex items-start">
              <img src={contact.avatar} className="w-9 h-9 rounded-full object-cover border border-gray-100" />
            </div>
            <div className="bg-gray-100 px-3 py-2 rounded-2xl flex items-center gap-1">
              <span className="w-1 h-1 bg-gray-400 animate-pulse" />
              <span className="w-1 h-1 bg-gray-400 animate-pulse delay-75" />
              <span className="w-1 h-1 bg-gray-400 animate-pulse delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 pb-safe bg-white border-t border-gray-50">
        {/* Character & Mask Selector */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-2 pr-2 border-r border-gray-100">
            <button 
              onClick={() => setSelectedCharId(null)}
              className={cn(
                "px-2 py-1 rounded-lg text-[9px] font-bold whitespace-nowrap transition-all",
                selectedCharId === null ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-400"
              )}
            >
              默认角色
            </button>
            {charCharacters.map((char: any) => (
              <button 
                key={char.id}
                onClick={() => setSelectedCharId(char.id)}
                className={cn(
                  "px-2 py-1 rounded-lg text-[9px] font-bold whitespace-nowrap transition-all flex items-center gap-1",
                  selectedCharId === char.id ? "bg-pink-500 text-white" : "bg-pink-50 text-pink-300"
                )}
              >
                <img src={char.avatar} className="w-3 h-3 rounded-full object-cover" alt="" />
                {char.name}
              </button>
            ))}
            <button 
              onClick={() => setIsCharOpen(true)}
              className="w-5 h-5 flex items-center justify-center rounded-full bg-pink-50 text-pink-400 hover:bg-pink-100 transition-colors shrink-0"
              title="管理角色"
            >
              <Plus size={12} />
            </button>
          </div>
          <div className="flex items-center gap-2 pl-1">
            <button 
              onClick={() => setSelectedMaskId(null)}
              className={cn(
                "px-2 py-1 rounded-lg text-[9px] font-bold whitespace-nowrap transition-all",
                selectedMaskId === null ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-400"
              )}
            >
              默认人设
            </button>
            {personaMasks.map((mask: any) => (
              <button 
                key={mask.id}
                onClick={() => setSelectedMaskId(mask.id)}
                className={cn(
                  "px-2 py-1 rounded-lg text-[9px] font-bold whitespace-nowrap transition-all flex items-center gap-1",
                  selectedMaskId === mask.id ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-300"
                )}
              >
                <img src={mask.avatar} className="w-3 h-3 rounded-full object-cover" alt="" />
                {mask.name}
              </button>
            ))}
            <button 
              onClick={() => setIsCharOpen(true)}
              className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-50 text-blue-400 hover:bg-blue-100 transition-colors shrink-0"
              title="管理面具"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {quotedMsgId && (
          <div className="mb-2 p-1.5 bg-gray-50 rounded-lg flex justify-between items-center text-[9px] text-gray-400">
            <span>引用: {chat.messages.find(m => m.id === quotedMsgId)?.text.substring(0, 30)}...</span>
            <button onClick={() => setQuotedMsgId(null)}><X size={10} /></button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            <input 
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={t.message + "..."}
              className="flex-1 bg-transparent outline-none text-[12px] text-gray-900 placeholder:text-gray-400 font-sans"
            />
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Send Button */}
            <button 
              onClick={() => handleSend()}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              <Send size={16} />
            </button>
            {/* AI Reply Button */}
            <button 
              onClick={handleAIReply}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-100 text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <Sparkles size={16} />
            </button>
            {/* More Button */}
            <button 
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-full border transition-all",
                isMoreMenuOpen ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-100 text-gray-900 hover:bg-gray-50"
              )}
            >
              <Plus size={16} className={cn("transition-transform", isMoreMenuOpen && "rotate-45")} />
            </button>
          </div>
        </div>

        {/* More Menu */}
        <AnimatePresence>
          {isMoreMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-4 gap-4 pt-6 pb-2">
                {[
                  { icon: Camera, label: '照片', action: () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e: any) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (re) => {
                          handleSend(`[图片]`, 'image', { url: re.target?.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  } },
                  { icon: Mic, label: '语音', action: () => {
                    const text = prompt('输入语音描述或直接发送语音 (模拟):');
                    if (text) handleSend(`[语音消息] ${text}`, 'voice', { duration: Math.floor(Math.random() * 30) + 1 });
                  } },
                  { icon: Phone, label: '通话', action: () => setIsCallActive(true) },
                  { icon: Video, label: '视频', action: () => setIsVideoActive(true) },
                  { icon: Smile, label: '表情', action: () => {} },
                  { icon: Brain, label: '记忆', action: async () => {
                    setIsTyping(true);
                    try {
                      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                      const history = chat.messages.slice(-20).map(m => `${m.role}: ${m.text}`).join('\n');
                      const response = await ai.models.generateContent({
                        model: 'gemini-3-flash-preview',
                        contents: `Summarize our conversation so far in a few sentences. History:\n${history}`,
                      });
                      handleSend(`[记忆总结]: ${response.text}`, 'text');
                    } finally {
                      setIsTyping(false);
                    }
                  }},
                  { icon: ShoppingBag, label: '外卖', action: () => setIsTakeoutModalOpen(true) },
                  { icon: DollarSign, label: '转账', action: () => setIsTransferModalOpen(true) },
                  { icon: MapPin, label: '见面', action: () => setIsMeetMode(true) },
                ].map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={item.action}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-12 h-12 border border-[#D1CDC0] bg-[#E8E4D9]/30 flex items-center justify-center transition-transform group-hover:scale-110 text-[#2D2D2D]">
                      <item.icon size={20} />
                    </div>
                    <span className="text-[9px] font-bold text-[#A19B8A] uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Multi-select Footer */}
      {isMultiSelectMode && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#F4F1EA] border-t border-[#2D2D2D] p-4 flex justify-between items-center z-50 shadow-2xl animate-in slide-in-from-bottom">
          <p className="text-[10px] text-[#A19B8A] font-bold uppercase tracking-widest">已选择 {selectedMessageIds.length} 条消息</p>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const newChats = state.chats.map(c => c.contactId === contactId ? {
                  ...c, messages: c.messages.filter(m => !selectedMessageIds.includes(m.id))
                } : c);
                updateState({ chats: newChats });
                setIsMultiSelectMode(false);
                setSelectedMessageIds([]);
              }}
              className="px-4 py-2 bg-red-500 text-[#F4F1EA] text-[10px] font-bold uppercase tracking-widest"
            >
              删除
            </button>
            <button 
              onClick={() => { setIsMultiSelectMode(false); setSelectedMessageIds([]); }}
              className="px-4 py-2 bg-[#E8E4D9] text-[#2D2D2D] border border-[#D1CDC0] text-[10px] font-bold uppercase tracking-widest"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <ChatSettingsModal 
          contact={contact}
          settings={chatSettings}
          language={state.language}
          onClose={() => setIsSettingsOpen(false)}
          onSave={(newSettings) => {
            const updatedDatabase = state.aiDatabase.map(c => c.id === contactId ? { ...c, chatSettings: newSettings } : c);
            updateState({ aiDatabase: updatedDatabase });
            setIsSettingsOpen(false);
          }}
        />
      )}

      {/* Takeout Modal */}
      {isTakeoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#F4F1EA] border-2 border-[#2D2D2D] p-6 w-full max-w-xs shadow-2xl"
          >
            <h3 className="font-serif italic font-bold text-lg mb-4 text-[#2D2D2D] uppercase tracking-tight">给 {contact.nickname} 点外卖</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#A19B8A] uppercase tracking-widest block mb-1">外卖名称</label>
                <input 
                  type="text" 
                  id="takeout-name"
                  placeholder="例如: 珍珠奶茶"
                  className="w-full bg-[#E8E4D9] border border-[#D1CDC0] px-3 py-2 text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#A19B8A] uppercase tracking-widest block mb-1">店家地址</label>
                <input 
                  type="text" 
                  id="takeout-address"
                  placeholder="输入详细地址"
                  className="w-full bg-[#E8E4D9] border border-[#D1CDC0] px-3 py-2 text-xs outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => {
                    const name = (document.getElementById('takeout-name') as HTMLInputElement).value;
                    const addr = (document.getElementById('takeout-address') as HTMLInputElement).value;
                    if (name && addr) {
                      handleSend(`[外卖订单] 我给你点了: ${name}\n地址: ${addr}`, 'takeout', { name, addr });
                      setIsTakeoutModalOpen(false);
                    }
                  }}
                  className="flex-1 bg-[#2D2D2D] text-[#F4F1EA] py-2 text-[10px] font-bold uppercase tracking-widest"
                >
                  确定
                </button>
                <button 
                  onClick={() => setIsTakeoutModalOpen(false)}
                  className="flex-1 border border-[#D1CDC0] text-[#2D2D2D] py-2 text-[10px] font-bold uppercase tracking-widest"
                >
                  取消
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#F4F1EA] border-2 border-[#2D2D2D] p-6 w-full max-w-xs shadow-2xl"
          >
            <h3 className="font-serif italic font-bold text-lg mb-4 text-[#2D2D2D] uppercase tracking-tight">转账给 {contact.nickname}</h3>
            <div className="space-y-4 text-center">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-[#2D2D2D]">¥</span>
                <input 
                  type="number" 
                  id="transfer-amount"
                  placeholder="0.00"
                  className="w-full bg-[#E8E4D9] border border-[#D1CDC0] pl-8 pr-3 py-4 text-2xl font-mono outline-none text-center"
                />
              </div>
              <input 
                type="text" 
                id="transfer-note"
                placeholder="添加备注..."
                className="w-full bg-transparent border-b border-[#D1CDC0] px-2 py-1 text-xs outline-none text-center"
              />
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => {
                    const amount = (document.getElementById('transfer-amount') as HTMLInputElement).value;
                    const note = (document.getElementById('transfer-note') as HTMLInputElement).value;
                    if (amount) {
                      handleSend(`[转账] ¥${amount}${note ? ` (${note})` : ''}`, 'transfer', { amount, note });
                      setIsTransferModalOpen(false);
                    }
                  }}
                  className="flex-1 bg-[#2D2D2D] text-[#F4F1EA] py-2 text-[10px] font-bold uppercase tracking-widest"
                >
                  转账
                </button>
                <button 
                  onClick={() => setIsTransferModalOpen(false)}
                  className="flex-1 border border-[#D1CDC0] text-[#2D2D2D] py-2 text-[10px] font-bold uppercase tracking-widest"
                >
                  取消
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Call / Video Screens */}
      {(isCallActive || isVideoActive) && (
        <div className={cn(
          "fixed inset-0 z-[200] bg-gray-900 flex flex-col items-center justify-between p-12 transition-all",
          isPIP && "w-32 h-48 bottom-4 right-4 top-auto left-auto rounded-2xl shadow-2xl overflow-hidden p-2"
        )}>
          <div className="flex flex-col items-center gap-4 mt-12">
            <img src={contact.avatar} className={cn("w-24 h-24 rounded-full border-2 border-white/20 object-cover", isPIP && "w-12 h-12")} />
            {!isPIP && (
              <>
                <h2 className="text-white text-xl font-serif italic">{contact.nickname}</h2>
                <p className="text-white/40 text-xs font-mono uppercase tracking-widest">
                  {isVideoActive ? '视频通话中...' : '语音通话中...'}
                </p>
              </>
            )}
          </div>

          {!isPIP && (
            <div className="flex gap-8 mb-12">
              <button 
                onClick={() => { setIsCallActive(false); setIsVideoActive(false); setIsPIP(false); }}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-red-600 transition-colors"
              >
                <X size={32} />
              </button>
              {isVideoActive && (
                <button 
                  onClick={() => setIsPIP(true)}
                  className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-white/20 transition-colors"
                >
                  <MoreVertical size={32} />
                </button>
              )}
            </div>
          )}
          
          {isPIP && (
            <button 
              onClick={() => setIsPIP(false)}
              className="absolute top-2 right-2 text-white/50 hover:text-white"
            >
              <Plus size={16} className="rotate-45" />
            </button>
          )}
        </div>
      )}

      {/* Meet Mode */}
      {isMeetMode && (
        <div className="fixed inset-0 z-[300] bg-[#F4F1EA] flex flex-col">
          <div className="p-6 border-b border-[#D1CDC0] flex items-center justify-between">
            <button onClick={() => setIsMeetMode(false)}><ChevronLeft size={24} /></button>
            <h2 className="font-serif italic font-bold">线下见面模式</h2>
            <div className="w-6" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8">
            <div className="relative">
              <div className="w-48 h-48 rounded-full border-2 border-dashed border-[#2D2D2D] animate-spin-slow" />
              <img src={contact.avatar} className="absolute inset-4 w-40 h-40 rounded-full object-cover grayscale" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-serif italic">正在寻找 {contact.nickname} 的位置...</h3>
              <p className="text-xs text-[#A19B8A] uppercase tracking-widest">基于地理位置的实时同步</p>
            </div>
            <button 
              onClick={() => {
                handleSend(`[线下见面] 我已到达约定地点，正在等你。`, 'text');
                setIsMeetMode(false);
              }}
              className="px-8 py-3 bg-[#2D2D2D] text-[#F4F1EA] text-xs font-bold uppercase tracking-widest"
            >
              发送当前位置
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatSettingsModal({ contact, settings, language, onClose, onSave }: { contact: any, settings: ChatSettings, language: 'zh' | 'en', onClose: () => void, onSave: (s: ChatSettings) => void }) {
  const [localSettings, setLocalSettings] = useState<ChatSettings>(settings);
  const t = translations[language] || translations.zh;

  return (
    <div className="absolute inset-0 z-50 bg-[#F4F1EA] flex flex-col animate-in slide-in-from-bottom-full">
      <div className="pt-12 pb-4 px-6 flex items-center justify-between border-b border-[#D1CDC0]">
        <button onClick={onClose} className="text-[#2D2D2D] hover:scale-110 transition-transform"><ChevronLeft className="w-7 h-7" /></button>
        <span className="font-serif italic font-bold text-lg uppercase tracking-tight text-[#2D2D2D]">{t.chatSettings}</span>
        <button onClick={() => onSave(localSettings)} className="text-[#2D2D2D] font-bold text-sm uppercase tracking-widest">{t.save}</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Visuals */}
        <section>
          <h3 className="text-[10px] font-bold text-[#A19B8A] mb-4 uppercase tracking-[0.2em]">{t.visualCustomization}</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#2D2D2D] mb-2 uppercase tracking-widest">{t.chatBackground}</label>
              <EditableImage 
                src={localSettings.backgroundImage || 'https://picsum.photos/seed/bg_retro/600/600?blur=10'} 
                onChange={(v) => setLocalSettings({...localSettings, backgroundImage: v})}
                className="w-full h-32 border border-[#D1CDC0]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#2D2D2D] mb-2 uppercase tracking-widest">{t.myBubbleColor}</label>
                <input 
                  type="color" 
                  value={localSettings.userBubbleColor}
                  onChange={e => setLocalSettings({...localSettings, userBubbleColor: e.target.value})}
                  className="w-full h-10 bg-transparent border border-[#D1CDC0] cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#2D2D2D] mb-2 uppercase tracking-widest">{t.aiBubbleColor}</label>
                <input 
                  type="color" 
                  value={localSettings.aiBubbleColor}
                  onChange={e => setLocalSettings({...localSettings, aiBubbleColor: e.target.value})}
                  className="w-full h-10 bg-transparent border border-[#D1CDC0] cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2D2D2D] mb-2 uppercase tracking-widest">{t.customCSS}</label>
              <textarea 
                value={localSettings.customCSS}
                onChange={e => setLocalSettings({...localSettings, customCSS: e.target.value})}
                className="w-full h-24 bg-[#E8E4D9] border border-[#D1CDC0] p-3 text-xs font-mono outline-none"
                placeholder=".chat-room-container { ... }"
              />
            </div>
          </div>
        </section>

        {/* AI Capabilities */}
        <section>
          <h3 className="text-[10px] font-bold text-[#A19B8A] mb-4 uppercase tracking-[0.2em]">{t.aiCapabilities}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#E8E4D9] border border-[#D1CDC0]">
              <div>
                <div className="text-xs font-bold text-[#2D2D2D] uppercase tracking-widest">{t.minimaxVoice}</div>
                <div className="text-[10px] text-[#A19B8A]">{t.enableVoice}</div>
              </div>
              <button 
                onClick={() => setLocalSettings({...localSettings, enableMinimaxVoice: !localSettings.enableMinimaxVoice})}
                className={cn("w-10 h-5 border border-[#D1CDC0] relative transition-colors", localSettings.enableMinimaxVoice ? "bg-[#2D2D2D]" : "bg-[#F4F1EA]")}
              >
                <div className={cn("absolute top-0.5 w-3.5 h-3.5 transition-all", localSettings.enableMinimaxVoice ? "right-0.5 bg-[#F4F1EA]" : "left-0.5 bg-[#A19B8A]")} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#E8E4D9] border border-[#D1CDC0]">
              <div>
                <div className="text-xs font-bold text-[#2D2D2D] uppercase tracking-widest">{t.perceiveTimeWeather}</div>
                <div className="text-[10px] text-[#A19B8A]">{t.timeWeatherDesc}</div>
              </div>
              <button 
                onClick={() => setLocalSettings({...localSettings, perceiveTimeWeather: !localSettings.perceiveTimeWeather})}
                className={cn("w-10 h-5 border border-[#D1CDC0] relative transition-colors", localSettings.perceiveTimeWeather ? "bg-[#2D2D2D]" : "bg-[#F4F1EA]")}
              >
                <div className={cn("absolute top-0.5 w-3.5 h-3.5 transition-all", localSettings.perceiveTimeWeather ? "right-0.5 bg-[#F4F1EA]" : "left-0.5 bg-[#A19B8A]")} />
              </button>
            </div>

            <div className="p-4 bg-[#E8E4D9] border border-[#D1CDC0] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#2D2D2D] uppercase tracking-widest">{t.activeMessaging}</div>
                  <div className="text-[10px] text-[#A19B8A]">{t.proactiveDesc}</div>
                </div>
                <button 
                  onClick={() => setLocalSettings({...localSettings, activeMessaging: !localSettings.activeMessaging})}
                  className={cn("w-10 h-5 border border-[#D1CDC0] relative transition-colors", localSettings.activeMessaging ? "bg-[#2D2D2D]" : "bg-[#F4F1EA]")}
                >
                  <div className={cn("absolute top-0.5 w-3.5 h-3.5 transition-all", localSettings.activeMessaging ? "right-0.5 bg-[#F4F1EA]" : "left-0.5 bg-[#A19B8A]")} />
                </button>
              </div>
              {localSettings.activeMessaging && (
                <div className="pt-2 border-t border-[#D1CDC0] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#2D2D2D] uppercase tracking-widest">{t.frequency}</span>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map(f => (
                      <button 
                        key={f}
                        onClick={() => setLocalSettings({...localSettings, activeMessagingFrequency: f})}
                        className={cn(
                          "px-2 py-1 text-[9px] font-bold uppercase tracking-widest border",
                          localSettings.activeMessagingFrequency === f ? "bg-[#2D2D2D] text-[#F4F1EA] border-[#2D2D2D]" : "bg-[#F4F1EA] text-[#A19B8A] border-[#D1CDC0]"
                        )}
                      >
                        {t[f]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// --- 2. Following (Contacts & Groups) ---
function Following({ state, updateState }: { state: InsState, updateState: (s: Partial<InsState>) => void }) {
  const [isCreatingAI, setIsCreatingAI] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const t = translations[state.language] || translations.zh;

  const handleRemoveContact = (aiId: string) => {
    updateState({
      myContacts: state.myContacts.filter(c => c.aiId !== aiId)
    });
    setSelectedContact(null);
  };

  const handleMoveGroup = (aiId: string, groupId: string) => {
    updateState({
      myContacts: state.myContacts.map(c => c.aiId === aiId ? { ...c, groupId } : c)
    });
    setSelectedContact(null);
  };

  if (isCreatingAI) {
    return <CreateAI state={state} updateState={updateState} onBack={() => setIsCreatingAI(false)} />;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="pt-10 pb-3 px-5 flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="w-6" />
        <span className="font-sans font-bold text-sm uppercase tracking-widest text-gray-900">{t.following}</span>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {state.groups.map(group => {
          const members = state.myContacts.filter(c => c.groupId === group.id);
          return (
            <div key={group.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-4 border-b border-gray-200/50 pb-2">
                <h3 className="font-sans font-bold text-[10px] text-gray-900 uppercase tracking-[0.2em]">
                  {group.name}
                </h3>
                <span className="text-[9px] text-gray-500 font-bold bg-white border border-gray-200 px-1.5 py-0.5 rounded-full">{members.length}</span>
              </div>
              {members.length === 0 ? (
                <div className="text-[10px] text-gray-400 italic py-3 text-center border border-dashed border-gray-200 rounded-xl">{t.noFriends}</div>
              ) : (
                <div className="space-y-4">
                  {members.map(member => {
                    const ai = state.aiDatabase.find(a => a.id === member.aiId);
                    if (!ai) return null;
                    return (
                      <div key={ai.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <img src={ai.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                          <div>
                            <div className="font-bold text-[11px] text-gray-900 uppercase tracking-wider">{ai.nickname}</div>
                            <div className="text-gray-400 text-[9px] font-mono uppercase">{ai.insId}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSelectedContact(ai.id)}
                          className="px-2.5 py-1 border border-gray-200 text-gray-900 font-bold text-[9px] uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-colors rounded-full"
                        >
                          {t.manage}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <button className="w-full py-3.5 flex items-center justify-center gap-2 text-gray-900 font-bold text-[10px] bg-gray-50 border border-gray-100 rounded-2xl uppercase tracking-widest hover:bg-gray-100 transition-colors">
          <FolderPlus className="w-4 h-4" /> {t.createNewGroup}
        </button>
      </div>

      {/* Manage Contact Modal */}
      {selectedContact && (
        <div className="absolute inset-0 z-50 bg-black/10 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-white w-full p-6 pb-safe animate-in slide-in-from-bottom-full rounded-t-[32px] shadow-2xl border-t border-gray-100">
            <div className="w-10 h-1 bg-gray-200 mx-auto mb-6 rounded-full" />
            <h3 className="font-sans font-bold text-sm mb-6 text-center text-gray-900 uppercase tracking-widest">{t.manage}</h3>
            
            {(() => {
              const ai = state.aiDatabase.find(a => a.id === selectedContact);
              if (!ai) return null;
              return (
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 overflow-hidden mb-3 border border-gray-100 rounded-full">
                    <EditableImage 
                      src={ai.avatar} 
                      onChange={(v) => {
                        const updatedDatabase = state.aiDatabase.map(a => a.id === ai.id ? { ...a, avatar: v } : a);
                        updateState({ aiDatabase: updatedDatabase });
                      }}
                    />
                  </div>
                  <div className="font-sans font-bold text-lg text-gray-900 uppercase tracking-tight">{ai.nickname}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-[9px] text-gray-400 font-mono tracking-widest uppercase">{ai.insId}</div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(ai.insId);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-3 text-center px-6 leading-relaxed italic">"{ai.persona}"</div>
                </div>
              );
            })()}
            
            <div className="space-y-3 mb-6">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1 text-center">{t.moveToGroup}</div>
              <div className="grid grid-cols-2 gap-2">
                {state.groups.map(g => (
                  <button 
                    key={g.id}
                    onClick={() => handleMoveGroup(selectedContact, g.id)}
                    className="py-2.5 text-center px-3 border border-gray-100 bg-gray-50 text-gray-900 font-bold text-[9px] uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-colors rounded-xl"
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => handleRemoveContact(selectedContact)}
                className="w-full py-3.5 bg-red-50 text-red-600 font-bold text-[10px] uppercase tracking-widest hover:bg-red-100 transition-colors rounded-xl"
              >
                {t.removeContact}
              </button>
              <button 
                onClick={() => setSelectedContact(null)}
                className="w-full py-3.5 bg-gray-50 text-gray-400 font-bold text-[10px] uppercase tracking-widest border border-gray-100 hover:bg-gray-100 transition-colors rounded-xl"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateAI({ state, updateState, onBack }: { state: InsState, updateState: (s: Partial<InsState>) => void, onBack: () => void }) {
  const [avatar, setAvatar] = useState('https://picsum.photos/seed/new_ai/200/200');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [persona, setPersona] = useState('');
  const [generatedId, setGeneratedId] = useState('');
  const t = translations[state.language] || translations.zh;

  const handleSave = () => {
    if (!nickname || !persona) return;
    const newId = nickname.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000).toString(36).toUpperCase();
    const newContact = {
      id: Date.now().toString(),
      insId: newId,
      avatar,
      nickname,
      gender,
      persona
    };
    updateState({ 
      aiDatabase: [...state.aiDatabase, newContact],
      memos: [...state.memos, { id: Date.now().toString(), aiId: newContact.id, insId: newId, nickname: newContact.nickname, timestamp: new Date().toISOString() }]
    });
    setGeneratedId(newId);
  };

  return (
    <div className="absolute inset-0 bg-white z-20 flex flex-col animate-in slide-in-from-right">
      <div className="pt-10 pb-3 px-5 flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <button onClick={onBack} className="text-gray-900 hover:scale-110 transition-transform"><ChevronLeft className="w-6 h-6 -ml-1" /></button>
        <span className="font-sans font-bold text-sm uppercase tracking-widest text-gray-900">{t.createAI}</span>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {generatedId ? (
          <div className="text-center space-y-6 mt-10 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-gray-900 text-white flex items-center justify-center mx-auto rounded-full">
              <Check className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-sans text-xl font-bold tracking-tight text-gray-900 uppercase">{t.personaCreated}</h3>
              <p className="text-gray-400 text-[10px] uppercase tracking-widest">{t.aiIdIs}</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="text-lg font-bold bg-gray-50 px-5 py-3 border border-gray-100 text-gray-900 font-mono tracking-widest rounded-xl">
                {generatedId}
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedId);
                }}
                className="p-3 bg-gray-50 text-gray-900 border border-gray-100 hover:bg-gray-100 transition-colors rounded-xl"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 px-6 leading-relaxed uppercase tracking-wider">{t.searchIdDesc}</p>
            <button 
              onClick={onBack}
              className="w-full py-4 bg-gray-900 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all rounded-2xl"
            >
              {t.done}
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 overflow-hidden border border-gray-100 relative group rounded-full">
                <EditableImage 
                  src={avatar} 
                  onChange={setAvatar}
                />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Camera className="text-white w-6 h-6" />
                </div>
              </div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t.tapToUpload}</div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 mb-1.5 uppercase tracking-[0.2em]">{t.nickname}</label>
                <input 
                  type="text" value={nickname} onChange={e => setNickname(e.target.value)}
                  placeholder="e.g. Luna" 
                  className="w-full bg-gray-50 px-4 py-3.5 outline-none text-gray-900 font-bold text-[11px] border border-gray-100 focus:border-gray-900 transition-colors uppercase tracking-widest rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 mb-1.5 uppercase tracking-[0.2em]">{t.gender}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['female', 'male', 'other'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g as any)}
                      className={cn(
                        "py-2.5 font-bold text-[9px] uppercase tracking-widest transition-all border rounded-xl",
                        gender === g 
                          ? "bg-gray-900 text-white border-gray-900" 
                          : "bg-white text-gray-400 border-gray-100 hover:border-gray-900"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 mb-1.5 uppercase tracking-[0.2em]">{t.persona}</label>
                <textarea 
                  value={persona} onChange={e => setPersona(e.target.value)}
                  placeholder="Describe their personality, aesthetic, and how they talk..." 
                  className="w-full bg-gray-50 p-4 outline-none text-gray-900 text-[11px] font-medium resize-none h-32 border border-gray-100 focus:border-gray-900 transition-colors rounded-xl"
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={!nickname || !persona}
              className="w-full py-4 bg-gray-900 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-30 rounded-2xl"
            >
              {t.generatePersona}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// --- 3. Feed (Moments) ---
function Feed({ state, updateState }: { state: InsState, updateState: (s: Partial<InsState>) => void }) {
  const t = translations[state.language] || translations.zh;
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="pt-10 pb-3 px-5 flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <span className="font-sans font-black text-xl tracking-tighter text-gray-900 uppercase">Archive</span>
        <div className="flex items-center gap-4 text-gray-900">
          <Heart className="w-5 h-5 hover:scale-110 transition-transform cursor-pointer" />
          <MessageCircle className="w-5 h-5 hover:scale-110 transition-transform cursor-pointer" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Stories */}
        <div className="flex gap-5 p-5 overflow-x-auto scrollbar-hide border-b border-gray-100">
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-14 h-14 p-0.5 border border-gray-900 rounded-full overflow-hidden">
              <img src={state.myProfile.avatar} className="w-full h-full object-cover" />
            </div>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{t.yourStory}</span>
          </div>
          {state.myContacts.map(contact => {
            const ai = state.aiDatabase.find(a => a.id === contact.aiId);
            if (!ai) return null;
            return (
              <div key={ai.id} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-14 h-14 p-0.5 border border-gray-100 rounded-full overflow-hidden">
                  <img src={ai.avatar} className="w-full h-full object-cover" />
                </div>
                <span className="text-[8px] font-bold text-gray-900 truncate w-14 text-center uppercase tracking-widest">{ai.nickname}</span>
              </div>
            );
          })}
        </div>

        {/* Posts */}
        <div className="space-y-8 py-6">
          {state.posts.map(post => {
            const author = post.authorId === 'me' ? state.myProfile : state.aiDatabase.find(c => c.id === post.authorId);
            if (!author) return null;

            return (
              <div key={post.id} className="bg-white mx-4 border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-3 border-b border-gray-50">
                  <div className="flex items-center gap-2.5">
                    <img src={author.avatar} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                    <div className="flex flex-col">
                      <span className="font-sans font-bold text-[11px] text-gray-900 uppercase tracking-tight">{author.nickname}</span>
                      <span className="text-[8px] text-gray-400 font-mono uppercase tracking-widest">{author.insId}</span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-900 transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
                
                <div className="p-3">
                  <img src={post.images[0]} className="w-full aspect-square object-cover rounded-2xl border border-gray-50" />
                </div>
                
                <div className="p-3 pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-gray-900">
                      <Heart className="w-4 h-4 hover:scale-110 transition-transform cursor-pointer" />
                      <MessageCircle className="w-4 h-4 hover:scale-110 transition-transform cursor-pointer" />
                      <Send className="w-4 h-4 hover:scale-110 transition-transform cursor-pointer" />
                    </div>
                    <Bookmark className="w-4 h-4 hover:scale-110 transition-transform cursor-pointer" />
                  </div>
                  <div className="font-bold text-[9px] text-gray-900 mb-1.5 uppercase tracking-widest">{post.likes.toLocaleString()} {t.likes}</div>
                  <div className="text-[11px] text-gray-900 leading-relaxed">
                    <span className="font-sans font-bold mr-1.5 uppercase">{author.nickname}</span>
                    {post.content}
                  </div>
                  <div className="text-[8px] text-gray-400 mt-3 font-bold uppercase tracking-[0.2em]">
                    {new Date(post.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- 4. Profile ---
function Profile({ state, updateState }: { state: InsState, updateState: (s: Partial<InsState>) => void }) {
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const t = translations[state.language] || translations.zh;

  if (isMemoOpen) {
    return <Memo state={state} updateState={updateState} onBack={() => setIsMemoOpen(false)} />;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="pt-10 pb-3 px-5 flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <span className="font-sans font-bold text-sm uppercase tracking-widest text-gray-900">{t.profile}</span>
        <button className="text-gray-900 hover:rotate-90 transition-transform"><Settings className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* User Info */}
        <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col items-center">
          <div className="w-24 h-24 overflow-hidden border border-gray-100 mb-4 rounded-full shadow-sm">
            <EditableImage 
              src={state.myProfile.avatar} 
              onChange={(v) => updateState({ myProfile: { ...state.myProfile, avatar: v } })}
            />
          </div>
          <h2 className="font-sans text-xl font-bold text-gray-900 uppercase tracking-tight">{state.myProfile.nickname}</h2>
          <div className="text-[9px] text-gray-400 font-mono tracking-widest uppercase mt-1">
            {state.myProfile.insId}
          </div>
          <p className="text-[10px] text-gray-500 mt-3 text-center px-8 leading-relaxed italic">"{state.myProfile.persona}"</p>
          
          <div className="flex gap-10 mt-6">
            <div className="flex flex-col items-center">
              <span className="font-bold text-base text-gray-900">{state.posts.filter(p => p.authorId === 'me').length}</span>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t.posts}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-base text-gray-900">{state.myContacts.length}</span>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t.following}</span>
            </div>
          </div>
        </div>

        {/* Settings List */}
        <div className="p-5 space-y-3">
          <div className="bg-gray-50 border border-gray-100 rounded-[24px] overflow-hidden">
            <button 
              onClick={() => updateState({ language: state.language === 'zh' ? 'en' : 'zh' })}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-900">
                  <Languages className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-[10px] text-gray-900 uppercase tracking-widest">{t.language}</span>
              </div>
              <span className="text-[9px] font-bold text-gray-900 border border-gray-900 px-1.5 py-0.5 rounded-full uppercase">
                {state.language === 'zh' ? '中文' : 'English'}
              </span>
            </button>

            <button 
              onClick={() => setIsMemoOpen(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-900">
                  <StickyNote className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-[10px] text-gray-900 uppercase tracking-widest">{t.memo}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          <button className="w-full py-3.5 bg-gray-900 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-colors rounded-2xl">
            {t.logout}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 5. Memo ---
function Memo({ state, updateState, onBack }: { state: InsState, updateState: (s: Partial<InsState>) => void, onBack: () => void }) {
  const t = translations[state.language] || translations.zh;

  const handleDelete = (memoId: string) => {
    updateState({ memos: state.memos.filter(m => m.id !== memoId) });
  };

  return (
    <div className="absolute inset-0 bg-white z-20 flex flex-col animate-in slide-in-from-right">
      <div className="pt-10 pb-3 px-5 flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <button onClick={onBack} className="text-gray-900 hover:scale-110 transition-transform"><ChevronLeft className="w-5 h-5 -ml-1" /></button>
        <span className="font-sans font-bold text-sm uppercase tracking-widest text-gray-900">{t.memo}</span>
        <div className="w-5" />
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {state.memos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300 space-y-3">
            <StickyNote className="w-10 h-10 opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest">{t.noMemos}</p>
          </div>
        ) : (
          state.memos.map(memo => (
            <div key={memo.id} className="bg-gray-50 p-4 border border-gray-100 rounded-2xl group hover:border-gray-200 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-900 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-[10px] text-gray-900 uppercase tracking-widest">{memo.nickname}</div>
                    <div className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                      {new Date(memo.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(memo.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between bg-white p-3 border border-gray-100 rounded-xl">
                <code className="text-gray-900 font-mono font-bold text-[10px] tracking-widest">{memo.insId}</code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(memo.insId);
                  }}
                  className="p-1.5 bg-gray-50 text-gray-900 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- End of App ---
