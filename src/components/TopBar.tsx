'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import clsx from 'clsx';

export function TopBar() {
  const { world, player, saveCheckpoint, startNewGame, listCheckpoints, loadCheckpoint } = useGameStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [checkpoints, setCheckpoints] = useState<Array<{
    id: string;
    description: string;
    created_at: string;
    is_auto: boolean;
  }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setShowMenu(false);
    await saveCheckpoint(`手动存档 - ${new Date().toLocaleString('zh-CN')}`);
    setIsSaving(false);
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 2000);
  };

  const handleLoad = async () => {
    setShowMenu(false);
    setIsLoading(true);
    const list = await listCheckpoints();
    setCheckpoints(list);
    setIsLoading(false);
    setShowLoadModal(true);
  };

  const handleLoadCheckpoint = async (checkpointId: string) => {
    setShowLoadModal(false);
    await loadCheckpoint(checkpointId);
  };

  const handleNewGame = () => {
    setShowMenu(false);
    if (confirm('确定要开始新游戏吗？当前进度将不会自动保存。')) {
      startNewGame();
    }
  };

  const handleOpenAdmin = () => {
    setShowMenu(false);
    window.open('/admin', '_blank');
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
        
        {/* Right: Burger Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg border border-cyber-blue/30 hover:bg-cyber-blue/10 hover:border-cyber-blue transition-all"
            title="菜单"
          >
            {/* Burger icon */}
            <svg className="w-5 h-5 text-cyber-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-cyber-dark/95 backdrop-blur-sm border border-cyber-blue/30 rounded-lg shadow-xl overflow-hidden"
              >
                <MenuItem 
                  icon="🎮" 
                  label="新游戏" 
                  onClick={handleNewGame}
                  description="重新开始"
                />
                <MenuItem 
                  icon="💾" 
                  label="保存" 
                  onClick={handleSave}
                  disabled={isSaving}
                  description={isSaving ? '保存中...' : '保存当前进度'}
                />
                <MenuItem 
                  icon="📂" 
                  label="载入" 
                  onClick={handleLoad}
                  description="读取存档"
                />
                <div className="border-t border-cyber-blue/20 my-1" />
                <MenuItem 
                  icon="⚙️" 
                  label="管理" 
                  onClick={handleOpenAdmin}
                  description="打开管理界面"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save confirmation toast */}
          <AnimatePresence>
            {showSaveConfirm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute right-0 mt-2 px-4 py-2 bg-cyber-green/20 border border-cyber-green rounded-lg text-sm text-cyber-green whitespace-nowrap"
              >
                ✓ 已保存！
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Load Modal */}
      <AnimatePresence>
        {showLoadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setShowLoadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-cyber-dark border border-cyber-blue/50 rounded-lg p-6 max-w-md w-full mx-4 max-h-[70vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-display text-cyber-blue mb-4">载入存档</h2>
              
              {isLoading ? (
                <div className="text-center py-8 text-gray-400">加载中...</div>
              ) : checkpoints.length === 0 ? (
                <div className="text-center py-8 text-gray-400">暂无存档</div>
              ) : (
                <div className="space-y-2">
                  {checkpoints.map((cp) => (
                    <button
                      key={cp.id}
                      onClick={() => handleLoadCheckpoint(cp.id)}
                      className="w-full p-3 text-left bg-cyber-dark/50 hover:bg-cyber-blue/10 border border-gray-700 hover:border-cyber-blue/50 rounded-lg transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-200 group-hover:text-cyber-blue transition-colors">
                          {cp.description || '未命名存档'}
                        </span>
                        {cp.is_auto && (
                          <span className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-400">
                            自动
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(cp.created_at).toLocaleString('zh-CN')}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              <button
                onClick={() => setShowLoadModal(false)}
                className="mt-4 w-full py-2 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 rounded-lg transition-colors"
              >
                取消
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 菜单项组件
interface MenuItemProps {
  icon: string;
  label: string;
  onClick: () => void;
  description?: string;
  disabled?: boolean;
}

function MenuItem({ icon, label, onClick, description, disabled }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'w-full px-4 py-3 flex items-center gap-3 transition-colors',
        disabled
          ? 'text-gray-500 cursor-not-allowed'
          : 'text-gray-200 hover:bg-cyber-blue/10 hover:text-cyber-blue'
      )}
    >
      <span className="text-lg">{icon}</span>
      <div className="text-left">
        <div className="text-sm font-medium">{label}</div>
        {description && (
          <div className="text-xs text-gray-500">{description}</div>
        )}
      </div>
    </button>
  );
}
