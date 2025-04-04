'use client';

import React, { useState, useEffect } from 'react';
import DeliveryForm from '../components/DeliveryForm';
import DeliveryTable from '../components/DeliveryTable';
import WhatsAppParser from '../components/WhatsAppParser';
import ExcelExporter from '../components/ExcelExporter';
import { Delivery } from '../types';
import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns';

export default function Home() {
  // State to store all deliveries
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  // State to store filtered deliveries
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  // State for date range filter
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('7days');
  // State for custom date range
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  // State for showing custom date range inputs
  const [showCustomDateRange, setShowCustomDateRange] = useState<boolean>(false);
  // Shared date for both input methods
  const [sharedDate, setSharedDate] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  
  // State to store form quantities
  const [storeQuantities, setStoreQuantities] = useState({
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

  // State to track which input method is active and if data has been processed
  const [inputMethod, setInputMethod] = useState<'none' | 'whatsapp' | 'manual'>('none');
  const [dataProcessed, setDataProcessed] = useState<boolean>(false);

  // Load deliveries from localStorage on component mount
  useEffect(() => {
    const savedDeliveries = localStorage.getItem('deliveries');
    if (savedDeliveries) {
      try {
        setDeliveries(JSON.parse(savedDeliveries));
      } catch (error) {
        console.error('Error loading deliveries from localStorage:', error);
      }
    }
    
    // Load store quantities from localStorage
    const savedStoreQuantities = localStorage.getItem('storeQuantities');
    if (savedStoreQuantities) {
      try {
        setStoreQuantities(JSON.parse(savedStoreQuantities));
      } catch (error) {
        console.error('Error loading store quantities from localStorage:', error);
      }
    }
  }, []);

  // Save deliveries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('deliveries', JSON.stringify(deliveries));
  }, [deliveries]);
  
  // Filter deliveries based on selected date range
  useEffect(() => {
    if (deliveries.length === 0) {
      setFilteredDeliveries([]);
      return;
    }
    
    const today = new Date();
    let filteredData: Delivery[] = [];
    
    switch (dateRangeFilter) {
      case '7days':
        const sevenDaysAgo = subDays(today, 7);
        filteredData = deliveries.filter(delivery => {
          // Normalize the delivery date to avoid timezone issues
          const [year, month, day] = delivery.date.split('-').map(num => parseInt(num));
          const deliveryDate = new Date(year, month - 1, day);
          return isAfter(deliveryDate, sevenDaysAgo) || deliveryDate.toDateString() === sevenDaysAgo.toDateString();
        });
        break;
      case '14days':
        const fourteenDaysAgo = subDays(today, 14);
        filteredData = deliveries.filter(delivery => {
          // Normalize the delivery date to avoid timezone issues
          const [year, month, day] = delivery.date.split('-').map(num => parseInt(num));
          const deliveryDate = new Date(year, month - 1, day);
          return isAfter(deliveryDate, fourteenDaysAgo) || deliveryDate.toDateString() === fourteenDaysAgo.toDateString();
        });
        break;
      case '30days':
        const thirtyDaysAgo = subDays(today, 30);
        filteredData = deliveries.filter(delivery => {
          // Normalize the delivery date to avoid timezone issues
          const [year, month, day] = delivery.date.split('-').map(num => parseInt(num));
          const deliveryDate = new Date(year, month - 1, day);
          return isAfter(deliveryDate, thirtyDaysAgo) || deliveryDate.toDateString() === thirtyDaysAgo.toDateString();
        });
        break;
      case 'custom':
        if (startDate && endDate) {
          // Normalize the start and end dates to avoid timezone issues
          const [startYear, startMonth, startDay] = startDate.split('-').map(num => parseInt(num));
          const [endYear, endMonth, endDay] = endDate.split('-').map(num => parseInt(num));
          
          // Create date objects with explicit year, month, day
          const start = new Date(startYear, startMonth - 1, startDay);
          const end = new Date(endYear, endMonth - 1, endDay);
          // Add one day to end date to include the end date in the range
          end.setDate(end.getDate() + 1);
          
          filteredData = deliveries.filter(delivery => {
            // Normalize the delivery date to avoid timezone issues
            const [year, month, day] = delivery.date.split('-').map(num => parseInt(num));
            const deliveryDate = new Date(year, month - 1, day);
            
            // Check if delivery date is within range (inclusive)
            return (
              (isAfter(deliveryDate, start) || deliveryDate.toDateString() === start.toDateString()) && 
              (isBefore(deliveryDate, end))
            );
          });
        } else {
          filteredData = deliveries;
        }
        break;
      default:
        filteredData = deliveries;
    }
    
    setFilteredDeliveries(filteredData);
  }, [deliveries, dateRangeFilter, startDate, endDate]);
  
  // Save store quantities to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('storeQuantities', JSON.stringify(storeQuantities));
  }, [storeQuantities]);

  // Function to add a new delivery
  const handleAddDelivery = (delivery: Delivery) => {
    setDeliveries(prevDeliveries => [delivery, ...prevDeliveries]);
    setDataProcessed(true);
    setInputMethod('manual');
  };

  // Function to add multiple deliveries (from WhatsApp parser)
  const handleAddDeliveries = (newDeliveries: Delivery[]) => {
    setDeliveries(prevDeliveries => [...newDeliveries, ...prevDeliveries]);
    setDataProcessed(true);
    setInputMethod('whatsapp');
  };
  
  // Function to update form quantities from WhatsApp parser
  const handleUpdateFormQuantities = (newStoreQuantities: Record<string, number>) => {
    setStoreQuantities(prevQuantities => ({
      ...prevQuantities,
      ...newStoreQuantities
    }));
  };
  
  // Function to handle date range filter change
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDateRangeFilter(value);
    setShowCustomDateRange(value === 'custom');
    
    // Reset custom date range when switching to a predefined range
    if (value !== 'custom') {
      setStartDate('');
      setEndDate('');
    } else {
      // Set default values for custom range (current date and 7 days ago)
      const today = new Date();
      const sevenDaysAgo = subDays(today, 7);
      setEndDate(format(today, 'yyyy-MM-dd'));
      setStartDate(format(sevenDaysAgo, 'yyyy-MM-dd'));
    }
  };
  
  // Function to clear all deliveries
  const handleClearDeliveries = () => {
    if (window.confirm('¿Estás seguro de que deseas limpiar el historial? Esta acción no se puede deshacer.')) {
      setDeliveries([]);
      setFilteredDeliveries([]);
      localStorage.removeItem('deliveries');
    }
  };

  // Function to reset the input method and data processed state
  const handleResetInputState = () => {
    setInputMethod('none');
    setDataProcessed(false);
    // Reset store quantities to prevent duplications
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
    setStoreQuantities(resetQuantities);
  };
  
  // Function to handle shared date changes
  const handleSharedDateChange = (newDate: string) => {
    setSharedDate(newDate);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Seguimiento de Entregas</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <WhatsAppParser 
          onAddDeliveries={handleAddDeliveries} 
          onUpdateFormQuantities={handleUpdateFormQuantities}
          isDisabled={dataProcessed && inputMethod === 'manual'}
          onReset={handleResetInputState}
          existingDeliveries={deliveries}
          sharedDate={sharedDate}
          onSharedDateChange={handleSharedDateChange}
        />
        <DeliveryForm 
          onAddDelivery={handleAddDelivery} 
          storeQuantities={storeQuantities}
          onStoreQuantitiesChange={setStoreQuantities}
          isDisabled={dataProcessed && inputMethod === 'whatsapp'}
          onReset={handleResetInputState}
          existingDeliveries={deliveries}
          sharedDate={sharedDate}
          onSharedDateChange={handleSharedDateChange}
        />
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Historial de Entregas</h2>
        
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="dateRangeFilter" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por fecha:</label>
            <select
              id="dateRangeFilter"
              value={dateRangeFilter}
              onChange={handleDateRangeChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value="7days">Últimos 7 días</option>
              <option value="14days">Últimos 14 días</option>
              <option value="30days">Últimos 30 días</option>
              <option value="custom">Rango Personalizado</option>
            </select>
          </div>
          
          {showCustomDateRange && (
            <>
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio:</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha fin:</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                />
              </div>
            </>
          )}
        </div>
        
        <DeliveryTable deliveries={filteredDeliveries} />
        
        <div className="mt-4 flex gap-4">
          <ExcelExporter deliveries={filteredDeliveries} />
          <button
            onClick={handleClearDeliveries}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}
