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
  type: string; // 'narrator' | 'character' | 'protagonist'
  name: string;
  text: string;
  portraitImage?: string;
  sceneImage?: string;
}

interface VNOption {
  text: string;
  hint?: string;
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
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [contextLog, setContextLog] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  
  // Track continuous state across lines
  const [globalScene, setGlobalScene] = useState<string>(game.cover || '');
  
  const chapters = game.chapters || [];

  const getPlayerName = () => {
    if (protagonistSettings.nameType === 'fixed') return protagonistSettings.fixedName || '主人公';
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
    let currChapterDesc = '【当前章节】：' + chapter.title + '。小节梗概：' + chapter.desc;
    let proDesc = '【主人公设定】：' + (protagonistSettings.persona || '默认女主') + '。名称：' + (getPlayerName() || '玩家');
    
    const initPrompt = `你是一个女性向视觉小说(乙女向Galgame)游戏引擎。默认攻略角色主要为男性。
游戏名称：${game.title}
${worldViewDesc}
${currChapterDesc}
${proDesc}

请生成本章开头的剧情（约10-15幕详细对话或描写），然后给出2-3个玩家选项卡供用户选择。
要求结构：
1. 一句话或一个动作作为单独的一幕（Line）。
2. 角色说的话用 type: "character"。对话加上引号。
3. 主人公说的话用 type: "protagonist"。对话加上引号。
4. 旁白(描述场景、心理等，对主人公用第二人称你)用 type: "narrator"。
5. 需要切换场景时填写 sceneKeyword。
6. 角色说话或出现时填写 charKeyword 和 charEmotion。

必须严格返回JSON，格式如下（不要包裹在markdown内，只返回JSON字符串）：
{
  "lines": [
    {
      "type": "narrator", 
      "name": "",
      "text": "本幕的文字内容",
      "sceneKeyword": "场景关键词(无切换则为空)",
      "charKeyword": "角色名(无则为空)",
      "charEmotion": "情绪关键词(normal/happy/sad/angry/blush等或空)"
    }
  ],
  "options": [
    { "text": "选项卡文字", "hint": "影响好感度/触发支线提示" }
  ]
}`;

    await fetchAiResponse(initPrompt, '开始');
  };

