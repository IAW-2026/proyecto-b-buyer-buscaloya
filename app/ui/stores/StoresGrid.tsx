import Link from 'next/link';
import Image from 'next/image';
import { Store } from '@/app/lib/definitions';

export default function StoresGrid({ stores }: { stores: Store[] }) {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stores.length === 0 ? (
        <div className="col-span-full text-center text-gray-500">No hay negocios.</div>
      ) : (
        stores.map((store) => (
          <Link href={`/stores/${store.store_id}/catalog`} key={store.store_id} className="group cursor-pointer">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-row items-center p-4 gap-4">
              <div className="h-24 w-24 sm:h-28 sm:w-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                {store.image_url ? (
                  <Image 
                  src={store.image_url} 
                  alt={`${store.name}'s picture`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  width={200} 
                  height={200} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs"><span>Sin Imagen</span></div>
                )}
              </div>
              <div className="flex flex-col flex-grow min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate">{store.name}</h2>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">{store.category}</span>
                <p className="text-gray-500 text-sm line-clamp-2 mt-1">{store.description}</p>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}