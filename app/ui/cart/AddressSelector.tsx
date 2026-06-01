'use client';

import { Address } from '@/app/lib/hooks/useAddresses';

interface AddressSelectorProps {
  loading: boolean;
  error: string | null;
  addresses: Address[] | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function AddressSelector({ loading, error, addresses, selectedId, onSelect }: AddressSelectorProps) {
  if (loading) return <div className="text-sm text-gray-600">Cargando direcciones...</div>;
  
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  
  if (!addresses || addresses.length === 0) {
    return <div className="text-sm text-gray-600">No tienes direcciones guardadas.</div>;
  }

  return (
    <select 
      className="w-full border border-gray-300 rounded p-2 text-sm text-black focus:ring-2 focus:ring-rose-500"
      value={selectedId || ''} 
      onChange={(e) => onSelect(e.target.value)}
    >
      {addresses.map(a => (
        <option key={a.address_id} value={a.address_id}>
          {a.title || `${a.street}, ${a.city}`}
        </option>
      ))}
    </select>
  );
}