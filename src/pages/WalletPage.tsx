import React from 'react';
import { SEO } from '../components/ui/SEO';
import { AccountSidebar } from '../components/account/AccountSidebar';
import { WalletCard } from '../components/account/WalletCard';

export const WalletPage: React.FC = () => {
  return (
    <div className="bg-surface/30 min-h-screen py-8">
      <SEO title="StyleBazaar Wallet & Credits" />

      <div className="container-app">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AccountSidebar />

          <div className="flex-1 w-full">
            <WalletCard />
          </div>
        </div>
      </div>
    </div>
  );
};
