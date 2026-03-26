import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Coins, Flower2, ChevronRight, History } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StoreViewProps {
  onClose: () => void;
}

const StoreView: React.FC<StoreViewProps> = ({ onClose }) => {
  const coinPacks = [
    { id: 1, amount: 5, price: 1, bonus: 0 },
    { id: 2, amount: 30, price: 6, bonus: 5 },
    { id: 3, amount: 150, price: 30, bonus: 30 },
    { id: 4, amount: 500, price: 98, bonus: 120 },
  ];

  const sakuraPacks = [
    { id: 1, amount: 10, price: 1, bonus: 0 },
    { id: 2, amount: 60, price: 6, bonus: 10 },
    { id: 3, amount: 300, price: 30, bonus: 60 },
  ];

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 z-[100] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="px-8 pt-16 pb-8 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft strokeWidth={1.5} size={20} />
          </button>
          <h2 className="text-[12px] font-serif italic font-bold uppercase tracking-[0.4em] text-gray-900">Store</h2>
        </div>
        <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
          <History className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-12 space-y-16">
        {/* Balance Card */}
        <div className="grid grid-cols-2 border-l border-t border-gray-100 bg-white">
          <div className="p-8 border-r border-b border-gray-100 flex flex-col items-center gap-4 group cursor-pointer hover:bg-gray-50 transition-all">
            <Coins className="w-6 h-6 text-yellow-500" strokeWidth={1} />
            <div className="text-center">
              <p className="text-[14px] font-mono font-bold text-gray-900">1,250</p>
              <p className="text-[7px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Gold Coins</p>
            </div>
          </div>
          <div className="p-8 border-r border-b border-gray-100 flex flex-col items-center gap-4 group cursor-pointer hover:bg-gray-50 transition-all">
            <Flower2 className="w-6 h-6 text-pink-400" strokeWidth={1} />
            <div className="text-center">
              <p className="text-[14px] font-mono font-bold text-gray-900">450</p>
              <p className="text-[7px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Sakura</p>
            </div>
          </div>
        </div>

        {/* Gold Coins Packs */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-4 h-[1px] bg-gray-900" />
            <h3 className="text-[10px] font-serif italic font-bold uppercase tracking-[0.3em] text-gray-900">Gold Coins / 打赏作者</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {coinPacks.map(pack => (
              <button key={pack.id} className="p-6 bg-white border border-gray-100 hover:border-gray-900 transition-all flex flex-col items-center gap-4 group relative overflow-hidden">
                {pack.bonus > 0 && (
                  <div className="absolute top-0 right-0 bg-gray-900 text-white text-[6px] font-bold px-2 py-0.5 uppercase tracking-tighter">+{pack.bonus} Bonus</div>
                )}
                <Coins className="w-5 h-5 text-gray-300 group-hover:text-yellow-500 transition-colors" strokeWidth={1} />
                <div className="text-center">
                  <p className="text-[12px] font-mono font-bold text-gray-900">{pack.amount}</p>
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">¥{pack.price}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Sakura Packs */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-4 h-[1px] bg-gray-900" />
            <h3 className="text-[10px] font-serif italic font-bold uppercase tracking-[0.3em] text-gray-900">Sakura / 角色应援</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {sakuraPacks.map(pack => (
              <button key={pack.id} className="p-6 bg-white border border-gray-100 hover:border-gray-900 transition-all flex flex-col items-center gap-4 group relative overflow-hidden">
                {pack.bonus > 0 && (
                  <div className="absolute top-0 right-0 bg-gray-900 text-white text-[6px] font-bold px-2 py-0.5 uppercase tracking-tighter">+{pack.bonus} Bonus</div>
                )}
                <Flower2 className="w-5 h-5 text-gray-300 group-hover:text-pink-400 transition-colors" strokeWidth={1} />
                <div className="text-center">
                  <p className="text-[12px] font-mono font-bold text-gray-900">{pack.amount}</p>
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">¥{pack.price}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default StoreView;
