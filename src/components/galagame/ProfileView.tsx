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
  Camera,
  Plus,
  X,
  Map,
  BookOpen,
  User
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { compressImage } from '../../utils/image';

interface ProfileViewProps {
  onOpenProtagonist: () => void;
  onOpenWorldview: () => void;
  onOpenSettings: () => void;
  onOpenCharacters: () => void;
  onOpenScenes: () => void;
  onOpenStyles: () => void;
  appState: any;
  updateState: (key: string, value: any) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onOpenProtagonist, onOpenWorldview, onOpenSettings, onOpenCharacters, onOpenScenes, onOpenStyles, appState, updateState }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(appState.currentUser?.nickname || '芙糕');
  const [editSignature, setEditSignature] = useState(appState.galaSignature || '在文字的世界里寻找永恒的瞬间。');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCharacters, setShowCharacters] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharDesc, setNewCharDesc] = useState('');

  const profile = {
    name: appState.currentUser?.nickname || '我',
    signature: appState.galaSignature || '在文字的世界里寻找永恒的瞬间。',
    avatar: appState.currentUser?.avatar || 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAERgJFpq-WeW_-xUHBIWvNPyriVIFcZGAACpx4AAlIUYFXjvsH9dX3zKzoE.jpeg'
  };

  const characters = appState.galaCharacters || [];

  const handleSaveProfile = () => {
    updateState('currentUser', { ...appState.currentUser, nickname: editName });
    updateState('galaSignature', editSignature);
    setIsEditing(false);
  };

  const handleAddCharacter = () => {
    if (!newCharName.trim()) return;
    const char = { name: newCharName, desc: newCharDesc };
    updateState('galaCharacters', [...characters, char]);
    setNewCharName('');
    setNewCharDesc('');
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
            <img src={profile.avatar} className="w-full h-full object-cover transition-all duration-1000" referrerPolicy="no-referrer" />
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
            编辑资料
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
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.25em] leading-relaxed max-w-[240px] opacity-60 mx-auto">
              {profile.signature}
            </p>
          </div>
        )}
      </div>

      {/* Main Menu */}
      <div className="border-l border-t border-gray-100">
        {[
          { icon: User, label: '主人公（我）设定', action: onOpenProtagonist, desc: '游玩时的主管视点人设' },
          { icon: Sparkles, label: '我的世界观', action: onOpenWorldview, desc: 'AI生成的叙事架构' },
          { icon: Users, label: '我的角色', action: onOpenCharacters, desc: '管理创作角色库' },
          { icon: Map, label: '我的场景', action: onOpenScenes, desc: '故事发生地点集合' },
          { icon: BookOpen, label: '文风设置', action: onOpenStyles, desc: 'AI创写参考文风' },
          { icon: Heart, label: '我的收藏', action: () => alert('收藏功能开发中'), desc: '收藏的作品与剧本' },
          { icon: Inbox, label: '消息通知', action: () => alert('消息中心开发中'), desc: '社区互动内容' },
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
                {item.desc && <span className="text-[6px] font-mono text-gray-400 uppercase tracking-widest mt-1">{item.desc}</span>}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ChevronRight className="w-4 h-4 text-gray-100 group-hover:text-gray-900 transition-colors" strokeWidth={1} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileView;
