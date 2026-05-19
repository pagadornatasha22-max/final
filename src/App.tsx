import React, { useState, useEffect } from 'react';
import { User, Product, Order, CartItem, PageView, CustomerTab, AdminTab, SelectedOptions, OrderStatus, Review } from './types';
import {
  getStoredUsers, saveStoredUsers,
  getStoredCurrentUser, saveStoredCurrentUser,
  getStoredProducts, saveStoredProducts,
  getStoredOrders, saveStoredOrders,
  getStoredCart, saveStoredCart,
  getStoredReviews, saveStoredReviews,
  getStoredPageView, saveStoredPageView,
  getStoredCustomerTab, saveStoredCustomerTab,
  getStoredAdminTab, saveStoredAdminTab
} from './utils/storage';

import { Header } from './components/common/Header';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

export const App: React.FC = () => {
  // Master state initialized from storage
  const [users, setUsers] = useState<User[]>(getStoredUsers);
  const initialUser = getStoredCurrentUser();
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [orders, setOrders] = useState<Order[]>(getStoredOrders);
  const [cart, setCart] = useState<CartItem[]>(getStoredCart);
  const [reviews, setReviews] = useState<Review[]>(getStoredReviews);

  // Navigation state initialized from storage so user remains where they were on reload
  const [pageView, setPageView] = useState<PageView>(() => {
    if (!initialUser) return 'login';
    return getStoredPageView(initialUser.role === 'admin' ? 'admin-dash' : 'customer-dash');
  });
  const [customerTab, setCustomerTab] = useState<CustomerTab | 'checkout'>(() => getStoredCustomerTab('shop'));
  const [adminTab, setAdminTab] = useState<AdminTab>(() => getStoredAdminTab('overview'));

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const newToast: ToastMessage = { id: `toast-${Date.now()}`, type, message };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync data to storage when state changes
  useEffect(() => { saveStoredUsers(users); }, [users]);
  useEffect(() => { saveStoredCurrentUser(currentUser); }, [currentUser]);
  useEffect(() => { saveStoredProducts(products); }, [products]);
  useEffect(() => { saveStoredOrders(orders); }, [orders]);
  useEffect(() => { saveStoredCart(cart); }, [cart]);
  useEffect(() => { saveStoredReviews(reviews); }, [reviews]);

  // Sync navigation state to storage when tabs or views change
  useEffect(() => { saveStoredPageView(pageView); }, [pageView]);
  useEffect(() => { saveStoredCustomerTab(customerTab); }, [customerTab]);
  useEffect(() => { saveStoredAdminTab(adminTab); }, [adminTab]);

  // Load live data from Aiven MySQL backend
  useEffect(() => {
    const loadLiveData = async () => {
      try {
        // 1. Fetch live products from database
        const prodRes = await fetch('/api/products');
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: Number(p.price),
            image: p.image,
            description: p.description,
            rating: Number(p.rating),
            isAvailable: Boolean(p.is_available),
            featured: Boolean(p.featured)
          })));
        }

        // 2. Fetch live users from database
        const usersRes = await fetch('/api/users');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.map((u: any) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            fullName: u.full_name,
            contactNumber: u.contact_number,
            address: u.address,
            role: u.role
          })));
        }

        // 3. Fetch live orders from database (along with their items)
        const ordersRes = await fetch('/api/orders');
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          const fullOrdersList = await Promise.all(ordersData.map(async (ord: any) => {
            const itemsRes = await fetch(`/api/orders/${ord.id}`);
            if (itemsRes.ok) {
              const fullOrd = await itemsRes.json();
              return {
                id: fullOrd.id,
                orderNumber: fullOrd.order_number,
                customerId: fullOrd.customer_id,
                customerName: fullOrd.customer_name,
                contactNumber: fullOrd.contact_number,
                email: fullOrd.email,
                pickupDateTime: fullOrd.pickup_date_time,
                optionalMessageCard: fullOrd.optional_message_card,
                paymentMethod: fullOrd.payment_method,
                paymentReference: fullOrd.payment_reference,
                paymentReceiptPhoto: fullOrd.payment_receipt_photo,
                totalAmount: Number(fullOrd.total_amount),
                status: fullOrd.status,
                createdAt: fullOrd.created_at,
                items: (fullOrd.items || []).map((it: any) => ({
                  id: it.id,
                  product: {
                    id: it.product_id,
                    name: it.product_name,
                    price: Number(it.unit_price),
                    image: it.sample_image || '',
                    description: '',
                    category: 'bouquets',
                    isAvailable: true
                  },
                  quantity: it.quantity,
                  customNotes: it.custom_notes,
                  selectedOptions: {
                    wrapper: it.wrapper_option,
                    ribbon: it.ribbon_option,
                    sampleImage: it.sample_image
                  },
                  itemTotal: Number(it.item_total)
                }))
              };
            }
            return {
              id: ord.id,
              orderNumber: ord.order_number,
              customerId: ord.customer_id,
              customerName: ord.customer_name,
              contactNumber: ord.contact_number,
              email: ord.email,
              pickupDateTime: ord.pickup_date_time,
              optionalMessageCard: ord.optional_message_card,
              paymentMethod: ord.payment_method,
              paymentReference: ord.payment_reference,
              paymentReceiptPhoto: ord.payment_receipt_photo,
              totalAmount: Number(ord.total_amount),
              status: ord.status,
              createdAt: ord.created_at,
              items: []
            };
          }));
          setOrders(fullOrdersList);
        }

        // 4. Fetch live reviews from database
        const reviewsRes = await fetch('/api/reviews');
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.map((r: any) => ({
            id: r.id,
            productId: r.product_id,
            customerId: r.customer_id,
            customerName: r.customer_name,
            rating: Number(r.rating),
            comment: r.comment,
            createdAt: r.created_at
          })));
        }
      } catch (error) {
        console.warn("Using simulated localStorage mode - database server is offline.", error);
      }
    };
    loadLiveData();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setPageView('admin-dash');
      setAdminTab('overview');
    } else {
      setPageView('customer-dash');
      setCustomerTab('shop');
    }
  };

  const handleRegisterSuccess = async (newUser: User) => {
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          password_hash: newUser.password,
          full_name: newUser.fullName,
          contact_number: newUser.contactNumber,
          address: newUser.address,
          role: newUser.role
        })
      });
      addToast('success', 'Account registered in cloud database successfully!');
    } catch (err) {
      console.warn("Could not save to remote database. Saved in local memory instead.", err);
    }
    
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setPageView('customer-dash');
    setCustomerTab('shop');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    setPageView('login');
    addToast('info', 'You have been logged out.');
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1, customNotes?: string, selectedOptions?: SelectedOptions) => {
    if (!currentUser) {
      addToast('info', 'Please log in or register to add items to your cart.');
      setPageView('login');
      return;
    }

    setCart((prev) => {
      // Check if exact same item options exist
      const existingIdx = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.customNotes === customNotes &&
          JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
      );

      if (existingIdx !== -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          itemTotal: newQty * product.price,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: `ci-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          product,
          quantity,
          customNotes,
          selectedOptions,
          itemTotal: quantity * product.price,
        };
        return [...prev, newItem];
      }
    });
  };

  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0
              ? { ...item, quantity: newQty, itemTotal: newQty * item.product.price }
              : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  // Order Operations
  const handleConfirmOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt'>): Order => {
    const orderId = `ord-${Date.now()}`;
    const orderNumber = `MFS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      orderNumber,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    // Save order and order items directly to Aiven MySQL cloud database
    const saveOrderToDatabase = async () => {
      try {
        const orderRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: orderId,
            order_number: orderNumber,
            customer_id: newOrder.customerId,
            customer_name: newOrder.customerName,
            contact_number: newOrder.contactNumber,
            email: newOrder.email,
            pickup_date_time: newOrder.pickupDateTime.replace('T', ' '),
            optional_message_card: newOrder.optionalMessageCard || null,
            payment_method: newOrder.paymentMethod,
            payment_reference: newOrder.paymentReference || null,
            payment_receipt_photo: newOrder.paymentReceiptPhoto || null,
            total_amount: newOrder.totalAmount,
            status: newOrder.status
          })
        });

        if (orderRes.ok) {
          const orderItemsPayload = newOrder.items.map((item) => ({
            id: item.id,
            order_id: orderId,
            product_id: item.product.id,
            product_name: item.product.name,
            unit_price: item.product.price,
            quantity: item.quantity,
            wrapper_option: item.selectedOptions?.wrapper || null,
            ribbon_option: item.selectedOptions?.ribbon || null,
            sample_image: item.selectedOptions?.sampleImage || null,
            custom_notes: item.customNotes || null,
            item_total: item.itemTotal
          }));

          await fetch('/api/order-items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: orderItemsPayload })
          });

          addToast('success', 'Checkout recorded successfully in Aiven cloud database!');
        } else {
          console.error("Order server response failed:", await orderRes.text());
        }
      } catch (err) {
        console.warn("Database offline. Placed order in local simulation.", err);
      }
    };
    saveOrderToDatabase();

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]); // Clear cart upon successful order
    return newOrder;
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.warn("Could not sync status update to Aiven DB.", err);
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // User updates
  const handleUpdateUser = async (updatedUser: User) => {
    try {
      await fetch(`/api/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: updatedUser.username,
          email: updatedUser.email,
          full_name: updatedUser.fullName,
          contact_number: updatedUser.contactNumber,
          address: updatedUser.address,
          role: updatedUser.role
        })
      });
    } catch (err) {
      console.warn("Could not sync user update to Aiven DB.", err);
    }
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn("Could not delete user from Aiven DB.", err);
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Product Inventory updates
  const handleAddProduct = async (newProd: Omit<Product, 'id'>) => {
    const id = `p-${Date.now()}`;
    const created: Product = {
      ...newProd,
      id,
    };
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: created.name,
          category: created.category,
          price: created.price,
          image: created.image,
          description: created.description,
          rating: created.rating,
          is_available: created.isAvailable,
          featured: created.featured
        })
      });
    } catch (err) {
      console.warn("Could not add product to Aiven DB.", err);
    }
    setProducts((prev) => [created, ...prev]);
  };

  const handleEditProduct = async (updatedProd: Product) => {
    try {
      await fetch(`/api/products/${updatedProd.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedProd.name,
          category: updatedProd.category,
          price: updatedProd.price,
          image: updatedProd.image,
          description: updatedProd.description,
          rating: updatedProd.rating,
          is_available: updatedProd.isAvailable,
          featured: updatedProd.featured
        })
      });
    } catch (err) {
      console.warn("Could not update product in Aiven DB.", err);
    }
    setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn("Could not delete product from Aiven DB.", err);
    }
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleAddReview = async (productId: string, rating: number, comment: string) => {
    if (!currentUser) return;
    const reviewId = `rev-${Date.now()}`;
    const newRev: Review = {
      id: reviewId,
      productId,
      customerId: currentUser.id,
      customerName: currentUser.fullName,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reviewId,
          product_id: productId,
          customer_id: currentUser.id,
          customer_name: currentUser.fullName,
          rating,
          comment
        })
      });
    } catch (err) {
      console.warn("Could not write review to Aiven DB.", err);
    }

    setReviews((prev) => [newRev, ...prev]);

    // Also update product rating average on the product object
    setProducts((prevProd) => prevProd.map((p) => {
      if (p.id === productId) {
        const prodRevs = [...reviews.filter((r) => r.productId === p.id), newRev];
        const newAvg = Number((prodRevs.reduce((s, r) => s + r.rating, 0) / prodRevs.length).toFixed(1));
        return { ...p, rating: newAvg };
      }
      return p;
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] text-stone-900 font-sans selection:bg-rose-100 selection:text-rose-900">
      
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Global Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        cart={cart}
        currentCustomerTab={customerTab === 'checkout' ? 'cart' : customerTab}
        setCustomerTab={(tab) => {
          if (!currentUser) {
            setPageView('login');
            addToast('info', 'Please log in to access the customer dashboard.');
            return;
          }
          setPageView('customer-dash');
          setCustomerTab(tab);
        }}
        currentAdminTab={adminTab}
        setAdminTab={(tab) => {
          setPageView('admin-dash');
          setAdminTab(tab);
        }}
        onGoToLogin={() => setPageView('login')}
      />

      {/* Page Content */}
      <main className="flex-1">
        {pageView === 'login' && (
          <Login
            users={users}
            onLoginSuccess={handleLoginSuccess}
            onNavigate={setPageView}
            addToast={addToast}
          />
        )}

        {pageView === 'register' && (
          <Register
            users={users}
            onRegisterSuccess={handleRegisterSuccess}
            onNavigate={setPageView}
            addToast={addToast}
          />
        )}

        {pageView === 'customer-dash' && currentUser && currentUser.role === 'customer' && (
          <CustomerDashboard
            currentUser={currentUser}
            products={products}
            orders={orders}
            reviews={reviews}
            cart={cart}
            currentTab={customerTab}
            setCustomerTab={setCustomerTab}
            onAddToCart={handleAddToCart}
            onUpdateCartQuantity={handleUpdateCartQuantity}
            onRemoveCartItem={handleRemoveCartItem}
            onConfirmOrder={handleConfirmOrder}
            onUpdateUser={handleUpdateUser}
            onAddReview={handleAddReview}
            addToast={addToast}
          />
        )}

        {pageView === 'admin-dash' && currentUser && currentUser.role === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            users={users}
            orders={orders}
            products={products}
            reviews={reviews}
            currentTab={adminTab}
            setAdminTab={setAdminTab}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            addToast={addToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-serif font-bold text-white tracking-tight">
              Macel's <span className="text-rose-500">Flower Shop</span>
            </h3>
            <p className="text-xs text-stone-400">
              📍 Purok E, Brgy Canipaan, Hinunangan, Southern Leyte, Philippines
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-stone-300 font-medium">
            <span>📞 0917-123-4567</span>
            <span>✉️ macel.flowershop@gmail.com</span>
            <span>⏰ Daily 8:00 AM - 6:00 PM</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-stone-800/80 text-center text-xs text-stone-500">
          <p>&copy; 2026 Macel's Flower Shop Web-Based Ordering System. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};
export default App;
