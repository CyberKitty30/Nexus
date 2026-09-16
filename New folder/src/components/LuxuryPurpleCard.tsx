import React from 'react';
import { motion } from 'framer-motion';

interface LuxuryPurpleCardProps {
  title: string;
  severity?: string;
  children: React.ReactNode;
  className?: string;
}

export const LuxuryPurpleCard: React.FC<LuxuryPurpleCardProps> = ({
  title,
  severity = 'STATUTORY',
  children,
  className = '',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.01, y: -2, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
    whileTap={{ scale: 0.99 }}
    className={`relative overflow-hidden rounded-2xl p-5 bg-purple-950/30 backdrop-blur-xl border border-purple-800/40 hover:border-purple-500/60 hover:shadow-glow-purple transition-all duration-300 ${className}`}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500" />
        </span>
        <h3 className="text-sm font-bold tracking-wide text-purple-100">{title}</h3>
      </div>
      {severity && (
        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-purple-900/50 text-purple-200 border border-purple-700/50">
          {severity}
        </span>
      )}
    </div>
    <div className="relative z-10 text-xs text-purple-200/90">{children}</div>
  </motion.div>
);
