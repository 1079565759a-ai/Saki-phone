import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
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
  X,
  ChevronLeft,
  MoreVertical,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Video,
  VideoOff,
  User,
  Search,
  Plus,
  ArrowLeft,
  Delete
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../utils/cn';

interface CallRecord {
  id: string;
  type: 'incoming' | 'outgoing' | 'missed';
  name: string;
  number: string;
  time: string;
  duration?: string;
}

interface PhoneAppProps {
  onClose: () => void;
  appState: any;
  updateState: (key: string, value: any) => void;
  isFullscreen?: boolean;
}

export default function PhoneApp({ onClose, appState, updateState, isFullscreen }: PhoneAppProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'contacts' | 'dialer'>('history');
  const [dialedNumber, setDialedNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [activeCall, setActiveCall] = useState<{ name: string; number: string; status: 'calling' | 'connected' | 'ended' } | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getAiResponse = async () => {
    if (!appState.apiKey && !appState.minimaxApiKey) {
      setAiResponse("（系统：请先在设置中配置 API 密钥以开启 AI 通话）");
      return;
    }

    setIsAiTyping(true);
    try {
      // If MiniMax is configured, we could use it. For now, let's use Gemini as the primary AI engine
      // but acknowledge MiniMax in the prompt if it's the intended "voice" provider.
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = `你正在与用户进行电话通话。
你的名字是：${appState.chatAiName}
你的设定是：${appState.systemPrompt}
当前是电话通话场景，请保持回答简短、自然，像是在电话里聊天一样。
不要使用复杂的排版，多使用口语化的表达。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "喂？你在吗？我想和你聊聊。",
        config: { systemInstruction }
      });

      setAiResponse(response.text || "喂？听得清吗？");
    } catch (error) {
      console.error('Call AI error:', error);
      setAiResponse("抱歉，信号好像不太好...");
    } finally {
      setIsAiTyping(false);
    }
  };

  useEffect(() => {
    if (activeCall?.status === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      if (activeCall.name === appState.chatAiName) {
        getAiResponse();
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeCall?.status]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDial = (num: string) => {
    if (dialedNumber.length < 15) {
      setDialedNumber(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setDialedNumber(prev => prev.slice(0, -1));
  };

  const startCall = (name: string, number: string) => {
    setActiveCall({ name, number, status: 'calling' });
    setIsCalling(true);
    setCallDuration(0);

    // Simulate connection after 2 seconds
    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
    }, 2000);
  };

  const endCall = () => {
    if (!activeCall) return;

    const newRecord: CallRecord = {
      id: Date.now().toString(),
      type: 'outgoing',
      name: activeCall.name,
      number: activeCall.number,
      time: new Date().toISOString(),
      duration: formatDuration(callDuration)
    };

    updateState('callHistory', [newRecord, ...appState.callHistory]);
    
    setActiveCall(prev => prev ? { ...prev, status: 'ended' } : null);
    setTimeout(() => {
      setIsCalling(false);
      setActiveCall(null);
    }, 1000);
  };

  const contacts = [
    { name: appState.chatAiName, number: appState.aiPhoneNumber, avatar: appState.chatAiAvatar, isAi: true },
    { name: "妈妈", number: "138-0000-0001", avatar: "https://picsum.photos/seed/mom/100/100" },
    { name: "爸爸", number: "138-0000-0002", avatar: "https://picsum.photos/seed/dad/100/100" },
    { name: "闺蜜", number: "138-0000-0003", avatar: "https://picsum.photos/seed/friend/100/100" },
  ];

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-[60] bg-[#FDFCF8] flex flex-col overflow-hidden font-sans text-[#2D2D2D]"
    >
      {/* Status Bar Spacer */}
      <div className="h-12 shrink-0" />

      <AnimatePresence>
        {isCalling && activeCall ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[70] bg-[#2D2D2D] text-white flex flex-col items-center justify-between py-20 px-10"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20">
                <img 
                  src={activeCall.name === appState.chatAiName ? appState.chatAiAvatar : "https://picsum.photos/seed/user/200/200"} 
                  className="w-full h-full object-cover"
                  alt="avatar"
                />
              </div>
              <h2 className="text-2xl font-bold">{activeCall.name}</h2>
              <p className="text-white/60 font-mono">{activeCall.status === 'calling' ? '正在呼叫...' : formatDuration(callDuration)}</p>
              
              {/* AI Response Text */}
              {activeCall.status === 'connected' && activeCall.name === appState.chatAiName && (
                <div className="mt-8 px-6 py-4 bg-white/5 rounded-2xl border border-white/10 max-w-xs text-center">
                  {isAiTyping ? (
                    <div className="flex items-center justify-center gap-1.5 py-2">
                      <span className="w-1 h-1 bg-white/40 animate-pulse" />
                      <span className="w-1 h-1 bg-white/40 animate-pulse delay-75" />
                      <span className="w-1 h-1 bg-white/40 animate-pulse delay-150" />
                    </div>
                  ) : (
                    <p className="text-sm text-white/80 italic">"{aiResponse}"</p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-10 w-full max-w-xs">
              <CallActionBtn icon={isMuted ? MicOff : Mic} label="静音" active={isMuted} onClick={() => setIsMuted(!isMuted)} />
              <CallActionBtn icon={Hash} label="键盘" />
              <CallActionBtn icon={isSpeaker ? Volume2 : VolumeX} label="免提" active={isSpeaker} onClick={() => setIsSpeaker(!isSpeaker)} />
              <CallActionBtn icon={Plus} label="添加通话" />
              <CallActionBtn icon={Video} label="视频通话" />
              <CallActionBtn icon={User} label="通讯录" />
            </div>

            <button 
              onClick={endCall}
              className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
            >
              <PhoneOff className="w-8 h-8 text-white" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        {!isFullscreen && (
          <button onClick={onClose} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-lg font-bold uppercase tracking-widest">
          {activeTab === 'history' ? '最近通话' : activeTab === 'contacts' ? '通讯录' : '拨号'}
        </h1>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6">
        {activeTab === 'history' && (
          <div className="space-y-1">
            {appState.callHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Clock className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-xs uppercase tracking-widest">暂无通话记录</p>
              </div>
            ) : (
              appState.callHistory.map((call: CallRecord) => (
                <div key={call.id} className="flex items-center justify-between py-4 border-b border-black/5 last:border-0 group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      call.type === 'missed' ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400"
                    )}>
                      {call.type === 'incoming' && <PhoneIncoming className="w-4 h-4" />}
                      {call.type === 'outgoing' && <PhoneOutgoing className="w-4 h-4" />}
                      {call.type === 'missed' && <PhoneMissed className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className={cn("font-bold text-sm", call.type === 'missed' && "text-red-500")}>{call.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{call.number}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400">{new Date(call.time).toLocaleDateString()}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{call.duration || '未接通'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="搜索联系人" 
                className="w-full bg-gray-100 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:bg-gray-200 transition-colors"
              />
            </div>

            <div className="space-y-4">
              {contacts.map((contact, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <img src={contact.avatar} className="w-12 h-12 rounded-full object-cover border border-black/5" alt={contact.name} />
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        {contact.name}
                        {contact.isAi && <span className="px-1.5 py-0.5 bg-pink-100 text-pink-500 text-[8px] rounded-full uppercase tracking-tighter">AI</span>}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">{contact.number}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => startCall(contact.name, contact.number)}
                    className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'dialer' && (
          <div className="h-full flex flex-col items-center justify-center pb-10">
            <div className="h-20 flex items-center justify-center mb-8">
              <span className="text-3xl font-mono tracking-wider">{dialedNumber}</span>
              {dialedNumber && (
                <button onClick={handleDelete} className="ml-4 p-2 text-gray-400 hover:text-gray-600">
                  <Delete className="w-6 h-6" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-6 mb-10">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(key => (
                <button 
                  key={key}
                  onClick={() => handleDial(key)}
                  className="w-16 h-16 rounded-full bg-gray-100 flex flex-col items-center justify-center hover:bg-gray-200 active:scale-95 transition-all"
                >
                  <span className="text-xl font-bold">{key}</span>
                  <span className="text-[8px] text-gray-400 uppercase tracking-tighter">
                    {key === '2' ? 'ABC' : key === '3' ? 'DEF' : key === '4' ? 'GHI' : key === '5' ? 'JKL' : key === '6' ? 'MNO' : key === '7' ? 'PQRS' : key === '8' ? 'TUV' : key === '9' ? 'WXYZ' : ''}
                  </span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => dialedNumber && startCall("未知号码", dialedNumber)}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all",
                dialedNumber ? "bg-emerald-500 text-white scale-110" : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              <Phone className="w-8 h-8" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Tabs */}
      <div className="h-20 border-t border-black/5 flex items-center justify-around px-6 bg-white/80 backdrop-blur-md">
        <TabBtn icon={Clock} label="最近通话" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        <TabBtn icon={Users} label="通讯录" active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} />
        <TabBtn icon={Hash} label="拨号" active={activeTab === 'dialer'} onClick={() => setActiveTab('dialer')} />
      </div>
    </motion.div>
  );
}

function TabBtn({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-colors",
        active ? "text-[#2D2D2D]" : "text-gray-400"
      )}
    >
      <Icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}

function CallActionBtn({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button 
        onClick={onClick}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-all",
          active ? "bg-white text-[#2D2D2D]" : "bg-white/10 text-white hover:bg-white/20"
        )}
      >
        <Icon className="w-6 h-6" />
      </button>
      <span className="text-[10px] text-white/60">{label}</span>
    </div>
  );
}
