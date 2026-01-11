'use client';

import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GameScreen } from '@/components/GameScreen';
import { LoadingScreen } from '@/components/LoadingScreen';
import { AvatarSelection } from '@/components/AvatarSelection';
import { adminApi } from '@/lib/adminApi';

type GamePhase = 'checking' | 'avatar_select' | 'loading' | 'playing' | 'error';

export default function Home() {
  const { isLoading, error, initGame, world } = useGameStore();
  const [phase, setPhase] = useState<GamePhase>('checking');
  const [initError, setInitError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize game on mount
  const initialize = useCallback(async () => {
    if (initialized) return;
    setInitialized(true);

    // Check if we have a saved avatar selection
    const hasSelectedAvatar = localStorage.getItem('hasSelectedAvatar');
    
    if (hasSelectedAvatar === 'true') {
      // Player has already selected, load the game
      setPhase('loading');
      try {
        await initGame('world_1', 'player_1');
        setPhase('playing');
      } catch (err) {
        setInitError(err instanceof Error ? err.message : '加载失败');
        setPhase('error');
      }
    } else {
      // Show avatar selection
      setPhase('avatar_select');
    }
  }, [initialized, initGame]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleAvatarSelect = async (avatarId: string, playerName: string) => {
    setPhase('loading');
    setInitError(null);

    try {
      // Create/update player with selected avatar
      await adminApi.selectAvatar(avatarId, playerName, 'world_1', 'player_1');
      
      // Mark as selected
      localStorage.setItem('hasSelectedAvatar', 'true');
      
      // Initialize game
      await initGame('world_1', 'player_1');
      setPhase('playing');
    } catch (err) {
      setInitError(err instanceof Error ? err.message : '初始化失败');
      setPhase('error');
    }
  };

  const handleRetry = async () => {
    setPhase('loading');
    setInitError(null);
    
    try {
      await initGame('world_1', 'player_1');
      setPhase('playing');
    } catch {
      setPhase('avatar_select');
    }
  };

  const handleReset = () => {
    localStorage.removeItem('hasSelectedAvatar');
    setPhase('avatar_select');
  };

  // Show loading during initial check or explicit loading phase
  if (phase === 'checking' || phase === 'loading') {
    return <LoadingScreen />;
  }

  // Show avatar selection
  if (phase === 'avatar_select') {
    return <AvatarSelection onSelect={handleAvatarSelect} />;
  }

  // Show error screen
  if (phase === 'error' || error || initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center p-8 bg-slate-800/80 backdrop-blur-lg rounded-2xl border border-red-500/30 max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">连接错误</h1>
          <p className="text-gray-400 mb-6">{error || initError}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={handleRetry}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors"
            >
              重新连接
            </button>
            <button 
              onClick={handleReset}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white transition-colors"
            >
              重选角色
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show game screen (also handles store's isLoading state)
  if (isLoading) {
    return <LoadingScreen />;
  }

  return <GameScreen />;
}
