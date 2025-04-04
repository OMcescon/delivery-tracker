import React, { useState, useRef } from 'react';
import { stores, products, generateId } from '../data';
import { Delivery, DeliveryProduct } from '../types';

interface DeliveryFormProps {
  onAddDelivery: (delivery: Delivery) => void;
  storeQuantities?: {
    '1_chica': number;
    '1_grande': number;
    '2_chica': number;
    '2_grande': number;
    '3_chica': number;
    '3_grande': number;
    '4_chica': number;
    '4_grande': number;
    '5_chica': number;
    '5_grande': number;
    '6_chica': number;
    '6_grande': number;
  };
  onStoreQuantitiesChange?: (quantities: {
    '1_chica': number;
    '1_grande': number;
    '2_chica': number;
    '2_grande': number;
    '3_chica': number;
    '3_grande': number;
    '4_chica': number;
    '4_grande': number;
    '5_chica': number;
    '5_grande': number;
    '6_chica': number;
    '6_grande': number;
  }) => void;
  isDisabled?: boolean; // New prop to disable the component when WhatsApp parser is used
  onReset?: () => void; // New prop to reset the parent state
  existingDeliveries?: Delivery[]; // New prop to check for existing deliveries
  sharedDate?: string; // New prop to share date between components
  onSharedDateChange?: (date: string) => void; // New prop to update shared date
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({ 
  onAddDelivery, 
  storeQuantities: propStoreQuantities, 
  onStoreQuantitiesChange,
  isDisabled = false,
  onReset,
  existingDeliveries = [],
  sharedDate,
  onSharedDateChange
}) => {
  // Use shared date if provided, otherwise use local date
  const [date, setDate] = useState(() => {
    if (sharedDate) return sharedDate;
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [displayDate, setDisplayDate] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [localStoreQuantities, setLocalStoreQuantities] = useState({
    // Madre
    '1_chica': 0,
    '1_grande': 0,
    // Mutualista
    '2_chica': 0,
    '2_grande': 0,
    // Noemís Villa
    '3_chica': 0,
    '3_grande': 0,
    // Lusín Villa
    '4_chica': 0,
    '4_grande': 0,
    // Trompillo Chico
    '5_chica': 0,
    '5_grande': 0,
    // Trompillo Grande
    '6_chica': 0,
    '6_grande': 0
  });
  const [notes, setNotes] = useState('');
  
  // Use either the prop storeQuantities or the local state
  const storeQuantities = propStoreQuantities || localStoreQuantities;
  
  // Function to update store quantities
  const updateStoreQuantity = (key: string, value: number) => {
    const newQuantities = {
      ...storeQuantities,
      [key]: value
    };
    
    // Update local state
    if (!propStoreQuantities) {
      setLocalStoreQuantities(newQuantities);
    }
    
    // Call parent handler if provided
    if (onStoreQuantitiesChange) {
      onStoreQuantitiesChange(newQuantities);
    }
  };

  // Function to handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    
    // Format and display the date
    const formattedDate = new Date(newDate).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    setDisplayDate(formattedDate);
    
    // Update shared date if callback is provided
    if (onSharedDateChange) {
      onSharedDateChange(newDate);
    }
  };

  // Function to reset the form
  const handleReset = () => {
    const resetQuantities = {
      '1_chica': 0,
      '1_grande': 0,
      '2_chica': 0,
      '2_grande': 0,
      '3_chica': 0,
      '3_grande': 0,
      '4_chica': 0,
      '4_grande': 0,
      '5_chica': 0,
      '5_grande': 0,
      '6_chica': 0,
      '6_grande': 0
    };
    
    // Update local state if using it
    if (!propStoreQuantities) {
      setLocalStoreQuantities(resetQuantities);
    }
    
    // Always call parent handler to update quantities
    if (onStoreQuantitiesChange) {
      onStoreQuantitiesChange(resetQuantities);
    }
    
    setNotes('');
    setIsSubmitted(false);
    
    // Call parent reset function if provided
    if (onReset) {
      onReset();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitted) {
      return;
    }
    
    // Validate that the date is not empty
    if (!date) {
      alert('Por favor, seleccione una fecha válida antes de enviar el formulario.');
      return;
    }
    
    // Check if there are already deliveries for the selected date
    const hasDeliveriesForDate = existingDeliveries.some(delivery => delivery.date === date);
    if (hasDeliveriesForDate) {
      alert('Ya existen entregas registradas para esta fecha. Por favor, seleccione otra fecha o limpie el historial existente.');
      return;
    }
    
    // Check if at least one store has quantities
    const hasQuantities = Object.values(storeQuantities).some(qty => qty > 0);
    if (!hasQuantities) {
      alert('Por favor, ingrese al menos una cantidad');
      return;
    }

    // Create deliveries for each store with quantities
    const deliveries: Delivery[] = [];
    
    // Process each store
    stores.forEach(store => {
      const chicaKey = `${store.id}_chica` as keyof typeof storeQuantities;
      const grandeKey = `${store.id}_grande` as keyof typeof storeQuantities;
      const chicaQty = storeQuantities[chicaKey];
      const grandeQty = storeQuantities[grandeKey];
      
      // Skip stores with no quantities
      if (chicaQty === 0 && grandeQty === 0) return;
      
      const deliveryProducts: DeliveryProduct[] = [];
      
      if (chicaQty > 0) {
        deliveryProducts.push({
          productId: '1', // ID for Torta Chica
          quantity: chicaQty
        });
      }
      
      if (grandeQty > 0) {
        deliveryProducts.push({
          productId: '2', // ID for Torta Grande
          quantity: grandeQty
        });
      }

      deliveries.push({
        id: generateId(),
        date,
        storeId: store.id,
        products: deliveryProducts,
        notes: notes.trim() || undefined
      });
    });

    // Add all deliveries
    deliveries.forEach(delivery => {
      onAddDelivery(delivery);
    });
    
    // Mark as submitted to prevent duplicate submissions
    setIsSubmitted(true);
  };

  return (
    <div className={`card bg-white p-6 rounded-lg shadow-md ${isDisabled ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Entrada Manual
        </h2>
        {isDisabled && (
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm">
            Deshabilitado - Usando entrada de WhatsApp
          </div>
        )}
        <div className="flex items-center space-x-2">
          <label htmlFor="delivery-date" className="text-sm font-medium text-gray-700">
            Fecha:
          </label>
          <input
            type="date"
            id="delivery-date"
            value={date}
            onChange={handleDateChange}
            disabled={isDisabled}
            className="input p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
          />
          {displayDate && (
            <span className="text-sm font-medium ml-2">{displayDate}</span>
          )}
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Madre */}
          <div className="input-group">
            <div className="input-wrapper">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Madre Chica
              </label>
              <input
                type="number"
                min="0"
                value={storeQuantities['1_chica']}
                onChange={(e) => updateStoreQuantity('1_chica', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="input-wrapper">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Madre Grande
              </label>
              <input
                type="number"
                min="0"
                value={storeQuantities['1_grande']}
                onChange={(e) => updateStoreQuantity('1_grande', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          {/* Mutualista */}
          <div className="input-group">
            <div className="input-wrapper">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mutualista Chica
              </label>
              <input
                type="number"
                min="0"
                value={storeQuantities['2_chica']}
                onChange={(e) => updateStoreQuantity('2_chica', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="input-wrapper">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mutualista Grande
              </label>
              <input
                type="number"
                min="0"
                value={storeQuantities['2_grande']}
                onChange={(e) => updateStoreQuantity('2_grande', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          {/* Noemís Villa */}
          <div className="input-group">
            <div className="input-wrapper">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Noemís Villa Chica
              </label>
              <input
                type="number"
                min="0"
                value={storeQuantities['3_chica']}
                onChange={(e) => updateStoreQuantity('3_chica', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="input-wrapper">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Noemís Villa Grande
              </label>
              <input
                type="number"
                min="0"
                value={storeQuantities['3_grande']}
                onChange={(e) => updateStoreQuantity('3_grande', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          {/* Lusín Villa */}
          <div className="input-group">
            <div className="input-wrapper">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lusín Villa Chica
              </label>
              <input
                type="number"
                min="0"
                value={storeQuantities['4_chica']}
                onChange={(e) => updateStoreQuantity('4_chica', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="input-wrapper">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lusín Villa Grande
              </label>
              <input
                type="number"
                min="0"
                value={storeQuantities['4_grande']}
                onChange={(e) => updateStoreQuantity('4_grande', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          {/* Trompillo Chico */}
          <div className="input-group">
            <div className="input-wrapper">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trompillo Chico Chica
              </label>
              <input
                type="number"
                min="0"
                value={storeQuantities['5_chica']}
                onChange={(e) => updateStoreQuantity('5_chica', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="input-wrapper">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trompillo Chico Grande
              </label>
              <input
                type="number"
                min="0"
                value={storeQuantities['5_grande']}
                onChange={(e) => updateStoreQuantity('5_grande', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          {/* Trompillo Grande */}
          <div className="input-group">
            <div className="input-wrapper">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trompillo Grande Chica
              </label>
              <input
                type="number"
                min="0"
                value={storeQuantities['6_chica']}
                onChange={(e) => updateStoreQuantity('6_chica', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="input-wrapper">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trompillo Grande Grande
              </label>
              <input
                type="number"
                min="0"
                value={storeQuantities['6_grande']}
                onChange={(e) => updateStoreQuantity('6_grande', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>
        <div className="flex mt-4 space-x-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitted || isDisabled}
            className={`btn btn-primary px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${(isSubmitted || isDisabled) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Enviar
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isDisabled}
            className={`btn btn-outline bg-gray-500 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliveryForm;