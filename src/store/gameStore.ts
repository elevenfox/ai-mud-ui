import { create } from 'zustand';
import { api } from '@/lib/api';

// Types
export interface Choice {
  id: string;
  text: string;
  hint?: string;
}

export interface NPC {
  id: string;
  name: string;
  description: string;
  emotion: string;
  relationship: number;
  portrait_url?: string;
  first_message?: string;
  position: 'left' | 'center' | 'right';
}

export interface Location {
  id: string;
  name: string;
  description: string;
  background_url?: string;
  connections: string[];
}

export interface GameEvent {
  id: number;
  timestamp: number;
  event_type: string;
  content: string;
  extra_data: Record<string, unknown>;
}

export interface WorldState {
  id: string;
  time: number;
  name: string;
  mood: string;
  flags: Record<string, boolean>;
}

export interface EconomyInfo {
  currency_name: string;
  gem_name: string;
  currency_rules: string;
}

export interface Player {
  id: string;
  name: string;
  inventory: string[];
  portrait_url?: string;
  personality?: string;
  background?: string;
  currency: number;
  gems: number;
  position: 'left' | 'center' | 'right';
}

export interface ChoicesResponse {
  narrative: string;
  choices: Choice[];
  allow_custom: boolean;
  mood: string;
  character_positions?: Record<string, 'left' | 'center' | 'right'>;
}

export interface Checkpoint {
  id: string;
  description: string;
  created_at: string;
  is_auto: boolean;
}

interface GameState {
  // Connection state
  isLoading: boolean;
  error: string | null;
  
  // World state
  worldId: string | null;
  playerId: string | null;
  world: WorldState | null;
  location: Location | null;
  npcs: NPC[];
  player: Player | null;
  economy: EconomyInfo | null;
  
  // Game state
  choices: ChoicesResponse | null;
  events: GameEvent[];
  currentNarrative: string;
  isProcessing: boolean;
  
  // Dialog state
  talkingToNpc: NPC | null;
  dialogHistory: Array<{ role: 'player' | 'npc'; content: string }>;
  
  // Game phase (for new game flow)
  gamePhase: 'playing' | 'new_game';
  
  // Actions
  initGame: (worldId: string, playerId: string) => Promise<void>;
  selectChoice: (choiceId: string) => Promise<void>;
  submitCustomAction: (action: string) => Promise<void>;
  startTalkingTo: (npc: NPC) => void;
  sendMessage: (message: string) => Promise<void>;
  endConversation: () => void;
  refreshState: () => Promise<void>;
  saveCheckpoint: (description?: string) => Promise<void>;
  listCheckpoints: () => Promise<Checkpoint[]>;
  loadCheckpoint: (checkpointId: string) => Promise<void>;
  startNewGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  isLoading: true,
  error: null,
  worldId: null,
  playerId: null,
  world: null,
  location: null,
  npcs: [],
  player: null,
  economy: null,
  choices: null,
  events: [],
  currentNarrative: '',
  isProcessing: false,
  talkingToNpc: null,
  dialogHistory: [],
  gamePhase: 'playing',

  initGame: async (worldId: string, playerId: string) => {
    set({ isLoading: true, error: null, worldId, playerId });
    
    try {
      const state = await api.getWorldState(worldId, playerId);
      const eventsRes = await api.getEvents(worldId);
      
      set({
        isLoading: false,
        world: state.world,
        location: state.location,
        npcs: state.npcs,
        player: state.player,
        economy: state.economy,
        choices: state.choices,
        events: eventsRes.events,
        currentNarrative: state.choices?.narrative || '',
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to connect to server',
      });
    }
  },

  selectChoice: async (choiceId: string) => {
    const { worldId, playerId, choices } = get();
    if (!worldId || !playerId || !choices) return;
    
    set({ isProcessing: true });
    
    try {
      const result = await api.selectChoice(worldId, playerId, choiceId, choices.choices);
      
      set({
        currentNarrative: result.narrative,
        isProcessing: false,
      });
      
      // Refresh full state after action
      await get().refreshState();
    } catch (err) {
      set({
        isProcessing: false,
        error: err instanceof Error ? err.message : 'Action failed',
      });
    }
  },

