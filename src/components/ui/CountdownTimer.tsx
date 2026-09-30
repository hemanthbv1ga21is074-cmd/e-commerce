import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface CountdownTimerProps {
  targetDate?: Date | string | number;
  label?: string;
  className?: string;
  variant?: 'simple' | 'boxed' | 'pill';
  onExpire?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  label = 'Ends in',
  className,
  variant = 'boxed',
  onExpire,
}) => {
  // If no target date provided, default to midnight tonight
  const getInitialTarget = () => {
    if (targetDate) {
      return new Date(targetDate).getTime();
    }
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);
    return midnight.getTime();
  };

  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = Math.max(0, getInitialTarget() - Date.now());
    return {
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      total: diff,
    };
  });

  useEffect(() => {
    const target = getInitialTarget();

    const interval = setInterval(() => {
      const diff = Math.max(0, target - Date.now());
      if (diff <= 0) {
        clearInterval(interval);
        onExpire?.();
      }

      setTimeLeft({
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        total: diff,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  const pad = (n: number) => String(n).padStart(2, '0');

  if (variant === 'pill') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-accent text-xs font-semibold border border-rose-200',
          className
        )}
      >
        <Clock size={13} className="text-accent animate-pulse" />
        {label && <span className="text-muted font-normal">{label}</span>}
        <span>
          {pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m : {pad(timeLeft.seconds)}s
        </span>
      </div>
    );
  }

  if (variant === 'boxed') {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        {label && <span className="text-xs font-medium text-muted uppercase tracking-wider">{label}</span>}
        <div className="flex items-center gap-1 font-mono text-sm font-bold">
          <div className="bg-primary text-primary-contrast px-2 py-1 rounded shadow-sm">
            {pad(timeLeft.hours)}
            <span className="block text-[9px] font-sans font-normal text-gray-300 text-center uppercase">h</span>
          </div>
          <span className="text-primary font-bold">:</span>
          <div className="bg-primary text-primary-contrast px-2 py-1 rounded shadow-sm">
            {pad(timeLeft.minutes)}
            <span className="block text-[9px] font-sans font-normal text-gray-300 text-center uppercase">m</span>
          </div>
          <span className="text-primary font-bold">:</span>
          <div className="bg-accent text-white px-2 py-1 rounded shadow-sm">
            {pad(timeLeft.seconds)}
            <span className="block text-[9px] font-sans font-normal text-rose-100 text-center uppercase">s</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-1 text-sm font-medium', className)}>
      <Clock size={14} className="text-muted" />
      {label && <span className="text-muted">{label}:</span>}
      <span className="font-mono font-bold text-accent">
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </span>
    </div>
  );
};
