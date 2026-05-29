export default function Loading() {
  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <p className="text-gray-500 mt-4">Cargando negocios...</p>
      </div>
    </main>
  );
}
