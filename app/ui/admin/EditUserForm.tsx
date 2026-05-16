'use client';

import { useActionState } from 'react';
import { updateUserAction, State } from '@/app/lib/actions';

export function EditUserForm({ user }: { user: any }) {
  const initialState: State = { success: undefined, error: null };
  const [state, formAction, isPending] = useActionState(updateUserAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="client_id" value={user.client_id} />
      <div>
        <label className="block text-sm font-medium text-neutral-300">Nombre</label>
        <input 
          name="name"
          type="text" 
          defaultValue={user.name} 
          className="mt-1 block w-full rounded-md border border-neutral-600 bg-neutral-700 text-white p-2 focus:border-blue-500 focus:ring-blue-500" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-300">Email</label>
        <input 
          type="email" 
          name="email"
          defaultValue={user.email} 
          readOnly
          className="mt-1 block w-full rounded-md border border-neutral-600 bg-neutral-700 text-neutral-300 p-2" 
          title="El email normalmente se gestiona en Clerk"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-300">Teléfono</label>
        <input 
          name="phone"
          type="tel" 
          defaultValue={user.phone || ''} 
          className="mt-1 block w-full rounded-md border border-neutral-600 bg-neutral-700 text-white p-2 focus:border-blue-500 focus:ring-blue-500" 
        />
      </div>
      
      {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
      {state?.success && <p className="text-green-500 text-sm">Cambios guardados correctamente.</p>}
      
      <div className="pt-2">
        <button type="submit" disabled={isPending} className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {isPending ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}