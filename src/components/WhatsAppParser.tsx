import React, { useState, useEffect } from 'react';
import { stores, products, generateId } from '../data';
import { Delivery, DeliveryProduct } from '../types';

interface WhatsAppParserProps {
  onAddDeliveries: (deliveries: Delivery[]) => void;
  onUpdateFormQuantities?: (quantities: {
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
  isDisabled?: boolean; // New prop to disable the component when manual form is used
  onReset?: () => void; // New prop to reset the parent state
  existingDeliveries?: Delivery[]; // New prop to check for existing deliveries
  sharedDate?: string; // New prop to share date between components
  onSharedDateChange?: (date: string) => void; // New prop to update shared date
}

const WhatsAppParser: React.FC<WhatsAppParserProps> = ({ 
  onAddDeliveries, 
  onUpdateFormQuantities,
  isDisabled = false,
  onReset,
  existingDeliveries = [],
  sharedDate,
  onSharedDateChange
}) => {
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string }>({ success: false, message: '' });
  // Use shared date if provided, otherwise use local date
  const [selectedDate, setSelectedDate] = useState(() => {
    if (sharedDate) return sharedDate;
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }); // Add state for date selection
  const [isAnalyzed, setIsAnalyzed] = useState(false); // Flag to track if current message has been analyzed
  const [lastAnalyzedMessage, setLastAnalyzedMessage] = useState(''); // Store the last analyzed message

  // Simple tokenizer function to split text into words
  const tokenize = (text: string): string[] => {
    return text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
  };
  
  // Function to handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    // Reset analysis state when date changes
    setIsAnalyzed(false);
    
    // Update shared date if callback is provided
    if (onSharedDateChange) {
      onSharedDateChange(newDate);
    }
  };
  
  // Function to find store by name or partial name with improved matching
  const findStore = (text: string): { store: typeof stores[0], index: number } | null => {
    const lowerText = text.toLowerCase();
    
    // First try exact match
    for (const store of stores) {
      const storeLower = store.name.toLowerCase();
      if (lowerText.includes(storeLower)) {
        return { store, index: lowerText.indexOf(storeLower) };
      }
    }
    
    // Then try partial matches with word boundaries
    for (const store of stores) {
      const storeParts = store.name.toLowerCase().split(' ');
      for (const part of storeParts) {
        // Only consider meaningful parts (longer than 3 chars)
        if (part.length > 3 && lowerText.includes(part)) {
          return { store, index: lowerText.indexOf(part) };
        }
      }
    }
    
    // Try fuzzy matching for store names (allowing for typos)
    for (const store of stores) {
      const storeName = store.name.toLowerCase();
      // Check for common abbreviations or partial names
      if (storeName === 'mutualista' && (lowerText.includes('mut') || lowerText.includes('mutu'))) {
        return { store, index: lowerText.indexOf('mut') };
      }
      if (storeName === 'trompillo chico' && (lowerText.includes('tromp') && lowerText.includes('ch') || lowerText.includes('chicó') || lowerText.includes('chico'))) {
        return { store, index: lowerText.includes('chicó') ? lowerText.indexOf('chicó') : lowerText.includes('chico') ? lowerText.indexOf('chico') : lowerText.indexOf('tromp') };
      }
      if (storeName === 'trompillo grande' && (lowerText.includes('tromp') && lowerText.includes('gr') || lowerText.includes('grande'))) {
        return { store, index: lowerText.includes('grande') ? lowerText.indexOf('grande') : lowerText.indexOf('tromp') };
      }
      // For Villa stores, we need special handling
      if (storeName.includes('villa')) {
        // If text contains 'noemis' or 'noemi' explicitly, it's Noemis Villa
        if (storeName === 'noemis villa' && (lowerText.includes('noemis') || lowerText.includes('noemi'))) {
          return { store, index: lowerText.indexOf('noemis') !== -1 ? lowerText.indexOf('noemis') : lowerText.indexOf('noemi') };
        }
        // If text contains 'luisin' or 'lusin' explicitly, it's Luisin Villa
        else if (storeName === 'luisin villa' && (lowerText.includes('luisin') || lowerText.includes('lusin'))) {
          return { store, index: lowerText.indexOf('luisin') !== -1 ? lowerText.indexOf('luisin') : lowerText.indexOf('lusin') };
        }
        // If text only contains 'villa' without specifying which one, default to Luisin Villa
        else if (storeName === 'luisin villa' && lowerText.includes('villa') && !lowerText.includes('noemis') && !lowerText.includes('noemi')) {
          return { store, index: lowerText.indexOf('villa') };
        }
      }
      if (storeName === 'madre' && lowerText.includes('madre')) {
        return { store, index: lowerText.indexOf('madre') };
      }
    }
    
    return null;
  };
  
