import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

export default function Splash({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Sequence timing
    // 0 -> 1: initial cherry petals spreading (1.5s)
    // 1 -> 2: logo emerging + subtitle emerging (3s)
    // 2 -> 3: side texts and finishing (3.5s)
    // 3 -> 4: fade out splash (1s)

    const t1 = setTimeout(() => setStage(1), 800);
    const t2 = setTimeout(() => setStage(2), 2500);
    const t3 = setTimeout(() => setStage(3), 4500);
    const t4 = setTimeout(() => {
      setStage(4);
      setTimeout(() => {
        onCompleteRef.current();
      }, 1200); // give time to fade out the wrapper
    }, 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <AnimatePresence>
      {stage < 4 && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#fdfbfb] via-[#fcefee] to-[#f5f1f0]"
        >
          {/* Background Petals/Mist */}
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 4, ease: "easeOut" }}
          >
            {/* Soft Radial Mist */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,235,238,0.4)_0%,rgba(245,235,238,0)_70%)] blur-2xl" />
            
            {/* Subtle Cherry Petals falling simulation */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white/80 rounded-[50%_0_50%_50%] shadow-[0_0_10px_rgba(255,210,220,0.5)]"
                style={{
                  width: `${6 + Math.random() * 8}px`,
                  height: `${6 + Math.random() * 8}px`,
                  left: `${Math.random() * 100}%`,
                  top: `-5%`,
                  filter: 'blur(0.5px)',
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  x: [`0px`, `${(Math.random() - 0.5) * 100}px`],
                  rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)]
                }}
                transition={{
                  duration: 8 + Math.random() * 8,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 4
                }}
              />
            ))}
          </motion.div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* LOGO area */}
            <div className="relative mb-6">
              <motion.h1
                initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
                animate={{ 
                  opacity: stage >= 1 ? 1 : 0, 
                  y: stage >= 1 ? 0 : 15,
                  filter: stage >= 1 ? 'blur(0px)' : 'blur(8px)'
                }}
                transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="font-serif text-5xl md:text-6xl text-[#d49a9f] font-light tracking-widest relative z-10"
                style={{ textShadow: '0 4px 24px rgba(212, 154, 159, 0.4)' }}
              >
                樱之恋
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                animate={{ 
                  opacity: stage >= 1 ? 0.7 : 0, 
                  x: stage >= 1 ? 0 : -10,
                  filter: stage >= 1 ? 'blur(0px)' : 'blur(4px)'
                }}
                transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                className="absolute -bottom-3 -right-6 font-serif italic text-xl md:text-2xl text-[#b0a8a8] z-0"
              >
                SakuLove
              </motion.div>
            </div>

            {/* Platform Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: stage >= 2 ? 0.6 : 0, y: stage >= 2 ? 0 : 10 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-[#988f8f] font-sans tracking-[0.3em] text-sm md:text-base font-light"
            >
              沉浸式视觉小说平台
            </motion.div>
          </div>

          {/* Side Texts */}
          <div className="absolute inset-0 pointer-events-none flex justify-between items-center px-12 md:px-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: stage >= 3 ? 0.5 : 0, y: stage >= 3 ? 0 : 20 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="writing-vertical-rl font-serif text-[#c5a3a5] text-lg md:text-xl tracking-[0.4em] font-light"
            >
              以樱为名
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: stage >= 3 ? 0.5 : 0, y: stage >= 3 ? 0 : -20 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="writing-vertical-rl font-serif text-[#c5a3a5] text-lg md:text-xl tracking-[0.4em] font-light"
            >
              以恋为章
            </motion.div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
