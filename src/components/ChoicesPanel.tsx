'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import clsx from 'clsx';

export function ChoicesPanel() {
  const { choices, selectChoice, submitCustomAction, isProcessing } = useGameStore();
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

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
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="你想做什么？"
            disabled={isProcessing}
            className={clsx(
              'flex-1 px-4 py-3 rounded-lg border bg-cyber-dark/80 backdrop-blur-sm',
              'text-gray-200 placeholder-gray-500',
              'focus:outline-none focus:border-cyber-pink transition-colors',
              isProcessing 
                ? 'border-gray-600 cursor-not-allowed' 
                : 'border-cyber-pink/40'
            )}
            autoFocus
          />
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
    </div>
  );
}