  // Reset analysis state when message changes
  useEffect(() => {
    setIsAnalyzed(false);
  }, [message]);

  // Function to handle reset
  const handleReset = () => {
    setMessage('');
    setIsAnalyzed(false);
    setLastAnalyzedMessage('');
    setResult({ success: false, message: '' });
    
    // Reset store quantities if onUpdateFormQuantities is provided
    if (onUpdateFormQuantities) {
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
      onUpdateFormQuantities(resetQuantities);
    }
    
    // Call parent reset function if provided
    if (onReset) {
      onReset();
    }
  };

  const parseWhatsAppMessage = () => {
    // Prevent duplicate processing if already analyzed and message hasn't changed
    if (isAnalyzed && message === lastAnalyzedMessage) {
      setResult({ 
        success: true, 
        message: 'Este mensaje ya ha sido analizado y procesado. Modifique el mensaje o limpie el formulario para realizar un nuevo análisis.' 
      });
      return;
    }
    
    // Check if there are already deliveries for the selected date
    const hasDeliveriesForDate = existingDeliveries.some(delivery => delivery.date === selectedDate);
    if (hasDeliveriesForDate) {
      setResult({ 
        success: false, 
        message: 'Ya existen entregas registradas para esta fecha. Por favor, seleccione otra fecha o limpie el historial existente.' 
      });
      return;
    }
    
    // Validate that the date is not empty
    if (!selectedDate) {
      setResult({
        success: false,
        message: 'Por favor, seleccione una fecha válida antes de procesar el mensaje.'
      });
      return;
    }
    
    setProcessing(true);
    setResult({ success: false, message: '' });
    
    try {
      // Split message by lines
      const lines = message.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        setResult({ success: false, message: 'No content found in the message' });
        setProcessing(false);
        return;
      }
      
      const date = selectedDate; // Use the selected date instead of current date
      const extractedDeliveries: Delivery[] = [];
      
      // New approach to handle multi-line format
      let currentStore: { store: typeof stores[0], index: number } | null = null;
      let chicaQuantity = 0;
      let grandeQuantity = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check if this line contains a store name
        const storeInfo = findStore(line);
        
        // If we found a store and we already have a current store with quantities, create a delivery
        if (storeInfo && currentStore && (chicaQuantity > 0 || grandeQuantity > 0)) {
          // Create delivery for the previous store before moving to the new one
          const deliveryProducts: DeliveryProduct[] = [];
          
          if (chicaQuantity > 0) {
            deliveryProducts.push({
              productId: '1', // ID for Torta Chica
              quantity: chicaQuantity
            });
          }
          
          if (grandeQuantity > 0) {
            deliveryProducts.push({
              productId: '2', // ID for Torta Grande
              quantity: grandeQuantity
            });
          }
          
          extractedDeliveries.push({
            id: generateId(),
            date,
            storeId: currentStore.store.id,
            products: deliveryProducts,
            notes: `Extracted from WhatsApp message`
          });
          
          // Reset quantities for the new store
          chicaQuantity = 0;
          grandeQuantity = 0;
        }
        
        // If we found a store, update the current store
        if (storeInfo) {
          currentStore = storeInfo;
          continue; // Move to the next line to look for quantities
        }
        
        // If we have a current store, look for quantities in this line
        if (currentStore) {
          // Look for chica quantity
          const chicaMatches = line.match(/\b(\d+)\s*ch(?:ica)?\b|\bch(?:ica)?\s*(\d+)\b/i);
          if (chicaMatches) {
            chicaQuantity = parseInt(chicaMatches[1] || chicaMatches[2]);
          }
          
          // Look for grande quantity
          const grandeMatches = line.match(/\b(\d+)\s*gr(?:ande)?\b|\bgr(?:ande)?\s*(\d+)\b/i);
          if (grandeMatches) {
            grandeQuantity = parseInt(grandeMatches[1] || grandeMatches[2]);
          }
          
          // If no matches found with the standard patterns, try alternative patterns
          if (!chicaMatches && !grandeMatches) {
            // Try to find numbers followed by ch/gr with possible characters in between
            const altChicaMatches = line.match(/\b(\d+)[^\d\n]*ch|ch[^\d\n]*(\d+)\b/i);
            if (altChicaMatches) {
              chicaQuantity = parseInt(altChicaMatches[1] || altChicaMatches[2]);
            }
            
            const altGrandeMatches = line.match(/\b(\d+)[^\d\n]*gr|gr[^\d\n]*(\d+)\b/i);
            if (altGrandeMatches) {
              grandeQuantity = parseInt(altGrandeMatches[1] || altGrandeMatches[2]);
            }
            
            // If still no matches, just look for numbers
            if (!altChicaMatches && !altGrandeMatches) {
              const numbers = line.match(/\d+/g);
              if (numbers && numbers.length > 0) {
                // If the line only has a number and 'ch' or 'gr' is in the line
                if (line.toLowerCase().includes('ch')) {
                  chicaQuantity = parseInt(numbers[0]);
                } else if (line.toLowerCase().includes('gr')) {
                  grandeQuantity = parseInt(numbers[0]);
                } else if (chicaQuantity === 0 && grandeQuantity === 0) {
                  // If we can't determine which product, assume it's chica
                  chicaQuantity = parseInt(numbers[0]);
                }
              }
            }
          }
        }
      }
      
