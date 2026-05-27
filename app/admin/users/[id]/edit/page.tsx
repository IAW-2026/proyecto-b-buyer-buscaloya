import { notFound } from 'next/navigation';
import Link from 'next/link';
import { UserProfileForm } from '@/app/ui/user/UserProfileForm'; 
import AddressManager from '@/app/ui/user/AddressManager';
import { getUserById, getUserAddresses } from '@/app/admin/users/[id]/edit/queries';

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const userResult = await getUserById(id);
  const user = userResult[0];

  if (!user) {
    notFound();
  }

  // Obtener direcciones del usuario
  const addresses = await getUserAddresses(id);

  // Normalizamos las direcciones para el AddressManager
  const normalizedAddresses = (addresses || []).map((r: any) => ({
    address_id: String(r.address_id),
    title: r.title ?? undefined,
    street: r.street ?? undefined,
    city: r.city ?? undefined,
    lat: r.lat ? Number(r.lat) : undefined,
    lng: r.lng ? Number(r.lng) : undefined,
  }));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-10">
      <div className="max-w-5xl mx-auto space-y-6 px-4">
        
        {/* Encabezado y navegación */}
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
            &larr; Volver al panel
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuario</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BLOQUE 1: Formulario Unificado de Datos Básicos */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Información Personal</h2>
            <UserProfileForm user={user} />
          </div>

          {/* BLOQUE 2: El Gestor Unificado de Direcciones (CRUD completo para el admin) */}
          <div>
             <AddressManager clientId={id} initialAddresses={normalizedAddresses} />
          </div>
        </div>

      </div>
    </div>
  );
}