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
  Undo2,
  Camera,
  Video,
  MapPin,
  Wallet,
  Gift,
  ArrowRightLeft,
  Star,
  UserSquare,
  File,
  Ticket,
  Music,
  Copy,
  Forward,
  CheckSquare,
  Quote,
  MessageCircleHeart,
  CornerRightUp
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

const TextPhotoBubble = ({ text, isUser, chatSettings }: { text: string, isUser: boolean, chatSettings: ChatSettings }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div 
      className="relative w-40 h-56 cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative transition-all duration-500"
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        {/* Front (Looks like a photo) */}
        <div 
          className="absolute inset-0 rounded-xl overflow-hidden shadow-sm flex flex-col bg-white"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
            <ImageIcon className="w-10 h-10 text-gray-400 drop-shadow-sm" />
            <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-white drop-shadow-md" />
            </div>
          </div>
          <div className="h-8 bg-white flex items-center justify-center">
            <div className="w-16 h-1 bg-gray-200 rounded-full" />
          </div>
        </div>
        {/* Back (Text description) */}
        <div 
          className="absolute inset-0 rounded-xl overflow-hidden border-2 p-3 overflow-y-auto"
          style={{ 
            borderColor: isUser ? chatSettings.myBubbleColor : chatSettings.otherBubbleColor,
            backgroundColor: isUser ? chatSettings.myBubbleColor : chatSettings.otherBubbleColor,
            color: chatSettings.fontColor,
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden'
          }}
        >
          <p className="text-sm whitespace-pre-wrap">{text}</p>
        </div>
      </motion.div>
    </div>
  );
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
  const [isMultiSelecting, setIsMultiSelecting] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [editModal, setEditModal] = useState<{isOpen: boolean, msgId: string, text: string} | null>(null);
  const [photoModal, setPhotoModal] = useState<'none' | 'choose' | 'text-photo-input'>('none');
  const [textPhotoInput, setTextPhotoInput] = useState('');
  const [callChooseModal, setCallChooseModal] = useState(false);
  const [callState, setCallState] = useState<{
    isActive: boolean;
    type: 'voice' | 'video';
    status: 'dialing' | 'connected';
    isMuted: boolean;
    isSpeaker: boolean;
    transcript: { id: string, role: 'user' | 'ai', text: string }[];
  } | null>(null);
  const [callInputText, setCallInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{id: string, text: string, role: string, timestamp?: number} | null>(null);
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

  const handleSendTextPhoto = () => {
    if (!textPhotoInput.trim() || !selectedChatId) return;
    const newMsg = { id: Date.now().toString() + Math.random().toString(36).substring(2), role: 'user', text: textPhotoInput, type: 'text-photo' };
    updateState('chatHistories', (prev: any) => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), newMsg]
    }));
    setTextPhotoInput('');
    setPhotoModal('none');
    setShowPlusMenu(false);
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedChatId || !activeChar) return;

    const parts = inputText.split(/\n+/).map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;

    const newMsgs = parts.map((part, idx) => ({
      id: Date.now().toString() + Math.random().toString(36).substring(2) + `-${idx}`,
      role: 'user',
      text: part,
      timestamp: Date.now(),
      quote: (idx === 0 && replyingTo) ? { 
        id: replyingTo.id,
        text: replyingTo.text, 
        role: replyingTo.role, 
        senderName: replyingTo.role === 'user' ? '你' : activeChar.name,
        timestamp: replyingTo.timestamp 
      } : undefined
    }));
    
    updateState('chatHistories', (prev: any) => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), ...newMsgs]
    }));
    
    setInputText('');
    setReplyingTo(null);
    setIsTyping(true);
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
      const strictRules = `\n\n1. 人设驱动：你的措辞、语气、句式、长度完全由角色性格决定。请理解角色内核，自然流露，杜绝模板化。
2. 纯对话流：禁止任何括号及括号内描述。回复即消息框内容，无旁白无注释。
3. 多气泡换行：换行代表新气泡。请发送多条完整句子，每条气泡信息量充足，推动对话。
4. 情感饱满：情绪起伏鲜明，拒绝平淡。喜怒哀乐如真人般强烈表达。
5. 特殊操作：
   · 单独发送 [撤回] 撤回上一条。
   · 开头用 [引用:对方原句] 换行后继续。
6.会正常使用各类标点符号。
7.必须保持逻辑连贯，活人感优先。`;
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
      let hasRecalled = false;

      if (reader) {
        const baseMsgId = Date.now().toString() + Math.random().toString(36).substring(2);

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
                  
                  let displayContent = aiFullText;
                  let quoteMatch = displayContent.match(/\[引用:(.*?)\]/);
                  let quote = undefined;
                  if (quoteMatch) {
                    const quotedText = quoteMatch[1];
                    const foundMsg = historyToUse.slice().reverse().find(m => m.text.includes(quotedText) || quotedText.includes(m.text));
                    quote = { 
                      id: foundMsg?.id,
                      role: foundMsg?.role || 'user', 
                      text: quotedText,
                      senderName: foundMsg ? (foundMsg.role === 'user' ? '你' : activeChar.name) : '你',
                      timestamp: foundMsg?.timestamp || Date.now()
                    };
                    displayContent = displayContent.replace(quoteMatch[0], '').trim();
                  }
                  
                  let isRecalling = displayContent.includes('[撤回]');
                  displayContent = displayContent.replace(/\[撤回\]/g, '').trim();

                  const parts = displayContent.split(/\n+/).map(s => s.trim()).filter(Boolean);

                  updateState('chatHistories', (prev: any) => {
                    const history = [...(prev[selectedChatId] || [])];
                    
                    if (isRecalling && !hasRecalled) {
                       for (let i = history.length - 1; i >= 0; i--) {
                         if (history[i].role === 'ai' && !history[i].isRecalled && !history[i].id?.startsWith(baseMsgId)) {
                           history[i] = { ...history[i], isRecalled: true, originalText: history[i].text, text: `[${activeChar.name}撤回了一条消息: "${history[i].text}"]` };
                           break;
                         }
                       }
                    }
                    
                    const filteredHistory = history.filter(m => !m.id?.startsWith(baseMsgId));
                    
                    const newMsgs = parts.length > 0 ? parts.map((part, idx) => ({
                      id: `${baseMsgId}-${idx}`,
                      role: 'ai',
                      text: part,
                      timestamp: Date.now(),
                      quote: idx === 0 ? quote : undefined
                    })) : [{ id: `${baseMsgId}-0`, role: 'ai', text: '...', timestamp: Date.now() }];
                    
                    return { ...prev, [selectedChatId]: [...filteredHistory, ...newMsgs] };
                  });
                  
                  if (isRecalling) hasRecalled = true;
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
        [selectedChatId!]: hist.map((m: any, i: number) => m.id === msgId || (!m.id && `${i}` === msgId) ? { ...m, isRecalled: true, originalText: m.text, text: `[${m.role === 'user' ? '你' : activeChar?.name}撤回了一条消息: "${m.text}"]` } : m)
      };
    });
  };

  const handleDelete = (msgId: string) => {
    setContextMenu(null);
    updateState('chatHistories', (prev: any) => {
      const hist = prev[selectedChatId!] || [];
      return {
        ...prev,
        [selectedChatId!]: hist.filter((m: any, i: number) => m.id !== msgId && (!m.id ? `${i}` !== msgId : true))
      };
    });
  };

  const handleTranslate = async (msgId: string) => {
    setContextMenu(null);
    const msg = chatHistory.find((m: any, i: number) => m.id === msgId || (!m.id && `${i}` === msgId));
    if (!msg || !msg.text) return;
    
    updateState('chatHistories', (prev: any) => {
      const hist = prev[selectedChatId!] || [];
      return {
        ...prev,
        [selectedChatId!]: hist.map((m: any, i: number) => m.id === msgId || (!m.id && `${i}` === msgId) ? { ...m, isTranslating: true } : m)
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
          [selectedChatId!]: hist.map((m: any, i: number) => m.id === msgId || (!m.id && `${i}` === msgId) ? { ...m, translation, isTranslating: false } : m)
        };
      });
    } catch (err) {
      updateState('chatHistories', (prev: any) => {
        const hist = prev[selectedChatId!] || [];
        return {
          ...prev,
          [selectedChatId!]: hist.map((m: any, i: number) => m.id === msgId || (!m.id && `${i}` === msgId) ? { ...m, translation: '翻译失败', isTranslating: false } : m)
        };
      });
    }
  };

  const handleInnerVoice = async (msgId: string) => {
    setContextMenu(null);
    updateState('chatHistories', (prev: any) => {
      const hist = prev[selectedChatId!] || [];
      return {
        ...prev,
        [selectedChatId!]: hist.map((m: any, i: number) => m.id === msgId || (!m.id && `${i}` === msgId) ? { ...m, isGeneratingInnerVoice: true } : m)
      };
    });
    
    setTimeout(() => {
      updateState('chatHistories', (prev: any) => {
        const hist = prev[selectedChatId!] || [];
        return {
          ...prev,
          [selectedChatId!]: hist.map((m: any, i: number) => m.id === msgId || (!m.id && `${i}` === msgId) ? { ...m, innerVoice: '（其实我心里是这么想的...）', isGeneratingInnerVoice: false } : m)
        };
      });
    }, 1500);
  };

  const saveEdit = () => {
    if (!editModal) return;
    updateState('chatHistories', (prev: any) => {
      const hist = prev[selectedChatId!] || [];
      return {
        ...prev,
        [selectedChatId!]: hist.map((m: any, i: number) => m.id === editModal.msgId || (!m.id && `${i}` === editModal.msgId) ? { ...m, text: editModal.text } : m)
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
          {chatHistory.map((msg, idx) => {
            if (msg.isRecalled) {
              return (
                <div key={msg.id || idx} id={`msg-${msg.id || idx}`} className="flex justify-center my-2">
                  <span className="text-xs text-gray-400 bg-black/5 px-3 py-1 rounded-full max-w-[80%] text-center break-words">
                    {msg.text}
                  </span>
                </div>
              );
            }
            return (
            <motion.div 
              key={msg.id || idx}
              id={`msg-${msg.id || idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex items-start gap-3",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              {isMultiSelecting && (
                <div 
                  className="shrink-0 flex items-center justify-center pt-2 cursor-pointer"
                  onClick={() => {
                    const msgId = msg.id || `${idx}`;
                    setSelectedMessages(prev => prev.includes(msgId) ? prev.filter(id => id !== msgId) : [...prev, msgId]);
                  }}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    selectedMessages.includes(msg.id || `${idx}`) ? "bg-green-500 border-green-500" : "border-gray-300"
                  )}>
                    {selectedMessages.includes(msg.id || `${idx}`) && <CheckSquare className="w-3 h-3 text-white" />}
                  </div>
                </div>
              )}
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
                  className="shadow-sm relative z-10 px-3 py-1.5 cursor-pointer select-none"
                  style={{
                    WebkitUserSelect: 'none',
                    backgroundColor: msg.type === 'text-photo' ? 'transparent' : hexToRgba(msg.role === 'user' ? chatSettings.myBubbleColor : chatSettings.otherBubbleColor, chatSettings.bubbleOpacity),
                    color: chatSettings.fontColor,
                    fontSize: `${chatSettings.bubbleFontSize}px`,
                    borderRadius: msg.type === 'text-photo' ? '0' : `${chatSettings.bubbleRadius}px`,
                    boxShadow: msg.type === 'text-photo' ? 'none' : undefined,
                    padding: msg.type === 'text-photo' ? '0' : undefined
                  }}
                  onPointerDown={(e) => handlePointerDown(e, msg.id || `${idx}`, msg.role === 'user')}
                  onPointerUp={handlePointerUpOrLeave}
                  onPointerLeave={handlePointerUpOrLeave}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {/* Bubble Tail */}
                  {msg.type !== 'text-photo' && (
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent z-0"
                      style={{
                        [msg.role === 'user' ? 'right' : 'left']: '-5px',
                        [msg.role === 'user' ? 'borderLeftWidth' : 'borderRightWidth']: '6px',
                        [msg.role === 'user' ? 'borderLeftColor' : 'borderRightColor']: hexToRgba(msg.role === 'user' ? chatSettings.myBubbleColor : chatSettings.otherBubbleColor, chatSettings.bubbleOpacity),
                      }}
                    />
                  )}
                  
                  {msg.type === 'text-photo' ? (
                    <TextPhotoBubble text={msg.text} isUser={msg.role === 'user'} chatSettings={chatSettings} />
                  ) : (
                    <div className="relative z-10 break-words whitespace-pre-wrap leading-relaxed">
                      {msg.quote && (
                        <div 
                          className="bg-black/5 rounded p-2 mb-1.5 opacity-80 border-l-2 border-black/20 flex flex-col gap-0.5 cursor-pointer hover:bg-black/10 transition-colors"
                          style={{ fontSize: '0.85em' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (msg.quote.id) {
                              const el = document.getElementById(`msg-${msg.quote.id}`);
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }}
                        >
                          <div className="flex items-center justify-between opacity-70 mb-0.5">
                            <div className="flex items-center gap-1.5">
                              <span>{msg.quote.senderName || (msg.quote.role === 'user' ? '你' : activeChar.name)}</span>
                              {msg.quote.timestamp && <span className="text-[0.85em]">{new Date(msg.quote.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                            </div>
                            <CornerRightUp className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate max-w-full">{msg.quote.text}</div>
                        </div>
                      )}
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
                      {msg.isGeneratingInnerVoice && (
                        <div className="mt-2 pt-2 border-t border-black/10 text-gray-400 italic flex items-center gap-1" style={{ fontSize: '0.85em' }}>
                          <RefreshCw className="w-3 h-3 animate-spin" /> 正在倾听心声...
                        </div>
                      )}
                      {msg.innerVoice && (
                        <div className="mt-2 pt-2 border-t border-black/10 text-gray-400 italic flex items-start gap-1" style={{ fontSize: '0.85em' }}>
                          <MessageCircleHeart className="w-3 h-3 mt-0.5 shrink-0" />
                          <span>{msg.innerVoice}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )})}
        </div>

        {/* Chat Input */}
        {!isMultiSelecting ? (
          <div className="flex flex-col shrink-0 relative z-20">
            {replyingTo && (
              <div className="px-4 py-2 bg-gray-50/90 backdrop-blur-sm border-t flex items-center justify-between text-xs text-gray-500">
                <div className="truncate flex-1">
                  回复 {replyingTo.role === 'user' ? '你' : activeChar.name}: {replyingTo.text}
                </div>
                <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-black/5 rounded-full"><X className="w-4 h-4" /></button>
              </div>
            )}
            <div 
              className="p-4 border-t flex items-center gap-3"
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
              <Plus className={cn("w-6 h-6 opacity-70 transition-transform", showPlusMenu && "rotate-45")} />
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
          </div>
        ) : (
          <div className="flex items-center justify-around p-4 bg-gray-50/90 backdrop-blur-md border-t shrink-0 relative z-20">
            <button onClick={() => { alert("转发功能开发中..."); setIsMultiSelecting(false); setSelectedMessages([]); }} className="flex flex-col items-center gap-1 text-gray-600">
              <Forward className="w-6 h-6" />
              <span className="text-xs">转发</span>
            </button>
            <button onClick={() => { alert("已收藏"); setIsMultiSelecting(false); setSelectedMessages([]); }} className="flex flex-col items-center gap-1 text-gray-600">
              <Star className="w-6 h-6" />
              <span className="text-xs">收藏</span>
            </button>
            <button onClick={() => {
              updateState('chatHistories', (prev: any) => {
                const hist = prev[selectedChatId!] || [];
                return {
                  ...prev,
                  [selectedChatId!]: hist.filter((m: any, i: number) => !selectedMessages.includes(m.id || `${i}`))
                };
              });
              setIsMultiSelecting(false);
              setSelectedMessages([]);
            }} className="flex flex-col items-center gap-1 text-red-500">
              <Trash2 className="w-6 h-6" />
              <span className="text-xs">删除</span>
            </button>
            <button onClick={() => { setIsMultiSelecting(false); setSelectedMessages([]); }} className="flex flex-col items-center gap-1 text-gray-600">
              <X className="w-6 h-6" />
              <span className="text-xs">取消</span>
            </button>
          </div>
        )}

        {/* Plus Menu Panel */}
        <AnimatePresence>
          {showPlusMenu && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="shrink-0 border-t overflow-hidden bg-gray-50/90 backdrop-blur-md relative z-10"
              style={{ borderColor: `${chatSettings.fontColor}1a` }}
            >
              <div className="p-6 grid grid-cols-4 gap-y-6 gap-x-4">
                {[
                  { icon: RefreshCw, label: '重回', onClick: handleRegenerate },
                  { icon: ImageIcon, label: '照片', onClick: () => setPhotoModal('choose') },
                  { icon: Camera, label: '拍摄', onClick: () => {} },
                  { icon: Video, label: '视频通话', onClick: () => { setShowPlusMenu(false); setCallChooseModal(true); } },
                  { icon: MapPin, label: '位置', onClick: () => {} },
                  { icon: Wallet, label: '红包', onClick: () => {} },
                  { icon: Gift, label: '礼物', onClick: () => {} },
                  { icon: ArrowRightLeft, label: '转账', onClick: () => {} },
                  { icon: Star, label: '收藏', onClick: () => {} },
                  { icon: UserSquare, label: '个人名片', onClick: () => {} },
                  { icon: File, label: '文件', onClick: () => {} },
                  { icon: Music, label: '音乐', onClick: () => {} },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={item.onClick}>
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-gray-100 transition-colors">
                      <item.icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <span className="text-[11px] text-gray-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Context Menu */}
        {contextMenu && (
          <>
            <div className="fixed inset-0 z-[80]" onClick={() => setContextMenu(null)} onContextMenu={(e) => {e.preventDefault(); setContextMenu(null);}} />
            <div 
              className="fixed z-[90] bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-2 w-64"
              style={{ 
                left: Math.max(10, Math.min(contextMenu.x - 120, window.innerWidth - 260)), 
                top: Math.max(10, contextMenu.y - 140) 
              }}
            >
              <div className="grid grid-cols-4 gap-2">
                <button onClick={() => { alert("转发功能开发中..."); setContextMenu(null); }} className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-black/5 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center"><Forward className="w-5 h-5 text-gray-700"/></div>
                  <span className="text-[10px] text-gray-600">转发</span>
                </button>
                <button onClick={() => { alert("已收藏"); setContextMenu(null); }} className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-black/5 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center"><Star className="w-5 h-5 text-gray-700"/></div>
                  <span className="text-[10px] text-gray-600">收藏</span>
                </button>
                <button onClick={() => { 
                  setIsMultiSelecting(true); 
                  setSelectedMessages([contextMenu.msgId]); 
                  setContextMenu(null); 
                }} className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-black/5 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center"><CheckSquare className="w-5 h-5 text-gray-700"/></div>
                  <span className="text-[10px] text-gray-600">多选</span>
                </button>
                <button onClick={() => { 
                  const msg = chatHistory.find((m:any, i:number) => m.id === contextMenu.msgId || (!m.id && `${i}` === contextMenu.msgId));
                  if (msg) setReplyingTo({ id: msg.id, text: msg.text, role: msg.role, timestamp: msg.timestamp });
                  setContextMenu(null); 
                }} className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-black/5 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center"><Quote className="w-5 h-5 text-gray-700"/></div>
                  <span className="text-[10px] text-gray-600">引用</span>
                </button>
                <button onClick={() => handleInnerVoice(contextMenu.msgId)} className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-black/5 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center"><MessageCircleHeart className="w-5 h-5 text-gray-700"/></div>
                  <span className="text-[10px] text-gray-600">心声</span>
                </button>
                <button onClick={() => handleRecall(contextMenu.msgId)} className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-black/5 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center"><Undo2 className="w-5 h-5 text-gray-700"/></div>
                  <span className="text-[10px] text-gray-600">撤回</span>
                </button>
                <button onClick={() => handleTranslate(contextMenu.msgId)} className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-black/5 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center"><Languages className="w-5 h-5 text-gray-700"/></div>
                  <span className="text-[10px] text-gray-600">翻译</span>
                </button>
                <button onClick={() => handleDelete(contextMenu.msgId)} className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-black/5 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center"><Trash2 className="w-5 h-5 text-red-500"/></div>
                  <span className="text-[10px] text-gray-600">删除</span>
                </button>
              </div>
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

        {/* Photo Modal */}
        {photoModal !== 'none' && (
          <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-4">
              {photoModal === 'choose' ? (
                <>
                  <h3 className="font-bold mb-4 text-center">选择照片类型</h3>
                  <div className="space-y-3">
                    <button 
                      className="w-full py-3 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      onClick={() => {
                        alert("真实照片上传功能开发中...");
                        setPhotoModal('none');
                      }}
                    >
                      发送真实照片
                    </button>
                    <button 
                      className="w-full py-3 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                      onClick={() => setPhotoModal('text-photo-input')}
                    >
                      发送文字描述照片
                    </button>
                    <button 
                      className="w-full py-3 text-gray-500 text-sm font-medium"
                      onClick={() => setPhotoModal('none')}
                    >
                      取消
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-bold mb-4">输入照片描述</h3>
                  <textarea 
                    value={textPhotoInput}
                    onChange={(e) => setTextPhotoInput(e.target.value)}
                    placeholder="描述这张照片的内容..."
                    className="w-full h-32 border rounded-lg p-2 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setPhotoModal('choose')} className="px-4 py-2 text-sm text-gray-500">返回</button>
                    <button onClick={handleSendTextPhoto} className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg">发送</button>
                  </div>
                </>
              )}
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

        {/* Call Choose Modal */}
        <AnimatePresence>
          {callChooseModal && (
            <div className="fixed inset-0 z-[100] bg-black/50 flex items-end justify-center" onClick={() => setCallChooseModal(false)}>
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white w-full rounded-t-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  className="w-full py-4 border-b text-center text-lg active:bg-gray-50"
                  onClick={() => { setCallChooseModal(false); setCallState({ isActive: true, type: 'video', status: 'dialing', isMuted: false, isSpeaker: true, transcript: [] }); }}
                >
                  视频通话
                </button>
                <button 
                  className="w-full py-4 border-b text-center text-lg active:bg-gray-50"
                  onClick={() => { setCallChooseModal(false); setCallState({ isActive: true, type: 'voice', status: 'dialing', isMuted: false, isSpeaker: false, transcript: [] }); }}
                >
                  语音通话
                </button>
                <div className="h-2 bg-gray-100" />
                <button 
                  className="w-full py-4 text-center text-lg active:bg-gray-50"
                  onClick={() => setCallChooseModal(false)}
                >
                  取消
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Call UI */}
        <AnimatePresence>
          {callState?.isActive && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[110] bg-[#1a1a1a] flex flex-col text-white"
            >
              {/* Background for Voice Call */}
              {callState.type === 'voice' && (
                <div className="absolute inset-0 z-0 opacity-20">
                  <img src={activeChar.avatar} className="w-full h-full object-cover blur-xl" alt="" />
                </div>
              )}

              {/* Video Call Layout */}
              {callState.type === 'video' && callState.status === 'connected' && (
                <div className="absolute inset-0 z-0 flex flex-col">
                  <div className="flex-1 relative bg-black">
                    <img src={activeChar.avatar} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="absolute top-12 right-4 w-24 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 z-10 shadow-lg">
                    <img src={appState.currentUser?.avatar || "https://picsum.photos/seed/user/100/100"} className="w-full h-full object-cover" alt="" />
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="relative z-10 pt-16 px-6 flex flex-col items-center">
                {callState.type === 'voice' && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden mb-4 shadow-2xl">
                    <img src={activeChar.avatar} className="w-full h-full object-cover" alt="" />
                  </div>
                )}
                <h2 className="text-2xl font-medium drop-shadow-md">{activeChar.name}</h2>
                <p className="text-sm opacity-70 mt-2 drop-shadow-md">
                  {callState.status === 'dialing' ? '正在等待对方接受邀请...' : '00:00'}
                </p>
              </div>

              {/* Transcript Area */}
              <div className="flex-1 relative z-10 overflow-y-auto p-4 flex flex-col gap-4 mt-8 scrollbar-hide">
                {callState.transcript.map(msg => (
                  <div key={msg.id} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm", msg.role === 'user' ? "bg-green-500/90 text-white" : "bg-white/20 text-white backdrop-blur-md")}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="relative z-10 pb-12 px-8 pt-4 bg-gradient-to-t from-black/80 to-transparent">
                {callState.status === 'connected' && (
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full p-1 mb-8 border border-white/10">
                    <input 
                      type="text"
                      value={callInputText}
                      onChange={(e) => setCallInputText(e.target.value)}
                      placeholder="发送文字..."
                      className="flex-1 bg-transparent border-none focus:outline-none px-4 text-sm text-white placeholder-white/50"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && callInputText.trim()) {
                          const newMsg = { id: Date.now().toString(), role: 'user' as const, text: callInputText };
                          setCallState(prev => prev ? { ...prev, transcript: [...prev.transcript, newMsg] } : null);
                          setCallInputText('');
                          // Trigger AI response for call
                          setTimeout(() => {
                             setCallState(prev => prev ? { ...prev, transcript: [...prev.transcript, { id: Date.now().toString(), role: 'ai', text: '（语音回复模拟中...）' }] } : null);
                          }, 1000);
                        }
                      }}
                    />
                    <button 
                      className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0 disabled:opacity-50"
                      disabled={!callInputText.trim()}
                      onClick={() => {
                        if (callInputText.trim()) {
                          const newMsg = { id: Date.now().toString(), role: 'user' as const, text: callInputText };
                          setCallState(prev => prev ? { ...prev, transcript: [...prev.transcript, newMsg] } : null);
                          setCallInputText('');
                          setTimeout(() => {
                             setCallState(prev => prev ? { ...prev, transcript: [...prev.transcript, { id: Date.now().toString(), role: 'ai', text: '（语音回复模拟中...）' }] } : null);
                          }, 1000);
                        }
                      }}
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center px-4">
                  <button 
                    className={cn("flex flex-col items-center gap-2 transition-opacity", callState.isMuted ? "text-white" : "text-white/70")}
                    onClick={() => setCallState(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null)}
                  >
                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-colors", callState.isMuted ? "bg-white/20" : "bg-black/30")}>
                      <Mic className="w-6 h-6" />
                    </div>
                    <span className="text-xs">静音</span>
                  </button>

                  <button 
                    className="flex flex-col items-center gap-2 text-red-500 hover:opacity-80 transition-opacity"
                    onClick={() => setCallState(null)}
                  >
                    <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                      <div className="w-8 h-3 bg-white rounded-full rotate-[135deg]" />
                    </div>
                    <span className="text-xs text-white/70">挂断</span>
                  </button>

                  <button 
                    className={cn("flex flex-col items-center gap-2 transition-opacity", callState.isSpeaker ? "text-white" : "text-white/70")}
                    onClick={() => setCallState(prev => prev ? { ...prev, isSpeaker: !prev.isSpeaker } : null)}
                  >
                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-colors", callState.isSpeaker ? "bg-white/20" : "bg-black/30")}>
                      <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-current rounded-full" />
                      </div>
                    </div>
                    <span className="text-xs">免提</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