  const handleOptionSelect = async (opt: VNOption) => {
    const userChoiceText = opt.text;
    
    setContextLog(prev => [...prev, '[选项] 玩家选择了：' + userChoiceText]);
    
    setLines([]);
    setCurrentIndex(0);
    setOptions([]);
    setIsGenerating(true);

    const contextStr = contextLog.slice(-15).join('\n');
    
    const prompt = `玩家做出了选择：${userChoiceText}
    
之前的剧情摘要：
${contextStr}

请根据选择继续生成后续剧情（10-15幕），并再次提供新的选项。
- 选项可能影响好感度并在剧情中体现男主反应，或者导向支线。
- 如果达成结局，可以在 JSON 添加 "ending": "True" 或 "Bad"，此时可不要 options。
- 如果触发特定成就，可以在JSON添加 "achievementsUnlocked": ["成就1名称"]。
请严格保持同上的纯JSON格式，仅输出JSON字符串。`;

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
      
      let cleanText = text.trim();
      const stIdx = cleanText.indexOf('{');
      const edIdx = cleanText.lastIndexOf('}');
      if (stIdx !== -1 && edIdx !== -1) {
         cleanText = cleanText.substring(stIdx, edIdx + 1);
      }
      const parsed = JSON.parse(cleanText);
      
      let pLines: VNLine[] = [];
      let newLogs = [...contextLog, '玩家行动: ' + userChoice];
      
      let currentSceneFallback = globalScene;

      (parsed.lines || []).forEach((l: any) => {
        let speakerTag = l.type || 'narrator';
        
        let sImg = currentSceneFallback;
        if (l.sceneKeyword) {
          const foundS = appState.galaScenes?.find((s: any) => s.name.includes(l.sceneKeyword) || l.sceneKeyword.includes(s.name));
          if (foundS?.images?.[0]) sImg = foundS.images[0];
        }
        currentSceneFallback = sImg;

        let cImg = '';
        if (l.charKeyword && speakerTag === 'character') {
          const foundC = appState.galaCharacters?.find((c: any) => c.name.includes(l.charKeyword) || l.charKeyword.includes(c.name));
          if (foundC) {
             const lowerEmo = (l.charEmotion || '').toLowerCase();
             cImg = foundC.emotions?.[lowerEmo] || foundC.photo || '';
          }
        }

        let lineName = l.name || '';
        if (speakerTag === 'protagonist') {
           lineName = getPlayerName();
        } else if (speakerTag === 'narrator') {
           lineName = '';
        }

        pLines.push({
          type: speakerTag,
          name: lineName,
          text: l.text,
          portraitImage: cImg,
          sceneImage: sImg
        });
        
        newLogs.push(`[${speakerTag}] ${lineName}: ${l.text}`);
      });

      if (parsed.ending) {
         pLines.push({
           type: 'narrator', name: '',
           text: `【达成结局：${parsed.ending === 'True' ? 'True End - 真实结局' : 'Bad End - 遗憾终结'}】`,
           sceneImage: currentSceneFallback
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

      if (parsed.achievementsUnlocked && Array.isArray(parsed.achievementsUnlocked)) {
         setAchievements(parsed.achievementsUnlocked);
         setTimeout(() => setAchievements([]), 4000);
      }

      setGlobalScene(currentSceneFallback);
      setContextLog(newLogs);
      setLines(pLines);
      setCurrentIndex(0);
    } catch (e) {
      console.error('Game Engine Parse Error:', e);
      setLines([{ type: 'narrator', name: '', text: '系统: 剧本生成失败，请检查API配置或稍后再试。', sceneImage: globalScene }]);
      setOptions([{ text: '重试', hint: '' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScreenClick = () => {
    if (isGenerating || lines.length === 0) return;
    if (currentIndex < lines.length - 1) {
      setCurrentIndex(curr => curr + 1);
    }
  };

  const currentLine = lines[currentIndex];
  const isLineEnd = currentIndex === lines.length - 1;
  const currentBg = currentLine?.sceneImage || globalScene;

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
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-40 bg-black flex flex-col overflow-hidden" onClick={handleScreenClick}>
              <div className="absolute inset-0 z-0">
                <AnimatePresence mode="popLayout">
                  <motion.img 
                    key={currentBg}
                    initial={{ opacity: 0.5, scale: 1.05 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    src={currentBg} 
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              </div>

              {/* Achievements overlay */}
              <AnimatePresence>
                {achievements.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none"
                  >
                    {achievements.map((ach, idx) => (
                       <div key={idx} className="px-6 py-2 bg-[#d49a9f]/90 text-white rounded-full shadow-lg border border-white/20 text-sm tracking-widest font-bold">
                          ★ 达成成就: {ach}
                       </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="popLayout">
                {currentLine?.type === 'character' && currentLine?.portraitImage && (
                   <motion.img 
                     key={currentLine.portraitImage}
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                     src={currentLine.portraitImage} 
                     className="absolute bottom-1/4 left-1/2 -translate-x-1/2 h-[75%] max-w-[80vw] object-contain object-bottom pointer-events-none drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] z-10"
                   />
                )}
              </AnimatePresence>

              {/* Options Overlay */}
              {isLineEnd && options.length > 0 && !isGenerating && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xl flex flex-col gap-4">
                     {options.map((opt, i) => (
                        <button 
                          key={i}
                          onClick={(e) => { e.stopPropagation(); handleOptionSelect(opt); }}
                          className="w-full p-4 bg-black/70 hover:bg-[#d49a9f]/20 border-2 border-white/20 hover:border-[#d49a9f] text-white text-center rounded-xl tracking-widest transition-all relative group shadow-xl"
                        >
                           <span className="relative z-10 font-bold sm:text-lg">{opt.text}</span>
                           {opt.hint && <div className="text-xs text-[#d49a9f] mt-1.5 font-normal opacity-0 group-hover:opacity-100 transition-opacity">{opt.hint}</div>}
                        </button>
                     ))}
                  </motion.div>
                </div>
              )}

              <div className="relative z-20 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <button onClick={() => setScreen('home')} className="text-white/70 hover:text-white bg-black/40 backdrop-blur-md p-2 rounded-full z-50 relative pointer-events-auto">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Classic Visual Novel Dialogue Box */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 sm:px-12 sm:pb-12 pt-16 z-30 flex flex-col items-center select-none bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
                 {isGenerating ? (
                    <div className="w-full max-w-5xl min-h-[140px] flex items-center justify-center">
                       <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                    </div>
                 ) : currentLine ? (
                    <div className="w-full max-w-5xl min-h-[140px] relative bg-black/60 backdrop-blur-md border-[1.5px] border-white/20 rounded-xl p-6 sm:p-8 shadow-2xl pointer-events-auto">
                       {currentLine.type !== 'narrator' && currentLine.name && (
                          <div className="absolute -top-5 left-6 sm:left-10 bg-gradient-to-r from-[#e8b5be] to-[#d49a9f] px-6 py-1.5 rounded-lg text-white font-bold tracking-widest shadow-xl border border-white/20">
                             {currentLine.name}
                          </div>
                       )}
                       <div className={cn(
                          'text-lg sm:text-xl leading-[1.8] tracking-wider mt-2 transition-all',
                          currentLine.type === 'narrator' ? 'text-white/80 italic text-center px-8' : 'text-white'
                       )}>
                          {currentLine.text}
                       </div>
                       
                       {!isLineEnd && (
                          <div className="absolute bottom-4 right-6 sm:right-8 animate-bounce text-white/70">
                             <PlayCircle className="w-6 h-6" />
                          </div>
                       )}
                    </div>
                 ) : null}
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

