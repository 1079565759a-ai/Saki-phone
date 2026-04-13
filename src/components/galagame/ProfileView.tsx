import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Heart, 
  Star, 
  MessageSquare, 
  ChevronRight, 
  Globe, 
  Users, 
  Mail, 
  Inbox,
  Sparkles,
  Camera
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { compressImage } from '../../utils/image';

interface ProfileViewProps {
  onOpenWorldview: () => void;
  onOpenSettings: () => void;
  appState: any;
  updateState: (key: string, value: any) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onOpenWorldview, onOpenSettings, appState, updateState }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(appState.currentUser?.nickname || '芙糕');
  const [editSignature, setEditSignature] = useState(appState.galaSignature || '在文字的世界里寻找永恒的瞬间。');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profile = {
    name: appState.currentUser?.nickname || '芙糕',
    signature: appState.galaSignature || '在文字的世界里寻找永恒的瞬间。',
    avatar: appState.currentUser?.avatar || 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAERgJFpq-WeW_-xUHBIWvNPyriVIFcZGAACpx4AAlIUYFXjvsH9dX3zKzoE.jpeg'
  };

  const stats = [
    { label: 'Followers', value: '856', icon: Users },
    { label: 'Likes', value: '3.2k', icon: Heart },
    { label: 'Comments', value: '156', icon: MessageSquare },
  ];

  const handleSaveProfile = () => {
    updateState('currentUser', { ...appState.currentUser, nickname: editName });
    updateState('galaSignature', editSignature);
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImage(file);
      updateState('currentUser', { ...appState.currentUser, avatar: compressedDataUrl });
    } catch (error) {
      console.error("Failed to process image", error);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-12 pb-24 space-y-16">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />
      {/* Profile Header */}
      <div className="flex flex-col items-center space-y-8">
        <div className="w-32 h-32 rounded-none border border-gray-100 p-2 bg-white relative group">
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-gray-900" />
          <div className="absolute inset-0 bg-gray-900 translate-x-1 translate-y-1 -z-10 opacity-5 group-hover:opacity-10 transition-opacity" />
          <div className="w-full h-full rounded-none bg-gray-50 overflow-hidden border border-gray-100 relative">
            <img src={profile.avatar} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" referrerPolicy="no-referrer" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute -bottom-2 -left-2 px-4 py-1.5 bg-gray-900 text-white text-[7px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all"
          >
            Edit.Profile
          </button>
        </div>

        {isEditing ? (
          <div className="w-full max-w-xs space-y-4">
            <input 
              type="text" 
              value={editName} 
              onChange={e => setEditName(e.target.value)}
              className="w-full text-center text-[16px] font-serif italic font-bold uppercase tracking-[0.4em] text-gray-900 border-b border-gray-900 focus:outline-none pb-2"
            />
            <input 
              type="text" 
              value={editSignature} 
              onChange={e => setEditSignature(e.target.value)}
              className="w-full text-center text-[9px] text-gray-400 font-bold uppercase tracking-[0.25em] border-b border-gray-300 focus:outline-none pb-2"
            />
            <div className="flex justify-center gap-4 pt-4">
              <button onClick={() => setIsEditing(false)} className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Cancel</button>
              <button onClick={handleSaveProfile} className="text-[9px] font-bold uppercase tracking-widest text-gray-900">Save</button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <h2 className="text-[16px] font-serif italic font-bold uppercase tracking-[0.4em] text-gray-900">{profile.name}</h2>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.25em] leading-relaxed max-w-[240px] opacity-60">
              {profile.signature}
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <p className="text-[8px] text-gray-300 font-mono font-bold uppercase tracking-[0.2em]">User.ID: 26039482</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 border-l border-t border-gray-100">
        {stats.map((stat, idx) => (
          <div key={idx} className="text-center p-6 bg-white border-r border-b border-gray-100 group cursor-pointer hover:bg-gray-50 transition-all">
            <div className="text-base font-serif italic font-bold text-gray-900">{stat.value}</div>
            <div className="text-[7px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2 group-hover:text-gray-900 transition-colors">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-2 gap-px bg-gray-100 border border-gray-100">
        {[
          { icon: Inbox, label: '提问箱', count: 12 },
          { icon: Mail, label: '私信', count: 5 },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 flex flex-col items-center gap-3 hover:bg-gray-50 transition-all cursor-pointer group">
            <item.icon className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-colors" strokeWidth={1} />
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-900">{item.label}</span>
              <span className="text-[7px] font-mono font-bold text-gray-300">[{item.count}]</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Menu */}
      <div className="border-l border-t border-gray-100">
        {[
          { icon: Sparkles, label: '我的世界观', action: onOpenWorldview, desc: 'AI Generated Narratives' },
          { icon: Users, label: '我的角色', action: () => {}, desc: 'Character Management' },
          { icon: Star, label: '我的评价', action: () => {}, count: 8 },
          { icon: Heart, label: '我的收藏', action: () => {}, count: 24 },
          { icon: Settings, label: '通用设置', action: onOpenSettings },
        ].map((item, idx) => (
          <div 
            key={idx} 
            onClick={item.action}
            className="flex items-center justify-between p-6 bg-white border-r border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all group"
          >
            <div className="flex items-center gap-5">
              <item.icon className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors" strokeWidth={1} />
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">{item.label}</span>
                {item.desc && <span className="text-[6px] font-mono text-gray-300 uppercase tracking-widest mt-1">{item.desc}</span>}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {item.count !== undefined && item.count !== null && <span className="text-[8px] text-gray-300 font-mono font-bold">[{item.count}]</span>}
              <ChevronRight className="w-4 h-4 text-gray-100 group-hover:text-gray-900 transition-colors" strokeWidth={1} />
            </div>
          </div>
        ))}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-white px-8 py-16 flex flex-col"
        >
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-[12px] font-serif italic font-bold uppercase tracking-[0.4em] text-gray-900">Edit Profile</h2>
            <button onClick={() => setIsEditing(false)} className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900">Cancel</button>
          </div>

          <div className="space-y-12 flex-1">
            <div className="space-y-4">
              <label className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300">Display Name</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full py-4 bg-white border-b border-gray-100 text-[11px] font-bold uppercase tracking-[0.2em] outline-none focus:border-gray-900 transition-all"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300">Signature</label>
              <textarea 
                value={profile.signature}
                onChange={e => setProfile(prev => ({ ...prev, signature: e.target.value }))}
                className="w-full py-4 bg-white border-b border-gray-100 text-[11px] font-bold uppercase tracking-[0.2em] outline-none focus:border-gray-900 transition-all resize-none h-32"
              />
            </div>
          </div>

          <button 
            onClick={() => setIsEditing(false)}
            className="w-full py-5 bg-gray-900 text-white text-[10px] font-bold tracking-[0.4em] uppercase"
          >
            Save Changes
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ProfileView;
