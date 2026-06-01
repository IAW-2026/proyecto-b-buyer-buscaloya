"use client";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const initial = (searchParams?.get('search') ?? '') as string;
  const [term, setTerm] = useState(initial);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const params = new URLSearchParams(searchParams?.toString() ?? '');
        params.set('page', '1');
        if (term) {
          params.set('search', term);
        } else {
          params.delete('search');
        }
        replace(`${pathname}?${params.toString()}`);
      } catch (e) {
        // ignore
      }
    }, 300);

    return () => clearTimeout(t);
  }, [term]);

  return (
    <div className="mb-4">
      <label htmlFor="search" className="sr-only">
        Buscar
      </label>
      <div className="relative flex gap-2">
        <input
          id="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md p-2 pr-10 bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent placeholder-gray-400"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center">
          <MagnifyingGlassIcon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
