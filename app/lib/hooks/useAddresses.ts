import { useState, useEffect } from 'react';
import { getAddressesAction } from '@/app/lib/actions';

export type Address = { 
  address_id: string; 
  title?: string; 
  street?: string; 
  city?: string; 
  lat?: number; 
  lng?: number 
};

export function useAddresses(isOpen: boolean) {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchAddresses() {
      if (!isOpen) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getAddressesAction();
        if (!mounted) return;
        
        const normalized: Address[] = (res || []).map((r: any) => ({
          address_id: String(r.address_id),
          title: r.title ?? undefined,
          street: r.street ?? undefined,
          city: r.city ?? undefined,
          lat: typeof r.lat === 'number' ? r.lat : r.lat ? Number(r.lat) : undefined,
          lng: typeof r.lng === 'number' ? r.lng : r.lng ? Number(r.lng) : undefined,
        }));
        
        setAddresses(normalized);
        if (normalized.length > 0) setSelectedAddressId(normalized[0].address_id);
      } catch (err) {
        console.error('Error loading addresses:', err);
        if (!mounted) return;
        setError('No se pudieron cargar las direcciones');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchAddresses();
    return () => { mounted = false; };
  }, [isOpen]);

  return { addresses, loading, error, selectedAddressId, setSelectedAddressId };
}