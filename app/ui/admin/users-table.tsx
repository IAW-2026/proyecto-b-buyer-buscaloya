import Link from 'next/link';
import { UpdateUser } from '@/app/ui/admin/buttons';
import { fetchFilteredUsers } from '@/app/admin/users/queries';

export default async function UsersTable({ currentPage, search }: { currentPage: number; search?: string }) {
  const users = await fetchFilteredUsers(currentPage, search);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-sm uppercase">
            <th className="p-4 border-b border-gray-200">Nombre</th>
            <th className="p-4 border-b border-gray-200">Email</th>
            <th className="p-4 border-b border-gray-200 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No hay usuarios registrados.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.client_id} className="hover:bg-gray-50 border-b border-gray-200 last:border-0">
                <td className="p-4 text-gray-900 font-medium">{user.name}</td>
                <td className="p-4 text-gray-700">{user.email}</td>
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