import { PencilIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export function UpdateUser({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/users/${id}/edit`}
      className="rounded-md border border-neutral-700 p-2 hover:bg-neutral-800 h-[38px] w-[38px] flex items-center justify-center transition-colors"
    >
      <PencilIcon className="w-5 text-blue-300" />
    </Link>
  );
}
