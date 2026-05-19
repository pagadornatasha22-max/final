import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShoppingCart } from 'lucide-react';

interface CartPageProps {
  onNavigate: (page: string) => void;
}

export default function CartPage({ onNavigate }: CartPageProps) {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center px-4">
        <div className="text-center animate-fadeIn">
          <div className="w-24 h-24 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={40} className="text-rose-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Your Cart is Empty</h2>
          <p className="text-gray-500 mb-6">Start adding beautiful flowers to your cart!</p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-6 py-3 rounded-xl text-white font-semibold transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}
          >
            Browse Flowers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => onNavigate('dashboard')} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>Shopping Cart</h1>
            <p className="text-gray-500 text-sm">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50 flex gap-4 animate-fadeIn">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate" style={{ fontFamily: "'Playfair Display', serif" }}>{item.product.name}</h3>
                  <p className="text-rose-600 font-bold text-lg mt-1">{formatPrice(item.product.price)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-rose-50 transition-all text-gray-600"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-bold text-gray-700">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-rose-50 transition-all text-gray-600"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="hidden sm:flex items-center">
                  <span className="font-bold text-gray-800 text-lg">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1 mt-2"
            >
              <Trash2 size={14} />
              Clear all items
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-gray-500 truncate mr-2">{item.product.name} x{item.quantity}</span>
                    <span className="text-gray-700 font-medium flex-shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="text-xl font-bold text-rose-600">{formatPrice(getCartTotal())}</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('checkout')}
                className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}
              >
                <ShoppingBag size={18} />
                Proceed to Checkout
              </button>

              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full py-3 rounded-xl text-rose-600 font-semibold flex items-center justify-center gap-2 mt-3 hover:bg-rose-50 transition-all border border-rose-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
