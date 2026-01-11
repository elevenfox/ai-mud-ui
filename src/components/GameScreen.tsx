'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
 * - 右上角眼睛图标：隐藏/显示 UI
 */
export function GameScreen() {
  const { location, talkingToNpc } = useGameStore();
  const [hideUI, setHideUI] = useState(false);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-black">
      {/* 1. 背景层 - 全屏场景图片 */}
      <BackgroundLayer backgroundUrl={location?.background_url} />
      
      {/* 2. 角色立绘层 - 三栏布局 */}
      <CharacterDisplay />
      
      {/* 3. 扫描线效果 */}
      <div className="absolute inset-0 scanlines pointer-events-none z-40" />
      
      {/* 4. UI 层 */}
      <AnimatePresence>
        {!hideUI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col z-30 pointer-events-none"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. 隐藏/显示 UI 按钮 - 始终显示 */}
      <button
        onClick={() => setHideUI(!hideUI)}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 transition-all group"
        title={hideUI ? '显示界面' : '隐藏界面（查看完整画面）'}
      >
        {hideUI ? (
          // 眼睛关闭图标 - 点击显示 UI
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70 group-hover:text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
          </svg>
        ) : (
          // 眼睛打开图标 - 点击隐藏 UI
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70 group-hover:text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  );
}
