import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Plus, 
  ChevronRight, 
  Image as ImageIcon, 
  Check, 
  User, 
  Globe, 
  Sparkles,
  ChevronDown,
  Camera
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { compressImage } from '../../utils/image';

interface CreationFlowProps {
  onClose: () => void;
  onPublish: (work: any) => void;
  worldviews: any[];
  appState: any;
  updateState: (key: string, value: any) => void;
}

const CreationFlow: React.FC<CreationFlowProps> = ({ onClose, onPublish, worldviews, appState, updateState }) => {
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    intro: '',
    tags: [] as string[],
    orientation: 'bg',
    age: '全年龄',
    cover: 'https://picsum.photos/seed/newgame/1280/720',
    worldview: null as any,
    protagonist: '我',
    otherProtagonists: [] as string[],
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImage(file);
      setFormData(prev => ({ ...prev, cover: compressedDataUrl }));
    } catch (error) {
      console.error("Failed to process image", error);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePublish = () => {
    const newWork = {
      id: Date.now(),
      title: formData.title || 'Untitled',
      author: appState.currentUser?.nickname || '我',
      tags: formData.tags.length > 0 ? formData.tags : ['新作品'],
      cover: formData.cover,
      plays: 0,
      likes: 0
    };
    
    updateState('galaMyGames', [newWork, ...(appState.galaMyGames || [])]);
    onPublish(newWork);
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-12 pb-24">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <div className="space-y-4">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-300">Step 01 / Basic Info</h3>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                Initialize your creative protocol.
              </p>
            </div>

            <div className="space-y-8">
              <div 
                className="aspect-[16/9] relative bg-gray-50 border border-gray-100 group cursor-pointer overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                <img src={formData.cover} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImageIcon className="w-6 h-6 text-gray-900" strokeWidth={1} />
                  <span className="text-[7px] font-bold uppercase tracking-[0.2em] mt-2">Upload Cover</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300">Title / 作品名称</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full py-4 bg-white border-b border-gray-100 text-[11px] font-bold uppercase tracking-[0.2em] outline-none focus:border-gray-900 transition-all"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300">Introduction / 作品简介</label>
                <textarea 
                  value={formData.intro}
                  onChange={e => setFormData(prev => ({ ...prev, intro: e.target.value }))}
                  className="w-full py-4 bg-white border-b border-gray-100 text-[11px] font-bold uppercase tracking-[0.2em] outline-none focus:border-gray-900 transition-all h-32 resize-none"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300">Orientation / 性向</label>
                <div className="grid grid-cols-3 gap-2">
                  {['bg', 'bl', 'gl', 'gb', '人外', '其他'].map(tag => (
                    <button 
                      key={tag}
                      className={cn(
                        "py-3 text-[9px] font-bold tracking-widest uppercase border transition-all",
                        formData.orientation === tag ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-400 border-gray-100"
                      )}
                      onClick={() => setFormData(prev => ({ ...prev, orientation: tag }))}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300">Age Rating / 适玩年龄</label>
                <div className="grid grid-cols-2 gap-2">
                  {['全年龄', '12+', '16+', '18+'].map(tag => (
                    <button 
                      key={tag}
                      className={cn(
                        "py-3 text-[9px] font-bold tracking-widest uppercase border transition-all",
                        formData.age === tag ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-400 border-gray-100"
                      )}
                      onClick={() => setFormData(prev => ({ ...prev, age: tag }))}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-12 pb-24">
            <div className="space-y-4">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-300">Step 02 / Advanced Settings</h3>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                Construct your narrative dimension.
              </p>
            </div>

            <div className="space-y-12">
              {/* Worldview Selection */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300">Select Worldview</h4>
                  <button className="text-[7px] font-bold uppercase tracking-[0.2em] text-gray-900 flex items-center gap-2">
                    <Plus className="w-3 h-3" />
                    New
                  </button>
                </div>
                <div className="space-y-4">
                  {worldviews.length === 0 ? (
                    <div className="p-8 border border-dashed border-gray-100 text-center space-y-4">
                      <Globe className="w-6 h-6 text-gray-200 mx-auto" strokeWidth={1} />
                      <p className="text-[8px] text-gray-300 font-bold uppercase tracking-widest">No Worldviews Available</p>
                    </div>
                  ) : (
                    worldviews.map((wv, i) => (
                      <div 
                        key={i} 
                        onClick={() => setFormData(prev => ({ ...prev, worldview: wv }))}
                        className={cn(
                          "p-6 border transition-all cursor-pointer group relative",
                          formData.worldview === wv ? "border-gray-900 bg-gray-50" : "border-gray-100 bg-white hover:border-gray-900"
                        )}
                      >
                        {formData.worldview === wv && <Check className="absolute top-2 right-2 w-3 h-3 text-gray-900" />}
                        <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-2">Worldview #{i + 1}</p>
                        <p className="text-[8px] text-gray-500 line-clamp-2 uppercase tracking-widest">{wv.background}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Protagonist */}
              <section className="space-y-6">
                <h4 className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300">Protagonist / 主角</h4>
                <div className="p-6 bg-white border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-none bg-gray-50 border border-gray-100" />
                    <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">我</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-200" />
                </div>
              </section>

              {/* Other Protagonists */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300">Other Protagonists</h4>
                  <button className="p-1.5 border border-gray-100 text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="p-4 bg-white border border-gray-50 flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-none bg-gray-50 border border-gray-100" />
                      <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Select Character</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-12 pb-24">
            <div className="space-y-4">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-300">Step 03 / Preview & Publish</h3>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                Finalize your narrative dimension.
              </p>
            </div>

            <div className="space-y-12">
              <div className="bg-white border border-gray-900 p-8 space-y-8 shadow-2xl">
                <div className="aspect-[16/9] overflow-hidden border border-gray-50">
                  <img src={formData.cover} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-gray-900 text-white text-[8px] font-bold uppercase tracking-[0.2em]">{formData.orientation}</span>
                    <span className="px-2 py-0.5 border border-gray-100 text-gray-400 text-[8px] font-bold uppercase tracking-[0.2em]">{formData.age}</span>
                  </div>
                  <h2 className="text-xl font-serif italic font-bold text-gray-900 uppercase tracking-[0.1em]">{formData.title || 'Untitled Work'}</h2>
                  <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest">{formData.intro || 'No introduction provided.'}</p>
                </div>
                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-none bg-gray-50 border border-gray-100" />
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">BY 我</span>
                  </div>
                  <div className="text-[8px] font-mono text-gray-300 uppercase tracking-widest">Draft.Status // Ready</div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 border border-gray-100 space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-gray-900" strokeWidth={1.5} />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-900">AI Enhancement Ready</span>
                </div>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                  Your work is ready for AI-driven interactions and community engagement.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed inset-0 z-[110] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="px-8 pt-16 pb-8 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={step === 1 ? onClose : prevStep} className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft strokeWidth={1.5} size={20} />
          </button>
          <h2 className="text-[12px] font-serif italic font-bold uppercase tracking-[0.4em] text-gray-900">Create Work</h2>
        </div>
        <div className="text-[8px] font-mono font-bold text-gray-300 uppercase tracking-widest">Step.0{step}</div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-12">
        {renderStep()}
      </div>

      <div className="p-8 pb-12 bg-white border-t border-gray-100 flex gap-4">
        {step < 3 ? (
          <button 
            onClick={nextStep}
            className="flex-1 py-5 bg-gray-900 text-white text-[10px] font-bold tracking-[0.4em] uppercase flex items-center justify-center gap-4"
          >
            Next Step
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <>
            <button className="flex-1 py-5 border border-gray-100 text-gray-300 text-[10px] font-bold tracking-[0.4em] uppercase hover:border-gray-900 hover:text-gray-900 transition-all">
              Save Draft
            </button>
            <button 
              onClick={() => onPublish(formData)}
              className="flex-1 py-5 bg-gray-900 text-white text-[10px] font-bold tracking-[0.4em] uppercase"
            >
              Publish Now
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default CreationFlow;
