import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Radio as RadioIcon, 
  Users, 
  User, 
  ArrowLeft, 
  Search, 
  Play, 
  Plus,
  Heart,
  Disc,
  Music,
  Headphones,
  ChevronRight,
  Upload,
  History
} from 'lucide-react';
import { cn } from '../utils/cn';

interface RadioAppProps {
  onClose: () => void;
  language?: string;
  isFullscreen?: boolean;
}

type Tab = 'home' | 'together' | 'profile';

const RadioApp: React.FC<RadioAppProps> = ({ onClose, language = 'zh', isFullscreen }) => {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const isEn = language === 'en';

  const recommendations = [
    { id: 1, title: isEn ? 'Lazy Afternoon' : '午后慵懒', artist: isEn ? 'Fugao' : '芙糕', cover: 'https://picsum.photos/seed/music1/300/300' },
    { id: 2, title: 'Cyber Beat', artist: isEn ? 'Bear' : '福熊儿', cover: 'https://picsum.photos/seed/music2/300/300' },
    { id: 3, title: isEn ? 'Sakura Rain' : '樱花雨下', artist: isEn ? 'Sakura' : '樱', cover: 'https://picsum.photos/seed/music3/300/300' },
    { id: 4, title: 'Starry Walk', artist: 'AI Companion', cover: 'https://picsum.photos/seed/music4/300/300' },
  ];

  const aiContacts = [
    { id: 1, name: isEn ? 'Bear' : '福熊儿', status: isEn ? 'Listening: Lazy Afternoon' : '正在听: 午后慵懒', avatar: 'https://picsum.photos/seed/bear/100/100' },
    { id: 2, name: isEn ? 'Fugao' : '芙糕', status: isEn ? 'Online' : '在线', avatar: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAERgJFpq-WeW_-xUHBIWvNPyriVIFcZGAACpx4AAlIUYFXjvsH9dX3zKzoE.jpeg' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder={isEn ? "Search music..." : "搜索音乐、电台..."} 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#2D2D2D] rounded-none text-sm outline-none focus:border-black transition-colors"
              />
            </div>

            <section>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-xl font-serif font-bold">{isEn ? 'Daily Picks' : '今日推荐'}</h2>
                <span className="text-[10px] uppercase tracking-widest text-gray-400">Discover</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {recommendations.map(item => (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="aspect-square bg-gray-100 border border-[#2D2D2D] overflow-hidden relative mb-2 shadow-sm">
                      <img src={item.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 fill-current text-black ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold truncate">{item.title}</h3>
                    <p className="text-[10px] text-gray-400">{item.artist}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-serif font-bold mb-4">{isEn ? 'Hot Playlists' : '热门歌单'}</h2>
              <div className="space-y-3">
                {(isEn ? ['Healing Vibes', 'Focus BGM', 'Midnight Radio'] : ['治愈系奶白风', '工作专注BGM', '深夜emo电台']).map((title, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-white border border-[#2D2D2D] hover:bg-gray-50 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-gray-100 flex items-center justify-center border border-[#2D2D2D]">
                      <Music className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold">{title}</h4>
                      <p className="text-[10px] text-gray-400">{isEn ? '24 Songs · 1.2w Likes' : '24首歌曲 · 1.2w人收藏'}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
      case 'together':
        return (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            <div className="text-center py-8">
              <div className="inline-flex p-4 rounded-full bg-pink-50 mb-4">
                <Headphones className="w-8 h-8 text-pink-200" />
              </div>
              <h2 className="text-xl font-serif font-bold">一起听</h2>
              <p className="text-xs text-gray-400 mt-2">邀请你的AI伙伴，共享音乐时光</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">在线联系人</h3>
              {aiContacts.map(contact => (
                <div key={contact.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-black/5 hover:border-pink-100 transition-all cursor-pointer group">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-black/5">
                      <img src={contact.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold">{contact.name}</h4>
                    <p className="text-[10px] text-pink-300 font-medium">{contact.status}</p>
                  </div>
                  <button className="px-4 py-1.5 rounded-full bg-pink-50 text-pink-400 text-[10px] font-bold hover:bg-pink-100 transition-all">
                    邀请加入
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-50">
                <img src="https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAERgJFpq-WeW_-xUHBIWvNPyriVIFcZGAACpx4AAlIUYFXjvsH9dX3zKzoE.jpeg" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold">芙糕</h2>
                <p className="text-[10px] text-gray-400 tracking-widest uppercase">Premium Member</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-dashed border-black/10 hover:border-pink-200 hover:bg-pink-50/30 transition-all group">
                <Plus className="w-6 h-6 text-gray-300 group-hover:text-pink-200 mb-2" />
                <span className="text-xs font-bold">创建歌单</span>
              </button>
              <button className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-dashed border-black/10 hover:border-pink-200 hover:bg-pink-50/30 transition-all group">
                <Upload className="w-6 h-6 text-gray-300 group-hover:text-pink-200 mb-2" />
                <span className="text-xs font-bold">导入音乐</span>
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">我的歌单</h3>
              {[
                { title: '我喜欢的音乐', count: 128, icon: Heart, color: 'text-pink-400' },
                { title: '最近播放', count: 45, icon: History, color: 'text-blue-400' },
                { title: '本地音乐', count: 12, icon: Disc, color: 'text-gray-400' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-black/5 hover:border-pink-100 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center", item.color.replace('text', 'bg').replace('400', '50'))}>
                      <item.icon className={cn("w-5 h-5", item.color)} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{item.title}</h4>
                      <p className="text-[10px] text-gray-400">{item.count}首歌曲</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-pink-200 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 z-50 bg-[#FDFCF8] flex flex-col font-sans text-[#1A1A1A]"
    >
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-pink-50 bg-white/50 backdrop-blur-md">
        {!isFullscreen && (
          <button onClick={onClose} className="p-2 -ml-2 text-pink-200 hover:text-pink-300 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-sm font-serif font-bold tracking-widest uppercase text-gray-400">Radio</h1>
        <div className="w-10" />
      </div>

      {/* Content */}
      {renderContent()}

      {/* Bottom Nav */}
      <div className="h-20 bg-[#F4F1EA] border-t border-[#2D2D2D] flex items-center justify-around px-4 pb-4">
        {[
          { id: 'home', icon: RadioIcon, label: isEn ? 'Picks' : '推荐' },
          { id: 'together', icon: Users, label: isEn ? 'Together' : '一起听' },
          { id: 'profile', icon: User, label: isEn ? 'Me' : '我的' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              activeTab === tab.id ? "text-[#2D2D2D] scale-110" : "text-[#A19B8A] hover:text-[#2D2D2D]"
            )}
          >
            <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
            <span className="text-[9px] font-bold tracking-tighter uppercase">{tab.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default RadioApp;
