'use client';

import { motion } from 'framer-motion';
import { useGameStore, NPC } from '@/store/gameStore';
import clsx from 'clsx';

interface NPCPanelProps {
  npcs: NPC[];
}

export function NPCPanel({ npcs }: NPCPanelProps) {
  const { startTalkingTo } = useGameStore();

  if (npcs.length === 0) return null;

  return (
    <div className="flex justify-center gap-6">
      {npcs.map((npc, index) => (
        <motion.div
          key={npc.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group cursor-pointer"
          onClick={() => startTalkingTo(npc)}
        >
          <NPCCard npc={npc} />
        </motion.div>
      ))}
    </div>
  );
}

function NPCCard({ npc }: { npc: NPC }) {
  const emotionColors: Record<string, string> = {
    default: 'border-cyber-blue',
    happy: 'border-cyber-green',
    angry: 'border-cyber-red',
    sad: 'border-cyber-purple',
    surprised: 'border-cyber-yellow',
    fearful: 'border-cyber-pink',
  };

  const borderColor = emotionColors[npc.emotion] || emotionColors.default;

  return (
    <div className="flex flex-col items-center">
      {/* Portrait */}
      <div 
        className={clsx(
          'portrait-frame w-24 h-32 rounded-lg overflow-hidden transition-all duration-300',
          'group-hover:scale-105 group-hover:shadow-lg',
          borderColor
        )}
      >
        {npc.portrait_url ? (
          <img 
            src={npc.portrait_url} 
            alt={npc.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-cyber-dark">
            <span className="text-3xl">{npc.name[0]}</span>
          </div>
        )}
      </div>
      
      {/* Name plate */}
      <div className="mt-2 px-3 py-1 bg-cyber-dark/80 rounded border border-cyber-blue/30 backdrop-blur-sm">
        <p className="text-sm font-display text-cyber-blue text-center">
          {npc.name}
        </p>
        {/* Relationship indicator */}
        <div className="flex justify-center mt-1 gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={clsx(
                'w-1.5 h-1.5 rounded-full',
                i < Math.floor((npc.relationship + 100) / 40)
                  ? 'bg-cyber-green'
                  : 'bg-gray-600'
              )}
            />
          ))}
        </div>
      </div>
      
      {/* Hover hint */}
      <motion.p 
        className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        点击交谈
      </motion.p>
    </div>
  );
}
