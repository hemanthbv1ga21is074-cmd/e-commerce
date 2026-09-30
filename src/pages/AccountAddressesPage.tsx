import React, { useState } from 'react';
import { SEO } from '../components/ui/SEO';
import { AccountSidebar } from '../components/account/AccountSidebar';
import { AddressCard } from '../components/checkout/AddressCard';
import { AddressFormModal } from '../components/checkout/AddressFormModal';
import { useAddressStore } from '../store/useAddressStore';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';
import type { Address } from '../types';

export const AccountAddressesPage: React.FC = () => {
  const {
    addresses,
    selectedAddressId,
    selectAddress,
    addAddress,
    updateAddress,
    deleteAddress,
  } = useAddressStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleEdit = (addr: Address) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleSave = (addressData: Omit<Address, 'id'>) => {
    if (editingAddress) {
      updateAddress(editingAddress.id, addressData);
    } else {
      addAddress(addressData);
    }
  };

  return (
    <div className="bg-surface/30 min-h-screen py-8">
      <SEO title="Saved Addresses — StyleBazaar" />

      <div className="container-app">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AccountSidebar />

          <div className="flex-1 w-full space-y-6">
            <div className="bg-white border border-border rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h1 className="text-xl font-bold uppercase tracking-tight text-primary">
                    Saved Addresses ({addresses.length})
                  </h1>
                  <p className="text-xs text-muted">
                    Manage your delivery locations and default shipping address
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddNew}
                  icon={<Plus size={14} />}
                  className="font-bold text-xs uppercase tracking-wider text-accent border-accent hover:bg-rose-50"
                >
                  + Add New Address
                </Button>
              </div>

              {/* Addresses List */}
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    isSelected={selectedAddressId === addr.id}
                    onSelect={() => selectAddress(addr.id)}
                    onEdit={() => handleEdit(addr)}
                    onDelete={() => deleteAddress(addr.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <AddressFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAddress(null);
          }}
          initialAddress={editingAddress}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};
