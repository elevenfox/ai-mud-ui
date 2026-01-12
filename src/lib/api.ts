const API_BASE = '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // World State
  getWorldState: (worldId: string, playerId: string) =>
    fetchApi<{
      world: {
        id: string;
        time: number;
        name: string;
        mood: string;
        flags: Record<string, boolean>;
      };
      location: {
        id: string;
        name: string;
        description: string;
        background_url?: string;
        connections: string[];
      };
      npcs: Array<{
        id: string;
        name: string;
        description: string;
        emotion: string;
        relationship: number;
        portrait_url?: string;
        first_message?: string;
      }>;
      player: {
        id: string;
        name: string;
        inventory: string[];
        portrait_url?: string;
        personality?: string;
        background?: string;
        currency: number;
        gems: number;
      };
      economy: {
        currency_name: string;
        gem_name: string;
        currency_rules: string;
      };
      choices: {
        narrative: string;
        choices: Array<{ id: string; text: string; hint?: string }>;
        allow_custom: boolean;
        mood: string;
      };
    }>(`/world/${worldId}/state?player_id=${playerId}`),

  getEvents: (worldId: string, limit = 20) =>
    fetchApi<{
      events: Array<{
        id: number;
        timestamp: number;
        event_type: string;
        content: string;
        extra_data: Record<string, unknown>;
      }>;
    }>(`/world/${worldId}/events?limit=${limit}`),

  // Actions
  selectChoice: (
    worldId: string,
    playerId: string,
    choiceId: string,
    choicesContext: Array<{ id: string; text: string; hint?: string }>
  ) =>
    fetchApi<{
      success: boolean;
      narrative: string;
      choices?: Array<{ id: string; text: string; hint?: string }>;
      mood: string;
    }>('/choice/select', {
      method: 'POST',
      body: JSON.stringify({
        world_id: worldId,
        player_id: playerId,
        choice_id: choiceId,
        choices_context: choicesContext,
      }),
    }),

  customAction: (worldId: string, playerId: string, actionText: string) =>
    fetchApi<{
      success: boolean;
      narrative: string;
      mood: string;
    }>('/choice/custom', {
      method: 'POST',
      body: JSON.stringify({
        world_id: worldId,
        player_id: playerId,
        action_text: actionText,
      }),
    }),

  // NPC
  talkToNpc: (worldId: string, playerId: string, npcId: string, message: string) =>
    fetchApi<{
      npc_name: string;
      response: string;
      emotion: string;
      relationship: number;
      portrait_url?: string;
      mood: string;
    }>('/npc/talk', {
      method: 'POST',
      body: JSON.stringify({
        world_id: worldId,
        player_id: playerId,
        npc_id: npcId,
        message: message,
      }),
    }),

  // Checkpoint
  saveCheckpoint: (worldId: string, playerId: string, description?: string) =>
    fetchApi<{
      success: boolean;
      checkpoint_id: string;
      description: string;
      created_at: string;
    }>('/checkpoint/save', {
      method: 'POST',
      body: JSON.stringify({
        world_id: worldId,
        player_id: playerId,
        description: description,
      }),
    }),

  loadCheckpoint: (checkpointId: string) =>
    fetchApi<{
      success: boolean;
      checkpoint_id: string;
      description: string;
      restored_at: string;
    }>(`/checkpoint/${checkpointId}/load`, {
      method: 'POST',
    }),

  listCheckpoints: (worldId: string, playerId: string) =>
    fetchApi<{
      checkpoints: Array<{
        id: string;
        description: string;
        created_at: string;
        is_auto: boolean;
      }>;
    }>(`/checkpoint/list?world_id=${worldId}&player_id=${playerId}`),
};
