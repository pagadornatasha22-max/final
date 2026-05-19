import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, Review } from '../types';

interface OrderContextType {
  orders: Order[];
  isDatabaseConnected: boolean;
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'>) => Order | Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: NonNullable<Order['paymentStatus']>) => void;
  addReview: (orderId: string, review: Review) => void;
  refreshOrders: () => void;
  getOrdersByCustomer: (customerId: string) => Order[];
  getAllOrders: () => Order[];
  getAllReviews: () => { order: Order; review: Review }[];
  getTotalSales: () => number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);
  const apiUrl = (import.meta as any).env?.VITE_API_URL as string | undefined;

  useEffect(() => {
    refreshOrders();
  }, [apiUrl]);

  const refreshOrders = () => {
    if (apiUrl) {
      void (async () => {
        try {
          const response = await fetch(`${apiUrl}/api/orders`);
          if (!response.ok) throw new Error('Failed to load orders from database');
          const data: Order[] = await response.json();
          setOrders(data);
          setIsDatabaseConnected(true);
          localStorage.setItem('macels_orders', JSON.stringify(data));
        } catch (error) {
          console.warn('Using localStorage fallback for orders:', error);
          const saved = JSON.parse(localStorage.getItem('macels_orders') || '[]');
          setOrders(saved);
          setIsDatabaseConnected(false);
        }
      })();
      return;
    }

    const saved = JSON.parse(localStorage.getItem('macels_orders') || '[]');
    setOrders(saved);
    setIsDatabaseConnected(false);
  };

  const saveOrders = (items: Order[]) => {
    localStorage.setItem('macels_orders', JSON.stringify(items));
    setOrders(items);
  };

  const generateOrderNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `MFS-${year}${month}${day}-${rand}`;
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'>) => {
    if (apiUrl) {
      return (async () => {
        const response = await fetch(`${apiUrl}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
        if (!response.ok) throw new Error('Failed to create order in database');
        const newOrder: Order = await response.json();
        setOrders((prev) => [newOrder, ...prev]);
        return newOrder;
      })();
    }

    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
      orderNumber: generateOrderNumber(),
      paymentStatus: orderData.paymentStatus || 'pending',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...orders, newOrder];
    saveOrders(updated);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    if (apiUrl) {
      void (async () => {
        const response = await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        if (response.ok) refreshOrders();
      })();
      return;
    }

    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
    );
    saveOrders(updated);
  };

  const updatePaymentStatus = (orderId: string, paymentStatus: NonNullable<Order['paymentStatus']>) => {
    if (apiUrl) {
      void (async () => {
        const response = await fetch(`${apiUrl}/api/orders/${orderId}/payment-status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentStatus }),
        });
        if (response.ok) refreshOrders();
      })();
      return;
    }

    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, paymentStatus, updatedAt: new Date().toISOString() } : o
    );
    saveOrders(updated);
  };

  const addReview = (orderId: string, review: Review) => {
    if (apiUrl) {
      void (async () => {
        const response = await fetch(`${apiUrl}/api/orders/${orderId}/review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(review),
        });
        if (response.ok) refreshOrders();
      })();
      return;
    }

    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, review, updatedAt: new Date().toISOString() } : o
    );
    saveOrders(updated);
  };

  const getOrdersByCustomer = (customerId: string) => {
    return orders.filter((o) => o.customerId === customerId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getAllOrders = () => {
    return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getAllReviews = () => {
    return orders
      .filter((o) => o.review)
      .map((o) => ({ order: o, review: o.review! }))
      .sort((a, b) => new Date(b.review.createdAt).getTime() - new Date(a.review.createdAt).getTime());
  };

  const getTotalSales = () => {
    return orders.filter((o) => o.status === 'completed').reduce((total, o) => total + o.totalAmount, 0);
  };

  return (
    <OrderContext.Provider value={{ orders, isDatabaseConnected, createOrder, updateOrderStatus, updatePaymentStatus, addReview, refreshOrders, getOrdersByCustomer, getAllOrders, getAllReviews, getTotalSales }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within OrderProvider');
  return context;
}
