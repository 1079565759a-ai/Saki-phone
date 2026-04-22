import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, FastForward, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface GamePlayViewProps {
  game: any;
  onClose: () => void;
  appState: any;
  updateState: (key: string, value: any) => void;
}

export const GamePlayView: React.FC<GamePlayViewProps> = ({ game, onClose, appState, updateState }) => {
  const [messages, setMessages] = useState<{ role: string, text: string, type?: string, character?: string, sceneImage?: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSceneImage, setCurrentSceneImage] = useState<string>('');
  const [currentCharacterImage, setCurrentCharacterImage] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial prompt generation
  useEffect(() => {
    if (messages.length === 0) {
      startGame();
    }
  }, []);

  const startGame = async () => {
    setIsGenerating(true);
    let worldViewDesc = '';
    if (game.worldview) {
      worldViewDesc = `世界观背景：${game.worldview.background}。势力：${game.worldview.factions?.map((f: any) => f.name).join(', ')}。规则：${game.worldview.rules?.join(', ')}`;
    }
    
    let styleDesc = '';
    if (game.style) {
      const styleObj = appState.galaStyles?.find((s: any) => s.name === game.style);
      if (styleObj) {
        styleDesc = `文风要求：${styleObj.desc}`;
      }
    }

    let charactersDesc = '';
    const mainChar = appState.galaCharacters?.find((c: any) => c.name === game.mainCharacter);
    const otherChars = (game.otherCharacters || []).map((name: string) => appState.galaCharacters?.find((c: any) => c.name === name)).filter(Boolean);
    
    if (mainChar) charactersDesc += `主角【${mainChar.name}】：${mainChar.persona}，${mainChar.desc}。`;
    otherChars.forEach((c: any) => {
      charactersDesc += `配角【${c.name}】：${c.persona}，${c.desc}。`;
    });

    let scenesDesc = '';
    const gameScenes = (game.scenes || []).map((name: string) => appState.galaScenes?.find((s: any) => s.name === name)).filter(Boolean);
    gameScenes.forEach((s: any) => {
      scenesDesc += `场景【${s.name}】：${s.desc}。`;
    });

    const initPrompt = `你是一个出色的视觉小说游戏编剧/旁白。
接下来我们要玩一个视觉小说游戏。
游戏标题：${game.title}
游戏简介：${game.intro}
${worldViewDesc}
${charactersDesc}
${scenesDesc}
${styleDesc}

请你写出游戏的开场，包含场景描述、人物动作以及对话。如果当前有场景，请在文本最开始以 [Scene: 场景名称] 标注。如果有角色正在说话，请以 [Char: 角色名称: 表情(happy/angry/sad/joy/normal)] 标注。
字数大约150-200字。在结尾留出让玩家（即"我"）做出选择或行动的悬念。`;

    await fetchAiResponse(initPrompt, true);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isGenerating) return;
    const userText = inputText.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInputText('');
    setIsGenerating(true);

    const context = messages.slice(-5).map(m => `${m.role === 'user' ? '玩家输入' : '游戏系统'}: ${m.text}`).join('\n');
    const prompt = `根据玩家的输入继续推进剧情发展。
之前剧情：
${context}
玩家最新行动/回应：${userText}
请你回应接下来的剧情，同样可以使用 [Scene: 场景名称] 和 [Char: 角色名称: 表情] 来表示场景或人物。字数大约100-200字。`;

    await fetchAiResponse(prompt, false);
  };

  const fetchAiResponse = async (prompt: string, isInit: boolean) => {
    try {
      const apiKey = appState.apiKey || localStorage.getItem('custom_api_key') || process.env.GEMINI_API_KEY || '';
      const baseUrl = appState.apiBaseUrl || localStorage.getItem('custom_api_url');
      const model = appState.selectedModel || localStorage.getItem('custom_api_model') || 'gemini-3-flash-preview';

      const ai = new GoogleGenAI({ 
        apiKey: apiKey,
        ...(baseUrl ? { baseUrl } : {})
      });
      
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt
      });

      let text = response.text || '';
      
      // Parse logic for Scene and Char tags
      let sceneMatch = text.match(/\[Scene:\s*(.+?)\]/);
      let charMatch = text.match(/\[Char:\s*(.+?):\s*(.+?)\]/);

      let parsedScene = currentSceneImage;
      let parsedCharImg = currentCharacterImage;
      let parsedCharName = '';

      if (sceneMatch) {
        const sceneName = sceneMatch[1].trim();
        const foundScene = appState.galaScenes?.find((s: any) => s.name.includes(sceneName) || sceneName.includes(s.name));
        if (foundScene && foundScene.images && foundScene.images.length > 0) {
          parsedScene = foundScene.images[0];
          setCurrentSceneImage(parsedScene);
        }
        text = text.replace(sceneMatch[0], '').trim();
      }

      if (charMatch) {
        const charName = charMatch[1].trim();
        const emo = charMatch[2].trim().toLowerCase();
        parsedCharName = charName;
        const foundChar = appState.galaCharacters?.find((c: any) => c.name.includes(charName) || charName.includes(c.name));
        if (foundChar) {
          if (foundChar.emotions && foundChar.emotions[emo]) {
            parsedCharImg = foundChar.emotions[emo];
          } else {
            parsedCharImg = foundChar.photo || '';
          }
          setCurrentCharacterImage(parsedCharImg);
        }
        text = text.replace(charMatch[0], '').trim();
      }

      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: text,
        type: parsedCharName ? 'dialogue' : 'narrative',
        character: parsedCharName,
        characterImage: parsedCharImg,
        sceneImage: parsedScene
      }]);

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'ai', text: '系统: 剧本生成失败，请重试。' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col font-serif"
    >
      {/* Background Scene */}
      <div className="absolute inset-0 z-0">
        <img 
          src={currentSceneImage || game.cover || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'} 
          className="w-full h-full object-cover opacity-60 transition-all duration-1000" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
      </div>

      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between z-10 relative">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-white text-xs tracking-widest font-bold px-4 py-2 bg-black/40 backdrop-blur-md rounded-full">
          {game.title}
        </div>
        <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors">
          <FastForward className="w-4 h-4" />
        </button>
      </div>

      {/* Main Play Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 z-10 relative flex flex-col justify-end">
        <div className="space-y-6 max-w-2xl mx-auto w-full pb-32">
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={cn(
                "p-5 rounded-2xl backdrop-blur-md",
                msg.role === 'user' ? "bg-[#d49a9f]/80 text-white ml-auto max-w-[80%]" : "bg-black/60 text-gray-100 max-w-[90%]"
              )}
            >
              {msg.role === 'ai' && msg.character && (
                <div className="text-[#fcefee] text-[10px] font-bold tracking-widest uppercase mb-2">
                  {msg.character}
                </div>
              )}
              {/* If character speaks, Optionally show portrait? We have currentCharacterImage set independently but we can just rely on the background or small portraits */}
              <p className="text-sm leading-relaxed tracking-wide text-shadow-sm">
                {msg.text}
              </p>
            </motion.div>
          ))}
          {isGenerating && (
            <motion.div className="p-4 bg-black/40 backdrop-blur-md rounded-2xl max-w-[80%] flex items-center gap-3 text-gray-300">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs tracking-widest">思考中...</span>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Character Portrait Layer (Optional, shown if exist) */}
        {currentCharacterImage && (
          <div className="absolute bottom-0 right-0 w-2/3 h-2/3 pointer-events-none z-[-1] opacity-90 transition-all duration-1000">
            <img src={currentCharacterImage} className="w-full h-full object-contain object-bottom drop-shadow-2xl" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-6 py-6 border-t border-white/10 z-20 relative bg-black/40 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto flex gap-4">
          <input 
            type="text" 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={isGenerating ? "等待响应..." : "你的行动或回答..."}
            disabled={isGenerating}
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || isGenerating}
            className="w-12 h-12 rounded-full bg-[#d49a9f] flex items-center justify-center text-white disabled:opacity-50 hover:bg-[#c5a3a5] transition-colors"
          >
            <Play className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
