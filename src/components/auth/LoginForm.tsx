import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, UserCheck, Mail, Phone, Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useConfig } from '../../context/ConfigContext';
import { forgotPassword as apiForgotPassword } from '../../services/api/auth';

interface LoginFormProps {
  onSendOtp: (phone: string) => void;
  onEmailLogin?: (email: string, password: string) => void;
  onDemoLogin: () => void;
  loading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSendOtp,
  onEmailLogin,
  onDemoLogin,
  loading = false,
}) => {
  const { config } = useConfig();
  const [tab, setTab] = useState<'phone' | 'email'>(
    config.authPhoneOtpEnabled ? 'phone' : 'email'
  );

  // Phone state
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Forgot password modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }
    setPhoneError(null);
    onSendOtp(phone);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setEmailError('Password must be at least 6 characters');
      return;
    }
    setEmailError(null);
    if (onEmailLogin) {
      onEmailLogin(email, password);
    } else {
      onDemoLogin();
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      try {
        await apiForgotPassword(forgotEmail);
      } catch { /* ignore – show success either way for security */ }
      setForgotSuccess(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs — Phone OTP tab shown only when flag is enabled */}
      <div className="flex border-b border-gray-200">
        {config.authPhoneOtpEnabled && (
          <button
            type="button"
            onClick={() => setTab('phone')}
            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              tab === 'phone'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-500 hover:text-primary'
            }`}
          >
            <Phone size={14} />
            <span>Mobile + OTP</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setTab('email')}
          className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            tab === 'email'
              ? 'border-accent text-accent'
              : 'border-transparent text-gray-500 hover:text-primary'
          }`}
        >
          <Mail size={14} />
          <span>Email + Password</span>
        </button>
      </div>

      {tab === 'phone' ? (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wider">
              Mobile Number
            </label>
            <div className="flex border border-border rounded-lg overflow-hidden focus-within:border-accent transition-colors">
              <span className="px-3 py-2.5 bg-surface text-gray-700 text-xs font-bold border-r border-border flex items-center">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="Enter 10 digit mobile number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ''));
                  if (phoneError) setPhoneError(null);
                }}
                className="flex-1 px-3 py-2.5 text-xs text-primary font-mono outline-none tracking-wider"
                autoFocus
              />
            </div>
            {phoneError && <p className="text-xs text-rose-600 mt-1">{phoneError}</p>}
          </div>

          <p className="text-[11px] text-muted leading-relaxed">
            By continuing, you agree to StyleBazaar's{' '}
            <span className="text-accent font-semibold cursor-pointer hover:underline">Terms of Use</span> &{' '}
            <span className="text-accent font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
          </p>

          <Button
            variant="accent"
            size="lg"
            type="submit"
            loading={loading}
            disabled={phone.length !== 10}
            className="w-full font-bold text-xs uppercase tracking-wider h-12 shadow-lg"
            icon={<ArrowRight size={16} />}
          >
            Send OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="flex items-center border border-border rounded-lg px-3 py-2.5 focus-within:border-accent transition-colors">
              <Mail size={16} className="text-muted mr-2.5 flex-shrink-0" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                className="flex-1 text-xs text-primary outline-none"
                autoFocus
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotSuccess(false);
                  setForgotModalOpen(true);
                }}
                className="text-[11px] font-bold text-accent hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="flex items-center border border-border rounded-lg px-3 py-2.5 focus-within:border-accent transition-colors">
              <Lock size={16} className="text-muted mr-2.5 flex-shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password (min 6 characters)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                className="flex-1 text-xs text-primary outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {emailError && <p className="text-xs text-rose-600 mt-1">{emailError}</p>}
          </div>

          <Button
            variant="accent"
            size="lg"
            type="submit"
            loading={loading}
            disabled={!email || !password}
            className="w-full font-bold text-xs uppercase tracking-wider h-12 shadow-lg"
            icon={<ArrowRight size={16} />}
          >
            Sign In with Email
          </Button>
        </form>
      )}

      <div className="relative flex items-center justify-center">
        <span className="w-full border-t border-gray-200" />
        <span className="absolute bg-white px-3 text-[11px] text-muted uppercase font-bold tracking-wider">
          Or Quick Test
        </span>
      </div>

      {/* Demo User Fast Login */}
      <Button
        variant="outline"
        size="lg"
        onClick={onDemoLogin}
        className="w-full font-bold text-xs uppercase tracking-wider h-12 border-gray-300 hover:border-accent hover:text-accent hover:bg-rose-50/50"
        icon={<UserCheck size={16} />}
      >
        Login as Demo User (Rahul)
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted pt-2">
        <ShieldCheck size={14} className="text-emerald-600" />
        <span>100% safe & instant login without password</span>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Password"
      >
        <div className="space-y-4 py-2">
          {forgotSuccess ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={26} />
              </div>
              <h4 className="font-bold text-sm text-primary">Password Reset Link Sent!</h4>
              <p className="text-xs text-muted">
                We've sent a password reset instruction link to{' '}
                <span className="font-bold text-primary">{forgotEmail}</span>.
              </p>
              <Button
                variant="primary"
                onClick={() => setForgotModalOpen(false)}
                className="mt-3 w-full"
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-xs text-muted leading-relaxed">
                Enter your registered email address and we'll send you a link to reset your password.
              </p>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full border border-border rounded-lg px-3 py-2 text-xs text-primary outline-none focus:border-accent"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" type="button" onClick={() => setForgotModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="accent" type="submit" disabled={!forgotEmail}>
                  Send Reset Link
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};
