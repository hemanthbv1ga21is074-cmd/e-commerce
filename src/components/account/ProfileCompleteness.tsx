import React from 'react';
import type { User } from '../../types';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface ProfileCompletenessProps {
  user: User | null;
  onEditField?: (field: string) => void;
}

export const ProfileCompleteness: React.FC<ProfileCompletenessProps> = ({ user, onEditField }) => {
  if (!user) return null;

  const checks = [
    { label: 'Full Name', done: Boolean(user.name) },
    { label: 'Mobile Number', done: Boolean(user.phone) },
    { label: 'Email Address', done: Boolean(user.email) },
    { label: 'Gender', done: Boolean(user.gender) },
    { label: 'Birthday', done: Boolean(user.birthday) },
    { label: 'Alternate Mobile', done: Boolean(user.alternatePhone) },
  ];

  const completedCount = checks.filter((c) => c.done).length;
  const percentage = Math.round((completedCount / checks.length) * 100);

  const missing = checks.find((c) => !c.done);

  return (
    <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 border border-rose-100 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-accent" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            Profile Completeness
          </h4>
        </div>
        <span className="text-xs font-black text-accent">{percentage}%</span>
      </div>

      <div className="w-full h-2 bg-white rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {percentage < 100 && missing ? (
        <div className="text-[11px] text-muted flex items-center justify-between">
          <span>
            💡 Add your <strong>{missing.label}</strong> to complete profile and get birthday gifts!
          </span>
          {onEditField && (
            <button
              type="button"
              onClick={() => onEditField(missing.label)}
              className="text-accent font-bold uppercase text-[10px] hover:underline"
            >
              Add Now
            </button>
          )}
        </div>
      ) : (
        <div className="text-[11px] text-emerald-800 flex items-center gap-1 font-semibold">
          <CheckCircle2 size={13} className="text-emerald-600" />
          <span>Profile 100% complete! VIP perks active.</span>
        </div>
      )}
    </div>
  );
};
