const API_BASE = '/api/admin';

type AdminToken = string | null;

let adminToken: AdminToken = null;

export const setAdminToken = (token: AdminToken) => {
  adminToken = token;
  if (token) {
    localStorage.setItem('adminToken', token);
  } else {
    localStorage.removeItem('adminToken');
  }
};

export const getAdminToken = (): AdminToken => {
  if (!adminToken && typeof window !== 'undefined') {
    adminToken = localStorage.getItem('adminToken');
  }
  return adminToken;
};

async function fetchAdminApi<T>(
  endpoint: string,
  options?: RequestInit,
  requireAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers as Record<string, string>,
  };

  if (requireAuth && adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    adminToken = null;
    localStorage.removeItem('adminToken');
    throw new Error('认证已过期，请重新登录');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '请求失败' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  // Handle non-JSON responses (like PNG export)
  const contentType = response.headers.get('Content-Type');
  if (contentType?.includes('image/')) {
    return response.blob() as unknown as T;
  }

  return response.json();
}

export interface CharacterTemplate {
  id: string;
  name: string;
  description: string;
  personality: string;
  portrait_path?: string;
  first_message?: string;
  scenario?: string;
  example_dialogs: string[];
  tags: string[];
  is_player_avatar: boolean;
  initial_attributes: Record<string, unknown>;
  raw_card_data?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface LocationTemplate {
  id: string;
  name: string;
  description: string;
  background_path?: string;
  tags: string[];
  default_connections: string[];
  default_characters: string[];
  is_starting_location: boolean;
  raw_card_data?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export const adminApi = {
  // Auth
  login: (password: string) =>
    fetchAdminApi<{ success: boolean; token?: string; message?: string }>(
      '/login',
      {
        method: 'POST',
        body: JSON.stringify({ password }),
      },
      false
    ),

  logout: () =>
    fetchAdminApi<{ success: boolean }>('/logout', { method: 'POST' }),

  // Characters
  listCharacters: () =>
    fetchAdminApi<{ characters: CharacterTemplate[] }>('/characters'),

  getCharacter: (id: string) =>
    fetchAdminApi<CharacterTemplate>(`/characters/${id}`),

  createCharacter: (data: Partial<CharacterTemplate>) =>
    fetchAdminApi<{ success: boolean; id: string }>('/characters', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCharacter: (id: string, data: Partial<CharacterTemplate>) =>
    fetchAdminApi<{ success: boolean }>(`/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCharacter: (id: string) =>
    fetchAdminApi<{ success: boolean }>(`/characters/${id}`, {
      method: 'DELETE',
    }),

  importCharacterPng: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/characters/import`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: '导入失败' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json() as Promise<{
      success: boolean;
      id: string;
      name: string;
      message: string;
    }>;
  },

  exportCharacterPng: async (id: string, name: string) => {
    const response = await fetch(`${API_BASE}/characters/${id}/export`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: '导出失败' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.png`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  uploadCharacterPortrait: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/characters/${id}/portrait`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: '上传失败' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json() as Promise<{
      success: boolean;
      portrait_path: string;
    }>;
  },

  // Locations
  listLocations: () =>
    fetchAdminApi<{ locations: LocationTemplate[] }>('/locations'),

  getLocation: (id: string) =>
    fetchAdminApi<LocationTemplate>(`/locations/${id}`),

  createLocation: (data: Partial<LocationTemplate>) =>
    fetchAdminApi<{ success: boolean; id: string }>('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateLocation: (id: string, data: Partial<LocationTemplate>) =>
    fetchAdminApi<{ success: boolean }>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteLocation: (id: string) =>
    fetchAdminApi<{ success: boolean }>(`/locations/${id}`, {
      method: 'DELETE',
    }),

  uploadLocationBackground: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/locations/${id}/background`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: '上传失败' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json() as Promise<{
      success: boolean;
      background_path: string;
    }>;
  },

  exportLocationPng: async (id: string, name: string) => {
    const response = await fetch(`${API_BASE}/locations/${id}/export`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: '导出失败' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.png`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // World Rules
  getWorldRules: (worldId = 'world_1') =>
    fetchAdminApi<{ world_id: string; world_name: string; rules: string[] }>(
      `/world/rules?world_id=${worldId}`
    ),

  updateWorldRules: (rules: string[], worldId = 'world_1') =>
    fetchAdminApi<{ success: boolean }>(
      `/world/rules?world_id=${worldId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ rules }),
      }
    ),

  // Avatars (public, no auth required)
  listAvatars: () =>
    fetchAdminApi<{
      avatars: Array<{
        id: string;
        name: string;
        description: string;
        portrait_path?: string;
        personality?: string;
        initial_attributes: Record<string, unknown>;
      }>;
    }>('/avatars', undefined, false),

  selectAvatar: (templateId: string, playerName: string, worldId = 'world_1', playerId = 'player_1') =>
    fetchAdminApi<{
      success: boolean;
      player: {
        id: string;
        name: string;
        portrait_url?: string;
      };
      starting_location?: {
        id: string;
        name: string;
        background_url?: string;
      };
    }>(
      '/avatar/select',
      {
        method: 'POST',
        body: JSON.stringify({
          template_id: templateId,
          player_name: playerName,
          world_id: worldId,
          player_id: playerId,
        }),
      },
      false
    ),
};
