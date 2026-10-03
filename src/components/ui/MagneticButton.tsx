'use client';

import React, { useState, MouseEvent } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useMagnetic } from '@/hooks/useMagnetic';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface MagneticButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  glow?: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  glow = true,
  onClick,
  ...props
}) => {
  const { ref, x, y, isAttracted } = useMagnetic<HTMLButtonElement>({ radius: 80, strength: 0.3 });
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const rippleX = e.clientX - rect.left;
    const rippleY = e.clientY - rect.top;
    const newRipple: Ripple = { id: Date.now(), x: rippleX, y: rippleY };

    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    if (onClick) onClick(e);
  };

  const baseStyles =
    'relative inline-flex items-center justify-center font-display tracking-wider uppercase font-semibold overflow-hidden rounded-xl transition-colors cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400';

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg tracking-widest',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white border border-cyan-400/40 hover:border-cyan-300 hover:shadow-[0_0_25px_rgba(34,211,238,0.5)]',
    secondary:
      'glass-panel text-white/90 border border-violet-500/40 hover:border-cyan-400/60 hover:text-cyan-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]',
    amber:
      'bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold border border-amber-300/60 hover:shadow-[0_0_25px_rgba(245,158,11,0.6)]',
  };

  return (
    <motion.button
      ref={ref}
      onClick={handleClick}
      data-interactive="true"
      animate={{
        x,
        y,
        scale: isAttracted ? 1.04 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 240,
        damping: 14,
        mass: 0.2,
      }}
      whileTap={{ scale: 0.94 }}
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      {...props}
    >
      {/* Dynamic Ripple Bursts */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="pointer-events-none absolute rounded-full bg-cyan-300/40 animate-ping"
          style={{
            top: ripple.y - 15,
            left: ripple.x - 15,
            width: 30,
            height: 30,
          }}
        />
      ))}

      {/* Button Ambient Shimmer */}
      <span className="relative z-10 flex items-center gap-2 chromatic-hover">
        {children}
      </span>

      {/* Subtle Bottom Glow Line */}
      {glow && (
        <span className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70" />
      )}
    </motion.button>
  );
};
