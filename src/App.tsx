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
  Download,
  Upload,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Calendar,
  Star,
  Plus,
  Film,
  Radio as RadioIcon,
  Camera,
  Gamepad2,
  PenTool,
  Phone,
  PhoneCall,
  PhoneForwarded,
  PhoneIncoming,
  PhoneMissed,
  PhoneOff,
  PhoneOutgoing,
  Clock,
  Users,
  Hash,
  Delete,
  Sparkles,
  Timer,
  BookOpen,
  Moon,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cn } from './utils/cn';
import { GoogleGenAI } from "@google/genai";
import OurTale from './components/OurTale';

import Splash from './components/Splash';
import WeChatApp from './components/WeChatApp';
import GalaGameApp from './components/GalaGameApp';
import RadioApp from './components/RadioApp';
import PhoneApp from './components/PhoneApp';
import Cine2App from './components/Cine2App';
import HeartLinkApp from './components/HeartLinkApp';
import PhotoApp from './components/PhotoApp';
import CharApp from './components/CharApp';
import StudyRoomApp from './components/StudyRoomApp';
import LuckyApp from './components/LuckyApp';
import MemoryApp from './components/MemoryApp';
import { compressImage } from './utils/image';

const translations = {
  zh: {
    settings: "设置",
    language: "语言",
    interface: "界面",
    photoFilter: "照片滤镜",
    color: "彩色",
    bw: "黑白",
    wallpaper: "墙纸",
    resetWallpaper: "恢复默认装饰",
    beautify: "美化",
    homeStyle: "主屏幕风格",
    classicStyle: "经典格子风",
    creamyStyle: "奶白甜酷风",
    iconSize: "图标大小",
    small: "小",
    medium: "中",
    large: "大",
    showRain: "雨滴特效",
    showSnow: "下雪特效",
    showSakura: "樱花特效",
    isFullscreen: "全屏显示模式",
    minimaxApiKey: "MiniMax API 密钥",
    minimaxModel: "MiniMax 模型",
    apiConfig: "API 配置",
    model: "模型",
    provider: "服务商",
    apiKey: "API 密钥",
    save: "保存",
    cancel: "取消",
    editMode: "编辑模式",
    exitEdit: "退出编辑",
    aiPartner: "AI 伙伴",
    status: "在线",
  },
  en: {
    settings: "Settings",
    language: "Language",
    interface: "Interface",
    photoFilter: "Photo Filter",
    color: "Color",
    bw: "B&W",
    wallpaper: "Wallpaper",
    resetWallpaper: "Reset Wallpaper",
    beautify: "Beautify",
    homeStyle: "Home Style",
    classicStyle: "Classic Grid",
    creamyStyle: "Creamy Sweet",
    iconSize: "Icon Size",
    small: "Small",
    medium: "Medium",
    large: "Large",
    showRain: "Rain Effect",
    showSnow: "Snow Effect",
    showSakura: "Sakura Effect",
    isFullscreen: "Full Screen Mode",
    minimaxApiKey: "MiniMax API Key",
    minimaxModel: "MiniMax Model",
    apiConfig: "API Config",
    model: "Model",
    provider: "Provider",
    apiKey: "API Key",
    save: "Save",
    cancel: "Cancel",
    editMode: "Edit Mode",
    exitEdit: "Exit Edit",
    aiPartner: "AI Partner",
    status: "Online",
  }
};

// --- Components ---

const RainOverlay = ({ show }: { show: boolean }) => {
  const drops = useMemo(() => {
    return [...Array(40)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${0.8 + Math.random() * 1.2}s`,
      delay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.5 + 0.4,
      width: `${1.5 + Math.random() * 1.5}px`,
      height: `${20 + Math.random() * 30}px`
    }));
  }, []);

  if (!show) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
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

const SnowOverlay = ({ show }: { show: boolean }) => {
  const flakes = useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${3 + Math.random() * 5}s`,
      delay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.6 + 0.4,
      size: `${2 + Math.random() * 4}px`,
      drift: `${(Math.random() - 0.5) * 50}px`
    }));
  }, []);

  if (!show) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="snow-flake"
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            animationDuration: flake.duration,
            animationDelay: flake.delay,
            opacity: flake.opacity,
            '--drift': flake.drift
          } as any}
        />
      ))}
    </div>
  );
};

