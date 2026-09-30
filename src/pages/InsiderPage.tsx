import React from 'react';
import { SEO } from '../components/ui/SEO';
import { AccountSidebar } from '../components/account/AccountSidebar';
import { InsiderTierCard } from '../components/account/InsiderTierCard';
import { useAuthStore } from '../store/useAuthStore';

export const InsiderPage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="bg-surface/30 min-h-screen py-8">
      <SEO title="StyleBazaar Insider Loyalty Club" />

      <div className="container-app">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AccountSidebar />

          <div className="flex-1 w-full">
            <InsiderTierCard user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};
