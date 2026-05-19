export interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  contactNumber: string;
  address: string;
  password: string;
  role: 'admin' | 'customer';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'bouquet' | 'dozen' | 'custom';
  description: string;
  image: string;
  inStock: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomArrangement {
  description: string;
  flowerTypes: string[];
  colors: string[];
  style: string;
  occasion: string;
  budgetMin: number;
  budgetMax: number;
  referenceImages: string[];
  additionalNotes: string;
}

export interface Review {
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  contactNumber: string;
  email: string;
  items: CartItem[];
  totalAmount: number;
  pickupDate: string;
  pickupTime: string;
  messageCard: string;
  paymentMethod: string;
  gcashRefNumber?: string;
  gcashReceiptImage?: string;
  paymentStatus?: 'pending' | 'approved' | 'rejected';
  customArrangement?: CustomArrangement;
  isCustomOrder?: boolean;
  review?: Review;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: string;
  updatedAt: string;
}
