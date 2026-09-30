import React, { useState, useEffect } from 'react';
import type { Address } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { checkDelivery } from '../../services/api/pincodes';

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAddress?: Address | null;
  onSave: (address: Omit<Address, 'id'>) => void;
}

export const AddressFormModal: React.FC<AddressFormModalProps> = ({
  isOpen,
  onClose,
  initialAddress,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [locality, setLocality] = useState('');
  const [type, setType] = useState<'Home' | 'Work'>('Home');
  const [isDefault, setIsDefault] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialAddress) {
      setName(initialAddress.name);
      setPhone(initialAddress.phone);
      setPincode(initialAddress.pincode);
      setCity(initialAddress.city);
      setState(initialAddress.state);
      setAddressLine1(initialAddress.addressLine1);
      setAddressLine2(initialAddress.addressLine2 || '');
      setLocality(initialAddress.locality);
      setType(initialAddress.type);
      setIsDefault(initialAddress.isDefault);
    } else {
      setName('');
      setPhone('');
      setPincode('');
      setCity('');
      setState('');
      setAddressLine1('');
      setAddressLine2('');
      setLocality('');
      setType('Home');
      setIsDefault(false);
    }
    setFormError(null);
  }, [initialAddress, isOpen]);

  // Handle PIN code autofill
  const handlePincodeChange = async (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setPincode(cleaned);

    if (cleaned.length === 6) {
      setPinLoading(true);
      try {
        const info = await checkDelivery(cleaned);
        if (info && info.city) {
          setCity(info.city);
          setState(info.state);
        }
      } catch {
        // ignore
      } finally {
        setPinLoading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter full name');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      setFormError('Please enter a valid 6-digit PIN code');
      return;
    }
    if (!addressLine1.trim()) {
      setFormError('Please enter your house/street address');
      return;
    }

    onSave({
      name: name.trim(),
      phone: phone.trim(),
      pincode: pincode.trim(),
      city: city.trim() || 'Bangalore',
      state: state.trim() || 'Karnataka',
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || undefined,
      locality: locality.trim(),
      type,
      isDefault,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialAddress ? 'Edit Address' : 'Add New Delivery Address'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {formError && (
          <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 border border-border rounded-md focus:border-accent outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">10-Digit Mobile Number *</label>
            <input
              type="tel"
              required
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 9876543210"
              className="w-full px-3 py-2 border border-border rounded-md focus:border-accent outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="font-bold text-gray-700 block mb-1">
              PIN Code * {pinLoading && <span className="text-[10px] text-accent">(Checking...)</span>}
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={pincode}
              onChange={(e) => handlePincodeChange(e.target.value)}
              placeholder="e.g. 560001"
              className="w-full px-3 py-2 border border-border rounded-md focus:border-accent outline-none font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">City / District *</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Bangalore"
              className="w-full px-3 py-2 border border-border rounded-md focus:border-accent outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">State *</label>
            <input
              type="text"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. Karnataka"
              className="w-full px-3 py-2 border border-border rounded-md focus:border-accent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-gray-700 block mb-1">
            Flat, House No., Building, Apartment *
          </label>
          <input
            type="text"
            required
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="e.g. Flat 402, Prestige Palms"
            className="w-full px-3 py-2 border border-border rounded-md focus:border-accent outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Area, Street, Sector</label>
            <input
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="e.g. 12th Main Road, Indiranagar"
              className="w-full px-3 py-2 border border-border rounded-md focus:border-accent outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Landmark</label>
            <input
              type="text"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              placeholder="e.g. Near Metro Station"
              className="w-full px-3 py-2 border border-border rounded-md focus:border-accent outline-none"
            />
          </div>
        </div>

        {/* Address Type & Default */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-100">
          <div>
            <label className="font-bold text-gray-700 block mb-1.5">Type of Address</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="Home"
                  checked={type === 'Home'}
                  onChange={() => setType('Home')}
                  className="accent-accent"
                />
                <span>Home (All day delivery)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="Work"
                  checked={type === 'Work'}
                  onChange={() => setType('Work')}
                  className="accent-accent"
                />
                <span>Work (Delivery between 10 AM - 6 PM)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="accent-accent w-4 h-4 rounded"
            />
            <span className="text-gray-700 font-medium">Make this as my default address</span>
          </label>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" type="submit">
            {initialAddress ? 'Save Changes' : 'Save Address'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
