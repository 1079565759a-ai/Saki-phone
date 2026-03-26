import React, { useState } from 'react';
import { Clock, Play, ArrowUpDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface RecordsViewProps {
  onSelectGame: (game: any) => void;
}

const RecordsView: React.FC<RecordsViewProps> = ({ onSelectGame }) => {
  const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');

  const records = [
    { id: 1, title: '月下孤影', lastPlayed: '2小时前', progress: '45%', cover: 'https://picsum.photos/seed/game1/300/400' },
    { id: 3, title: '深宫计', lastPlayed: '昨天', progress: '80%', cover: 'https://picsum.photos/seed/game3/300/400' },
    { id: 101, title: '我的初恋', lastPlayed: '3天前', progress: '10%', cover: 'https://picsum.photos/seed/my1/300/400' },
  ];

  const sortedRecords = [...records].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0; // Simplified for mock
  });

  return (
    <div className="flex-1 overflow-y-auto px-8 py-12 pb-24 space-y-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-4 h-[1px] bg-gray-900" />
          <h2 className="text-[10px] font-serif italic font-bold uppercase tracking-[0.3em] text-gray-900">Play History</h2>
        </div>
        <button 
          onClick={() => setSortBy(prev => prev === 'recent' ? 'title' : 'recent')}
          className="flex items-center gap-2 text-[7px] font-bold uppercase tracking-[0.2em] text-gray-300 hover:text-gray-900 transition-colors"
        >
          <ArrowUpDown className="w-3 h-3" />
          {sortBy === 'recent' ? 'Sort: Recent' : 'Sort: Title'}
        </button>
      </div>

      <div className="space-y-6">
        {sortedRecords.map(record => (
          <div 
            key={record.id} 
            className="flex gap-6 p-5 bg-white border border-gray-100 rounded-none hover:border-gray-900 transition-all group cursor-pointer relative"
            onClick={() => onSelectGame(record)}
          >
            <div className="absolute top-0 left-0 w-1 h-1 bg-gray-900 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-20 h-20 bg-gray-50 rounded-none overflow-hidden shrink-0 border border-gray-100 p-1">
              <img src={record.cover} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-[0.1em]">{record.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-2.5 h-2.5 text-gray-300" strokeWidth={1.5} />
                  <span className="text-[7px] text-gray-400 font-bold uppercase tracking-[0.2em]">Last: {record.lastPlayed}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[7px] font-mono text-gray-300 uppercase tracking-widest">Progress.Status</span>
                  <span className="text-[9px] font-mono font-bold text-gray-900">{record.progress}</span>
                </div>
                <div className="h-[2px] bg-gray-50 rounded-none overflow-hidden">
                  <div className="h-full bg-gray-900 transition-all duration-1000" style={{ width: record.progress }} />
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <button className="w-12 h-12 rounded-none bg-white border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-gray-900 group-hover:border-gray-900 transition-all">
                <Play className="w-4 h-4 fill-current ml-0.5" strokeWidth={1} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecordsView;
