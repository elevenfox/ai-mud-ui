'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface BackgroundLayerProps {
  backgroundUrl?: string;
}

export function BackgroundLayer({ backgroundUrl }: BackgroundLayerProps) {
  // Default cyberpunk background gradient if no image
  const defaultBg = 'linear-gradient(180deg, #0a0a0f 0%, #12121a 30%, #1a1a24 70%, #12121a 100%)';

  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={backgroundUrl || 'default'}
          className="absolute inset-0 game-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={
            backgroundUrl 
              ? {
                  backgroundImage: `url('${backgroundUrl}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }
              : { background: defaultBg }
          }
        />
      </AnimatePresence>
      
      {/* Vignette overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(10, 10, 15, 0.9) 100%)',
        }}
      />
      
      {/* Bottom gradient for text readability */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-2/3"
        style={{
          background: 'linear-gradient(to top, rgba(10, 10, 15, 0.95) 0%, rgba(10, 10, 15, 0.8) 30%, transparent 100%)',
        }}
      />
    </div>
  );
}