const SakuraOverlay = ({ show }: { show: boolean }) => {
  const petals = useMemo(() => {
    return [...Array(25)].map((_, i) => {
      const sizeNum = 6 + Math.random() * 6;
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${4 + Math.random() * 6}s`,
        delay: `${Math.random() * 10}s`,
        opacity: Math.random() * 0.6 + 0.4,
        width: `${sizeNum}px`,
        height: `${sizeNum * 0.8}px`,
        rotation: `${Math.random() * 360}deg`,
        drift: `${(Math.random() - 0.5) * 100}px`
      };
    });
  }, []);

  if (!show) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="sakura-petal"
          style={{
            left: petal.left,
            width: petal.width,
            height: petal.height,
            animationDuration: petal.duration,
            animationDelay: petal.delay,
            opacity: petal.opacity,
            '--drift': petal.drift,
            '--rotation': petal.rotation
          } as any}
        />
      ))}
    </div>
  );
};

const GlassCard = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      "bg-white border border-gray-100 shadow-sm overflow-hidden",
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
  multiline = false,
  style
}: { 
  value: string; 
  onChange: (val: string) => void; 
  className?: string;
  as?: any;
  multiline?: boolean;
  style?: React.CSSProperties;
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
        style={style}
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
        style={style}
      />
    );
  }

  return (
    <Component 
      onClick={(e: any) => { e.stopPropagation(); setIsEditing(true); }}
      className={cn("cursor-edit hover:bg-black/5 rounded transition-colors px-1", className)}
      style={style}
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 400, 400, 0.6);
        onChange(compressed);
      } catch (err) {
        console.error('Image compression failed', err);
      }
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
        className="w-full h-full object-cover scale-[1.01]"
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
  isEditMode?: boolean;
  onLongPress?: () => void;
  labelColor?: string;
  language?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'retro' | 'creamy';
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
  showEdit = false,
  isEditMode = false,
  onLongPress,
  labelColor,
  language = "zh",
  size = 'medium',
  variant = 'retro'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<any>(null);

  const sizeClasses = {
    small: "w-9 h-9",
    medium: "w-12 h-12",
    large: "w-14 h-14"
  };

  const iconSizeClasses = {
    small: "w-5 h-5",
    medium: "w-7 h-7",
    large: "w-8 h-8"
  };

  const handleMouseDown = () => {
    timerRef.current = setTimeout(() => {
      onLongPress?.();
    }, 800);
  };

  const handleMouseUp = () => {
    clearTimeout(timerRef.current);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onIconChange) {
      try {
        const compressed = await compressImage(file, 200, 200, 0.6);
        onIconChange(compressed);
      } catch (err) {
        console.error('Image compression failed', err);
      }
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col items-center gap-2 cursor-pointer group relative",
        isEditMode && "animate-shake"
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      <div className="relative">
        <div 
          onClick={isEditMode ? undefined : onClick}
          className={cn(
            "flex items-center justify-center shadow-sm transition-transform active:scale-90 group-hover:scale-105 overflow-hidden",
            variant === 'creamy' 
              ? "bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-[0_4px_12px_rgba(0,0,0,0.05)]" 
              : "bg-white border border-gray-100 rounded-2xl",
            sizeClasses[size],
            color
          )}
        >
          {iconImg ? (
            <img src={iconImg} className="w-full h-full object-cover scale-[1.01] grayscale-[0.2] group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
          ) : (
            <Icon className={cn("text-gray-900", iconSizeClasses[size])} />
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
            value={label || name} 
            onChange={onLabelChange} 
            className="text-[10px] font-cute font-medium uppercase tracking-[0.12em]" 
            style={{ color: labelColor || "#374151" }}
          />
        ) : (
          <span className="text-[10px] font-cute font-medium uppercase tracking-[0.12em]" style={{ color: labelColor || "#374151" }}>{label || name}</span>
        )}

        {(showEdit || isEditMode) && onIconChange && (
          <button 
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            className="mt-1 px-2 py-1 bg-white text-gray-900 text-[8px] font-cute font-bold border border-gray-100 shadow-sm hover:bg-gray-900 hover:text-white active:scale-95 transition-all whitespace-nowrap uppercase tracking-[0.15em] rounded-full"
          >
            {translations[language as 'zh' | 'en']?.editMode || 'EDIT'}
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
  onCloseMusic,
  aiId,
  showMusicPopup,
  recordThoughts,
  onSaveThought
}: { 
  show: boolean; 
  img: string; 
  onClick: () => void;
  isMusicOpen: boolean;
  music: any;
  onTogglePlay: () => void;
  onVolumeChange: (v: number) => void;
  onCloseMusic: () => void;
  aiId?: string;
  showMusicPopup: boolean;
  recordThoughts: boolean;
  onSaveThought: (content: string, aiId: string, aiName: string) => void;
}) => {
  if (!show) return null;
  
  const [isDragging, setIsDragging] = useState(false);
  const [innerThoughts, setInnerThoughts] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const clearTimerRef = useRef<NodeJS.Timeout | null>(null);

  const generateInnerThoughts = async () => {
    if (!aiId || isGenerating) return;
    
    // Clear existing thought and timer
    setInnerThoughts(null);
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    
    setIsGenerating(true);
    try {
      const saved = localStorage.getItem('gala_game_state');
      let persona = "一个可爱的AI伙伴";
      let nickname = "AI";
      if (saved) {
        const state = JSON.parse(saved);
        // Check characters first
        const char = state.charCharacters?.find((c: any) => c.id === state.selectedCharId) || state.charCharacters?.[0];
        if (char) {
          persona = char.persona;
          nickname = char.name;
        } else {
          persona = state.systemPrompt;
          nickname = state.chatAiName;
        }
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `你现在是${nickname}，你的性格设定是：${persona}。
请以第一人称写一段简短的“内心想法”（inner thoughts），表达你现在对用户的关心、思念或者一些俏皮的小心思。
字数控制在30字以内，语气要符合你的设定。直接输出想法内容，不要有任何前缀或引号。`,
      });
      
      const thoughtContent = response.text;
      setInnerThoughts(thoughtContent);
      
      if (recordThoughts) {
        onSaveThought(thoughtContent, aiId, nickname);
      }
      
      // Disappear after 1 minute (60000ms)
      clearTimerRef.current = setTimeout(() => setInnerThoughts(null), 60000);
    } catch (err) {
      console.error('Failed to generate inner thoughts', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePointerDown = () => {
    if (isDragging) return;
    longPressTimer.current = setTimeout(() => {
      if (showMusicPopup && !isMusicOpen) {
        onClick(); // Trigger music open
      }
    }, 800); // 800ms for long press
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => {
        setIsDragging(true);
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
      }}
      onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
      onClick={() => {
        if (isDragging) return;
        if (isMusicOpen) {
          onCloseMusic();
        } else {
          if (innerThoughts || isGenerating) {
            setInnerThoughts(null);
          } else {
            generateInnerThoughts();
          }
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      initial={{ x: 20, y: 300 }}
      animate={{ 
        y: [300, 310, 300],
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed z-[9999] w-14 h-14 cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    >
      <div className="relative w-full h-full rounded-full overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-white/40 group">
        {/* Fisheye Image - No 3D effects as requested */}
        <img 
          src={img} 
          className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 transition-all" 
          referrerPolicy="no-referrer"
        />
        {/* Subtle overlay for visibility */}
        <div className="absolute inset-0 bg-black/5 pointer-events-none" />
      </div>

      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: -100 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-gray-100 px-4 py-2 rounded-full shadow-xl pointer-events-none"
          >
            <div className="flex gap-1">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1 h-1 bg-gray-900 rounded-full" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-gray-900 rounded-full" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-gray-900 rounded-full" />
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/90 rotate-45 border-r border-b border-gray-100" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {innerThoughts && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: -120 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute left-1/2 -translate-x-1/2 w-48 bg-white/90 backdrop-blur-md border border-gray-100 p-3 rounded-2xl shadow-xl pointer-events-none"
          >
            <div className="text-[11px] text-gray-900 leading-relaxed font-medium">
              {innerThoughts}
            </div>
            {/* Arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/90 rotate-45 border-r border-b border-gray-100" />
          </motion.div>
        )}
      </AnimatePresence>

      <MusicFloatingWindow 
        show={isMusicOpen && showMusicPopup}
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
          onClick={() => onClose()}
          className="absolute z-[9998] w-52 bg-white/90 backdrop-blur-2xl border border-gray-100 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-5 overflow-hidden cursor-pointer"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-gray-900 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Now Playing</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1 hover:bg-gray-50 rounded-full transition-colors">
              <X className="w-3 h-3 text-gray-400" />
            </button>
          </div>

          {/* Track Info - Record Style */}
          <div className="flex flex-col items-center gap-4 mb-5">
            <div className={cn(
              "relative w-28 h-28 rounded-full shadow-2xl border-[6px] border-white overflow-hidden flex items-center justify-center",
              music.isPlaying ? "animate-spin-slow" : ""
            )}>
              {/* Vinyl Grooves Effect */}
              <div className="absolute inset-0 bg-[repeating-radial-gradient(circle,transparent,transparent_2px,rgba(0,0,0,0.02)_3px)] pointer-events-none" />
              <img src={music.cover} className="w-full h-full object-cover opacity-90" referrerPolicy="no-referrer" />
              {/* Center Hole */}
              <div className="absolute w-4 h-4 bg-white rounded-full border-2 border-gray-100 shadow-inner z-10" />
            </div>
            <div className="text-center w-full">
              <h4 className="text-xs font-bold text-gray-900 truncate px-2">{music.currentTrack}</h4>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{music.artist}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-5">
            <div className="h-1 w-full bg-gray-50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gray-900"
                initial={{ width: 0 }}
                animate={{ width: `${music.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-gray-400 font-bold uppercase tracking-widest">
              <span>1:24</span>
              <span>3:45</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-5 mb-5">
            <button className="p-1 text-gray-300 hover:text-gray-900 transition-colors">
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
              className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-xl shadow-gray-200 hover:scale-105 active:scale-95 transition-all"
            >
              {music.isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </button>
            <button className="p-1 text-gray-300 hover:text-gray-900 transition-colors">
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 px-1">
            <Volume2 className="w-3 h-3 text-gray-400" />
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={isNaN(music.volume) ? 0 : music.volume}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                onVolumeChange(isNaN(val) ? 0 : val);
              }}
              className="flex-1 accent-gray-900 h-0.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
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
  const [showSplash, setShowSplash] = useState(true);
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
  const [isOurTaleOpen, setIsOurTaleOpen] = useState(false);
  const [isGalaGameOpen, setIsGalaGameOpen] = useState(false);
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const [isCine2Open, setIsCine2Open] = useState(false);
  const [isHeartLinkOpen, setIsHeartLinkOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isCharOpen, setIsCharOpen] = useState(false);
  const [isStudyRoomOpen, setIsStudyRoomOpen] = useState(false);
  const [isLuckyOpen, setIsLuckyOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isOurTaleBound, setIsOurTaleBound] = useState(false);
  const [activeOurTaleTab, setActiveOurTaleTab] = useState<'anniversary' | 'message' | 'check' | 'report' | null>(null);

  // App State for editables
  const [appState, setAppState] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('gala_game_state') : null;
    const initialState = {
      wallpaper: "", // Empty means use default decoration
      weather: "Cloudy 24°C",
      profileName: "Fugao",
      profileHandle: "@fugao_2603",
      profileAvatar: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAERgJFpq-WeW_-xUHBIWvNPyriVIFcZGAACpx4AAlIUYFXjvsH9dX3zKzoE.jpeg",
      profileHeaderImg: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAERgL1pq-8bYFXZ45sTyVidlw1OsWmHnQAC_B4AAlIUYFWmODBidfrEoDoE.jpeg",
      searchBarText: "A bite of you ૮  ´͈ ᗜ `͈ ა♡",
      profileQuote: "Snowflakes falling on your nose",
      profileLocation: "Sakura",
      widgetTitle: "Heartlink",
      widgetDollImg: "https://picsum.photos/seed/bear/200/200",
      widgetStatus: "Matched with your crush",
      widgetTime: "00:14 AM",
      widgetBtn1: "Accept",
      widgetBtn2: "Decline",
      widgetFooter: "heartlink",
      moviePoster: "https://picsum.photos/seed/movie/300/400",
      photoImg: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAERgJZpq-bLvBlK1SYtc8wdPdXnUsm6EgACuR4AAlIUYFXDE6PqfxzymToE.jpeg",
      photoCaption: "Sweet Moment",
      anniversaryCharPhoto: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAERkRVpruK1LMxtGyyl5aID78ukxfYQiwAChRwAAnZPeFXFwLHbPLeAFjoE.png",
      anniversaryUserPhoto: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAERkRlpruO1xtAIwmST3FjrdqyRsxbmmAACihwAAnZPeFXzOYhW1rulGToE.png",
      anniversaryDays: "77 days",
      anniversaryTitle: "We have been in love",
      anniversaryCharLabel: "char",
      anniversaryUserLabel: "user",
      ourTaleCover: "https://picsum.photos/seed/cover/600/400",
      ourTaleLeftAvatar: "https://picsum.photos/seed/girl/200/200",
      ourTaleRightAvatar: "https://picsum.photos/seed/boy/200/200",
      anniversaries: [
        { id: '1', title: 'In Love', date: '2023-12-20', isPinned: true },
        { id: '2', title: 'First Trip', date: '2024-05-01', isPinned: false }
      ],
      chatAiName: "Beary",
      chatAiAvatar: "https://picsum.photos/seed/bear/100/100",
      chatStatus: "Online",
      chatAiOpeningMessages: [] as string[],
      chatHistories: {} as Record<string, { role: 'user' | 'ai', text: string }[]>,
      charCharacters: [],
      charCustomCSS: `/* 首页角色卡样式 */
.char-card {
  border-radius: 0px !important;
  background: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(20px) !important;
}

/* 大图页面样式 */
.detail-view {
  background: #F5F5F5 !important;
}

/* 导出图片样式 */
.export-image {
  padding: 20px;
  background: white;
}`,
      personaMasks: [],
      selectedCharId: null as string | null,
      selectedMaskId: null as string | null,
      ticketLabel: "ADMIT ONE",
      ticketId: "#20260221",
      showRain: true,
      showSnow: false,
      showSakura: false,
      showFloatingBall: true,
      floatingBallImg: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAERgJFpq-WeW_-xUHBIWvNPyriVIFcZGAACpx4AAlIUYFXjvsH9dX3zKzoE.jpeg",
      floatingBallAiId: "",
      showMusicPopup: true,
      recordThoughts: false,
      thoughtsHistory: [] as { id: string; aiId: string; aiName: string; content: string; timestamp: number }[],
      music: {
        isPlaying: false,
        currentTrack: "Sweet Moment",
        artist: "芙糕",
        cover: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAERgJFpq-WeW_-xUHBIWvNPyriVIFcZGAACpx4AAlIUYFXjvsH9dX3zKzoE.jpeg",
        volume: 80,
        progress: 35
      },
      apiBaseUrl: "",
      apiKey: "",
      selectedModel: "",
      availableModels: [] as string[],
      modelFilter: "",
      temperature: 0.7,
      contextLength: 10,
      apiProvider: "custom", // 'openai', 'deepseek', 'groq', 'custom'
      systemPrompt: "You are a gentle and caring AI partner. Your speaking style is sweet and creamy, often using cute emojis.",
      language: "zh",
      photoFilter: "color",
      homeScreenStyle: "creamy", // 'classic', 'creamy'
      iconSize: "small", // 'small', 'medium', 'large'
      homeScreenFontColor: "#374151",
      minimaxApiKey: "",
      minimaxModel: "abab6.5s-chat",
      callHistory: [] as Array<{ id: string; type: 'incoming' | 'outgoing' | 'missed'; name: string; number: string; time: string; duration?: string }>,
      aiPhoneNumber: "520-1314",
      userPhoneNumber: "188-8888-8888",
      isFullscreen: false,
      isLoggedIn: false,
      autoLogin: true,
      registeredUser: null as { nickname: string; password: string; avatar: string | null } | null,
      currentUser: null as { nickname: string; password: string; avatar: string | null } | null,
      galaBanners: [
        { id: 1, cover: 'https://picsum.photos/seed/banner1/1280/720' },
        { id: 2, cover: 'https://picsum.photos/seed/banner2/1280/720' },
        { id: 3, cover: 'https://picsum.photos/seed/banner3/1280/720' },
      ],
      galaHotGames: [
        { id: 1, title: '月下孤影', author: '作者A', tags: ['武侠', '古风'], rating: 4.8, cover: 'https://picsum.photos/seed/hot1/1280/720' },
        { id: 2, title: '赛博霓虹', author: '作者B', tags: ['科幻', '赛博'], rating: 4.5, cover: 'https://picsum.photos/seed/hot2/1280/720' },
        { id: 3, title: '深宫计', author: '作者C', tags: ['宫斗', '古风'], rating: 4.9, cover: 'https://picsum.photos/seed/hot3/1280/720' },
        { id: 4, title: '末日余生', author: '作者D', tags: ['生存', '末世'], rating: 4.2, cover: 'https://picsum.photos/seed/hot4/1280/720' },
        { id: 5, title: '星际迷航', author: '作者E', tags: ['星际', '科幻'], rating: 4.7, cover: 'https://picsum.photos/seed/hot5/1280/720' },
      ],
      galaMyGames: [
        { id: 101, title: '我的初恋', author: '我', tags: ['校园', '纯爱'], cover: 'https://picsum.photos/seed/my1/1280/720' },
        { id: 102, title: '重生之我是大佬', author: '我', tags: ['重生', '爽文'], cover: 'https://picsum.photos/seed/my2/1280/720' },
      ],
      galaCharacters: [
        { id: 1, name: '沈星移', popularity: 12500, photo: 'https://picsum.photos/seed/char1/300/400' },
        { id: 2, name: '陆昭', popularity: 9800, photo: 'https://picsum.photos/seed/char2/300/400' },
        { id: 3, name: '顾廷烨', popularity: 8600, photo: 'https://picsum.photos/seed/char3/300/400' },
        { id: 4, name: '齐衡', popularity: 7200, photo: 'https://picsum.photos/seed/char4/300/400' },
      ],
      galaPosts: [
        { id: 1, title: '《月下孤影》全结局攻略分享！', author: '攻略组-小明', likes: 1250, comments: 88, time: '2小时前', tags: ['攻略', '月下孤影'] },
        { id: 2, title: '大家觉得新出的那个病娇角色怎么样？', author: '路人甲', likes: 450, comments: 230, time: '5小时前', tags: ['讨论', '角色安利'] },
        { id: 3, title: '求推荐一些重口味的恐怖Gal！', author: '恐怖爱好者', likes: 89, comments: 45, time: '昨天', tags: ['求助', '恐怖'] },
        { id: 4, title: '【安利】这个星际背景的世界观绝了', author: '世界观架构师', likes: 2100, comments: 156, time: '3天前', tags: ['安利', '星际'] },
      ],
      galaCoins: 1250,
      galaSakura: 450,
      galaSignature: '在文字的世界里寻找永恒的瞬间。',
      galaWorldviews: [] as any[],
      galaRecords: [
        { id: 1, title: '月下孤影', lastPlayed: '2小时前', progress: '45%', cover: 'https://picsum.photos/seed/hot1/1280/720' },
        { id: 3, title: '深宫计', lastPlayed: '昨天', progress: '80%', cover: 'https://picsum.photos/seed/hot3/1280/720' },
        { id: 101, title: '我的初恋', lastPlayed: '3天前', progress: '10%', cover: 'https://picsum.photos/seed/my1/1280/720' },
      ],
      appLabels: {
        heartlink: "HEARTLINK",
        chat: "CHAT",
        ourtale: "OURTALE",
        moment: "MOMENT",
        galagame: "GALAGAME",
        phone: "PHONE",
        messages: "MESSAGES",
        settings: "SETTINGS",
        cine2: "CINEMA",
        radio: "RADIO",
        photo: "PHOTOS",
        char: "CHARACTERS",
        study: "STUDY",
        lucky: "LUCKY",
        memory: "MEMORY"
      } as Record<string, string>,
      appIcons: {
        heartlink: null,
        chat: null,
        ourtale: null,
        moment: null,
        galagame: null,
        phone: null,
        messages: null,
        settings: null,
        cine2: null,
        radio: null,
        photo: null,
        char: null,
        study: null,
        lucky: null,
        memory: null
      } as Record<string, string | null>
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Deep merge labels and icons to ensure new apps have names even if old state is loaded
        const mergedLabels = { ...initialState.appLabels };
        if (parsed.appLabels) {
          Object.keys(parsed.appLabels).forEach(key => {
            if (parsed.appLabels[key]) mergedLabels[key] = parsed.appLabels[key];
          });
        }

        const mergedIcons = { ...initialState.appIcons };
        if (parsed.appIcons) {
          Object.keys(parsed.appIcons).forEach(key => {
            if (parsed.appIcons[key]) mergedIcons[key] = parsed.appIcons[key];
          });
        }

        return { 
          ...initialState, 
          ...parsed,
          appLabels: mergedLabels,
          appIcons: mergedIcons
        };
      } catch (e) {
        return initialState;
      }
    }
    return initialState;
  });

  useEffect(() => {
    if (isChatOpen) {
      const selectedChar = appState.charCharacters?.find((c: any) => c.id === appState.selectedCharId) || appState.charCharacters?.[0];
      if (selectedChar && selectedChar.openingMessages && selectedChar.openingMessages.length > 0) {
        // Only send if messages are empty (new chat)
        if (messages.length === 1 && messages[0].role === 'ai' && messages[0].text.includes('你好呀')) {
          const sendMessages = async () => {
            // Clear default message
            setMessages([]);
            for (const msg of selectedChar.openingMessages) {
              if (msg.trim()) {
                setMessages(prev => [...prev, { role: 'ai', text: msg }]);
                // Small delay between messages
                await new Promise(resolve => setTimeout(resolve, 800));
              }
            }
          };
          sendMessages();
        }
      }
    }
  }, [isChatOpen, appState.selectedCharId, messages.length]);

  // Standalone mode detection
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };
    checkStandalone();
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkStandalone);

    // Request persistent storage
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then(persistent => {
        if (persistent) {
          console.log("Storage will not be cleared except by explicit user action");
        } else {
          console.log("Storage may be cleared under storage pressure");
        }
      });
    }

    return () => mediaQuery.removeEventListener('change', checkStandalone);
  }, []);

  const effectiveFullscreen = appState.isFullscreen || isStandalone;

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem('gala_game_state', JSON.stringify(appState));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
         alert('存储空间不足！由于您上传的图片过多或过大，超出了浏览器的存储限制。请尝试移除一些自定义字体、头像框或清空聊天记录。');
      }
    }
  }, [appState]);

  // Migration: Ensure app labels and home screen text are English for existing users
  useEffect(() => {
    const chineseToEnglish: Record<string, string> = {
      "心动链接": "HeartLink",
      "聊天": "Chat",
      "我们的故事": "OurTale",
      "瞬间": "Moment",
      "Gala游戏": "GalaGame",
      "电话": "Phone",
      "消息": "Messages",
      "设置": "Settings",
      "影院": "Cinema",
      "电台": "Radio",
      "相册": "Photos",
      "角色档案": "Characters",
      "自习室": "Study",
      "幸运签": "Lucky",
      "记忆碎片": "Memory"
    };

    let needsUpdate = false;
    const newLabels = { ...appState.appLabels };

    Object.entries(newLabels as Record<string, string>).forEach(([key, value]) => {
      if (chineseToEnglish[value]) {
        newLabels[key] = chineseToEnglish[value];
        needsUpdate = true;
      }
    });

    const updates: Partial<typeof appState> = {};
    if (needsUpdate) updates.appLabels = newLabels;

    if (appState.weather === "多云 24°C") updates.weather = "Cloudy 24°C";
    if (appState.profileName === "芙糕") updates.profileName = "Fugao";
    if (appState.searchBarText === "阿嗚一口吃掉泥૮  ´͈ ᗜ `͈ ა♡") updates.searchBarText = "A bite of you ૮  ´͈ ᗜ `͈ ა♡";
    if (appState.profileQuote === "雪花飘落在你鼻尖，快分不清楚") updates.profileQuote = "Snowflakes falling on your nose";
    if (appState.profileLocation === "櫻") updates.profileLocation = "Sakura";
    if (appState.widgetStatus === "为你匹配到心动对象") updates.widgetStatus = "Matched with your crush";
    if (appState.widgetBtn1 === "同意") updates.widgetBtn1 = "Accept";
    if (appState.widgetBtn2 === "拒絕") updates.widgetBtn2 = "Decline";
    if (appState.anniversaryTitle === "我们已经相爱") updates.anniversaryTitle = "We have been in love";

    const newAnniversaries = appState.anniversaries.map(a => {
      if (a.title === "相恋") return { ...a, title: "In Love" };
      if (a.title === "第一次旅行") return { ...a, title: "First Trip" };
      return a;
    });
    
    if (JSON.stringify(newAnniversaries) !== JSON.stringify(appState.anniversaries)) {
      updates.anniversaries = newAnniversaries;
    }

    if (Object.keys(updates).length > 0) {
      setAppState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  const handleBackupData = () => {
    const data = JSON.stringify(appState, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sakura_machine_backup_${format(new Date(), 'yyyyMMdd_HHmm')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data && typeof data === 'object') {
            setAppState(data);
            alert('数据恢复成功！');
            window.location.reload();
          }
        } catch (err) {
          alert('数据恢复失败，请检查文件格式。');
        }
      };
      reader.readAsText(file);
    }
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [gridIcons, setGridIcons] = useState(['heartlink', 'chat', 'galagame', 'phone']);
  const [secondPageIcons, setSecondPageIcons] = useState(['study', 'lucky', 'memory']);
  const [dockIcons, setDockIcons] = useState(['cine2', 'radio', 'photo', 'char']);
  const [bottomLeftIcons, setBottomLeftIcons] = useState(['ourtale', 'settings']);
  const [currentGridPage, setCurrentGridPage] = useState(0);

  const t = translations[appState.language as 'zh' | 'en'] || translations.zh;

  // Remove browser fullscreen API logic as requested to not affect browser settings
  // and handle layout-only fullscreen.

  const updateState = (key: keyof typeof appState, value: any) => {
    setAppState(prev => {
      const newValue = typeof value === 'function' ? value(prev[key]) : value;
      return { ...prev, [key]: newValue };
    });
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

  const handleRegister = (user: any) => {
    setAppState(prev => ({
      ...prev,
      registeredUser: user,
      currentUser: user,
      isLoggedIn: true
    }));
  };

  const handleLogin = (user: any) => {
    setAppState(prev => ({
      ...prev,
      currentUser: user,
      isLoggedIn: true
    }));
  };

  useEffect(() => {
    if (appState.autoLogin && appState.registeredUser) {
      setAppState(prev => ({ ...prev, isLoggedIn: true, currentUser: prev.registeredUser }));
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const handleOurTaleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.anniversaries) {
        setAppState(prev => ({
          ...prev,
          anniversaries: customEvent.detail.anniversaries
        }));
      }
    };
    window.addEventListener('ourtale_update', handleOurTaleUpdate);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('ourtale_update', handleOurTaleUpdate);
    };
  }, []);

  const pinnedAnniversary = appState.anniversaries.find(a => a.isPinned) || appState.anniversaries[0];
  const calculateDays = (dateString: string) => {
    if (!dateString) return "0 days";
    const start = new Date(dateString);
    const now = currentTime;
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
  };
  const displayDays = calculateDays(pinnedAnniversary?.date);

  const getAppIcon = (key: string) => {
    switch (key) {
      case 'heartlink': return Heart;
      case 'chat': return MessageCircle;
      case 'ourtale': return Heart;
      case 'moment': return Layout;
      case 'galagame': return Grid;
      case 'phone': return Phone;
      case 'messages': return AtSign;
      case 'settings': return Settings;
      case 'cine2': return Film;
      case 'radio': return RadioIcon;
      case 'photo': return Camera;
      case 'char': return Sparkles;
      case 'study': return BookOpen;
      case 'lucky': return Moon;
      case 'memory': return Book;
      default: return Grid;
    }
  };

  const handleIconClick = (key: string) => {
    if (isEditMode) return;
    switch (key) {
      case 'chat': setIsChatOpen(true); break;
      case 'ourtale': setIsOurTaleOpen(true); break;
      case 'settings': setIsSettingsOpen(true); break;
      case 'galagame': setIsGalaGameOpen(true); break;
      case 'radio': setIsRadioOpen(true); break;
      case 'phone': setIsPhoneOpen(true); break;
      case 'cine2': setIsCine2Open(true); break;
      case 'heartlink': setIsHeartLinkOpen(true); break;
      case 'photo': setIsPhotoOpen(true); break;
      case 'char': setIsCharOpen(true); break;
      case 'study': setIsStudyRoomOpen(true); break;
      case 'lucky': setIsLuckyOpen(true); break;
      case 'memory': setIsMemoryOpen(true); break;
      default: break;
    }
  };

  const swapIcons = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, index1: number, index2: number) => {
    if (index2 < 0 || index2 >= list.length) return;
    const newList = [...list];
    [newList[index1], newList[index2]] = [newList[index2], newList[index1]];
    setList(newList);
  };

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const fetchModels = async () => {
    if (!appState.apiBaseUrl || !appState.apiKey) {
      setTestStatus('error');
      setTestMessage('请先输入 API 地址和密钥');
      return;
    }
    
    setIsFetchingModels(true);
    setTestStatus('testing');
    setTestMessage('正在拉取模型列表...');
    
    try {
      const baseUrl = appState.apiBaseUrl.replace(/\/$/, '');
      const endpoints = [`${baseUrl}/models`, `${baseUrl}/v1/models`, `${baseUrl}/v1beta/models`];
      
      let success = false;
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${appState.apiKey}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            const models = data.data?.map((m: any) => m.id) || [];
            if (models.length > 0) {
              setAvailableModels(models);
              if (!models.includes(appState.selectedModel)) {
                updateState('selectedModel', models[0]);
              }
              setTestStatus('success');
              setTestMessage(`成功加载 ${models.length} 个模型`);
              success = true;
              break;
            }
          }
        } catch (e) {
          // Continue to next endpoint
        }
      }
      
      if (!success) {
        setTestStatus('error');
        setTestMessage('无法获取模型列表，请检查地址或密钥');
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`请求失败: ${err.message}`);
    } finally {
      setIsFetchingModels(false);
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  const handleTestConnection = async () => {
    if (!appState.apiBaseUrl || !appState.apiKey) {
      setTestStatus('error');
      setTestMessage('请先输入 API 地址和密钥');
      return;
    }
    if (!appState.selectedModel) {
      setTestStatus('error');
      setTestMessage('请先拉取并选择模型');
      return;
    }
    setTestStatus('testing');
    setTestMessage('正在测试连接...');
    try {
      const response = await fetch(`${appState.apiBaseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${appState.apiKey}`
        },
        body: JSON.stringify({
          model: appState.selectedModel,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5
        })
      });
      if (response.ok) {
        setTestStatus('success');
        setTestMessage('连接成功！');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setTestStatus('error');
        setTestMessage(`连接失败: ${errorData.error?.message || response.statusText}`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`连接错误: ${err.message}`);
    }
    setTimeout(() => setTestStatus('idle'), 3000);
  };

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

      // Get character detailed persona
      const selectedChar = appState.charCharacters?.find((c: any) => c.id === appState.selectedCharId) || appState.charCharacters?.[0];
      
      let persona = appState.systemPrompt;
      let aiName = appState.chatAiName;

      if (selectedChar) {
        aiName = selectedChar.name;
        persona = `
你现在扮演角色：${selectedChar.name}
性别：${selectedChar.gender}
年龄：${selectedChar.age}
生日：${selectedChar.birthday}
身份：${selectedChar.identity}
外貌特征：${selectedChar.appearance}
性格特点：${selectedChar.personality}
成长经历：${selectedChar.background}
人际关系：${selectedChar.relationships}
用语习惯：${selectedChar.speechStyle}
与user相关：${selectedChar.userRelated}
NSFW设定(18+)：${selectedChar.nsfw}
其他补充：${selectedChar.others}
当前场景剧情：${selectedChar.scenario}
开场白：${selectedChar.openingRemark}

请严格遵守以上设定进行回复。保持自然真实的活人感。
`;
      }

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
              { role: 'system', content: `${persona} 你的名字叫'${aiName}'。` },
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
            systemInstruction: `${persona} 你的名字叫'${aiName}'。`
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
    <>
      <div className="fixed inset-0 bg-[#f8f8f8] flex items-center justify-center font-sans selection:bg-pink-50/30 overflow-hidden">
        {/* Phone Frame Wrapper */}
        <div className={cn(
          "relative transition-all duration-500 ease-in-out overflow-hidden flex flex-col",
          effectiveFullscreen 
            ? "w-full h-full rounded-none border-0" 
            : "w-[390px] h-[844px] rounded-[3rem] border-[8px] border-gray-900 shadow-2xl"
        )}>
          {/* Main Content */}
          <div className={cn(
            "relative w-full h-full bg-white overflow-hidden flex flex-col",
            appState.photoFilter === 'bw' && "photo-filter-bw"
          )}>
        
        {/* Background Decoration / Wallpaper */}
        {appState.wallpaper ? (
          <div className="absolute inset-0 z-0">
            <img src={appState.wallpaper} className="w-full h-full object-cover scale-[1.01]" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />
          </div>
        ) : (
          <div className="absolute inset-0 pointer-events-none bg-white">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-gray-50 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[30%] bg-gray-50 rounded-full blur-[60px]" />
          </div>
        )}

        <RainOverlay show={appState.showRain} />
        <SnowOverlay show={appState.showSnow} />
        <SakuraOverlay show={appState.showSakura} />

        <AnimatePresence>
          {isPhoneOpen && (
            <PhoneApp 
              onClose={() => setIsPhoneOpen(false)} 
              appState={appState}
              updateState={updateState}
              isFullscreen={effectiveFullscreen}
            />
          )}
        </AnimatePresence>

        <div className="flex-1 relative">
          {!isChatOpen && !isSettingsOpen && !isGalaGameOpen && !isRadioOpen && !isCine2Open && !isHeartLinkOpen && !isPhotoOpen && !isCharOpen && !isStudyRoomOpen && !isLuckyOpen && !isMemoryOpen ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="relative z-10 flex-1 flex flex-col px-6 pt-safe pb-safe"
            >
              {isEditMode && (
                <div className="absolute top-2 left-0 right-0 flex justify-center z-50">
                  <button 
                    onClick={() => setIsEditMode(false)}
                    className="bg-white/90 backdrop-blur-md px-6 py-2 border border-gray-900 shadow-lg text-gray-900 font-bold text-sm hover:bg-white transition-all active:scale-95"
                  >
                    {t.exitEdit}
                  </button>
                </div>
              )}
              {/* 1. Status Bar */}
              <div className="flex flex-col gap-1 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold" style={{ color: appState.homeScreenFontColor }}>{format(currentTime, 'HH:mm')}</span>
                  <div className="flex items-center gap-1.5" style={{ color: appState.homeScreenFontColor }}>
                    <Cloud className="w-3.5 h-3.5" />
                    <EditableText 
                      value={appState.weather} 
                      onChange={(v) => updateState('weather', v)}
                      className="text-[11px] font-medium" 
                    />
                  </div>
                </div>
                <div className="text-[10px] font-medium tracking-wider" style={{ color: appState.homeScreenFontColor }}>
                  {format(currentTime, 'MMMM do, EEEE')}
                </div>
              </div>

              {appState.homeScreenStyle === 'creamy' ? (
                <>
                  {/* 2. Profile Card */}
                  <GlassCard className="h-[215px] mb-6 p-0 flex flex-col items-center relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-[2.5rem] border-white/50 shadow-[0_8px_32px_rgba(255,182,193,0.1)]">
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
                        <div className={cn(
                          "absolute -right-16 top-1 backdrop-blur-sm px-3 py-0.5 rounded-2xl rounded-bl-none border shadow-sm bg-white/80 border-white/50"
                        )}>
                          <EditableText 
                            value={appState.profileName} 
                            onChange={(v) => updateState('profileName', v)}
                            className="text-[11px] font-bold" 
                            style={{ color: appState.homeScreenFontColor }}
                          />
                        </div>
                        <div className="absolute -right-16 top-7">
                          <EditableText 
                            value={appState.profileHandle} 
                            onChange={(v) => updateState('profileHandle', v)}
                            className="text-[9px] font-medium ml-2 opacity-70" 
                            style={{ color: appState.homeScreenFontColor }}
                          />
                        </div>
                      </div>

                      {/* Search Bar */}
                      <div className="w-full h-8 px-4 flex items-center justify-between mt-2 shadow-sm bg-white/80 rounded-full border-white/50">
                        <EditableText 
                          value={appState.searchBarText} 
                          onChange={(v) => updateState('searchBarText', v)}
                          className="text-[10px] font-bold flex-1" 
                          style={{ color: appState.homeScreenFontColor }}
                        />
                        <div className="flex items-center gap-2 ml-2" style={{ color: appState.homeScreenFontColor }}>
                          <AtSign className="w-3.5 h-3.5 opacity-70" />
                          <Heart className="w-3.5 h-3.5 fill-current opacity-70" />
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  {/* 3. Middle Area */}
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    {/* Left Widget */}
                    <div className="flex flex-col gap-4">
                      <div 
                        className="aspect-square backdrop-blur-md shadow-sm overflow-hidden relative cursor-pointer hover:scale-[1.02] transition-transform active:scale-95 bg-white/60 rounded-[2.5rem] border border-white/50 shadow-[0_8px_24px_rgba(255,182,193,0.1)]"
                        onClick={() => setIsOurTaleOpen(true)}
                      >
                        {/* Translucent White Half Background */}
                        <div className="absolute inset-0 bg-white/20 h-1/2 pointer-events-none backdrop-blur-[1px]" />

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

                        {/* ECG Heart Line */}
                        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-[75%] h-10 flex items-center justify-center pointer-events-none">
                          <svg viewBox="0 0 100 40" className="w-full h-full drop-shadow-sm" fill="none" stroke={appState.homeScreenFontColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                            <path d="M 0 20 H 15 L 19 10 L 25 30 L 29 20 H 71 L 75 10 L 81 30 L 85 20 H 100" />
                          </svg>
                        </div>

                        {/* Center Photos - Shrunk and adjusted positions */}
                        <div className="absolute top-[40%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-10">
                          <div className="w-12 h-12 rounded-full border-[3px] border-white overflow-hidden shadow-lg">
                            <EditableImage 
                              src={appState.anniversaryCharPhoto} 
                              onChange={(v) => updateState('anniversaryCharPhoto', v)}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="absolute top-[40%] right-[20%] translate-x-1/2 -translate-y-1/2 z-10">
                          <div className="w-12 h-12 rounded-full border-[3px] border-white overflow-hidden shadow-lg">
                            <EditableImage 
                              src={appState.anniversaryUserPhoto} 
                              onChange={(v) => updateState('anniversaryUserPhoto', v)}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Middle Text Area - Adjusted position */}
                        <div className="absolute top-[65%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 z-10 w-full">
                          <span className="text-[9px] font-medium tracking-tight" style={{ color: appState.homeScreenFontColor }}>
                            {pinnedAnniversary?.title || appState.anniversaryTitle}
                          </span>
                          <span className="text-base font-bold tracking-tighter" style={{ color: appState.homeScreenFontColor }}>
                            {displayDays}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Left Apps */}
                      <Reorder.Group 
                        axis="x" 
                        values={bottomLeftIcons} 
                        onReorder={setBottomLeftIcons}
                        className="flex justify-around px-2"
                      >
                        {bottomLeftIcons.map((key) => (
                          <Reorder.Item 
                            key={key} 
                            value={key}
                            dragListener={isEditMode}
                          >
                            <AppIcon 
                              name={key} 
                              label={appState.appLabels[key]} 
                              icon={getAppIcon(key)} 
                              iconImg={appState.appIcons[key]}
                              onClick={() => handleIconClick(key)}
                              onLabelChange={(v) => updateLabel(key, v)}
                              onIconChange={(v) => updateIcon(key, v)}
                              isEditMode={isEditMode}
                              onLongPress={() => setIsEditMode(true)}
                              labelColor={appState.homeScreenFontColor}
                              language={appState.language}
                              size={appState.iconSize as any}
                              variant={appState.homeScreenStyle === 'creamy' ? 'creamy' : 'retro'}
                            />
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    </div>

                    {/* Right Area */}
                    <div className="flex flex-col gap-3">
                      {/* 2x2 App Grid - Dynamic with Pagination */}
                      <div className="relative overflow-hidden">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentGridPage}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={(e, { offset, velocity }) => {
                              const swipe = offset.x;
                              if (swipe < -30 && currentGridPage === 0) {
                                setCurrentGridPage(1);
                              } else if (swipe > 30 && currentGridPage === 1) {
                                setCurrentGridPage(0);
                              }
                            }}
                            initial={{ x: currentGridPage === 0 ? -10 : 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: currentGridPage === 0 ? 10 : -10, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="grid grid-cols-2 gap-y-3 gap-x-2 px-1"
                          >
                            {(currentGridPage === 0 ? gridIcons : secondPageIcons).map((key) => (
                              <AppIcon 
                                key={key}
                                name={key} 
                                label={appState.appLabels[key]} 
                                icon={getAppIcon(key)} 
                                iconImg={appState.appIcons[key]}
                                onLabelChange={(v) => updateLabel(key, v)}
                                onIconChange={(v) => updateIcon(key, v)}
                                onClick={() => handleIconClick(key)}
                                isEditMode={isEditMode}
                                onLongPress={() => setIsEditMode(true)}
                                labelColor={appState.homeScreenFontColor}
                                language={appState.language}
                                size={appState.iconSize as any}
                                variant={appState.homeScreenStyle === 'creamy' ? 'creamy' : 'retro'}
                              />
                            ))}
                          </motion.div>
                        </AnimatePresence>
                        
                        {/* Page Indicators for Creamy Style */}
                        <div className="flex justify-center gap-1.5 mt-2">
                          {[0, 1].map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentGridPage(page)}
                              className={cn(
                                "w-1 h-1 rounded-full transition-all duration-300",
                                currentGridPage === page 
                                  ? "bg-gray-900 w-2.5" 
                                  : "bg-gray-300"
                              )}
                            />
                          ))}
                        </div>
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
                              className="text-[7px] font-serif italic tracking-wide truncate block" 
                              style={{ color: appState.homeScreenFontColor }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col gap-8">
                  {/* Classic Style: Large Clock Widget */}
                  <div className="bg-white/40 backdrop-blur-md border border-white/40 p-8 rounded-[2.5rem] text-center shadow-sm">
                    <div className="text-5xl font-light tracking-tighter mb-2" style={{ color: appState.homeScreenFontColor }}>
                      {format(currentTime, 'HH:mm')}
                    </div>
                    <div className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: appState.homeScreenFontColor }}>
                      {format(currentTime, 'MMMM do, yyyy')}
                    </div>
                  </div>

                  {/* Classic Style: Full Grid with Pagination */}
                  <div className="flex-1 relative overflow-hidden">
                    <div className="absolute inset-0 flex flex-col">
                      <div className="flex-1 overflow-hidden relative">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentGridPage}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={(e, { offset, velocity }) => {
                              const swipe = offset.x;
                              if (swipe < -50 && currentGridPage === 0) {
                                setCurrentGridPage(1);
                              } else if (swipe > 50 && currentGridPage === 1) {
                                setCurrentGridPage(0);
                              }
                            }}
                            initial={{ x: currentGridPage === 0 ? -20 : 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: currentGridPage === 0 ? 20 : -20, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="grid grid-cols-4 gap-y-10 gap-x-2"
                          >
                            {(currentGridPage === 0 ? [...gridIcons, ...bottomLeftIcons] : secondPageIcons).map((key) => (
                              <AppIcon 
                                key={key}
                                name={key} 
                                label={appState.appLabels[key]} 
                                icon={getAppIcon(key)} 
                                iconImg={appState.appIcons[key]}
                                onClick={() => handleIconClick(key)}
                                onLabelChange={(v) => updateLabel(key, v)}
                                onIconChange={(v) => updateIcon(key, v)}
                                isEditMode={isEditMode}
                                onLongPress={() => setIsEditMode(true)}
                                labelColor={appState.homeScreenFontColor}
                                language={appState.language}
                                size={appState.iconSize as any}
                                variant={appState.homeScreenStyle === 'creamy' ? 'creamy' : 'retro'}
                              />
                            ))}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* Page Indicators */}
                      <div className="flex justify-center gap-2 py-4">
                        {[0, 1].map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentGridPage(page)}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full transition-all duration-300",
                              currentGridPage === page 
                                ? "bg-gray-900 w-4" 
                                : "bg-gray-300"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Dock */}
              <div className="mt-4">
                <Reorder.Group 
                  axis="x" 
                  values={dockIcons} 
                  onReorder={setDockIcons}
                  className="bg-gray-50/50 backdrop-blur-xl border border-gray-100 h-24 rounded-[2.5rem] flex items-center justify-around px-4 shadow-sm"
                >
                  {dockIcons.map((key) => (
                    <Reorder.Item 
                      key={key} 
                      value={key}
                      dragListener={isEditMode}
                    >
                      <AppIcon 
                        name={key} 
                        label={appState.appLabels[key]} 
                        icon={getAppIcon(key)} 
                        iconImg={appState.appIcons[key]}
                        color="bg-transparent shadow-none" 
                        onLabelChange={(v) => updateLabel(key, v)}
                        onIconChange={(v) => updateIcon(key, v)}
                        onClick={() => handleIconClick(key)}
                        isEditMode={isEditMode}
                        onLongPress={() => setIsEditMode(true)}
                        labelColor={appState.homeScreenFontColor}
                        language={appState.language}
                        size={appState.iconSize as any}
                        variant={appState.homeScreenStyle === 'creamy' ? 'creamy' : 'retro'}
                      />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            </motion.div>
          ) : isChatOpen ? (
            <motion.div key="wechat" className="absolute inset-0 z-[9999] bg-white">
              <WeChatApp 
                onClose={() => setIsChatOpen(false)} 
                isFullscreen={effectiveFullscreen}
                isLoggedIn={appState.isLoggedIn}
                registeredUser={appState.registeredUser}
                onRegister={handleRegister}
                onLogin={handleLogin}
                appState={appState}
                updateState={updateState}
              />
            </motion.div>
          ) : isGalaGameOpen ? (
            <motion.div key="galagame" className="absolute inset-0 z-30">
              <GalaGameApp 
                onClose={() => setIsGalaGameOpen(false)} 
                language={appState.language} 
                isFullscreen={effectiveFullscreen}
                appState={appState}
                updateState={updateState}
              />
            </motion.div>
          ) : isRadioOpen ? (
            <motion.div key="radio" className="absolute inset-0 z-30">
              <RadioApp 
                onClose={() => setIsRadioOpen(false)} 
                language={appState.language} 
                isFullscreen={effectiveFullscreen}
              />
            </motion.div>
          ) : isCine2Open ? (
            <motion.div key="cine2" className="absolute inset-0 z-30">
              <Cine2App 
                onClose={() => setIsCine2Open(false)} 
                aiName={appState.chatAiName}
                aiAvatar={appState.chatAiAvatar}
                isFullscreen={effectiveFullscreen}
              />
            </motion.div>
          ) : isHeartLinkOpen ? (
            <motion.div key="heartlink" className="absolute inset-0 z-30">
              <HeartLinkApp 
                onClose={() => setIsHeartLinkOpen(false)} 
                language={appState.language as 'zh' | 'en'} 
                isFullscreen={effectiveFullscreen}
              />
            </motion.div>
          ) : isPhotoOpen ? (
            <motion.div key="photo" className="absolute inset-0 z-30">
              <PhotoApp 
                onClose={() => setIsPhotoOpen(false)} 
                language={appState.language} 
                isFullscreen={effectiveFullscreen}
              />
            </motion.div>
          ) : isCharOpen ? (
            <motion.div key="char" className="absolute inset-0 z-30">
              <CharApp 
                onClose={() => setIsCharOpen(false)} 
                appState={appState}
                updateState={updateState}
                setIsChatOpen={setIsChatOpen}
                isFullscreen={effectiveFullscreen}
              />
            </motion.div>
          ) : isStudyRoomOpen ? (
            <motion.div key="study" className="absolute inset-0 z-30">
              <StudyRoomApp 
                onClose={() => setIsStudyRoomOpen(false)} 
                isFullscreen={effectiveFullscreen}
              />
            </motion.div>
          ) : isLuckyOpen ? (
            <motion.div key="lucky" className="absolute inset-0 z-30">
              <LuckyApp 
                onClose={() => setIsLuckyOpen(false)} 
                isFullscreen={effectiveFullscreen}
              />
            </motion.div>
          ) : isMemoryOpen ? (
            <motion.div key="memory" className="absolute inset-0 z-30">
              <MemoryApp 
                onClose={() => setIsMemoryOpen(false)} 
                isFullscreen={effectiveFullscreen}
              />
            </motion.div>
          ) : isSettingsOpen ? (
            <motion.div 
              key="settings"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-20 bg-white flex flex-col"
            >
              <div className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-gray-100 bg-white/50 backdrop-blur-md">
                <button 
                  onClick={() => activeCategory ? setActiveCategory(null) : setIsSettingsOpen(false)} 
                  className="p-2 -ml-2 text-gray-900"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <span className="text-sm font-bold text-gray-900 font-serif">
                  {activeCategory ? {
                    api: t.apiConfig,
                    worldbook: '世界书',
                    icons: '图标',
                    interface: t.interface,
                    font: '字体',
                    floating: '悬浮球',
                    account: '账户',
                    language: t.language,
                    beautify: t.beautify,
                    data: '数据管理'
                  }[activeCategory] : t.settings}
                </span>
                <div className="w-10" />
              </div>

              {/* Settings Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {!activeCategory ? (
                  <div className="space-y-3">
                    {[
                      { id: 'api', label: t.apiConfig, icon: Key },
                      { id: 'language', label: t.language, icon: Globe },
                      { id: 'interface', label: t.interface, icon: Palette },
                      { id: 'beautify', label: t.beautify, icon: Palette },
                      { id: 'icons', label: '图标', icon: Grid },
                      { id: 'font', label: '字体', icon: Type },
                      { id: 'floating', label: '悬浮球', icon: Circle },
                      { id: 'account', label: '账户', icon: Users },
                      { id: 'worldbook', label: '世界书', icon: Book },
                      { id: 'data', label: '数据管理', icon: History },
                    ].map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className="w-full bg-white border border-gray-100 p-5 flex items-center justify-between group active:scale-[0.98] transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 transition-colors border border-gray-50">
                            <cat.icon className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-bold text-gray-900">{cat.label}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-200" />
                      </button>
                    ))}
                  </div>
                ) : activeCategory === 'language' ? (
                  <div className="space-y-3">
                    {[
                      { id: 'zh', label: '简体中文' },
                      { id: 'en', label: 'English' },
                    ].map(lang => (
                      <button 
                        key={lang.id}
                        onClick={() => updateState('language', lang.id)}
                        className={cn(
                          "w-full p-5 flex items-center justify-between border transition-all",
                          appState.language === lang.id 
                            ? "bg-gray-900 border-gray-900 text-white" 
                            : "bg-white border-gray-100 text-gray-900"
                        )}
                      >
                        <span className="text-sm font-bold">{lang.label}</span>
                        {appState.language === lang.id && <CheckCircle2 className="w-5 h-5 text-white" />}
                      </button>
                    ))}
                  </div>
                ) : activeCategory === 'interface' ? (
                  <div className="space-y-10">
                    <section>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">{t.photoFilter}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'color', label: t.color },
                          { id: 'bw', label: t.bw },
                        ].map(filter => (
                          <button 
                            key={filter.id}
                            onClick={() => updateState('photoFilter', filter.id)}
                            className={cn(
                              "p-4 border text-center transition-all",
                              appState.photoFilter === filter.id 
                                ? "bg-gray-900 border-gray-900 text-white" 
                                : "bg-white border-gray-100 text-gray-900"
                            )}
                          >
                            <span className="text-xs font-bold">{filter.label}</span>
                          </button>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">{t.wallpaper}</h3>
                      <div className="bg-white border border-gray-100 p-4">
                        <EditableImage 
                          src={appState.wallpaper || "https://picsum.photos/seed/wallpaper/400/800"} 
                          onChange={(v) => updateState('wallpaper', v)}
                          className="w-full aspect-[9/16]"
                        />
                        <button 
                          onClick={() => updateState('wallpaper', "")}
                          className="w-full mt-4 py-3 border border-gray-900 text-gray-900 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all"
                        >
                          {t.resetWallpaper}
                        </button>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">系统设置</h3>
                      <div className="space-y-3">
                        <button 
                          onClick={() => updateState('isFullscreen', !appState.isFullscreen)}
                          className={cn(
                            "w-full p-4 border flex items-center justify-between transition-all",
                            appState.isFullscreen 
                              ? "bg-gray-900 border-gray-900 text-white" 
                              : "bg-white border-gray-100 text-gray-900"
                          )}
                        >
                          <span className="text-xs font-bold">{t.isFullscreen}</span>
                          <div className={cn(
                            "w-8 h-4 rounded-full relative transition-colors",
                            appState.isFullscreen ? "bg-white/20" : "bg-gray-200"
                          )}>
                            <div className={cn(
                              "absolute top-1 w-2 h-2 rounded-full transition-all",
                              appState.isFullscreen ? "right-1 bg-white" : "left-1 bg-gray-400"
                            )} />
                          </div>
                        </button>
                      </div>
                    </section>
                  </div>
                ) : activeCategory === 'beautify' ? (
                  <div className="space-y-10">
                    <section>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">{t.homeStyle}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'classic', label: t.classicStyle },
                          { id: 'creamy', label: t.creamyStyle },
                        ].map(style => (
                          <button 
                            key={style.id}
                            onClick={() => updateState('homeScreenStyle', style.id)}
                            className={cn(
                              "p-4 border text-center transition-all",
                              appState.homeScreenStyle === style.id 
                                ? "bg-gray-900 border-gray-900 text-white" 
                                : "bg-white border-gray-100 text-gray-900"
                            )}
                          >
                            <span className="text-xs font-bold">{style.label}</span>
                          </button>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">{t.iconSize}</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'small', label: t.small },
                          { id: 'medium', label: t.medium },
                          { id: 'large', label: t.large },
                        ].map(size => (
                          <button 
                            key={size.id}
                            onClick={() => updateState('iconSize', size.id)}
                            className={cn(
                              "p-4 border text-center transition-all",
                              appState.iconSize === size.id 
                                ? "bg-gray-900 border-gray-900 text-white" 
                                : "bg-white border-gray-100 text-gray-900"
                            )}
                          >
                            <span className="text-xs font-bold">{size.label}</span>
                          </button>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">环境特效</h3>
                      <div className="space-y-3">
                        {[
                          { id: 'showRain', label: t.showRain, active: appState.showRain },
                          { id: 'showSnow', label: t.showSnow, active: appState.showSnow },
                          { id: 'showSakura', label: t.showSakura, active: appState.showSakura },
                        ].map(effect => (
                          <button 
                            key={effect.id}
                            onClick={() => updateState(effect.id as any, !effect.active)}
                            className={cn(
                              "w-full p-4 border flex items-center justify-between transition-all",
                              effect.active 
                                ? "bg-gray-900 border-gray-900 text-white" 
                                : "bg-white border-gray-100 text-gray-900"
                            )}
                          >
                            <span className="text-xs font-bold">{effect.label}</span>
                            <div className={cn(
                              "w-8 h-4 rounded-full relative transition-colors",
                              effect.active ? "bg-white/20" : "bg-gray-200"
                            )}>
                              <div className={cn(
                                "absolute top-1 w-2 h-2 rounded-full transition-all",
                                effect.active ? "right-1 bg-white" : "left-1 bg-gray-400"
                              )} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                ) : activeCategory === 'api' ? (
                  <div className="space-y-8 pb-10">
                    <section>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">大模型 API 设置</h3>
                      <div className="space-y-4">
                        <div className="bg-white border border-gray-100 p-5">
                          <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">API 接口地址</label>
                          <input 
                            type="text" 
                            value={appState.apiBaseUrl}
                            onChange={e => updateState('apiBaseUrl', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 p-3 text-xs outline-none focus:border-gray-900/30 transition-colors font-mono"
                            placeholder="https://api.example.com/v1"
                          />
                        </div>

                        <div className="bg-white border border-gray-100 p-5">
                          <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">API Key</label>
                          <div className="relative">
                            <input 
                              type={showApiKey ? "text" : "password"} 
                              value={appState.apiKey}
                              onChange={e => updateState('apiKey', e.target.value)}
                              className="w-full bg-gray-50 border border-gray-100 p-3 pr-10 text-xs outline-none focus:border-gray-900/30 transition-colors font-mono"
                              placeholder="sk-..."
                            />
                            <button 
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="bg-white border border-gray-100 p-5 relative">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">模型选择</label>
                            <button 
                              onClick={fetchModels}
                              disabled={isFetchingModels}
                              className="text-[10px] text-blue-500 hover:text-blue-600 font-bold flex items-center gap-1 disabled:opacity-50"
                            >
                              <RefreshCw className={cn("w-3 h-3", isFetchingModels && "animate-spin")} />
                              重新拉取模型
                            </button>
                          </div>
                          <select 
                            value={appState.selectedModel}
                            onChange={e => updateState('selectedModel', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 p-3 text-xs outline-none focus:border-gray-900/30 transition-colors appearance-none"
                          >
                            {availableModels.length > 0 ? (
                              availableModels.map(model => (
                                <option key={model} value={model}>{model}</option>
                              ))
                            ) : (
                              <option value="" disabled>点击“重新拉取模型”加载</option>
                            )}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={handleTestConnection}
                            disabled={testStatus === 'testing'}
                            className={cn(
                              "py-4 border text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                              testStatus === 'testing' ? "bg-gray-50 border-gray-100 text-gray-400" :
                              testStatus === 'success' ? "bg-green-50 border-green-200 text-green-600" :
                              testStatus === 'error' ? "bg-red-50 border-red-200 text-red-600" :
                              "bg-white border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                            )}
                          >
                            {testStatus === 'testing' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                            {testStatus === 'testing' ? '测试中...' : '测试连接'}
                          </button>
                          <button 
                            onClick={() => {
                              setTestStatus('success');
                              setTestMessage('设置已保存');
                              setTimeout(() => setTestStatus('idle'), 2000);
                            }}
                            className="py-4 bg-gray-900 border border-gray-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            保存设置
                          </button>
                        </div>

                        {testMessage && (
                          <div className={cn(
                            "p-3 text-[10px] font-medium flex items-center gap-2",
                            testStatus === 'success' ? "text-green-600 bg-green-50/50" : 
                            testStatus === 'error' ? "text-red-600 bg-red-50/50" : "text-gray-500 bg-gray-50"
                          )}>
                            {testStatus === 'success' ? <CheckCircle2 className="w-3 h-3" /> : 
                             testStatus === 'error' ? <AlertCircle className="w-3 h-3" /> : <RefreshCw className="w-3 h-3 animate-spin" />}
                            {testMessage}
                          </div>
                        )}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">语音合成配置 (MiniMax)</h3>
                      <div className="space-y-4">
                        <div className="bg-white border border-gray-100 p-5">
                          <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">{t.minimaxApiKey}</label>
                          <input 
                            type="password" 
                            value={appState.minimaxApiKey}
                            onChange={e => updateState('minimaxApiKey', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 p-3 text-xs outline-none focus:border-gray-900/30 transition-colors font-mono"
                            placeholder="Enter MiniMax API Key"
                          />
                        </div>
                        <div className="bg-white border border-gray-100 p-5">
                          <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">{t.minimaxModel}</label>
                          <input 
                            type="text" 
                            value={appState.minimaxModel}
                            onChange={e => updateState('minimaxModel', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 p-3 text-xs outline-none focus:border-gray-900/30 transition-colors font-mono"
                            placeholder="abab6.5s-chat"
                          />
                        </div>
                      </div>
                    </section>
                  </div>
                  ) : activeCategory === 'account' ? (
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-100 p-6 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-100 overflow-hidden mb-4">
                          {appState.currentUser?.avatar ? (
                            <img src={appState.currentUser.avatar} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Users className="w-10 h-10" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{appState.currentUser?.nickname}</h3>
                        <p className="text-xs text-gray-400 mt-1">ID: {appState.currentUser?.nickname}</p>
                      </div>

                      <div className="space-y-3">
                        <button 
                          onClick={() => updateState('autoLogin', !appState.autoLogin)}
                          className={cn(
                            "w-full p-5 flex items-center justify-between border transition-all bg-white border-gray-100 text-gray-900"
                          )}
                        >
                          <span className="text-sm font-bold">自动登录</span>
                          <div className={cn(
                            "w-8 h-4 rounded-full relative transition-colors",
                            appState.autoLogin ? "bg-gray-900" : "bg-gray-200"
                          )}>
                            <div className={cn(
                              "absolute top-1 w-2 h-2 rounded-full transition-all",
                              appState.autoLogin ? "right-1 bg-white" : "left-1 bg-gray-400"
                            )} />
                          </div>
                        </button>

                        <button 
                          onClick={() => {
                            updateState('isLoggedIn', false);
                            setIsSettingsOpen(false);
                            setActiveCategory(null);
                          }}
                          className="w-full p-5 flex items-center justify-center border border-red-100 bg-red-50/30 text-red-600 transition-all active:scale-[0.98]"
                        >
                          <span className="text-sm font-bold">退出登录</span>
                        </button>
                      </div>
                    </div>
                  ) : activeCategory === 'worldbook' ? (
                    <section>
                      <div className="bg-white rounded-3xl p-8 border border-pink-50 shadow-sm text-center">
                        <Book className="w-12 h-12 text-pink-100 mx-auto mb-4" />
                        <h3 className="text-sm font-bold text-gray-500 mb-2">世界书</h3>
                        <p className="text-xs text-gray-300 leading-relaxed">管理您的世界设定与知识库，让 AI 更加了解您的故事背景。</p>
                      </div>
                    </section>
                  ) : activeCategory === 'data' ? (
                    <section className="space-y-8">
                      <div className="bg-white border border-gray-100 p-8 text-center">
                        <History className="w-12 h-12 text-gray-400/20 mx-auto mb-4" />
                        <h3 className="text-sm font-bold text-gray-900 mb-2">数据管理</h3>
                        <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest">备份与恢复您的本地数据</p>
                      </div>

                      <div className="bg-white border border-gray-100 p-6 space-y-6">
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">本地持久化</h4>
                          <p className="text-[10px] text-gray-400 leading-relaxed">
                            您的数据（角色卡、聊天记录、设置等）仅存储在当前浏览器的本地缓存中。
                            <br /><br />
                            <strong>注意：</strong> 如果您更换了访问链接（域名），或者清理了浏览器缓存，数据将会丢失。建议定期导出备份。
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <button 
                            onClick={handleBackupData}
                            className="w-full py-4 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" /> 导出备份文件 (.json)
                          </button>
                          
                          <label className="w-full py-4 border border-gray-900 text-gray-900 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2 cursor-pointer">
                            <Upload className="w-4 h-4" /> 导入备份文件
                            <input type="file" className="hidden" accept=".json" onChange={handleRestoreData} />
                          </label>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                          <p className="text-[10px] text-blue-600 leading-relaxed">
                            <strong>同步提示：</strong> 添加到主屏幕的应用会自动同步更新代码，但数据仍保留在本地。只要域名不变，数据就不会丢失。
                          </p>
                        </div>
                      </div>
                    </section>
                  ) : activeCategory === 'icons' ? (
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
                                language={appState.language}
                                size={appState.iconSize as any}
                              />
                            ))}
                          </div>
                        </div>
                      </section>
                    ) : activeCategory === 'font' ? (
                    <section className="space-y-8">
                      <div className="bg-white border border-gray-100 p-8 text-center">
                        <Type className="w-12 h-12 text-gray-400/20 mx-auto mb-4" />
                        <h3 className="text-sm font-bold text-gray-900 mb-2">字体设置</h3>
                        <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest">自定义全局字体样式</p>
                      </div>

                      <div className="bg-white border border-gray-100 p-6 space-y-6">
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-widest">主屏幕字体颜色</h4>
                          <div className="grid grid-cols-5 gap-3">
                            {[
                              "#374151", // Default
                              "#111827", // Dark
                              "#FFFFFF", // White
                              "#F27D26", // Retro Orange
                              "#5A5A40", // Olive
                              "#8E9299", // Gray
                              "#FF6321", // Bold Orange
                              "#4A4A4A", // Charcoal
                              "#D1D1D1", // Light Gray
                              "#141414", // Ink
                            ].map(color => (
                              <button
                                key={color}
                                onClick={() => updateState('homeScreenFontColor', color)}
                                className={cn(
                                  "w-full aspect-square border border-gray-100 rounded-full transition-transform active:scale-90",
                                  appState.homeScreenFontColor === color && "ring-2 ring-gray-900 ring-offset-2"
                                )}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <div className="mt-6">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">自定义颜色代码</label>
                            <input 
                              type="text" 
                              value={appState.homeScreenFontColor}
                              onChange={(e) => updateState('homeScreenFontColor', e.target.value)}
                              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 text-xs font-mono outline-none focus:border-gray-900/30"
                            />
                          </div>
                        </div>
                      </div>
                    </section>
                  ) : activeCategory === 'floating' ? (
                    <section className="space-y-6">
                      <div className="bg-white border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-sm font-bold text-gray-900">显示悬浮球</h3>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">在屏幕上显示悬浮球</p>
                          </div>
                          <button 
                            onClick={() => updateState('showFloatingBall', !appState.showFloatingBall)}
                            className={cn(
                              "w-12 h-6 transition-colors relative border border-gray-900",
                              appState.showFloatingBall ? "bg-gray-900" : "bg-white"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 transition-all",
                              appState.showFloatingBall ? "right-1 bg-white" : "left-1 bg-gray-900"
                            )} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between py-6 border-t border-gray-100">
                          <div>
                            <h3 className="text-sm font-bold text-gray-900">点击显示音乐</h3>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">点击悬浮球时弹出音乐窗</p>
                          </div>
                          <button 
                            onClick={() => updateState('showMusicPopup', !appState.showMusicPopup)}
                            className={cn(
                              "w-12 h-6 transition-colors relative border border-gray-900",
                              appState.showMusicPopup ? "bg-gray-900" : "bg-white"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 transition-all",
                              appState.showMusicPopup ? "right-1 bg-white" : "left-1 bg-gray-900"
                            )} />
                          </button>
                        </div>

                        <div className="space-y-4 py-6 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-bold text-gray-900">悬浮球图片</h3>
                              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">自定义悬浮球的外观</p>
                            </div>
                            <label className="cursor-pointer">
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const base64 = await compressImage(file);
                                    updateState('floatingBallImg', base64);
                                  }
                                }}
                              />
                              <div className="w-10 h-10 bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            </label>
                          </div>
                          <div className="relative w-full aspect-square bg-gray-50 border border-gray-50 overflow-hidden flex items-center justify-center">
                            <img src={appState.floatingBallImg} className="w-20 h-20 rounded-full object-cover shadow-lg" referrerPolicy="no-referrer" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between py-6 border-t border-gray-100">
                          <div>
                            <h3 className="text-sm font-bold text-gray-900">记录内心想法</h3>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">保存生成过的想法记录</p>
                          </div>
                          <button 
                            onClick={() => updateState('recordThoughts', !appState.recordThoughts)}
                            className={cn(
                              "w-12 h-6 transition-colors relative border border-gray-900",
                              appState.recordThoughts ? "bg-gray-900" : "bg-white"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 transition-all",
                              appState.recordThoughts ? "right-1 bg-white" : "left-1 bg-gray-900"
                            )} />
                          </button>
                        </div>

                        {appState.recordThoughts && (
                          <div className="space-y-4 py-6 border-t border-gray-100">
                            <div>
                              <h3 className="text-sm font-bold text-gray-900">想法记录</h3>
                              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">按 AI 联系人分类的历史记录</p>
                            </div>
                            
                            <div className="space-y-6">
                              {(() => {
                                const historyByAi: Record<string, typeof appState.thoughtsHistory> = {};
                                appState.thoughtsHistory.forEach(item => {
                                  if (!historyByAi[item.aiId]) historyByAi[item.aiId] = [];
                                  historyByAi[item.aiId].push(item);
                                });
                                
                                if (Object.keys(historyByAi).length === 0) {
                                  return <div className="text-center py-8 text-[10px] text-gray-400 uppercase tracking-widest">暂无记录</div>;
                                }
                                
                                return Object.entries(historyByAi).map(([aiId, thoughts]) => (
                                  <div key={aiId} className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <div className="h-[1px] flex-1 bg-gray-100" />
                                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{thoughts[0].aiName}</span>
                                      <div className="h-[1px] flex-1 bg-gray-100" />
                                    </div>
                                    <div className="space-y-2">
                                      {thoughts.map(thought => (
                                        <div key={thought.id} className="bg-white border border-gray-50 p-3 group relative">
                                          <div className="text-[11px] text-gray-900 leading-relaxed pr-8">{thought.content}</div>
                                          <div className="text-[9px] text-gray-400 mt-2">{new Date(thought.timestamp).toLocaleString()}</div>
                                          <button 
                                            onClick={() => {
                                              const newHistory = appState.thoughtsHistory.filter(h => h.id !== thought.id);
                                              updateState('thoughtsHistory', newHistory);
                                            }}
                                            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        )}

                        <div className="space-y-4 pt-6 border-t border-gray-100">
                          <div>
                            <h3 className="text-sm font-bold text-gray-900">接入 AI 联系人</h3>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">选择一个 AI 伙伴接入悬浮球</p>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-3">
                            {(() => {
                              const saved = localStorage.getItem('ins_state');
                              let aiContacts = [];
                              if (saved) {
                                try {
                                  const insState = JSON.parse(saved);
                                  aiContacts = insState.aiDatabase || [];
                                } catch (e) {}
                              }
                              
                              return (
                                <>
                                  <button
                                    onClick={() => updateState('floatingBallAiId', '')}
                                    className={cn(
                                      "flex items-center gap-3 p-3 border transition-all text-left",
                                      appState.floatingBallAiId === '' ? "border-gray-900 bg-gray-50" : "border-gray-100 hover:border-gray-300"
                                    )}
                                  >
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                      <AtSign className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-gray-900">不接入</div>
                                      <div className="text-[9px] text-gray-400 uppercase tracking-wider">None</div>
                                    </div>
                                  </button>

                                  {aiContacts.map((ai: any) => (
                                    <button
                                      key={ai.id}
                                      onClick={() => updateState('floatingBallAiId', ai.id)}
                                      className={cn(
                                        "flex items-center gap-3 p-3 border transition-all text-left",
                                        appState.floatingBallAiId === ai.id ? "border-gray-900 bg-gray-50" : "border-gray-100 hover:border-gray-300"
                                      )}
                                    >
                                      <img src={ai.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100" referrerPolicy="no-referrer" />
                                      <div>
                                        <div className="text-xs font-bold text-gray-900">{ai.nickname}</div>
                                        <div className="text-[9px] text-gray-400 uppercase tracking-wider">{ai.insId}</div>
                                      </div>
                                    </button>
                                  ))}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </section>
                  ) : (
                    <div />
                  )}
                </div>
              </motion.div>
            ) : (
              <div />
            )}
        </div>
        <OurTale isOpen={isOurTaleOpen} onClose={() => setIsOurTaleOpen(false)} isFullscreen={effectiveFullscreen} />

        <FloatingBall 
          show={appState.showFloatingBall} 
          img={appState.floatingBallImg} 
          aiId={appState.floatingBallAiId}
          showMusicPopup={appState.showMusicPopup}
          recordThoughts={appState.recordThoughts}
          onSaveThought={(content, aiId, aiName) => {
            const newThought = {
              id: Math.random().toString(36).substr(2, 9),
              aiId,
              aiName,
              content,
              timestamp: Date.now()
            };
            updateState('thoughtsHistory', [newThought, ...appState.thoughtsHistory]);
          }}
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
    </div>
    {showSplash && <Splash onComplete={() => setShowSplash(false)} />}
   </>
  );
}
