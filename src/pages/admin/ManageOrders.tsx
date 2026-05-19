import { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { Order } from '../../types';
import { Clock, ChefHat, Truck, CheckCircle2, Eye, X, Search, Filter, Hash, ImageIcon, Sparkles, Palette, Flower2, Star, MessageCircle, AlertTriangle } from 'lucide-react';

export default function ManageOrders() {
  const { getAllOrders, updateOrderStatus, updatePaymentStatus } = useOrders();
  const orders = getAllOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewImage, setViewImage] = useState<{ src: string; title: string } | null>(null);

  const formatPrice = (price: number) => `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: <Clock size={14} /> };
      case 'preparing': return { label: 'Preparing', color: 'bg-blue-100 text-blue-700', icon: <ChefHat size={14} /> };
      case 'ready': return { label: 'Ready for Pickup', color: 'bg-emerald-100 text-emerald-700', icon: <Truck size={14} /> };
      case 'completed': return { label: 'Completed', color: 'bg-gray-100 text-gray-700', icon: <CheckCircle2 size={14} /> };
      default: return { label: status, color: 'bg-gray-100 text-gray-700', icon: <Clock size={14} /> };
    }
  };

  const getNextStatus = (status: string): Order['status'] | null => {
    switch (status) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'completed';
      default: return null;
    }
  };

  const getNextStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending': return 'Mark as Preparing';
      case 'preparing': return 'Mark as Ready';
      case 'ready': return 'Mark as Completed';
      default: return '';
    }
  };

  const getPaymentStatusConfig = (status?: Order['paymentStatus']) => {
    switch (status) {
      case 'approved': return { label: 'Payment Approved', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={14} /> };
      case 'rejected': return { label: 'Payment Rejected', color: 'bg-red-100 text-red-700', icon: <X size={14} /> };
      default: return { label: 'Payment Pending Review', color: 'bg-amber-100 text-amber-700', icon: <AlertTriangle size={14} /> };
    }
  };

  const filteredOrders = orders
    .filter((o) => filterStatus === 'all' || o.status === filterStatus)
    .filter((o) =>
      !searchQuery ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.gcashRefNumber && o.gcashRefNumber.includes(searchQuery))
    );

  const handleStatusUpdate = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  const statusFilters = [
    { id: 'all', label: 'All', count: orders.length },
    { id: 'pending', label: 'Pending', count: orders.filter((o) => o.status === 'pending').length },
    { id: 'preparing', label: 'Preparing', count: orders.filter((o) => o.status === 'preparing').length },
    { id: 'ready', label: 'Ready', count: orders.filter((o) => o.status === 'ready').length },
    { id: 'completed', label: 'Completed', count: orders.filter((o) => o.status === 'completed').length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>Manage Orders</h1>
          <p className="text-gray-500 text-sm">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by order number, customer, or GCash ref..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-sm text-gray-700" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter size={16} className="text-gray-400 flex-shrink-0" />
            {statusFilters.map((f) => (
              <button key={f.id} onClick={() => setFilterStatus(f.id)} className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filterStatus === f.id ? 'bg-rose-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                {f.label} ({f.count})
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
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
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
                <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-5">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusConfig(selectedOrder.status).color}`}>
                    {getStatusConfig(selectedOrder.status).icon}
                    {getStatusConfig(selectedOrder.status).label}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-gray-700 text-sm">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-400 text-xs">Name</span><p className="font-medium text-gray-700">{selectedOrder.customerName}</p></div>
                    <div><span className="text-gray-400 text-xs">Contact</span><p className="font-medium text-gray-700">{selectedOrder.contactNumber}</p></div>
                    <div className="col-span-2"><span className="text-gray-400 text-xs">Email</span><p className="font-medium text-gray-700">{selectedOrder.email}</p></div>
                  </div>
                </div>

                {/* Custom Arrangement Details */}
                {selectedOrder.isCustomOrder && selectedOrder.customArrangement && (() => {
                  const ca = selectedOrder.customArrangement;
                  return (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-500" />
                        <span className="text-sm font-bold text-purple-800">Custom Arrangement Details</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-purple-400 flex items-center gap-1"><Flower2 size={12} /> Flowers</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {ca.flowerTypes.map((f) => <span key={f} className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-medium capitalize">{f}</span>)}
                          </div>
                        </div>
                        <div>
                          <span className="text-purple-400 flex items-center gap-1"><Palette size={12} /> Colors</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {ca.colors.map((c) => <span key={c} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium capitalize">{c}</span>)}
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
                        <div className="col-span-2">
                          <span className="text-purple-400">Budget</span>
                          <p className="font-bold text-rose-600 mt-0.5">{formatPrice(ca.budgetMin)} – {formatPrice(ca.budgetMax)}</p>
                        </div>
                      </div>

                      {ca.description && (
                        <div className="bg-white rounded-lg p-3 border border-purple-100">
                          <span className="text-xs text-purple-400">Customer's Vision</span>
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
                            <ImageIcon size={12} /> Customer Reference Photos ({ca.referenceImages.length})
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            {ca.referenceImages.map((img, i) => (
                              <button
                                key={i}
                                onClick={() => setViewImage({ src: img, title: `Reference Photo #${i + 1}` })}
                                className="aspect-square rounded-lg overflow-hidden border-2 border-purple-200 hover:border-purple-400 transition-all group relative"
                              >
                                <img src={img} alt={`Ref ${i + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                  <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 bg-black/50 px-2 py-1 rounded-lg">Enlarge</span>
                                </div>
                                <div className="absolute bottom-1 left-1 bg-white/90 px-1.5 py-0.5 rounded text-xs font-bold text-gray-700">#{i + 1}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Standard Items */}
                {!selectedOrder.isCustomOrder && selectedOrder.items.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-700 text-sm mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div key={item.product.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                          <img src={item.product.image} alt={item.product.name} className="w-14 h-14 object-cover rounded-lg" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">{item.product.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.product.price)}</p>
                          </div>
                          <span className="font-bold text-gray-700 text-sm">{formatPrice(item.product.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pickup & Payment */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-xl p-3"><span className="text-gray-400 text-xs">Pickup Date</span><p className="font-medium text-gray-700">{selectedOrder.pickupDate}</p></div>
                  <div className="bg-gray-50 rounded-xl p-3"><span className="text-gray-400 text-xs">Pickup Time</span><p className="font-medium text-gray-700">{selectedOrder.pickupTime}</p></div>
                  <div className="bg-gray-50 rounded-xl p-3"><span className="text-gray-400 text-xs">Payment</span><p className="font-medium text-gray-700 uppercase">{selectedOrder.paymentMethod}</p></div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <span className="text-gray-400 text-xs">Total</span>
                    <p className="font-bold text-rose-600">
                      {selectedOrder.isCustomOrder && selectedOrder.customArrangement
                        ? `${formatPrice(selectedOrder.customArrangement.budgetMin)} – ${formatPrice(selectedOrder.customArrangement.budgetMax)}`
                        : formatPrice(selectedOrder.totalAmount)
                      }
                    </p>
                  </div>
                </div>

                {/* GCash Payment Details */}
                {selectedOrder.paymentMethod === 'gcash' && selectedOrder.gcashRefNumber && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">G</div>
                        <span className="text-sm font-bold text-blue-800">GCash Payment Verification</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getPaymentStatusConfig(selectedOrder.paymentStatus).color}`}>
                        {getPaymentStatusConfig(selectedOrder.paymentStatus).icon}
                        {getPaymentStatusConfig(selectedOrder.paymentStatus).label}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center gap-2 mb-1"><Hash size={14} className="text-blue-500" /><span className="text-xs font-medium text-blue-600">Reference Number</span></div>
                      <p className="font-mono font-bold text-blue-800 text-lg tracking-widest">{selectedOrder.gcashRefNumber}</p>
                    </div>
                    {selectedOrder.gcashReceiptImage && (
                      <div>
                        <div className="flex items-center gap-2 mb-2"><ImageIcon size={14} className="text-blue-500" /><span className="text-xs font-medium text-blue-600">Receipt Screenshot</span></div>
                        <div className="relative group cursor-pointer" onClick={() => setViewImage({ src: selectedOrder.gcashReceiptImage!, title: 'GCash Receipt' })}>
                          <div className="w-full rounded-lg overflow-hidden border border-blue-200 bg-white">
                            <img src={selectedOrder.gcashReceiptImage} alt="GCash Receipt" className="w-full max-h-48 object-contain" />
                            <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-all flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">Click to enlarge</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-100">
                      <button
                        onClick={() => {
                          updatePaymentStatus(selectedOrder.id, 'approved');
                          setSelectedOrder({ ...selectedOrder, paymentStatus: 'approved' });
                        }}
                        className="py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Approve Payment
                      </button>
                      <button
                        onClick={() => {
                          updatePaymentStatus(selectedOrder.id, 'rejected');
                          setSelectedOrder({ ...selectedOrder, paymentStatus: 'rejected' });
                        }}
                        className="py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                      >
                        <X size={16} /> Reject Payment
                      </button>
                    </div>
                    <p className="text-xs text-blue-600">
                      Orders proceed as <strong>Pending</strong> after customer checkout. Admin manually checks the e-wallet receipt and approves or rejects payment here.
                    </p>
                  </div>
                )}

                {selectedOrder.messageCard && (
                  <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                    <span className="text-xs text-rose-500 font-medium">💌 Message Card</span>
                    <p className="text-sm text-gray-700 mt-1 italic">"{selectedOrder.messageCard}"</p>
                  </div>
                )}

                {/* Customer Review */}
                {selectedOrder.review && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle size={16} className="text-amber-600" />
                      <span className="text-sm font-bold text-amber-800">Customer Review</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={18}
                          className={s <= selectedOrder.review!.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                        />
                      ))}
                      <span className="text-sm font-bold text-amber-700 ml-1">{selectedOrder.review.rating}.0</span>
                    </div>
                    {selectedOrder.review.comment && (
                      <p className="text-sm text-gray-700 italic bg-white rounded-lg p-3 border border-amber-100">"{selectedOrder.review.comment}"</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Reviewed on {new Date(selectedOrder.review.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                )}

                {/* Update Status */}
                {getNextStatus(selectedOrder.status) && (
                  <button
                    onClick={() => { const next = getNextStatus(selectedOrder.status); if (next) handleStatusUpdate(selectedOrder.id, next); }}
                    className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}
                  >
                    {getNextStatusLabel(selectedOrder.status)}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-rose-50">
            <Clock size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-600 mb-1">No orders found</h3>
            <p className="text-gray-400 text-sm">Orders will appear here when customers place them.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const nextStatus = getNextStatus(order.status);
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-rose-50 overflow-hidden animate-fadeIn">
                  <div className="p-5 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-gray-800">{order.orderNumber}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                        {order.isCustomOrder && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 flex items-center gap-1">
                            <Sparkles size={10} /> Custom
                          </span>
                        )}
                        {order.gcashRefNumber && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 flex items-center gap-1">
                            <div className="w-3.5 h-3.5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] font-bold">G</div>
                            GCash
                          </span>
                        )}
                        {order.gcashRefNumber && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${getPaymentStatusConfig(order.paymentStatus).color}`}>
                            {getPaymentStatusConfig(order.paymentStatus).icon}
                            {order.paymentStatus || 'pending'}
                          </span>
                        )}
                        {order.review && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 flex items-center gap-1">
                            <Star size={10} className="fill-amber-400 text-amber-400" />
                            {order.review.rating}.0
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {order.customerName} · {order.isCustomOrder ? 'Custom arrangement' : `${order.items.length} item${order.items.length !== 1 ? 's' : ''}`} · {formatDate(order.createdAt)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Pickup: {order.pickupDate} at {order.pickupTime} · Payment: {order.paymentMethod.toUpperCase()}
                        {order.gcashRefNumber && <span className="ml-1 font-mono text-blue-600"> · Ref# {order.gcashRefNumber}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-rose-600">
                        {order.isCustomOrder && order.customArrangement
                          ? `${formatPrice(order.customArrangement.budgetMin)}+`
                          : formatPrice(order.totalAmount)
                        }
                      </span>
                      <button onClick={() => setSelectedOrder(order)} className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-all" title="View Details">
                        <Eye size={18} />
                      </button>
                      {nextStatus && (
                        <button onClick={() => handleStatusUpdate(order.id, nextStatus)} className="px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all hover:shadow-lg whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}>
                          {getNextStatusLabel(order.status)}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items / Custom Preview */}
                  <div className="px-5 pb-4 flex gap-2 overflow-x-auto">
                    {order.isCustomOrder && order.customArrangement ? (
                      <>
                        <div className="flex items-center gap-2 bg-purple-50 rounded-lg px-3 py-2 flex-shrink-0 border border-purple-100">
                          <Sparkles size={14} className="text-purple-500" />
                          <span className="text-xs font-medium text-purple-700">
                            {order.customArrangement.style} · {order.customArrangement.flowerTypes.slice(0, 3).join(', ')}{order.customArrangement.flowerTypes.length > 3 ? '...' : ''}
                          </span>
                        </div>
                        {order.customArrangement.referenceImages && order.customArrangement.referenceImages.length > 0 && (
                          <div className="flex items-center gap-2 bg-purple-50 rounded-lg px-3 py-2 flex-shrink-0 border border-purple-100">
                            <ImageIcon size={14} className="text-purple-500" />
                            <span className="text-xs font-medium text-purple-700">{order.customArrangement.referenceImages.length} ref photo{order.customArrangement.referenceImages.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      order.items.map((item) => (
                        <div key={item.product.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 flex-shrink-0">
                          <img src={item.product.image} alt={item.product.name} className="w-8 h-8 object-cover rounded" />
                          <span className="text-xs font-medium text-gray-600 whitespace-nowrap">{item.product.name} ×{item.quantity}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
