import React, { useState } from 'react';
import { MessageSquare, Heart, Plus, User, Clock, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CommunityViewProps {
  appState: any;
  updateState: (key: string, value: any) => void;
}

const CommunityView: React.FC<CommunityViewProps> = ({ appState, updateState }) => {
  const [activeTab, setActiveTab] = useState<'hot' | 'latest'>('hot');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');

  const posts = appState.galaPosts || [];

  const handleLike = (id: number) => {
    const updatedPosts = posts.map((p: any) => 
      p.id === id ? { ...p, likes: p.likes + 1 } : p
    );
    updateState('galaPosts', updatedPosts);
  };

  const handlePost = () => {
    if (!newPostTitle.trim()) return;
    const newPost = {
      id: Date.now(),
      title: newPostTitle,
      author: appState.currentUser?.nickname || '我',
      likes: 0,
      comments: 0,
      time: '刚刚',
      tags: ['日常']
    };
    updateState('galaPosts', [newPost, ...posts]);
    setShowNewPost(false);
    setNewPostTitle('');
  };

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
        {posts.map((post: any) => (
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
              {post.tags.map((tag: string) => (
                <span key={tag} className="text-[7px] text-gray-300 border border-gray-100 px-2 py-0.5 uppercase tracking-widest">#{tag}</span>
              ))}
            </div>

            <div className="flex items-center gap-8">
              <button 
                onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Heart className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-[9px] font-mono font-bold">{post.likes}</span>
              </button>
              <div className="flex items-center gap-2 text-gray-300 group-hover:text-gray-900 transition-colors">
                <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-[9px] font-mono font-bold">{post.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowNewPost(true)}
        className="fixed bottom-28 right-8 w-14 h-14 bg-gray-900 text-white flex items-center justify-center hover:bg-black transition-all shadow-2xl z-20"
      >
        <Plus className="w-6 h-6" strokeWidth={1.5} />
      </button>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
            <button onClick={() => setShowNewPost(false)} className="p-2">
              <X className="w-5 h-5 text-gray-900" />
            </button>
            <h2 className="text-[10px] font-serif italic font-bold tracking-[0.3em] uppercase text-gray-900">New Post</h2>
            <button onClick={handlePost} className="text-[10px] font-bold uppercase tracking-widest text-gray-900 px-4 py-2 border border-gray-900 hover:bg-gray-900 hover:text-white transition-colors">
              Post
            </button>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4">
            <textarea 
              placeholder="Share your thoughts..." 
              value={newPostTitle}
              onChange={e => setNewPostTitle(e.target.value)}
              className="flex-1 resize-none text-[14px] font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityView;
