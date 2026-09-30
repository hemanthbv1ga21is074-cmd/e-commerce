import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Plus, Truck } from 'lucide-react';
import { SEO } from '../components/ui/SEO';
import { CheckoutHeader } from '../components/checkout/CheckoutHeader';
import { AddressCard } from '../components/checkout/AddressCard';
import { AddressFormModal } from '../components/checkout/AddressFormModal';
import { PriceSummaryCard } from '../components/checkout/PriceSummaryCard';
import { Button } from '../components/ui/Button';

import { useCartStore } from '../store/useCartStore';
import { useAddressStore } from '../store/useAddressStore';
import type { Address } from '../types';

export const CheckoutAddressPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, appliedCoupon, removeCoupon } = useCartStore();
  const {
    addresses,
    selectedAddressId,
    selectAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    getSelectedAddress,
  } = useAddressStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // If bag is empty, redirect back to /bag
  if (items.length === 0) {
    return <Navigate to="/bag" replace />;
  }

  const selectedAddress = getSelectedAddress();

  const handleEdit = (addr: Address) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleSaveAddress = (addressData: Omit<Address, 'id'>) => {
    if (editingAddress) {
      updateAddress(editingAddress.id, addressData);
    } else {
      addAddress(addressData);
    }
  };

  const handleContinueToPayment = () => {
    if (!selectedAddress) {
      alert('Please select or add a delivery address to proceed.');
      return;
    }
    navigate('/checkout/payment');
  };

  return (
    <div className="min-h-screen bg-surface/30">
      <SEO title="Select Delivery Address — StyleBazaar Checkout" />
      <CheckoutHeader currentStep="address" />

      <div className="container-app py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Address Selection */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base sm:text-lg font-bold uppercase tracking-wider text-primary">
                  Select Delivery Address
                </h1>
                <p className="text-xs text-muted">
                  Choose where you want your order delivered
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

            {/* Saved Addresses List */}
            <div className="space-y-3">
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

            {/* Delivery Estimate Box for Selected Address */}
            {selectedAddress && (
              <div className="p-4 bg-white border border-border rounded-xl flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Truck size={20} />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-primary block">
                    Estimated Delivery to {selectedAddress.city} - {selectedAddress.pincode}
                  </span>
                  <span className="text-muted">
                    Usually delivered within 3-4 business days. Free standard shipping applied.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Pricing Summary */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
            <PriceSummaryCard
              items={items}
              coupon={appliedCoupon}
              onRemoveCoupon={removeCoupon}
              ctaText="Continue to Payment"
              onCtaClick={handleContinueToPayment}
            />
          </div>
        </div>

        {/* Add/Edit Address Modal */}
        <AddressFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAddress(null);
          }}
          initialAddress={editingAddress}
          onSave={handleSaveAddress}
        />
      </div>
    </div>
  );
};