  submitCustomAction: async (action: string) => {
    const { worldId, playerId } = get();
    if (!worldId || !playerId) return;
    
    set({ isProcessing: true });
    
    try {
      const result = await api.customAction(worldId, playerId, action);
      
      if (!result.success) {
        set({
          currentNarrative: result.narrative,
          isProcessing: false,
        });
        return;
      }
      
      set({
        currentNarrative: result.narrative,
        isProcessing: false,
      });
      
      await get().refreshState();
    } catch (err) {
      set({
        isProcessing: false,
        error: err instanceof Error ? err.message : 'Action failed',
      });
    }
  },

  startTalkingTo: (npc: NPC) => {
    const initialHistory: Array<{ role: 'player' | 'npc'; content: string }> = [];
    
    // Add first message if exists
    if (npc.first_message) {
      initialHistory.push({ role: 'npc', content: npc.first_message });
    }
    
    set({
      talkingToNpc: npc,
      dialogHistory: initialHistory,
    });
  },

  sendMessage: async (message: string) => {
    const { worldId, playerId, talkingToNpc, dialogHistory } = get();
    if (!worldId || !playerId || !talkingToNpc) return;
    
    // Add player message immediately
    const newHistory = [...dialogHistory, { role: 'player' as const, content: message }];
    set({ dialogHistory: newHistory, isProcessing: true });
    
    try {
      const result = await api.talkToNpc(worldId, playerId, talkingToNpc.id, message);
      
      // Add NPC response
      set({
        dialogHistory: [...newHistory, { role: 'npc' as const, content: result.response }],
        isProcessing: false,
        // Update NPC emotion
        npcs: get().npcs.map(n => 
          n.id === talkingToNpc.id 
            ? { ...n, emotion: result.emotion, relationship: result.relationship }
            : n
        ),
      });
    } catch (err) {
      set({
        isProcessing: false,
        error: err instanceof Error ? err.message : 'Failed to talk to NPC',
      });
    }
  },

  endConversation: () => {
    set({
      talkingToNpc: null,
      dialogHistory: [],
    });
  },

  refreshState: async () => {
    const { worldId, playerId } = get();
    if (!worldId || !playerId) return;
    
    try {
      const state = await api.getWorldState(worldId, playerId);
      const eventsRes = await api.getEvents(worldId);
      
      set({
        world: state.world,
        location: state.location,
        npcs: state.npcs,
        player: state.player,
        economy: state.economy,
        choices: state.choices,
        events: eventsRes.events,
      });
    } catch (err) {
      console.error('Failed to refresh state:', err);
    }
  },

  saveCheckpoint: async (description?: string) => {
    const { worldId, playerId } = get();
    if (!worldId || !playerId) return;
    
    try {
      await api.saveCheckpoint(worldId, playerId, description);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to save' });
    }
  },

  listCheckpoints: async () => {
    const { worldId, playerId } = get();
    if (!worldId || !playerId) return [];
    
    try {
      const result = await api.listCheckpoints(worldId, playerId);
      return result.checkpoints || [];
    } catch (err) {
      console.error('Failed to list checkpoints:', err);
      return [];
    }
  },

  loadCheckpoint: async (checkpointId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await api.loadCheckpoint(checkpointId);
      
      if (result.success) {
        // 重新初始化游戏状态
        const { worldId, playerId } = get();
        if (worldId && playerId) {
          await get().initGame(worldId, playerId);
        }
      }
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load checkpoint',
      });
    }
  },

  startNewGame: () => {
    // 重置状态，触发新游戏流程
    set({
      gamePhase: 'new_game',
      isLoading: false,
      error: null,
      world: null,
      location: null,
      npcs: [],
      player: null,
      choices: null,
      events: [],
      currentNarrative: '',
      talkingToNpc: null,
      dialogHistory: [],
    });
  },
}));
