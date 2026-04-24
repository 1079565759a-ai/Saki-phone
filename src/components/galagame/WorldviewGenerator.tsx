import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowLeft, Send, Save, Edit3, Loader2, Plus, Trash2, X } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../../utils/cn';

interface WorldviewGeneratorProps {
  onClose: () => void;
  onSave: (worldview: any) => void;
  appState: any;
  updateState: (key: string, value: any) => void;
}

const WorldviewGenerator: React.FC<WorldviewGeneratorProps> = ({ onClose, onSave, appState, updateState }) => {
  const worldviews = appState.galaWorldviews || [];
  const [editingWorldview, setEditingWorldview] = useState<any | null>(null);

  const handleSaveItem = (item: any) => {
    if (item.id) {
      updateState('galaWorldviews', worldviews.map((w: any) => w.id === item.id ? item : w));
    } else {
      updateState('galaWorldviews', [{ ...item, id: Date.now() }, ...worldviews]);
    }
    setEditingWorldview(null);
  };

  const handleDelete = (id: number) => {
    updateState('galaWorldviews', worldviews.filter((w: any) => w.id !== id));
  };

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateWorldview = async () => {
    if (!prompt || prompt.length < 5) return;
    setIsGenerating(true);
    try {
      const apiKey = appState.apiKey || localStorage.getItem('custom_api_key') || process.env.GEMINI_API_KEY || '';
      const baseUrl = appState.apiBaseUrl || localStorage.getItem('custom_api_url');
      const model = appState.selectedModel || localStorage.getItem('custom_api_model') || 'gemini-3-flash-preview';

      const promptStr = `基于以下描述生成一个Galagame世界观：${prompt}。返回JSON格式，包含：
        - id: 留空
        - name: 这套世界观的名字 (10字内)
        - background: 世界背景 (100-200字)
        - factions: 势力分布列表 (每个元素是字符串, 直接写 "名字 - 简介", 3-5个)
        - rules: 核心规则列表 (每个元素是字符串, 3-5条)
        只返回纯JSON！`;

      let text = '';
      if (apiKey && apiKey !== process.env.GEMINI_API_KEY && baseUrl) {
         const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
               model: model,
               messages: [{ role: 'user', content: promptStr }]
            })
         });
         const data = await response.json();
         text = data.choices?.[0]?.message?.content || '';
      } else {
         const ai = new GoogleGenAI({ apiKey: apiKey });
         const response = await ai.models.generateContent({ model: model, contents: promptStr });
         text = response.text || '';
      }

      const cleanText = text.replace(/```json/gi, '').replace(/```/g, '');
      const data = JSON.parse(cleanText);
      if (data) {
        setEditingWorldview({ ...editingWorldview, ...data });
        setPrompt('');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert('生成失败，请检查API设置');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[110] bg-white flex flex-col">
      <div className="px-8 pt-16 pb-8 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={editingWorldview ? () => setEditingWorldview(null) : onClose} className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft strokeWidth={1.5} size={20} />
          </button>
          <h2 className="text-[12px] font-serif italic font-bold uppercase tracking-[0.4em] text-gray-900">
            {editingWorldview ? 'Edit Worldview' : 'Worldviews'}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-12">
        {!editingWorldview ? (
          <div className="space-y-4">
            <button 
              onClick={() => setEditingWorldview({ name: '新世界观', background: '', factions: [], rules: [] })}
              className="w-full py-6 border border-dashed border-gray-300 text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all flex flex-col items-center justify-center gap-2 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Create Worldview / 创建世界观</span>
            </button>
            <div className="space-y-4 pt-4">
              {worldviews.map((w: any) => (
                <div key={w.id} className="p-6 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-between group">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{w.name || 'Unnamed World'}</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest truncate mt-1">{w.background}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setEditingWorldview(w)} className="text-gray-300 hover:text-gray-900 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(w.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 pb-24">
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block flex items-center gap-2">
                <Sparkles className="w-3 h-3"/> AI 快速生成 (可选)
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={prompt} 
                  onChange={e => setPrompt(e.target.value)} 
                  placeholder="输入你的点子..." 
                  className="flex-1 bg-white border border-gray-200 py-3 px-4 text-xs outline-none"
                />
                <button onClick={generateWorldview} disabled={isGenerating || prompt.length < 5} className="px-6 bg-gray-900 text-white font-bold text-[10px] tracking-widest uppercase disabled:opacity-50">
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Generate'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">World Name / 世界名称</label>
              <input type="text" value={editingWorldview.name || ''} onChange={e => setEditingWorldview({...editingWorldview, name: e.target.value})} className="w-full border-b border-gray-200 bg-transparent py-2 text-base font-bold outline-none focus:border-gray-900" placeholder="例如：亚特兰蒂斯2077" />
            </div>

            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Background / 世界背景</label>
              <textarea value={editingWorldview.background || ''} onChange={e => setEditingWorldview({...editingWorldview, background: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm h-32 resize-none outline-none focus:border-gray-900 leading-relaxed" placeholder="这个世界的历史和现状..." />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Factions / 势力分布</label>
                <button onClick={() => setEditingWorldview({...editingWorldview, factions: [...(editingWorldview.factions||[]), '']})} className="text-[8px] font-bold text-gray-900 uppercase">
                  <Plus className="w-3 h-3 inline-block mr-1"/>添加势力
                </button>
              </div>
              <div className="space-y-2">
                {(editingWorldview.factions || []).map((f: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      type="text" 
                      value={f} 
                      onChange={e => {
                        const newF = [...editingWorldview.factions];
                        newF[i] = e.target.value;
                        setEditingWorldview({...editingWorldview, factions: newF});
                      }} 
                      placeholder="势力名称 - 简介" 
                      className="flex-1 bg-gray-50 border-b border-gray-200 py-2 px-3 text-sm outline-none"
                    />
                    <button onClick={() => {
                      const newF = [...editingWorldview.factions];
                      newF.splice(i, 1);
                      setEditingWorldview({...editingWorldview, factions: newF});
                    }} className="text-gray-300 hover:text-red-500"><X className="w-4 h-4"/></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Rules / 核心法则</label>
                <button onClick={() => setEditingWorldview({...editingWorldview, rules: [...(editingWorldview.rules||[]), '']})} className="text-[8px] font-bold text-gray-900 uppercase">
                  <Plus className="w-3 h-3 inline-block mr-1"/>添加法则
                </button>
              </div>
              <div className="space-y-2">
                {(editingWorldview.rules || []).map((r: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      type="text" 
                      value={r} 
                      onChange={e => {
                        const newR = [...editingWorldview.rules];
                        newR[i] = e.target.value;
                        setEditingWorldview({...editingWorldview, rules: newR});
                      }} 
                      placeholder="法则是..." 
                      className="flex-1 bg-gray-50 border-b border-gray-200 py-2 px-3 text-sm outline-none"
                    />
                    <button onClick={() => {
                      const newR = [...editingWorldview.rules];
                      newR.splice(i, 1);
                      setEditingWorldview({...editingWorldview, rules: newR});
                    }} className="text-gray-300 hover:text-red-500"><X className="w-4 h-4"/></button>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => handleSaveItem(editingWorldview)} className="w-full py-4 bg-gray-900 text-white font-bold tracking-widest uppercase rounded-lg text-sm hover:opacity-90 mt-8">
              Save Worldview
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WorldviewGenerator;
