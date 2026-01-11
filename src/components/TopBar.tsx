'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import clsx from 'clsx';

export function TopBar() {
  const { world, player, saveCheckpoint } = useGameStore();
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await saveCheckpoint(`Manual save at ${world?.name || 'Unknown'}`);
    setIsSaving(false);
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 2000);
  };

  const moodColors: Record<string, string> = {
    neutral: 'bg-gray-500',
    tense: 'bg-cyber-red',
    calm: 'bg-cyber-green',
    mysterious: 'bg-cyber-purple',
    action: 'bg-cyber-yellow',
  };

  return (
    <div className="relative z-20 px-6 py-3 bg-cyber-dark/80 backdrop-blur-sm border-b border-cyber-blue/20">
      <div className="flex items-center justify-between">
        {/* Left: World info */}
        <div className="flex items-center gap-4">
          <h1 className="font-display text-xl text-cyber-blue neon-text">
            {world?.name || 'AI MUD'}
          </h1>
          
          {/* Mood indicator */}
          {world?.mood && (
            <div className="flex items-center gap-2">
              <div className={clsx(
                'w-2 h-2 rounded-full animate-pulse',
                moodColors[world.mood] || moodColors.neutral
              )} />
              <span className="text-xs text-gray-500 capitalize">
                {world.mood}
              </span>
            </div>
          )}
        </div>
        
        {/* Center: Player info */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            扮演 <span className="text-cyber-green">{player?.name || '未知'}</span>
          </span>
          
          {/* Inventory summary */}
          {player?.inventory && player.inventory.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>📦</span>
              <span>{player.inventory.length} 件物品</span>
            </div>
          )}
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={clsx(
              'px-4 py-1.5 text-sm rounded border transition-all duration-300',
              isSaving
                ? 'border-gray-600 text-gray-500 cursor-not-allowed'
                : 'border-cyber-green/40 text-cyber-green hover:bg-cyber-green/10 hover:border-cyber-green'
            )}
          >
            {isSaving ? '保存中...' : '💾 存档'}
          </button>
          
          {/* Save confirmation */}
          <AnimatePresence>
            {showSaveConfirm && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-cyber-green"
              >
                ✓ 已保存！
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
