export default function Loading() {
  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="h-4 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-sm h-[380px] flex flex-col animate-pulse">
            <div className="h-48 bg-gray-200 w-full"></div>
            <div className="p-5 flex flex-col flex-grow">
              <div className="flex justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5 mb-auto"></div>
              <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}