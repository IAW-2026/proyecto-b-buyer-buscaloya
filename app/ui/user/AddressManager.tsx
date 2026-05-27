'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateAddressAction, createAddressAction, deleteAddressAction } from '@/app/lib/actions';
import { Address } from '@/app/lib/definitions';

interface AddressManagerProps {
  clientId: string;
  initialAddresses: Address[];
}

export default function AddressManager({ clientId, initialAddresses }: AddressManagerProps) {
  const router = useRouter();
  
  // Sincronizamos el estado local con los datos que vienen del servidor
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  
  useEffect(() => {
    setAddresses(initialAddresses);
  }, [initialAddresses]);
  
  // Estados para controlar el Modal (Ventana emergente)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  // Estados para el formulario
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenModal = (address?: Address) => {
    setEditingAddress(address || null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar esta dirección?')) return;
    
    try {
      // Actualización optimista (borramos de la UI al instante para que parezca rapidísimo)
      setAddresses(prev => prev.filter(a => a.address_id !== addressId));
      
      await deleteAddressAction(addressId, clientId);
      router.refresh(); // Refresca los datos en el servidor
    } catch (err) {
      alert('Hubo un error al intentar eliminar la dirección.');
      router.refresh(); // Si falla, volvemos a traer los datos reales
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append('client_id', clientId);
    
    if (editingAddress) {
      formData.append('address_id', editingAddress.address_id);
    }

    // Decidimos qué Server Action ejecutar dependiendo de si estamos editando o creando
    const action = editingAddress ? updateAddressAction : createAddressAction;
    const result = await action(undefined, formData);

    if (result.success) {
      handleCloseModal();
      router.refresh(); // Le pide a Next.js que vuelva a ejecutar el Server Component padre y actualice props
    } else {
      setError(result.error || 'Ocurrió un error inesperado');
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Direcciones Guardadas</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1"
        >
          <span>+</span> Nueva Dirección
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-sm">Aún no hay direcciones registradas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.address_id} className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between bg-gray-50 hover:bg-gray-100 transition-colors">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-blue-500 text-lg">📍</span> {addr.title || 'Dirección'}
                </h3>
                <p className="text-gray-600 text-sm mt-2 ml-6 leading-relaxed">
                  {addr.street} <br/> {addr.city}
                </p>
              </div>
              <div className="flex gap-4 mt-5 pt-3 border-t border-gray-200 ml-6">
                <button 
                  onClick={() => handleOpenModal(addr)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(addr.address_id)}
                  className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Pop-up del Formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-5">
              {editingAddress ? 'Editar Dirección' : 'Agregar Dirección'}
            </h3>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiqueta <span className="text-gray-400 font-normal">(Ej: Casa, Trabajo)</span>
                </label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={editingAddress?.title} 
                  required
                  placeholder="Ej: Mi Casa"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calle y Número</label>
                <input 
                  type="text" 
                  name="street" 
                  defaultValue={editingAddress?.street} 
                  required
                  placeholder="Ej: Av. Alem 1253"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                <input 
                  type="text" 
                  name="city" 
                  defaultValue={editingAddress?.city} 
                  required
                  placeholder="Ej: Bahía Blanca"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-shadow"
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex justify-center items-center"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    'Guardar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}