import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Users, 
  ArrowLeft, 
  MoreHorizontal, 
  X, 
  Upload,
  MessageCircle,
  Heart,
  Share2,
  Check,
  ChevronRight,
  Send
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../utils/cn';
import { compressImage } from '../utils/image';

interface Photo {
  id: string;
  url: string;
  description?: string; // For AI-generated photo descriptions
  caption?: string;
  uploader: 'user' | string; // 'user' or AI character ID
  uploaderName: string;
  timestamp: number;
  aiComments: { charId: string; charName: string; text: string; role?: 'user' | 'ai' }[];
}

interface Album {
  id: string;
  name: string;
  photos: Photo[];
  isShared: boolean;
  sharedWith: { id: string; name: string; avatar: string }[];
}

interface AICharacter {
  id: string;
  name: string;
  avatar: string;
  persona: string;
}

interface PhotoAppProps {
  onClose: () => void;
  language: string;
}

const PhotoApp: React.FC<PhotoAppProps> = ({ onClose, language }) => {
  const [albums, setAlbums] = useState<Album[]>(() => {
    const saved = localStorage.getItem('photo_app_albums');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: '我的相册', photos: [], isShared: false, sharedWith: [] }
    ];
  });
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [selectedAIForSharing, setSelectedAIForSharing] = useState<string[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isReplyingTo, setIsReplyingTo] = useState<string | null>(null); // charId
  
  // Get full state for profile info
  const state = useMemo(() => {
    const saved = localStorage.getItem('ins_state');
    if (saved) return JSON.parse(saved);
    return { myProfile: { avatar: 'https://picsum.photos/seed/user/200/200' } };
  }, []);

  // Get AI characters from WeChatApp state
  const availableAIs: AICharacter[] = useMemo(() => {
    const saved = localStorage.getItem('ins_state');
    if (saved) {
      try {
        const insState = JSON.parse(saved);
        // Map aiDatabase to AICharacter interface
        return insState.aiDatabase.map((ai: any) => ({
          id: ai.id,
          name: ai.nickname,
          avatar: ai.avatar,
          persona: ai.persona
        }));
      } catch (e) {
        console.error('Failed to parse ins_state', e);
      }
    }
    // Fallback mock AIs if no chat contacts found
    return [
      { id: 'ai_1', name: '福熊兒', avatar: 'https://picsum.photos/seed/bear/100/100', persona: '温柔、贴心的AI伙伴，说话风格带有INS奶白风的甜美感。' },
      { id: 'ai_2', name: '小櫻', avatar: 'https://picsum.photos/seed/sakura/100/100', persona: '活泼开朗，喜欢摄影和旅游，对美感有独特见解。' }
    ];
  }, []);

  const activeAlbum = albums.find(a => a.id === activeAlbumId);
  const selectedPhoto = activeAlbum?.photos.find(p => p.id === selectedPhotoId);

  useEffect(() => {
    localStorage.setItem('photo_app_albums', JSON.stringify(albums));
  }, [albums]);

  const createAlbum = () => {
    if (!newAlbumName.trim()) return;
    const newAlbum: Album = {
      id: Date.now().toString(),
      name: newAlbumName,
      photos: [],
      isShared: false,
      sharedWith: []
    };
    setAlbums([...albums, newAlbum]);
    setNewAlbumName('');
    setIsCreatingAlbum(false);
  };

  const deleteAlbum = (id: string) => {
    setAlbums(albums.filter(a => a.id !== id));
    if (activeAlbumId === id) setActiveAlbumId(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeAlbumId) {
      try {
        const compressed = await compressImage(file, 1200, 1200, 0.7);
        const newPhoto: Photo = {
          id: Date.now().toString(),
          url: compressed,
          uploader: 'user',
          uploaderName: '我',
          timestamp: Date.now(),
          aiComments: []
        };
        
        const updatedAlbums = albums.map(a => {
          if (a.id === activeAlbumId) {
            return { ...a, photos: [newPhoto, ...a.photos] };
          }
          return a;
        });
        setAlbums(updatedAlbums);

        // If shared album, trigger AI evaluation
        if (activeAlbum?.isShared) {
          triggerAIEvaluation(activeAlbumId, newPhoto);
        }
      } catch (err) {
        console.error('Upload failed', err);
      }
    }
  };

  const triggerAIEvaluation = async (albumId: string, photo: Photo) => {
    const album = albums.find(a => a.id === albumId);
    if (!album || !album.isShared) return;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    for (const char of album.sharedWith) {
      try {
        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: photo.url.split(',')[1] // Assuming base64
              }
            },
            {
              text: `你是一个AI角色，名字叫${char.name}。你的性格设定是：${availableAIs.find(a => a.id === char.id)?.persona}。
              你的朋友刚刚在你们的共享相册里上传了这张照片。请根据你的性格对这张照片进行评价。
              评价要自然、真实，像是在朋友圈或者共享相册里的互动。
              请直接输出评价内容，不要包含任何前缀。`
            }
          ],
        });

        const comment = response.text;
        
        setAlbums(prev => prev.map(a => {
          if (a.id === albumId) {
            return {
              ...a,
              photos: a.photos.map(p => {
                if (p.id === photo.id) {
                  return {
                    ...p,
                    aiComments: [...p.aiComments, { charId: char.id, charName: char.name, text: comment, role: 'ai' }]
                  };
                }
                return p;
              })
            };
          }
          return a;
        }));

        // Occasionally, AI might also "upload" a photo in response
        if (Math.random() > 0.7) {
          triggerAIUpload(albumId, char);
        }
      } catch (err) {
        console.error('AI evaluation failed', err);
      }
    }
  };

  const triggerAIUpload = async (albumId: string, char: { id: string; name: string }) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你是一个AI角色，名字叫${char.name}。你的性格设定是：${availableAIs.find(a => a.id === char.id)?.persona}。
        你正在和朋友共享一个相册。请描述一张你“拍摄”并想要上传到相册的照片。
        这张照片应该符合你的性格和当下的情境。
        请返回一个JSON对象，包含以下字段：
        - description: 照片的视觉描述（用于生成占位图）
        - caption: 你为这张照片写的配文
        
        示例：{"description": "阳光洒在书桌上的咖啡杯，旁边是一本翻开的诗集", "caption": "午后的一点闲暇时光~"}`,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text);
      
      const newPhoto: Photo = {
        id: 'ai_' + Date.now(),
        url: `https://picsum.photos/seed/${Math.random()}/800/800`,
        description: data.description,
        caption: data.caption,
        uploader: char.id,
        uploaderName: char.name,
        timestamp: Date.now(),
        aiComments: []
      };

      setAlbums(prev => prev.map(a => {
        if (a.id === albumId) {
          return { ...a, photos: [newPhoto, ...a.photos] };
        }
        return a;
      }));
    } catch (err) {
      console.error('AI upload failed', err);
    }
  };

  const handleUserReply = async (charId: string) => {
    if (!replyText.trim() || !selectedPhotoId || !activeAlbumId) return;

    const char = availableAIs.find(a => a.id === charId);
    if (!char) return;

    const userReply = {
      charId: 'user',
      charName: '我',
      text: replyText,
      role: 'user' as const
    };

    setAlbums(prev => prev.map(a => {
      if (a.id === activeAlbumId) {
        return {
          ...a,
          photos: a.photos.map(p => {
            if (p.id === selectedPhotoId) {
              return { ...p, aiComments: [...p.aiComments, userReply] };
            }
            return p;
          })
        };
      }
      return a;
    }));

    const currentReplyText = replyText;
    setReplyText('');
    setIsReplyingTo(null);

    // AI must reply back
    triggerAIReply(activeAlbumId, selectedPhotoId, char, currentReplyText);
  };

  const triggerAIReply = async (albumId: string, photoId: string, char: AICharacter, userText: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
      const photo = albums.find(a => a.id === albumId)?.photos.find(p => p.id === photoId);
      if (!photo) return;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你是一个AI角色，名字叫${char.name}。你的性格设定是：${char.persona}。
        在共享相册里，你之前评价了朋友的一张照片。
        朋友回复了你的评价：“${userText}”
        请根据你的性格回复你的朋友。保持自然、真实的社交互动感。
        请直接输出回复内容。`,
      });

      const aiReply = {
        charId: char.id,
        charName: char.name,
        text: response.text,
        role: 'ai' as const
      };

      setAlbums(prev => prev.map(a => {
        if (a.id === albumId) {
          return {
            ...a,
            photos: a.photos.map(p => {
              if (p.id === photoId) {
                return { ...p, aiComments: [...p.aiComments, aiReply] };
              }
              return p;
            })
          };
        }
        return a;
      }));
    } catch (err) {
      console.error('AI reply failed', err);
    }
  };

  const toggleSharing = () => {
    if (!activeAlbumId) return;
    
    const updatedAlbums = albums.map(a => {
      if (a.id === activeAlbumId) {
        const sharedWith = availableAIs.filter(ai => selectedAIForSharing.includes(ai.id));
        return { 
          ...a, 
          isShared: selectedAIForSharing.length > 0,
          sharedWith: sharedWith.map(s => ({ id: s.id, name: s.name, avatar: s.avatar }))
        };
      }
      return a;
    });
    setAlbums(updatedAlbums);
    setIsSharing(false);
  };

  const handleBack = () => {
    if (selectedPhotoId) {
      setSelectedPhotoId(null);
    } else if (activeAlbumId) {
      setActiveAlbumId(null);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-white flex flex-col overflow-hidden max-w-[430px] mx-auto shadow-2xl">
      {/* Header */}
      <div className="pt-12 pb-4 px-6 flex items-center justify-between border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-800" />
          </button>
          <h2 className="font-serif italic font-bold text-lg tracking-tight text-gray-800 uppercase truncate max-w-[150px]">
            {selectedPhotoId ? '详情' : activeAlbumId ? activeAlbum?.name : 'Photo'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {activeAlbumId && !selectedPhotoId && (
            <>
              <button 
                onClick={() => {
                  if (activeAlbumId && activeAlbum?.sharedWith.length) {
                    const randomAI = activeAlbum.sharedWith[Math.floor(Math.random() * activeAlbum.sharedWith.length)];
                    triggerAIUpload(activeAlbumId, randomAI);
                  }
                }}
                className="p-2 text-gray-800 hover:bg-gray-50 rounded-full transition-colors"
                title="让AI生成照片"
              >
                <ImageIcon size={20} />
              </button>
              <button 
                onClick={() => {
                  setSelectedAIForSharing(activeAlbum?.sharedWith.map(s => s.id) || []);
                  setIsSharing(true);
                }}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  activeAlbum?.isShared ? "text-blue-500 bg-blue-50" : "text-gray-400 hover:bg-gray-50"
                )}
              >
                <Users size={20} />
              </button>
              <label className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors cursor-pointer">
                <Upload size={20} />
                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
              </label>
            </>
          )}
          {!activeAlbumId && (
            <button onClick={() => setIsCreatingAlbum(true)} className="p-2 text-gray-800 hover:bg-gray-50 rounded-full transition-colors">
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {selectedPhotoId ? (
            <motion.div 
              key="photo-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col min-h-full"
            >
              <div className="w-full aspect-square bg-black flex items-center justify-center">
                <img src={selectedPhoto?.url} className="w-full h-full object-contain" alt="" referrerPolicy="no-referrer" />
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase">
                      {selectedPhoto?.uploaderName.slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{selectedPhoto?.uploaderName}</p>
                      <p className="text-[10px] text-gray-400">{selectedPhoto ? new Date(selectedPhoto.timestamp).toLocaleString() : ''}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-gray-400">
                    <Heart size={18} />
                    <Share2 size={18} />
                  </div>
                </div>

                {selectedPhoto?.caption && (
                  <p className="text-sm text-gray-600 leading-relaxed italic">
                    {selectedPhoto.uploader !== 'user' ? `“${selectedPhoto.caption}”` : selectedPhoto.caption}
                  </p>
                )}

                {selectedPhoto?.uploader !== 'user' && selectedPhoto?.description && (
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">AI 画面描述</p>
                    <p className="text-xs text-gray-500 leading-relaxed italic">"{selectedPhoto.description}"</p>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">AI 评价 ({selectedPhoto?.aiComments.length})</h4>
                  {selectedPhoto?.aiComments.length === 0 ? (
                    <p className="text-xs text-gray-300 italic">暂无评价...</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedPhoto?.aiComments.map((comment, idx) => (
                        <div key={idx} className={cn("flex gap-3 items-start", comment.role === 'user' && "flex-row-reverse")}>
                          <img 
                            src={comment.charId === 'user' ? state.myProfile.avatar : availableAIs.find(a => a.id === comment.charId)?.avatar} 
                            className="w-8 h-8 rounded-full border border-gray-100 object-cover" 
                            alt="" 
                          />
                          <div className={cn(
                            "flex-1 rounded-2xl p-4 border",
                            comment.role === 'user' ? "bg-white border-gray-100" : "bg-gray-50/50 border-gray-100"
                          )}>
                            <div className="flex justify-between items-center mb-1">
                              <p className={cn("text-[10px] font-bold", comment.role === 'user' ? "text-gray-400" : "text-gray-800")}>
                                {comment.charName}
                              </p>
                              {comment.role !== 'user' && (
                                <button 
                                  onClick={() => setIsReplyingTo(comment.charId)}
                                  className="text-[9px] text-gray-400 hover:text-gray-600 font-bold uppercase tracking-widest"
                                >
                                  回复
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {isReplyingTo && (
                  <div className="pt-4 border-t border-gray-100 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">回复 {availableAIs.find(a => a.id === isReplyingTo)?.name}</p>
                      <button onClick={() => setIsReplyingTo(null)} className="text-gray-300 hover:text-gray-400"><X size={12} /></button>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="输入回复..."
                        className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 ring-gray-200"
                        onKeyDown={e => e.key === 'Enter' && handleUserReply(isReplyingTo)}
                      />
                      <button 
                        onClick={() => handleUserReply(isReplyingTo)}
                        className="p-2 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeAlbumId ? (
            <motion.div 
              key="album-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              {activeAlbum?.photos.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                    <ImageIcon className="text-gray-200" size={32} />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">还没有照片哦，快去上传吧</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {activeAlbum?.photos.map(photo => (
                    <motion.div 
                      key={photo.id} 
                      layoutId={photo.id}
                      onClick={() => setSelectedPhotoId(photo.id)}
                      className="aspect-square bg-gray-50 relative overflow-hidden cursor-pointer"
                    >
                      <img src={photo.url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      {photo.uploader !== 'user' && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <ImageIcon size={16} className="text-white/50" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="album-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 grid grid-cols-2 gap-4"
            >
              {albums.map(album => (
                <div
                  key={album.id}
                  onClick={() => setActiveAlbumId(album.id)}
                  className="group relative aspect-square bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all"
                >
                  {album.photos.length > 0 ? (
                    <img src={album.photos[0].url} className="w-full h-full object-cover" alt={album.name} referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <ImageIcon className="text-gray-200" size={40} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <h3 className="text-white font-bold text-sm truncate">{album.name}</h3>
                        <p className="text-white/70 text-[10px] uppercase tracking-widest">{album.photos.length} Photos</p>
                      </div>
                      {album.isShared && <Users size={14} className="text-blue-400 flex-shrink-0" />}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteAlbum(album.id); }}
                    className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/20"
                  >
                    <Trash2 size={14} className="text-white" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Album Modal */}
      <AnimatePresence>
        {isCreatingAlbum && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCreatingAlbum(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100"
            >
              <h3 className="font-serif italic font-bold text-lg text-gray-800 mb-6 text-center uppercase tracking-tight">新建相册</h3>
              <input 
                autoFocus
                type="text" 
                value={newAlbumName}
                onChange={e => setNewAlbumName(e.target.value)}
                placeholder="相册名称"
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 ring-gray-100 transition-all mb-6"
              />
              <div className="flex gap-3">
                <button onClick={() => setIsCreatingAlbum(false)} className="flex-1 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition-colors">取消</button>
                <button onClick={createAlbum} className="flex-1 py-4 rounded-2xl text-sm font-bold bg-gray-800 text-white shadow-lg shadow-gray-100 hover:bg-gray-900 transition-all">创建</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sharing Modal */}
      <AnimatePresence>
        {isSharing && (
          <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSharing(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-white rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl border border-gray-100 max-h-[80vh] flex flex-col"
            >
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8 sm:hidden" />
              <h3 className="font-serif italic font-bold text-lg text-gray-800 mb-2 text-center uppercase tracking-tight">共享设置</h3>
              <p className="text-[10px] text-gray-400 text-center uppercase tracking-[0.2em] mb-8">选择共享的 AI 伙伴</p>
              
              <div className="flex-1 overflow-y-auto space-y-3 mb-8">
                {availableAIs.map(ai => {
                  const isSelected = selectedAIForSharing.includes(ai.id);
                  return (
                    <button 
                      key={ai.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedAIForSharing(selectedAIForSharing.filter(id => id !== ai.id));
                        } else {
                          setSelectedAIForSharing([...selectedAIForSharing, ai.id]);
                        }
                      }}
                      className={cn(
                        "w-full p-4 rounded-2xl border flex items-center justify-between transition-all",
                        isSelected ? "bg-gray-50 border-gray-200" : "bg-white border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <img src={ai.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-700">{ai.name}</p>
                          <p className="text-[10px] text-gray-400 line-clamp-1">{ai.persona}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        isSelected ? "bg-gray-800 border-gray-800 text-white" : "border-gray-100"
                      )}>
                        {isSelected && <Check size={14} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={toggleSharing}
                className="w-full py-5 rounded-3xl font-bold text-sm bg-gray-800 text-white shadow-xl shadow-gray-100 hover:bg-gray-900 active:scale-95 transition-all"
              >
                确认共享
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoApp;
