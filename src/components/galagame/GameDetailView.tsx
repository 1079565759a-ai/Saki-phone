import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Heart, 
  MessageSquare, 
  Star, 
  Play, 
  Coins, 
  Flower2, 
  Plus,
  ChevronRight,
  MoreVertical,
  Send,
  Camera
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { compressImage } from '../../utils/image';

interface GameDetailViewProps {
  game: any;
  onClose: () => void;
  onPlay?: () => void;
  appState: any;
  updateState: (key: string, value: any) => void;
}

const GameDetailView: React.FC<GameDetailViewProps> = ({ game, onClose, onPlay, appState, updateState }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [introExpanded, setIntroExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingCharId, setEditingCharId] = useState<number | null>(null);
  const [editingGameCover, setEditingGameCover] = useState(false);

  const characters = appState.galaCharacters || [];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImage(file);
      
      if (editingGameCover) {
        // Update game cover in all possible lists
        const updateList = (listKey: string) => {
          if (appState[listKey]) {
            const updated = appState[listKey].map((g: any) => 
              g.id === game.id ? { ...g, cover: compressedDataUrl } : g
            );
            updateState(listKey, updated);
          }
        };
        updateList('galaHotGames');
        updateList('galaMyGames');
        updateList('galaRecords');
        // Update local game object for immediate UI update
        game.cover = compressedDataUrl;
      } else if (editingCharId !== null) {
        const updatedChars = characters.map((c: any) => 
          c.id === editingCharId ? { ...c, photo: compressedDataUrl } : c
        );
        updateState('galaCharacters', updatedChars);
      }
    } catch (error) {
      console.error("Failed to process image", error);
    } finally {
      setEditingCharId(null);
      setEditingGameCover(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerImageUpload = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCharId(id);
    fileInputRef.current?.click();
  };

  const triggerGameCoverUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGameCover(true);
    fileInputRef.current?.click();
  };

  const comments = [
    { 
      id: 1, 
      user: '剧情党小A', 
      content: '这个结局真的意难平，沈星移最后那个眼神绝了。', 
      type: '剧情分析', 
      time: '1小时前',
      replies: [
        { id: 101, user: '路人甲', content: '确实，我也觉得这里处理得很细腻。', time: '50分钟前' },
        { id: 102, user: '路人乙', content: '作者大大快出番外吧！', time: '30分钟前' }
      ]
    },
    { 
      id: 2, 
      user: '角色控小B', 
      content: '陆昭我的嫁！谁懂啊这种清冷感。', 
      type: '角色看法', 
      time: '3小时前',
      replies: [
        { id: 201, user: '路人丙', content: '同好握手，陆昭真的太香了。', time: '2小时前' }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-[60] bg-white flex flex-col overflow-y-auto no-scrollbar"
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />
      {/* Hero Section */}
      <div className="h-72 relative shrink-0 group">
        <img src={game.cover} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
        <button 
          onClick={triggerGameCoverUpload}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
        >
          <Camera className="w-8 h-8 text-white" />
        </button>
        <button 
          onClick={onClose}
          className="absolute top-12 left-6 p-2 bg-white/80 backdrop-blur-md rounded-none border border-gray-100 text-gray-900 shadow-sm z-30"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Info Section */}
      <div className="px-8 -mt-12 relative z-10 space-y-8 pb-32">
        <div className="flex justify-between items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-gray-900 text-white text-[8px] font-bold uppercase tracking-[0.2em] rounded-none">
                {game.tags?.[0] || '武侠'}
              </span>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-2.5 h-2.5 fill-current" />
                <span className="text-[10px] font-bold text-gray-900">{game.rating || 4.8}</span>
              </div>
            </div>
            <h2 className="text-2xl font-serif italic font-bold text-gray-900 uppercase tracking-[0.1em]">{game.title}</h2>
          </div>
          <div className="text-right">
            <div className="text-[14px] font-mono font-bold text-gray-900">{game.plays || '1.2w'}</div>
            <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Players</div>
          </div>
        </div>

        {/* Intro */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-300">Introduction</h3>
            <button 
              onClick={() => setIntroExpanded(!introExpanded)}
              className="text-[7px] font-bold uppercase tracking-[0.2em] text-gray-400"
            >
              {introExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
          <p className={cn(
            "text-[11px] text-gray-600 leading-relaxed uppercase tracking-widest transition-all",
            !introExpanded && "line-clamp-2"
          )}>
            体验一场独特的剧情驱动冒险，每一个选择都至关重要。沉浸在一个充满神秘和奇迹的世界中。在这个世界里，你将扮演一名寻找真相的旅者，揭开隐藏在历史尘埃下的秘密。
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-none hover:border-gray-900 transition-all group"
          >
            <Heart className={cn("w-4 h-4 transition-colors", isLiked ? "text-red-500 fill-red-500" : "text-gray-300 group-hover:text-gray-900")} />
            <span className="text-[8px] font-bold uppercase tracking-widest text-gray-900">Like</span>
          </button>
          <button 
            onClick={() => setIsCollected(!isCollected)}
            className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-none hover:border-gray-900 transition-all group"
          >
            <Star className={cn("w-4 h-4 transition-colors", isCollected ? "text-yellow-400 fill-yellow-400" : "text-gray-300 group-hover:text-gray-900")} />
            <span className="text-[8px] font-bold uppercase tracking-widest text-gray-900">Collect</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-none hover:border-gray-900 transition-all group">
            <Coins className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-gray-900">Tip</span>
          </button>
        </div>

        {/* Character Popularity */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-[1px] bg-gray-900" />
              <h2 className="text-[10px] font-serif italic font-bold uppercase tracking-[0.3em] text-gray-900">Characters</h2>
            </div>
            <button 
              onClick={() => setShowRanking(true)}
              className="p-1.5 border border-gray-100 text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-end justify-center gap-4 h-56">
            {/* Top 2 */}
            <div className="w-1/4 h-3/4 bg-white/40 backdrop-blur-md border border-white/50 p-2 flex flex-col items-center justify-between relative shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-white/60 to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-white/60 to-transparent z-10 pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-300 z-20" />
              <div className="w-full aspect-[3/4] overflow-hidden rounded-lg relative z-0 group">
                <img src={characters[1].photo} className="w-full h-full object-cover" />
                <button 
                  onClick={(e) => triggerImageUpload(characters[1].id, e)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="text-center relative z-20 mt-2">
                <p className="text-[8px] font-bold text-gray-900 uppercase tracking-tighter">{characters[1].name}</p>
                <p className="text-[6px] font-mono text-gray-500">{characters[1].popularity}</p>
              </div>
            </div>
            {/* Top 1 */}
            <div className="w-1/3 h-full bg-white/60 backdrop-blur-md border border-white/60 p-2 flex flex-col items-center justify-between relative shadow-[0_12px_40px_rgba(0,0,0,0.15)] rounded-xl overflow-hidden transform -translate-y-2">
              <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-white/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-white/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-400 z-20" />
              <div className="w-full aspect-[3/4] overflow-hidden rounded-lg relative z-0 group">
                <img src={characters[0].photo} className="w-full h-full object-cover" />
                <button 
                  onClick={(e) => triggerImageUpload(characters[0].id, e)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="text-center relative z-20 mt-2">
                <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">{characters[0].name}</p>
                <p className="text-[7px] font-mono text-gray-600">{characters[0].popularity}</p>
              </div>
            </div>
            {/* Top 3 */}
            <div className="w-1/4 h-3/4 bg-white/40 backdrop-blur-md border border-white/50 p-2 flex flex-col items-center justify-between relative shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-white/60 to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-white/60 to-transparent z-10 pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-300 z-20" />
              <div className="w-full aspect-[3/4] overflow-hidden rounded-lg relative z-0 group">
                <img src={characters[2].photo} className="w-full h-full object-cover" />
                <button 
                  onClick={(e) => triggerImageUpload(characters[2].id, e)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="text-center relative z-20 mt-2">
                <p className="text-[8px] font-bold text-gray-900 uppercase tracking-tighter">{characters[2].name}</p>
                <p className="text-[6px] font-mono text-gray-500">{characters[2].popularity}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comments Entry */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-[1px] bg-gray-900" />
              <h2 className="text-[10px] font-serif italic font-bold uppercase tracking-[0.3em] text-gray-900">Comments</h2>
            </div>
            <button 
              onClick={() => setShowComments(true)}
              className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900"
            >
              View All
            </button>
          </div>
          <div 
            onClick={() => setShowComments(true)}
            className="p-6 bg-gray-50 border border-gray-100 rounded-none cursor-pointer hover:border-gray-900 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 rounded-none bg-white border border-gray-100" />
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">剧情党小A</span>
            </div>
            <p className="text-[10px] text-gray-600 line-clamp-1 uppercase tracking-widest">这个结局真的意难平，沈星移最后那个眼神绝了。</p>
          </div>
        </section>
      </div>

      {/* Floating Play Button */}
      <div className="fixed bottom-12 left-0 right-0 px-8 z-50">
        <button 
          onClick={onPlay}
          className="w-full py-5 bg-gray-900 text-white text-[11px] font-bold tracking-[0.4em] uppercase rounded-none hover:bg-black transition-all flex items-center justify-center gap-4 shadow-2xl"
        >
          <Play className="w-4 h-4 fill-current" />
          Enter Game
        </button>
      </div>

      {/* Ranking Modal */}
      <AnimatePresence>
        {showRanking && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
          >
            <div className="px-8 pt-16 pb-8 flex items-center justify-between border-b border-gray-100">
              <h2 className="text-[12px] font-serif italic font-bold uppercase tracking-[0.4em] text-gray-900">Popularity Ranking</h2>
              <button onClick={() => setShowRanking(false)} className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400">Close</button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-8 py-12 space-y-12">
              {/* Top 3 Header */}
              <div className="flex items-end justify-center gap-6 mb-16">
                <div className="flex flex-col items-center gap-3 w-1/4">
                  <div className="w-full aspect-[3/4] rounded-xl border border-white/50 bg-white/40 backdrop-blur-md p-1 overflow-hidden relative shadow-[0_8px_32px_rgba(0,0,0,0.1)] group">
                    <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-white/60 to-transparent z-10 pointer-events-none" />
                    <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-white/60 to-transparent z-10 pointer-events-none" />
                    <img src={characters[1].photo} className="w-full h-full object-cover rounded-lg relative z-0" />
                    <button 
                      onClick={(e) => triggerImageUpload(characters[1].id, e)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-bold text-gray-900 uppercase">{characters[1].name}</p>
                    <p className="text-[6px] font-mono text-gray-500">{characters[1].popularity}</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4 w-1/3 transform -translate-y-4">
                  <div className="w-full aspect-[3/4] rounded-xl border border-white/60 bg-white/60 backdrop-blur-md p-1 overflow-hidden relative shadow-[0_12px_40px_rgba(0,0,0,0.15)] group">
                    <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-white/80 to-transparent z-10 pointer-events-none" />
                    <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-white/80 to-transparent z-10 pointer-events-none" />
                    <img src={characters[0].photo} className="w-full h-full object-cover rounded-lg relative z-0" />
                    <button 
                      onClick={(e) => triggerImageUpload(characters[0].id, e)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">{characters[0].name}</p>
                    <p className="text-[7px] font-mono text-gray-600">{characters[0].popularity}</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3 w-1/4">
                  <div className="w-full aspect-[3/4] rounded-xl border border-white/50 bg-white/40 backdrop-blur-md p-1 overflow-hidden relative shadow-[0_8px_32px_rgba(0,0,0,0.1)] group">
                    <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-white/60 to-transparent z-10 pointer-events-none" />
                    <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-white/60 to-transparent z-10 pointer-events-none" />
                    <img src={characters[2].photo} className="w-full h-full object-cover rounded-lg relative z-0" />
                    <button 
                      onClick={(e) => triggerImageUpload(characters[2].id, e)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-bold text-gray-900 uppercase">{characters[2].name}</p>
                    <p className="text-[6px] font-mono text-gray-500">{characters[2].popularity}</p>
                  </div>
                </div>
              </div>

              {/* List */}
              <div className="space-y-6">
                {characters.map((char, idx) => (
                  <div key={char.id} className="flex items-center justify-between p-4 bg-white border border-gray-50 hover:border-gray-900 transition-all">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono font-bold text-gray-200">{(idx + 1).toString().padStart(2, '0')}</span>
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 relative group">
                        <img src={char.photo} className="w-full h-full object-cover" />
                        <button 
                          onClick={(e) => triggerImageUpload(char.id, e)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
                        >
                          <Camera className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">{char.name}</span>
                        <span className="text-[7px] font-mono text-gray-400">{char.popularity} pts</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-gray-100 text-[8px] font-bold uppercase tracking-widest text-gray-300 hover:border-gray-900 hover:text-gray-900 transition-all flex items-center gap-2">
                      <Flower2 className="w-3 h-3" />
                      Tip
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Modal */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
          >
            <div className="px-8 pt-16 pb-8 flex items-center justify-between border-b border-gray-100">
              <h2 className="text-[12px] font-serif italic font-bold uppercase tracking-[0.4em] text-gray-900">Comments</h2>
              <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
                <button onClick={() => setShowComments(false)} className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400">Close</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-12 space-y-12">
              {comments.map(comment => (
                <div key={comment.id} className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-none border border-gray-100 bg-gray-50 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-gray-900 uppercase tracking-widest">{comment.user}</span>
                        <span className="text-[7px] text-gray-300 font-mono">{comment.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed uppercase tracking-widest">{comment.content}</p>
                      <div className="flex items-center gap-4 pt-2">
                        <span className="text-[7px] text-gray-300 font-bold uppercase tracking-widest px-2 py-0.5 border border-gray-50">{comment.type}</span>
                        <button className="text-[7px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900">Reply</button>
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  <div className="ml-12 space-y-6 border-l border-gray-50 pl-6">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="flex gap-4">
                        <div className="w-6 h-6 rounded-none border border-gray-100 bg-gray-50 shrink-0" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{reply.user}</span>
                            <span className="text-[6px] text-gray-200 font-mono">{reply.time}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 border-t border-gray-100 bg-white">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Say something..."
                  className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-100 rounded-none text-[10px] outline-none focus:border-gray-900 transition-all uppercase tracking-widest"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GameDetailView;
