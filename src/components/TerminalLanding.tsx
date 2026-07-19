import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalLandingProps {
  onComplete: () => void;
}

export const TerminalLanding: React.FC<TerminalLandingProps> = ({ onComplete }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [isDissolving, setIsDissolving] = useState(false);

  const terminalSequence = [
    { text: "Initializing RevStack engine...", delay: 400 },
    { text: "Mapping core structures: DAG, Stacks, HashMaps...", delay: 800 },
    { text: "Loading C++ source snapshots...", delay: 600 },
    { text: "Restoring repository HEAD to main...", delay: 800 },
    { text: "System ready. Click anywhere or press Enter to enter...", delay: 300 }
  ];

  useEffect(() => {
    let currentLineIndex = 0;
    
    const printLine = () => {
      if (currentLineIndex < terminalSequence.length) {
        const item = terminalSequence[currentLineIndex];
        setLines(prev => [...prev, item.text]);
        currentLineIndex++;
        setTimeout(printLine, item.delay);
      } else {
        setIsDone(true);
      }
    };

    setTimeout(printLine, 300);

    const handleKeyPress = () => {
      if (currentLineIndex >= terminalSequence.length) {
        handleProceed();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleProceed = () => {
    setIsDissolving(true);
    setTimeout(() => {
      onComplete();
    }, 1000); // Allow time for exit animations
  };

  return (
    <AnimatePresence>
      {!isDissolving && (
        <motion.div
          className="fixed inset-0 bg-[#050505] z-50 flex items-center justify-center p-4 font-mono select-none"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.1,
            filter: 'blur(20px)',
            transition: { duration: 0.8, ease: "easeInOut" }
          }}
          onClick={isDone ? handleProceed : undefined}
        >
          {/* Futuristic subtle grid overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

          {/* Terminal Box */}
          <div className="w-full max-w-2xl p-8 rounded-xl border border-glass-border bg-black/60 backdrop-blur-md relative overflow-hidden shadow-glow-primary/5">
            {/* Top Bar */}
            <div className="flex items-center space-x-2 border-b border-glass-border pb-4 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-neutral-500 ml-4">revstack_boot.sh</span>
            </div>

            {/* Terminal Lines */}
            <div className="space-y-3 min-h-[180px] text-sm text-neutral-300">
              {lines.map((line, idx) => {
                const isLast = idx === terminalSequence.length - 1;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start"
                  >
                    <span className="text-primary mr-3">&gt;</span>
                    <span className={isLast ? "text-cyanAccent font-semibold glow-text-cyan animate-pulse" : ""}>
                      {line}
                    </span>
                  </motion.div>
                );
              })}
              
              {/* Blinking Cursor */}
              {!isDone && (
                <div className="flex items-center mt-2">
                  <span className="text-primary mr-3">&gt;</span>
                  <span className="w-2.5 h-5 bg-primary animate-pulse" />
                </div>
              )}
            </div>

            {/* Click to proceed button */}
            {isDone && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mt-8 text-center text-xs text-neutral-500"
              >
                Press enter or click to explore the repository
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
