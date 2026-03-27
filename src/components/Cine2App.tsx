import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Film, 
  History, 
  User, 
  Star, 
  Play, 
  ArrowLeft, 
  MessageCircle, 
  Send, 
  Settings, 
  Plus,
  ChevronRight,
  Maximize2,
  Edit2
} from 'lucide-react';
import { cn } from '../utils/cn';

interface Movie {
  id: string;
  title: string;
  cover: string;
  description: string;
  rating: number;
  userReview?: string;
  aiReview?: string;
  videoUrl?: string;
  genre: string;
  year: string;
  director: string;
  actors: string;
  profile: string;
}

interface Danmaku {
  id: string;
  text: string;
  top: number;
  delay: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface Cine2AppProps {
  onClose: () => void;
  aiName: string;
  aiAvatar: string;
  isFullscreen?: boolean;
}

const Cine2App: React.FC<Cine2AppProps> = ({ onClose, aiName, aiAvatar, isFullscreen }) => {
  const [activeTab, setActiveTab] = useState<'rating' | 'history' | 'profile'>('rating');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Movie>>({});
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [danmakus, setDanmakus] = useState<Danmaku[]>([]);
  const [showAiRating, setShowAiRating] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);

  // Mock Data
  const [movies, setMovies] = useState<Movie[]>([
    {
      id: '1',
      title: '情书',
      cover: 'https://picsum.photos/seed/loveletter/300/450',
      description: '一个关于思念与错过的唯美故事。',
      rating: 4.5,
      genre: '爱情 / 剧情',
      year: '1995',
      director: '岩井俊二',
      actors: '中山美穗 / 丰川悦司 / 酒井美纪',
      profile: '住在神户的渡边博子，在未婚夫藤井树山难身亡三年后的忌日，偶然发现藤井树中学时代的毕业相册。',
      userReview: '真的很感人，藤井树的故事。',
      aiReview: '这是一部探讨时间与记忆的杰作，岩井俊二的镜头语言非常细腻。'
    },
    {
      id: '2',
      title: '秒速5厘米',
      cover: 'https://picsum.photos/seed/5cm/300/450',
      description: '樱花掉落的速度是每秒5厘米。',
      rating: 5,
      genre: '动画 / 爱情',
      year: '2007',
      director: '新海诚',
      actors: '水桥研二 / 近藤好美 / 尾上绫华',
      profile: '如果，樱花掉落的速度是每秒5厘米，那么两颗心需要多久才能靠近？',
      userReview: '每一帧都是壁纸。',
      aiReview: '新海诚通过距离感表达了成长的阵痛。'
    }
  ]);

  const [history, setHistory] = useState<Movie[]>([
    { ...movies[0], id: 'h1' },
    { ...movies[1], id: 'h2' }
  ]);

