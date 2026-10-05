import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Copy,
  Check,
  Download,
  AlertTriangle,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { validateAdminInvite, setupAdmin2Fa, acceptAdminInvite } from '../../services/api/admin';
import { useToastStore } from '../../store/useToastStore';

export const AcceptInviteView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteDetails, setInviteDetails] = useState<{
    email: string;
    role: string;
    invitedBy: string;
    expiresAt: string;
  } | null>(null);

  // 2FA setup state
  const [totpSecret, setTotpSecret] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success & Backup codes state
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Missing invitation token in URL.');
      setLoading(false);
      return;
    }

    const initInvite = async () => {
      try {
        const details = await validateAdminInvite(token);
        setInviteDetails(details);
        const setup = await setupAdmin2Fa(token);
        setTotpSecret(setup.secret);
      } catch (err: any) {
        setError(err.message || 'Invitation is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    initInvite();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    if (!totpCode || totpCode.length !== 6) {
      showToast('Please enter the 6-digit code from your authenticator app', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await acceptAdminInvite({
        token,
        name,
        password,
        totpSecret,
        totpCode,
      });

      setBackupCodes(res.backupCodes || []);
      showToast('Account activated with 2FA protection!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to activate administrative account', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedCodes(true);
    showToast('Backup codes copied to clipboard', 'success');
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleDownloadCodes = () => {
    const content = `StyleBazaar Admin Console - Single-Use 2FA Backup Codes\nAccount: ${inviteDetails?.email}\nGenerated: ${new Date().toISOString()}\n\nKeep these codes in a secure password manager. Each code can only be used once.\n\n` +
      backupCodes.map((c, i) => `${i + 1}. ${c}`).join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stylebazaar-backup-codes-${inviteDetails?.email || 'admin'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded backup codes file', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-300">Validating invitation credentials...</span>
        </div>
      </div>
    );
  }

  if (error || !inviteDetails) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-bold text-white">Invitation Link Expired or Invalid</h2>
          <p className="text-xs text-slate-400">
            {error || 'This invitation is single-use and valid for 48 hours. Please request a new invite link from your administrator.'}
          </p>
          <div className="pt-2">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              <span>Return to Admin Console</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Success state - Show Backup Codes
  if (backupCodes.length > 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">2FA Enrolled & Account Active</h2>
              <p className="text-xs text-slate-400">Save your single-use backup recovery codes</p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-300 flex items-start gap-3">
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-1">Important: Save these backup codes now</strong>
              These 10 single-use codes will <strong>never be shown again</strong>. If you lose access to your authenticator app, these codes are required to log into your account.
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <div className="grid grid-cols-2 gap-2 text-center font-mono font-bold text-xs text-slate-200">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800/80 py-2 rounded-lg">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleCopyCodes}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors border border-slate-700"
            >
              {copiedCodes ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedCodes ? 'Copied Codes' : 'Copy All Codes'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadCodes}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors border border-slate-700"
            >
              <Download size={14} />
              <span>Download (.txt)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors shadow-lg shadow-rose-600/20"
          >
            <span>Proceed to Admin Dashboard</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // Step 1 & 2: Setup form
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider mb-2">
            Staff Onboarding
          </div>
          <h1 className="text-xl font-black text-white">Accept Staff Invitation</h1>
          <p className="text-xs text-slate-400 mt-1">
            Invited by <strong className="text-slate-200">{inviteDetails.invitedBy}</strong> as{' '}
            <span className="font-bold text-emerald-400 uppercase">{inviteDetails.role}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Email (Readonly) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Account Email</label>
            <input
              type="text"
              readOnly
              value={inviteDetails.email}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-400 font-mono text-xs cursor-not-allowed"
            />
          </div>

          {/* Name & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Create Password</label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Confirm Password</label>
            <input
              type="password"
              required
              minLength={8}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500 text-xs"
            />
          </div>

          {/* Mandatory 2FA Setup */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <QrCode size={15} className="text-rose-400" />
              <span>Mandatory 2FA Enrollment</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Scan this key into your mobile authenticator app (Google Authenticator, Authy, Microsoft Authenticator, or 1Password):
            </p>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="font-mono text-xs text-rose-300 break-all select-all font-semibold">
                {totpSecret}
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(totpSecret);
                  setCopiedSecret(true);
                  setTimeout(() => setCopiedSecret(false), 2000);
                }}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex-shrink-0"
                title="Copy 2FA Secret"
              >
                {copiedSecret ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Enter 6-Digit Authenticator Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                pattern="[0-9]{6}"
                placeholder="123456"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-center tracking-[0.3em] text-base font-bold focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors shadow-lg shadow-rose-600/20"
          >
            <ShieldCheck size={16} />
            <span>{isSubmitting ? 'Enrolling & Activating...' : 'Activate Account & Get Backup Codes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
