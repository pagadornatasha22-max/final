import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import { initializeData } from './data/initialData';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import ManageReviews from './pages/admin/ManageReviews';
import ManageUsers from './pages/admin/ManageUsers';
import CustomizePage from './pages/CustomizePage';
import Navbar from './components/Navbar';

// Initialize data on load
initializeData();

// Valid pages per role so we can validate what was saved
const adminPages = ['admin-dashboard', 'admin-products', 'admin-orders', 'admin-reviews', 'admin-users'];
const customerPages = ['dashboard', 'cart', 'checkout', 'my-orders', 'profile', 'customize'];
const publicPages = ['login', 'register'];

function AppContent() {
  const { currentUser } = useAuth();

  // On first mount, try to restore saved page from localStorage
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const saved = localStorage.getItem('macels_currentPage');
    return saved || 'login';
  });

  const [directOrderProductId, setDirectOrderProductId] = useState<string | null>(() => {
    return localStorage.getItem('macels_directOrderProductId') || null;
  });

  // Track whether we already handled the initial auth-based redirect
  const hasInitialized = useRef(false);
  const prevUserId = useRef<string | null>(null);

  useEffect(() => {
    // Determine if this is a login / logout change vs just a refresh
    const userChanged = currentUser?.id !== prevUserId.current;
    prevUserId.current = currentUser?.id ?? null;

    if (!currentUser) {
      // Logged out – go to login (or keep register if that was saved)
      const saved = localStorage.getItem('macels_currentPage');
      if (saved && publicPages.includes(saved)) {
        setCurrentPage(saved);
      } else {
        setCurrentPage('login');
      }
      hasInitialized.current = true;
      return;
    }

    if (!hasInitialized.current) {
      // First mount after refresh while logged in – try to restore saved page
      const saved = localStorage.getItem('macels_currentPage');
      if (saved) {
        const validPages = currentUser.role === 'admin' ? adminPages : customerPages;
        if (validPages.includes(saved)) {
          setCurrentPage(saved);
          hasInitialized.current = true;
          return;
        }
      }
    }

    if (userChanged) {
      // User just logged in (switched from null / different user) – go to default page
      if (currentUser.role === 'admin') {
        setCurrentPage('admin-dashboard');
      } else {
        setCurrentPage('dashboard');
      }
    }

    hasInitialized.current = true;
  }, [currentUser]);

  // Persist currentPage to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('macels_currentPage', currentPage);
  }, [currentPage]);

  // Persist directOrderProductId to localStorage whenever it changes
  useEffect(() => {
    if (directOrderProductId) {
      localStorage.setItem('macels_directOrderProductId', directOrderProductId);
    } else {
      localStorage.removeItem('macels_directOrderProductId');
    }
  }, [directOrderProductId]);

  // Save scroll position before unload so we can restore it on refresh
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem('macels_scrollY', String(window.scrollY));
    };
    window.addEventListener('beforeunload', saveScroll);
    return () => window.removeEventListener('beforeunload', saveScroll);
  }, []);

  // Restore scroll position once after the first render
  const scrollRestored = useRef(false);
  useEffect(() => {
    if (!scrollRestored.current) {
      const savedY = sessionStorage.getItem('macels_scrollY');
      if (savedY) {
        // Small delay to let the DOM render before scrolling
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedY, 10));
        });
        sessionStorage.removeItem('macels_scrollY');
      }
      scrollRestored.current = true;
    }
  }, [currentPage]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page !== 'checkout') {
      setDirectOrderProductId(null);
    }
    window.scrollTo(0, 0);
  };

  const handleDirectOrder = (productId: string) => {
    setDirectOrderProductId(productId);
    setCurrentPage('checkout');
    window.scrollTo(0, 0);
  };

  // Unauthenticated pages
  if (!currentUser) {
    if (currentPage === 'register') {
      return <RegisterPage onNavigate={handleNavigate} />;
    }
    return <LoginPage onNavigate={handleNavigate} />;
  }

  // Admin pages
  if (currentUser.role === 'admin') {
    return (
      <div className="min-h-screen">
        <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
        {currentPage === 'admin-dashboard' && <AdminDashboard onNavigate={handleNavigate} />}
        {currentPage === 'admin-products' && <ManageProducts />}
        {currentPage === 'admin-orders' && <ManageOrders />}
        {currentPage === 'admin-reviews' && <ManageReviews />}
        {currentPage === 'admin-users' && <ManageUsers />}
      </div>
    );
  }

  // Customer pages
  return (
    <div className="min-h-screen">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      {currentPage === 'dashboard' && (
        <CustomerDashboard onDirectOrder={handleDirectOrder} onNavigate={handleNavigate} />
      )}
      {currentPage === 'cart' && <CartPage onNavigate={handleNavigate} />}
      {currentPage === 'checkout' && (
        <CheckoutPage onNavigate={handleNavigate} directOrderProductId={directOrderProductId} />
      )}
      {currentPage === 'my-orders' && <MyOrdersPage onNavigate={handleNavigate} />}
      {currentPage === 'profile' && <ProfilePage onNavigate={handleNavigate} />}
      {currentPage === 'customize' && <CustomizePage onNavigate={handleNavigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <OrderProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </OrderProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
