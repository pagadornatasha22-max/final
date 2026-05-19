import { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { Star, MessageCircle, Search, Filter, Package, User, Calendar, TrendingUp, Eye, X, ImageIcon, Sparkles } from 'lucide-react';

export default function ManageReviews() {
  const { getAllReviews, getAllOrders } = useOrders();
  const allReviews = getAllReviews();
  const allOrders = getAllOrders();
  const [filterRating, setFilterRating] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<{ src: string; title: string } | null>(null);

  // Stats
  const totalReviews = allReviews.length;
  const avgRating = totalReviews > 0
    ? (allReviews.reduce((sum, r) => sum + r.review.rating, 0) / totalReviews)
    : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: allReviews.filter((rev) => rev.review.rating === r).length,
    percentage: totalReviews > 0
      ? (allReviews.filter((rev) => rev.review.rating === r).length / totalReviews) * 100
      : 0,
  }));

  // Filter
  const filteredReviews = allReviews
    .filter((r) => filterRating === 0 || r.review.rating === filterRating)
    .filter((r) =>
      !searchQuery ||
      r.order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.review.comment && r.review.comment.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const formatPrice = (price: number) => `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  const getRatingLabel = (r: number) => {
    switch (r) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  const selectedOrder = selectedReview ? allOrders.find((o) => o.id === selectedReview) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            <MessageCircle size={28} className="text-amber-500" />
            Customer Reviews
          </h1>
          <p className="text-gray-500 text-sm mt-1">{totalReviews} review{totalReviews !== 1 ? 's' : ''} from customers</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Average Rating Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-rose-50 p-6 flex flex-col items-center justify-center">
            <p className="text-5xl font-bold text-gray-800 mb-1">{avgRating.toFixed(1)}</p>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={22} className={s <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
              ))}
            </div>
            <p className="text-sm text-gray-500">Average Rating</p>
            <p className="text-xs text-gray-400">{totalReviews} total review{totalReviews !== 1 ? 's' : ''}</p>
          </div>

          {/* Rating Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-rose-50 p-6 md:col-span-2">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-amber-500" />
              Rating Breakdown
            </h3>
            <div className="space-y-2.5">
              {ratingCounts.map((rc) => (
                <button
                  key={rc.rating}
                  onClick={() => setFilterRating(filterRating === rc.rating ? 0 : rc.rating)}
                  className={`w-full flex items-center gap-3 py-1 group transition-all rounded-lg px-2 -mx-2 ${
                    filterRating === rc.rating ? 'bg-amber-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1 w-20 flex-shrink-0">
                    <span className="text-sm font-bold text-gray-700 w-3">{rc.rating}</span>
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${rc.percentage}%`,
                        background: rc.rating >= 4 ? '#f59e0b' : rc.rating === 3 ? '#fbbf24' : '#fb923c',
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 w-10 text-right">{rc.count}</span>
                  <span className="text-xs text-gray-400 w-12 text-right">{rc.percentage.toFixed(0)}%</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, order number, or comment..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-sm text-gray-700"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter size={16} className="text-gray-400 flex-shrink-0" />
            <button
              onClick={() => setFilterRating(0)}
              className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filterRating === 0 ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All ({totalReviews})
            </button>
            {[5, 4, 3, 2, 1].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRating(filterRating === r ? 0 : r)}
                className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  filterRating === r ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {r} <Star size={10} className={filterRating === r ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'} />
                ({ratingCounts.find((rc) => rc.rating === r)?.count || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Image Viewer Modal */}
        {viewImage && (
          <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={() => setViewImage(null)}>
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

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedReview(null)}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-800">{selectedOrder.orderNumber}</h3>
                    {selectedOrder.isCustomOrder && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 flex items-center gap-1">
                        <Sparkles size={10} /> Custom
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <button onClick={() => setSelectedReview(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-5">
                {/* Customer */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2"><User size={14} /> Customer</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-400 text-xs">Name</span><p className="font-medium text-gray-700">{selectedOrder.customerName}</p></div>
                    <div><span className="text-gray-400 text-xs">Contact</span><p className="font-medium text-gray-700">{selectedOrder.contactNumber}</p></div>
                    <div className="col-span-2"><span className="text-gray-400 text-xs">Email</span><p className="font-medium text-gray-700">{selectedOrder.email}</p></div>
                  </div>
                </div>

                {/* Order Items / Custom */}
                {selectedOrder.isCustomOrder && selectedOrder.customArrangement ? (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                    <h4 className="font-bold text-purple-700 text-sm mb-2 flex items-center gap-2"><Sparkles size={14} /> Custom Arrangement</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-purple-400">Flowers</span><p className="font-medium text-gray-700 capitalize">{selectedOrder.customArrangement.flowerTypes.join(', ')}</p></div>
                      <div><span className="text-purple-400">Colors</span><p className="font-medium text-gray-700 capitalize">{selectedOrder.customArrangement.colors.join(', ')}</p></div>
                      <div><span className="text-purple-400">Style</span><p className="font-medium text-gray-700 capitalize">{selectedOrder.customArrangement.style}</p></div>
                      <div><span className="text-purple-400">Budget</span><p className="font-medium text-rose-600">{formatPrice(selectedOrder.customArrangement.budgetMin)} – {formatPrice(selectedOrder.customArrangement.budgetMax)}</p></div>
                    </div>
                    {selectedOrder.customArrangement.description && (
                      <p className="text-xs text-gray-600 italic mt-2 bg-white p-2 rounded-lg border border-purple-100">"{selectedOrder.customArrangement.description}"</p>
                    )}
                    {selectedOrder.customArrangement.referenceImages && selectedOrder.customArrangement.referenceImages.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {selectedOrder.customArrangement.referenceImages.map((img, i) => (
                          <button key={i} onClick={() => setViewImage({ src: img, title: `Reference #${i + 1}` })} className="w-12 h-12 rounded-lg overflow-hidden border border-purple-200 hover:border-purple-400 transition-all">
                            <img src={img} alt={`Ref ${i + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : selectedOrder.items.length > 0 ? (
                  <div>
                    <h4 className="font-bold text-gray-700 text-sm mb-2 flex items-center gap-2"><Package size={14} /> Items</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div key={item.product.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2.5">
                          <img src={item.product.image} alt={item.product.name} className="w-10 h-10 object-cover rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 truncate">{item.product.name}</p>
                            <p className="text-[10px] text-gray-500">×{item.quantity}</p>
                          </div>
                          <span className="text-xs font-bold text-gray-700">{formatPrice(item.product.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Order Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-xl p-3"><span className="text-gray-400 text-xs">Pickup</span><p className="font-medium text-gray-700">{selectedOrder.pickupDate} at {selectedOrder.pickupTime}</p></div>
                  <div className="bg-gray-50 rounded-xl p-3"><span className="text-gray-400 text-xs">Total</span><p className="font-bold text-rose-600">{selectedOrder.isCustomOrder && selectedOrder.customArrangement ? `${formatPrice(selectedOrder.customArrangement.budgetMin)}+` : formatPrice(selectedOrder.totalAmount)}</p></div>
                </div>

                {/* GCash */}
                {selectedOrder.gcashRefNumber && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">G</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-600">Reference</p>
                      <p className="font-mono font-bold text-blue-800 text-sm">{selectedOrder.gcashRefNumber}</p>
                    </div>
                    {selectedOrder.gcashReceiptImage && (
                      <button onClick={() => setViewImage({ src: selectedOrder.gcashReceiptImage!, title: 'GCash Receipt' })} className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
                        <ImageIcon size={12} /> Receipt
                      </button>
                    )}
                  </div>
                )}

                {/* The Review */}
                {selectedOrder.review && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageCircle size={18} className="text-amber-600" />
                      <span className="text-sm font-bold text-amber-800">Customer Review</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={24} className={s <= selectedOrder.review!.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                      ))}
                      <span className="text-lg font-bold text-amber-700 ml-2">{selectedOrder.review.rating}.0</span>
                      <span className="text-sm text-amber-600 ml-1">— {getRatingLabel(selectedOrder.review.rating)}</span>
                    </div>
                    {selectedOrder.review.comment ? (
                      <div className="bg-white rounded-lg p-4 border border-amber-100">
                        <p className="text-sm text-gray-700 italic leading-relaxed">"{selectedOrder.review.comment}"</p>
                      </div>
                    ) : (
                      <p className="text-sm text-amber-600 italic">No comment provided</p>
                    )}
                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                      <Calendar size={12} />
                      Reviewed on {formatDate(selectedOrder.review.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-rose-50">
            <MessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-600 mb-1">
              {totalReviews === 0 ? 'No Reviews Yet' : 'No Matching Reviews'}
            </h3>
            <p className="text-gray-400 text-sm">
              {totalReviews === 0
                ? 'Customer reviews will appear here once orders are completed and reviewed.'
                : 'Try adjusting your search or filter to find reviews.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map(({ order, review }) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-rose-50 overflow-hidden animate-fadeIn hover:shadow-md transition-all">
                <div className="p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    {/* Customer Avatar & Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {order.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-800 text-sm">{order.customerName}</span>
                          {order.isCustomOrder && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 flex items-center gap-0.5">
                              <Sparkles size={8} /> Custom
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {order.orderNumber} · {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Stars & View Button */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={16} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-amber-600 mt-0.5">{getRatingLabel(review.rating)}</span>
                      </div>
                      <button
                        onClick={() => setSelectedReview(order.id)}
                        className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition-all"
                        title="View Full Details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Comment */}
                  {review.comment ? (
                    <div className="mt-3 ml-14">
                      <p className="text-sm text-gray-700 leading-relaxed italic bg-gray-50 rounded-xl p-3 border border-gray-100">
                        "{review.comment}"
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 ml-14">
                      <p className="text-xs text-gray-400 italic">No comment</p>
                    </div>
                  )}

                  {/* Order summary line */}
                  <div className="mt-3 ml-14 flex flex-wrap items-center gap-2">
                    {order.isCustomOrder ? (
                      <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-lg font-medium">
                        Custom: {order.customArrangement?.style} · {order.customArrangement?.flowerTypes.slice(0, 2).join(', ')}
                      </span>
                    ) : (
                      order.items.slice(0, 2).map((item) => (
                        <span key={item.product.id} className="text-xs bg-rose-50 text-rose-600 px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                          <img src={item.product.image} alt="" className="w-4 h-4 rounded object-cover" />
                          {item.product.name}
                        </span>
                      ))
                    )}
                    {!order.isCustomOrder && order.items.length > 2 && (
                      <span className="text-xs text-gray-400">+{order.items.length - 2} more</span>
                    )}
                    <span className="text-xs font-bold text-rose-600 ml-auto">
                      {order.isCustomOrder && order.customArrangement
                        ? `${formatPrice(order.customArrangement.budgetMin)}+`
                        : formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
