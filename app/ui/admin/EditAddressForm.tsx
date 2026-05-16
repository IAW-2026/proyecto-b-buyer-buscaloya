'use client';

import { useActionState } from 'react';
import { updateAddressAction, State } from '@/app/lib/actions';

export function EditAddressForm({ user, address }: { user: any, address: any }) {
 
  const initialState: State = { success: undefined, error: null };
  const [state, formAction, isPending] = useActionState(updateAddressAction, initialState);

  return (
    <form action={formAction} className="p-4 border border-neutral-700 rounded-md hover:border-blue-500 transition-colors">
      <input type="hidden" name="client_id" value={user.client_id} />
      <input type="hidden" name="address_id" value={address.address_id} />
      <div className="flex justify-between items-start">
        <div className="w-full">
          <label className="block text-sm font-medium text-neutral-300">Título</label>
          <input name="title" defaultValue={address.title} className="mt-1 block w-full rounded-md border border-neutral-600 bg-neutral-700 text-white p-2" />
          <label className="block text-sm font-medium text-neutral-300 mt-3">Calle y número</label>
          <input name="street" defaultValue={address.street} className="mt-1 block w-full rounded-md border border-neutral-600 bg-neutral-700 text-white p-2" />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <label className="block text-sm font-medium text-neutral-300">Ciudad</label>
              <input name="city" defaultValue={address.city} className="mt-1 block w-full rounded-md border border-neutral-600 bg-neutral-700 text-white p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300">Lat</label>
              <input name="lat" defaultValue={address.lat} className="mt-1 block w-full rounded-md border border-neutral-600 bg-neutral-700 text-white p-2" />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-neutral-300">Lng</label>
            <input name="lng" defaultValue={address.lng} className="mt-1 block w-full rounded-md border border-neutral-600 bg-neutral-700 text-white p-2" />
          </div>

          {state?.error && <p className="text-red-500 text-sm mt-3">{state.error}</p>}
          {state?.success && <p className="text-green-500 text-sm mt-3">Dirección actualizada.</p>}

          <button type="submit" disabled={isPending} className="mt-4 bg-teal-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
            {isPending ? 'Guardando...' : 'Guardar Dirección'}
          </button>
        </div>
      </div>
    </form>
  );
}