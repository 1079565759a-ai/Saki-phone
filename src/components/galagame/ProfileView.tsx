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
  X
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
          { icon: Sparkles, label: '我的世界观', action: onOpenWorldview, desc: 'AI生成的叙事架构' },
          { icon: Users, label: '我的角色', action: () => setShowCharacters(true), desc: '管理创作角色库' },
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

      {/* Characters Modal */}
      {showCharacters && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-white px-8 py-16 flex flex-col"
        >
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-[12px] font-serif italic font-bold uppercase tracking-[0.4em] text-gray-900">我的角色</h2>
            <button onClick={() => setShowCharacters(false)} className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900">返回</button>
          </div>

          <div className="space-y-8 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <label className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300">新增角色</label>
              <input 
                type="text" 
                value={newCharName}
                onChange={e => setNewCharName(e.target.value)}
                placeholder="角色名字..." 
                className="w-full text-[12px] font-bold uppercase tracking-widest text-gray-900 border-b border-gray-100 focus:border-gray-900 focus:outline-none pb-4 transition-colors"
                autoComplete="off"
              />
              <input 
                type="text" 
                value={newCharDesc}
                onChange={e => setNewCharDesc(e.target.value)}
                placeholder="角色简述（例如：温柔的文学少女）..." 
                className="w-full text-[10px] text-gray-500 uppercase tracking-widest border-b border-gray-100 focus:border-gray-900 focus:outline-none pb-4 transition-colors mt-4"
                autoComplete="off"
              />
              <button 
                onClick={handleAddCharacter}
                className="w-full py-4 bg-gray-900 text-white text-[9px] font-bold tracking-[0.4em] uppercase"
              >
                保存角色
              </button>
            </div>

            <div className="pt-8">
              <label className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300 mb-4 block">角色列表</label>
              <div className="space-y-4">
                {characters.length === 0 ? (
                  <p className="text-[10px] text-gray-400">目前还没有保存的角色。</p>
                ) : (
                  characters.map((c: any, i: number) => (
                    <div key={i} className="p-4 border border-gray-100 relative group flex flex-col gap-1">
                      <h4 className="text-[11px] font-bold text-gray-900">{c.name}</h4>
                      <p className="text-[9px] text-gray-500">{c.desc}</p>
                      <button 
                        onClick={() => {
                          const newArr = characters.filter((_, idx) => idx !== i);
                          updateState('galaCharacters', newArr);
                        }}
                        className="absolute right-4 top-4 text-gray-200 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfileView;
