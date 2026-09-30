import { describe, it, expect } from 'vitest';
import { useAddressStore } from '../../store/useAddressStore';

describe('useAddressStore', () => {
  it('loads with default addresses and selects the default address', () => {
    const addresses = useAddressStore.getState().addresses;
    expect(addresses.length).toBeGreaterThan(0);
    const selected = useAddressStore.getState().getSelectedAddress();
    expect(selected).toBeDefined();
    expect(selected?.isDefault).toBe(true);
  });

  it('adds a new address and selects it', () => {
    const newAddr = useAddressStore.getState().addAddress({
      name: 'Priya Verma',
      phone: '9123456780',
      pincode: '400001',
      city: 'Mumbai',
      state: 'Maharashtra',
      addressLine1: 'Building 12, Nariman Point',
      locality: 'Marine Drive',
      type: 'Home',
      isDefault: false,
    });

    expect(newAddr.id).toBeDefined();
    expect(useAddressStore.getState().selectedAddressId).toBe(newAddr.id);
  });

  it('updates an existing address', () => {
    const initial = useAddressStore.getState().addresses[0];
    useAddressStore.getState().updateAddress(initial.id, { name: 'Updated Name' });
    const updated = useAddressStore.getState().addresses.find((a) => a.id === initial.id);
    expect(updated?.name).toBe('Updated Name');
  });

  it('deletes an address', () => {
    const initialCount = useAddressStore.getState().addresses.length;
    const toDelete = useAddressStore.getState().addresses[1];
    useAddressStore.getState().deleteAddress(toDelete.id);
    expect(useAddressStore.getState().addresses.length).toBe(initialCount - 1);
  });
});
