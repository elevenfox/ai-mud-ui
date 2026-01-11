'use client';

import { useGameStore } from '@/store/gameStore';
import { BackgroundLayer } from './BackgroundLayer';
import { NPCPanel } from './NPCPanel';
import { NarrativePanel } from './NarrativePanel';
import { ChoicesPanel } from './ChoicesPanel';
import { DialogPanel } from './DialogPanel';
import { TopBar } from './TopBar';

export function GameScreen() {
  const { location, npcs, talkingToNpc } = useGameStore();

  return (
    <div className="h-screen w-screen flex flex-col relative overflow-hidden">
      {/* Background Layer */}
      <BackgroundLayer backgroundUrl={location?.background_url} />
      
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none z-50" />
      
      {/* Top Bar */}
      <TopBar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Upper section: NPC Cards */}
        <div className="flex-shrink-0 p-4">
          <NPCPanel npcs={npcs} />
        </div>
        
        {/* Lower section: Narrative + Choices */}
        <div className="flex-1 flex flex-col justify-end">
          {talkingToNpc ? (
            <DialogPanel />
          ) : (
            <>
              <NarrativePanel />
              <ChoicesPanel />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
