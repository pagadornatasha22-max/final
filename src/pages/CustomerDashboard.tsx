import { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { Search, ShoppingCart, ShoppingBag, Filter, MapPin, Phone, Star, Sparkles, ArrowRight, Palette, ImageIcon } from 'lucide-react';

interface CustomerDashboardProps {
  onDirectOrder: (productId: string) => void;
  onNavigate: (page: string) => void;
}

export default function CustomerDashboard({ onDirectOrder, onNavigate }: CustomerDashboardProps) {
  const { getProductsByCategory, searchProducts } = useProducts();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const { getAllReviews } = useOrders();
  const allReviews = getAllReviews();

  // Compute average rating across all reviews
  const avgRating = allReviews.length > 0
    ? (allReviews.reduce((sum, r) => sum + r.review.rating, 0) / allReviews.length).toFixed(1)
    : '5.0';
  const totalReviewCount = allReviews.length;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Flowers', emoji: '🌸' },
    { id: 'bouquet', label: 'Bouquets', emoji: '💐' },
    { id: 'dozen', label: 'Dozen Flowers', emoji: '🌹' },
    { id: 'custom', label: 'Custom Arrangements', emoji: '🎨' },
  ];

  const filteredProducts = searchQuery
    ? searchProducts(searchQuery).filter((p) => p.inStock)
    : getProductsByCategory(selectedCategory);

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 1500);
  };

  const formatPrice = (price: number) => {
    return `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  };

  const firstName = currentUser?.fullName?.split(' ')[0] || 'Customer';

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #881337 0%, #be123c 40%, #e11d48 70%, #f43f5e 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 relative z-10">
          <div className="text-white">
            <p className="text-rose-200 text-sm font-medium mb-2">Welcome back, {firstName}! 👋</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              Fresh Flowers,<br />Made with Love
            </h1>
            <p className="text-rose-200 max-w-md text-sm sm:text-base mb-6">
              Discover our beautiful collection of hand-crafted flower arrangements for every special moment.
            </p>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-rose-200">
              <span className="flex items-center gap-1"><MapPin size={14} /> Hinunangan, So. Leyte</span>
              <span className="flex items-center gap-1"><Phone size={14} /> Order Online</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value) setSelectedCategory('all'); }}
                placeholder="Search flowers, bouquets, arrangements..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-gray-700 shadow-lg border-0 focus:ring-2 focus:ring-rose-300 text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-medium">
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <Filter size={16} className="text-gray-400 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id && !searchQuery
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                  : 'bg-white text-gray-600 hover:bg-rose-50 hover:text-rose-600 border border-gray-200'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Customize Your Own Banner */}
        <div className="mb-8 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 rounded-2xl overflow-hidden shadow-lg relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white" />
            <div className="absolute -bottom-5 -left-5 w-36 h-36 rounded-full bg-white" />
          </div>
          <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={20} className="text-yellow-300" />
                <span className="text-xs font-bold text-pink-200 uppercase tracking-wider">New Feature</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Design Your Own Arrangement
              </h3>
              <p className="text-pink-100 text-sm sm:text-base leading-relaxed mb-4">
                Can't find what you're looking for? Create a custom flower arrangement! Choose your flowers, colors, style, and even upload sample photos for our florist to follow.
              </p>
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Palette size={14} /> Pick Colors & Flowers
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <ImageIcon size={14} /> Upload Sample Photos
                </span>
              </div>
              <button
                onClick={() => onNavigate('customize')}
                className="px-6 py-3 bg-white text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-all shadow-lg flex items-center gap-2 text-sm"
              >
                <Sparkles size={16} />
                Start Customizing
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="hidden sm:flex flex-col items-center gap-2 text-center">
              <div className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-6xl">💐</span>
              </div>
              <span className="text-xs text-pink-200 font-medium">Your Design,<br/>Our Craft</span>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-6 flex items-center gap-2 text-gray-500 text-sm">
            <Search size={16} />
            <span>Showing {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for "<strong className="text-gray-700">{searchQuery}</strong>"</span>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌷</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>No flowers found</h3>
            <p className="text-gray-500">Try searching with different keywords or browse our categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-rose-50 group animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      product.category === 'bouquet' ? 'bg-pink-100 text-pink-700' :
                      product.category === 'dozen' ? 'bg-red-100 text-red-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {product.category === 'bouquet' ? '💐 Bouquet' :
                       product.category === 'dozen' ? '🌹 Dozen' :
                       '🎨 Custom'}
                    </span>
                  </div>
                  {totalReviewCount > 0 && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-gray-700">{avgRating}</span>
                      <span className="text-xs text-gray-400">({totalReviewCount})</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 text-lg mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-rose-600">{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        addedToCart === product.id
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                      }`}
                    >
                      <ShoppingCart size={16} />
                      {addedToCart === product.id ? 'Added! ✓' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => onDirectOrder(product.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}
                    >
                      <ShoppingBag size={16} />
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Customer Reviews Section */}
        {allReviews.length > 0 && (
          <div className="mt-16 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>💬 What Our Customers Say</h2>
                <p className="text-gray-500 text-sm mt-1">
                  <span className="font-bold text-amber-600">{avgRating}</span> average rating from {totalReviewCount} review{totalReviewCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={20} className={s <= Math.round(parseFloat(avgRating)) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allReviews.slice(0, 6).map(({ order: o, review: r }) => (
                <div key={o.id} className="bg-white rounded-2xl p-5 shadow-sm border border-rose-50 hover:shadow-md transition-all">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={16} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  {r.comment ? (
                    <p className="text-sm text-gray-700 mb-3 italic leading-relaxed">"{r.comment}"</p>
                  ) : (
                    <p className="text-sm text-gray-400 mb-3 italic">No comment</p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-600">{o.customerName}</span>
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shop Info Footer */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm border border-rose-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">🌸</div>
              <h4 className="font-bold text-gray-800 mb-1">Fresh Daily</h4>
              <p className="text-gray-500 text-sm">All flowers are freshly picked and arranged daily</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📦</div>
              <h4 className="font-bold text-gray-800 mb-1">Easy Pickup</h4>
              <p className="text-gray-500 text-sm">Order online and pick up at our shop in Hinunangan</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💝</div>
              <h4 className="font-bold text-gray-800 mb-1">Made with Love</h4>
              <p className="text-gray-500 text-sm">Each arrangement is carefully crafted with care</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
