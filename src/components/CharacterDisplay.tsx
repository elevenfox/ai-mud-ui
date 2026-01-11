'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, NPC, Player } from '@/store/gameStore';
import clsx from 'clsx';

/**
 * CharacterDisplay - 沉浸式角色立绘显示组件
 * 
 * 分为左、中、右三个区域，最多同时显示 3 个角色
 * - 玩家角色默认显示在右侧
 * - NPC 按其 position 属性显示
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

  // 玩家位置由 player.position 决定
  const playerPosition = player?.position || 'right';
  const showPlayerLeft = playerPosition === 'left' && player?.portrait_url;
  const showPlayerCenter = playerPosition === 'center' && player?.portrait_url;
  const showPlayerRight = playerPosition === 'right' && player?.portrait_url;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-end justify-between px-4 pb-64">
      {/* 左侧区域 */}
      <div className="flex-1 flex justify-start items-end gap-2">
        <AnimatePresence>
          {/* 玩家在左侧 */}
          {showPlayerLeft && player && (
            <PlayerSprite key="player" player={player} position="left" />
          )}
          {/* 左侧 NPC */}
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
      <div className="flex-1 flex justify-center items-end gap-2">
        <AnimatePresence>
          {/* 玩家在中间 */}
          {showPlayerCenter && player && (
            <PlayerSprite key="player" player={player} position="center" />
          )}
          {/* 中间 NPC */}
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
      <div className="flex-1 flex justify-end items-end gap-2">
        <AnimatePresence>
          {/* 右侧 NPC */}
          {rightNpcs.slice(0, 1).map(npc => (
            <CharacterSprite
              key={npc.id}
              npc={npc}
              position="right"
              highlighted={isHighlighted(npc)}
              onClick={() => startTalkingTo(npc)}
            />
          ))}
          {/* 玩家在右侧 */}
          {showPlayerRight && player && (
            <PlayerSprite key="player" player={player} position="right" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============== 玩家角色立绘 ==============

interface PlayerSpriteProps {
  player: Player;
  position: 'left' | 'center' | 'right';
}

function PlayerSprite({ player, position }: PlayerSpriteProps) {
  const slideDirection = position === 'left' ? -100 : position === 'right' ? 100 : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: slideDirection, y: 50 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: slideDirection, y: 50 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative"
    >
      {/* 玩家立绘 */}
      <div className="relative w-48 h-80 md:w-56 md:h-96 lg:w-64 lg:h-[28rem]">
        {player.portrait_url ? (
          <img
            src={player.portrait_url}
            alt={player.name}
            className="w-full h-full object-contain object-bottom"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-t from-cyber-dark/80 to-transparent rounded-t-2xl">
            <span className="text-6xl text-cyber-pink/50">{player.name[0]}</span>
          </div>
        )}

        {/* 玩家名字标签 - 用不同颜色区分 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-cyber-pink"
        >
          <p className="text-sm font-display whitespace-nowrap text-cyber-pink">
            {player.name}
          </p>
        </motion.div>

        {/* 玩家标识 */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-cyber-pink/20 border border-cyber-pink/50">
          <span className="text-xs text-cyber-pink">YOU</span>
        </div>
      </div>
    </motion.div>
  );
}

// ============== NPC 角色立绘 ==============

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
