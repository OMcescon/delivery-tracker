export interface Store {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  type: 'Chica' | 'Grande';
}

export interface Delivery {
  id: string;
  date: string;
  storeId: string;
  products: DeliveryProduct[];
  notes?: string;
}

export interface DeliveryProduct {
  productId: string;
  quantity: number;
}

export interface DeliverySummary {
  storeId: string;
  storeName: string;
  chicaCount: number;
  grandeCount: number;
  total: number;
}