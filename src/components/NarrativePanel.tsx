'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

export function NarrativePanel() {
  const { currentNarrative, events, location, isProcessing } = useGameStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentNarrative, events]);

  return (
    <div className="px-6 pb-2">
      <div 
        ref={scrollRef}
        className="max-h-48 overflow-y-auto neon-border rounded-lg bg-cyber-dark/80 backdrop-blur-sm p-4"
      >
        {/* Location header */}
        {location && (
          <div className="mb-3 pb-2 border-b border-cyber-blue/20">
            <h2 className="text-lg font-display text-cyber-blue">
              {location.name}
            </h2>
            <p className="text-sm text-gray-400">
              {location.description}
            </p>
          </div>
        )}
        
        {/* Recent events */}
        <div className="space-y-2 mb-3">
          {events.slice(-3).map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              className="text-sm text-gray-500 italic"
            >
              {event.content.slice(0, 100)}...
            </motion.div>
          ))}
        </div>
        
        {/* Current narrative */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNarrative}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-base text-gray-200 leading-relaxed whitespace-pre-wrap"
          >
            {currentNarrative}
          </motion.div>
        </AnimatePresence>
        
        {/* Processing indicator */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mt-3 text-cyber-blue"
          >
            <span className="animate-pulse">▌</span>
            <span className="text-sm">处理中...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
