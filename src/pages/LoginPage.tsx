import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { SEO } from '../components/ui/SEO';
import { LoginForm } from '../components/auth/LoginForm';
import { OtpVerification } from '../components/auth/OtpVerification';
import { ProfileSetupModal } from '../components/auth/ProfileSetupModal';
import { useAuthStore, DEMO_USER } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { brandConfig } from '../data/brand-config';
import { login as apiLogin, register as apiRegister } from '../services/api/auth';
import { apiMergeCart } from '../services/api/cart';
import { apiMergeWishlist } from '../services/api/wishlist';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { login, loginAsDemoUser } = useAuthStore();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  /* ─── Phone OTP flow (mock-only; only shown when authPhoneOtpEnabled=true) ─── */
  const handleSendOtp = (enteredPhone: string) => {
    setLoading(true);
    setAuthError(null);
    setPhone(enteredPhone);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 600);
  };

  const handleVerifyOtp = (_enteredOtp: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (phone === '9876543210') {
        loginAsDemoUser();
        navigate(redirectUrl, { replace: true });
      } else {
        setShowProfileModal(true);
      }
    }, 800);
  };

  const handleCompleteNewProfile = async (profileData: {
    name: string;
    email: string;
    gender: 'Male' | 'Female' | 'Other';
  }) => {
    setLoading(true);
    try {
      const result = await apiRegister({
        email: profileData.email,
        password: `otp_${phone}_${Date.now()}`, // temp password for OTP-registered users
        name: profileData.name,
        phone,
      });
      login({
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone || phone,
        gender: profileData.gender,
        addresses: [],
        walletBalance: 500,
        loyaltyPoints: 500,
        loyaltyTier: 'Silver',
        createdAt: new Date().toISOString(),
      });
    } catch {
      // Fallback to local creation if backend unavailable
      login({
        id: `usr-${Date.now()}`,
        name: profileData.name,
        email: profileData.email,
        phone,
        gender: profileData.gender,
        addresses: [],
        walletBalance: 500,
        loyaltyPoints: 500,
        loyaltyTier: 'Silver',
        createdAt: new Date().toISOString(),
      });
    }
    setLoading(false);
    setShowProfileModal(false);
    navigate(redirectUrl, { replace: true });
  };

  /* ─── Demo login ─── */
  const handleDemoLogin = () => {
    loginAsDemoUser();
    navigate(redirectUrl, { replace: true });
  };

  /* ─── Real email + password login ─── */
  const handleEmailLogin = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await apiLogin({ email, password });
      // Map API user to the full frontend User shape (wallet/points come from 5C ledgers)
      login({
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone || '',
        gender: (result.user.gender as 'Male' | 'Female' | 'Other') || undefined,
        birthday: result.user.birthday,
        addresses: [],
        walletBalance: DEMO_USER.walletBalance,     // placeholder until 5C ledger API
        loyaltyPoints: DEMO_USER.loyaltyPoints,     // placeholder until 5C ledger API
        loyaltyTier: DEMO_USER.loyaltyTier,
        createdAt: new Date().toISOString(),
      });

      // Seamlessly merge guest cart items to the server
      const localCartItems = useCartStore.getState().items;
      if (localCartItems.length > 0) {
        try {
          await apiMergeCart(
            localCartItems.map((i) => ({
              productId: i.productId,
              size: i.size,
              color: i.color,
              quantity: i.quantity,
            }))
          );
        } catch { /* ignore merge failure */ }
      }

      // Seamlessly merge guest wishlist items to the server
      const localWishlist = useWishlistStore.getState().items;
      if (localWishlist.length > 0) {
        try {
          await apiMergeWishlist(localWishlist);
        } catch { /* ignore merge failure */ }
      }

      navigate(redirectUrl, { replace: true });
    } catch (err: unknown) {
      setAuthError(
        err instanceof Error ? err.message : 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 bg-surface/30">
      <SEO title="Login or Signup — StyleBazaar" />

      <div className="w-full max-w-md bg-white border border-border rounded-2xl shadow-xl overflow-hidden animate-fade-in">
        {/* Header Visual Banner */}
        <div className="bg-gradient-to-r from-primary via-gray-900 to-primary text-white p-6 sm:p-8 text-center space-y-2 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-accent/30 rounded-full blur-2xl" />

          <Link to="/" className="inline-block">
            <span className="font-display text-2xl font-black tracking-tight">
              {brandConfig.name.slice(0, 5)}
              <span className="text-accent">{brandConfig.name.slice(5)}</span>
            </span>
          </Link>

          <p className="text-xs text-gray-300">
            {step === 'phone'
              ? 'Login or Signup to access orders, wishlist, and exclusive discounts'
              : 'Verify your phone number with the OTP'}
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8">
          {/* Auth error banner */}
          {authError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {authError}
            </div>
          )}

          {step === 'phone' ? (
            <LoginForm
              onSendOtp={handleSendOtp}
              onEmailLogin={handleEmailLogin}
              onDemoLogin={handleDemoLogin}
              loading={loading}
            />
          ) : (
            <OtpVerification
              phone={phone}
              onVerify={handleVerifyOtp}
              onEditPhone={() => setStep('phone')}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* New User Profile Completion Modal */}
      <ProfileSetupModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        phone={phone}
        onComplete={handleCompleteNewProfile}
      />
    </div>
  );
};
