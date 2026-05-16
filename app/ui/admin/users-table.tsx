import Link from 'next/link';
import { UpdateUser } from '@/app/ui/admin/buttons';
import { fetchFilteredUsers } from '@/app/admin/users/queries';

export default async function UsersTable({ currentPage, search }: { currentPage: number; search?: string }) {
  const users = await fetchFilteredUsers(currentPage, search);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-neutral-800 text-neutral-300 text-sm uppercase">
            <th className="p-4 border-b border-neutral-700">Nombre</th>
            <th className="p-4 border-b border-neutral-700">Email</th>
            <th className="p-4 border-b border-neutral-700">Teléfono</th>
            <th className="p-4 border-b border-neutral-700 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-4 text-center text-neutral-400">
                No hay usuarios registrados.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.client_id} className="hover:bg-neutral-800 border-b border-neutral-700 last:border-0">
                <td className="p-4 text-white font-medium">{user.name}</td>
                <td className="p-4 text-neutral-200">{user.email}</td>
                <td className="p-4 text-neutral-200">{user.phone || '-'}</td>
                <td className="p-4 flex gap-2 justify-end">
                  <UpdateUser id={user.client_id} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}