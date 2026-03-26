import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  History, 
  Users, 
  User, 
  Library,
  ArrowLeft, 
  Plus,
  Check
} from 'lucide-react';
import { cn } from '../utils/cn';

// Import sub-views
import HomeView from './galagame/HomeView';
import RecordsView from './galagame/RecordsView';
import CommunityView from './galagame/CommunityView';
import ProfileView from './galagame/ProfileView';
import MyWorksView from './galagame/MyWorksView';
import GameDetailView from './galagame/GameDetailView';
import StoreView from './galagame/StoreView';
import WorldviewGenerator from './galagame/WorldviewGenerator';
import CreationFlow from './galagame/CreationFlow';
import SettingsView from './galagame/SettingsView';

interface GalaGameAppProps {
  onClose: () => void;
  language?: string;
}

type Tab = 'home' | 'records' | 'community' | 'profile' | 'my-works';

const GalaGameApp: React.FC<GalaGameAppProps> = ({ onClose, language = 'zh' }) => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [showStore, setShowStore] = useState(false);
  const [showWorldview, setShowWorldview] = useState(false);
  const [showCreationFlow, setShowCreationFlow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [worldviews, setWorldviews] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView 
            onSelectGame={setSelectedGame} 
            onOpenStore={() => setShowStore(true)}
            onImportGame={() => showToast('作品导入功能开发中...')}
          />
        );
      case 'records':
        return <RecordsView onSelectGame={setSelectedGame} />;
      case 'community':
        return <CommunityView />;
      case 'profile':
        return (
          <ProfileView 
            onOpenWorldview={() => setShowWorldview(true)} 
            onOpenSettings={() => setShowSettings(true)}
          />
        );
      case 'my-works':
        return <MyWorksView onOpenCreationFlow={() => setShowCreationFlow(true)} />;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 z-50 bg-white flex flex-col font-sans text-gray-900"
    >
      {/* System Header */}
      <div className="h-12 border-b border-gray-100 flex items-center justify-between px-6 bg-white z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-none animate-pulse" />
            <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-gray-400">system.active</span>
          </div>
          <div className="h-3 w-px bg-gray-100" />
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-gray-400">v2.4.0_stable</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[8px] font-mono font-bold text-gray-900 tracking-widest">15:27:00</span>
          <button 
            onClick={onClose}
            className="w-4 h-4 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <div className="w-full h-[1px] bg-gray-900 rotate-45 absolute" />
            <div className="w-full h-[1px] bg-gray-900 -rotate-45 absolute" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedGame && (
          <GameDetailView 
            game={selectedGame} 
            onClose={() => setSelectedGame(null)} 
          />
        )}
        {showStore && (
          <StoreView onClose={() => setShowStore(null)} />
        )}
        {showWorldview && (
          <WorldviewGenerator 
            onClose={() => setShowWorldview(false)} 
            onSave={(wv) => {
              setWorldviews(prev => [...prev, wv]);
              setShowWorldview(false);
              showToast('世界观保存成功');
            }}
          />
        )}
        {showCreationFlow && (
          <CreationFlow 
            onClose={() => setShowCreationFlow(false)} 
            worldviews={worldviews}
            onPublish={(work) => {
              setShowCreationFlow(false);
              showToast('作品发布成功');
            }}
          />
        )}
        {showSettings && (
          <SettingsView onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 bg-gray-900 text-white text-[9px] font-bold uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl"
          >
            <Check className="w-3 h-3 text-green-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <div className="h-24 bg-white border-t border-gray-100 flex items-center justify-around px-4 pb-6 z-40">
        {[
          { id: 'home', icon: Gamepad2, label: '首页' },
          { id: 'records', icon: History, label: '记录' },
          { id: 'community', icon: Users, label: '社区' },
          { id: 'profile', icon: User, label: '我的' },
          { id: 'my-works', icon: Library, label: '作品' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex flex-col items-center gap-2 transition-all relative px-2",
              activeTab === tab.id ? "text-gray-900" : "text-gray-300 hover:text-gray-600"
            )}
          >
            <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "stroke-[1.5px]" : "stroke-[1px]")} />
            <span className="text-[7px] font-bold tracking-[0.3em] uppercase">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="gala-tab-active"
                className="absolute -top-10 w-1 h-1 bg-gray-900 rounded-none"
              />
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default GalaGameApp;
