import Link from 'next/link';

export default function NoActivePurchase() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-800">No tienes compras activas</h2>
      <p className="text-gray-500 mt-2 max-w-sm">
        Explora tus tiendas favoritas y realiza tu próximo pedido.
      </p>
      <Link 
        href="/stores" 
        className="mt-6 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-sm transition-colors"
      >
        Ver Tiendas
      </Link>
    </div>
  );
}