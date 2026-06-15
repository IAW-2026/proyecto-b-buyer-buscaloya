import React from 'react';

interface ConfirmCheckoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmCheckoutModal({ isOpen, onConfirm, onCancel }: ConfirmCheckoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity" 
        onClick={onCancel} 
      />
      
      {/* Modal Content */}
      <div className="relative z-[70] bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 flex flex-col items-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">¿Ir a pagar?</h3>
        <p className="text-gray-600 text-center mb-6">
          Estás a un paso de completar tu compra. ¿Deseas continuar hacia el pago?
        </p>
        
        <div className="flex gap-3 w-full">
          <button 
            type="button" 
            onClick={onCancel} 
            className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            className="flex-1 py-2.5 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
