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
  Check,
  X
} from 'lucide-react';
import { cn } from '../utils/cn';

// Import sub-views
import HomeView from './galagame/HomeView';
import CommunityView from './galagame/CommunityView';
import ProfileView from './galagame/ProfileView';
import MyWorksView from './galagame/MyWorksView';
import GameDetailView from './galagame/GameDetailView';
import StoreView from './galagame/StoreView';
import WorldviewGenerator from './galagame/WorldviewGenerator';
import CreationFlow from './galagame/CreationFlow';
import SettingsView from './galagame/SettingsView';
import Splash from './Splash';

interface GalaGameAppProps {
  onClose: () => void;
  language?: string;
  isFullscreen?: boolean;
  appState: any;
  updateState: (key: string, value: any) => void;
}

type Tab = 'home' | 'records' | 'community' | 'profile' | 'my-works';

const GalaGameApp: React.FC<GalaGameAppProps> = ({ onClose, language = 'zh', isFullscreen, appState, updateState }) => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [showStore, setShowStore] = useState(false);
  const [showWorldview, setShowWorldview] = useState(false);
  const [showCreationFlow, setShowCreationFlow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const worldviews = appState.galaWorldviews || [];

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
            onImportGame={() => showToast('Import feature coming soon...')}
            appState={appState}
            updateState={updateState}
            onClose={onClose}
          />
        );
      case 'community':
        return <CommunityView appState={appState} updateState={updateState} />;
      case 'profile':
        return (
          <ProfileView 
            onOpenWorldview={() => setShowWorldview(true)} 
            onOpenSettings={() => setShowSettings(true)}
            appState={appState}
            updateState={updateState}
          />
        );
      case 'my-works':
        return <MyWorksView onOpenCreationFlow={() => setShowCreationFlow(true)} appState={appState} updateState={updateState} />;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 z-[100] bg-gradient-to-b from-[#fdfbfb] to-[#f5f1f0] flex flex-col font-sans text-gray-900 overflow-hidden"
    >
      {showSplash && <Splash onComplete={() => setShowSplash(false)} />}

      {/* Universal Exit Button */}
      {!isFullscreen && (
        <button 
          onClick={onClose}
          className="absolute top-10 right-6 z-[200] p-2 bg-white/50 backdrop-blur-md rounded-full shadow-[0_2px_8px_rgba(212,154,159,0.2)] border border-[#fcefee] text-[#c5a3a5] transition-all focus:outline-none flex items-center justify-center hover:bg-white active:scale-95"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 pt-4">
        {renderContent()}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedGame && (
          <GameDetailView 
            game={selectedGame} 
            onClose={() => setSelectedGame(null)} 
            appState={appState}
            updateState={updateState}
          />
        )}
        {showStore && (
          <StoreView 
            onClose={() => setShowStore(false)} 
            appState={appState}
            updateState={updateState}
          />
        )}
        {showWorldview && (
          <WorldviewGenerator 
            onClose={() => setShowWorldview(false)} 
            onSave={(wv) => {
              updateState('galaWorldviews', [...worldviews, wv]);
              setShowWorldview(false);
              showToast('世界观保存成功');
            }}
            appState={appState}
            updateState={updateState}
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
            appState={appState}
            updateState={updateState}
          />
        )}
        {showSettings && (
          <SettingsView 
            onClose={() => setShowSettings(false)} 
            appState={appState}
            updateState={updateState}
          />
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
      <div className="h-24 bg-white/80 backdrop-blur-md border-t border-[#fcefee] flex items-center justify-around px-4 pb-6 z-40 relative">
        {[
          { id: 'home', icon: Gamepad2, label: '首页' },
          { id: 'my-works', icon: Library, label: '创作' },
          { id: 'community', icon: Users, label: '社区' },
          { id: 'profile', icon: User, label: '我的' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex flex-col items-center gap-2 transition-all relative px-2 py-2 rounded-xl",
              activeTab === tab.id ? "text-[#d49a9f]" : "text-[#c9b8b8] hover:text-[#c5a3a5]"
            )}
          >
            <tab.icon className={cn("w-6 h-6", activeTab === tab.id ? "stroke-[2px]" : "stroke-[1.5px]")} />
            <span className="text-[10px] font-bold tracking-widest">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="sakulove-tab-active"
                className="absolute -top-3 w-1.5 h-1.5 bg-[#d49a9f] rounded-full shadow-[0_0_8px_rgba(212,154,159,0.5)]"
              />
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default GalaGameApp;
