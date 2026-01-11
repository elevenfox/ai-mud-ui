'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import clsx from 'clsx';

// RP 格式说明
const RP_FORMAT_GUIDE = [
  { format: '*动作*', desc: '动作或场景描写', example: '*缓缓走近，眼神警惕*' },
  { format: '"对话"', desc: '角色说的话', example: '"你是谁？为什么在这里？"' },
  { format: '（想法）', desc: '玩家意图/OOC指令', example: '（我想去酒吧找线索）' },
  { format: '~语气~', desc: '拖长音或特殊语气', example: '"等一下~"' },
  { format: '**强调**', desc: '重点强调', example: '**非常重要**的信息' },
];

// 格式帮助 Modal
function FormatHelpModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800 rounded-xl p-6 max-w-lg w-full border border-cyber-blue/30 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-cyber-blue">📝 输入格式说明</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>
        
        <p className="text-gray-400 text-sm mb-4">
          使用以下格式让 AI 更好地理解你的意图：
        </p>
        
        <div className="space-y-3">
          {RP_FORMAT_GUIDE.map((item, i) => (
            <div key={i} className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-1">
                <code className="text-cyber-pink bg-cyber-pink/10 px-2 py-0.5 rounded text-sm">
                  {item.format}
                </code>
                <span className="text-gray-300 text-sm">{item.desc}</span>
              </div>
              <p className="text-gray-500 text-xs pl-1">
                例：<span className="text-gray-400">{item.example}</span>
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-600">
          <p className="text-gray-500 text-xs">
            💡 <strong>提示：</strong>你也可以混合使用，比如：
            <br />
            <span className="text-gray-400">*走向酒保* "来杯最烈的。" *把钱拍在桌上*</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ChoicesPanel() {
  const { choices, selectChoice, submitCustomAction, isProcessing } = useGameStore();
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showFormatHelp, setShowFormatHelp] = useState(false);

  if (!choices) return null;

  const handleChoiceClick = async (choiceId: string) => {
    if (isProcessing) return;
    await selectChoice(choiceId);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim() || isProcessing) return;
    
    await submitCustomAction(customInput.trim());
    setCustomInput('');
    setShowCustomInput(false);
  };

  return (
    <div className="px-6 pb-6">
      {/* Choice buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {choices.choices.map((choice, index) => (
          <motion.button
            key={choice.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleChoiceClick(choice.id)}
            disabled={isProcessing}
            className={clsx(
              'choice-btn p-4 text-left rounded-lg border transition-all duration-300',
              'bg-cyber-dark/70 backdrop-blur-sm',
              isProcessing 
                ? 'border-gray-600 text-gray-500 cursor-not-allowed' 
                : 'border-cyber-blue/40 hover:border-cyber-blue hover:bg-cyber-blue/10 text-gray-200'
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-cyber-blue font-display text-lg">
                {index + 1}
              </span>
              <div>
                <p className="font-medium">{choice.text}</p>
                {choice.hint && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    {choice.hint}
                  </p>
                )}
              </div>
            </div>
          </motion.button>
        ))}
        
        {/* "Other" button */}
        {choices.allow_custom && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: choices.choices.length * 0.1 }}
            onClick={() => setShowCustomInput(!showCustomInput)}
            disabled={isProcessing}
            className={clsx(
              'choice-btn p-4 text-left rounded-lg border transition-all duration-300',
              'bg-cyber-dark/70 backdrop-blur-sm',
              showCustomInput
                ? 'border-cyber-pink bg-cyber-pink/10'
                : 'border-cyber-pink/40 hover:border-cyber-pink hover:bg-cyber-pink/10',
              isProcessing && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-cyber-pink font-display text-lg">?</span>
              <p className="text-gray-200 font-medium">做其他事情...</p>
            </div>
          </motion.button>
        )}
      </div>
      
      {/* Custom input field */}
      {showCustomInput && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleCustomSubmit}
          className="flex gap-3"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder='*动作* "对话" （想法）'
              disabled={isProcessing}
              className={clsx(
                'w-full px-4 py-3 pr-10 rounded-lg border bg-cyber-dark/80 backdrop-blur-sm',
                'text-gray-200 placeholder-gray-500',
                'focus:outline-none focus:border-cyber-pink transition-colors',
                isProcessing 
                  ? 'border-gray-600 cursor-not-allowed' 
                  : 'border-cyber-pink/40'
              )}
              autoFocus
            />
            {/* Help icon */}
            <button
              type="button"
              onClick={() => setShowFormatHelp(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyber-blue transition-colors"
              title="输入格式说明"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <button
            type="submit"
            disabled={!customInput.trim() || isProcessing}
            className={clsx(
              'px-6 py-3 rounded-lg font-display transition-all duration-300',
              customInput.trim() && !isProcessing
                ? 'bg-cyber-pink/20 border border-cyber-pink text-cyber-pink hover:bg-cyber-pink/30'
                : 'bg-gray-800 border border-gray-600 text-gray-500 cursor-not-allowed'
            )}
          >
            {isProcessing ? '...' : '执行'}
          </button>
        </motion.form>
      )}
      
      {/* Format Help Modal */}
      <AnimatePresence>
        {showFormatHelp && <FormatHelpModal onClose={() => setShowFormatHelp(false)} />}
      </AnimatePresence>
    </div>
  );
}
