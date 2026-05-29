// app/user/page.tsx
import { auth } from '@clerk/nextjs/server';
import sql from '@/app/lib/db';
import AddressManager from '@/app/ui/user/AddressManager';
import { UserProfileForm } from '@/app/ui/user/UserProfileForm'; // Asegurate de que la ruta coincida con donde lo guardaste
import Link from 'next/link';

// Función para traer los datos del usuario desde la base de datos
async function getUserProfile(userId: string) {
  try {
    // Importante: Agregamos client_id al SELECT porque el formulario lo necesita como campo oculto
    const [user] = await sql`SELECT client_id, email, name, phone FROM users WHERE client_id = ${userId}`;
    return user || null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Función para traer las direcciones
async function getUserAddresses(userId: string) {
  try {
    const rows = await sql`SELECT address_id, title, street, city, lat, lng FROM addresses WHERE client_id = ${userId} ORDER BY title ASC`;
    return rows;
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return [];
  }
}

export default async function UserProfilePage() {
  // 1. Obtenemos el ID del usuario autenticado en Clerk
  const { userId } = await auth();
  
  if (!userId) {
    return (
      <div className="max-w-7xl mx-auto p-10 text-center">
        <p className="text-red-600 font-medium bg-red-50 p-4 rounded-lg inline-block">
          Debes iniciar sesión para ver esta página.
        </p>
      </div>
    );
  }

  // 2. Traemos toda la información en paralelo desde PostgreSQL
  const [profile, addresses] = await Promise.all([
    getUserProfile(userId),
    getUserAddresses(userId)
  ]);

  // 3. Normalizamos las direcciones para el AddressManager
  const normalizedAddresses = (addresses || []).map((r: any) => ({
    address_id: String(r.address_id),
    title: r.title ?? undefined,
    street: r.street ?? undefined,
    city: r.city ?? undefined,
    lat: r.lat ? Number(r.lat) : undefined,
    lng: r.lng ? Number(r.lng) : undefined,
  }));

  return (
    <main className="max-w-4xl mx-auto p-6 min-h-screen bg-gray-50/50">
      {/* Botón de volver */}
      <div className="mb-6">
        <Link href="/stores" className="text-sm font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors">
          &larr; Volver al catálogo
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 gap-8">
        {/* BLOQUE 1: Formulario de Información Personal */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Datos Personales</h2>
          {profile ? (
             <UserProfileForm user={profile} />
          ) : (
            <p className="text-sm text-gray-500">Hubo un problema al cargar tus datos. Intenta nuevamente.</p>
          )}
        </div>

        {/* BLOQUE 2: El Administrador Interactivo de Direcciones */}
        <AddressManager clientId={userId} initialAddresses={normalizedAddresses} />
      </div>
    </main>
  );
}