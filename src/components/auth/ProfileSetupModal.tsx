import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Sparkles } from 'lucide-react';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  onComplete: (data: { name: string; email: string; gender: 'Male' | 'Female' | 'Other' }) => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  isOpen,
  onClose,
  phone,
  onComplete,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    onComplete({ name: name.trim(), email: email.trim(), gender });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Your Profile" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-lg flex items-center gap-2 text-primary">
          <Sparkles size={16} className="text-accent flex-shrink-0" />
          <span>Complete your profile to unlock member perks and 500 bonus loyalty points!</span>
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <div>
          <label className="font-bold text-gray-700 block mb-1">Mobile Number</label>
          <input
            type="text"
            disabled
            value={phone ? `+91 ${phone}` : '+91'}
            className="w-full px-3 py-2 border border-border rounded-md bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-gray-700 block mb-1">Full Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:border-accent outline-none"
            autoFocus
          />
        </div>

        <div>
          <label className="font-bold text-gray-700 block mb-1">Email Address *</label>
          <input
            type="email"
            required
            placeholder="e.g. rahul@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:border-accent outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-gray-700 block mb-1.5">Gender</label>
          <div className="flex items-center gap-4">
            {(['Male', 'Female', 'Other'] as const).map((g) => (
              <label key={g} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={() => setGender(g)}
                  className="accent-accent"
                />
                <span>{g}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="accent"
            size="md"
            type="submit"
            className="w-full font-bold uppercase tracking-wider text-xs h-11"
          >
            Save & Continue
          </Button>
        </div>
      </form>
    </Modal>
  );
};
