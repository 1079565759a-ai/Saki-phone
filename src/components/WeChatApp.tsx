import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  X, 
  Send, 
  Plus, 
  Image as ImageIcon, 
  Smile, 
  Mic, 
  MoreHorizontal,
  Search,
  User,
  MessageSquare,
  Compass,
  Settings as SettingsIcon
} from 'lucide-react';
import { cn } from '../utils/cn';
import LoginScreen from './LoginScreen';
import { GoogleGenAI } from "@google/genai";

interface User {
  nickname: string;
  password: string;
  avatar: string | null;
}

interface WeChatAppProps {
  onClose: () => void;
  isFullscreen?: boolean;
  isLoggedIn: boolean;
  registeredUser: User | null;
  onRegister: (user: User) => void;
  onLogin: (user: User) => void;
  appState: any;
  updateState: (key: string, value: any) => void;
}

export default function WeChatApp({ 
  onClose, 
  isFullscreen, 
  isLoggedIn, 
  registeredUser, 
  onRegister, 
  onLogin,
  appState,
  updateState
}: WeChatAppProps) {
  const [currentPage, setCurrentPage] = useState(0); // 0: Chats, 1: Contacts, 2: Discover, 3: Me
  const [selectedChatId, setSelectedChatId] = useState<string | null>(appState.selectedCharId);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeChar = appState.charCharacters.find((c: any) => c.id === selectedChatId);
  const approvedChars = appState.charCharacters.filter((c: any) => c.isFriendApproved);
  const friendRequests = appState.charCharacters.filter((c: any) => c.autoAddUser && !c.isFriendApproved);
  const chatHistory = selectedChatId ? (appState.chatHistories[selectedChatId] || []) : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  // Handle opening messages
  useEffect(() => {
    if (selectedChatId && activeChar && chatHistory.length === 0) {
      const sendOpeningMessages = async () => {
        const messages = activeChar.openingMessages || [];
        for (let i = 0; i < messages.length; i++) {
          if (!messages[i].trim()) continue;
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
          const newMsg = { role: 'ai', text: messages[i] };
          updateState('chatHistories', (prevHistories: any) => ({
            ...prevHistories,
            [selectedChatId]: [...(prevHistories[selectedChatId] || []), newMsg]
          }));
        }
      };
      sendOpeningMessages();
    }
  }, [selectedChatId]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedChatId || !activeChar) return;

    if (!appState.apiBaseUrl || !appState.apiKey) {
      setApiError('请先在设置中配置 API 地址和 Key');
      setTimeout(() => setApiError(null), 3000);
      return;
    }

    const userMsg = { role: 'user', text: inputText };
    const currentHistory = [...chatHistory, userMsg];
    
    updateState('chatHistories', (prev: any) => ({
      ...prev,
      [selectedChatId]: currentHistory
    }));
    
    setInputText('');
    setIsTyping(true);

    try {
      const url = appState.apiBaseUrl.endsWith('/') 
        ? `${appState.apiBaseUrl}chat/completions` 
        : `${appState.apiBaseUrl}/chat/completions`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${appState.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: appState.selectedModel || "gpt-3.5-turbo",
          messages: [
            { role: 'system', content: appState.systemPrompt },
            ...currentHistory.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }))
          ],
          stream: true
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `请求失败: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiFullText = '';

      if (reader) {
        // Add an empty AI message to start streaming into
        updateState('chatHistories', (prev: any) => ({
          ...prev,
          [selectedChatId]: [...currentHistory, { role: 'ai', text: '' }]
        }));

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') continue;
              
              try {
                const data = JSON.parse(dataStr);
                const content = data.choices[0]?.delta?.content || '';
                if (content) {
                  aiFullText += content;
                  // Update the last message in history
                  updateState('chatHistories', (prev: any) => {
                    const history = [...(prev[selectedChatId] || [])];
                    if (history.length > 0) {
                      history[history.length - 1] = { role: 'ai', text: aiFullText };
                    }
                    return { ...prev, [selectedChatId]: history };
                  });
                }
              } catch (e) {
                console.error('Error parsing SSE chunk', e);
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error("AI generation failed:", error);
      const errorMsg = { role: 'ai', text: `发生错误: ${error.message || "未知错误"}` };
      updateState('chatHistories', (prev: any) => ({
        ...prev,
        [selectedChatId]: [...(prev[selectedChatId] || []), errorMsg]
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleApproveFriend = (charId: string) => {
    const updatedChars = appState.charCharacters.map((c: any) => 
      c.id === charId ? { ...c, isFriendApproved: true } : c
    );
    updateState('charCharacters', updatedChars);
  };

  if (!isLoggedIn) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "absolute inset-0 bg-[#F5F5F7]",
          isFullscreen && "pt-safe pb-safe"
        )}
      >
        <div className="absolute top-4 left-4 z-[110]">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
        </div>
        <LoginScreen 
          registeredUser={registeredUser}
          onRegister={onRegister}
          onLogin={onLogin}
        />
      </motion.div>
    );
  }

  if (selectedChatId && activeChar) {
    return (
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="absolute inset-0 bg-[#F5F5F5] flex flex-col z-50"
      >
        {/* Chat Header */}
        <div className="h-16 px-4 flex items-center justify-between bg-white border-b border-gray-100 relative">
          {apiError && (
            <div className="absolute top-full left-0 right-0 bg-red-500 text-white text-[10px] py-1 px-4 text-center z-[60] animate-in slide-in-from-top duration-300">
              {apiError}
            </div>
          )}
          <button onClick={() => setSelectedChatId(null)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-gray-900">{activeChar.name}</span>
            <span className="text-[10px] text-green-500 font-medium tracking-widest uppercase">Online</span>
          </div>
          <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <MoreHorizontal className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        {/* Chat Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
        >
          {chatHistory.map((msg, idx) => (
            <div 
              key={idx}
              className={cn(
                "flex items-start gap-3",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 shadow-sm">
                <img 
                  src={msg.role === 'user' ? (appState.currentUser?.avatar || "https://picsum.photos/seed/user/100/100") : activeChar.avatar} 
                  className="w-full h-full object-cover" 
                  alt="" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div 
                className={cn(
                  "max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                  msg.role === 'user' 
                    ? "bg-gray-900 text-white rounded-tr-none" 
                    : "bg-white text-gray-800 rounded-tl-none border border-gray-50"
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 shadow-sm">
                <img src={activeChar.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
              </div>
              <div className="bg-white px-4 py-2.5 rounded-2xl rounded-tl-none border border-gray-50 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
            <Mic className="w-6 h-6" />
          </button>
          <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-2 flex items-center">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="发送消息..."
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-900"
            />
            <button className="p-1 text-gray-400 hover:text-gray-900 transition-colors">
              <Smile className="w-5 h-5" />
            </button>
          </div>
          {inputText.trim() ? (
            <button 
              onClick={handleSendMessage}
              className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg shadow-gray-200 active:scale-90 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "absolute inset-0 bg-white flex flex-col overflow-hidden",
        isFullscreen && "pt-safe pb-safe"
      )}
    >
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-gray-50 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-gray-900 tracking-widest uppercase">
            {currentPage === 0 ? "Chats" : currentPage === 1 ? "Contacts" : currentPage === 2 ? "Discover" : "Me"}
          </span>
        </div>
        <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 ml-2 flex-1 max-w-[150px]">
          <Search className="w-3 h-3 text-gray-400 mr-2" />
          <input 
            type="text"
            placeholder="Search ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-[10px] w-full"
          />
        </div>
      </div>

      {/* Pages Container */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {searchQuery ? (
          <div className="p-4 space-y-4">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Search Results</h3>
            {appState.charCharacters.filter((c: any) => c.wechatId.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">未找到该微信号</p>
            ) : (
              appState.charCharacters
                .filter((c: any) => c.wechatId.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((char: any) => (
                  <div key={char.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      <img src={char.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate">{char.name}</div>
                      <div className="text-[10px] text-gray-400 truncate">ID: {char.wechatId}</div>
                    </div>
                    {!char.isFriendApproved ? (
                      <button 
                        onClick={() => handleApproveFriend(char.id)}
                        className="px-4 py-2 bg-gray-900 text-white text-[10px] font-bold rounded-xl shadow-lg shadow-gray-200 active:scale-95 transition-all"
                      >
                        添加
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-300 font-bold">已添加</span>
                    )}
                  </div>
                ))
            )}
          </div>
        ) : currentPage === 0 ? (
          <div className="divide-y divide-gray-50">
            {approvedChars.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-xs text-gray-400">还没有聊天记录，去添加好友吧</p>
              </div>
            ) : (
              approvedChars.map((char: any) => (
                <div 
                  key={char.id}
                  onClick={() => setSelectedChatId(char.id)}
                  className="px-4 py-4 flex items-center gap-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
                    <img src={char.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-900 truncate">{char.name}</span>
                      <span className="text-[10px] text-gray-400">12:45</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {appState.chatHistories[char.id]?.slice(-1)[0]?.text || char.openingRemark || "暂无消息"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : currentPage === 1 ? (
          <div className="p-4 space-y-6">
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">New Contacts</h3>
              <div 
                onClick={() => setCurrentPage(2)}
                className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">New Friends</span>
                </div>
                {friendRequests.length > 0 && (
                  <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {friendRequests.length}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Characters</h3>
              <div className="space-y-1">
                {approvedChars.map((char: any) => (
                  <div key={char.id} className="px-2 py-3 flex items-center gap-4 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100">
                      <img src={char.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-sm font-bold text-gray-900">{char.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : currentPage === 2 ? (
          <div className="p-4 space-y-6">
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Friend Requests</h3>
              {friendRequests.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-8 text-center">
                  <p className="text-xs text-gray-400">暂无新的好友申请</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {friendRequests.map((char: any) => (
                    <div key={char.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img src={char.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">{char.name}</div>
                        <div className="text-[10px] text-gray-400 truncate">{char.addRequestMsg}</div>
                      </div>
                      <button 
                        onClick={() => handleApproveFriend(char.id)}
                        className="px-4 py-2 bg-gray-900 text-white text-[10px] font-bold rounded-xl shadow-lg shadow-gray-200 active:scale-95 transition-all"
                      >
                        通过
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="pt-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                <Compass className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Discover</h3>
              <p className="text-xs text-gray-400 max-w-[200px]">Explore new worlds and characters in the next update.</p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl overflow-hidden bg-gray-100 border-4 border-white shadow-xl">
                <img src={appState.currentUser?.avatar || "https://picsum.photos/seed/user/200/200"} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900">{appState.currentUser?.nickname || "User"}</h3>
                <p className="text-xs text-gray-400">ID: wechat_user_2603</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <SettingsIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">Settings</span>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Bar */}
      <div className="h-20 border-t border-gray-50 flex items-center justify-around px-4 bg-white/80 backdrop-blur-md">
        {[
          { icon: MessageSquare, label: "Chats" },
          { icon: User, label: "Contacts" },
          { icon: Compass, label: "Discover" },
          { icon: User, label: "Me" }
        ].map((item, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentPage(i)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={cn(
              "p-2 rounded-xl transition-all",
              currentPage === i ? "bg-gray-900 text-white scale-110 shadow-lg shadow-gray-200" : "text-gray-300 hover:text-gray-900"
            )}>
              <item.icon className="w-6 h-6" />
            </div>
            <span className={cn(
              "text-[8px] font-bold uppercase tracking-widest",
              currentPage === i ? "text-gray-900" : "text-gray-300"
            )}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
