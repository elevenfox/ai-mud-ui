'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, NPC } from '@/store/gameStore';
import clsx from 'clsx';

/**
 * CharacterDisplay - 沉浸式角色立绘显示组件
 * 
 * 分为左、中、右三个区域，最多同时显示 3 个角色
 * 角色立绘从底部延伸，营造视觉小说风格
 */
export function CharacterDisplay() {
  const { npcs, player, startTalkingTo, talkingToNpc } = useGameStore();

  // 按位置分组 NPC
  const leftNpcs = npcs.filter(n => n.position === 'left');
  const centerNpcs = npcs.filter(n => n.position === 'center');
  const rightNpcs = npcs.filter(n => n.position === 'right');

  // 如果正在对话，高亮显示对话对象
  const isHighlighted = (npc: NPC) => talkingToNpc?.id === npc.id;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-end justify-between px-4 pb-64">
      {/* 左侧区域 */}
      <div className="flex-1 flex justify-start items-end">
        <AnimatePresence>
          {leftNpcs.slice(0, 1).map(npc => (
            <CharacterSprite
              key={npc.id}
              npc={npc}
              position="left"
              highlighted={isHighlighted(npc)}
              onClick={() => startTalkingTo(npc)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 中间区域 */}
      <div className="flex-1 flex justify-center items-end">
        <AnimatePresence>
          {centerNpcs.slice(0, 1).map(npc => (
            <CharacterSprite
              key={npc.id}
              npc={npc}
              position="center"
              highlighted={isHighlighted(npc)}
              onClick={() => startTalkingTo(npc)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 右侧区域 */}
      <div className="flex-1 flex justify-end items-end">
        <AnimatePresence>
          {rightNpcs.slice(0, 1).map(npc => (
            <CharacterSprite
              key={npc.id}
              npc={npc}
              position="right"
              highlighted={isHighlighted(npc)}
              onClick={() => startTalkingTo(npc)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface CharacterSpriteProps {
  npc: NPC;
  position: 'left' | 'center' | 'right';
  highlighted: boolean;
  onClick: () => void;
}

function CharacterSprite({ npc, position, highlighted, onClick }: CharacterSpriteProps) {
  // 情绪对应的边框颜色
  const emotionColors: Record<string, string> = {
    default: 'shadow-cyber-blue/30',
    happy: 'shadow-green-500/30',
    angry: 'shadow-red-500/30',
    sad: 'shadow-purple-500/30',
    surprised: 'shadow-yellow-500/30',
    fearful: 'shadow-pink-500/30',
  };

  // 进入动画方向
  const slideDirection = position === 'left' ? -100 : position === 'right' ? 100 : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: slideDirection, y: 50 }}
      animate={{ 
        opacity: highlighted ? 1 : 0.9, 
        x: 0, 
        y: 0,
        scale: highlighted ? 1.05 : 1,
        filter: highlighted ? 'brightness(1.1)' : 'brightness(0.9)',
      }}
      exit={{ opacity: 0, x: slideDirection, y: 50 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={clsx(
        'relative pointer-events-auto cursor-pointer group',
        'transition-all duration-300'
      )}
      onClick={onClick}
    >
      {/* 角色立绘 */}
      <div 
        className={clsx(
          'relative w-48 h-80 md:w-56 md:h-96 lg:w-64 lg:h-[28rem]',
          'transition-all duration-300',
          emotionColors[npc.emotion] || emotionColors.default,
          highlighted && 'drop-shadow-2xl'
        )}
      >
        {npc.portrait_url ? (
          <img
            src={npc.portrait_url}
            alt={npc.name}
            className="w-full h-full object-contain object-bottom"
            style={{
              filter: highlighted ? 'none' : 'brightness(0.85) saturate(0.9)',
            }}
            onError={(e) => {
              // 加载失败时显示占位符
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-t from-cyber-dark/80 to-transparent rounded-t-2xl">
            <span className="text-6xl text-cyber-blue/50">{npc.name[0]}</span>
          </div>
        )}

        {/* 名字标签 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            'absolute -bottom-2 left-1/2 -translate-x-1/2',
            'px-4 py-1.5 rounded-full',
            'bg-black/70 backdrop-blur-sm border',
            highlighted ? 'border-cyber-blue' : 'border-gray-600',
            'transition-colors duration-300'
          )}
        >
          <p className={clsx(
            'text-sm font-display whitespace-nowrap',
            highlighted ? 'text-cyber-blue' : 'text-gray-300'
          )}>
            {npc.name}
          </p>
        </motion.div>

        {/* 情绪指示器 */}
        <div className={clsx(
          'absolute top-2 right-2 w-3 h-3 rounded-full',
          'animate-pulse',
          npc.emotion === 'happy' && 'bg-green-400',
          npc.emotion === 'angry' && 'bg-red-400',
          npc.emotion === 'sad' && 'bg-purple-400',
          npc.emotion === 'surprised' && 'bg-yellow-400',
          npc.emotion === 'fearful' && 'bg-pink-400',
          npc.emotion === 'default' && 'bg-cyber-blue',
        )} />

        {/* 悬停提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <span className="text-white text-sm bg-black/60 px-3 py-1 rounded">
            点击交谈
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