      // Don't forget to add the last store if we have one
      if (currentStore && (chicaQuantity > 0 || grandeQuantity > 0)) {
        const deliveryProducts: DeliveryProduct[] = [];
        
        if (chicaQuantity > 0) {
          deliveryProducts.push({
            productId: '1', // ID for Torta Chica
            quantity: chicaQuantity
          });
        }
        
        if (grandeQuantity > 0) {
          deliveryProducts.push({
            productId: '2', // ID for Torta Grande
            quantity: grandeQuantity
          });
        }
        
        extractedDeliveries.push({
          id: generateId(),
          date,
          storeId: currentStore.store.id,
          products: deliveryProducts,
          notes: `Extracted from WhatsApp message`
        });
      }
      
      // If no deliveries were extracted, try the original line-by-line approach as fallback
      if (extractedDeliveries.length === 0) {
        // Process each line individually (original approach)
        lines.forEach(line => {
          // Find store mention
          const storeInfo = findStore(line);
          if (!storeInfo) return; // Skip if no store found
          
          // Find quantities using improved regex patterns
          let chicaQuantity = 0;
          let grandeQuantity = 0;
          
          // Enhanced regex patterns to match a wider variety of formats
          const chicaMatches = line.match(/\b(\d+)\s*ch(?:ica)?\b|\bch(?:ica)?\s*(\d+)\b/i);
          if (chicaMatches) {
            chicaQuantity = parseInt(chicaMatches[1] || chicaMatches[2]);
          }
          
          const grandeMatches = line.match(/\b(\d+)\s*gr(?:ande)?\b|\bgr(?:ande)?\s*(\d+)\b/i);
          if (grandeMatches) {
            grandeQuantity = parseInt(grandeMatches[1] || grandeMatches[2]);
          }
          
          // If the above didn't find quantities, try alternative patterns
          if (chicaQuantity === 0 && grandeQuantity === 0) {
            // Try to find numbers followed by ch/gr with possible characters in between
            const altChicaMatches = line.match(/\b(\d+)[^\d\n]*ch|ch[^\d\n]*(\d+)\b/i);
            if (altChicaMatches) {
              chicaQuantity = parseInt(altChicaMatches[1] || altChicaMatches[2]);
            }
            
            const altGrandeMatches = line.match(/\b(\d+)[^\d\n]*gr|gr[^\d\n]*(\d+)\b/i);
            if (altGrandeMatches) {
              grandeQuantity = parseInt(altGrandeMatches[1] || altGrandeMatches[2]);
            }
            
            // If still no quantities, look for numbers near keywords
            if (chicaQuantity === 0 && grandeQuantity === 0) {
              // Find any numbers in the line
              const numbers = line.match(/\d+/g);
              if (numbers && numbers.length > 0) {
                // Assume first number is for chica if there's only one number
                // If there are two or more numbers, assume first is chica and second is grande
                chicaQuantity = parseInt(numbers[0]);
                grandeQuantity = numbers.length > 1 ? parseInt(numbers[1]) : 0;
              }
            }
          }
          
          // If we found quantities, create a delivery
          if (chicaQuantity > 0 || grandeQuantity > 0) {
            const deliveryProducts: DeliveryProduct[] = [];
            
            if (chicaQuantity > 0) {
              deliveryProducts.push({
                productId: '1', // ID for Torta Chica
                quantity: chicaQuantity
              });
            }
            
            if (grandeQuantity > 0) {
              deliveryProducts.push({
                productId: '2', // ID for Torta Grande
                quantity: grandeQuantity
              });
            }
            
            extractedDeliveries.push({
              id: generateId(),
              date,
              storeId: storeInfo.store.id,
              products: deliveryProducts,
              notes: `Extracted from WhatsApp message`
            });
          }
        });
      }
      
