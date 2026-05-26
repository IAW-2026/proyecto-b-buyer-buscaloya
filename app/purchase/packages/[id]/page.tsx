import { notFound } from 'next/navigation';
import { getPackageDetails } from './queries';
import LiveTrackingPackage from '@/app/ui/purchase/packages/LiveTrackingPackage';
import Link from 'next/link';

export default async function PackageTrackingPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const pkg = await getPackageDetails(id);

  if (!pkg) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-3xl">
      {/* Botón para volver al listado de la compra */}
      <Link 
        href="/purchase" 
        className="inline-flex items-center text-sm text-gray-500 hover:text-orange-600 mb-6 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Volver a mi compra
      </Link>

      <LiveTrackingPackage pkg={pkg} />
    </div>
  );
}