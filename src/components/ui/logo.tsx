import React from 'react';
import { motion } from 'framer-motion';

export const Logo = ({ className = "w-8 h-8", animated = false }: { className?: string; animated?: boolean }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <motion.path
          d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z"
          className="stroke-primary"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animated ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
          animate={animated ? { pathLength: 1, opacity: 1 } : { pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <motion.path
          d="M50 25 L50 75"
          className="stroke-primary"
          strokeWidth="8"
          strokeLinecap="round"
          initial={animated ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
          animate={animated ? { pathLength: 1, opacity: 1 } : { pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        />
        <motion.path
          d="M30 45 L50 35 L70 45"
          className="stroke-primary"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animated ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
          animate={animated ? { pathLength: 1, opacity: 1 } : { pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
};