      // If we found deliveries, update the form quantities and add them
      if (extractedDeliveries.length > 0) {
        // Create a map of store quantities to update the form
        if (onUpdateFormQuantities) {
          // Crear un objeto con la estructura específica requerida por onUpdateFormQuantities
          const newStoreQuantities = {
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
          
          extractedDeliveries.forEach(delivery => {
            delivery.products.forEach(product => {
              const storeId = delivery.storeId;
              const isChica = product.productId === '1';
              const key = `${storeId}_${isChica ? 'chica' : 'grande'}`;
              // Solo actualizar si la clave existe en el objeto
              if (key in newStoreQuantities) {
                newStoreQuantities[key as keyof typeof newStoreQuantities] = product.quantity;
              }
            });
          });
          
          onUpdateFormQuantities(newStoreQuantities);
        }
        
        // Add the deliveries
        onAddDeliveries(extractedDeliveries);
        
        setResult({
          success: true,
          message: `Se han procesado ${extractedDeliveries.length} entregas correctamente.`
        });
        
        // Mark as analyzed to prevent duplicate processing
        setIsAnalyzed(true);
        setLastAnalyzedMessage(message);
      } else {
        setResult({
          success: false,
          message: 'No se pudieron extraer entregas del mensaje. Por favor, revise el formato.'
        });
      }
    } catch (error) {
      console.error('Error parsing WhatsApp message:', error);
      setResult({
        success: false,
        message: `Error al procesar el mensaje: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${isDisabled ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Entrada de WhatsApp</h2>
        {isDisabled && (
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm">
            Deshabilitado - Usando entrada manual
          </div>
        )}
        <div className="flex items-center space-x-2">
          <label htmlFor="whatsapp-date" className="text-sm font-medium text-gray-700">
            Fecha:
          </label>
          <input
            type="date"
            id="whatsapp-date"
            value={selectedDate}
            onChange={handleDateChange}
            disabled={isDisabled}
            className="p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="whatsapp-message" className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje de WhatsApp:
        </label>
        <textarea
          id="whatsapp-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isDisabled || processing}
          className="w-full h-40 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          placeholder="Pegue aquí el mensaje de WhatsApp..."
        />
      </div>
      
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <button
            onClick={parseWhatsAppMessage}
            disabled={isDisabled || processing || message.trim() === ''}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Procesando...' : 'Analizar/Enviar'}
          </button>
          <button
            onClick={handleReset}
            disabled={isDisabled || processing}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Limpiar
          </button>
        </div>
      </div>
      
      {result.message && (
        <div className={`mt-4 p-3 rounded-md ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {result.message}
        </div>
      )}
    </div>
  );
};

export default WhatsAppParser;