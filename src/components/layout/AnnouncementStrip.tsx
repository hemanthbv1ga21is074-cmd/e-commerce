import React from 'react';
import { brandConfig } from '../../data/brand-config';
import { Sparkles } from 'lucide-react';

export const AnnouncementStrip: React.FC = () => {
  return (
    <div className="bg-primary text-primary-contrast text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 overflow-hidden h-[var(--announcement-height)]">
      <Sparkles size={13} className="text-accent animate-pulse hidden sm:inline" />
      <span className="truncate">{brandConfig.announcement}</span>
      <Sparkles size={13} className="text-accent animate-pulse hidden sm:inline" />
    </div>
  );
};
