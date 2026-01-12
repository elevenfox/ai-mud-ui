'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi, setAdminToken, getAdminToken, CharacterTemplate, LocationTemplate } from '@/lib/adminApi';

// ============== Login Screen ==============
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await adminApi.login(password);
      if (result.success && result.token) {
        setAdminToken(result.token);
        onLogin();
      } else {
        setError(result.message || '登录失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="bg-slate-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-purple-500/30 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          🎮 AI MUD 管理后台
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              管理员密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="输入密码..."
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============== Character Editor ==============
function CharacterEditor({
  character,
  onSave,
  onCancel,
}: {
  character?: CharacterTemplate;
  onSave: () => void;
  onCancel: () => void;
}) {
  const isNew = !character;
  const [form, setForm] = useState({
    name: character?.name || '',
    description: character?.description || '',
    personality: character?.personality || '',
    first_message: character?.first_message || '',
    scenario: character?.scenario || '',
    example_dialogs: character?.example_dialogs?.join('\n---\n') || '',
    tags: character?.tags?.join(', ') || '',
    gender: character?.gender || '',
    age: character?.age?.toString() || '',
    occupation: character?.occupation || '',
    is_player_avatar: character?.is_player_avatar || false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const data = {
        name: form.name,
        description: form.description,
        personality: form.personality,
        first_message: form.first_message || null,
        scenario: form.scenario || null,
        example_dialogs: form.example_dialogs
          ? form.example_dialogs.split('---').map((s) => s.trim()).filter(Boolean)
          : [],
        tags: form.tags
          ? form.tags.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        gender: form.gender || null,
        age: form.age ? parseInt(form.age, 10) : null,
        occupation: form.occupation || null,
        is_player_avatar: form.is_player_avatar,
      };

      if (isNew) {
        await adminApi.createCharacter(data);
      } else {
        await adminApi.updateCharacter(character.id, data);
      }
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-purple-300">
          {isNew ? '✨ 新建角色' : '📝 编辑角色'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">名称 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">标签</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                placeholder="逗号分隔"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">性别</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
              >
                <option value="">未设置</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">其他</option>
                <option value="unknown">未知</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">年龄</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                placeholder="数字"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">职业</label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                placeholder="职业/身份"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">性格</label>
            <textarea
              value={form.personality}
              onChange={(e) => setForm({ ...form, personality: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">首次消息</label>
            <textarea
              value={form.first_message}
              onChange={(e) => setForm({ ...form, first_message: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">场景/背景</label>
            <textarea
              value={form.scenario}
              onChange={(e) => setForm({ ...form, scenario: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              对话示例 <span className="text-gray-500">(用 --- 分隔多段)</span>
            </label>
            <textarea
              value={form.example_dialogs}
              onChange={(e) => setForm({ ...form, example_dialogs: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white h-32 font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_player_avatar"
              checked={form.is_player_avatar}
              onChange={(e) => setForm({ ...form, is_player_avatar: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="is_player_avatar" className="text-sm text-gray-300">
              可作为玩家形象选择
            </label>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 py-2 px-3 rounded-lg">{error}</div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-white font-semibold transition-all disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============== Location Editor ==============
function LocationEditor({
  location,
  onSave,
  onCancel,
}: {
  location?: LocationTemplate;
  onSave: () => void;
  onCancel: () => void;
}) {
  const isNew = !location;
  const [form, setForm] = useState({
    name: location?.name || '',
    description: location?.description || '',
    tags: location?.tags?.join(', ') || '',
    is_starting_location: location?.is_starting_location || false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const data = {
        name: form.name,
        description: form.description,
        tags: form.tags
          ? form.tags.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        is_starting_location: form.is_starting_location,
      };

      if (isNew) {
        await adminApi.createLocation(data);
      } else {
        await adminApi.updateLocation(location.id, data);
      }
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6 text-green-300">
          {isNew ? '✨ 新建场景' : '📝 编辑场景'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">名称 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">标签</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
                placeholder="逗号分隔"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">场景描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 text-white h-40"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_starting_location"
              checked={form.is_starting_location}
              onChange={(e) => setForm({ ...form, is_starting_location: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="is_starting_location" className="text-sm text-gray-300">
              🚀 可作为初始场景（游戏开始时随机选择）
            </label>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 py-2 px-3 rounded-lg">{error}</div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 rounded-lg text-white font-semibold transition-all disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============== Characters Tab ==============
function CharactersTab() {
  const [characters, setCharacters] = useState<CharacterTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingChar, setEditingChar] = useState<CharacterTemplate | null | 'new'>(null);
  const [importing, setImporting] = useState(false);

  const loadCharacters = useCallback(async () => {
    try {
      const result = await adminApi.listCharacters();
      setCharacters(result.characters);
    } catch (err) {
      console.error('Failed to load characters:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      await adminApi.importCharacterPng(file);
      await loadCharacters();
    } catch (err) {
      alert(err instanceof Error ? err.message : '导入失败');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (char: CharacterTemplate) => {
    if (!confirm(`确定要删除角色「${char.name}」吗？`)) return;

    try {
      await adminApi.deleteCharacter(char.id);
      await loadCharacters();
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleExport = async (char: CharacterTemplate) => {
    try {
      await adminApi.exportCharacterPng(char.id, char.name);
    } catch (err) {
      alert(err instanceof Error ? err.message : '导出失败');
    }
  };

  const handlePortraitUpload = async (char: CharacterTemplate, file: File) => {
    try {
      await adminApi.uploadCharacterPortrait(char.id, file);
      await loadCharacters();
    } catch (err) {
      alert(err instanceof Error ? err.message : '上传失败');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">加载中...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-purple-300">👤 角色库</h2>
        <div className="flex gap-3">
          <label className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition-colors">
            <span>{importing ? '导入中...' : '📥 导入 PNG'}</span>
            <input
              type="file"
              accept=".png"
              onChange={handleImport}
              className="hidden"
              disabled={importing}
            />
          </label>
          <button
            onClick={() => setEditingChar('new')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
          >
            ➕ 新建角色
          </button>
        </div>
      </div>

      {characters.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          暂无角色，点击上方按钮添加
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((char) => (
            <div
              key={char.id}
              className="bg-slate-700/50 rounded-xl p-4 border border-slate-600 hover:border-purple-500/50 transition-colors"
            >
              <div className="flex gap-4">
                {/* Portrait */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  {char.portrait_path ? (
                    <img
                      src={char.portrait_path}
                      alt={char.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-600 rounded-lg flex items-center justify-center text-2xl">
                      👤
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg cursor-pointer">
                    <span className="text-xs">📷</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePortraitUpload(char, file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white truncate">{char.name}</h3>
                    {char.is_player_avatar && (
                      <span className="text-xs bg-pink-600/30 text-pink-300 px-2 py-0.5 rounded">
                        玩家形象
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2 mt-1">{char.description || '暂无描述'}</p>
                  
                  {/* 角色属性 */}
                  {(char.gender || char.age || char.occupation) && (
                    <div className="flex gap-2 mt-2 text-xs text-gray-500">
                      {char.gender && (
                        <span>
                          {char.gender === 'male' ? '♂' : char.gender === 'female' ? '♀' : '⚧'} {char.gender === 'male' ? '男' : char.gender === 'female' ? '女' : char.gender === 'other' ? '其他' : '未知'}
                        </span>
                      )}
                      {char.age && <span>• {char.age} 岁</span>}
                      {char.occupation && <span>• {char.occupation}</span>}
                    </div>
                  )}
                  
                  {char.tags && char.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {char.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-slate-600 px-2 py-0.5 rounded text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-600">
                <button
                  onClick={() => setEditingChar(char)}
                  className="flex-1 py-1.5 text-sm bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleExport(char)}
                  className="flex-1 py-1.5 text-sm bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                  disabled={!char.portrait_path}
                  title={char.portrait_path ? '导出为 PNG' : '需要先上传立绘'}
                >
                  导出
                </button>
                <button
                  onClick={() => handleDelete(char)}
                  className="py-1.5 px-3 text-sm bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded-lg transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {editingChar && (
        <CharacterEditor
          character={editingChar === 'new' ? undefined : editingChar}
          onSave={() => {
            setEditingChar(null);
            loadCharacters();
          }}
          onCancel={() => setEditingChar(null)}
        />
      )}
    </div>
  );
}

// ============== Locations Tab ==============
function LocationsTab() {
  const [locations, setLocations] = useState<LocationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLoc, setEditingLoc] = useState<LocationTemplate | null | 'new'>(null);

  const loadLocations = useCallback(async () => {
    try {
      const result = await adminApi.listLocations();
      setLocations(result.locations);
    } catch (err) {
      console.error('Failed to load locations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const handleDelete = async (loc: LocationTemplate) => {
    if (!confirm(`确定要删除场景「${loc.name}」吗？`)) return;

    try {
      await adminApi.deleteLocation(loc.id);
      await loadLocations();
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleExport = async (loc: LocationTemplate) => {
    try {
      await adminApi.exportLocationPng(loc.id, loc.name);
    } catch (err) {
      alert(err instanceof Error ? err.message : '导出失败');
    }
  };

  const handleBackgroundUpload = async (loc: LocationTemplate, file: File) => {
    try {
      await adminApi.uploadLocationBackground(loc.id, file);
      await loadLocations();
    } catch (err) {
      alert(err instanceof Error ? err.message : '上传失败');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">加载中...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-green-300">🏠 场景库</h2>
        <button
          onClick={() => setEditingLoc('new')}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
        >
          ➕ 新建场景
        </button>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          暂无场景，点击上方按钮添加
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="bg-slate-700/50 rounded-xl overflow-hidden border border-slate-600 hover:border-green-500/50 transition-colors"
            >
              {/* Background Preview */}
              <div className="relative h-32">
                {loc.background_path ? (
                  <img
                    src={loc.background_path}
                    alt={loc.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-4xl">
                    🏞️
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-sm">📷 上传背景图</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBackgroundUpload(loc, file);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white">{loc.name}</h3>
                  {loc.is_starting_location && (
                    <span className="text-xs bg-green-600/30 text-green-300 px-2 py-0.5 rounded">
                      🚀 初始场景
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 mt-1">{loc.description || '暂无描述'}</p>
                {loc.tags && loc.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {loc.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-slate-600 px-2 py-0.5 rounded text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-600">
                  <button
                    onClick={() => setEditingLoc(loc)}
                    className="flex-1 py-1.5 text-sm bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleExport(loc)}
                    className="flex-1 py-1.5 text-sm bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                    disabled={!loc.background_path}
                    title={loc.background_path ? '导出为 PNG' : '需要先上传背景图'}
                  >
                    导出
                  </button>
                  <button
                    onClick={() => handleDelete(loc)}
                    className="py-1.5 px-3 text-sm bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded-lg transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {editingLoc && (
        <LocationEditor
          location={editingLoc === 'new' ? undefined : editingLoc}
          onSave={() => {
            setEditingLoc(null);
            loadLocations();
          }}
          onCancel={() => setEditingLoc(null)}
        />
      )}
    </div>
  );
}

// ============== Rules Tab ==============
function RulesTab() {
  const [rules, setRules] = useState<string[]>([]);
  const [worldName, setWorldName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newRule, setNewRule] = useState('');
  
  // 经济系统配置
  const [economy, setEconomy] = useState({
    currency_name: '金币',
    gem_name: '宝石',
    currency_rules: '',
  });
  const [economyLoading, setEconomyLoading] = useState(true);
  const [economySaving, setEconomySaving] = useState(false);

  useEffect(() => {
    loadRules();
    loadEconomy();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const result = await adminApi.getWorldRules();
      setRules(result.rules || []);
      setWorldName(result.world_name);
    } catch (err) {
      console.error('Failed to load rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEconomy = async () => {
    setEconomyLoading(true);
    try {
      const result = await adminApi.getEconomyConfig();
      setEconomy({
        currency_name: result.currency_name || '金币',
        gem_name: result.gem_name || '宝石',
        currency_rules: result.currency_rules || '',
      });
    } catch (err) {
      console.error('加载经济配置失败:', err);
    } finally {
      setEconomyLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateWorldRules(rules);
      alert('保存成功');
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEconomy = async () => {
    setEconomySaving(true);
    try {
      await adminApi.updateEconomyConfig(economy);
      alert('经济配置保存成功');
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败');
    } finally {
      setEconomySaving(false);
    }
  };

  const handleSaveEconomy = async () => {
    setEconomySaving(true);
    try {
      await adminApi.updateEconomyConfig(economy);
      alert('经济配置保存成功');
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败');
    } finally {
      setEconomySaving(false);
    }
  };

  const addRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule('');
    }
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, value: string) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">加载中...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-yellow-300">📜 世界规则</h2>
          <p className="text-sm text-gray-400 mt-1">世界: {worldName}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? '保存中...' : '💾 保存规则'}
        </button>
      </div>

      <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
        <p className="text-sm text-gray-400 mb-4">
          这些规则将指导 AI 在生成叙事和判断玩家行为时的边界
        </p>

        <div className="space-y-3">
          {rules.map((rule, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-yellow-400 mt-2">{index + 1}.</span>
              <textarea
                value={rule}
                onChange={(e) => updateRule(index, e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:ring-2 focus:ring-yellow-500 text-white text-sm"
                rows={2}
              />
              <button
                onClick={() => removeRule(index)}
                className="px-3 py-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-600">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRule()}
            placeholder="输入新规则..."
            className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:ring-2 focus:ring-yellow-500 text-white"
          />
          <button
            onClick={addRule}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors"
          >
            ➕ 添加
          </button>
        </div>
      </div>

      {/* 经济系统配置 */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-green-300">💰 经济系统配置</h2>
            <p className="text-sm text-gray-400 mt-1">配置游戏内的货币系统</p>
          </div>
          <button
            onClick={handleSaveEconomy}
            disabled={economySaving || economyLoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors disabled:opacity-50"
          >
            {economySaving ? '保存中...' : '💾 保存配置'}
          </button>
        </div>

        <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                游戏内货币名称 *
              </label>
              <input
                type="text"
                value={economy.currency_name}
                onChange={(e) => setEconomy({ ...economy, currency_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
                placeholder="例如：金币、信用点、铜币"
                disabled={economyLoading}
              />
              <p className="text-xs text-gray-500 mt-1">用于购买游戏内的物品、服务、食物等</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                付费货币名称 *
              </label>
              <input
                type="text"
                value={economy.gem_name}
                onChange={(e) => setEconomy({ ...economy, gem_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
                placeholder="例如：宝石、钻石、水晶"
                disabled={economyLoading}
              />
              <p className="text-xs text-gray-500 mt-1">用于购买不影响游戏平衡的装饰性道具</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              货币购买范围规则
            </label>
            <textarea
              value={economy.currency_rules}
              onChange={(e) => setEconomy({ ...economy, currency_rules: e.target.value })}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:ring-2 focus:ring-green-500 text-white h-32"
              placeholder="例如：信用点用于购买游戏内的物品、服务、食物、装备、情报等。宝石用于购买不影响游戏平衡的装饰性道具，如角色皮肤、配饰、特效等。"
              disabled={economyLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              AI 会根据这个规则判断玩家消费时应该使用哪种货币
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== Main Admin Page ==============
type TabType = 'characters' | 'locations' | 'rules';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('characters');

  useEffect(() => {
    // Check for existing token
    const token = getAdminToken();
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await adminApi.logout();
    } catch {
      // Ignore logout errors
    }
    setAdminToken(null);
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'characters', label: '角色库', icon: '👤' },
    { id: 'locations', label: '场景库', icon: '🏠' },
    { id: 'rules', label: '世界规则', icon: '📜' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-gray-400 hover:text-white transition-colors">
              ← 返回游戏
            </a>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🎮 AI MUD 管理后台
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            登出
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'characters' && <CharactersTab />}
        {activeTab === 'locations' && <LocationsTab />}
        {activeTab === 'rules' && <RulesTab />}
      </main>
    </div>
  );
}
