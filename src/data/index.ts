import { Store, Product, Delivery } from '../types';

export const stores: Store[] = [
  { id: '1', name: 'Madre' },
  { id: '2', name: 'Mutualista' },
  { id: '3', name: 'Noemis Villa' },
  { id: '4', name: 'Luisin Villa' },
  { id: '5', name: 'Trompillo Chico' },
  { id: '6', name: 'Trompillo Grande' },
];

export const products: Product[] = [
  { id: '1', name: 'Torta Chica', type: 'Chica' },
  { id: '2', name: 'Torta Grande', type: 'Grande' },
];

// Initial empty array for deliveries
export const deliveries: Delivery[] = [];

// Helper function to generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};