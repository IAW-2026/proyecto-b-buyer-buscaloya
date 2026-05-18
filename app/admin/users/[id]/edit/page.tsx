import sql from '@/app/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { EditUserForm } from '@/app/ui/admin/EditUserForm';
import { EditAddressForm } from '@/app/ui/admin/EditAddressForm';

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Obtener usuario
  const userResult = await sql`SELECT * FROM users WHERE client_id = ${id}`;
  const user = userResult[0];

  if (!user) {
    notFound();
  }

  // Obtener direcciones del usuario
  const addresses = await sql`SELECT * FROM addresses WHERE client_id = ${id} ORDER BY title ASC`;
  
  return (
    <div className="min-h-screen bg-black text-white py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/admin/users" className="text-neutral-400 hover:text-neutral-200">
            &larr; Volver
          </Link>
          <h1 className="text-2xl font-bold text-white">Detalles del Usuario</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulario de Datos Básicos */}
          <div className="bg-neutral-800 p-6 rounded-lg shadow-sm border border-neutral-700">
            <h2 className="text-lg font-semibold text-white mb-4">Información Personal</h2>
            <EditUserForm user={user} />
          </div>

          {/* Lista de Direcciones */}
          <div className="bg-neutral-800 p-6 rounded-lg shadow-sm border border-neutral-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Direcciones</h2>
            </div>
            
            <div className="space-y-4">
              {addresses.length === 0 ? (
                <p className="text-sm text-neutral-400">Este usuario no tiene direcciones asociadas.</p>
              ) : (
                addresses.map((address) => (
                  <EditAddressForm key={address.address_id} user={user} address={address} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
