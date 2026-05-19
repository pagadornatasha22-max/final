import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Flower2, ShoppingCart, Package, User, LogOut, Menu, X, Search, LayoutDashboard, Sparkles, MessageCircle } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { currentUser, logout } = useAuth();
  const { getCartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = getCartCount();
  const isAdmin = currentUser?.role === 'admin';

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  const navLink = (page: string, label: string, icon: React.ReactNode, badge?: number) => (
    <button
      onClick={() => { onNavigate(page); setMenuOpen(false); }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${
        currentPage === page
          ? 'bg-rose-100 text-rose-700'
          : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
      }`}
    >
      {icon}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-rose-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'dashboard')} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}>
              <Flower2 size={20} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-rose-800 hidden sm:block" style={{ fontFamily: "'Playfair Display', serif" }}>Macel's</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {isAdmin ? (
              <>
                {navLink('admin-dashboard', 'Dashboard', <LayoutDashboard size={18} />)}
                {navLink('admin-products', 'Products', <Package size={18} />)}
                {navLink('admin-orders', 'Orders', <ShoppingCart size={18} />)}
                {navLink('admin-reviews', 'Reviews', <MessageCircle size={18} />)}
                {navLink('admin-users', 'Users', <User size={18} />)}
              </>
            ) : (
              <>
                {navLink('dashboard', 'Shop', <Search size={18} />)}
                {navLink('customize', 'Customize', <Sparkles size={18} />)}
                {navLink('cart', 'Cart', <ShoppingCart size={18} />, cartCount)}
                {navLink('my-orders', 'My Orders', <Package size={18} />)}
                {navLink('profile', 'Profile', <User size={18} />)}
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                <User size={16} className="text-rose-600" />
              </div>
              <span className="font-medium text-gray-700">{currentUser?.fullName}</span>
              {isAdmin && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">Admin</span>}
            </div>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
            >
              <LogOut size={18} />
            </button>

            {/* Mobile menu button */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600 hover:text-rose-600 rounded-lg">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-rose-100 animate-fadeIn">
            <div className="flex items-center gap-2 px-3 py-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                <User size={16} className="text-rose-600" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">{currentUser?.fullName}</span>
                {isAdmin && <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">Admin</span>}
              </div>
            </div>
            <div className="space-y-1">
              {isAdmin ? (
                <>
                  {navLink('admin-dashboard', 'Dashboard', <LayoutDashboard size={18} />)}
                  {navLink('admin-products', 'Products', <Package size={18} />)}
                  {navLink('admin-orders', 'Orders', <ShoppingCart size={18} />)}
                  {navLink('admin-reviews', 'Reviews', <MessageCircle size={18} />)}
                  {navLink('admin-users', 'Users', <User size={18} />)}
                </>
              ) : (
                <>
                  {navLink('dashboard', 'Shop', <Search size={18} />)}
                  {navLink('customize', 'Customize', <Sparkles size={18} />)}
                  {navLink('cart', 'Cart', <ShoppingCart size={18} />, cartCount)}
                  {navLink('my-orders', 'My Orders', <Package size={18} />)}
                  {navLink('profile', 'Profile', <User size={18} />)}
                </>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
