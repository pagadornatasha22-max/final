import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useProducts } from '../context/ProductContext';
import { CartItem } from '../types';
import { ArrowLeft, CreditCard, MessageSquare, Calendar, CheckCircle2, ShoppingBag, Upload, X, ImageIcon, AlertTriangle, Hash } from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (page: string) => void;
  directOrderProductId?: string | null;
}

export default function CheckoutPage({ onNavigate, directOrderProductId }: CheckoutPageProps) {
  const { currentUser } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { createOrder } = useOrders();
  const { products } = useProducts();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine items: direct order or cart
  const directProduct = directOrderProductId ? products.find((p) => p.id === directOrderProductId) : null;
  const checkoutItems: CartItem[] = directProduct
    ? [{ product: directProduct, quantity: 1 }]
    : cartItems;

  const totalAmount = directProduct
    ? directProduct.price
    : getCartTotal();

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    contactNumber: currentUser?.contactNumber || '',
    email: currentUser?.email || '',
    pickupDate: '',
    pickupTime: '',
    messageCard: '',
    paymentMethod: 'gcash',
    gcashRefNumber: '',
  });

  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receiptError, setReceiptError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear gcash-related errors when user changes payment method or edits fields
    if (name === 'paymentMethod') {
      setError('');
      setReceiptError('');
    }
    if (name === 'gcashRefNumber') {
      setError('');
      setReceiptError('');
    }
  };

  const formatPrice = (price: number) => {
    return `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  };

  // Handle receipt image upload
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setReceiptError('Please upload a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setReceiptError('Image file size must be less than 5MB.');
      return;
    }

    setReceiptError('');
    setError('');
    setReceiptFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setReceiptImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeReceipt = () => {
    setReceiptImage(null);
    setReceiptFileName('');
    setReceiptError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Customer input is accepted after basic format checks.
  // Admin verifies the actual e-wallet receipt and approves/rejects payment.
  const validateGcashPayment = (): boolean => {
    const ref = formData.gcashRefNumber.trim();

    // Reference number must be exactly 13 digits
    if (!/^\d{13}$/.test(ref)) {
      setError('The reference number is invalid. GCash reference numbers must be exactly 13 digits.');
      return false;
    }

    // Receipt must be uploaded
    if (!receiptImage) {
      setReceiptError('Please upload your GCash receipt screenshot.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutItems.length === 0) return;

    setError('');
    setReceiptError('');

    // Validate GCash reference number and receipt
    if (!formData.gcashRefNumber.trim()) {
      setError('Please enter your GCash reference number.');
      return;
    }
    if (!receiptImage) {
      setReceiptError('Please upload your GCash receipt screenshot.');
      return;
    }
    if (!validateGcashPayment()) {
      return;
    }

    setLoading(true);
    try {
      const order = await Promise.resolve(
        createOrder({
          customerId: currentUser!.id,
          customerName: formData.fullName,
          contactNumber: formData.contactNumber,
          email: formData.email,
          items: checkoutItems,
          totalAmount,
          pickupDate: formData.pickupDate,
          pickupTime: formData.pickupTime,
          messageCard: formData.messageCard,
          paymentMethod: formData.paymentMethod,
          gcashRefNumber: formData.gcashRefNumber.trim(),
          gcashReceiptImage: receiptImage || undefined,
        })
      );

      if (!order || !order.orderNumber) {
        throw new Error('Order was not created. Please try again.');
      }

      setOrderNumber(order.orderNumber);
      setOrderComplete(true);
      if (!directProduct) {
        clearCart();
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      setError(
        err instanceof Error
          ? `Could not complete your order: ${err.message}`
          : 'Could not complete your order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-slideUp">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Order Confirmed!</h2>
          <p className="text-gray-500 mb-6">Thank you for your order. We'll prepare your flowers with love! 🌸</p>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50 mb-6 text-left">
            <div className="text-center mb-4">
              <span className="text-sm text-gray-500">Order Number</span>
              <p className="text-2xl font-bold text-rose-600 tracking-wider">{orderNumber}</p>
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Items</span>
                <span className="text-gray-700 font-medium">{checkoutItems.length} flower{checkoutItems.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Amount</span>
                <span className="text-rose-600 font-bold">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pickup</span>
                <span className="text-gray-700 font-medium">{formData.pickupDate} at {formData.pickupTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment</span>
                <span className="text-gray-700 font-medium uppercase">{formData.paymentMethod}</span>
              </div>
              {formData.paymentMethod === 'gcash' && formData.gcashRefNumber && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">GCash Ref #</span>
                  <span className="text-blue-600 font-bold font-mono">{formData.gcashRefNumber}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Pending</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Review</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">For Admin Approval</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onNavigate('my-orders')}
              className="flex-1 py-3 rounded-xl text-white font-semibold transition-all hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}
            >
              View My Orders
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex-1 py-3 rounded-xl text-rose-600 font-semibold border border-rose-200 hover:bg-rose-50 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center px-4">
        <div className="text-center animate-fadeIn">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Nothing to Checkout</h2>
          <p className="text-gray-500 mb-6">Add some flowers to your cart first!</p>
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => onNavigate(directProduct ? 'dashboard' : 'cart')} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>Checkout</h1>
            <p className="text-gray-500 text-sm">Complete your order</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  👤 Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-gray-700"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-gray-700"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pickup Details */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  <Calendar size={20} className="text-rose-500" />
                  Pickup Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
                    <input
                      type="date"
                      name="pickupDate"
                      value={formData.pickupDate}
                      onChange={handleChange}
                      min={minDate}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Time</label>
                    <select
                      name="pickupTime"
                      value={formData.pickupTime}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-gray-700"
                      required
                    >
                      <option value="">Select time</option>
                      <option value="8:00 AM">8:00 AM</option>
                      <option value="9:00 AM">9:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="1:00 PM">1:00 PM</option>
                      <option value="2:00 PM">2:00 PM</option>
                      <option value="3:00 PM">3:00 PM</option>
                      <option value="4:00 PM">4:00 PM</option>
                      <option value="5:00 PM">5:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Message Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  <MessageSquare size={20} className="text-rose-500" />
                  Message Card (Optional)
                </h3>
                <textarea
                  name="messageCard"
                  value={formData.messageCard}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Write a special message to include with your flowers..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-gray-700 resize-none"
                />
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  <CreditCard size={20} className="text-rose-500" />
                  Payment Method
                </h3>
                <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-500 bg-blue-50">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      G
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">GCash</span>
                      <p className="text-xs text-gray-500">Pay via GCash mobile wallet</p>
                    </div>
                    <CheckCircle2 size={18} className="text-blue-500 ml-auto" />
                </div>

                {/* GCash Payment Details */}
                <div className="mt-5 space-y-5">
                    {/* GCash Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">G</div>
                        GCash Payment Instructions
                      </h4>
                      <ol className="text-xs text-blue-700 space-y-1.5 list-decimal list-inside">
                        <li>Open your GCash app and send payment to <strong>09123456789</strong></li>
                        <li>Amount to send: <strong>{formatPrice(totalAmount)}</strong></li>
                        <li>Take a screenshot of the payment confirmation</li>
                        <li>Enter the <strong>13-digit reference number</strong> shown on your GCash receipt</li>
                        <li>Upload the screenshot below</li>
                      </ol>
                    </div>

                    {/* GCash Reference Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <Hash size={15} className="text-blue-500" />
                        GCash Reference Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="gcashRefNumber"
                        value={formData.gcashRefNumber}
                        onChange={(e) => {
                          // Only allow digits, max 13
                          const val = e.target.value.replace(/\D/g, '').slice(0, 13);
                          setFormData({ ...formData, gcashRefNumber: val });
                          setError('');
                          setReceiptError('');
                        }}
                        placeholder="Enter 13-digit reference number"
                        maxLength={13}
                        className={`w-full px-4 py-3 rounded-xl border text-gray-700 font-mono text-lg tracking-widest transition-all ${
                          error && error.toLowerCase().includes('reference')
                            ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                            : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                        }`}
                      />
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs text-gray-400">Must be exactly 13 digits</p>
                        <p className={`text-xs font-mono font-bold ${formData.gcashRefNumber.length === 13 ? 'text-emerald-500' : 'text-gray-400'}`}>
                          {formData.gcashRefNumber.length}/13
                        </p>
                      </div>
                    </div>

                    {/* Receipt Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <ImageIcon size={15} className="text-blue-500" />
                        GCash Receipt Screenshot <span className="text-red-500">*</span>
                      </label>

                      {!receiptImage ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-blue-50 ${
                            receiptError
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 hover:border-blue-400'
                          }`}
                        >
                          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                            <Upload size={24} className="text-blue-500" />
                          </div>
                          <p className="text-sm font-medium text-gray-700">Click to upload receipt</p>
                          <p className="text-xs text-gray-400 mt-1">JPG, PNG or WEBP · Max 5MB</p>
                        </div>
                      ) : (
                        <div className="relative rounded-xl overflow-hidden border-2 border-blue-300 bg-blue-50">
                          {/* Receipt Preview */}
                          <div className="p-3 flex items-start gap-3">
                            <div className="w-28 h-36 rounded-lg overflow-hidden border border-blue-200 flex-shrink-0 bg-white">
                              <img
                                src={receiptImage}
                                alt="GCash Receipt"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex-1 min-w-0 py-1">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                                <span className="text-sm font-semibold text-emerald-700">Receipt Uploaded</span>
                              </div>
                              <p className="text-xs text-gray-500 truncate">{receiptFileName}</p>
                              {formData.gcashRefNumber && (
                                <div className="mt-2 bg-white rounded-lg px-3 py-1.5 border border-blue-200 inline-block">
                                  <span className="text-xs text-gray-500">Ref #: </span>
                                  <span className="text-sm font-mono font-bold text-blue-700">{formData.gcashRefNumber}</span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-2 text-xs text-blue-600 font-medium hover:text-blue-700 block"
                              >
                                Change image
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={removeReceipt}
                              className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-all flex-shrink-0"
                              title="Remove receipt"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleReceiptUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Receipt upload error */}
                    {receiptError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 animate-fadeIn">
                        <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600 font-medium">{receiptError}</p>
                      </div>
                    )}
                  </div>

                {/* Global error (ref validation) */}
                {error && (
                  <div className="mt-4 flex items-start gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 animate-fadeIn">
                    <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-700 font-semibold">Payment Details Required</p>
                      <p className="text-sm text-red-600 mt-0.5">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50 sticky top-24">
                <h3 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Order Summary</h3>

                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {checkoutItems.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <img src={item.product.image} alt={item.product.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-rose-600">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-700">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Service Fee</span>
                    <span className="text-emerald-600 font-medium">FREE</span>
                  </div>
                  <div className="border-t border-gray-100 pt-2 flex justify-between">
                    <span className="font-bold text-gray-800">Total</span>
                    <span className="text-xl font-bold text-rose-600">{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                {/* Payment Status Indicator */}
                <div className={`mb-4 p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                  formData.gcashRefNumber.length === 13 && receiptImage
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
                  {formData.gcashRefNumber.length === 13 && receiptImage ? (
                    <>
                      <CheckCircle2 size={14} />
                      GCash payment details complete
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={14} />
                      {!formData.gcashRefNumber ? 'Enter reference number' : formData.gcashRefNumber.length < 13 ? `Reference: ${formData.gcashRefNumber.length}/13 digits` : 'Upload receipt screenshot'}
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:opacity-70"
                  style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      Confirm Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
