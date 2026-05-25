import Link from 'next/link';
import Image from 'next/image';
import { Store } from '@/app/lib/definitions';

export default function StoresGrid({ stores }: { stores: Store[] }) {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stores.length === 0 ? (
        <div className="col-span-full text-center text-neutral-400">No hay negocios.</div>
      ) : (
        stores.map((store) => (
          <Link href={`/stores/${store.id}/catalog?storeName=${encodeURIComponent(store.name)}`} key={store.id} className="group cursor-pointer">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="h-48 bg-gray-100 w-full overflow-hidden flex-shrink-0 relative">
                {store.image_url ? (
                  <Image 
                  src={store.image_url} 
                  alt={`${store.name}'s picture`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  width={400} 
                  height={300} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><span>Sin Imagen</span></div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">{store.category}</span>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{store.name}</h2>
                <p className="text-gray-600 text-sm line-clamp-2 flex-grow">{store.description}</p>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}