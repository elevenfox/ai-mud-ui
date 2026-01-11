'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import clsx from 'clsx';

export function DialogPanel() {
  const { talkingToNpc, dialogHistory, sendMessage, endConversation, isProcessing } = useGameStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dialogHistory]);

  if (!talkingToNpc) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    await sendMessage(input.trim());
    setInput('');
  };

  const emotionColors: Record<string, string> = {
    default: 'text-cyber-blue',
    happy: 'text-cyber-green',
    angry: 'text-cyber-red',
    sad: 'text-cyber-purple',
    surprised: 'text-cyber-yellow',
    fearful: 'text-cyber-pink',
  };

  return (
    <div className="px-6 pb-6 flex flex-col h-[400px]">
      {/* Dialog header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyber-blue/30">
        <div className="flex items-center gap-4">
          {/* NPC Portrait mini */}
          <div className="w-12 h-16 portrait-frame rounded overflow-hidden">
            {talkingToNpc.portrait_url ? (
              <img 
                src={talkingToNpc.portrait_url} 
                alt={talkingToNpc.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-cyber-dark">
                <span className="text-xl">{talkingToNpc.name[0]}</span>
              </div>
            )}
          </div>
          <div>
            <h3 className={clsx(
              'font-display text-lg',
              emotionColors[talkingToNpc.emotion] || emotionColors.default
            )}>
              {talkingToNpc.name}
            </h3>
            <p className="text-xs text-gray-500">
              {talkingToNpc.emotion !== 'default' && (
                <span className="capitalize">{talkingToNpc.emotion}</span>
              )}
              {talkingToNpc.emotion === 'default' && 'Neutral'}
            </p>
          </div>
        </div>
        
        <button
          onClick={endConversation}
          className="px-4 py-2 text-sm border border-gray-600 text-gray-400 rounded hover:border-cyber-red hover:text-cyber-red transition-colors"
        >
          结束对话
        </button>
      </div>
      
      {/* Dialog history */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto neon-border rounded-lg bg-cyber-dark/80 backdrop-blur-sm p-4 mb-4"
      >
        <AnimatePresence>
          {dialogHistory.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={clsx(
                'mb-4 last:mb-0',
                msg.role === 'player' ? 'text-right' : 'text-left'
              )}
            >
              <div
                className={clsx(
                  'inline-block max-w-[80%] px-4 py-3 rounded-lg',
                  msg.role === 'player'
                    ? 'bg-cyber-blue/20 border border-cyber-blue/40 text-gray-200'
                    : 'bg-cyber-dark border border-cyber-purple/40 text-gray-200'
                )}
              >
                <p className="text-xs text-gray-500 mb-1">
                  {msg.role === 'player' ? '你' : talkingToNpc.name}
                </p>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Typing indicator */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-left"
          >
            <div className="inline-block px-4 py-3 bg-cyber-dark border border-cyber-purple/40 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">{talkingToNpc.name}</p>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="text-cyber-purple"
                  >
                    ●
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`对 ${talkingToNpc.name} 说些什么...`}
          disabled={isProcessing}
          className={clsx(
            'flex-1 px-4 py-3 rounded-lg border bg-cyber-dark/80 backdrop-blur-sm',
            'text-gray-200 placeholder-gray-500',
            'focus:outline-none focus:border-cyber-purple transition-colors',
            isProcessing 
              ? 'border-gray-600 cursor-not-allowed' 
              : 'border-cyber-purple/40'
          )}
          autoFocus
        />
        <button
          type="submit"
          disabled={!input.trim() || isProcessing}
          className={clsx(
            'px-6 py-3 rounded-lg font-display transition-all duration-300',
            input.trim() && !isProcessing
              ? 'bg-cyber-purple/20 border border-cyber-purple text-cyber-purple hover:bg-cyber-purple/30'
              : 'bg-gray-800 border border-gray-600 text-gray-500 cursor-not-allowed'
          )}
        >
          {isProcessing ? '...' : '发送'}
        </button>
      </form>
    </div>
  );
}
