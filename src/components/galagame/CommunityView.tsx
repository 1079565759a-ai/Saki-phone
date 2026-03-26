import React, { useState } from 'react';
import { MessageSquare, Heart, Plus, User, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

const CommunityView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hot' | 'latest'>('hot');

  const posts = [
    { id: 1, title: '《月下孤影》全结局攻略分享！', author: '攻略组-小明', likes: 1250, comments: 88, time: '2小时前', tags: ['攻略', '月下孤影'] },
    { id: 2, title: '大家觉得新出的那个病娇角色怎么样？', author: '路人甲', likes: 450, comments: 230, time: '5小时前', tags: ['讨论', '角色安利'] },
    { id: 3, title: '求推荐一些重口味的恐怖Gal！', author: '恐怖爱好者', likes: 89, comments: 45, time: '昨天', tags: ['求助', '恐怖'] },
    { id: 4, title: '【安利】这个星际背景的世界观绝了', author: '世界观架构师', likes: 2100, comments: 156, time: '3天前', tags: ['安利', '星际'] },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
        {['hot', 'latest'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "flex-1 py-5 text-[10px] font-bold uppercase tracking-[0.4em] transition-all relative",
              activeTab === tab ? "text-gray-900" : "text-gray-300 hover:text-gray-600"
            )}
          >
            {tab === 'hot' ? 'Hot' : 'Latest'}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gray-900" />
            )}
          </button>
        ))}
      </div>

      {/* Post List */}
      <div className="divide-y divide-gray-50">
        {posts.map(post => (
          <div key={post.id} className="p-8 hover:bg-gray-50 transition-all cursor-pointer group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-none border border-gray-100 bg-gray-50 overflow-hidden">
                <img src={`https://picsum.photos/seed/${post.author}/100/100`} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
              </div>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{post.author}</span>
              <span className="text-[8px] text-gray-200 font-mono">/ {post.time}</span>
            </div>
            
            <h3 className="text-[13px] font-bold text-gray-900 leading-relaxed mb-4 group-hover:text-gray-600 transition-colors">{post.title}</h3>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span key={tag} className="text-[7px] text-gray-300 border border-gray-100 px-2 py-0.5 uppercase tracking-widest">#{tag}</span>
              ))}
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-gray-300 group-hover:text-gray-900 transition-colors">
                <Heart className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-[9px] font-mono font-bold">{post.likes}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 group-hover:text-gray-900 transition-colors">
                <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-[9px] font-mono font-bold">{post.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-28 right-8 w-14 h-14 bg-gray-900 text-white flex items-center justify-center hover:bg-black transition-all shadow-2xl z-20">
        <Plus className="w-6 h-6" strokeWidth={1.5} />
      </button>
    </div>
  );
};

export default CommunityView;
