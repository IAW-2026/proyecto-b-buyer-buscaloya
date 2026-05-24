'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/app/providers/CartProvider';
import { useRouter } from 'next/navigation';
import { getAddressesAction, sendCartAction } from '@/app/lib/actions';

type Address = { address_id: string; title?: string; street?: string; city?: string; lat?: number; lng?: number };

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, setQuantity, remove, clear } = useCart();
  const router = useRouter();

  const [addresses, setAddresses] = React.useState<Address[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function fetch() {
      if (!isOpen) return;
      setLoading(true);
      setLoadError(null);
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
        setLoadError('No se pudieron cargar las direcciones');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetch();
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalValue = items.reduce((s, it) => {
    const price = it.productPrice ?? it.product?.price ?? 0;
    return s + price * it.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 z-40" onClick={onClose} />
      <aside className="relative z-50 ml-auto w-full max-w-md bg-white h-full shadow-xl p-6 flex flex-col text-black">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black">Carrito</h3>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de entrega</label>
          {loading ? (
            <div className="text-sm text-gray-600">Cargando direcciones...</div>
          ) : loadError ? (
            <div className="text-sm text-red-600">{loadError}</div>
          ) : addresses && addresses.length > 0 ? (
            <select 
              className="w-full border border-gray-300 rounded p-2 text-sm text-black"
              value={selectedAddressId || ''} 
              onChange={(e) => setSelectedAddressId(e.target.value)}
            >
              {addresses.map(a => (
                <option key={a.address_id} value={a.address_id}>{a.title || `${a.street}, ${a.city}`}</option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-gray-600">No tienes direcciones guardadas.</div>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          {items.length === 0 ? (
            <div className="text-gray-700">El carrito está vacío.</div>
          ) : (
            items.map((it) => (
              <div key={`${it.storeId}:${it.productId}`} className="p-3 border border-gray-200 rounded mb-3 bg-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    { (it.imageUrl || it.product?.image_url) ? (
                      <div className="w-16 h-16 relative rounded overflow-hidden">
                        <Image
                          src={it.imageUrl || it.product?.image_url}
                          alt={it.productName || it.product?.name || ''}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        Sin Imagen
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-black">{it.productName || it.product?.name || it.productId}</div>
                      <div className="text-sm text-gray-600">Tienda: {it.storeName || it.product?.storeName || it.storeId}</div>
                      <div className="text-sm text-gray-800 mt-2">Cantidad: <span className="font-medium">{it.quantity}</span></div>
                      <div className="text-sm text-gray-800 mt-1">Precio: <span className="font-medium">${((it.productPrice ?? it.product?.price ?? 0)).toLocaleString('es-AR')}</span></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      aria-label="Eliminar producto"
                      onClick={() => remove(it.storeId, it.productId)}
                      className="mt-2 p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-gray-800">Total</div>
            <div className="font-medium text-black">${totalValue.toLocaleString('es-AR')}</div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded bg-gray-800 text-white">Cerrar</button>
            <button
              type="button"
              onClick={async () => {
                if (!selectedAddressId) return;
                if (!confirm('¿Enviar pedido?')) return;
                setSending(true);
                setSendError(null);
                try {
                    await sendCartAction({ addressId: selectedAddressId, items });
                    onClose();
                    // Navigate first, then clear the cart in the next tick to
                    // avoid updating CartProvider state during Router render.
                    router.push('/purchases');
                    setTimeout(() => clear(), 0);
                } catch (err) {
                  console.error('Error sending cart:', err);
                  setSendError('No se pudo enviar el pedido');
                } finally {
                  setSending(false);
                }
              }}
              disabled={items.length === 0 || !selectedAddressId || loading || sending}
              className={`flex-1 py-2 rounded font-medium ${items.length === 0 || !selectedAddressId || loading || sending ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
