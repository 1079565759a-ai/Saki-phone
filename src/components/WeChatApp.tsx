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

export interface ChatSettings {
  backgroundImage: string | null;
  chatBackgroundColor: string;
  headerFooterColor: string;
  bubbleFontSize: number;
  myBubbleColor: string;
  otherBubbleColor: string;
  fontColor: string;
  avatarShape: 'circle' | 'square';
  avatarSize: 'small' | 'medium' | 'large';
  avatarFrame: string | null;
}

const defaultChatSettings: ChatSettings = {
  backgroundImage: null,
  chatBackgroundColor: '#ffffff',
  headerFooterColor: '#ffffff',
  bubbleFontSize: 14,
  myBubbleColor: '#f3f4f6', // Light gray
  otherBubbleColor: '#f9fafb', // Very light gray
  fontColor: '#111827',
  avatarShape: 'square',
  avatarSize: 'medium',
  avatarFrame: null,
};

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
  const [chatSubView, setChatSubView] = useState<'none' | 'profile' | 'beautify'>('none');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeChar = appState.charCharacters.find((c: any) => c.id === selectedChatId);
  const approvedChars = appState.charCharacters.filter((c: any) => c.isFriendApproved);
  const friendRequests = appState.charCharacters.filter((c: any) => c.autoAddUser && !c.isFriendApproved);
  const chatHistory = selectedChatId ? (appState.chatHistories[selectedChatId] || []) : [];
  
  const chatSettingsByChar = appState.chatSettingsByChar || {};
  const savedSettings = selectedChatId ? chatSettingsByChar[selectedChatId] : null;
  const chatSettings: ChatSettings = {
    backgroundImage: savedSettings?.backgroundImage ?? defaultChatSettings.backgroundImage,
    chatBackgroundColor: savedSettings?.chatBackgroundColor ?? defaultChatSettings.chatBackgroundColor,
    headerFooterColor: savedSettings?.headerFooterColor ?? defaultChatSettings.headerFooterColor,
    bubbleFontSize: savedSettings?.bubbleFontSize ?? defaultChatSettings.bubbleFontSize,
    myBubbleColor: savedSettings?.myBubbleColor ?? defaultChatSettings.myBubbleColor,
    otherBubbleColor: savedSettings?.otherBubbleColor ?? defaultChatSettings.otherBubbleColor,
    fontColor: savedSettings?.fontColor ?? defaultChatSettings.fontColor,
    avatarShape: savedSettings?.avatarShape ?? defaultChatSettings.avatarShape,
    avatarSize: savedSettings?.avatarSize ?? defaultChatSettings.avatarSize,
    avatarFrame: savedSettings?.avatarFrame ?? defaultChatSettings.avatarFrame,
  };
  
  const updateChatSettings = (newSettings: Partial<ChatSettings>) => {
    if (!selectedChatId) return;
    updateState('chatSettingsByChar', { 
      ...chatSettingsByChar, 
      [selectedChatId]: { ...chatSettings, ...newSettings } 
    });
  };

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

      const baseSystemPrompt = appState.systemPrompt || '';
      const characterPersona = activeChar.persona ? `\n\n当前角色设定：\n${activeChar.persona}` : '';
      const strictRules = `\n\n【最高优先级指令】从现在起，chat默认聊天方式切换至【线上模式】，且一切语言习惯必须服务于当前角色人设。
1. **人设优先**：你的用词、句式、语气、口头禅、发消息的长短节奏，都必须符合角色性格。格式为内容服务，绝不允许因为追求短句或格式而丢失角色灵魂。
2. **禁止括号**：严禁使用括号（如()、[]、{}等）描述动作、神态、心理。
3. **只输出气泡文字**：回复只能是消息框里的内容，无旁白。
4. **分段发送**：必须模拟即时通讯软件的聊天习惯，将长句拆分为多条短消息发送，每条消息之间用 [LINE] 分隔。
5. **标点习惯**：正常用标点符号，一条消息句末如果是句号一般不怎么加（表达情绪除外）会用标点符号表达情绪。`;
      const finalSystemPrompt = `${baseSystemPrompt}${characterPersona}${strictRules}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${appState.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: appState.selectedModel || "gpt-3.5-turbo",
          messages: [
            { role: 'system', content: finalSystemPrompt },
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
    if (chatSubView === 'profile') {
      return (
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="absolute inset-0 bg-[#F9FAFB] flex flex-col z-[60] overflow-y-auto"
        >
          <div className="h-14 px-4 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
            <button onClick={() => setChatSubView('none')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <span className="text-sm font-bold text-gray-900">聊天信息</span>
            <div className="w-10" />
          </div>
          
          <div className="p-6 flex flex-col items-center space-y-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm bg-white">
              <img src={activeChar.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">{activeChar.name}</h2>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">ID: {activeChar.wechatId}</p>
            </div>
            
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
              <button 
                onClick={() => setChatSubView('beautify')}
                className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
                    <SettingsIcon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">聊天美化</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
              </button>
            </div>
          </div>
        </motion.div>
      );
    }

    if (chatSubView === 'beautify') {
      return (
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="absolute inset-0 bg-white flex flex-col z-[70] overflow-y-auto"
        >
          <div className="h-14 px-4 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
            <button onClick={() => setChatSubView('profile')} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <span className="text-sm font-bold text-gray-900">聊天美化设置</span>
            <div className="w-10" />
          </div>
          
          <div className="p-6 space-y-8">
            {/* Real-time Preview */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">实时预览</h3>
              <div 
                className="w-full h-48 rounded-2xl border border-gray-200 overflow-hidden relative flex flex-col shadow-inner"
                style={{ backgroundColor: chatSettings.chatBackgroundColor }}
              >
                {/* Preview Background */}
                {chatSettings.backgroundImage && (
                  <img src={chatSettings.backgroundImage} className="absolute inset-0 w-full h-full object-cover z-0" alt="bg-preview" />
                )}
                
                {/* Preview Header */}
                <div 
                  className="h-10 px-3 flex items-center justify-center relative z-10 border-b"
                  style={{ 
                    backgroundColor: `${chatSettings.headerFooterColor}e6`,
                    borderColor: `${chatSettings.fontColor}1a`
                  }}
                >
                  <span className="text-xs font-bold" style={{ color: chatSettings.fontColor }}>{activeChar.name}</span>
                </div>

                {/* Preview Messages */}
                <div className="flex-1 p-3 space-y-4 overflow-hidden relative z-10">
                  {/* Other's Message */}
                  <div className="flex items-start gap-2">
                    <div className={cn("shrink-0 relative", chatSettings.avatarSize === 'small' ? 'w-6 h-6' : chatSettings.avatarSize === 'large' ? 'w-10 h-10' : 'w-8 h-8')}>
                      <div className={cn("w-full h-full overflow-hidden bg-gray-100", chatSettings.avatarShape === 'circle' ? 'rounded-full' : 'rounded-lg')}>
                        <img src={activeChar.avatar} className="w-full h-full object-cover" alt="" />
                      </div>
                      {chatSettings.avatarFrame && (
                        <img src={chatSettings.avatarFrame} className="absolute inset-0 w-full h-full object-contain z-10 scale-125" />
                      )}
                    </div>
                    <div 
                      className="rounded-lg shadow-sm relative z-10 px-2.5 py-1"
                      style={{
                        backgroundColor: chatSettings.otherBubbleColor,
                        color: chatSettings.fontColor,
                        fontSize: `${Math.max(10, chatSettings.bubbleFontSize - 2)}px`
                      }}
                    >
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-0 h-0 border-y-[4px] border-y-transparent border-r-[4px] left-[-4px] z-0"
                        style={{ borderRightColor: chatSettings.otherBubbleColor }}
                      />
                      <div className="relative z-10">你好！这是预览效果。</div>
                    </div>
                  </div>

                  {/* My Message */}
                  <div className="flex items-start gap-2 flex-row-reverse">
                    <div className={cn("shrink-0 relative", chatSettings.avatarSize === 'small' ? 'w-6 h-6' : chatSettings.avatarSize === 'large' ? 'w-10 h-10' : 'w-8 h-8')}>
                      <div className={cn("w-full h-full overflow-hidden bg-gray-100", chatSettings.avatarShape === 'circle' ? 'rounded-full' : 'rounded-lg')}>
                        <img src={appState.currentUser?.avatar || "https://picsum.photos/seed/user/100/100"} className="w-full h-full object-cover" alt="" />
                      </div>
                      {chatSettings.avatarFrame && (
                        <img src={chatSettings.avatarFrame} className="absolute inset-0 w-full h-full object-contain z-10 scale-125" />
                      )}
                    </div>
                    <div 
                      className="rounded-lg shadow-sm relative z-10 px-2.5 py-1"
                      style={{
                        backgroundColor: chatSettings.myBubbleColor,
                        color: chatSettings.fontColor,
                        fontSize: `${Math.max(10, chatSettings.bubbleFontSize - 2)}px`
                      }}
                    >
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-0 h-0 border-y-[4px] border-y-transparent border-l-[4px] right-[-4px] z-0"
                        style={{ borderLeftColor: chatSettings.myBubbleColor }}
                      />
                      <div className="relative z-10">太棒了，看起来很不错！</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Image */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">背景图片</h3>
              <div className="flex gap-4">
                <div className="w-24 h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors cursor-pointer relative overflow-hidden">
                  {chatSettings.backgroundImage ? (
                    <>
                      <img src={chatSettings.backgroundImage} className="w-full h-full object-cover" alt="bg" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateChatSettings({ backgroundImage: null }); }}
                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 mb-2" />
                      <span className="text-[10px]">上传背景</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const compressed = await compressImage(file, 1080, 1920, 0.7);
                          updateChatSettings({ backgroundImage: compressed });
                        } catch (err) {
                          console.error("Failed to compress background image:", err);
                          // Fallback to raw data URL if compression fails
                          const reader = new FileReader();
                          reader.onload = (ev) => updateChatSettings({ backgroundImage: ev.target?.result as string });
                          reader.readAsDataURL(file);
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bubble Colors */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">气泡颜色</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500">我的气泡</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={chatSettings.myBubbleColor}
                      onChange={(e) => updateChatSettings({ myBubbleColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-xs font-mono text-gray-500">{chatSettings.myBubbleColor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500">对方气泡</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={chatSettings.otherBubbleColor}
                      onChange={(e) => updateChatSettings({ otherBubbleColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-xs font-mono text-gray-500">{chatSettings.otherBubbleColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Global Colors */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">全局颜色</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500">聊天背景色</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={chatSettings.chatBackgroundColor}
                      onChange={(e) => updateChatSettings({ chatBackgroundColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500">顶栏/底栏背景色</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={chatSettings.headerFooterColor}
                      onChange={(e) => updateChatSettings({ headerFooterColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500">全局字体颜色</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={chatSettings.fontColor}
                      onChange={(e) => updateChatSettings({ fontColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bubble Size */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">气泡字体大小 (px)</h3>
                <span className="text-xs font-mono text-gray-500">{chatSettings.bubbleFontSize}px</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="24" 
                value={chatSettings.bubbleFontSize}
                onChange={(e) => updateChatSettings({ bubbleFontSize: parseInt(e.target.value) })}
                className="w-full accent-gray-900"
              />
            </div>

            {/* Avatar Settings */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">头像设置</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 block mb-2">形状</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateChatSettings({ avatarShape: 'square' })}
                      className={cn(
                        "flex-1 py-2 text-xs rounded-xl border transition-all",
                        chatSettings.avatarShape === 'square' ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200"
                      )}
                    >
                      圆角方形
                    </button>
                    <button
                      onClick={() => updateChatSettings({ avatarShape: 'circle' })}
                      className={cn(
                        "flex-1 py-2 text-xs rounded-xl border transition-all",
                        chatSettings.avatarShape === 'circle' ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200"
                      )}
                    >
                      圆形
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-2">大小</label>
                  <div className="flex gap-2">
                    {(['small', 'medium', 'large'] as const).map(size => (
                      <button
                        key={size}
                        onClick={() => updateChatSettings({ avatarSize: size })}
                        className={cn(
                          "flex-1 py-2 text-xs rounded-xl border transition-all",
                          chatSettings.avatarSize === size ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200"
                        )}
                      >
                        {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-2">头像框</label>
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden cursor-pointer hover:border-gray-400">
                    {chatSettings.avatarFrame ? (
                      <>
                        <img src={chatSettings.avatarFrame} className="w-full h-full object-cover" alt="frame" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateChatSettings({ avatarFrame: null }); }}
                          className="absolute top-0 right-0 p-0.5 bg-black/50 text-white rounded-bl-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <Plus className="w-6 h-6 text-gray-400" />
                    )}
                    <input 
                      type="file" 
                      accept="image/png,image/gif" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressImage(file, 200, 200, 0.9);
                            updateChatSettings({ avatarFrame: compressed });
                          } catch (err) {
                            console.error("Failed to compress avatar frame:", err);
                            const reader = new FileReader();
                            reader.onload = (ev) => updateChatSettings({ avatarFrame: ev.target?.result as string });
                            reader.readAsDataURL(file);
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-[8px] text-gray-400 mt-1">建议上传透明背景的 PNG 或 GIF</p>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      );
    }

    // Dynamic Styles based on settings
    const avatarSizeClass = chatSettings.avatarSize === 'small' ? 'w-8 h-8' : chatSettings.avatarSize === 'large' ? 'w-12 h-12' : 'w-10 h-10';
    const avatarShapeClass = chatSettings.avatarShape === 'circle' ? 'rounded-full' : 'rounded-xl';

    return (
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="absolute inset-0 flex flex-col z-50 overflow-hidden"
        style={{ backgroundColor: chatSettings.chatBackgroundColor, color: chatSettings.fontColor }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          {chatSettings.backgroundImage ? (
            <img 
              src={chatSettings.backgroundImage} 
              className="w-full h-full object-cover" 
              alt="background" 
            />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: chatSettings.chatBackgroundColor }} />
          )}
        </div>

        {/* Chat Header */}
        <div 
          className="h-16 px-4 flex items-center justify-between border-b relative z-10"
          style={{ 
            backgroundColor: `${chatSettings.headerFooterColor}e6`, // 90% opacity
            borderColor: `${chatSettings.fontColor}1a` // 10% opacity
          }}
        >
          {apiError && (
            <div className="absolute top-full left-0 right-0 bg-red-500/90 backdrop-blur-md text-white text-[10px] py-1 px-4 text-center z-[60] animate-in slide-in-from-top duration-300 shadow-lg">
              {apiError}
            </div>
          )}
          <button onClick={() => setSelectedChatId(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" style={{ color: chatSettings.fontColor }} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold" style={{ color: chatSettings.fontColor }}>{activeChar.name}</span>
            <span className="text-[10px] font-bold tracking-widest uppercase opacity-70" style={{ color: chatSettings.fontColor }}>Online</span>
          </div>
          <button onClick={() => setChatSubView('profile')} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <MoreHorizontal className="w-6 h-6" style={{ color: chatSettings.fontColor }} />
          </button>
        </div>

        {/* Chat Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide relative z-10"
        >
          {chatHistory.map((msg, idx) => {
            const parts = msg.text.split(/\[LINE\]/i).map((s: string) => s.trim()).filter(Boolean);
            if (parts.length === 0 && msg.text.length > 0) parts.push(msg.text); // fallback for streaming or empty parts

            return (
              <div 
                key={idx}
                className={cn(
                  "flex items-start gap-3",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div className={cn("shrink-0 relative", avatarSizeClass)}>
                  <div className={cn("w-full h-full overflow-hidden bg-gray-100 shadow-sm", avatarShapeClass)}>
                    <img 
                      src={msg.role === 'user' ? (appState.currentUser?.avatar || "https://picsum.photos/seed/user/100/100") : activeChar.avatar} 
                      className="w-full h-full object-cover" 
                      alt="" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {chatSettings.avatarFrame && (
                    <img src={chatSettings.avatarFrame} className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none scale-125" />
                  )}
                </div>
                
                {/* Bubbles */}
                <div className={cn("flex flex-col gap-2 max-w-[75%]", msg.role === 'user' ? "items-end" : "items-start")}>
                  {parts.map((part: string, pIdx: number) => (
                    <div key={pIdx} className="relative">
                      <div 
                        className="rounded-lg shadow-sm relative z-10 px-3 py-1.5"
                        style={{
                          backgroundColor: msg.role === 'user' ? chatSettings.myBubbleColor : chatSettings.otherBubbleColor,
                          color: chatSettings.fontColor,
                          fontSize: `${chatSettings.bubbleFontSize}px`
                        }}
                      >
                        {/* Bubble Tail - only show on first bubble */}
                        {pIdx === 0 && (
                          <div 
                            className="absolute top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent z-0"
                            style={{
                              [msg.role === 'user' ? 'right' : 'left']: '-5px',
                              [msg.role === 'user' ? 'borderLeftWidth' : 'borderRightWidth']: '6px',
                              [msg.role === 'user' ? 'borderLeftColor' : 'borderRightColor']: msg.role === 'user' ? chatSettings.myBubbleColor : chatSettings.otherBubbleColor,
                            }}
                          />
                        )}
                        <div className="relative z-10 break-words whitespace-pre-wrap leading-relaxed">{part}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className={cn("shrink-0 relative", avatarSizeClass)}>
                <div className={cn("w-full h-full overflow-hidden bg-gray-100 shadow-sm", avatarShapeClass)}>
                  <img src={activeChar.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                </div>
                {chatSettings.avatarFrame && (
                  <img src={chatSettings.avatarFrame} className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none scale-125" />
                )}
              </div>
              <div className="relative max-w-[75%]">
                <div 
                  className="rounded-lg shadow-sm relative z-10 px-3 py-1.5"
                  style={{ backgroundColor: chatSettings.otherBubbleColor }}
                >
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] left-[-5px] z-0"
                    style={{ borderRightColor: chatSettings.otherBubbleColor }}
                  />
                  <div className="flex gap-1.5 relative z-10 items-center h-full py-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: chatSettings.fontColor, opacity: 0.5 }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s]" style={{ backgroundColor: chatSettings.fontColor, opacity: 0.5 }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s]" style={{ backgroundColor: chatSettings.fontColor, opacity: 0.5 }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div 
          className="p-4 border-t flex items-center gap-3 relative z-10"
          style={{ 
            backgroundColor: `${chatSettings.headerFooterColor}e6`,
            borderColor: `${chatSettings.fontColor}1a`
          }}
        >
          <button className="p-2 hover:bg-black/5 rounded-full transition-all" style={{ color: chatSettings.fontColor }}>
            <Mic className="w-6 h-6 opacity-70" />
          </button>
          <div 
            className="flex-1 rounded-full px-5 py-2.5 flex items-center shadow-inner"
            style={{ backgroundColor: `${chatSettings.fontColor}0d` }} // 5% opacity of font color for input bg
          >
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="发送消息..."
              className="flex-1 bg-transparent border-none focus:outline-none text-sm"
              style={{ color: chatSettings.fontColor }}
            />
            <button className="p-1.5 transition-colors" style={{ color: chatSettings.fontColor }}>
              <Smile className="w-5 h-5 opacity-70" />
            </button>
          </div>
          {inputText.trim() ? (
            <button 
              onClick={handleSendMessage}
              className="w-11 h-11 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all"
              style={{ backgroundColor: chatSettings.fontColor, color: chatSettings.headerFooterColor }}
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button className="p-2 hover:bg-black/5 rounded-full transition-all" style={{ color: chatSettings.fontColor }}>
              <Plus className="w-6 h-6 opacity-70" />
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
