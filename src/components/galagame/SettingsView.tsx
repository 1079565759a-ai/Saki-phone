import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Monitor, 
  Bell, 
  Shield, 
  Database, 
  Info,
  Smartphone,
  Check
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SettingsViewProps {
  onClose: () => void;
  appState: any;
  updateState: (key: string, value: any) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onClose, appState, updateState }) => {
  const [activeSection, setActiveSection] = useState<'main' | 'interface' | 'api'>('main');

  const [customApiKey, setCustomApiKey] = useState(localStorage.getItem('custom_api_key') || '');
  const [customApiUrl, setCustomApiUrl] = useState(localStorage.getItem('custom_api_url') || '');
  const [customApiModel, setCustomApiModel] = useState(localStorage.getItem('custom_api_model') || 'gemini-3-flash-preview');

  const handleSaveApiSettings = () => {
    localStorage.setItem('custom_api_key', customApiKey);
    localStorage.setItem('custom_api_url', customApiUrl);
    localStorage.setItem('custom_api_model', customApiModel);
    alert('API 设置已保存');
  };

  const mainSettings = [
    { id: 'api', icon: Database, label: 'API 设置', desc: 'AI Model Options' },
    { id: 'interface', icon: Monitor, label: '界面设置', desc: 'Interface & Display' },
    { id: 'notifications', icon: Bell, label: '通知设置', desc: 'Alerts & Messages' },
    { id: 'privacy', icon: Shield, label: '隐私安全', desc: 'Privacy & Security' },
    { id: 'storage', icon: Database, label: '存储管理', desc: 'Data & Cache' },
    { id: 'about', icon: Info, label: '关于我们', desc: 'Version & Info' },
  ];

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[150] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="h-20 border-b border-gray-100 flex items-center px-8 gap-6 bg-white/90 backdrop-blur-md sticky top-0 z-10">
        <button 
          onClick={() => activeSection === 'main' ? onClose() : setActiveSection('main')}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
        </button>
        <div className="flex flex-col">
          <h2 className="text-[12px] font-serif italic font-bold uppercase tracking-[0.4em] text-gray-900">
            {activeSection === 'main' ? 'Settings' : 'Interface'}
          </h2>
          <span className="text-[6px] font-mono text-gray-300 uppercase tracking-widest mt-0.5">
            {activeSection === 'main' ? 'General Configuration' : 'Display Preferences'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeSection === 'main' ? (
            <motion.div 
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="divide-y divide-gray-50"
            >
              {mainSettings.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className="p-8 flex items-center justify-between hover:bg-gray-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 border border-gray-100 flex items-center justify-center bg-white group-hover:border-gray-900 transition-colors">
                      <item.icon className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors" strokeWidth={1} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">{item.label}</span>
                      <span className="text-[6px] font-mono text-gray-300 uppercase tracking-widest mt-1">{item.desc}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-100 group-hover:text-gray-900 transition-colors" strokeWidth={1} />
                </div>
              ))}

              {/* Quick Access Toggle: Small Phone Full Screen Mode */}
              <div className="p-8 space-y-6 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 border border-gray-900 flex items-center justify-center bg-white">
                      <Smartphone className="w-4 h-4 text-gray-900" strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">小手机全屏模式</span>
                      <span className="text-[6px] font-mono text-gray-400 uppercase tracking-widest mt-1">Quick Toggle: Full Screen</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => updateState('isFullscreen', !appState.isFullscreen)}
                    className={cn(
                      "w-12 h-6 border transition-all relative flex items-center px-1",
                      appState.isFullscreen ? "bg-gray-900 border-gray-900" : "bg-white border-gray-200"
                    )}
                  >
                    <motion.div 
                      animate={{ x: appState.isFullscreen ? 24 : 0 }}
                      className={cn(
                        "w-4 h-4",
                        appState.isFullscreen ? "bg-white" : "bg-gray-200"
                      )}
                    />
                  </button>
                </div>
                <p className="text-[8px] text-gray-400 leading-relaxed uppercase tracking-wider opacity-60">
                  开启后，应用将针对小屏幕手机进行全屏适配，隐藏多余的边距和系统装饰。
                </p>
              </div>
            </motion.div>
          ) : activeSection === 'interface' ? (
            <motion.div 
              key="interface"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8 space-y-12"
            >
              {/* Interface Settings (Placeholders) */}
              <div className="space-y-8">
                <div className="flex items-center justify-between opacity-40 grayscale">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-900">深色模式</span>
                  <div className="w-12 h-6 border border-gray-100 bg-gray-50" />
                </div>
                <div className="flex items-center justify-between opacity-40 grayscale">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-900">字体大小</span>
                  <span className="text-[8px] font-mono font-bold text-gray-300">MEDIUM</span>
                </div>
              </div>
            </motion.div>
          ) : activeSection === 'api' ? (
            <motion.div 
              key="api"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8 space-y-8"
            >
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900 block mb-2">Gemini API Key</label>
                  <input type="password" value={customApiKey} onChange={e => setCustomApiKey(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-3 text-xs" placeholder="AI Studio Key..." />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900 block mb-2">Base URL (可为空)</label>
                  <input type="text" value={customApiUrl} onChange={e => setCustomApiUrl(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-3 text-xs" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900 block mb-2">Model</label>
                  <input type="text" value={customApiModel} onChange={e => setCustomApiModel(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-3 text-xs" placeholder="gemini-3-flash-preview" />
                </div>
                <button onClick={handleSaveApiSettings} className="w-full py-4 bg-gray-900 text-white font-bold tracking-[0.2em] text-[10px]">保存 API 设置</button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="p-8 border-t border-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-[7px] font-mono text-gray-200 uppercase tracking-widest">Build.ID: 20260326.1540</span>
          <span className="text-[7px] font-mono text-gray-200 uppercase tracking-widest">樱咲Gal机.OS</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsView;
