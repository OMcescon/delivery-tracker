import React from 'react';
import { Delivery } from '../types';
import { stores, products } from '../data';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DeliveryTableProps {
  deliveries: Delivery[];
}

const DeliveryTable: React.FC<DeliveryTableProps> = ({ deliveries }) => {
  // Group deliveries by date
  const deliveriesByDate = deliveries.reduce<Record<string, Delivery[]>>((acc, delivery) => {
    if (!acc[delivery.date]) {
      acc[delivery.date] = [];
    }
    acc[delivery.date].push(delivery);
    return acc;
  }, {});

  // Sort dates (newest first)
  const sortedDates = Object.keys(deliveriesByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const getStoreName = (storeId: string): string => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : 'Unknown Store';
  };

  const getProductQuantity = (delivery: Delivery, productType: 'Chica' | 'Grande'): number => {
    const productId = productType === 'Chica' ? '1' : '2';
    const product = delivery.products.find(p => p.productId === productId);
    return product ? product.quantity : 0;
  };

  const calculateTotal = (delivery: Delivery): number => {
    return delivery.products.reduce((total, product) => {
      return total + product.quantity;
    }, 0);
  };

  return (
    <div 
      className="table-wrapper overflow-x-auto rounded-lg shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg"
    >
      <table className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-primary/10">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider border-b border-gray-300 transition-colors">
              Fecha
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider border-b border-gray-300 transition-colors">
              Tienda
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider border-b border-gray-300 transition-colors">
              Chica
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider border-b border-gray-300 transition-colors">
              Grande
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider border-b border-gray-300 transition-colors">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedDates.length > 0 ? (
            sortedDates.flatMap(date => {
              const dateDeliveries = deliveriesByDate[date];
              // Create date object with explicit year, month, day to avoid timezone issues
              const [year, month, day] = date.split('-').map(num => parseInt(num));
              const dateObj = new Date(year, month - 1, day);
              const formattedDate = format(dateObj, 'yyyy-MM-dd', { locale: es });
              
              // Create a summary for each store
              const storeSummaries = stores.map(store => {
                const storeDeliveries = dateDeliveries.filter(d => d.storeId === store.id);
                
                let chicaTotal = 0;
                let grandeTotal = 0;
                
                storeDeliveries.forEach(delivery => {
                  delivery.products.forEach(product => {
                    if (product.productId === '1') { // Chica
                      chicaTotal += product.quantity;
                    } else if (product.productId === '2') { // Grande
                      grandeTotal += product.quantity;
                    }
                  });
                });
                
                return {
                  storeId: store.id,
                  storeName: store.name,
                  chicaCount: chicaTotal,
                  grandeCount: grandeTotal,
                  total: chicaTotal + grandeTotal
                };
              });
              
              // Calculate daily totals
              const dailyChicaTotal = storeSummaries.reduce((sum, store) => sum + store.chicaCount, 0);
              const dailyGrandeTotal = storeSummaries.reduce((sum, store) => sum + store.grandeCount, 0);
              const dailyTotal = dailyChicaTotal + dailyGrandeTotal;
              
              // Generate rows for this date
              const rows = [];
              
              // Add rows for each store
              storeSummaries.forEach((summary, index) => {
                rows.push(
                  <tr 
                    key={`${date}_${summary.storeId}`}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {index === 0 && (
                      <td rowSpan={storeSummaries.length + 1} className="border border-gray-200 p-3 font-medium text-gray-700 bg-gray-50">
                        {formattedDate}
                      </td>
                    )}
                    <td className="border border-gray-200 p-3 font-medium">{summary.storeName}</td>
                    <td className="border border-gray-200 p-3 text-center">
                      {summary.chicaCount > 0 ? (
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-sm font-medium rounded-full bg-secondary/10 text-secondary">
                          {summary.chicaCount}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="border border-gray-200 p-3 text-center">
                      {summary.grandeCount > 0 ? (
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-sm font-medium rounded-full bg-primary/10 text-primary">
                          {summary.grandeCount}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="border border-gray-200 p-3 text-center font-medium">
                      {summary.total > 0 ? summary.total : <span className="text-gray-400">0</span>}
                    </td>
                  </tr>
                );
              });
              
              // Add daily total row
              rows.push(
                <tr 
                  key={`${date}_total`} 
                  className="totals-row bg-accent/10 font-semibold"
                >
                  <td className="border border-gray-200 p-3 text-accent-hover">Totales Diarios</td>
                  <td className="border border-gray-200 p-3 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full bg-secondary/20 text-secondary-hover">
                      {dailyChicaTotal}
                    </span>
                  </td>
                  <td className="border border-gray-200 p-3 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full bg-primary/20 text-primary-hover">
                      {dailyGrandeTotal}
                    </span>
                  </td>
                  <td className="border border-gray-200 p-3 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full bg-accent/20 text-accent-hover">
                      {dailyTotal}
                    </span>
                  </td>
                </tr>
              );
              
              return rows;
            })
          ) : (
            <tr>
              <td colSpan={5} className="border border-gray-200 p-4 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center py-6">
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium mb-1">
                    No se encontraron entregas
                  </p>
                  <p className="text-sm text-gray-400">
                    Agregue una nueva entrega para comenzar
                  </p>
                </div>
              </td>
            </tr>
          )}

        </tbody>
      </table>
    </div>
  );
};

export default DeliveryTable;