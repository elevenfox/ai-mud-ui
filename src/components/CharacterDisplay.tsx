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
 * 
 * 立绘尺寸：固定宽高（占屏幕 2/3 高度），图片按比例缩放并裁切
 * 立绘位置：垂直居中
 */

// 立绘固定尺寸配置
const SPRITE_CONFIG = {
  // 宽度（响应式）
  width: 'w-[280px] md:w-[320px] lg:w-[360px]',
  // 高度：占屏幕 2/3
  height: 'h-[66vh]',
  // 最大/最小尺寸限制
  constraints: 'min-h-[400px] max-h-[800px]',
};

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
    <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-8">
      {/* 左侧区域 */}
      <div className="flex-1 flex justify-start items-center">
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
      <div className="flex-1 flex justify-center items-center">
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
      <div className="flex-1 flex justify-end items-center">
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
      {/* 玩家立绘 - 固定尺寸，2/3 屏幕高度 */}
      <div className={clsx(
        'relative overflow-hidden rounded-lg',
        SPRITE_CONFIG.width,
        SPRITE_CONFIG.height,
        SPRITE_CONFIG.constraints,
        'shadow-2xl shadow-cyber-pink/20'
      )}>
        {player.portrait_url ? (
          <img
            src={player.portrait_url}
            alt={player.name}
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-cyber-dark/60 to-cyber-dark/90">
            <span className="text-8xl text-cyber-pink/50">{player.name[0]}</span>
          </div>
        )}

        {/* 底部渐变遮罩 - 让名字更易读 */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

        {/* 玩家名字标签 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-cyber-pink"
        >
          <p className="text-sm font-display whitespace-nowrap text-cyber-pink">
            {player.name}
          </p>
        </motion.div>

        {/* 玩家标识 */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-cyber-pink/20 border border-cyber-pink/50 backdrop-blur-sm">
          <span className="text-xs text-cyber-pink font-bold">YOU</span>
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
  // 情绪对应的阴影颜色
  const emotionShadows: Record<string, string> = {
    default: 'shadow-cyber-blue/30',
    happy: 'shadow-green-500/40',
    angry: 'shadow-red-500/40',
    sad: 'shadow-purple-500/40',
    surprised: 'shadow-yellow-500/40',
    fearful: 'shadow-pink-500/40',
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
      }}
      exit={{ opacity: 0, x: slideDirection, y: 50 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={clsx(
        'relative pointer-events-auto cursor-pointer group',
        'transition-all duration-300'
      )}
      onClick={onClick}
    >
      {/* 角色立绘 - 固定尺寸，2/3 屏幕高度 */}
      <div 
        className={clsx(
          'relative overflow-hidden rounded-lg',
          SPRITE_CONFIG.width,
          SPRITE_CONFIG.height,
          SPRITE_CONFIG.constraints,
          'transition-all duration-300 shadow-2xl',
          emotionShadows[npc.emotion] || emotionShadows.default,
          highlighted && 'ring-2 ring-cyber-blue/50'
        )}
      >
        {npc.portrait_url ? (
          <img
            src={npc.portrait_url}
            alt={npc.name}
            className="w-full h-full object-cover object-top"
            style={{
              filter: highlighted ? 'none' : 'brightness(0.85) saturate(0.9)',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-cyber-dark/60 to-cyber-dark/90">
            <span className="text-8xl text-cyber-blue/50">{npc.name[0]}</span>
          </div>
        )}

        {/* 底部渐变遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

        {/* 名字标签 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            'absolute bottom-4 left-1/2 -translate-x-1/2',
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
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          'animate-pulse',
          npc.emotion === 'happy' && 'bg-green-400',
          npc.emotion === 'angry' && 'bg-red-400',
          npc.emotion === 'sad' && 'bg-purple-400',
          npc.emotion === 'surprised' && 'bg-yellow-400',
          npc.emotion === 'fearful' && 'bg-pink-400',
          npc.emotion === 'default' && 'bg-cyber-blue',
        )} />

        {/* 悬停提示 */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-sm bg-black/60 px-4 py-2 rounded-lg">
            点击交谈
          </span>
        </div>
      </div>
    </motion.div>
  );
}
