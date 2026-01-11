'use client';

import { useGameStore } from '@/store/gameStore';
import { BackgroundLayer } from './BackgroundLayer';
import { CharacterDisplay } from './CharacterDisplay';
import { NarrativePanel } from './NarrativePanel';
import { ChoicesPanel } from './ChoicesPanel';
import { DialogPanel } from './DialogPanel';
import { TopBar } from './TopBar';

/**
 * GameScreen - 沉浸式游戏主界面
 * 
 * 布局结构：
 * - 全屏背景图片（场景）
 * - 角色立绘层（左/中/右三个位置，最多3个）
 * - 顶部信息栏
 * - 底部叙事/对话/选项面板
 */
export function GameScreen() {
  const { location, talkingToNpc } = useGameStore();

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-black">
      {/* 1. 背景层 - 全屏场景图片 */}
      <BackgroundLayer backgroundUrl={location?.background_url} />
      
      {/* 2. 角色立绘层 - 三栏布局 */}
      <CharacterDisplay />
      
      {/* 3. 扫描线效果 */}
      <div className="absolute inset-0 scanlines pointer-events-none z-40" />
      
      {/* 4. UI 层 */}
      <div className="absolute inset-0 flex flex-col z-30 pointer-events-none">
        {/* 顶部信息栏 */}
        <div className="pointer-events-auto">
          <TopBar />
        </div>
        
        {/* 中间留白 - 让角色立绘可见 */}
        <div className="flex-1" />
        
        {/* 底部面板 - 叙事/对话/选项 */}
        <div className="pointer-events-auto">
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
