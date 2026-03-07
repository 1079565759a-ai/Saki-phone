/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Wifi, 
  Signal, 
  Bluetooth, 
  Cloud, 
  Search, 
  AtSign, 
  MessageCircle, 
  Heart, 
  MapPin, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Send,
  ArrowLeft,
  Edit2,
  Image as ImageIcon,
  Settings,
  Palette,
  Layout,
  Key,
  Book,
  Grid,
  Type,
  Circle,
  RefreshCw,
  Globe,
  Thermometer,
  CheckCircle2,
  AlertCircle,
  FileText,
  History,
  Trash2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenAI } from "@google/genai";

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const RainOverlay = ({ show }: { show: boolean }) => {
  const drops = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${1.5 + Math.random() * 2}s`,
      delay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.4 + 0.3,
      width: `${2 + Math.random() * 2}px`,
      height: `${10 + Math.random() * 15}px`
    }));
  }, []);

  if (!show) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2rem] z-20">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="rain-drop"
          style={{
            left: drop.left,
            width: drop.width,
            height: drop.height,
            animationDuration: drop.duration,
            animationDelay: drop.delay,
            opacity: drop.opacity
          }}
        />
      ))}
    </div>
  );
};

const GlassCard = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      "bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-sm overflow-hidden",
      className
    )}
  >
    {children}
  </div>
);

const EditableText = ({ 
  value, 
  onChange, 
  className, 
  as: Component = "span",
  multiline = false
}: { 
  value: string; 
  onChange: (val: string) => void; 
  className?: string;
  as?: any;
  multiline?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(tempValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return multiline ? (
      <textarea
        ref={inputRef as any}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn("bg-white/80 border-none outline-none rounded px-1 w-full resize-none", className)}
      />
    ) : (
      <input
        ref={inputRef as any}
        type="text"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn("bg-white/80 border-none outline-none rounded px-1 w-full", className)}
      />
    );
  }

  return (
    <Component 
      onClick={(e: any) => { e.stopPropagation(); setIsEditing(true); }}
      className={cn("cursor-edit hover:bg-black/5 rounded transition-colors px-1", className)}
    >
      {value || "点击编辑"}
    </Component>
  );
};

const EditableImage = ({ 
  src, 
  onChange, 
  className, 
  alt 
}: { 
  src: string; 
  onChange: (val: string) => void; 
  className?: string;
  alt?: string;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={cn("relative group cursor-pointer overflow-hidden", className)}
      onClick={handleClick}
    >
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px]">
        <ImageIcon className="w-6 h-6" />
      </div>
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

interface AppIconProps {
  name: string;
  label: string;
  icon: any;
  iconImg?: string | null;
  onIconChange?: (val: string) => void;
  color?: string;
  onClick?: () => void;
  onLabelChange?: (val: string) => void;
  showEdit?: boolean;
}

const AppIcon: React.FC<AppIconProps> = ({ 
  name, 
  label, 
  icon: Icon, 
  iconImg,
  onIconChange,
  color = "bg-pink-100/30", 
  onClick,
  onLabelChange,
  showEdit = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onIconChange) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onIconChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer group">
      <div className="relative">
        <div 
          onClick={onClick}
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform active:scale-90 group-hover:scale-105 overflow-hidden",
            "bg-white/50 backdrop-blur-md border border-white/40",
            color
          )}
        >
          {iconImg ? (
            <img src={iconImg} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <Icon className="w-7 h-7 text-pink-200" />
          )}
        </div>
        
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      <div className="flex flex-col items-center gap-1">
        {onLabelChange ? (
          <EditableText 
            value={label} 
            onChange={onLabelChange} 
            className="text-[10px] font-medium text-gray-500/80 tracking-tight" 
          />
        ) : (
          <span className="text-[10px] font-medium text-gray-500/80 tracking-tight">{label}</span>
        )}

        {showEdit && onIconChange && (
          <button 
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            className="mt-1 px-2 py-1 bg-pink-100/40 text-pink-300 text-[8px] font-bold rounded-md border border-pink-100 shadow-sm hover:bg-pink-200 transition-colors whitespace-nowrap"
          >
            更换照片
          </button>
        )}
      </div>
    </div>
  );
};

const FloatingBall = ({ 
  show, 
  img, 
  onClick,
  isMusicOpen,
  music,
  onTogglePlay,
  onVolumeChange,
  onCloseMusic
}: { 
  show: boolean; 
  img: string; 
  onClick: () => void;
  isMusicOpen: boolean;
  music: any;
  onTogglePlay: () => void;
  onVolumeChange: (v: number) => void;
  onCloseMusic: () => void;
}) => {
  if (!show) return null;
  
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
      onClick={() => !isDragging && onClick()}
      initial={{ x: 20, y: 300 }}
      className="fixed z-[9999] w-14 h-14 cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    >
      <div className="relative w-full h-full rounded-full overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.2)] border border-white/40 group">
        {/* Fisheye Image */}
        <img 
          src={img} 
          className="w-full h-full object-cover scale-150" 
          referrerPolicy="no-referrer"
        />
        {/* 3D Sphere Highlight & Depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.5),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.2)] rounded-full pointer-events-none" />
      </div>

      <MusicFloatingWindow 
        show={isMusicOpen}
        onClose={onCloseMusic}
        music={music}
        onTogglePlay={onTogglePlay}
        onVolumeChange={onVolumeChange}
      />
    </motion.div>
  );
};

const MusicFloatingWindow = ({ 
  show, 
  onClose, 
  music, 
  onTogglePlay,
  onVolumeChange 
}: { 
  show: boolean; 
  onClose: () => void;
  music: any;
  onTogglePlay: () => void;
  onVolumeChange: (v: number) => void;
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: -100, y: -100 }}
          animate={{ opacity: 1, scale: 1, x: -180, y: -220 }}
          exit={{ opacity: 0, scale: 0.8, x: -100, y: -100 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute z-[9998] w-52 bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-4 overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Now Playing</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1 hover:bg-pink-50 rounded-full transition-colors">
              <X className="w-3 h-3 text-gray-300" />
            </button>
          </div>

          {/* Track Info - Record Style */}
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className={cn(
              "relative w-24 h-24 rounded-full shadow-2xl border-[6px] border-white overflow-hidden flex items-center justify-center",
              music.isPlaying ? "animate-spin-slow" : ""
            )}>
              {/* Vinyl Grooves Effect */}
              <div className="absolute inset-0 bg-[repeating-radial-gradient(circle,transparent,transparent_2px,rgba(255,255,255,0.05)_3px)] pointer-events-none" />
              <img src={music.cover} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
              {/* Center Hole */}
              <div className="absolute w-4 h-4 bg-white rounded-full border-2 border-gray-200 shadow-inner z-10" />
            </div>
            <div className="text-center w-full">
              <h4 className="text-xs font-bold text-gray-600 truncate px-2">{music.currentTrack}</h4>
              <p className="text-[9px] text-gray-400 font-medium">{music.artist}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1 mb-4">
            <div className="h-1 w-full bg-pink-50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-pink-200"
                initial={{ width: 0 }}
                animate={{ width: `${music.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[7px] text-gray-300 font-bold">
              <span>1:24</span>
              <span>3:45</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button className="p-1 text-gray-300 hover:text-pink-200 transition-colors">
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
              className="w-10 h-10 bg-pink-200 text-white rounded-full flex items-center justify-center shadow-lg shadow-pink-100 hover:scale-105 active:scale-95 transition-all"
            >
              {music.isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            <button className="p-1 text-gray-300 hover:text-pink-200 transition-colors">
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 px-1">
            <Volume2 className="w-3 h-3 text-gray-300" />
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={music.volume}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onVolumeChange(parseInt(e.target.value))}
              className="flex-1 accent-pink-200 h-0.5 bg-pink-50 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes spin-slow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .animate-spin-slow {
              animation: spin-slow 10s linear infinite;
            }
          `}} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};


// --- Main App ---

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: '你好呀，我是你的AI伙伴。今天有什么想聊的吗？' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);

  // App State for editables
  const [appState, setAppState] = useState({
    wallpaper: "", // Empty means use default decoration
    weather: "多云 24°C",
    profileName: "芙糕",
    profileHandle: "@fugao_2603",
    profileAvatar: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAERgJFpq-WeW_-xUHBIWvNPyriVIFcZGAACpx4AAlIUYFXjvsH9dX3zKzoE.jpeg",
    profileHeaderImg: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAERgL1pq-8bYFXZ45sTyVidlw1OsWmHnQAC_B4AAlIUYFWmODBidfrEoDoE.jpeg",
    searchBarText: "阿嗚一口吃掉泥૮  ´͈ ᗜ `͈ ა♡",
    profileQuote: "雪花飘落在你鼻尖，快分不清楚",
    profileLocation: "櫻",
    widgetTitle: "Heartlink",
    widgetDollImg: "https://picsum.photos/seed/bear/200/200",
    widgetStatus: "为你匹配到心动对象",
    widgetTime: "00:14 上午",
    widgetBtn1: "同意",
    widgetBtn2: "拒絕",
    widgetFooter: "heartlink",
    moviePoster: "https://picsum.photos/seed/movie/300/400",
    photoImg: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAERgJZpq-bLvBlK1SYtc8wdPdXnUsm6EgACuR4AAlIUYFXDE6PqfxzymToE.jpeg",
    photoCaption: "Sweet Moment",
    anniversaryCharPhoto: "https://picsum.photos/seed/girl/200/200",
    anniversaryUserPhoto: "https://picsum.photos/seed/boy/200/200",
    anniversaryDays: "77天",
    anniversaryTitle: "我们已经相爱",
    anniversaryFooter: "i miss u（T ω T)o････",
    anniversaryCharLabel: "char",
    anniversaryUserLabel: "user",
    chatAiName: "福熊兒",
    chatAiAvatar: "https://picsum.photos/seed/bear/100/100",
    chatStatus: "在线",
    ticketLabel: "ADMIT ONE",
    ticketId: "#20260221",
    showRain: true,
    showFloatingBall: true,
    floatingBallImg: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAERgJFpq-WeW_-xUHBIWvNPyriVIFcZGAACpx4AAlIUYFXjvsH9dX3zKzoE.jpeg",
    music: {
      isPlaying: false,
      currentTrack: "Sweet Moment",
      artist: "芙糕",
      cover: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAERgJFpq-WeW_-xUHBIWvNPyriVIFcZGAACpx4AAlIUYFXjvsH9dX3zKzoE.jpeg",
      volume: 80,
      progress: 35
    },
    apiBaseUrl: "https://api.openai.com/v1",
    apiKey: "",
    selectedModel: "gpt-3.5-turbo",
    availableModels: [] as string[],
    modelFilter: "",
    temperature: 0.7,
    contextLength: 10,
    apiProvider: "custom", // 'openai', 'deepseek', 'groq', 'custom'
    systemPrompt: "你是一个温柔、贴心的AI伙伴，说话风格带有INS奶白风的甜美感，经常使用可爱的表情符号。",
    appLabels: {
      heartlink: "Heartlink",
      chat: "Chat",
      ourtale: "OurTale",
      moment: "Moment",
      cine2: "Cine2",
      radio: "Radio",
      settings: "Settings"
    } as Record<string, string>,
    appIcons: {
      heartlink: null,
      chat: null,
      ourtale: null,
      moment: null,
      cine2: null,
      radio: null,
      settings: null
    } as Record<string, string | null>
  });

  const updateState = (key: keyof typeof appState, value: any) => {
    setAppState(prev => ({ ...prev, [key]: value }));
  };

  const updateLabel = (key: string, value: string) => {
    setAppState(prev => ({
      ...prev,
      appLabels: { ...prev.appLabels, [key]: value }
    }));
  };

  const updateIcon = (key: string, value: string) => {
    setAppState(prev => ({
      ...prev,
      appIcons: { ...prev.appIcons, [key]: value }
    }));
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMsg = inputText;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputText('');
    setIsTyping(true);

    try {
      const history = messages.slice(-appState.contextLength).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      if (appState.apiKey) {
        // Use custom API
        const response = await fetch(`${appState.apiBaseUrl.replace(/\/$/, '')}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${appState.apiKey}`
          },
          body: JSON.stringify({
            model: appState.selectedModel,
            messages: [
              { role: 'system', content: `${appState.systemPrompt} 你的名字叫'${appState.chatAiName}'。` },
              ...history,
              { role: 'user', content: userMsg }
            ],
            temperature: appState.temperature
          })
        });

        if (!response.ok) throw new Error('API Request Failed');
        const data = await response.json();
        const aiText = data.choices?.[0]?.message?.content || '哎呀，我刚才走神了...';
        setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
      } else {
        // Use default Gemini API
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const model = genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: userMsg,
          config: {
            systemInstruction: `${appState.systemPrompt} 你的名字叫'${appState.chatAiName}'。`
          }
        });
        
        const response = await model;
        setMessages(prev => [...prev, { role: 'ai', text: response.text || '哎呀，我刚才走神了...' }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: '网络好像有点调皮呢，稍后再试试吧~' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateWidgetStatus = async () => {
    if (isTyping) return;
    setIsTyping(true);
    try {
      let text = "";
      if (appState.apiKey) {
        const response = await fetch(`${appState.apiBaseUrl.replace(/\/$/, '')}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${appState.apiKey}`
          },
          body: JSON.stringify({
            model: appState.selectedModel,
            messages: [
              { role: 'system', content: "你是一个温柔的占卜师，请为用户生成一句简短的、带有INS奶白风的甜美感的心动匹配语或今日运势。不超过15个字。经常使用可爱的表情符号。" },
              { role: 'user', content: "生成一句运势" }
            ],
            temperature: 0.9
          })
        });
        const data = await response.json();
        text = data.choices?.[0]?.message?.content || "为你匹配到心动对象";
      } else {
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const res = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "生成一句简短的、带有INS奶白风的甜美感的心动匹配语或今日运势。不超过15个字。经常使用可爱的表情符号。",
        });
        text = res.text || "为你匹配到心动对象";
      }
      updateState('widgetStatus', text.replace(/["']/g, ''));
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4 font-sans selection:bg-pink-50/30">
      {/* Phone Frame */}
      <div className="relative w-[390px] h-[844px] bg-[#FBF9FA] rounded-[3.5rem] shadow-[0_0_60px_rgba(0,0,0,0.02)] border-[8px] border-white overflow-hidden flex flex-col">
        
        {/* Background Decoration / Wallpaper */}
        {appState.wallpaper ? (
          <div className="absolute inset-0 z-0">
            <img src={appState.wallpaper} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />
          </div>
        ) : (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-pink-50/30 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[30%] bg-blue-50/10 rounded-full blur-[60px]" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isChatOpen && !isSettingsOpen ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="relative z-10 flex-1 flex flex-col px-6 pt-4 pb-8"
            >
              {/* 1. Status Bar */}
              <div className="flex flex-col gap-1 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-400">{format(currentTime, 'HH:mm')}</span>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Cloud className="w-3.5 h-3.5 text-pink-200" />
                    <EditableText 
                      value={appState.weather} 
                      onChange={(v) => updateState('weather', v)}
                      className="text-[11px] font-medium" 
                    />
                  </div>
                </div>
                <div className="text-[10px] text-gray-300 font-medium tracking-wider">
                  {format(currentTime, 'MM月dd日 EEEE')}
                </div>
              </div>

              {/* 2. Profile Card */}
              <GlassCard className="h-[215px] mb-6 bg-white/40 p-0 flex flex-col items-center relative overflow-hidden">
                {/* Header Image */}
                <div className="w-full h-32 relative group/header">
                  <EditableImage 
                    src={appState.profileHeaderImg} 
                    onChange={(v) => updateState('profileHeaderImg', v)}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient Transition */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/60 to-transparent" />
                  <div className="absolute inset-0 bg-black/0 group-hover/header:bg-black/10 transition-colors pointer-events-none" />
                </div>

                <div className="flex flex-col items-center gap-2 w-full px-4 relative z-10 -mt-10">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden shadow-md">
                      <EditableImage 
                        src={appState.profileAvatar} 
                        onChange={(v) => updateState('profileAvatar', v)}
                        alt="Avatar" 
                      />
                    </div>
                    <div className="absolute -right-16 top-1 bg-white/60 backdrop-blur-sm px-3 py-0.5 rounded-2xl rounded-bl-none border border-white/50 shadow-sm">
                      <EditableText 
                        value={appState.profileName} 
                        onChange={(v) => updateState('profileName', v)}
                        className="text-[11px] font-bold text-gray-500" 
                      />
                    </div>
                    <div className="absolute -right-16 top-7">
                      <EditableText 
                        value={appState.profileHandle} 
                        onChange={(v) => updateState('profileHandle', v)}
                        className="text-[9px] text-gray-400 font-medium ml-2" 
                      />
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="w-full bg-white/60 rounded-full h-8 px-4 flex items-center justify-between border border-white/40 mt-2 shadow-sm">
                    <EditableText 
                      value={appState.searchBarText} 
                      onChange={(v) => updateState('searchBarText', v)}
                      className="text-[10px] text-pink-300/90 font-bold flex-1" 
                    />
                    <div className="flex items-center gap-2 ml-2">
                      <AtSign className="w-3.5 h-3.5 text-pink-200" />
                      <Heart className="w-3.5 h-3.5 text-pink-200 fill-pink-200/10" />
                    </div>
                  </div>
                </div>
                <RainOverlay show={appState.showRain} />
              </GlassCard>

              {/* 3. Middle Area */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                {/* Left Widget */}
                <div className="flex flex-col gap-4">
                  <div className="aspect-square bg-[#FDFCF8] rounded-[2rem] shadow-sm overflow-hidden relative border border-white/40">
                    {/* Blurry Background Texture */}
                    <div className="absolute inset-0 opacity-30 pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#E5E7EB_0%,transparent_70%)] blur-3xl" />
                      <div className="absolute top-[20%] right-[10%] w-32 h-32 bg-pink-50/50 rounded-full blur-3xl" />
                    </div>
                    
                    {/* Translucent White Half Background */}
                    <div className="absolute inset-0 bg-white/40 h-1/2 pointer-events-none backdrop-blur-[1px]" />

                    {/* Top Labels - Adjusted positions and size */}
                    <div className="absolute top-[8%] left-[25%] -translate-x-1/2 z-10">
                      <div className="bg-white/90 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/60 shadow-sm min-w-[40px] flex justify-center">
                        <EditableText 
                          value={appState.anniversaryCharLabel} 
                          onChange={(v) => updateState('anniversaryCharLabel', v)}
                          className="text-[9px] font-bold text-gray-400/80" 
                        />
                      </div>
                    </div>
                    <div className="absolute top-[8%] right-[25%] translate-x-1/2 z-10">
                      <div className="bg-white/90 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/60 shadow-sm min-w-[40px] flex justify-center">
                        <EditableText 
                          value={appState.anniversaryUserLabel} 
                          onChange={(v) => updateState('anniversaryUserLabel', v)}
                          className="text-[9px] font-bold text-gray-400/80" 
                        />
                      </div>
                    </div>

                    {/* Center Photos - Shrunk and adjusted positions */}
                    <div className="absolute top-[40%] left-[32%] -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="w-14 h-14 rounded-full border-[3px] border-white overflow-hidden shadow-lg">
                        <EditableImage 
                          src={appState.anniversaryCharPhoto} 
                          onChange={(v) => updateState('anniversaryCharPhoto', v)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="absolute top-[40%] right-[32%] translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="w-14 h-14 rounded-full border-[3px] border-white overflow-hidden shadow-lg">
                        <EditableImage 
                          src={appState.anniversaryUserPhoto} 
                          onChange={(v) => updateState('anniversaryUserPhoto', v)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Middle Text Area - Adjusted position */}
                    <div className="absolute top-[68%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 z-10 w-full">
                      <EditableText 
                        value={appState.anniversaryTitle} 
                        onChange={(v) => updateState('anniversaryTitle', v)}
                        className="text-[9px] text-gray-400 font-medium tracking-tight" 
                      />
                      <EditableText 
                        value={appState.anniversaryDays} 
                        onChange={(v) => updateState('anniversaryDays', v)}
                        className="text-xl font-bold text-pink-300 tracking-tighter" 
                      />
                    </div>

                    {/* Bottom Text Area - Adjusted position */}
                    <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 z-10 w-full text-center px-2">
                      <EditableText 
                        value={appState.anniversaryFooter} 
                        onChange={(v) => updateState('anniversaryFooter', v)}
                        className="text-[8px] text-gray-300 font-medium tracking-wide" 
                      />
                    </div>
                  </div>

                  {/* Bottom Left Apps */}
                  <div className="flex justify-around px-2">
                    <AppIcon 
                      name="our-tale" 
                      label={appState.appLabels.ourtale} 
                      icon={Heart} 
                      iconImg={appState.appIcons.ourtale}
                      onLabelChange={(v) => updateLabel('ourtale', v)}
                    />
                    <AppIcon 
                      name="settings" 
                      label={appState.appLabels.settings} 
                      icon={Settings} 
                      iconImg={appState.appIcons.settings}
                      onClick={() => setIsSettingsOpen(true)}
                      onLabelChange={(v) => updateLabel('settings', v)}
                    />
                  </div>
                </div>

                {/* Right Area */}
                <div className="flex flex-col gap-3">
                  {/* 2x2 App Grid - More compact */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 px-1">
                    <AppIcon 
                      name="heartlink" 
                      label={appState.appLabels.heartlink} 
                      icon={Heart} 
                      iconImg={appState.appIcons.heartlink}
                      onLabelChange={(v) => updateLabel('heartlink', v)}
                    />
                    <AppIcon 
                      name="chat" 
                      label={appState.appLabels.chat} 
                      icon={MessageCircle} 
                      iconImg={appState.appIcons.chat}
                      onClick={() => setIsChatOpen(true)} 
                      onLabelChange={(v) => updateLabel('chat', v)}
                    />
                    <AppIcon 
                      name="cine2" 
                      label={appState.appLabels.cine2} 
                      icon={Cloud} 
                      iconImg={appState.appIcons.cine2}
                      onLabelChange={(v) => updateLabel('cine2', v)}
                    />
                    <AppIcon 
                      name="radio" 
                      label={appState.appLabels.radio} 
                      icon={Signal} 
                      iconImg={appState.appIcons.radio}
                      onLabelChange={(v) => updateLabel('radio', v)}
                    />
                  </div>

                  {/* Decoration - Scaled down and centered */}
                  <div className="flex-1 flex flex-col justify-center items-center px-2">
                    {/* Polaroid Frame - Smaller max-width */}
                    <div className="relative rotate-2 transform hover:rotate-0 transition-transform duration-300 max-w-[105px] w-full mx-auto group">
                      {/* Photo Area - Positioned relative to the frame image */}
                      <div className="absolute top-[7%] left-[7.5%] right-[7.5%] bottom-[24%] overflow-hidden rounded-sm bg-gray-50/50">
                        <EditableImage 
                          src={appState.photoImg} 
                          onChange={(v) => updateState('photoImg', v)}
                          alt="Photo" 
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <img 
                        src="https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAERgHtpq-DgXbP-pWbUlVV0RPU3kN6VNAACXh4AAlIUYFVK4D-GGg6egToE.png" 
                        alt="Polaroid Frame"
                        className="relative z-10 w-full h-auto pointer-events-none drop-shadow-md"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Caption Area - Positioned precisely in the bottom white space */}
                      <div className="absolute bottom-[6%] left-[10%] right-[10%] text-center z-20">
                        <EditableText 
                          value={appState.photoCaption} 
                          onChange={(v) => updateState('photoCaption', v)}
                          className="text-[7px] text-gray-400 font-serif italic tracking-wide truncate block" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Dock */}
              <div className="mt-6">
                <div className="bg-gray-200/30 backdrop-blur-xl border border-white/30 h-20 rounded-[2.5rem] flex items-center justify-around px-4 shadow-sm">
                  <AppIcon 
                    name="heartlink-dock" 
                    label={appState.appLabels.heartlink} 
                    icon={Heart} 
                    iconImg={appState.appIcons.heartlink}
                    color="bg-transparent shadow-none" 
                  />
                  <AppIcon 
                    name="chat-dock" 
                    label={appState.appLabels.chat} 
                    icon={MessageCircle} 
                    iconImg={appState.appIcons.chat}
                    color="bg-transparent shadow-none" 
                    onClick={() => setIsChatOpen(true)} 
                  />
                  <AppIcon 
                    name="moment-dock" 
                    label={appState.appLabels.moment} 
                    icon={AtSign} 
                    iconImg={appState.appIcons.moment}
                    color="bg-transparent shadow-none" 
                  />
                  <AppIcon 
                    name="radio-dock" 
                    label={appState.appLabels.radio} 
                    icon={Signal} 
                    iconImg={appState.appIcons.radio}
                    color="bg-transparent shadow-none" 
                  />
                </div>
              </div>
            </motion.div>
          ) : isChatOpen ? (
            <motion.div 
              key="chat"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-20 bg-[#FDFCF8] flex flex-col"
            >
              {/* Chat Header */}
              <div className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-pink-50 bg-white/50 backdrop-blur-md">
                <button onClick={() => setIsChatOpen(false)} className="p-2 -ml-2 text-pink-400">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center">
                  <EditableText 
                    value={appState.chatAiName} 
                    onChange={(v) => updateState('chatAiName', v)}
                    className="text-sm font-bold text-gray-500" 
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-green-200">●</span>
                    <EditableText 
                      value={appState.chatStatus} 
                      onChange={(v) => updateState('chatStatus', v)}
                      className="text-[10px] text-green-200 font-medium" 
                    />
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden border border-pink-100">
                  <EditableImage 
                    src={appState.chatAiAvatar} 
                    onChange={(v) => updateState('chatAiAvatar', v)}
                    alt="AI" 
                  />
                </div>
                <button 
                  onClick={() => setMessages([{ role: 'ai', text: '对话已清空，我们可以重新开始聊天啦~' }])}
                  className="p-2 text-pink-200 hover:text-pink-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex w-full",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}>
                    <div className={cn(
                      "max-w-[80%] px-4 py-2.5 rounded-[1.5rem] text-sm shadow-sm",
                      msg.role === 'user' 
                        ? "bg-pink-400 text-white rounded-tr-none" 
                        : "bg-white border border-pink-50 text-gray-700 rounded-tl-none"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-pink-50 px-4 py-2.5 rounded-[1.5rem] rounded-tl-none shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-pink-200 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-pink-200 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-pink-200 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 bg-white/80 backdrop-blur-md border-t border-pink-50">
                <div className="flex items-center gap-3 bg-pink-50/30 rounded-full px-4 py-2 border border-pink-50">
                  <input 
                    type="text" 
                    placeholder="说点什么吧..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-400 placeholder:text-pink-100"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isTyping}
                    className="p-2 bg-pink-200 text-white rounded-full disabled:opacity-50 transition-opacity"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="settings"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-20 bg-[#FDFCF8] flex flex-col"
            >
              {/* Settings Header */}
              <div className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-pink-50 bg-white/50 backdrop-blur-md">
                <button 
                  onClick={() => activeCategory ? setActiveCategory(null) : setIsSettingsOpen(false)} 
                  className="p-2 -ml-2 text-pink-200"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <span className="text-sm font-bold text-gray-400">
                  {activeCategory ? {
                    api: 'API设置',
                    worldbook: '世界书设置',
                    icons: '图标设置',
                    interface: '界面设置',
                    font: '字体设置',
                    floating: '悬浮球设置'
                  }[activeCategory] : '设置'}
                </span>
                <div className="w-10" />
              </div>

              {/* Settings Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {!activeCategory ? (
                  <div className="space-y-3">
                    {[
                      { id: 'api', label: 'API设置', icon: Key },
                      { id: 'worldbook', label: '世界书设置', icon: Book },
                      { id: 'icons', label: '图标设置', icon: Grid },
                      { id: 'interface', label: '界面设置', icon: Palette },
                      { id: 'font', label: '字体设置', icon: Type },
                      { id: 'floating', label: '悬浮球设置', icon: Circle },
                    ].map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className="w-full bg-white rounded-3xl p-5 border border-pink-50 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-300 group-hover:bg-pink-100 transition-colors">
                            <cat.icon className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-bold text-gray-500">{cat.label}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-pink-100" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {activeCategory === 'api' && (
                      <section>
                        <div className="space-y-4">
                          {/* Presets Card */}
                          <div className="bg-white rounded-3xl p-5 border border-pink-50 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">快速预设</h3>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { id: 'openai', label: 'OpenAI', url: 'https://api.openai.com/v1' },
                                { id: 'deepseek', label: 'DeepSeek', url: 'https://api.deepseek.com' },
                                { id: 'groq', label: 'Groq', url: 'https://api.groq.com/openai/v1' },
                                { id: 'custom', label: '自定义', url: '' },
                              ].map(p => (
                                <button 
                                  key={p.id}
                                  onClick={() => {
                                    updateState('apiProvider', p.id);
                                    if (p.url) updateState('apiBaseUrl', p.url);
                                  }}
                                  className={cn(
                                    "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border",
                                    appState.apiProvider === p.id 
                                      ? "bg-pink-200 text-white border-pink-200 shadow-sm" 
                                      : "bg-white text-gray-400 border-pink-50 hover:border-pink-100"
                                  )}
                                >
                                  {p.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Connection Card */}
                          <div className="bg-white rounded-3xl p-6 border border-pink-50 shadow-sm space-y-5">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">连接配置</h3>
                              {appState.apiKey ? (
                                <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> 已配置
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                                  <AlertCircle className="w-2.5 h-2.5" /> 未连接
                                </div>
                              )}
                            </div>

                            {/* Base URL */}
                            <div className="space-y-2">
                              <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5 ml-1">
                                <Globe className="w-3 h-3" /> API 网站
                              </label>
                              <input 
                                type="text" 
                                value={appState.apiBaseUrl}
                                onChange={(e) => updateState('apiBaseUrl', e.target.value)}
                                placeholder="https://api.openai.com/v1"
                                className="w-full px-4 py-2.5 bg-pink-50/30 border border-pink-50 rounded-xl text-xs text-gray-500 outline-none focus:border-pink-200 transition-colors"
                              />
                            </div>

                            {/* API Key */}
                            <div className="space-y-2">
                              <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5 ml-1">
                                <Key className="w-3 h-3" /> API 密钥
                              </label>
                              <input 
                                type="password" 
                                value={appState.apiKey}
                                onChange={(e) => updateState('apiKey', e.target.value)}
                                placeholder="sk-..."
                                className="w-full px-4 py-2.5 bg-pink-50/30 border border-pink-50 rounded-xl text-xs text-gray-500 outline-none focus:border-pink-200 transition-colors"
                              />
                            </div>

                            <button 
                              onClick={async () => {
                                if (!appState.apiKey) return;
                                const btn = document.getElementById('test-conn-btn');
                                if (btn) btn.innerText = '测试中...';
                                try {
                                  const res = await fetch(`${appState.apiBaseUrl.replace(/\/$/, '')}/models`, {
                                    headers: { 'Authorization': `Bearer ${appState.apiKey}` }
                                  });
                                  if (res.ok) {
                                    if (btn) btn.innerText = '连接成功 ✨';
                                    setTimeout(() => { if (btn) btn.innerText = '测试连接'; }, 2000);
                                  } else {
                                    throw new Error();
                                  }
                                } catch (e) {
                                  if (btn) btn.innerText = '连接失败 ❌';
                                  setTimeout(() => { if (btn) btn.innerText = '测试连接'; }, 2000);
                                }
                              }}
                              id="test-conn-btn"
                              className="w-full py-2.5 bg-pink-100/50 text-pink-400 text-[11px] font-bold rounded-xl border border-pink-100 hover:bg-pink-100 transition-colors"
                            >
                              测试连接
                            </button>
                          </div>

                          {/* Model Card */}
                          <div className="bg-white rounded-3xl p-6 border border-pink-50 shadow-sm space-y-5">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">模型参数</h3>
                            
                            {/* Model Selection */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center ml-1">
                                <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                                  <Grid className="w-3 h-3" /> AI 模型
                                </label>
                                <button 
                                  onClick={async () => {
                                    if (!appState.apiKey) return;
                                    try {
                                      const res = await fetch(`${appState.apiBaseUrl.replace(/\/$/, '')}/models`, {
                                        headers: { 'Authorization': `Bearer ${appState.apiKey}` }
                                      });
                                      const data = await res.json();
                                      if (data.data) {
                                        const models = data.data.map((m: any) => m.id);
                                        updateState('availableModels', models);
                                      }
                                    } catch (e) {
                                      console.error('Fetch models failed', e);
                                    }
                                  }}
                                  className="text-[10px] text-pink-300 font-bold flex items-center gap-1 hover:text-pink-400 transition-colors"
                                >
                                  <RefreshCw className="w-2.5 h-2.5" /> 拉取模型
                                </button>
                              </div>

                              {appState.availableModels.length > 0 && (
                                <div className="relative mb-2">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300" />
                                  <input 
                                    type="text"
                                    value={appState.modelFilter}
                                    onChange={(e) => updateState('modelFilter', e.target.value)}
                                    placeholder="搜索模型..."
                                    className="w-full pl-8 pr-4 py-2 bg-pink-50/20 border border-pink-50 rounded-lg text-[10px] text-gray-500 outline-none"
                                  />
                                </div>
                              )}

                              {appState.availableModels.length > 0 ? (
                                <select 
                                  value={appState.selectedModel}
                                  onChange={(e) => updateState('selectedModel', e.target.value)}
                                  className="w-full px-4 py-2.5 bg-pink-50/30 border border-pink-50 rounded-xl text-xs text-gray-500 outline-none focus:border-pink-200 transition-colors appearance-none"
                                >
                                  {appState.availableModels
                                    .filter(m => m.toLowerCase().includes(appState.modelFilter.toLowerCase()))
                                    .map(m => (
                                      <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                              ) : (
                                <input 
                                  type="text" 
                                  value={appState.selectedModel}
                                  onChange={(e) => updateState('selectedModel', e.target.value)}
                                  placeholder="gpt-3.5-turbo"
                                  className="w-full px-4 py-2.5 bg-pink-50/30 border border-pink-50 rounded-xl text-xs text-gray-500 outline-none focus:border-pink-200 transition-colors"
                                />
                              )}
                            </div>

                            {/* Temperature */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center ml-1">
                                <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                                  <Thermometer className="w-3 h-3" /> 模型温度
                                </label>
                                <span className="text-[10px] text-pink-300 font-bold">{appState.temperature}</span>
                              </div>
                              <input 
                                type="range" 
                                min="0" 
                                max="2" 
                                step="0.1"
                                value={appState.temperature}
                                onChange={(e) => updateState('temperature', parseFloat(e.target.value))}
                                className="w-full accent-pink-200 h-1.5 bg-pink-50 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>

                            {/* Context Length */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center ml-1">
                                <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                                  <History className="w-3 h-3" /> 上下文长度
                                </label>
                                <span className="text-[10px] text-pink-300 font-bold">{appState.contextLength} 条</span>
                              </div>
                              <input 
                                type="range" 
                                min="1" 
                                max="50" 
                                step="1"
                                value={appState.contextLength}
                                onChange={(e) => updateState('contextLength', parseInt(e.target.value))}
                                className="w-full accent-pink-200 h-1.5 bg-pink-50 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>

                            {/* System Prompt */}
                            <div className="space-y-2">
                              <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5 ml-1">
                                <FileText className="w-3 h-3" /> 系统提示词 (Prompt)
                              </label>
                              <textarea 
                                value={appState.systemPrompt}
                                onChange={(e) => updateState('systemPrompt', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-pink-50/30 border border-pink-50 rounded-2xl text-xs text-gray-500 outline-none focus:border-pink-200 transition-colors resize-none leading-relaxed"
                                placeholder="设定 AI 的性格和说话风格..."
                              />
                            </div>
                          </div>
                        </div>
                      </section>
                    )}

                    {activeCategory === 'worldbook' && (
                      <section>
                        <div className="bg-white rounded-3xl p-8 border border-pink-50 shadow-sm text-center">
                          <Book className="w-12 h-12 text-pink-100 mx-auto mb-4" />
                          <h3 className="text-sm font-bold text-gray-500 mb-2">世界书</h3>
                          <p className="text-xs text-gray-300 leading-relaxed">管理您的世界设定与知识库，让 AI 更加了解您的故事背景。</p>
                        </div>
                      </section>
                    )}

                    {activeCategory === 'icons' && (
                      <section>
                        <div className="bg-white rounded-3xl p-6 border border-pink-50 shadow-sm">
                          <h3 className="text-sm font-bold text-gray-600 mb-6">更换图标</h3>
                          <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                            {[
                              { id: 'heartlink', label: appState.appLabels.heartlink, icon: Heart },
                              { id: 'chat', label: appState.appLabels.chat, icon: MessageCircle },
                              { id: 'ourtale', label: appState.appLabels.ourtale, icon: Heart },
                              { id: 'moment', label: appState.appLabels.moment, icon: AtSign },
                              { id: 'cine2', label: appState.appLabels.cine2, icon: Cloud },
                              { id: 'radio', label: appState.appLabels.radio, icon: Signal },
                              { id: 'settings', label: appState.appLabels.settings, icon: Settings },
                            ].map(app => (
                              <AppIcon 
                                key={app.id}
                                name={app.id}
                                label={app.label}
                                icon={app.icon}
                                iconImg={appState.appIcons[app.id]}
                                showEdit={true}
                                onIconChange={(v) => updateIcon(app.id, v)}
                              />
                            ))}
                          </div>
                        </div>
                      </section>
                    )}

                    {activeCategory === 'interface' && (
                      <section className="space-y-6">
                        {/* Wallpaper */}
                        <div className="bg-white rounded-3xl p-5 border border-pink-50 shadow-sm">
                          <h3 className="text-sm font-bold text-gray-600 mb-3">更换背景</h3>
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-32 rounded-2xl overflow-hidden border-2 border-pink-100 shadow-inner bg-pink-50">
                              {appState.wallpaper ? (
                                <img src={appState.wallpaper} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-pink-200" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <button 
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = (e: any) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (re) => updateState('wallpaper', re.target?.result);
                                      reader.readAsDataURL(file);
                                    }
                                  };
                                  input.click();
                                }}
                                className="w-full py-2.5 bg-pink-200 text-white text-xs font-bold rounded-xl shadow-md shadow-pink-50"
                              >
                                选择本地图片
                              </button>
                              <button 
                                onClick={() => updateState('wallpaper', "")}
                                className="w-full py-2.5 bg-white text-gray-300 text-xs font-bold rounded-xl border border-gray-50"
                              >
                                恢复默认背景
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* ID Card Header */}
                        <div className="bg-white rounded-3xl p-5 border border-pink-50 shadow-sm">
                          <h3 className="text-sm font-bold text-gray-600 mb-3">ID卡片封面</h3>
                          <div className="flex items-center gap-4">
                            <div className="w-32 h-20 rounded-xl overflow-hidden border-2 border-pink-100 shadow-inner bg-pink-50">
                              <img src={appState.profileHeaderImg} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex-1">
                              <button 
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = (e: any) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (re) => updateState('profileHeaderImg', re.target?.result);
                                      reader.readAsDataURL(file);
                                    }
                                  };
                                  input.click();
                                }}
                                className="w-full py-2.5 bg-pink-200 text-white text-xs font-bold rounded-xl shadow-md shadow-pink-50"
                              >
                                更换封面图
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Rain Effect Toggle */}
                        <div className="bg-white rounded-3xl p-5 border border-pink-50 shadow-sm flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-gray-600">ID卡片雨滴特效</h3>
                            <p className="text-[10px] text-gray-300 mt-1">开启后ID卡片将显示立体水滴滑落效果</p>
                          </div>
                          <button 
                            onClick={() => updateState('showRain', !appState.showRain)}
                            className={cn(
                              "w-12 h-6 rounded-full transition-colors relative",
                              appState.showRain ? "bg-pink-300" : "bg-gray-200"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                              appState.showRain ? "right-1" : "left-1"
                            )} />
                          </button>
                        </div>
                      </section>
                    )}

                    {activeCategory === 'font' && (
                      <section>
                        <div className="bg-white rounded-3xl p-8 border border-pink-50 shadow-sm text-center">
                          <Type className="w-12 h-12 text-pink-100 mx-auto mb-4" />
                          <h3 className="text-sm font-bold text-gray-500 mb-2">字体设置</h3>
                          <p className="text-xs text-gray-300 leading-relaxed">自定义全局字体样式，让界面更加符合您的个性。</p>
                        </div>
                      </section>
                    )}

                    {activeCategory === 'floating' && (
                      <section className="space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-pink-50 shadow-sm">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="text-sm font-bold text-gray-600">显示悬浮球</h3>
                              <p className="text-[10px] text-gray-300 mt-1">在屏幕上显示一个可拖动的3D立体悬浮球</p>
                            </div>
                            <button 
                              onClick={() => updateState('showFloatingBall', !appState.showFloatingBall)}
                              className={cn(
                                "w-12 h-6 rounded-full transition-colors relative",
                                appState.showFloatingBall ? "bg-pink-300" : "bg-gray-200"
                              )}
                            >
                              <div className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                appState.showFloatingBall ? "right-1" : "left-1"
                              )} />
                            </button>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-600">悬浮球图片</h3>
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-100 shadow-lg relative group">
                                <img 
                                  src={appState.floatingBallImg} 
                                  className="w-full h-full object-cover scale-125" 
                                  referrerPolicy="no-referrer" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
                              </div>
                              <div className="flex-1">
                                <button 
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/*';
                                    input.onchange = (e: any) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (re) => updateState('floatingBallImg', re.target?.result);
                                        reader.readAsDataURL(file);
                                      }
                                    };
                                    input.click();
                                  }}
                                  className="w-full py-2.5 bg-pink-200 text-white text-xs font-bold rounded-xl shadow-md shadow-pink-50"
                                >
                                  更换悬浮球图片
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-pink-50 shadow-sm text-center">
                          <p className="text-[10px] text-gray-300 leading-relaxed">
                            提示：悬浮球可以拖动到屏幕任何位置，<br/>
                            它会一直悬浮在界面最上方。
                          </p>
                        </div>
                      </section>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <FloatingBall 
          show={appState.showFloatingBall} 
          img={appState.floatingBallImg} 
          onClick={() => setIsMusicOpen(!isMusicOpen)}
          isMusicOpen={isMusicOpen}
          music={appState.music}
          onTogglePlay={() => updateState('music', { ...appState.music, isPlaying: !appState.music.isPlaying })}
          onVolumeChange={(v) => updateState('music', { ...appState.music, volume: v })}
          onCloseMusic={() => setIsMusicOpen(false)}
        />

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-200 rounded-full z-30" />
      </div>
    </div>
  );
}
