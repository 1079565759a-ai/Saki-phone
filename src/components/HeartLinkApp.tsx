import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle, 
  User, 
  ArrowLeft, 
  Send, 
  Settings, 
  X, 
  Camera, 
  Sparkles,
  RefreshCw,
  History,
  Info
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../utils/cn';

interface AICharacter {
  id: string;
  name: string;
  age: number;
  gender: string;
  avatar: string;
  bio: string;
  tags: string[];
  charId: string; // The ID user can search for in the other app
  mbti?: string;
  location?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface HeartLinkAppProps {
  onClose: () => void;
  language: 'zh' | 'en';
  isFullscreen?: boolean;
}

const HeartLinkApp: React.FC<HeartLinkAppProps> = ({ onClose, language: initialLanguage, isFullscreen }) => {
  const [currentLanguage, setCurrentLanguage] = useState<'zh' | 'en'>(initialLanguage || 'zh');
  const [activeTab, setActiveTab] = useState<'match' | 'chat' | 'profile'>('match');
  const [history, setHistory] = useState<AICharacter[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isMatching, setIsMatching] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [activeChat, setActiveChat] = useState<AICharacter | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [inputText, setInputText] = useState('');
  const [userProfile, setUserProfile] = useState({
    name: 'Operator',
    age: 24,
    bio: 'Looking for a meaningful connection.',
    avatar: 'https://picsum.photos/seed/user_retro/400/400'
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const t = {
    zh: {
      match: 'Match',
      chat: 'Messages',
      profile: 'Profile',
      startChat: 'Chat Now',
      next: 'Next',
      prev: 'Back',
      matching: 'Finding soulmate...',
      noHistory: 'No history yet',
      editProfile: 'Edit Profile',
      save: 'Save',
      charIdLabel: 'Char ID:',
      askCharId: 'Ask ID',
      searchHint: 'Search ID in Char to chat',
      bio: 'Bio',
      age: 'Age',
      name: 'Name',
      postInfo: 'Post My Info',
      posting: 'Posting...',
      postSuccess: 'Success! Wait for news',
      incomingMsg: 'New Message',
      langToggle: 'En'
    },
    en: {
      match: 'Match',
      chat: 'Messages',
      profile: 'Profile',
      startChat: 'Chat Now',
      next: 'Next',
      prev: 'Back',
      matching: 'Finding soulmate...',
      noHistory: 'No history yet',
      editProfile: 'Edit Profile',
      save: 'Save',
      charIdLabel: 'Char ID:',
      askCharId: 'Ask for ID',
      searchHint: 'Search ID in Char app',
      bio: 'Bio',
      age: 'Age',
      name: 'Name',
      postInfo: 'Post My Info',
      posting: 'Posting...',
      postSuccess: 'Posted! Waiting for matches',
      incomingMsg: 'Someone is messaging you',
      langToggle: '中'
    }
  }[currentLanguage];

  const generateAICharacter = async (isProactive = false) => {
    if (!isProactive) setIsMatching(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a unique, engaging AI persona for a dating app called "HeartLink". 
        The persona should be a handsome man or a beautiful woman (帅哥或美女).
        All text fields (name, bio, tags, location) MUST be in Chinese (中文).
        Return ONLY a JSON object with the following structure:
        {
          "name": "string (Chinese name)",
          "age": number (15-30),
          "gender": "string",
          "bio": "string (short, catchy dating bio in Chinese)",
          "tags": ["string", "string", "string"],
          "charId": "string (a unique alphanumeric ID like aura_v1 or user_123)",
          "mbti": "string (optional)",
          "location": "string (optional, in Chinese)"
        }`,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text);
      const newChar: AICharacter = {
        ...data,
        id: Date.now().toString() + (isProactive ? '_p' : ''),
        avatar: `https://picsum.photos/seed/${data.charId}/400/600`
      };

      if (isProactive) {
        setHistory(prev => [...prev, newChar]);
        // Proactively start chat
        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `You are ${newChar.name}, you just saw ${userProfile.name}'s profile on HeartLink. 
          Your persona: ${newChar.bio}. 
          Start a conversation with an opening line that fits your personality. Be proactive and engaging.
          IMPORTANT: Respond in Chinese (中文).`,
        });

        setChatMessages(prev => ({
          ...prev,
          [newChar.id]: [{
            id: 'proactive_' + Date.now(),
            sender: 'ai',
            text: aiResponse.text,
            timestamp: new Date().toLocaleTimeString()
          }]
        }));
      } else {
        setHistory(prev => [...prev, newChar]);
        setCurrentIndex(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to generate AI character', err);
    } finally {
      if (!isProactive) setIsMatching(false);
    }
  };

  const handlePostInfo = () => {
    setIsPosting(true);
    setTimeout(() => {
      setIsPosting(false);
      // Simulate proactive messages after a delay
      setTimeout(() => {
        generateAICharacter(true);
      }, 3000);
    }, 2000);
  };

  useEffect(() => {
    if (history.length === 0) {
      generateAICharacter();
    }
  }, []);

  const handleNext = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      generateAICharacter();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleStartChat = (char: AICharacter) => {
    setActiveChat(char);
    setActiveTab('chat');
    if (!chatMessages[char.id]) {
      setChatMessages(prev => ({
        ...prev,
        [char.id]: [{
          id: 'welcome',
          sender: 'ai',
          text: `Hi! I'm ${char.name}. Nice to meet you here on HeartLink.`,
          timestamp: new Date().toLocaleTimeString()
        }]
      }));
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChat) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), userMsg]
    }));
    setInputText('');

    // AI Response
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are ${activeChat.name}, a person matched on a dating app. 
        Persona: ${activeChat.bio}. 
        MBTI: ${activeChat.mbti}.
        Your Char ID is: ${activeChat.charId}.
        The user said: "${inputText}".
        Respond in a natural, conversational dating app style. 
        If the user asks for your ID or how to find you elsewhere, mention your Char ID: ${activeChat.charId}.
        IMPORTANT: Always respond in Chinese (中文).`,
      });

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString()
      };

      setChatMessages(prev => ({
        ...prev,
        [activeChat.id]: [...(prev[activeChat.id] || []), aiMsg]
      }));
    } catch (err) {
      console.error('Chat error', err);
    }
  };

  const renderMatchPage = () => {
    const currentChar = history[currentIndex];
    return (
      <div className="flex-1 flex flex-col p-6 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {isMatching ? (
            <motion.div 
              key="matching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center space-y-6"
            >
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="w-32 h-32 bg-pink-50 rounded-full flex items-center justify-center"
                >
                  <Heart className="w-16 h-16 text-pink-400 fill-pink-400 opacity-20" />
                </motion.div>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  className="absolute inset-0 border border-dashed border-pink-100 rounded-full"
                />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-400 animate-pulse">{t.matching}</p>
            </motion.div>
          ) : currentChar ? (
            <motion.div 
              key={currentChar.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="relative flex-1 rounded-none overflow-hidden border border-gray-900 group bg-gray-50">
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-none" />
                  <span className="text-[7px] font-mono text-white uppercase tracking-[0.3em] drop-shadow-md">Signal.Strength // 98%</span>
                </div>
                <img 
                  src={currentChar.avatar} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-10 text-white space-y-6">
                  <div className="flex items-end gap-4">
                    <h2 className="text-4xl font-serif italic font-bold tracking-tight uppercase">{currentChar.name}</h2>
                    <span className="text-xl font-mono opacity-60 mb-1">[{currentChar.age}]</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {currentChar.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/5 backdrop-blur-md rounded-none text-[8px] font-bold uppercase tracking-[0.2em] border border-white/10">
                        {tag}
                      </span>
                    ))}
                    {currentChar.mbti && (
                      <span className="px-3 py-1 bg-pink-400/20 backdrop-blur-md rounded-none text-[8px] font-bold uppercase tracking-[0.2em] border border-pink-400/30">
                        {currentChar.mbti}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[10px] leading-relaxed opacity-70 line-clamp-3 italic tracking-[0.2em] uppercase font-light">
                    "{currentChar.bio}"
                  </p>
                  
                  <button 
                    onClick={() => handleStartChat(currentChar)}
                    className="w-full py-5 bg-white text-gray-900 rounded-none font-bold text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-pink-400 hover:text-white transition-all active:scale-95 group/btn"
                  >
                    <MessageCircle size={16} className="text-pink-400 group-hover/btn:text-white transition-colors" strokeWidth={1.5} />
                    {t.startChat}
                  </button>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center border border-gray-100 mt-10">
                <button 
                  onClick={handleNext}
                  className="flex-1 h-20 bg-white text-gray-300 hover:text-pink-400 transition-all active:scale-95 flex flex-col items-center justify-center gap-2 border-r border-gray-100"
                >
                  <RefreshCw size={20} strokeWidth={1} />
                  <span className="text-[7px] font-bold uppercase tracking-[0.3em]">{t.next}</span>
                </button>
                <button 
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  className={cn(
                    "flex-1 h-20 bg-white transition-all active:scale-95 flex flex-col items-center justify-center gap-2",
                    currentIndex <= 0 ? "text-gray-50" : "text-gray-300 hover:text-gray-900"
                  )}
                >
                  <History size={20} strokeWidth={1} />
                  <span className="text-[7px] font-bold uppercase tracking-[0.3em]">{t.prev}</span>
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  };

  const renderChatListPage = () => {
    if (activeChat) {
      const messages = chatMessages[activeChat.id] || [];
      return (
        <div className="flex-1 flex flex-col bg-white">
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white/90 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveChat(null)} className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors">
                <ArrowLeft size={20} strokeWidth={1.5} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-none border border-gray-100 p-1 bg-white relative">
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-pink-400" />
                  <img src={activeChat.avatar} className="w-full h-full rounded-none object-cover" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-900 uppercase tracking-[0.2em]">{activeChat.name}</div>
                  <div className="text-[7px] text-pink-400 font-mono font-bold uppercase tracking-widest mt-1">Status: Online // {activeChat.charId}</div>
                </div>
              </div>
            </div>
            <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
              <Info size={18} strokeWidth={1} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/20">
            {messages.map(msg => (
              <div key={msg.id} className={cn(
                "flex flex-col max-w-[85%] relative",
                msg.sender === 'user' ? "ml-auto items-end" : "items-start"
              )}>
                <div className={cn(
                  "px-6 py-4 text-[10px] leading-relaxed uppercase tracking-[0.2em] relative",
                  msg.sender === 'user' 
                    ? "bg-gray-900 text-white rounded-none" 
                    : "bg-white border border-gray-100 text-gray-900 rounded-none shadow-sm"
                )}>
                  {msg.sender !== 'user' && <div className="absolute -top-1 -left-1 w-2 h-2 bg-pink-400" />}
                  {msg.text}
                </div>
                <span className="text-[7px] text-gray-300 mt-3 font-mono font-bold uppercase tracking-widest px-1">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          <div className="p-8 bg-white border-t border-gray-100 flex gap-4 pb-12">
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="ENTER MESSAGE..."
              className="flex-1 bg-gray-50 border border-gray-100 rounded-none px-6 py-5 text-[9px] outline-none focus:bg-white focus:border-gray-900 transition-all uppercase tracking-[0.3em] placeholder:text-gray-200"
            />
            <button 
              onClick={handleSendMessage}
              className="w-16 h-16 bg-gray-900 text-white rounded-none flex items-center justify-center hover:bg-black transition-all active:scale-95 shrink-0"
            >
              <Send size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      );
    }

    const chatList = Object.keys(chatMessages);
    return (
      <div className="flex-1 flex flex-col p-6 space-y-6">
        <h2 className="text-sm font-serif italic font-bold text-gray-900 uppercase tracking-[0.2em]">{t.chat}</h2>
        {chatList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-200 space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
              <MessageCircle size={32} strokeWidth={1.5} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{t.noHistory}</p>
          </div>
        ) : (
          <div className="space-y-px bg-gray-100 border border-gray-100">
            {chatList.map(charId => {
              const char = history.find(h => h.id === charId);
              if (!char) return null;
              const lastMsg = chatMessages[charId][chatMessages[charId].length - 1];
              return (
                <button 
                  key={charId}
                  onClick={() => setActiveChat(char)}
                  className="w-full flex items-center gap-4 p-5 bg-white hover:bg-gray-50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-none border border-gray-900 p-0.5 bg-white overflow-hidden">
                    <img src={char.avatar} className="w-full h-full rounded-none object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">{char.name}</div>
                    <div className="text-[9px] text-gray-400 truncate mt-1 italic uppercase tracking-wider">"{lastMsg.text}"</div>
                  </div>
                  <div className="text-[8px] text-gray-300 font-bold uppercase tracking-widest">{lastMsg.timestamp}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderProfilePage = () => {
    return (
      <div className="flex-1 flex flex-col p-8 space-y-10 overflow-y-auto">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-none border border-gray-100 p-2 bg-white relative">
              <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-gray-900" />
              <div className="absolute inset-0 bg-pink-400 translate-x-1 translate-y-1 -z-10 opacity-5" />
              <div className="w-full h-full rounded-none bg-gray-50 overflow-hidden border border-gray-100">
                <img src={userProfile.avatar} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
              </div>
            </div>
            <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-gray-900 text-white rounded-none flex items-center justify-center hover:bg-black transition-colors border-4 border-white">
              <Camera size={18} strokeWidth={1.5} />
            </button>
          </div>
          
          {isEditingProfile ? (
            <div className="w-full space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-[8px] font-bold text-gray-300 uppercase tracking-[0.4em] ml-1">{t.name}</label>
                <input 
                  value={userProfile.name}
                  onChange={e => setUserProfile({...userProfile, name: e.target.value})}
                  className="w-full bg-white border border-gray-100 p-5 rounded-none text-[10px] outline-none focus:border-gray-900 transition-all uppercase tracking-[0.2em]"
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[8px] font-bold text-gray-300 uppercase tracking-[0.4em] ml-1">{t.age}</label>
                <input 
                  type="number"
                  value={isNaN(userProfile.age) ? '' : userProfile.age}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setUserProfile({...userProfile, age: isNaN(val) ? 0 : val});
                  }}
                  className="w-full bg-white border border-gray-100 p-5 rounded-none text-[10px] outline-none focus:border-gray-900 transition-all uppercase tracking-[0.2em]"
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[8px] font-bold text-gray-300 uppercase tracking-[0.4em] ml-1">{t.bio}</label>
                <textarea 
                  value={userProfile.bio}
                  onChange={e => setUserProfile({...userProfile, bio: e.target.value})}
                  className="w-full bg-white border border-gray-100 p-5 rounded-none text-[10px] outline-none focus:border-gray-900 transition-all h-32 resize-none italic uppercase tracking-[0.2em] leading-relaxed"
                />
              </div>
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="w-full py-5 bg-gray-900 text-white rounded-none font-bold text-[10px] uppercase tracking-[0.5em] hover:bg-black transition-all"
              >
                {t.save}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <h2 className="text-2xl font-serif italic font-bold text-gray-900 tracking-[0.1em] uppercase">{userProfile.name}</h2>
                <span className="text-xl font-mono text-gray-300">[{userProfile.age}]</span>
              </div>
              <p className="text-[10px] text-gray-400 max-w-xs mx-auto italic uppercase tracking-[0.25em] leading-relaxed opacity-70">"{userProfile.bio}"</p>
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="px-12 py-3 border border-gray-100 text-gray-400 rounded-none text-[9px] font-bold uppercase tracking-[0.4em] hover:border-gray-900 hover:text-gray-900 transition-all mt-6"
              >
                {t.editProfile}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 border-l border-t border-gray-100">
          <div className="bg-white p-10 text-center space-y-3 border-r border-b border-gray-100">
            <div className="text-2xl font-serif italic font-bold text-gray-900">{history.length}</div>
            <div className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.3em]">Matches</div>
          </div>
          <div className="bg-white p-10 text-center space-y-3 border-r border-b border-gray-100">
            <div className="text-2xl font-serif italic font-bold text-gray-900">{Object.keys(chatMessages).length}</div>
            <div className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.3em]">Chats</div>
          </div>
        </div>

        <div className="pt-8 space-y-6">
          <button 
            onClick={handlePostInfo}
            disabled={isPosting}
            className={cn(
              "w-full py-6 rounded-none font-bold text-[10px] uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-4 relative overflow-hidden group",
              isPosting 
                ? "bg-gray-50 text-gray-200 cursor-not-allowed" 
                : "bg-gray-900 text-white hover:bg-black active:scale-95"
            )}
          >
            <div className="absolute inset-0 bg-pink-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            {isPosting ? (
              <>
                <RefreshCw size={16} className="animate-spin" strokeWidth={1.5} />
                {t.posting}
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-pink-400" strokeWidth={1.5} />
                <span className="relative">{t.postInfo}</span>
              </>
            )}
          </button>
          <p className="text-[8px] text-gray-300 text-center font-bold uppercase tracking-[0.3em] opacity-60">
            {t.searchHint}
          </p>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 z-40 bg-white flex flex-col overflow-hidden font-sans text-gray-900"
    >
      {/* Header */}
      <div className="pt-12 pb-6 px-8 flex items-center justify-between border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          {!isFullscreen && (
            <button onClick={onClose} className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors">
              <ArrowLeft strokeWidth={1.5} size={20} />
            </button>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Heart size={10} className="text-pink-400 fill-pink-400" />
              <span className="text-[10px] font-serif italic font-bold tracking-[0.3em] uppercase text-gray-900 leading-none">HeartLink</span>
            </div>
            <span className="text-[7px] font-mono text-gray-300 uppercase tracking-widest mt-1">v1.2.5 // link.established</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentLanguage(prev => prev === 'zh' ? 'en' : 'zh')}
            className="px-2 py-1 bg-white border border-gray-100 rounded-none text-[8px] font-bold text-gray-400 uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-all"
          >
            {t.langToggle}
          </button>
          <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'match' && renderMatchPage()}
        {activeTab === 'chat' && renderChatListPage()}
        {activeTab === 'profile' && renderProfilePage()}
      </div>

      {/* Bottom Nav */}
      {!activeChat && (
        <div className="h-24 bg-white border-t border-gray-100 flex items-center justify-around px-8 pb-6">
          {[
            { id: 'match', icon: Sparkles, label: t.match },
            { id: 'chat', icon: MessageCircle, label: t.chat },
            { id: 'profile', icon: User, label: t.profile },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex flex-col items-center gap-2 transition-all relative",
                activeTab === tab.id ? "text-gray-900" : "text-gray-300 hover:text-gray-600"
              )}
            >
              <tab.icon size={20} className={cn(activeTab === tab.id ? "stroke-[1.5px]" : "stroke-[1px]")} />
              <span className="text-[7px] font-bold uppercase tracking-[0.3em]">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="heartlink-tab-active"
                  className="absolute -top-10 w-1 h-1 bg-pink-400 rounded-none"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default HeartLinkApp;
