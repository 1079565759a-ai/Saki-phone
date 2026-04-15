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
  Settings as SettingsIcon,
  Wand2,
  RefreshCw,
  Trash2,
  Edit2,
  Languages,
  Undo2
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
  bgOpacity: number;
  bubbleOpacity: number;
  bubbleRadius: number;
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
  bgOpacity: 100,
  bubbleOpacity: 100,
  bubbleRadius: 8,
};

const hexToRgba = (hex: string, opacity: number) => {
  if (!hex) return 'transparent';
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
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
  
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null);
  const [contextMenu, setContextMenu] = useState<{msgId: string, x: number, y: number, isUser: boolean} | null>(null);
  const [editModal, setEditModal] = useState<{isOpen: boolean, msgId: string, text: string} | null>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  const activeChar = appState.charCharacters.find((c: any) => c.id === selectedChatId);
  const approvedChars = appState.charCharacters.filter((c: any) => c.isFriendApproved);
  const friendRequests = appState.charCharacters.filter((c: any) => c.autoAddUser && !c.isFriendApproved);
  const chatHistory = selectedChatId ? (appState.chatHistories[selectedChatId] || []) : [];
  
  const chatSettingsByChar = appState.chatSettingsByChar || {};
  const savedSettings = selectedChatId ? chatSettingsByChar[selectedChatId] : null;
  const chatSettings: ChatSettings = {
    backgroundImage: savedSettings?.backgroundImage || null,
    chatBackgroundColor: savedSettings?.chatBackgroundColor || defaultChatSettings.chatBackgroundColor,
    headerFooterColor: savedSettings?.headerFooterColor || defaultChatSettings.headerFooterColor,
    bubbleFontSize: savedSettings?.bubbleFontSize || defaultChatSettings.bubbleFontSize,
    myBubbleColor: savedSettings?.myBubbleColor || defaultChatSettings.myBubbleColor,
    otherBubbleColor: savedSettings?.otherBubbleColor || defaultChatSettings.otherBubbleColor,
    fontColor: savedSettings?.fontColor || defaultChatSettings.fontColor,
    avatarShape: savedSettings?.avatarShape || defaultChatSettings.avatarShape,
    avatarSize: savedSettings?.avatarSize || defaultChatSettings.avatarSize,
    avatarFrame: savedSettings?.avatarFrame || null,
    bgOpacity: savedSettings?.bgOpacity ?? defaultChatSettings.bgOpacity,
    bubbleOpacity: savedSettings?.bubbleOpacity ?? defaultChatSettings.bubbleOpacity,
    bubbleRadius: savedSettings?.bubbleRadius ?? defaultChatSettings.bubbleRadius,
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

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedChatId || !activeChar) return;

    const newMsg = { id: Date.now().toString() + Math.random().toString(36).substring(2), role: 'user', text: inputText };
    
    updateState('chatHistories', (prev: any) => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), newMsg]
    }));
    
    setInputText('');
  };

  const triggerAI = async (historyToUse: any[]) => {
    if (!selectedChatId || !activeChar) return;

    if (!appState.apiBaseUrl || !appState.apiKey) {
      setApiError('请先在设置中配置 API 地址和 Key');
      setTimeout(() => setApiError(null), 3000);
      return;
    }

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
4. **分段发送**：如果需要连续发送多条消息，请直接换行，每次换行将作为一个独立的气泡发送。
5. **标点习惯**：正常用标点符号，一条消息句末如果是句号一般不怎么加（表达情绪除外）会用标点符号表达情绪。
6. **内容质量**：每条消息字数不要太少，需有一定信息量，能引导话题。会恰当地使用标点符号表达情绪（如…！？。，等等）。允许出现少许的口语化表达，但前提必须符合人设！！`;
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
            ...historyToUse.map(m => {
              let content = m.text;
              if (m.isRecalled) {
                content = m.role === 'user' 
                  ? `[用户撤回了一条消息，撤回的原始内容为: "${m.originalText}"]`
                  : `[你撤回了一条消息，撤回的原始内容为: "${m.originalText}"]`;
              }
              return { role: m.role === 'ai' ? 'assistant' : 'user', content };
            })
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
        const newMsgId = Date.now().toString() + Math.random().toString(36).substring(2);
        updateState('chatHistories', (prev: any) => ({
          ...prev,
          [selectedChatId]: [...historyToUse, { id: newMsgId, role: 'ai', text: '' }]
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
                  updateState('chatHistories', (prev: any) => {
                    const history = [...(prev[selectedChatId] || [])];
                    if (history.length > 0) {
                      history[history.length - 1] = { ...history[history.length - 1], text: aiFullText };
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
      const errorMsg = { id: Date.now().toString(), role: 'ai', text: `发生错误: ${error.message || "未知错误"}` };
      updateState('chatHistories', (prev: any) => ({
        ...prev,
        [selectedChatId]: [...(prev[selectedChatId] || []), errorMsg]
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleTriggerAIReply = () => {
    triggerAI(chatHistory);
  };

  const handleRegenerate = () => {
    setConfirmModal({
      isOpen: true,
      title: '重回消息',
      message: '确定要重回这一轮消息吗？AI将重新回复，且之前的回复将被遗忘。',
      onConfirm: () => {
        const history = chatHistory;
        let lastUserIdx = -1;
        for (let i = history.length - 1; i >= 0; i--) {
          if (history[i].role === 'user') {
            lastUserIdx = i;
            break;
          }
        }
        if (lastUserIdx !== -1) {
          const newHistory = history.slice(0, lastUserIdx + 1);
          updateState('chatHistories', (prev: any) => ({
            ...prev,
            [selectedChatId!]: newHistory
          }));
          triggerAI(newHistory);
        }
        setConfirmModal(null);
        setShowPlusMenu(false);
      }
    });
  };

  const handlePointerDown = (e: React.PointerEvent, msgId: string, isUser: boolean) => {
    pressTimer.current = setTimeout(() => {
      setContextMenu({ msgId, x: e.clientX, y: e.clientY, isUser });
    }, 500);
  };

  const handlePointerUpOrLeave = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const handleRecall = (msgId: string) => {
    setContextMenu(null);
    updateState('chatHistories', (prev: any) => {
      const hist = prev[selectedChatId!] || [];
      return {
        ...prev,
        [selectedChatId!]: hist.map((m: any) => m.id === msgId || (!m.id && hist.indexOf(m) === parseInt(msgId)) ? { ...m, isRecalled: true, originalText: m.text, text: '[撤回了一条消息]' } : m)
      };
    });
  };

  const handleDelete = (msgId: string) => {
    setContextMenu(null);
    updateState('chatHistories', (prev: any) => {
      const hist = prev[selectedChatId!] || [];
      return {
        ...prev,
        [selectedChatId!]: hist.filter((m: any) => m.id !== msgId && (!m.id ? hist.indexOf(m) !== parseInt(msgId) : true))
      };
    });
  };

  const handleTranslate = async (msgId: string) => {
    setContextMenu(null);
    const msg = chatHistory.find((m: any, i: number) => m.id === msgId || (!m.id && i === parseInt(msgId)));
    if (!msg || !msg.text) return;
    
    updateState('chatHistories', (prev: any) => {
      const hist = prev[selectedChatId!] || [];
      return {
        ...prev,
        [selectedChatId!]: hist.map((m: any) => m.id === msgId || (!m.id && hist.indexOf(m) === parseInt(msgId)) ? { ...m, isTranslating: true } : m)
      };
    });

    try {
      const url = appState.apiBaseUrl.endsWith('/') ? `${appState.apiBaseUrl}chat/completions` : `${appState.apiBaseUrl}/chat/completions`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${appState.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: appState.selectedModel || "gpt-3.5-turbo",
          messages: [{ role: 'user', content: `Translate the following text to Chinese (if it's already Chinese, translate to English). Only output the translation, nothing else:\n\n${msg.text}` }]
        })
      });
      const data = await response.json();
      const translation = data.choices?.[0]?.message?.content || '翻译失败';
      
      updateState('chatHistories', (prev: any) => {
        const hist = prev[selectedChatId!] || [];
        return {
          ...prev,
          [selectedChatId!]: hist.map((m: any) => m.id === msgId || (!m.id && hist.indexOf(m) === parseInt(msgId)) ? { ...m, translation, isTranslating: false } : m)
        };
      });
    } catch (err) {
      updateState('chatHistories', (prev: any) => {
        const hist = prev[selectedChatId!] || [];
        return {
          ...prev,
          [selectedChatId!]: hist.map((m: any) => m.id === msgId || (!m.id && hist.indexOf(m) === parseInt(msgId)) ? { ...m, translation: '翻译失败', isTranslating: false } : m)
        };
      });
    }
  };

  const saveEdit = () => {
    if (!editModal) return;
    updateState('chatHistories', (prev: any) => {
      const hist = prev[selectedChatId!] || [];
      return {
        ...prev,
        [selectedChatId!]: hist.map((m: any) => m.id === editModal.msgId || (!m.id && hist.indexOf(m) === parseInt(editModal.msgId)) ? { ...m, text: editModal.text } : m)
      };
    });
    setEditModal(null);
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
                style={{ backgroundColor: hexToRgba(chatSettings.chatBackgroundColor, chatSettings.bgOpacity) }}
              >
                {/* Preview Background */}
                {chatSettings.backgroundImage && (
                  <img src={chatSettings.backgroundImage} className="absolute inset-0 w-full h-full object-cover z-0" alt="bg-preview" style={{ opacity: chatSettings.bgOpacity / 100 }} />
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
                      className="shadow-sm relative z-10 px-2.5 py-1"
                      style={{
                        backgroundColor: hexToRgba(chatSettings.otherBubbleColor, chatSettings.bubbleOpacity),
                        color: chatSettings.fontColor,
                        fontSize: `${Math.max(10, chatSettings.bubbleFontSize - 2)}px`,
                        borderRadius: `${chatSettings.bubbleRadius}px`
                      }}
                    >
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-0 h-0 border-y-[4px] border-y-transparent border-r-[4px] left-[-4px] z-0"
                        style={{ borderRightColor: hexToRgba(chatSettings.otherBubbleColor, chatSettings.bubbleOpacity) }}
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
                      className="shadow-sm relative z-10 px-2.5 py-1"
                      style={{
                        backgroundColor: hexToRgba(chatSettings.myBubbleColor, chatSettings.bubbleOpacity),
                        color: chatSettings.fontColor,
                        fontSize: `${Math.max(10, chatSettings.bubbleFontSize - 2)}px`,
                        borderRadius: `${chatSettings.bubbleRadius}px`
                      }}
                    >
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-0 h-0 border-y-[4px] border-y-transparent border-l-[4px] right-[-4px] z-0"
                        style={{ borderLeftColor: hexToRgba(chatSettings.myBubbleColor, chatSettings.bubbleOpacity) }}
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
                          const reader = new FileReader();
                          reader.onload = (ev) => updateChatSettings({ backgroundImage: ev.target?.result as string });
                          reader.readAsDataURL(file);
                        }
                      }
                      e.target.value = '';
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
                    <span className="text-xs font-mono text-gray-500">{chatSettings.chatBackgroundColor}</span>
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
                    <span className="text-xs font-mono text-gray-500">{chatSettings.headerFooterColor}</span>
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
                    <span className="text-xs font-mono text-gray-500">{chatSettings.fontColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bubble Size & Shape & Opacity */}
            <div className="space-y-6">
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">界面背景透明度 (%)</h3>
                  <span className="text-xs font-mono text-gray-500">{chatSettings.bgOpacity}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={chatSettings.bgOpacity}
                  onChange={(e) => updateChatSettings({ bgOpacity: parseInt(e.target.value) })}
                  className="w-full accent-gray-900"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">气泡透明度 (%)</h3>
                  <span className="text-xs font-mono text-gray-500">{chatSettings.bubbleOpacity}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={chatSettings.bubbleOpacity}
                  onChange={(e) => updateChatSettings({ bubbleOpacity: parseInt(e.target.value) })}
                  className="w-full accent-gray-900"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">气泡圆角程度 (px)</h3>
                  <span className="text-xs font-mono text-gray-500">{chatSettings.bubbleRadius}px</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="24" 
                  value={chatSettings.bubbleRadius}
                  onChange={(e) => updateChatSettings({ bubbleRadius: parseInt(e.target.value) })}
                  className="w-full accent-gray-900"
                />
              </div>
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
                        e.target.value = '';
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
              style={{ opacity: chatSettings.bgOpacity / 100 }}
            />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: chatSettings.chatBackgroundColor, opacity: chatSettings.bgOpacity / 100 }} />
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
            <span className="text-[10px] font-bold tracking-widest uppercase opacity-70" style={{ color: chatSettings.fontColor }}>
              {isTyping ? '正在输入中...' : 'Online'}
            </span>
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
          {chatHistory.flatMap((msg, idx) => {
            if (msg.isRecalled) return [{ ...msg, id: msg.id || `${idx}-0` }];
            if (msg.role === 'user') return [{ ...msg, id: msg.id || `${idx}-0` }];
            const parts = msg.text.split(/\n+/).map((s: string) => s.trim()).filter(Boolean);
            if (parts.length === 0 && msg.text.length > 0) return [{ ...msg, id: msg.id || `${idx}-0` }];
            return parts.map((part, pIdx) => ({ ...msg, text: part, id: msg.id ? `${msg.id}-${pIdx}` : `${idx}-${pIdx}`, parentId: msg.id || `${idx}` }));
          }).map((msg) => {
            if (msg.isRecalled) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <span className="text-xs text-gray-400 bg-black/5 px-3 py-1 rounded-full">
                    {msg.role === 'user' ? '你' : activeChar.name}撤回了一条消息
                  </span>
                </div>
              );
            }
            return (
            <div 
              key={msg.id}
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
              
              {/* Bubble */}
              <div className="relative max-w-[75%]">
                <div 
                  className="shadow-sm relative z-10 px-3 py-1.5 cursor-pointer"
                  style={{
                    backgroundColor: hexToRgba(msg.role === 'user' ? chatSettings.myBubbleColor : chatSettings.otherBubbleColor, chatSettings.bubbleOpacity),
                    color: chatSettings.fontColor,
                    fontSize: `${chatSettings.bubbleFontSize}px`,
                    borderRadius: `${chatSettings.bubbleRadius}px`
                  }}
                  onPointerDown={(e) => handlePointerDown(e, msg.parentId || msg.id, msg.role === 'user')}
                  onPointerUp={handlePointerUpOrLeave}
                  onPointerLeave={handlePointerUpOrLeave}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {/* Bubble Tail */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent z-0"
                    style={{
                      [msg.role === 'user' ? 'right' : 'left']: '-5px',
                      [msg.role === 'user' ? 'borderLeftWidth' : 'borderRightWidth']: '6px',
                      [msg.role === 'user' ? 'borderLeftColor' : 'borderRightColor']: hexToRgba(msg.role === 'user' ? chatSettings.myBubbleColor : chatSettings.otherBubbleColor, chatSettings.bubbleOpacity),
                    }}
                  />
                  <div className="relative z-10 break-words whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                    {msg.isTranslating && (
                      <div className="mt-2 pt-2 border-t border-black/10 text-xs opacity-70 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> 翻译中...
                      </div>
                    )}
                    {msg.translation && (
                      <div className="mt-2 pt-2 border-t border-black/10 text-sm opacity-90">
                        {msg.translation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )})}
        </div>

        {/* Plus Menu Popup */}
        <AnimatePresence>
          {showPlusMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-[70px] left-4 bg-white rounded-xl shadow-lg border p-2 flex gap-2 z-50"
            >
              <button onClick={handleRegenerate} className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <RefreshCw className="w-6 h-6 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">重回</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Input */}
        <div 
          className="p-4 border-t flex items-center gap-3 relative z-10"
          style={{ 
            backgroundColor: `${chatSettings.headerFooterColor}e6`,
            borderColor: `${chatSettings.fontColor}1a`
          }}
        >
          <button 
            onClick={() => setShowPlusMenu(!showPlusMenu)}
            className="p-2 hover:bg-black/5 rounded-full transition-all" 
            style={{ color: chatSettings.fontColor }}
          >
            <Plus className="w-6 h-6 opacity-70" />
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
          <button 
            onClick={handleTriggerAIReply}
            className="w-11 h-11 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all"
            style={{ backgroundColor: chatSettings.fontColor, color: chatSettings.headerFooterColor }}
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <>
            <div className="fixed inset-0 z-[80]" onClick={() => setContextMenu(null)} />
            <div 
              className="fixed z-[90] bg-white rounded-lg shadow-xl border py-1 w-32"
              style={{ left: Math.min(contextMenu.x, window.innerWidth - 130), top: contextMenu.y }}
            >
              <button onClick={() => handleRecall(contextMenu.msgId)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><Undo2 className="w-4 h-4"/> 撤回</button>
              <button onClick={() => handleTranslate(contextMenu.msgId)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><Languages className="w-4 h-4"/> 翻译</button>
              <button onClick={() => { 
                const msg = chatHistory.find((m: any, i: number) => m.id === contextMenu.msgId || (!m.id && i === parseInt(contextMenu.msgId)));
                setEditModal({isOpen: true, msgId: contextMenu.msgId, text: msg?.text || ''}); 
                setContextMenu(null); 
              }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><Edit2 className="w-4 h-4"/> 编辑</button>
              <button onClick={() => handleDelete(contextMenu.msgId)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"><Trash2 className="w-4 h-4"/> 删除</button>
            </div>
          </>
        )}

        {/* Edit Modal */}
        {editModal?.isOpen && (
          <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-4">
              <h3 className="font-bold mb-4">编辑消息</h3>
              <textarea 
                className="w-full border rounded-lg p-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editModal.text}
                onChange={e => setEditModal({...editModal, text: e.target.value})}
              />
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setEditModal(null)} className="px-4 py-2 rounded-lg bg-gray-100 font-medium">取消</button>
                <button onClick={saveEdit} className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium">保存</button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Modal */}
        {confirmModal?.isOpen && (
          <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-6 text-center">
              <h3 className="font-bold text-lg mb-2">{confirmModal.title}</h3>
              <p className="text-gray-600 text-sm mb-6">{confirmModal.message}</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmModal(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 font-medium">取消</button>
                <button onClick={confirmModal.onConfirm} className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-medium">确认</button>
              </div>
            </div>
          </div>
        )}
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
