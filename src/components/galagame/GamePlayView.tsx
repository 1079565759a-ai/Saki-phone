import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Loader2, PlayCircle, LogOut } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../../utils/cn';

interface GamePlayViewProps {
  game: any;
  onClose: () => void;
  appState: any;
  updateState: (key: string, value: any) => void;
}

type GameScreen = 'loading' | 'home' | 'name-input' | 'playing' | 'chapters';

interface VNLine {
  speakerTag: string;
  name: string;
  text: string;
  portrait?: string;
  scene?: string;
}

interface VNOption {
  text: string;
  effect?: string;
}

export const GamePlayView: React.FC<GamePlayViewProps> = ({ game, onClose, appState, updateState }) => {
  const [screen, setScreen] = useState<GameScreen>('loading');
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [unlockedChapters, setUnlockedChapters] = useState<number[]>([0]); 
  
  const protagonistSettings = appState.galaProtagonist || { nameType: 'none', fixedName: '', persona: '' };
  const [customPlayerName, setCustomPlayerName] = useState('');
  
  const [lines, setLines] = useState<VNLine[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<VNOption[]>([]);
  
  const [currentSceneImage, setCurrentSceneImage] = useState<string>(game.cover || '');
  const [currentCharacterImage, setCurrentCharacterImage] = useState<string>('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [contextLog, setContextLog] = useState<string[]>([]);
  
  const chapters = game.chapters || [];

  const getPlayerName = () => {
    if (protagonistSettings.nameType === 'fixed') return protagonistSettings.fixedName || '主角';
    if (protagonistSettings.nameType === 'custom') return customPlayerName || '你';
    return ''; 
  };

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
    const tryLockOrientation = async () => {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen && !document.fullscreenElement) {
          await elem.requestFullscreen().catch(() => {});
        }
        if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
          await window.screen.orientation.lock('landscape').catch(() => {});
        }
      } catch (err) {}
    };
    tryLockOrientation();
    return () => {
      try {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        if (window.screen?.orientation?.unlock) window.screen.orientation.unlock();
      } catch (err) {}
    };
  }, []);

  const handleStartGame = (index: number = 0) => {
    setCurrentChapterIndex(index);
    if (protagonistSettings.nameType === 'custom' && !customPlayerName) {
       setScreen('name-input');
    } else {
       startChapter(index);
    }
  };

  const startChapter = async (index: number) => {
    setScreen('playing');
    setLines([]);
    setCurrentIndex(0);
    setOptions([]);
    setContextLog([]);
    setIsGenerating(true);

    const chapter = chapters[index] || { title: '启程', desc: '游戏的开端' };
    
    let worldViewDesc = game.worldview ? '【世界观】：' + game.worldview.background : '';
    let currChapterDesc = '【当前章节】：' + chapter.title + '。情节要求：' + chapter.desc;
    let proDesc = '【主人公设定】：人设：' + (protagonistSettings.persona || '普通人') + '。名称：' + (getPlayerName() || '无(使用第二人称你)');
    
    const initPrompt = `你是一个视觉小说(Galgame)游戏引擎。
游戏名称：${game.title}
${worldViewDesc}
${currChapterDesc}
${proDesc}

请生成本章开头的剧情（约8-15句对话/旁白），然后给出2-3个玩家选项。
剧情要符合如下结构：
- 角色的对话必须加上双引号。
- 旁白用第三人称描述角色，用第二人称"你"描述主人公。
- 主人公的动作或心理活动作为旁白。

必须返回纯JSON，格式如下：
{
  "lines": [
    { "type": "narrator", "text": "清晨的阳光洒在街道上..." },
    { "type": "character", "name": "爱丽丝", "emotion": "happy", "text": "\\"早上好呀！\\"", "tag": "Alice" },
    { "type": "protagonist", "text": "\\"早啊。\\"" }
  ],
  "options": [
    { "text": "询问去哪里", "effect": "信息" },
    { "text": "冷漠走开", "effect": "爱丽丝好感-1" }
  ],
  "scene": "可选，场景名关键词",
  "ending": "可选，如果剧情完结填 True 或 Bad"
}
限制纯JSON返回，不要在前后加反引号或额外文本！`;

    await fetchAiResponse(initPrompt, '开始');
  };

  const handleOptionSelect = async (opt: VNOption) => {
    const userChoiceText = opt.text;
    
    setContextLog(prev => [...prev, '[选项] 玩家选择了：' + userChoiceText]);
    
    setLines([]);
    setCurrentIndex(0);
    setOptions([]);
    setIsGenerating(true);

    const contextStr = contextLog.slice(-10).join('\n');
    
    const prompt = `玩家做出了选择：${userChoiceText}
    
之前的剧情摘要：
${contextStr}

请根据选择继续生成后续剧情（8-15句对话/旁白），并再次提供选项。如果达成真结局或坏结局，可不提供选项，并设置 ending 字段。
必须返回严格纯JSON格式同上。`;

    await fetchAiResponse(prompt, userChoiceText);
  };

  const fetchAiResponse = async (prompt: string, userChoice: string) => {
    try {
      const apiKey = appState.apiKey || localStorage.getItem('custom_api_key') || process.env.GEMINI_API_KEY || '';
      const baseUrl = appState.apiBaseUrl || localStorage.getItem('custom_api_url');
      const model = appState.selectedModel || localStorage.getItem('custom_api_model') || 'gemini-3-flash-preview';

      let text = '';
      if (apiKey && apiKey !== process.env.GEMINI_API_KEY && baseUrl) {
         const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ model: model, messages: [{ role: 'user', content: prompt }] })
         });
         const data = await response.json();
         text = data.choices?.[0]?.message?.content || '';
      } else {
         const ai = new GoogleGenAI({ apiKey: apiKey });
         const response = await ai.models.generateContent({ model: model, contents: prompt });
         text = response.text || '';
      }
      
      const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      
      let pLines: VNLine[] = [];
      let newLogs = [...contextLog, '玩家行动: ' + userChoice];
      
      if (parsed.scene) {
        const foundScene = appState.galaScenes?.find((s: any) => s.name.includes(parsed.scene) || parsed.scene.includes(s.name));
        if (foundScene?.images?.[0]) {
          setCurrentSceneImage(foundScene.images[0]);
        }
      }

      parsed.lines.forEach((l: any) => {
        let lineName = '';
        let speakerTag = l.type;
        let charImg = '';

        if (speakerTag === 'character') {
          lineName = l.name || l.tag;
          const foundChar = appState.galaCharacters?.find((c: any) => c.name.includes(lineName) || lineName.includes(c.name));
          if (foundChar) {
            charImg = foundChar.emotions?.[l.emotion?.toLowerCase()] || foundChar.photo || '';
          }
        } else if (speakerTag === 'protagonist') {
          lineName = getPlayerName();
        }

        pLines.push({ speakerTag, name: lineName, text: l.text, portrait: charImg });
        newLogs.push(`[${speakerTag}] ${lineName}: ${l.text}`);
      });

      if (parsed.ending) {
         pLines.push({
           speakerTag: 'narrator', name: '',
           text: `【达成结局：${parsed.ending === 'True' ? 'True End - 真实结局' : 'Bad End - 遗憾终结'}】`
         });
         setOptions([]);
         if (parsed.ending === 'True') {
           if (!unlockedChapters.includes(currentChapterIndex + 1)) {
              setUnlockedChapters(prev => [...prev, currentChapterIndex + 1]);
           }
         }
      } else {
        setOptions(parsed.options || []);
      }

      setContextLog(newLogs);
      if (pLines[0]?.portrait) {
         setCurrentCharacterImage(pLines[0].portrait);
      } else if (pLines.length && !pLines[0].portrait && pLines[0].speakerTag === 'character') {
          setCurrentCharacterImage(''); 
      }

      setLines(pLines);
      setCurrentIndex(0);
    } catch (e) {
      console.error('Game Engine Parse Error:', e);
      setLines([{ speakerTag: 'narrator', name: '', text: '系统: 剧本生成失败，请检查API配置或稍后再试。' }]);
      setOptions([{ text: '重试', effect: 'retry' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScreenClick = () => {
    if (isGenerating || lines.length === 0) return;
    if (currentIndex < lines.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      if (lines[nextIdx].portrait) {
        setCurrentCharacterImage(lines[nextIdx].portrait as string);
      } else if (lines[nextIdx].speakerTag !== 'character') {
         setCurrentCharacterImage(''); 
      }
    }
  };

  const currentLine = lines[currentIndex];
  const isLineEnd = currentIndex === lines.length - 1;

  return (
    <>
      <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center font-serif">
        <div className="relative w-full h-full sm:aspect-video sm:w-[90vw] sm:max-w-[1280px] sm:h-auto sm:max-h-[85vh] bg-gray-900 shadow-2xl overflow-hidden rounded-none sm:rounded-xl portrait:rotate-0 landscape:rotate-0">
          <AnimatePresence mode="wait">
          
          {screen === 'loading' && (
            <motion.div key="loading" exit={{ opacity: 0 }} className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50">
              <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mt-8">
                <motion.div 
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ ease: 'linear' }}
                />
              </div>
              <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-bold mt-4 font-mono">
                {loadingProgress === 100 ? 'LOADING COMPLETE' : 'SYSTEM STARTING'}
              </p>
            </motion.div>
          )}

          {screen === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-40 bg-black">
              <img src={game.cover || 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80'} className="absolute inset-0 w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <button onClick={onClose} className="absolute top-6 left-6 text-white/50 hover:text-white z-50 p-2">
                <LogOut className="w-5 h-5" />
              </button>
              <div className="absolute top-1/4 left-16 max-w-md">
                <h1 className="text-4xl font-bold text-white tracking-widest drop-shadow-xl">{game.title}</h1>
                <p className="text-white/70 mt-4 text-sm leading-relaxed tracking-wider line-clamp-3 drop-shadow-md">{game.intro}</p>
                <div className="mt-16 flex flex-col gap-6">
                  {['开始', '章节'].map(btn => (
                    <button key={btn} onClick={() => {
                        if (btn === '开始') handleStartGame(0);
                        else if (btn === '章节') setScreen('chapters');
                      }}
                      className="text-left text-white/80 hover:text-white text-lg tracking-[0.5em] font-bold group flex items-center"
                    >
                      <span className="w-0 overflow-hidden group-hover:w-6 transition-all duration-300 opacity-0 group-hover:opacity-100"><PlayCircle className="w-4 h-4"/></span>
                      <span className="group-hover:translate-x-2 transition-transform">{btn}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {screen === 'name-input' && (
            <motion.div key="name-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center">
              <div className="max-w-md w-full p-8 bg-white/5 border border-white/10 rounded-2xl text-center space-y-8">
                 <h2 className="text-2xl text-white tracking-widest font-bold">你的名字是？</h2>
                 <input 
                   type="text" 
                   value={customPlayerName}
                   onChange={e => setCustomPlayerName(e.target.value)}
                   className="w-full bg-transparent border-b-2 border-white/30 text-white text-center text-xl py-2 focus:outline-none focus:border-white transition-colors"
                   placeholder="输入姓名"
                 />
                 <button onClick={() => {
                    if (customPlayerName.trim()) startChapter(currentChapterIndex);
                 }} className="px-8 py-3 bg-white text-black font-bold tracking-widest rounded-full hover:bg-gray-200">
                   确认并开始
                 </button>
              </div>
            </motion.div>
          )}

          {screen === 'chapters' && (
            <motion.div key="chapters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md p-8 flex flex-col">
              <button onClick={() => setScreen('home')} className="mb-8 text-white/50 hover:text-white flex items-center gap-2 text-sm tracking-widest w-fit">
                <ArrowLeft className="w-4 h-4" /> 返回
              </button>
              <h2 className="text-2xl text-white tracking-[0.3em] font-bold mb-8">章节选择</h2>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 pb-20 overflow-y-auto">
                {chapters.map((chap: any, idx: number) => {
                  const isUnlocked = unlockedChapters.includes(idx);
                  return (
                    <button key={idx} onClick={() => isUnlocked && handleStartGame(idx)} disabled={!isUnlocked} className={cn('p-6 text-left border rounded-lg transition-all flex flex-col gap-2', isUnlocked ? 'bg-white/5 border-white/20 hover:bg-white/10' : 'bg-black/50 border-white/5 opacity-50')}>
                      <span className="text-xs uppercase font-mono text-white/50">Chapter {idx + 1}</span>
                      <span className="text-lg font-bold text-white tracking-widest">{chap.title}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {screen === 'playing' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-40 bg-black flex flex-col" onClick={handleScreenClick}>
              <div className="absolute inset-0 z-0">
                <img src={currentSceneImage || game.cover} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              </div>

              <AnimatePresence mode="popLayout">
                {currentCharacterImage && (
                   <motion.img 
                     key={currentCharacterImage}
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                     src={currentCharacterImage} 
                     className="absolute bottom-32 left-1/2 -translate-x-1/2 h-[75%] max-w-[80vw] object-contain object-bottom pointer-events-none drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] z-10"
                   />
                )}
              </AnimatePresence>

              <div className="relative z-20 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <button onClick={() => setScreen('home')} className="text-white/70 hover:text-white bg-black/40 backdrop-blur-md p-2 rounded-full z-50 relative">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 pt-24 z-30 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col items-center">
                 {isGenerating ? (
                    <div className="min-h-[120px] flex items-center justify-center w-full max-w-4xl">
                       <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
                    </div>
                 ) : currentLine ? (
                    <div className="w-full max-w-4xl min-h-[120px] relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                       {currentLine.speakerTag !== 'narrator' && currentLine.name && (
                          <div className="absolute -top-4 left-6 bg-[#d49a9f] px-4 py-1 rounded text-white text-sm font-bold tracking-widest shadow-lg">
                             {currentLine.name}
                          </div>
                       )}
                       <div className={cn(
                          'text-lg sm:text-lg leading-relaxed tracking-wider mt-2',
                          currentLine.speakerTag === 'narrator' ? 'text-white/80 italic text-center' : 'text-white'
                       )}>
                          {currentLine.text}
                       </div>
                       
                       {!isLineEnd && (
                          <div className="absolute bottom-4 right-6 animate-pulse text-white/50">▼</div>
                       )}
                    </div>
                 ) : null}

                 {isLineEnd && options.length > 0 && !isGenerating && (
                    <div className="absolute bottom-[100%] mb-8 w-full max-w-2xl px-8 flex flex-col gap-3 left-1/2 -translate-x-1/2 z-50">
                       {options.map((opt, i) => (
                          <motion.button 
                            key={i}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            onClick={(e) => { e.stopPropagation(); handleOptionSelect(opt); }}
                            className="w-full p-4 bg-black/80 hover:bg-white/10 border border-[#d49a9f]/50 hover:border-[#d49a9f] backdrop-blur-md text-white text-center rounded-lg tracking-widest transition-all"
                          >
                             {opt.text}
                          </motion.button>
                       ))}
                    </div>
                 )}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="fixed inset-0 z-[300] bg-black bg-opacity-90 flex-col items-center justify-center text-white hidden portrait:flex sm:portrait:hidden">
        <div className="text-center p-8 border border-white/20 rounded-2xl bg-black/50 backdrop-blur-md">
          <p className="text-xl font-bold tracking-widest mb-4">请旋转手机</p>
          <p className="text-sm text-white/60 tracking-wider">该游戏主要适配横屏体验</p>
          <button onClick={onClose} className="mt-8 px-8 py-2 bg-white/10 hover:bg-white/20 rounded-full">退出</button>
        </div>
      </div>
    </>
  );
};
