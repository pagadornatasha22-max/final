import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { Package, Clock, ChefHat, CheckCircle2, Truck, ArrowLeft, X, Hash, ImageIcon, Sparkles, Palette, Flower2, Star, Send, MessageCircle, AlertTriangle } from 'lucide-react';

interface MyOrdersPageProps {
  onNavigate: (page: string) => void;
}

export default function MyOrdersPage({ onNavigate }: MyOrdersPageProps) {
  const { currentUser } = useAuth();
  const { getOrdersByCustomer, addReview } = useOrders();
  const orders = currentUser ? getOrdersByCustomer(currentUser.id) : [];
  const [viewImage, setViewImage] = useState<{ src: string; title: string } | null>(null);
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  const formatPrice = (price: number) => `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: <Clock size={14} />, step: 1 };
      case 'preparing': return { label: 'Preparing', color: 'bg-blue-100 text-blue-700', icon: <ChefHat size={14} />, step: 2 };
      case 'ready': return { label: 'Ready for Pickup', color: 'bg-emerald-100 text-emerald-700', icon: <Truck size={14} />, step: 3 };
      case 'completed': return { label: 'Completed', color: 'bg-gray-100 text-gray-700', icon: <CheckCircle2 size={14} />, step: 4 };
      default: return { label: status, color: 'bg-gray-100 text-gray-700', icon: <Clock size={14} />, step: 0 };
    }
  };

  const getPaymentStatusConfig = (status?: string) => {
    switch (status) {
      case 'approved': return { label: 'Payment Approved', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={14} /> };
      case 'rejected': return { label: 'Payment Rejected', color: 'bg-red-100 text-red-700', icon: <X size={14} /> };
      default: return { label: 'Payment Pending Admin Review', color: 'bg-amber-100 text-amber-700', icon: <AlertTriangle size={14} /> };
    }
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center px-4">
        <div className="text-center animate-fadeIn">
          <div className="w-24 h-24 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-rose-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>No Orders Yet</h2>
          <p className="text-gray-500 mb-6">Start shopping for beautiful flowers!</p>
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
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => onNavigate('dashboard')} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>My Orders</h1>
            <p className="text-gray-500 text-sm">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Image Viewer Modal */}
        {viewImage && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setViewImage(null)}>
            <div className="relative max-w-lg w-full animate-slideUp" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setViewImage(null)} className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-700 z-10">
                <X size={18} />
              </button>
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                  <ImageIcon size={16} className="text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">{viewImage.title}</span>
                </div>
                <div className="p-4 flex justify-center bg-gray-50">
                  <img src={viewImage.src} alt={viewImage.title} className="max-h-[70vh] object-contain rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const ca = order.customArrangement;
            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-rose-50 overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="p-5 border-b border-gray-50 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-gray-800 text-lg tracking-wide">{order.orderNumber}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                      {order.isCustomOrder && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 flex items-center gap-1">
                          <Sparkles size={12} />
                          Custom Order
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-rose-600">
                      {order.isCustomOrder && ca
                        ? `${formatPrice(ca.budgetMin)} – ${formatPrice(ca.budgetMax)}`
                        : formatPrice(order.totalAmount)
                      }
                    </p>
                    <p className="text-xs text-gray-500 uppercase">{order.paymentMethod}</p>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="px-5 py-4 bg-gray-50/50">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200" />
                    <div className="absolute top-3 left-0 h-0.5 bg-rose-400 transition-all" style={{ width: `${((statusConfig.step - 1) / 3) * 100}%` }} />
                    {['Pending', 'Preparing', 'Ready', 'Completed'].map((step, i) => (
                      <div key={step} className="flex flex-col items-center relative z-10">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          i + 1 <= statusConfig.step ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-400'
                        }`}>
                          {i + 1 <= statusConfig.step ? '✓' : i + 1}
                        </div>
                        <span className={`text-xs mt-1.5 ${i + 1 <= statusConfig.step ? 'text-rose-600 font-medium' : 'text-gray-400'}`}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5">
                  {/* Custom Arrangement Details */}
                  {order.isCustomOrder && ca && (
                    <div className="mb-5">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles size={16} className="text-purple-500" />
                          <span className="text-sm font-bold text-purple-800">Custom Arrangement Details</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-purple-400 flex items-center gap-1"><Flower2 size={12} /> Flowers</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {ca.flowerTypes.map((f) => (
                                <span key={f} className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-medium capitalize">{f}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-purple-400 flex items-center gap-1"><Palette size={12} /> Colors</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {ca.colors.map((c) => (
                                <span key={c} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium capitalize">{c}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-purple-400">Style</span>
                            <p className="font-medium text-gray-700 capitalize mt-0.5">{ca.style}</p>
                          </div>
                          <div>
                            <span className="text-purple-400">Occasion</span>
                            <p className="font-medium text-gray-700 capitalize mt-0.5">{ca.occasion}</p>
                          </div>
                          <div>
                            <span className="text-purple-400">Budget</span>
                            <p className="font-medium text-rose-600 mt-0.5">{formatPrice(ca.budgetMin)} – {formatPrice(ca.budgetMax)}</p>
                          </div>
                        </div>

                        {ca.description && (
                          <div className="bg-white rounded-lg p-3 border border-purple-100">
                            <span className="text-xs text-purple-400">Description</span>
                            <p className="text-sm text-gray-700 mt-0.5 italic">"{ca.description}"</p>
                          </div>
                        )}

                        {ca.additionalNotes && (
                          <div className="bg-white rounded-lg p-3 border border-purple-100">
                            <span className="text-xs text-purple-400">Additional Notes</span>
                            <p className="text-sm text-gray-700 mt-0.5">{ca.additionalNotes}</p>
                          </div>
                        )}

                        {/* Reference Images */}
                        {ca.referenceImages && ca.referenceImages.length > 0 && (
                          <div>
                            <span className="text-xs text-purple-400 flex items-center gap-1 mb-2">
                              <ImageIcon size={12} /> Reference Photos ({ca.referenceImages.length})
                            </span>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {ca.referenceImages.map((img, i) => (
                                <button
                                  key={i}
                                  onClick={() => setViewImage({ src: img, title: `Reference Photo #${i + 1}` })}
                                  className="w-20 h-20 rounded-lg overflow-hidden border-2 border-purple-200 flex-shrink-0 hover:border-purple-400 transition-all group relative"
                                >
                                  <img src={img} alt={`Ref ${i + 1}`} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                    <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100">View</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Standard Order Items */}
                  {!order.isCustomOrder && order.items.length > 0 && (
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.product.id} className="flex items-center gap-3">
                          <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-cover rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{item.product.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.product.price)}</p>
                          </div>
                          <span className="text-sm font-bold text-gray-700">{formatPrice(item.product.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pickup Details */}
                  <div className={`${!order.isCustomOrder && order.items.length > 0 ? 'mt-4 pt-4 border-t border-gray-100' : ''} grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs`}>
                    <div>
                      <span className="text-gray-400">Pickup Date</span>
                      <p className="font-medium text-gray-700">{order.pickupDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Pickup Time</span>
                      <p className="font-medium text-gray-700">{order.pickupTime}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Contact</span>
                      <p className="font-medium text-gray-700">{order.contactNumber}</p>
                    </div>
                    {order.messageCard && (
                      <div>
                        <span className="text-gray-400">Message Card</span>
                        <p className="font-medium text-gray-700 truncate">{order.messageCard}</p>
                      </div>
                    )}
                  </div>

                  {/* GCash Payment Details */}
                  {order.gcashRefNumber && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">G</div>
                            <span className="text-sm font-bold text-blue-800">GCash Payment</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${getPaymentStatusConfig(order.paymentStatus).color}`}>
                            {getPaymentStatusConfig(order.paymentStatus).icon}
                            {getPaymentStatusConfig(order.paymentStatus).label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Hash size={14} className="text-blue-500" />
                            <span className="text-xs text-blue-600">Reference:</span>
                            <span className="font-mono font-bold text-blue-800 text-sm">{order.gcashRefNumber}</span>
                          </div>
                          {order.gcashReceiptImage && (
                            <button
                              onClick={() => setViewImage({ src: order.gcashReceiptImage!, title: 'GCash Receipt' })}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold transition-all"
                            >
                              <ImageIcon size={14} />
                              View Receipt
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ===== Review Section ===== */}
                  {order.status === 'completed' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {order.review ? (
                        /* Existing Review Display */
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageCircle size={16} className="text-amber-600" />
                            <span className="text-sm font-bold text-amber-800">Your Review</span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={18}
                                className={s <= order.review!.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                              />
                            ))}
                            <span className="text-sm font-bold text-amber-700 ml-1">{order.review.rating}.0</span>
                          </div>
                          {order.review.comment && (
                            <p className="text-sm text-gray-700 italic">"{order.review.comment}"</p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Reviewed on {new Date(order.review.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      ) : reviewingOrderId === order.id ? (
                        /* Review Form */
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 animate-fadeIn">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Star size={16} className="text-amber-600" />
                              <span className="text-sm font-bold text-amber-800">Rate Your Experience</span>
                            </div>
                            <button onClick={() => { setReviewingOrderId(null); setReviewRating(0); setReviewComment(''); }} className="text-gray-400 hover:text-gray-600 p-1">
                              <X size={16} />
                            </button>
                          </div>

                          {/* Star Rating */}
                          <div className="flex items-center gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onMouseEnter={() => setReviewHover(s)}
                                onMouseLeave={() => setReviewHover(0)}
                                onClick={() => setReviewRating(s)}
                                className="transition-transform hover:scale-125"
                              >
                                <Star
                                  size={28}
                                  className={`transition-colors ${
                                    s <= (reviewHover || reviewRating)
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                            {reviewRating > 0 && (
                              <span className="ml-2 text-sm font-bold text-amber-700">
                                {reviewRating === 1 ? 'Poor' : reviewRating === 2 ? 'Fair' : reviewRating === 3 ? 'Good' : reviewRating === 4 ? 'Very Good' : 'Excellent!'}
                              </span>
                            )}
                          </div>

                          {/* Comment */}
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            rows={3}
                            placeholder="Share your experience with this order... (optional)"
                            className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-gray-700 text-sm resize-none bg-white"
                          />

                          {/* Submit */}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => {
                                if (reviewRating === 0) return;
                                addReview(order.id, {
                                  rating: reviewRating,
                                  comment: reviewComment.trim(),
                                  createdAt: new Date().toISOString(),
                                });
                                setReviewingOrderId(null);
                                setReviewRating(0);
                                setReviewComment('');
                                setReviewSuccess(order.id);
                                setTimeout(() => setReviewSuccess(null), 3000);
                              }}
                              disabled={reviewRating === 0}
                              className="flex-1 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 text-sm disabled:opacity-50 transition-all hover:shadow-lg"
                              style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}
                            >
                              <Send size={14} />
                              Submit Review
                            </button>
                            <button
                              onClick={() => { setReviewingOrderId(null); setReviewRating(0); setReviewComment(''); }}
                              className="px-4 py-2.5 rounded-xl text-gray-600 font-semibold border border-gray-200 hover:bg-gray-50 text-sm transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Write Review Button */
                        <div>
                          {reviewSuccess === order.id && (
                            <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2 animate-fadeIn">
                              <CheckCircle2 size={16} />
                              Thank you for your review!
                            </div>
                          )}
                          <button
                            onClick={() => { setReviewingOrderId(order.id); setReviewRating(0); setReviewComment(''); }}
                            className="w-full py-3 rounded-xl border-2 border-dashed border-amber-300 text-amber-700 font-semibold flex items-center justify-center gap-2 text-sm hover:bg-amber-50 hover:border-amber-400 transition-all"
                          >
                            <Star size={16} />
                            Write a Review
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
