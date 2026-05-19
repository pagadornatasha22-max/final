import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { Package, ShoppingBag, Users, TrendingUp, Clock, ChefHat, Truck, ArrowRight, Sparkles, Star, MessageCircle } from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { orders, getAllOrders, getTotalSales, getAllReviews } = useOrders();
  const { products } = useProducts();
  const { getAllCustomers } = useAuth();

  const allOrders = getAllOrders();
  const allReviews = getAllReviews();
  const totalSales = getTotalSales();
  const customers = getAllCustomers();
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const preparingOrders = orders.filter((o) => o.status === 'preparing').length;
  const readyOrders = orders.filter((o) => o.status === 'ready').length;
  const formatPrice = (price: number) => `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const recentOrders = allOrders.slice(0, 5);

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: <ShoppingBag size={24} />, color: 'from-rose-500 to-pink-500', bgLight: 'bg-rose-50' },
    { label: 'Total Sales', value: formatPrice(totalSales), icon: <TrendingUp size={24} />, color: 'from-emerald-500 to-teal-500', bgLight: 'bg-emerald-50' },
    { label: 'Customers', value: customers.length, icon: <Users size={24} />, color: 'from-blue-500 to-indigo-500', bgLight: 'bg-blue-50' },
    { label: 'Products', value: products.length, icon: <Package size={24} />, color: 'from-amber-500 to-orange-500', bgLight: 'bg-amber-50' },
  ];

  const customOrders = orders.filter((o) => o.isCustomOrder).length;

  const statusCards = [
    { label: 'Pending', value: pendingOrders, icon: <Clock size={20} />, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'Preparing', value: preparingOrders, icon: <ChefHat size={20} />, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Ready', value: readyOrders, icon: <Truck size={20} />, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'Custom', value: customOrders, icon: <Sparkles size={20} />, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening at Macel's Flower Shop.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-rose-50 animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statusCards.map((card, i) => (
            <div key={i} className={`rounded-xl p-4 border flex items-center gap-3 ${card.color}`}>
              {card.icon}
              <div>
                <p className="text-xl font-bold">{card.value}</p>
                <p className="text-xs font-medium">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-rose-50 overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Recent Orders</h3>
              <button onClick={() => onNavigate('admin-orders')} className="text-rose-600 text-sm font-medium flex items-center gap-1 hover:text-rose-700">
                View All <ArrowRight size={14} />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No orders yet</div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-gray-800 text-sm">{order.orderNumber}</p>
                        {order.isCustomOrder && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">✨ Custom</span>}
                      </div>
                      <p className="text-xs text-gray-400">{order.customerName} · {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-rose-600 text-sm">{order.isCustomOrder && order.customArrangement ? `${formatPrice(order.customArrangement.budgetMin)}+` : formatPrice(order.totalAmount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'ready' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-rose-50 p-6">
              <h3 className="font-bold text-gray-800 text-lg mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => onNavigate('admin-products')}
                  className="w-full p-4 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-all flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                    <Package size={20} className="text-pink-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Manage Products</p>
                    <p className="text-xs text-gray-500">Add, edit, or remove flower products</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 ml-auto" />
                </button>
                <button
                  onClick={() => onNavigate('admin-orders')}
                  className="w-full p-4 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-all flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <ShoppingBag size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Manage Orders</p>
                    <p className="text-xs text-gray-500">View and update order statuses</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 ml-auto" />
                </button>
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="bg-white rounded-2xl shadow-sm border border-rose-50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  <MessageCircle size={20} className="text-amber-500" />
                  Customer Reviews
                </h3>
                <div className="flex items-center gap-2">
                  {allReviews.length > 0 && (
                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-amber-700">
                        {(allReviews.reduce((sum, r) => sum + r.review.rating, 0) / allReviews.length).toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400">({allReviews.length})</span>
                    </div>
                  )}
                  <button onClick={() => onNavigate('admin-reviews')} className="text-amber-600 text-sm font-medium flex items-center gap-1 hover:text-amber-700">
                    View All <ArrowRight size={14} />
                  </button>
                </div>
              </div>
              {allReviews.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No reviews yet</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {allReviews.slice(0, 5).map(({ order: o, review: r }) => (
                    <div key={o.id} className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700">{o.customerName}</span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={12} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="text-xs text-gray-600 italic">"{r.comment}"</p>}
                      <p className="text-[10px] text-gray-400 mt-1">{o.orderNumber} · {new Date(r.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shop Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-rose-50 p-6">
              <h3 className="font-bold text-gray-800 text-lg mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>🌸 Shop Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Name:</strong> Macel's Flower Shop</p>
                <p><strong>Location:</strong> Purok E, Brgy. Canipaan, Hinunangan, Southern Leyte</p>
                <p><strong>Hours:</strong> 8:00 AM - 5:00 PM</p>
                <p><strong>Status:</strong> <span className="text-emerald-600 font-bold">Open</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
