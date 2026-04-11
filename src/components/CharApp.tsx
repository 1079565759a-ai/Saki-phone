import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { 
  ChevronLeft, 
  Plus, 
  X, 
  Camera, 
  Check,
  User,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Star,
  Upload,
  FileText,
  Type,
  MoreVertical,
  Download,
  Settings as SettingsIcon,
  Share2,
  Copy,
  FileJson,
  Image as ImageLucide,
  Key,
  RefreshCw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '../utils/cn';
import { compressImage } from '../utils/image';

export interface CharCharacter {
  id: string;
  name: string;
  gender: string;
  age: string;
  birthday: string;
  persona: string; // Combined character details
  openingMessages: string[];
  avatar: string;
  backgroundImage: string;
  isPinned: boolean;
  // New fields
  wechatId: string;
  autoAddUser: boolean;
  addRequestMsg: string;
  isFriendApproved: boolean;
}

interface CharAppProps {
  onClose: () => void;
  appState: any;
  updateState: (key: string, value: any) => void;
  setIsChatOpen: (v: boolean) => void;
  isFullscreen?: boolean;
}

type ViewMode = 'list' | 'edit' | 'detail' | 'settings';

export default function CharApp({ onClose, appState, updateState, setIsChatOpen, isFullscreen }: CharAppProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingChar, setEditingChar] = useState<CharCharacter | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const characters: CharCharacter[] = appState.charCharacters || [];

  const handleSave = (char: CharCharacter) => {
    let updatedChars;
    const existingIndex = characters.findIndex(c => c.id === char.id);
    if (existingIndex >= 0) {
      updatedChars = characters.map(c => c.id === char.id ? char : c);
    } else {
      updatedChars = [...characters, char];
    }
    updateState('charCharacters', updatedChars);
    setViewMode('list');
    setEditingChar(null);
  };

  const handleDelete = (id: string) => {
    const updatedChars = characters.filter(c => c.id !== id);
    updateState('charCharacters', updatedChars);
    setShowDeleteConfirm(null);
  };

  const handleTogglePin = (id: string) => {
    const updatedChars = characters.map(c => 
      c.id === id ? { ...c, isPinned: !c.isPinned } : c
    );
    updateState('charCharacters', updatedChars);
  };

  const handleAddClick = () => {
    const newChar: CharCharacter = {
      id: `char-${Date.now()}`,
      name: '',
      gender: '',
      age: '',
      birthday: '',
      persona: '',
      openingMessages: [''],
      avatar: '',
      backgroundImage: '',
      isPinned: false,
      wechatId: `wxid_${Math.random().toString(36).substr(2, 8)}`,
      autoAddUser: false,
      addRequestMsg: '你好，我是...',
      isFriendApproved: false
    };
    setEditingChar(newChar);
    setViewMode('edit');
  };

  const handleEditClick = (char: CharCharacter) => {
    setEditingChar(char);
    setViewMode('edit');
  };

  const sortedChars = [...characters].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const handleSelectChar = (char: CharCharacter) => {
    updateState('selectedCharId', char.id);
    updateState('chatAiName', char.name);
    updateState('chatAiAvatar', char.avatar);
    updateState('chatStatus', 'Online');
    
    // Construct system prompt from character data
    const systemPrompt = `
# 角色设定
姓名：${char.name}
性别：${char.gender}
年龄：${char.age}

# 详细设定
${char.persona}
`.trim();
    
    updateState('systemPrompt', systemPrompt);
    
    // Set opening messages for the chat app to pick up
    updateState('chatAiOpeningMessages', char.openingMessages);
    
    setIsChatOpen(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "absolute inset-0 z-30 bg-[#F5F5F5] flex flex-col overflow-hidden font-sans",
        isFullscreen && "rounded-none"
      )}
    >
      {/* Stars Background Decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute text-gray-400"
            style={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 10 + 5}px`
            }}
          >
            ✦
          </div>
        ))}
      </div>

      {/* Custom CSS Injection */}
      <style dangerouslySetInnerHTML={{ __html: appState.charCustomCSS }} />

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <ListView 
            key="list"
            characters={sortedChars}
            onClose={onClose}
            onAdd={handleAddClick}
            onEdit={handleEditClick}
            onDelete={setShowDeleteConfirm}
            onTogglePin={handleTogglePin}
            onReorder={(newOrder: CharCharacter[]) => updateState('charCharacters', newOrder)}
            setViewMode={setViewMode}
            onSelect={(char: CharCharacter) => {
              setEditingChar(char);
              setViewMode('detail');
            }}
          />
        ) : viewMode === 'detail' ? (
          <motion.div key="detail" className="h-full">
            <DetailView 
              character={editingChar!}
              onBack={() => setViewMode('list')}
              onEdit={() => setViewMode('edit')}
              onSelect={handleSelectChar}
            />
          </motion.div>
        ) : viewMode === 'settings' ? (
          <motion.div key="settings" className="h-full">
            <SettingsView 
              appState={appState}
              updateState={updateState}
              onBack={() => setViewMode('list')}
            />
          </motion.div>
        ) : (
          <div key="edit" className="h-full">
            <EditView 
              character={editingChar!}
              onSave={handleSave}
              onCancel={() => setViewMode('list')}
              setViewMode={setViewMode}
              onAdd={handleAddClick}
              appState={appState}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-xs text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">确认删除？</h3>
              <p className="text-sm text-gray-400 mb-8">删除后角色数据将无法找回哦</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 h-12 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm"
                >
                  取消
                </button>
                <button 
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 h-12 bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200"
                >
                  删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ListView({ characters, onClose, onAdd, onEdit, onDelete, onTogglePin, onReorder, setViewMode, onSelect }: any) {
  return (
    <div className="flex flex-col h-full relative z-10 overflow-hidden">
      {/* Header */}
      <div className="pt-12 pb-4 px-6 flex items-center justify-between bg-[#F5F5F5]/80 backdrop-blur-md sticky top-0 z-30">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <h1 className="text-xl font-serif font-medium text-gray-800 tracking-tight">Characters</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('settings')} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
            <SettingsIcon className="w-6 h-6" />
          </button>
          <button onClick={onAdd} className="p-2 -mr-2 text-gray-400 hover:text-gray-900 transition-colors">
            <Plus className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-12 scrollbar-hide">
        {characters.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
            <div className="w-40 h-40 flex flex-col items-center justify-center relative">
              <div className="w-24 h-32 border-2 border-white/60 rounded-xl relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full border-2 border-white/60 flex items-center justify-center bg-white/10">
                  <Plus className="w-6 h-6 text-white/60" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-light text-white/80 tracking-widest">與他會面.</h3>
              <button 
                onClick={onAdd}
                className="px-8 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-sm font-medium hover:bg-white/30 transition-all"
              >
                新建角色卡
              </button>
            </div>
          </div>
        ) : (
          <Reorder.Group 
            axis="y" 
            values={characters} 
            onReorder={onReorder}
            className="grid grid-cols-2 gap-x-4 gap-y-12 pt-8"
          >
            {characters.map((char: CharCharacter) => (
              <Reorder.Item 
                key={char.id} 
                value={char}
                className="relative"
              >
                {/* Protruding Avatar */}
                <div className="absolute -top-6 left-4 w-14 h-14 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-50 z-20 pointer-events-none">
                  {char.avatar ? (
                    <img src={char.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* About me bubble */}
                <div className="absolute -top-4 left-20 z-20">
                  <div className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-lg text-[8px] font-bold text-gray-400 shadow-sm border border-white/40">
                    About me
                  </div>
                </div>

                <div 
                  onClick={() => onSelect(char)}
                  className="char-card bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl relative group cursor-pointer aspect-[3/4] rounded-[2.5rem] overflow-hidden transition-all hover:scale-[1.02]"
                >
                  {/* Background Image (Edges only) */}
                  {char.backgroundImage && (
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
                      <div className="h-1/3 w-full overflow-hidden">
                        <img src={char.backgroundImage} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1" />
                      <div className="h-1/3 w-full overflow-hidden">
                        <img src={char.backgroundImage} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                  {/* Card Actions (Bottom Right) */}
                  <div className="absolute bottom-4 right-4 flex gap-2 z-30">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onTogglePin(char.id); }}
                      className={cn(
                        "w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-md border border-white/20 transition-all",
                        char.isPinned ? "bg-yellow-400 text-white" : "bg-white/20 text-white"
                      )}
                    >
                      <Star className="w-3.5 h-3.5" fill={char.isPinned ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(char.id); }}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-red-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="absolute bottom-5 left-5 right-14 text-white pointer-events-none z-10">
                    <div className="text-sm font-bold truncate mb-1 tracking-tight">{char.name || "未命名"}</div>
                    <div className="text-[9px] opacity-80 truncate font-medium tracking-wider">ID: {char.wechatId}</div>
                  </div>
                </div>

                {/* QR Code below card */}
                <div className="mt-2 flex flex-col items-center">
                  <div className="p-1 bg-white/80 backdrop-blur-md rounded-lg shadow-sm border border-white/40">
                    <QRCodeSVG value={`wechat://add/${char.wechatId}`} size={40} />
                  </div>
                  <span className="text-[6px] text-gray-400 mt-1 font-bold tracking-tighter uppercase">SCAN TO ADD</span>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}

function DetailView({ character, onBack, onEdit, onSelect }: { character: CharCharacter, onBack: () => void, onEdit: () => void, onSelect: (c: CharCharacter) => void }) {
  return (
    <div className="detail-view flex flex-col h-full bg-[#F5F5F5] relative z-10 overflow-hidden">
      {/* Header */}
      <div className="pt-12 pb-4 px-6 flex items-center justify-between sticky top-0 z-30 bg-transparent">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <div className="text-sm font-serif font-bold text-gray-400 tracking-widest uppercase">Character Detail</div>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 scrollbar-hide">
        <div className="relative pt-20">
          <div className="bg-white/40 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-[3rem] relative overflow-hidden">
            {/* Background Image */}
            <div className="h-72 w-full relative">
              {character.backgroundImage ? (
                <img src={character.backgroundImage} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-gray-100/50" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
            </div>

            <div className="p-10 pt-16 relative">
              {/* Avatar */}
              <div className="absolute -top-20 left-10 w-36 h-36 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-50 z-30">
                {character.avatar ? (
                  <img src={character.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <User className="w-16 h-16" />
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">{character.name}</h2>
                  <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest">WXID: {character.wechatId}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/40">
                    <span className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-widest">Gender</span>
                    <span className="text-sm font-bold text-gray-700">{character.gender || "Unknown"}</span>
                  </div>
                  <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/40">
                    <span className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-widest">Age</span>
                    <span className="text-sm font-bold text-gray-700">{character.age || "Unknown"}</span>
                  </div>
                </div>

                <div className="bg-white/50 backdrop-blur-md p-6 rounded-[2rem] border border-white/40">
                  <span className="text-[10px] font-bold text-gray-400 block mb-3 uppercase tracking-widest">Persona</span>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">{character.persona || "No persona info"}</p>
                </div>
              </div>

              <div className="mt-12 flex flex-col items-center gap-4">
                <div className="p-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/40">
                  <QRCodeSVG value={`wechat://add/${character.wechatId}`} size={120} />
                </div>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">SCAN TO ADD ON WECHAT</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F5F5F5] via-[#F5F5F5] to-transparent z-40 flex gap-4">
        <button 
          onClick={onEdit}
          className="flex-1 h-16 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Edit2 className="w-5 h-5" /> 修改信息
        </button>
        <button 
          onClick={() => onSelect(character)}
          className="flex-1 h-16 bg-gray-900 text-white rounded-xl font-bold shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          开始聊天
        </button>
      </div>
    </div>
  );
}

function SettingsView({ appState, updateState, onBack }: { appState: any, updateState: (k: string, v: any) => void, onBack: () => void }) {
  const [cssInput, setCssInput] = useState(appState.charCustomCSS);
  const [baseUrl, setBaseUrl] = useState(appState.apiBaseUrl || 'https://api.gemai.cc');
  const [apiKey, setApiKey] = useState(appState.apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(appState.availableModels?.length > 0 ? `已加载 ${appState.availableModels.length} 个模型` : '未连接');
  const [manualModel, setManualModel] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (appState.apiBaseUrl && appState.apiKey && (!appState.availableModels || appState.availableModels.length === 0)) {
      fetchModels(appState.apiBaseUrl, appState.apiKey);
    }
  }, []);

  const handleExport = (type: 'text' | 'file' | 'sakura' | 'image') => {
    const data = JSON.stringify(appState.charCharacters, null, 2);
    if (type === 'text') {
      navigator.clipboard.writeText(data);
      alert('角色数据已复制到剪贴板');
    } else if (type === 'file' || type === 'sakura') {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'sakura' ? 'sakura_cards.json' : 'characters_export.json';
      a.click();
    } else if (type === 'image') {
      alert('图片导出功能正在生成中... (模拟生成)');
    }
  };

  const fetchModels = async (url: string, key: string) => {
    setIsTesting(true);
    setStatusMsg('正在拉取模型列表...');
    
    const endpoints = [
      url.endsWith('/') ? `${url}models` : `${url}/models`,
      url.endsWith('/') ? `${url}v1/models` : `${url}/v1/models`,
      url.includes('/v1') ? url.replace('/v1', '/v1beta') + '/models' : url + '/v1beta/models',
    ];

    let success = false;
    let models: string[] = [];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            models = data.data.map((m: any) => m.id);
            success = true;
            break;
          }
        }
      } catch (err) {
        console.error(`Failed to fetch from ${endpoint}`, err);
      }
    }

    if (success) {
      const uniqueModels = Array.from(new Set([...models, 'manual']));
      updateState('availableModels', uniqueModels);
      if (models.length > 0 && (!appState.selectedModel || !uniqueModels.includes(appState.selectedModel))) {
        updateState('selectedModel', models[0]);
      }
      setStatusMsg(`成功！已加载 ${models.length} 个模型`);
    } else {
      setStatusMsg('拉取失败，请检查地址和 Key');
      updateState('availableModels', ['manual']);
      updateState('selectedModel', 'manual');
    }
    setIsTesting(false);
  };

  const handleSaveConfig = () => {
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      alert('API 地址必须以 http:// 或 https:// 开头');
      return;
    }
    updateState('apiBaseUrl', baseUrl);
    updateState('apiKey', apiKey);
    alert('配置已保存');
    fetchModels(baseUrl, apiKey);
  };

  return (
    <div className="flex flex-col h-full bg-white relative z-10 overflow-hidden">
      <div className="pt-12 pb-4 px-6 flex items-center justify-between border-b border-gray-50">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <h2 className="text-lg font-bold text-gray-800">设置</h2>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        {/* API Settings Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">API 设置</h3>
          <div className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 ml-1">API 地址</label>
              <input 
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.gemai.cc"
                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-400 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 ml-1">API Key</label>
              <div className="relative">
                <input 
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-400 transition-colors pr-10"
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600"
                >
                  {showKey ? <X className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 ml-1">选择模型</label>
              <select 
                value={appState.selectedModel}
                onChange={(e) => updateState('selectedModel', e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-400 transition-colors appearance-none"
              >
                {appState.availableModels?.length > 0 ? (
                  appState.availableModels.map((m: string) => (
                    <option key={m} value={m}>{m === 'manual' ? '手动输入' : m}</option>
                  ))
                ) : (
                  <option value="">点击测试连接后加载模型</option>
                )}
              </select>
            </div>

            {appState.selectedModel === 'manual' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 ml-1">手动输入模型名</label>
                <input 
                  type="text"
                  value={manualModel}
                  onChange={(e) => setManualModel(e.target.value)}
                  onBlur={() => {
                    if (manualModel) {
                      updateState('availableModels', [...(appState.availableModels || []).filter((m: string) => m !== 'manual'), manualModel, 'manual']);
                      updateState('selectedModel', manualModel);
                    }
                  }}
                  placeholder="例如: gpt-4-turbo"
                  className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-400 transition-colors"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className={cn(
                "text-[10px] font-bold",
                statusMsg.includes('成功') ? "text-green-500" : "text-gray-400"
              )}>
                {statusMsg}
              </span>
              <button 
                onClick={() => fetchModels(baseUrl, apiKey)}
                className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-1"
                disabled={isTesting}
              >
                <RefreshCw className={cn("w-3 h-3", isTesting && "animate-spin")} />
                重新拉取模型
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => fetchModels(baseUrl, apiKey)}
                className="py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                测试连接
              </button>
              <button 
                onClick={handleSaveConfig}
                className="py-3 bg-gray-900 text-white rounded-xl text-xs font-bold shadow-lg shadow-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                保存配置
              </button>
            </div>

            <button 
              onClick={() => {
                if (confirm('确定要清除所有 API 配置吗？')) {
                  setBaseUrl('https://api.gemai.cc');
                  setApiKey('');
                  updateState('apiBaseUrl', 'https://api.gemai.cc');
                  updateState('apiKey', '');
                  updateState('availableModels', []);
                  updateState('selectedModel', '');
                  setStatusMsg('配置已清除');
                }
              }}
              className="w-full py-2 text-[10px] font-bold text-red-400 hover:text-red-500 transition-colors"
            >
              清除配置
            </button>
          </div>
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] text-gray-400 leading-relaxed italic">
              * 提示：支持 OpenAI 格式接口。
            </p>
            <button 
              onClick={() => setShowHelp(true)}
              className="text-[10px] font-bold text-blue-500 hover:underline"
            >
              使用帮助
            </button>
          </div>
        </section>

        <AnimatePresence>
          {showHelp && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
              onClick={() => setShowHelp(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-4"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold text-gray-900">使用帮助</h3>
                <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
                  <p>1. <strong>API 地址</strong>：通常为网关地址，例如 <code className="bg-gray-100 px-1 rounded">https://api.gemai.cc</code>。</p>
                  <p>2. <strong>API Key</strong>：在服务商后台注册并申请。例如在 <code className="bg-gray-100 px-1 rounded">gemai.cc</code> 注册后获取。</p>
                  <p>3. <strong>测试连接</strong>：输入地址和 Key 后点击测试，系统会自动尝试拉取该网关支持的模型列表。</p>
                  <p>4. <strong>手动输入</strong>：如果自动拉取失败，可选择“手动输入”并填写具体的模型 ID（如 <code className="bg-gray-100 px-1 rounded">gpt-4-turbo</code>）。</p>
                </div>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm"
                >
                  我知道了
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">导出角色卡</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleExport('text')} className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2 hover:bg-gray-100 transition-colors">
              <Copy className="w-6 h-6 text-blue-500" />
              <span className="text-[10px] font-bold text-gray-600">文字导出</span>
            </button>
            <button onClick={() => handleExport('file')} className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2 hover:bg-gray-100 transition-colors">
              <FileJson className="w-6 h-6 text-green-500" />
              <span className="text-[10px] font-bold text-gray-600">文件导出</span>
            </button>
            <button onClick={() => handleExport('sakura')} className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2 hover:bg-gray-100 transition-colors">
              <Star className="w-6 h-6 text-pink-400" />
              <span className="text-[10px] font-bold text-gray-600">樱咲卡导出</span>
            </button>
            <button onClick={() => handleExport('image')} className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2 hover:bg-gray-100 transition-colors">
              <ImageLucide className="w-6 h-6 text-orange-400" />
              <span className="text-[10px] font-bold text-gray-600">图片导出</span>
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">美化框 (CSS)</h3>
            <button 
              onClick={() => updateState('charCustomCSS', cssInput)}
              className="text-[10px] font-bold text-blue-500 hover:underline"
            >
              应用修改
            </button>
          </div>
          <div className="bg-gray-900 rounded-2xl p-4 font-mono text-[10px] text-green-400 shadow-inner">
            <textarea 
              value={cssInput}
              onChange={(e) => setCssInput(e.target.value)}
              className="w-full bg-transparent outline-none resize-none min-h-[300px] leading-relaxed"
              spellCheck={false}
            />
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed italic">
            * 提示：CSS 修改将实时影响首页卡片、大图页及导出图片。
          </p>
        </section>
      </div>
    </div>
  );
}

function EditView({ character, onSave, onCancel, setViewMode, onAdd, appState }: { 
  character: CharCharacter, 
  onSave: (c: CharCharacter) => void,
  onCancel: () => void,
  setViewMode: (m: ViewMode) => void,
  onAdd: () => void,
  appState: any
}) {
  const [formData, setFormData] = useState(character);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const generateFriendRequest = async () => {
    if (!formData.persona) {
      alert('请先填写角色设定，以便生成匹配的申请消息');
      return;
    }

    setIsGenerating(true);
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
            { 
              role: 'system', 
              content: `你是一个角色卡设计助手。请根据以下角色设定，为该角色生成一条简短、优雅、符合其性格的微信好友申请消息。直接返回消息内容，不要有任何多余文字。
              
              角色设定：
              ${formData.persona}` 
            }
          ],
          stream: false
        })
      });

      if (!response.ok) throw new Error('生成失败');
      const data = await response.json();
      const msg = data.choices?.[0]?.message?.content?.trim();
      if (msg) {
        setFormData(prev => ({ ...prev, addRequestMsg: msg }));
      }
    } catch (err) {
      console.error('Generation failed', err);
      alert('生成失败，请检查 API 配置');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    const isChanged = JSON.stringify(formData) !== JSON.stringify(character);
    if (isChanged) {
      setShowDiscardConfirm(true);
    } else {
      onCancel();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'backgroundImage') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 1200, 0.6);
        setFormData(prev => ({ ...prev, [field]: compressed }));
      } catch (err) {
        console.error('Image upload failed', err);
      }
    }
  };

  const updateOpeningMsg = (index: number, val: string) => {
    const newMsgs = [...formData.openingMessages];
    newMsgs[index] = val;
    setFormData(prev => ({ ...prev, openingMessages: newMsgs }));
  };

  const addOpeningMsg = () => {
    if (formData.openingMessages.length < 10) {
      setFormData(prev => ({ ...prev, openingMessages: [...prev.openingMessages, ''] }));
    }
  };

  const removeOpeningMsg = (index: number) => {
    if (formData.openingMessages.length > 1) {
      const newMsgs = formData.openingMessages.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, openingMessages: newMsgs }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5] relative z-10 overflow-hidden">
      {/* Header */}
      <div className="pt-12 pb-4 px-6 flex items-center justify-between sticky top-0 z-30 bg-[#F5F5F5]/80 backdrop-blur-md">
        <button onClick={handleBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <div className="text-sm font-bold text-gray-400 tracking-widest uppercase">Edit Character</div>
        <button onClick={onAdd} className="p-2 -mr-2 text-gray-400 hover:text-gray-900 transition-colors">
          <Plus className="w-8 h-8" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 scrollbar-hide">
        <div className="space-y-8">
          {/* Irregular Card Header */}
          <div className="relative pt-16">
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-none relative">
              {/* Background Area (Only edges) */}
              <div 
                className="h-48 relative cursor-pointer group overflow-hidden"
                onClick={() => bgInputRef.current?.click()}
              >
                {formData.backgroundImage ? (
                  <div className="absolute inset-0 flex flex-col justify-between">
                    <div className="h-1/4 w-full overflow-hidden">
                      <img src={formData.backgroundImage} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 bg-transparent" />
                    <div className="h-1/4 w-full overflow-hidden">
                      <img src={formData.backgroundImage} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                    </div>
                    <div className="absolute inset-0 bg-white/5" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gray-50/30 flex items-center justify-center text-gray-300">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
                <input type="file" ref={bgInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'backgroundImage')} accept="image/*" />
              </div>

              <div className="p-10 pt-14 relative">
                {/* Avatar Circle (Protruding) */}
                <div 
                  className="absolute -top-14 left-10 w-28 h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-50 group cursor-pointer z-30"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {formData.avatar ? (
                    <img src={formData.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <User className="w-14 h-14" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera className="w-8 h-8" />
                  </div>
                  <input type="file" ref={avatarInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} accept="image/*" />
                </div>

                {/* About me bubble (Rounded Rectangle) */}
                <div className="ml-32 -mt-6 mb-10">
                  <div className="inline-block bg-white/80 backdrop-blur-md px-5 py-2 rounded-xl text-xs font-bold text-gray-400 shadow-md border border-white/40">
                    About me
                  </div>
                </div>

                {/* Form Sections */}
                <div className="space-y-12">
                  {/* Basic Info */}
                  <section className="space-y-8">
                    <div className="flex justify-center">
                      <div className="px-8 py-2.5 bg-white shadow-sm border border-gray-100 rounded-2xl text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest">Basic Info</div>
                    </div>
                    <div className="space-y-4">
                      <InputRow label="姓名" value={formData.name} onChange={v => setFormData(p => ({ ...p, name: v }))} placeholder="输入角色姓名" />
                      <InputRow label="性别" value={formData.gender} onChange={v => setFormData(p => ({ ...p, gender: v }))} placeholder="男 / 女 / 其他" />
                      <InputRow 
                        label="年龄" 
                        value={formData.age} 
                        onChange={v => {
                          if (/^\d*$/.test(v) && Number(v) <= 120) {
                            setFormData(p => ({ ...p, age: v }));
                          }
                        }} 
                        placeholder="1-120"
                      />
                      <InputRow 
                        label="生日" 
                        value={formData.birthday} 
                        onChange={v => setFormData(p => ({ ...p, birthday: v }))} 
                        type="date"
                      />
                      <InputRow label="微信号" value={formData.wechatId} onChange={v => setFormData(p => ({ ...p, wechatId: v }))} placeholder="唯一标识符" />
                    </div>
                  </section>

                  {/* WeChat Interaction Settings */}
                  <section className="space-y-8">
                    <div className="flex justify-center">
                      <div className="px-8 py-2.5 bg-white shadow-sm border border-gray-100 rounded-2xl text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest">WeChat Settings</div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between bg-white/60 backdrop-blur-md p-5 rounded-[2rem] border border-white/40 shadow-sm">
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-gray-700">由TA加你</div>
                          <div className="text-[10px] text-gray-400">开启后，角色会在微信主动向你发送好友申请</div>
                        </div>
                        <button 
                          onClick={() => setFormData(p => ({ ...p, autoAddUser: !p.autoAddUser }))}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            formData.autoAddUser ? "bg-green-500" : "bg-gray-200"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            formData.autoAddUser ? "right-1" : "left-1"
                          )} />
                        </button>
                      </div>
                      
                      {formData.autoAddUser && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">好友申请信息</label>
                            <button 
                              onClick={generateFriendRequest}
                              disabled={isGenerating}
                              className="text-[10px] font-bold text-blue-500 hover:text-blue-600 disabled:opacity-50 flex items-center gap-1"
                            >
                              {isGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                              AI 生成
                            </button>
                          </div>
                          <DetailBox 
                            title="" 
                            value={formData.addRequestMsg} 
                            onChange={v => setFormData(p => ({ ...p, addRequestMsg: v }))} 
                            singleLine 
                          />
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Detail Info */}
                  <section className="space-y-6">
                    <DetailBox title="Persona" value={formData.persona} onChange={v => setFormData(p => ({ ...p, persona: v }))} />
                  </section>

                  {/* Interaction */}
                  <section className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-start">
                        <div className="px-5 py-2 bg-white shadow-sm border border-gray-100 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest">Opening Messages</div>
                      </div>
                      <div className="space-y-3">
                        {formData.openingMessages.map((msg, i) => (
                          <div key={i} className="flex gap-2">
                            <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                              <input 
                                value={msg}
                                onChange={e => updateOpeningMsg(i, e.target.value)}
                                className="w-full bg-transparent outline-none text-sm text-gray-600"
                                placeholder={`消息 ${i + 1}`}
                              />
                            </div>
                            {formData.openingMessages.length > 1 && (
                              <button onClick={() => removeOpeningMsg(i)} className="p-3 text-gray-300 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                            )}
                          </div>
                        ))}
                        {formData.openingMessages.length < 10 && (
                          <button 
                            onClick={addOpeningMsg}
                            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-300 flex items-center justify-center hover:border-gray-300 hover:text-gray-400 transition-all"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F5F5F5] via-[#F5F5F5] to-transparent z-40">
        <button 
          onClick={() => {
            if (!formData.name.trim()) return;
            onSave(formData);
          }}
          className="w-full h-16 bg-[#E5E5E5] text-black rounded-xl font-bold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
          disabled={!formData.name.trim()}
        >
          确定
        </button>
      </div>

      {/* Discard Confirmation Overlay */}
      <AnimatePresence>
        {showDiscardConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-xs text-center shadow-2xl"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-2">是否放弃编辑？</h3>
              <p className="text-sm text-gray-400 mb-8">当前修改将不会被保存</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDiscardConfirm(false)}
                  className="flex-1 h-12 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm"
                >
                  取消
                </button>
                <button 
                  onClick={onCancel}
                  className="flex-1 h-12 bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200"
                >
                  确定
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputRow({ label, value, onChange, type = "text", placeholder }: { label: string, value: string, onChange: (v: string) => void, type?: string, placeholder?: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-9 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</div>
      <div className="flex-1 h-11 bg-white/50 backdrop-blur-md rounded-2xl px-5 flex items-center border border-white/40 shadow-sm">
        <input 
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-sm text-gray-700 font-medium placeholder:text-gray-300"
        />
      </div>
    </div>
  );
}

function DetailBox({ title, value, onChange, isNsfw = false, singleLine = false }: { title: string, value: string, onChange: (v: string) => void, isNsfw?: boolean, singleLine?: boolean }) {
  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center gap-2">
          <div className="px-5 py-2 bg-white shadow-sm border border-gray-100 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</div>
          {isNsfw && <span className="text-[10px] text-red-400 font-bold border border-red-100 px-2 rounded-lg">18+</span>}
        </div>
      )}
      <div className="bg-white/50 backdrop-blur-md rounded-[2rem] p-6 border border-white/40 shadow-sm">
        {singleLine ? (
          <input 
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-transparent outline-none text-sm text-gray-700 font-medium placeholder:text-gray-300"
          />
        ) : (
          <textarea 
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-transparent outline-none text-sm text-gray-700 font-medium min-h-[120px] resize-none leading-relaxed placeholder:text-gray-300"
          />
        )}
      </div>
    </div>
  );
}
