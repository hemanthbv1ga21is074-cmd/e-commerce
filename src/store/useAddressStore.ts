import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Address } from '../types';

interface AddressStore {
  addresses: Address[];
  selectedAddressId: string | null;
  selectAddress: (id: string) => void;
  addAddress: (address: Omit<Address, 'id'>) => Address;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getSelectedAddress: () => Address | undefined;
}

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    name: 'Rahul Sharma',
    phone: '9876543210',
    pincode: '560001',
    city: 'Bangalore',
    state: 'Karnataka',
    addressLine1: 'Flat 402, Prestige Palms',
    addressLine2: '12th Main Road, Indiranagar',
    locality: 'Near Metro Station',
    type: 'Home',
    isDefault: true,
  },
  {
    id: 'addr-2',
    name: 'Rahul Sharma (Office)',
    phone: '9876543210',
    pincode: '560100',
    city: 'Bangalore',
    state: 'Karnataka',
    addressLine1: 'Tech Park, Tower 3, 5th Floor',
    addressLine2: 'Electronic City Phase 1',
    locality: 'Opposite Infosys Gate 2',
    type: 'Work',
    isDefault: false,
  },
];

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: DEFAULT_ADDRESSES,
      selectedAddressId: 'addr-1',

      selectAddress: (id) => set({ selectedAddressId: id }),

      addAddress: (newAddr) => {
        const id = `addr-${Date.now()}`;
        const address: Address = { ...newAddr, id };

        set((state) => {
          let updatedList = [...state.addresses];
          if (address.isDefault) {
            updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
          }
          return {
            addresses: [...updatedList, address],
            selectedAddressId: id,
          };
        });

        return address;
      },

      updateAddress: (id, updatedFields) => {
        set((state) => {
          let updatedList = state.addresses.map((a) =>
            a.id === id ? { ...a, ...updatedFields } : a
          );
          if (updatedFields.isDefault) {
            updatedList = updatedList.map((a) =>
              a.id === id ? a : { ...a, isDefault: false }
            );
          }
          return { addresses: updatedList };
        });
      },

      deleteAddress: (id) => {
        set((state) => {
          const filtered = state.addresses.filter((a) => a.id !== id);
          return {
            addresses: filtered,
            selectedAddressId:
              state.selectedAddressId === id
                ? filtered[0]?.id || null
                : state.selectedAddressId,
          };
        });
      },

      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
          selectedAddressId: id,
        }));
      },

      getSelectedAddress: () => {
        const { addresses, selectedAddressId } = get();
        return (
          addresses.find((a) => a.id === selectedAddressId) ||
          addresses.find((a) => a.isDefault) ||
          addresses[0]
        );
      },
    }),
    { name: 'stylebazaar-addresses' }
  )
);
