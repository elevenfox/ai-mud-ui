'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '@/lib/adminApi';

interface Avatar {
  id: string;
  name: string;
  description: string;
  portrait_path?: string;
  personality?: string;
  initial_attributes: Record<string, unknown>;
}

interface AvatarSelectionProps {
  onSelect: (avatarId: string, playerName: string) => void;
}

export function AvatarSelection({ onSelect }: AvatarSelectionProps) {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [detailAvatar, setDetailAvatar] = useState<Avatar | null>(null); // 查看详情的角色
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAvatars();
  }, []);

  const loadAvatars = async () => {
    try {
      const result = await adminApi.listAvatars();
      setAvatars(result.avatars);
      if (result.avatars.length > 0) {
        setSelectedAvatar(result.avatars[0]);
      }
    } catch (err) {
      console.error('Failed to load avatars:', err);
      setError('无法加载角色形象');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (!selectedAvatar) {
      setError('请选择一个角色形象');
      return;
    }
    if (!playerName.trim()) {
      setError('请输入你的名字');
      return;
    }
    onSelect(selectedAvatar.id, playerName.trim());
  };

  // 横向滚动
  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 280; // 卡片宽度 + gap
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">加载角色形象...</p>
        </div>
      </div>
    );
  }

  if (avatars.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-slate-800/80 backdrop-blur-lg rounded-2xl border border-purple-500/30">
          <h1 className="text-2xl font-bold text-purple-300 mb-4">🎮 AI MUD</h1>
          <p className="text-gray-400 mb-6">
            管理员尚未设置可选的玩家形象。
            <br />
            请访问管理后台添加角色并标记为"玩家形象"。
          </p>
          <a
            href="/admin"
            className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors"
          >
            前往管理后台
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex flex-col">
      {/* Header - Fixed */}
      <div className="text-center py-6 flex-shrink-0">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          🎮 AI MUD
        </h1>
        <p className="text-gray-400 text-sm">选择你的角色形象，开始冒险之旅</p>
      </div>

      {/* Avatar Carousel - Scrollable */}
      <div className="flex-1 flex flex-col justify-center min-h-0 px-4">
        <div className="relative">
          {/* 左箭头 */}
          {avatars.length > 3 && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-slate-800/90 hover:bg-slate-700 rounded-full border border-purple-500/30 text-white shadow-lg transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* 角色卡片走马灯 */}
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-8 py-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {avatars.map((avatar) => (
              <AvatarCard
                key={avatar.id}
                avatar={avatar}
                isSelected={selectedAvatar?.id === avatar.id}
                onSelect={() => setSelectedAvatar(avatar)}
                onViewDetail={() => setDetailAvatar(avatar)}
              />
            ))}
          </div>

          {/* 右箭头 */}
          {avatars.length > 3 && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-slate-800/90 hover:bg-slate-700 rounded-full border border-purple-500/30 text-white shadow-lg transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* 提示文字 */}
        <p className="text-center text-gray-500 text-xs mt-2">
          点击选择 · 长按或右键查看详情
        </p>
      </div>

      {/* Bottom Section - Always Visible */}
      <div className="flex-shrink-0 p-4 pb-6">
        <div className="max-w-md mx-auto">
          {/* Name Input */}
          <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl p-4 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-3">
              {/* 选中的角色小头像 */}
              {selectedAvatar && (
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 border-purple-500/50">
                  {selectedAvatar.portrait_path ? (
                    <img
                      src={selectedAvatar.portrait_path}
                      alt={selectedAvatar.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center text-xl">
                      👤
                    </div>
                  )}
                </div>
              )}
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">
                  你的名字
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder={selectedAvatar?.name || "输入你想要的名字..."}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                />
              </div>
            </div>

            {error && (
              <div className="mb-3 text-red-400 text-xs bg-red-500/10 py-2 px-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={!selectedAvatar}
              className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
            >
              ✨ 开始冒险
            </button>
          </div>

          {/* Admin Link */}
          <div className="text-center mt-3">
            <a href="/admin" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">
              管理后台 →
            </a>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailAvatar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setDetailAvatar(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-purple-500/50 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-4">
                {/* 大头像 */}
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 border-purple-500/50">
                  {detailAvatar.portrait_path ? (
                    <img
                      src={detailAvatar.portrait_path}
                      alt={detailAvatar.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center text-4xl">
                      👤
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-purple-300 mb-1">{detailAvatar.name}</h2>
                  {detailAvatar.personality && (
                    <p className="text-sm text-gray-400 italic">「{detailAvatar.personality}」</p>
                  )}
                </div>

                {/* 关闭按钮 */}
                <button
                  onClick={() => setDetailAvatar(null)}
                  className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 描述 */}
              <div className="prose prose-invert prose-sm max-w-none">
                <h4 className="text-gray-300 text-sm font-medium mb-2">角色描述</h4>
                <p className="text-gray-400 text-sm whitespace-pre-wrap leading-relaxed">
                  {detailAvatar.description || '神秘的旅人，没有人知道他的过去...'}
                </p>
              </div>

              {/* 选择按钮 */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setDetailAvatar(null)}
                  className="flex-1 py-2 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 rounded-lg transition-colors"
                >
                  关闭
                </button>
                <button
                  onClick={() => {
                    setSelectedAvatar(detailAvatar);
                    setDetailAvatar(null);
                  }}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                >
                  选择此角色
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 角色卡片组件（紧凑版）
interface AvatarCardProps {
  avatar: Avatar;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetail: () => void;
}

function AvatarCard({ avatar, isSelected, onSelect, onViewDetail }: AvatarCardProps) {
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      onViewDetail();
    }, 500); // 长按 500ms 显示详情
    setPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onViewDetail();
  };

  return (
    <button
      onClick={onSelect}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
      className={`relative flex-shrink-0 w-[200px] p-1 rounded-xl transition-all duration-300 ${
        isSelected
          ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 scale-105 shadow-lg shadow-purple-500/30'
          : 'bg-slate-700/50 hover:bg-slate-700'
      }`}
    >
      <div className="bg-slate-800 rounded-lg p-3">
        {/* Portrait */}
        <div className="aspect-[3/4] rounded-lg overflow-hidden mb-2 bg-slate-700">
          {avatar.portrait_path ? (
            <img
              src={avatar.portrait_path}
              alt={avatar.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              👤
            </div>
          )}
        </div>

        {/* Name only - description collapsed */}
        <h3 className="font-bold text-white text-sm text-center truncate">{avatar.name}</h3>

        {/* View detail hint */}
        <p className="text-[10px] text-gray-500 text-center mt-1">长按查看详情</p>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
      </div>
    </button>
  );
}
