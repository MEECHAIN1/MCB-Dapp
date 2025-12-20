
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../context/useAppState';

export const QuantumRitual: React.FC = () => {
  const { ritualSuccess } = useAppState();

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      <AnimatePresence>
        {ritualSuccess && (
          <>
            {/* Massive Central Pulse Glow */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ 
                scale: [1, 2, 0.8, 1.5], 
                opacity: [0.4, 0.1, 0.3, 0] 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px]"
            />

            {/* Shimmer Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-black mix-blend-screen"
            >
              <motion.div 
                animate={{ 
                  backgroundPosition: ["0% 0%", "100% 100%"] 
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-30 bg-[length:200%_200%] bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            </motion.div>

            {/* Ascending Particles (CSS-based for lightweight count) */}
            <div className="absolute inset-0">
               {[...Array(20)].map((_, i) => (
                 <motion.div
                   key={i}
                   initial={{ 
                     y: "110%", 
                     x: `${Math.random() * 100}%`,
                     opacity: 0,
                     scale: Math.random() * 0.5 + 0.5
                   }}
                   animate={{ 
                     y: "-10%", 
                     opacity: [0, 1, 0],
                     rotate: 360
                   }}
                   transition={{ 
                     duration: 2 + Math.random() * 3, 
                     repeat: Infinity,
                     delay: Math.random() * 1 
                   }}
                   className="absolute w-1 h-1 bg-yellow-400 rounded-full blur-[1px]"
                 />
               ))}
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
