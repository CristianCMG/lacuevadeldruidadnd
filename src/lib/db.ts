import fs from 'fs';
import path from 'path';

export interface Generation {
  id: string;
  prompt: string;
  imageUrl?: string;
  modelUrl: string;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Order {
  code: string;
  purchaseDate: string;
  credits: number;
  status: 'PENDING' | 'ACTIVE' | 'PRINTING' | 'REFUNDED' | 'EXPIRED';
  paymentId: string;
  generations: Generation[];
}

const DB_PATH = path.join(process.cwd(), 'src/data/orders.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
}

export const getOrders = (): Order[] => {
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
};

export const getOrderByCode = (code: string): Order | undefined => {
  const orders = getOrders();
  return orders.find((o) => o.code === code);
};

export const updateOrder = (updatedOrder: Order) => {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.code === updatedOrder.code);
  
  if (index !== -1) {
    orders[index] = updatedOrder;
    fs.writeFileSync(DB_PATH, JSON.stringify(orders, null, 2));
    return true;
  }
  return false;
};

export const createOrder = (order: Order) => {
  const orders = getOrders();
  orders.push(order);
  fs.writeFileSync(DB_PATH, JSON.stringify(orders, null, 2));
};
