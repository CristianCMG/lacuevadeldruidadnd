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

const DB_PATH = process.env.DATA_STORAGE_PATH 
  ? path.join(process.env.DATA_STORAGE_PATH, 'orders.json')
  : path.join(process.cwd(), process.env.NODE_ENV === 'production' ? 'data' : 'src/data', 'orders.json');

// Ensure directory exists in production
if (process.env.DATA_STORAGE_PATH && !fs.existsSync(process.env.DATA_STORAGE_PATH)) {
  try {
    fs.mkdirSync(process.env.DATA_STORAGE_PATH, { recursive: true });
  } catch (error) {
    console.error('Failed to create storage directory:', error);
  }
}

// Initialize DB if not exists
try {
  if (!fs.existsSync(DB_PATH)) {
    // If the directory doesn't exist (and mkdir failed or wasn't called), this might fail
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
       fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
  }
} catch (error) {
  console.warn('Could not initialize DB file (this is expected during build time if env vars are missing):', error);
}

export const getOrders = (): Order[] => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return [];
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading orders DB:', error);
    return [];
  }
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
