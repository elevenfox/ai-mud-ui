'use client';

import { useState, useEffect } from 'react';
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
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            🎮 AI MUD
          </h1>
          <p className="text-gray-400">选择你的角色形象，开始冒险之旅</p>
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {avatars.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => setSelectedAvatar(avatar)}
              className={`relative p-1 rounded-2xl transition-all duration-300 ${
                selectedAvatar?.id === avatar.id
                  ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 scale-105 shadow-lg shadow-purple-500/30'
                  : 'bg-slate-700/50 hover:bg-slate-700'
              }`}
            >
              <div className="bg-slate-800 rounded-xl p-4 h-full">
                {/* Portrait */}
                <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-slate-700">
                  {avatar.portrait_path ? (
                    <img
                      src={avatar.portrait_path}
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      👤
                    </div>
                  )}
                </div>

                {/* Info */}
                <h3 className="font-bold text-white text-lg mb-2">{avatar.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-3">{avatar.description || '神秘的旅人'}</p>

                {/* Selection indicator */}
                {selectedAvatar?.id === avatar.id && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Avatar Details */}
        {selectedAvatar && (
          <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 mb-6">
            <div className="flex items-start gap-6">
              {/* Portrait */}
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 border-purple-500/50">
                {selectedAvatar.portrait_path ? (
                  <img
                    src={selectedAvatar.portrait_path}
                    alt={selectedAvatar.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center text-3xl">
                    👤
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-purple-300 mb-2">{selectedAvatar.name}</h2>
                <p className="text-gray-400 text-sm mb-3">{selectedAvatar.description}</p>
                {selectedAvatar.personality && (
                  <div className="text-xs text-gray-500 italic">
                    「{selectedAvatar.personality}」
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Name Input */}
        <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            你的名字
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="输入你想要的名字..."
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 text-lg"
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          />

          {error && (
            <div className="mt-3 text-red-400 text-sm bg-red-500/10 py-2 px-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleStart}
            className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 rounded-xl font-bold text-white text-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
          >
            ✨ 开始冒险
          </button>
        </div>

        {/* Admin Link */}
        <div className="text-center mt-6">
          <a href="/admin" className="text-sm text-gray-500 hover:text-gray-400 transition-colors">
            管理后台 →
          </a>
        </div>
      </div>
    </div>
  );
}
