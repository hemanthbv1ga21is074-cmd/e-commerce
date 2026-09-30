import React, { useState } from 'react';
import { SEO } from '../components/ui/SEO';
import { AccountSidebar } from '../components/account/AccountSidebar';
import { ProfileCompleteness } from '../components/account/ProfileCompleteness';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone] = useState(user?.phone || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(user?.gender || 'Male');
  const [birthday, setBirthday] = useState(user?.birthday || '');
  const [alternatePhone, setAlternatePhone] = useState(user?.alternatePhone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: name.trim(),
      email: email.trim(),
      gender,
      birthday: birthday || undefined,
      alternatePhone: alternatePhone.trim() || undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-surface/30 min-h-screen py-8">
      <SEO title="Profile Information — StyleBazaar" />

      <div className="container-app">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AccountSidebar />

          <div className="flex-1 w-full space-y-6">
            <div className="bg-white border border-border rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h1 className="text-xl font-bold uppercase tracking-tight text-primary">
                    Profile Details
                  </h1>
                  <p className="text-xs text-muted">
                    Manage your personal information and contact details
                  </p>
                </div>
              </div>

              {savedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Profile details saved successfully!</span>
                </div>
              )}

              {/* Completeness Bar */}
              <ProfileCompleteness user={user} />

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-border rounded-md focus:border-accent outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Mobile Number</label>
                    <input
                      type="text"
                      disabled
                      value={`+91 ${phone}`}
                      className="w-full px-3 py-2.5 border border-border rounded-md bg-gray-50 text-gray-500 font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Email ID *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 border border-border rounded-md focus:border-accent outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full px-3 py-2.5 border border-border rounded-md focus:border-accent outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">Gender</label>
                    <div className="flex items-center gap-4 pt-1">
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

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Alternate Mobile Number</label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="Optional 10-digit number"
                      value={alternatePhone}
                      onChange={(e) => setAlternatePhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2.5 border border-border rounded-md focus:border-accent outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <Button variant="accent" size="md" type="submit" className="min-w-[140px]">
                    Save Details
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