  // Danmaku generation
  useEffect(() => {
    if (isWatching) {
      const interval = setInterval(() => {
        const newDanmaku: Danmaku = {
          id: Math.random().toString(),
          text: ['太感人了', '呜呜呜', '这画面绝了', '前方高能', '打卡', 'AI也觉得好看吗？'][Math.floor(Math.random() * 6)],
          top: Math.random() * 60 + 10,
          delay: Math.random() * 2
        };
        setDanmakus(prev => [...prev.slice(-10), newDanmaku]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isWatching]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    setInputText('');

    // AI Response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `关于《${selectedMovie?.title}》的这段剧情，我也觉得很有深意呢。你觉得这里的感情处理得怎么样？`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  const handleVideoImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'video/mp4') {
      const url = URL.createObjectURL(file);
      setLocalVideoUrl(url);
      setIsWatching(true);
    }
  };

  const handleSaveEdit = () => {
    if (!selectedMovie) return;
    const updatedMovies = movies.map(m => m.id === selectedMovie.id ? { ...m, ...editData } : m);
    setMovies(updatedMovies);
    setSelectedMovie({ ...selectedMovie, ...editData });
    setIsEditing(false);
  };

  const renderRatingPage = () => (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#2D2D2D]">看过电影评分</h2>
        <button className="p-2 bg-[#2D2D2D] text-white rounded-full">
          <Plus size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {movies.map(movie => (
          <motion.div 
            key={movie.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMovie(movie)}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#2D2D2D]/5"
          >
            <div className="aspect-[2/3] relative">
              <img src={movie.cover} alt={movie.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] text-white font-bold">{movie.rating}</span>
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-bold text-[#2D2D2D] truncate">{movie.title}</h3>
              <p className="text-[10px] text-[#A19B8A] mt-1">{movie.genre}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderHistoryPage = () => (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-[#2D2D2D]">电影浏览记录</h2>
      <div className="space-y-3">
        {history.map(item => (
          <div key={item.id} className="flex gap-3 bg-white p-2 rounded-xl border border-[#2D2D2D]/5">
            <img src={item.cover} className="w-16 h-24 object-cover rounded-lg" />
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-sm font-bold text-[#2D2D2D]">{item.title}</h3>
              <p className="text-[10px] text-[#A19B8A] mt-1">上次观看: 昨天</p>
              <div className="mt-2 w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                <div className="bg-[#2D2D2D] h-full w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfilePage = () => (
    <div className="p-4 space-y-8">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden">
          <img src="https://picsum.photos/seed/user/200/200" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#2D2D2D]">电影发烧友</h2>
          <p className="text-xs text-[#A19B8A]">已观看 128 部电影</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white p-3 rounded-xl border border-[#2D2D2D]/5">
          <div className="text-lg font-bold">42</div>
          <div className="text-[10px] text-[#A19B8A]">影评</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-[#2D2D2D]/5">
          <div className="text-lg font-bold">15</div>
          <div className="text-[10px] text-[#A19B8A]">收藏</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-[#2D2D2D]/5">
          <div className="text-lg font-bold">8</div>
          <div className="text-[10px] text-[#A19B8A]">徽章</div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex flex-col bg-[#FDFCF8] overflow-hidden"
    >
      {isWatching && selectedMovie ? (
        <div className="absolute inset-0 bg-black z-[100] flex flex-row overflow-hidden">
          {/* Left: Chat Box */}
          <div className="w-80 h-full bg-[#1A1A1A] border-r border-white/10 flex flex-col shrink-0">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <button onClick={() => setIsWatching(false)} className="text-white hover:bg-white/10 p-1 rounded-full transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                <img src={aiAvatar} className="w-8 h-8 rounded-full object-cover" />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{aiName}</div>
                  <div className="text-[10px] text-emerald-400">正在陪你看电影...</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map(msg => (
                <div key={msg.id} className={cn(
                  "flex flex-col max-w-[85%]",
                  msg.sender === 'user' ? "ml-auto items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-3 py-2 rounded-2xl text-xs",
                    msg.sender === 'user' ? "bg-[#2D2D2D] text-white" : "bg-white/10 text-white"
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-white/30 mt-1">{msg.timestamp}</span>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-white/10 flex gap-2">
              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="和AI讨论剧情..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white outline-none focus:border-white/30 transition-colors"
              />
              <button onClick={handleSendMessage} className="p-2 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-transform">
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* Right: Movie Player */}
          <div className="flex-1 h-full relative bg-black flex items-center justify-center overflow-hidden">
            {localVideoUrl ? (
              <video 
                src={localVideoUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-contain relative z-10"
              />
            ) : (
              <>
                <img src={selectedMovie.cover} className="w-full h-full object-cover opacity-30 blur-xl absolute" />
                <div className="relative z-10 w-full max-w-2xl aspect-video bg-black rounded-lg shadow-2xl flex items-center justify-center group overflow-hidden">
                   <Play size={48} className="text-white opacity-50 group-hover:opacity-100 transition-opacity cursor-pointer" />
                   
                   {/* Danmaku Overlay */}
                   <div className="absolute inset-0 pointer-events-none overflow-hidden">
                     {danmakus.map(d => (
                       <motion.div
                         key={d.id}
                         initial={{ x: '100%' }}
                         animate={{ x: '-150%' }}
                         transition={{ duration: 8, ease: 'linear' }}
                         className="absolute whitespace-nowrap text-white text-sm font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                         style={{ top: `${d.top}%` }}
                       >
                         {d.text}
                       </motion.div>
                     ))}
                   </div>
                </div>
              </>
            )}
            
            <div className="absolute top-4 right-4 flex gap-3 z-20">
               <button className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors">
                 <Settings size={20} />
               </button>
               <button className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors">
                 <Maximize2 size={20} />
               </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 pt-12 flex items-center justify-between border-b border-[#2D2D2D]/5 bg-[#FDFCF8]/80 backdrop-blur-md sticky top-0 z-10">
            {!isFullscreen && (
              <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Film size={20} className="text-[#2D2D2D]" />
              <span className="font-bold text-sm tracking-widest uppercase">Cine2</span>
            </div>
            <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <Settings size={20} />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {selectedMovie ? (
                <motion.div 
                  key="detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 space-y-6"
                >
                  <button onClick={() => setSelectedMovie(null)} className="flex items-center gap-2 text-xs text-[#A19B8A] font-bold uppercase hover:text-[#2D2D2D] transition-colors">
                    <ArrowLeft size={14} /> 返回列表
                  </button>
                  
                  <div className="flex gap-4">
                    <img src={selectedMovie.cover} className="w-32 aspect-[2/3] object-cover rounded-xl shadow-lg border border-[#2D2D2D]/5" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[#2D2D2D]">{selectedMovie.title}</h2>
                        <button 
                          onClick={() => {
                            setIsEditing(true);
                            setEditData(selectedMovie);
                          }}
                          className="p-1.5 text-[#A19B8A] hover:text-[#2D2D2D] transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < Math.floor(selectedMovie.rating) ? "currentColor" : "none"} />
                        ))}
                        <span className="ml-2 text-xs font-bold text-[#2D2D2D]">{selectedMovie.rating}</span>
                      </div>
                      <p className="text-[10px] text-[#A19B8A]">{selectedMovie.genre} · {selectedMovie.year}</p>
                      <div className="flex gap-2 mt-4">
                        <button 
                          onClick={() => setIsWatching(true)}
                          className="flex-1 py-2 bg-[#2D2D2D] text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#3D3D3D] active:scale-95 transition-all"
                        >
                          <Play size={14} fill="white" /> 立即观看
                        </button>
                        <button 
                          onClick={() => videoInputRef.current?.click()}
                          className="px-4 py-2 bg-white border border-[#2D2D2D] text-[#2D2D2D] rounded-full text-xs font-bold hover:bg-gray-50 active:scale-95 transition-all"
                        >
                          导入视频
                        </button>
                        <input 
                          type="file" 
                          ref={videoInputRef} 
                          onChange={handleVideoImport} 
                          accept="video/mp4" 
                          className="hidden" 
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4 bg-white p-4 rounded-2xl border border-[#2D2D2D]/10 shadow-sm">
                      <h3 className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">编辑电影信息</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-[#A19B8A] uppercase">导演</label>
                          <input 
                            value={editData.director || ''} 
                            onChange={e => setEditData({...editData, director: e.target.value})}
                            className="w-full mt-1 bg-gray-50 border border-gray-100 p-2 text-xs rounded-lg outline-none focus:border-[#2D2D2D]/20"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#A19B8A] uppercase">主演</label>
                          <input 
                            value={editData.actors || ''} 
                            onChange={e => setEditData({...editData, actors: e.target.value})}
                            className="w-full mt-1 bg-gray-50 border border-gray-100 p-2 text-xs rounded-lg outline-none focus:border-[#2D2D2D]/20"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#A19B8A] uppercase">简介</label>
                          <textarea 
                            value={editData.profile || ''} 
                            onChange={e => setEditData({...editData, profile: e.target.value})}
                            className="w-full mt-1 bg-gray-50 border border-gray-100 p-2 text-xs rounded-lg outline-none focus:border-[#2D2D2D]/20 h-24"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button onClick={handleSaveEdit} className="flex-1 py-2 bg-[#2D2D2D] text-white rounded-lg text-xs font-bold">保存</button>
                          <button onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-gray-100 text-[#A19B8A] rounded-lg text-xs font-bold">取消</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-2xl border border-[#2D2D2D]/5 shadow-sm space-y-3">
                        <div>
                          <h3 className="text-[10px] font-bold text-[#A19B8A] uppercase tracking-wider">导演</h3>
                          <p className="text-xs text-[#2D2D2D] mt-1">{selectedMovie.director}</p>
                        </div>
                        <div>
                          <h3 className="text-[10px] font-bold text-[#A19B8A] uppercase tracking-wider">主演</h3>
                          <p className="text-xs text-[#2D2D2D] mt-1">{selectedMovie.actors}</p>
                        </div>
                        <div>
                          <h3 className="text-[10px] font-bold text-[#A19B8A] uppercase tracking-wider">简介</h3>
                          <p className="text-xs text-[#A19B8A] leading-relaxed mt-1">{selectedMovie.profile}</p>
                        </div>
                      </div>
                    <div className="bg-white p-4 rounded-2xl border border-[#2D2D2D]/5 shadow-sm space-y-2">
                      <h3 className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">剧情简介</h3>
                      <p className="text-xs text-[#A19B8A] leading-relaxed">{selectedMovie.description}</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-[#2D2D2D]/5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">我的评价</h3>
                        <button 
                          onClick={() => setShowAiRating(!showAiRating)}
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                            showAiRating ? "bg-[#2D2D2D] text-white" : "bg-gray-100 text-[#A19B8A]"
                          )}
                        >
                          AI点评: {showAiRating ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl text-xs text-[#2D2D2D] italic border border-gray-100">
                        "{selectedMovie.userReview}"
                      </div>
                      {showAiRating && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3 p-3 bg-[#2D2D2D]/5 rounded-xl border border-[#2D2D2D]/10"
                        >
                          <img src={aiAvatar} className="w-8 h-8 rounded-full object-cover" />
                          <div className="flex-1 space-y-1">
                            <div className="text-[10px] font-bold text-[#2D2D2D]">{aiName} 的点评</div>
                            <p className="text-[10px] text-[#A19B8A] leading-relaxed">{selectedMovie.aiReview}</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
              ) : (
                <motion.div 
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {activeTab === 'rating' && renderRatingPage()}
                  {activeTab === 'history' && renderHistoryPage()}
                  {activeTab === 'profile' && renderProfilePage()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          {!selectedMovie && (
            <div className="p-4 pb-8 bg-white border-t border-[#2D2D2D]/5 flex justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
              <button 
                onClick={() => setActiveTab('rating')}
                className={cn("flex flex-col items-center gap-1 transition-colors", activeTab === 'rating' ? "text-[#2D2D2D]" : "text-[#A19B8A]")}
              >
                <Film size={20} className={cn(activeTab === 'rating' && "stroke-[2.5]")} />
                <span className="text-[10px] font-bold">评分</span>
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={cn("flex flex-col items-center gap-1 transition-colors", activeTab === 'history' ? "text-[#2D2D2D]" : "text-[#A19B8A]")}
              >
                <History size={20} className={cn(activeTab === 'history' && "stroke-[2.5]")} />
                <span className="text-[10px] font-bold">历史</span>
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={cn("flex flex-col items-center gap-1 transition-colors", activeTab === 'profile' ? "text-[#2D2D2D]" : "text-[#A19B8A]")}
              >
                <User size={20} className={cn(activeTab === 'profile' && "stroke-[2.5]")} />
                <span className="text-[10px] font-bold">我的</span>
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Cine2App;
