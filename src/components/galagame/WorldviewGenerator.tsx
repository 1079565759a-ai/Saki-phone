import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowLeft, Send, Save, Edit3, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../../utils/cn';

interface WorldviewGeneratorProps {
  onClose: () => void;
  onSave: (worldview: any) => void;
}

const WorldviewGenerator: React.FC<WorldviewGeneratorProps> = ({ onClose, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const generateWorldview = async () => {
    if (!prompt || prompt.length < 10 || prompt.length > 50) return;

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `基于以下描述生成一个Galagame世界观：${prompt}。
        请返回JSON格式，包含以下字段：
        - background: 世界背景 (100-200字)
        - factions: 势力分布 (3-5个势力，包含名称和简介)
        - rules: 核心规则 (3-5条)
        - events: 关键事件 (2-3个历史或未来事件)
        请确保风格文艺、细腻、充满想象力。`,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 z-[110] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="px-8 pt-16 pb-8 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft strokeWidth={1.5} size={20} />
          </button>
          <h2 className="text-[12px] font-serif italic font-bold uppercase tracking-[0.4em] text-gray-900">Worldview</h2>
        </div>
        {result && (
          <button 
            onClick={() => onSave(result)}
            className="p-2 text-gray-300 hover:text-gray-900 transition-colors"
          >
            <Save className="w-5 h-5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-12 space-y-12">
        {!result ? (
          <div className="space-y-12">
            <div className="space-y-4">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-300">Generate New World</h3>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                输入10-50字描述（如「星际修真背景」），AI将为你构建完整的世界观。
              </p>
            </div>

            <div className="relative">
              <textarea 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="例如：一个充满蒸汽朋克气息的魔法学院，学生们通过改造身体来提升魔力..."
                className="w-full p-6 bg-gray-50 border border-gray-100 rounded-none text-[11px] font-bold uppercase tracking-widest outline-none focus:border-gray-900 transition-all h-48 resize-none"
              />
              <div className="absolute bottom-4 right-4 text-[7px] font-mono font-bold text-gray-300">
                {prompt.length}/50
              </div>
            </div>

            <button 
              onClick={generateWorldview}
              disabled={isGenerating || prompt.length < 10}
              className="w-full py-5 bg-gray-900 text-white text-[10px] font-bold tracking-[0.4em] uppercase disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-4 group"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
              )}
              {isGenerating ? 'Constructing...' : 'Generate World'}
            </button>
          </div>
        ) : (
          <div className="space-y-12 pb-24">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-[1px] bg-gray-900" />
                <h3 className="text-[10px] font-serif italic font-bold uppercase tracking-[0.3em] text-gray-900">Background</h3>
              </div>
              <button onClick={() => setIsEditing(!isEditing)} className="text-gray-300 hover:text-gray-900 transition-colors">
                <Edit3 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-12">
              <section className="space-y-4">
                <p className="text-[11px] text-gray-600 leading-relaxed uppercase tracking-widest">{result.background}</p>
              </section>

              <section className="space-y-6">
                <h4 className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300">Factions / 势力分布</h4>
                <div className="space-y-4">
                  {result.factions.map((f: any, i: number) => (
                    <div key={i} className="p-6 bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-2">{f.name}</p>
                      <p className="text-[9px] text-gray-500 leading-relaxed uppercase tracking-widest">{f.description || f.简介}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300">Core Rules / 核心规则</h4>
                <div className="space-y-3">
                  {result.rules.map((r: string, i: number) => (
                    <div key={i} className="flex gap-4 items-start">
                      <span className="text-[9px] font-mono font-bold text-gray-200">{(i + 1).toString().padStart(2, '0')}</span>
                      <p className="text-[9px] text-gray-600 uppercase tracking-widest leading-relaxed">{r}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300">Key Events / 关键事件</h4>
                <div className="space-y-4">
                  {result.events.map((e: string, i: number) => (
                    <div key={i} className="p-6 border-l-2 border-gray-900 bg-white">
                      <p className="text-[9px] text-gray-600 uppercase tracking-widest leading-relaxed">{e}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <button 
              onClick={() => setResult(null)}
              className="w-full py-5 border border-gray-100 text-gray-300 text-[10px] font-bold tracking-[0.4em] uppercase hover:border-gray-900 hover:text-gray-900 transition-all"
            >
              Regenerate
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WorldviewGenerator;
