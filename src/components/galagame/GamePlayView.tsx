import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, FastForward, Loader2, Settings, List, PlayCircle, LogOut } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../../utils/cn';

interface GamePlayViewProps {
  game: any;
  onClose: () => void;
  appState: any;
  updateState: (key: string, value: any) => void;
}

type GameScreen = 'loading' | 'home' | 'playing' | 'chapters' | 'extras';

export const GamePlayView: React.FC<GamePlayViewProps> = ({ game, onClose, appState, updateState }) => {
  const [screen, setScreen] = useState<GameScreen>('loading');
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [unlockedChapters, setUnlockedChapters] = useState<number[]>([0]); // indices
  
  const [messages, setMessages] = useState<{ role: string, text: string, character?: string, sceneImage?: string, characterImage?: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSceneImage, setCurrentSceneImage] = useState<string>('');
  const [currentCharacterImage, setCurrentCharacterImage] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chapters = game.chapters || [];

  useEffect(() => {
    if (screen === 'loading') {
      const interval = setInterval(() => {
        setLoadingProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => setScreen('home'), 500);
            return 100;
          }
          return p + 5;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [screen]);

  useEffect(() => {
    if (screen === 'playing') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, screen]);

  const startChapter = async (index: number) => {
    setCurrentChapterIndex(index);
    setScreen('playing');
    setMessages([]);
    setIsGenerating(true);

    const chapter = chapters[index] || { title: '启程', desc: '新的一章开始' };
    
    // Construct game context
    let worldViewDesc = game.worldview ? `世界观背景：${game.worldview.background}。` : '';
    let currChapterDesc = `当前章节：${chapter.title}。情节概述：${chapter.desc}。`;
    let endingsDesc = `如果玩家的行动导致悲剧或提前结束，你可以在结尾输出 [Ending: Bad]。如果玩家的行动完全符合以下真实结局设定，请输出 [Ending: True]。\n真实结局参考：${chapter.trueEnding || '无'}`;

    let styleDesc = '';
    if (game.styleId) {
      const styleObj = appState.galaStyles?.find((s: any) => s.id == game.styleId);
      if (styleObj) {
        styleDesc = `附加文风要求：${styleObj.desc}`;
      }
    }

    const initPrompt = `你是一个视觉小说(Galgame)游戏引擎兼文案。
游戏：${game.title}
${worldViewDesc}
${currChapterDesc}
${endingsDesc}
${styleDesc}

请输出本章开头，包含场景、人物和对话。
格式要求：
[Scene: 场景名] (改变背景)
[Char: 角色名: 情绪] (改变立绘，情绪如happy/angry/sad)
开始你的叙述。限制150-200字，结尾留出互动悬念。`;

    await fetchAiResponse(initPrompt);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isGenerating) return;
    const userText = inputText.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInputText('');
    setIsGenerating(true);

    const context = messages.slice(-6).map(m => `${m.role === 'user' ? '我' : '游戏'}: ${m.text}`).join('\n');
    const prompt = `根据我的回答继续推进。
已发生：
${context}

我的行动/回答：${userText}
请继续叙述并做出反应。需要时使用[Scene: X]或[Char: X: Emo]。如果达成真结局或坏结局条件，输出相应的[Ending: True]或[Ending: Bad]。限制100-200字。`;

    await fetchAiResponse(prompt);
  };

  const fetchAiResponse = async (prompt: string) => {
    try {
      const apiKey = appState.apiKey || localStorage.getItem('custom_api_key') || process.env.GEMINI_API_KEY || '';
      const baseUrl = appState.apiBaseUrl || localStorage.getItem('custom_api_url');
      const model = appState.selectedModel || localStorage.getItem('custom_api_model') || 'gemini-3-flash-preview';

      const ai = new GoogleGenAI({ apiKey: apiKey, ...(baseUrl ? { baseUrl } : {}) });
      
      const response = await ai.models.generateContent({ model: model, contents: prompt });
      let text = response.text || '';
      
      let sceneMatch = text.match(/\[Scene:\s*(.+?)\]/);
      let charMatch = text.match(/\[Char:\s*(.+?):\s*(.+?)\]/);
      let endMatch = text.match(/\[Ending:\s*(True|Bad)\]/i);

      let parsedScene = currentSceneImage;
      let parsedCharImg = currentCharacterImage;
      let parsedCharName = '';

      if (sceneMatch) {
        const sceneName = sceneMatch[1].trim();
        const foundScene = appState.galaScenes?.find((s: any) => s.name.includes(sceneName));
        if (foundScene?.images?.[0]) {
          parsedScene = foundScene.images[0];
          setCurrentSceneImage(parsedScene);
        }
        text = text.replace(sceneMatch[0], '').trim();
      }

      if (charMatch) {
        const charName = charMatch[1].trim();
        const emo = charMatch[2].trim().toLowerCase();
        parsedCharName = charName;
        const foundChar = appState.galaCharacters?.find((c: any) => c.name.includes(charName));
        if (foundChar) {
          parsedCharImg = foundChar.emotions?.[emo] || foundChar.photo || '';
          setCurrentCharacterImage(parsedCharImg);
        }
        text = text.replace(charMatch[0], '').trim();
      }

      if (endMatch) {
        const endType = endMatch[1].toLowerCase();
        text = text.replace(endMatch[0], '').trim();
        text += `\n\n【达成结局：${endType === 'true' ? 'True End - 真实结局' : 'Bad End - 遗憾终结'}】`;
        
        if (endType === 'true') {
          if (!unlockedChapters.includes(currentChapterIndex + 1)) {
             setUnlockedChapters(prev => [...prev, currentChapterIndex + 1]);
          }
        }
      }

      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: text,
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
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center font-serif">
      {/* Landscape Game Container */}
      <div className="relative w-full h-full sm:aspect-video sm:w-[90vw] sm:max-w-[1280px] sm:h-auto sm:max-h-[85vh] bg-gray-900 shadow-2xl overflow-hidden rounded-none sm:rounded-xl portrait:rotate-0 landscape:rotate-0">
        <AnimatePresence mode="wait">
          
          {/* Loading Screen */}
          {screen === 'loading' && (
            <motion.div key="loading" exit={{ opacity: 0 }} className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50">
              <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mt-8">
                <motion.div 
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
              <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-bold mt-4 font-mono">
                {loadingProgress === 100 ? 'LOADING COMPLETE' : 'SYSTEM STARTING'}
              </p>
            </motion.div>
          )}

          {/* Home Screen */}
          {screen === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-40 bg-black">
              {/* Cover Image */}
              <img src={game.cover || 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80'} className="absolute inset-0 w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              
              <button onClick={onClose} className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors z-50 p-2">
                <LogOut className="w-5 h-5" />
              </button>

              <div className="absolute top-1/4 left-16 max-w-md">
                <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-widest drop-shadow-xl">{game.title}</h1>
                <p className="text-white/70 mt-4 text-sm leading-relaxed tracking-wider line-clamp-3 drop-shadow-md">{game.intro}</p>
                
                <div className="mt-16 flex flex-col gap-6">
                  {['开始', '继续', '章节', '番外', '设置'].map((btn, i) => (
                    <button 
                      key={btn}
                      onClick={() => {
                        if (btn === '开始') startChapter(0);
                        else if (btn === '章节') setScreen('chapters');
                      }}
                      className="text-left text-white/80 hover:text-white text-lg tracking-[0.5em] font-bold w-fit group flex items-center transition-all"
                    >
                      <span className="w-0 overflow-hidden group-hover:w-6 transition-all duration-300 opacity-0 group-hover:opacity-100"><PlayCircle className="w-4 h-4"/></span>
                      <span className="group-hover:translate-x-2 transition-transform">{btn}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Chapters Screen */}
          {screen === 'chapters' && (
            <motion.div key="chapters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md p-8 flex flex-col">
              <button onClick={() => setScreen('home')} className="mb-8 text-white/50 hover:text-white flex items-center gap-2 text-sm tracking-widest w-fit">
                <ArrowLeft className="w-4 h-4" /> 返回
              </button>
              <h2 className="text-2xl text-white tracking-[0.3em] font-bold mb-8">章节选择</h2>
              <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-20">
                {chapters.map((chap: any, idx: number) => {
                  const isUnlocked = unlockedChapters.includes(idx);
                  return (
                    <button 
                      key={idx}
                      onClick={() => isUnlocked && startChapter(idx)}
                      disabled={!isUnlocked}
                      className={cn(
                        "p-6 text-left border rounded-lg transition-all flex flex-col gap-2",
                        isUnlocked ? "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40 text-white" : "bg-black/50 border-white/5 text-white/30 cursor-not-allowed"
                      )}
                    >
                      <span className="text-xs uppercase tracking-widest font-mono">Chapter {idx + 1}</span>
                      <span className="text-lg font-bold truncate tracking-widest">{chap.title}</span>
                      {!isUnlocked && <span className="text-[10px] mt-2 tracking-widest bg-white/10 w-fit px-2 py-1 rounded">达成前置真结局解锁</span>}
                    </button>
                  )
                })}
                {chapters.length === 0 && (
                  <div className="col-span-full p-12 text-center text-white/50 tracking-widest border border-white/10 border-dashed rounded-xl">
                    正在开发中...
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Gameplay Screen */}
          {screen === 'playing' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-40 bg-black flex flex-col">
              {/* Scene Image */}
              <div className="absolute inset-0 z-0">
                <img src={currentSceneImage || game.cover} className="w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              </div>

              {/* Character Image */}
              {currentCharacterImage && (
                <div className="absolute bottom-1/4 right-10 w-1/3 h-2/3 pointer-events-none z-10 flex items-end justify-center">
                  <motion.img 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    src={currentCharacterImage} className="max-w-full max-h-full object-contain object-bottom drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
                  />
                </div>
              )}

              {/* Header */}
              <div className="relative z-20 p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
                <button onClick={() => setScreen('home')} className="text-white/70 hover:text-white transition-colors bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="text-white/50 text-[10px] uppercase font-mono tracking-widest">
                  Chapter {currentChapterIndex + 1}
                </div>
              </div>

              {/* Chat/Novel Log */}
              <div className="flex-1 overflow-y-auto px-8 sm:px-24 py-4 relative z-20 flex flex-col gap-6 scrollbar-hide mb-28">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("max-w-2xl", msg.role === 'user' ? "self-end" : "self-start")}>
                    {msg.role === 'ai' && msg.character && (
                      <div className="text-[#fcefee] text-xs font-bold tracking-[0.2em] mb-1 pl-2 text-shadow-sm">{msg.character}</div>
                    )}
                    <div className={cn("p-4 rounded-xl text-sm leading-relaxed tracking-wider shadow-xl backdrop-blur-md border border-white/10", msg.role === 'user' ? "bg-white/20 text-white" : "bg-black/60 text-white/90")}>
                      {msg.text.split('\n').map((line, j) => <p key={j} className="mb-2 last:mb-0">{line}</p>)}
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="self-start p-4 text-white/50 text-xs tracking-widest flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin"/> 加载中...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-30 bg-gradient-to-t from-black/90 to-transparent">
                <div className="max-w-3xl mx-auto flex gap-4">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="在这里输入你的行动或对话..."
                    className="flex-1 bg-black/50 border border-white/20 backdrop-blur-md rounded-lg px-6 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-all text-sm tracking-wider"
                    disabled={isGenerating}
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!inputText.trim() || isGenerating}
                    className="px-8 bg-white text-black font-bold tracking-widest rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-colors"
                  >
                    发送
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
