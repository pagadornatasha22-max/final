import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';

interface ProductContextType {
  products: Product[];
  isDatabaseConnected: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  refreshProducts: () => void;
  getProductsByCategory: (category: string) => Product[];
  searchProducts: (query: string) => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);
  const apiUrl = (import.meta as any).env?.VITE_API_URL as string | undefined;

  useEffect(() => {
    refreshProducts();
  }, [apiUrl]);

  const refreshProducts = () => {
    if (apiUrl) {
      void (async () => {
        try {
          const response = await fetch(`${apiUrl}/api/products`);
          if (!response.ok) throw new Error('Failed to load products from database');
          const data: Product[] = await response.json();
          setProducts(data);
          setIsDatabaseConnected(true);
          localStorage.setItem('macels_products', JSON.stringify(data));
        } catch (error) {
          console.warn('Using localStorage fallback for products:', error);
          const saved = JSON.parse(localStorage.getItem('macels_products') || '[]');
          setProducts(saved);
          setIsDatabaseConnected(false);
        }
      })();
      return;
    }

    const saved = JSON.parse(localStorage.getItem('macels_products') || '[]');
    setProducts(saved);
    setIsDatabaseConnected(false);
  };

  const saveProducts = (items: Product[]) => {
    localStorage.setItem('macels_products', JSON.stringify(items));
    setProducts(items);
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    if (apiUrl) {
      void (async () => {
        const response = await fetch(`${apiUrl}/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        if (response.ok) refreshProducts();
      })();
      return;
    }

    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...products, newProduct];
    saveProducts(updated);
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    if (apiUrl) {
      const existing = products.find((p) => p.id === id);
      if (!existing) return;
      void (async () => {
        const response = await fetch(`${apiUrl}/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...existing, ...data }),
        });
        if (response.ok) refreshProducts();
      })();
      return;
    }

    const updated = products.map((p) => (p.id === id ? { ...p, ...data } : p));
    saveProducts(updated);
  };

  const deleteProduct = (id: string) => {
    if (apiUrl) {
      void (async () => {
        const response = await fetch(`${apiUrl}/api/products/${id}`, { method: 'DELETE' });
        if (response.ok) refreshProducts();
      })();
      return;
    }

    const updated = products.filter((p) => p.id !== id);
    saveProducts(updated);
  };

  const getProductsByCategory = (category: string) => {
    if (category === 'all') return products.filter((p) => p.inStock);
    return products.filter((p) => p.category === category && p.inStock);
  };

  const searchProducts = (query: string) => {
    const lower = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower)
    );
  };

  return (
    <ProductContext.Provider value={{ products, isDatabaseConnected, addProduct, updateProduct, deleteProduct, refreshProducts, getProductsByCategory, searchProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within ProductProvider');
  return context;
}
