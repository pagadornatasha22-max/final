import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { CustomArrangement } from '../types';
import {
  ArrowLeft, Upload, X, ImageIcon, CheckCircle2, Palette,
  Flower2, Sparkles, AlertTriangle, Hash, ShoppingBag,
  CreditCard, Calendar, Heart, Gift, PartyPopper, Church,
  GraduationCap, Baby, Star, MessageSquare
} from 'lucide-react';

interface CustomizePageProps {
  onNavigate: (page: string) => void;
}

const FLOWER_TYPES = [
  { id: 'roses', label: 'Roses', emoji: '🌹' },
  { id: 'tulips', label: 'Tulips', emoji: '🌷' },
  { id: 'sunflowers', label: 'Sunflowers', emoji: '🌻' },
  { id: 'lilies', label: 'Lilies', emoji: '🪷' },
  { id: 'orchids', label: 'Orchids', emoji: '🌺' },
  { id: 'carnations', label: 'Carnations', emoji: '🌸' },
  { id: 'daisies', label: 'Daisies', emoji: '🌼' },
  { id: 'hydrangeas', label: 'Hydrangeas', emoji: '💮' },
  { id: 'peonies', label: 'Peonies', emoji: '🏵️' },
  { id: 'babys-breath', label: "Baby's Breath", emoji: '✨' },
  { id: 'lavender', label: 'Lavender', emoji: '💜' },
  { id: 'mixed', label: 'Mixed / Any', emoji: '💐' },
];

const COLOR_OPTIONS = [
  { id: 'red', label: 'Red', hex: '#DC2626' },
  { id: 'pink', label: 'Pink', hex: '#EC4899' },
  { id: 'white', label: 'White', hex: '#F9FAFB', border: true },
  { id: 'yellow', label: 'Yellow', hex: '#EAB308' },
  { id: 'orange', label: 'Orange', hex: '#F97316' },
  { id: 'purple', label: 'Purple', hex: '#9333EA' },
  { id: 'blue', label: 'Blue', hex: '#3B82F6' },
  { id: 'peach', label: 'Peach', hex: '#FDBA74' },
  { id: 'lavender', label: 'Lavender', hex: '#C4B5FD' },
  { id: 'mixed', label: 'Mixed', hex: 'linear-gradient(135deg,#EC4899,#EAB308,#9333EA,#3B82F6)' },
];

const STYLE_OPTIONS = [
  { id: 'bouquet', label: 'Hand Bouquet', emoji: '💐', desc: 'Classic wrapped bouquet' },
  { id: 'box', label: 'Flower Box', emoji: '🎁', desc: 'Elegant box arrangement' },
  { id: 'basket', label: 'Basket', emoji: '🧺', desc: 'Flower basket arrangement' },
  { id: 'vase', label: 'Vase', emoji: '🏺', desc: 'Arranged in a vase' },
  { id: 'heart', label: 'Heart Shape', emoji: '❤️', desc: 'Romantic heart arrangement' },
  { id: 'cascade', label: 'Cascading', emoji: '🌊', desc: 'Flowing cascade design' },
  { id: 'crown', label: 'Flower Crown', emoji: '👑', desc: 'Wearable flower crown' },
  { id: 'other', label: 'Other', emoji: '✨', desc: 'Describe in notes' },
];

const OCCASION_OPTIONS = [
  { id: 'birthday', label: 'Birthday', icon: <PartyPopper size={16} /> },
  { id: 'anniversary', label: 'Anniversary', icon: <Heart size={16} /> },
  { id: 'wedding', label: 'Wedding', icon: <Church size={16} /> },
  { id: 'valentines', label: "Valentine's", icon: <Heart size={16} /> },
  { id: 'graduation', label: 'Graduation', icon: <GraduationCap size={16} /> },
  { id: 'baby', label: 'Baby Shower', icon: <Baby size={16} /> },
  { id: 'sympathy', label: 'Sympathy', icon: <Flower2 size={16} /> },
  { id: 'gift', label: 'Just Because', icon: <Gift size={16} /> },
  { id: 'other', label: 'Other', icon: <Star size={16} /> },
];

const BUDGET_RANGES = [
  { id: 'budget1', label: '₱500 – ₱1,000', min: 500, max: 1000 },
  { id: 'budget2', label: '₱1,000 – ₱2,000', min: 1000, max: 2000 },
  { id: 'budget3', label: '₱2,000 – ₱3,000', min: 2000, max: 3000 },
  { id: 'budget4', label: '₱3,000 – ₱5,000', min: 3000, max: 5000 },
  { id: 'budget5', label: '₱5,000+', min: 5000, max: 10000 },
];

export default function CustomizePage({ onNavigate }: CustomizePageProps) {
  const { currentUser } = useAuth();
  const { createOrder } = useOrders();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gcashReceiptRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Custom arrangement state
  const [selectedFlowers, setSelectedFlowers] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [description, setDescription] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  // Checkout state
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
  const [receiptFileName, setReceiptFileName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receiptError, setReceiptError] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Helpers
  const toggleFlower = (id: string) => {
    setSelectedFlowers((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const toggleColor = (id: string) => {
    setSelectedColors((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (referenceImages.length >= 5) return;
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) return;
      if (file.size > 5 * 1024 * 1024) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        setReferenceImages((prev) => {
          if (prev.length >= 5) return prev;
          return [...prev, ev.target?.result as string];
        });
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeRefImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) { setReceiptError('Please upload a valid image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setReceiptError('File must be under 5MB.'); return; }
    setReceiptError('');
    setError('');
    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setReceiptImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeReceipt = () => {
    setReceiptImage(null);
    setReceiptFileName('');
    setReceiptError('');
    if (gcashReceiptRef.current) gcashReceiptRef.current.value = '';
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'paymentMethod' || name === 'gcashRefNumber') { setError(''); setReceiptError(''); }
  };

  const getBudget = () => {
    const b = BUDGET_RANGES.find((br) => br.id === selectedBudget);
    return b || { min: 0, max: 0 };
  };

  const formatPrice = (price: number) => `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Validation per step
  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedFlowers.length > 0 && selectedColors.length > 0 && selectedStyle !== '';
      case 2:
        return selectedOccasion !== '' && selectedBudget !== '' && description.trim().length > 0;
      case 3:
        return true; // reference images are optional
      case 4:
        return formData.pickupDate !== '' && formData.pickupTime !== '';
      default:
        return true;
    }
  };

  const validateGcash = (): boolean => {
    const ref = formData.gcashRefNumber.trim();
    if (!/^\d{13}$/.test(ref)) {
      setError('The reference number is invalid. GCash reference numbers must be exactly 13 digits.');
      return false;
    }
    if (!receiptImage) {
      setReceiptError('Please upload your GCash receipt screenshot.');
      return false;
    }
    // Admin verifies the actual e-wallet receipt later.
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setReceiptError('');

    if (!formData.gcashRefNumber.trim()) { setError('Please enter your GCash reference number.'); return; }
    if (!receiptImage) { setReceiptError('Please upload your GCash receipt screenshot.'); return; }
    if (!validateGcash()) return;

    const budget = getBudget();

    const customArrangement: CustomArrangement = {
      description,
      flowerTypes: selectedFlowers,
      colors: selectedColors,
      style: selectedStyle,
      occasion: selectedOccasion,
      budgetMin: budget.min,
      budgetMax: budget.max,
      referenceImages,
      additionalNotes,
    };

    setLoading(true);
    try {
      const order = await Promise.resolve(
        createOrder({
          customerId: currentUser!.id,
          customerName: formData.fullName,
          contactNumber: formData.contactNumber,
          email: formData.email,
          items: [],
          totalAmount: budget.min,
          pickupDate: formData.pickupDate,
          pickupTime: formData.pickupTime,
          messageCard: formData.messageCard,
          paymentMethod: formData.paymentMethod,
          gcashRefNumber: formData.gcashRefNumber.trim(),
          gcashReceiptImage: receiptImage || undefined,
          customArrangement,
          isCustomOrder: true,
        })
      );

      if (!order || !order.orderNumber) {
        throw new Error('Order was not created. Please try again.');
      }

      setOrderNumber(order.orderNumber);
      setOrderComplete(true);
    } catch (err) {
      console.error('Custom order failed:', err);
      setError(
        err instanceof Error
          ? `Could not submit custom order: ${err.message}`
          : 'Could not submit custom order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ============ ORDER COMPLETE ============
  if (orderComplete) {
    const budget = getBudget();
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-slideUp">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Custom Order Submitted!</h2>
          <p className="text-gray-500 mb-6">Our florist will review your design and prepare a unique arrangement just for you! 🌸</p>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50 mb-6 text-left">
            <div className="text-center mb-4">
              <span className="text-sm text-gray-500">Order Number</span>
              <p className="text-2xl font-bold text-rose-600 tracking-wider">{orderNumber}</p>
              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-bold">✨ Custom Order</span>
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Budget</span>
                <span className="text-rose-600 font-bold">{formatPrice(budget.min)} – {formatPrice(budget.max)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pickup</span>
                <span className="text-gray-700 font-medium">{formData.pickupDate} at {formData.pickupTime}</span>
              </div>
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
            <button onClick={() => onNavigate('my-orders')} className="flex-1 py-3 rounded-xl text-white font-semibold transition-all hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}>
              View My Orders
            </button>
            <button onClick={() => onNavigate('dashboard')} className="flex-1 py-3 rounded-xl text-rose-600 font-semibold border border-rose-200 hover:bg-rose-50 transition-all">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ STEPPER ============
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => step === 1 ? onNavigate('dashboard') : setStep(step - 1)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              ✨ Customize Your Arrangement
            </h1>
            <p className="text-gray-500 text-sm">Design your dream flower arrangement</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {['Design', 'Details', 'Reference Photos', 'Checkout'].map((label, i) => (
              <div key={label} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                  i + 1 < step ? 'bg-rose-500 text-white' :
                  i + 1 === step ? 'bg-rose-600 text-white ring-4 ring-rose-100' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i + 1 <= step ? 'text-rose-600' : 'text-gray-400'}`}>{label}</span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%`, background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}
            />
          </div>
        </div>

        {/* ===== STEP 1: DESIGN ===== */}
        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            {/* Flower Types */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50">
              <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <Flower2 size={20} className="text-rose-500" />
                Flower Types
              </h3>
              <p className="text-gray-400 text-sm mb-4">Select one or more flowers you want (you can pick multiple)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {FLOWER_TYPES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleFlower(f.id)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedFlowers.includes(f.id)
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-200 ring-2 ring-rose-300'
                        : 'bg-gray-50 text-gray-600 hover:bg-rose-50 hover:text-rose-600 border border-gray-200'
                    }`}
                  >
                    <span className="text-lg">{f.emoji}</span>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50">
              <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <Palette size={20} className="text-rose-500" />
                Preferred Colors
              </h3>
              <p className="text-gray-400 text-sm mb-4">Choose your color palette</p>
              <div className="flex flex-wrap gap-3">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleColor(c.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedColors.includes(c.id)
                        ? 'ring-2 ring-rose-400 bg-rose-50 text-rose-700 shadow-sm'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex-shrink-0 ${c.border ? 'border-2 border-gray-300' : ''}`}
                      style={{ background: c.hex }}
                    />
                    {c.label}
                    {selectedColors.includes(c.id) && <CheckCircle2 size={14} className="text-rose-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50">
              <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <Sparkles size={20} className="text-rose-500" />
                Arrangement Style
              </h3>
              <p className="text-gray-400 text-sm mb-4">How would you like your flowers arranged?</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STYLE_OPTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStyle(s.id)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedStyle === s.id
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-200 ring-2 ring-rose-300'
                        : 'bg-gray-50 text-gray-600 hover:bg-rose-50 border border-gray-200'
                    }`}
                  >
                    <div className="text-2xl mb-1">{s.emoji}</div>
                    <p className="text-sm font-semibold">{s.label}</p>
                    <p className={`text-xs mt-0.5 ${selectedStyle === s.id ? 'text-rose-100' : 'text-gray-400'}`}>{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 2: DETAILS ===== */}
        {step === 2 && (
          <div className="space-y-8 animate-fadeIn">
            {/* Occasion */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50">
              <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <Gift size={20} className="text-rose-500" />
                Occasion
              </h3>
              <p className="text-gray-400 text-sm mb-4">What is this arrangement for?</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {OCCASION_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelectedOccasion(o.id)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      selectedOccasion === o.id
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-600 hover:bg-rose-50 border border-gray-200'
                    }`}
                  >
                    <div className={`flex justify-center mb-1 ${selectedOccasion === o.id ? 'text-white' : 'text-rose-400'}`}>{o.icon}</div>
                    <p className="text-xs font-semibold">{o.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50">
              <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                💰 Budget Range
              </h3>
              <p className="text-gray-400 text-sm mb-4">Select your preferred budget</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {BUDGET_RANGES.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBudget(b.id)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedBudget === b.id
                        ? 'bg-rose-500 text-white shadow-md ring-2 ring-rose-300'
                        : 'bg-gray-50 text-gray-600 hover:bg-rose-50 border border-gray-200'
                    }`}
                  >
                    <p className="font-bold text-sm">{b.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50">
              <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <MessageSquare size={20} className="text-rose-500" />
                Describe Your Vision
              </h3>
              <p className="text-gray-400 text-sm mb-4">Tell our florist what you have in mind</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="E.g., I want a romantic bouquet with red and pink roses, wrapped in white paper with a satin ribbon. It's for my girlfriend's birthday..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-gray-700 resize-none text-sm"
                required
              />
              <p className="text-xs text-gray-400 mt-1">{description.length} characters</p>
            </div>

            {/* Additional Notes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50">
              <h3 className="text-lg font-bold text-gray-800 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>📝 Additional Notes (Optional)</h3>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={2}
                placeholder="Any allergies, specific requests, or special instructions..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-gray-700 resize-none text-sm"
              />
            </div>
          </div>
        )}

        {/* ===== STEP 3: REFERENCE IMAGES ===== */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50">
              <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <ImageIcon size={20} className="text-rose-500" />
                Upload Reference Photos
              </h3>
              <p className="text-gray-400 text-sm mb-2">
                Upload sample images of flower arrangements you like so our florist can match your vision. (Optional, max 5 images)
              </p>

              {/* Upload Area */}
              <div
                onClick={() => referenceImages.length < 5 && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  referenceImages.length >= 5
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : 'border-rose-300 hover:border-rose-400 hover:bg-rose-50 cursor-pointer'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3">
                  <Upload size={24} className="text-rose-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {referenceImages.length >= 5 ? 'Maximum 5 images reached' : 'Click to upload reference photos'}
                </p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG or WEBP · Max 5MB each · Up to 5 images</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleRefImageUpload}
                className="hidden"
              />

              {/* Uploaded images grid */}
              {referenceImages.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Uploaded Reference Photos ({referenceImages.length}/5)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {referenceImages.map((img, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border-2 border-rose-200 aspect-square bg-gray-50">
                        <img src={img} alt={`Reference ${i + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                        <button
                          onClick={() => removeRefImage(i)}
                          className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                        <div className="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          <span className="text-xs font-bold text-gray-700">#{i + 1}</span>
                        </div>
                      </div>
                    ))}
                    {referenceImages.length < 5 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-300 transition-all"
                      >
                        <Upload size={20} />
                        <span className="text-xs mt-1">Add more</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Preview card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                ✨ Your Custom Design Summary
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400 text-xs">Flowers</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedFlowers.map((f) => {
                      const ft = FLOWER_TYPES.find((x) => x.id === f);
                      return <span key={f} className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-medium">{ft?.emoji} {ft?.label}</span>;
                    })}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Colors</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedColors.map((c) => {
                      const co = COLOR_OPTIONS.find((x) => x.id === c);
                      return (
                        <span key={c} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full inline-block" style={{ background: co?.hex }} />
                          {co?.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Style</span>
                  <p className="font-medium text-gray-700">{STYLE_OPTIONS.find((s) => s.id === selectedStyle)?.emoji} {STYLE_OPTIONS.find((s) => s.id === selectedStyle)?.label}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Occasion</span>
                  <p className="font-medium text-gray-700">{OCCASION_OPTIONS.find((o) => o.id === selectedOccasion)?.label}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Budget</span>
                  <p className="font-medium text-rose-600">{BUDGET_RANGES.find((b) => b.id === selectedBudget)?.label}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Reference Photos</span>
                  <p className="font-medium text-gray-700">{referenceImages.length} uploaded</p>
                </div>
              </div>
              {description && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-100">
                  <span className="text-gray-400 text-xs">Description</span>
                  <p className="text-sm text-gray-700 mt-0.5 italic">"{description}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== STEP 4: CHECKOUT ===== */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Personal Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>👤 Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-gray-700" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-gray-700" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-gray-700" required />
                </div>
              </div>
            </div>

            {/* Pickup */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <Calendar size={20} className="text-rose-500" /> Pickup Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
                  <input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleFormChange} min={minDate} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-gray-700" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Time</label>
                  <select name="pickupTime" value={formData.pickupTime} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-gray-700" required>
                    <option value="">Select time</option>
                    {['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Message Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <MessageSquare size={20} className="text-rose-500" /> Message Card (Optional)
              </h3>
              <textarea name="messageCard" value={formData.messageCard} onChange={handleFormChange} rows={2} placeholder="Write a message to include with your flowers..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-gray-700 resize-none" />
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <CreditCard size={20} className="text-rose-500" /> Payment Method
              </h3>
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-500 bg-blue-50">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">G</div>
                <div><span className="font-semibold text-gray-800">GCash</span><p className="text-xs text-gray-500">Pay via GCash mobile wallet</p></div>
                <CheckCircle2 size={18} className="text-blue-500 ml-auto" />
              </div>

              {/* GCash Details */}
              <div className="mt-5 space-y-5">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">G</div>
                      GCash Payment Instructions
                    </h4>
                    <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Send payment to <strong>09123456789</strong></li>
                      <li>Min deposit amount: <strong>{formatPrice(getBudget().min)}</strong></li>
                      <li>Enter 13-digit reference number below</li>
                      <li>Upload screenshot of payment</li>
                    </ol>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Hash size={15} className="text-blue-500" /> GCash Reference Number <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.gcashRefNumber} onChange={(e) => { setFormData({ ...formData, gcashRefNumber: e.target.value.replace(/\D/g, '').slice(0, 13) }); setError(''); setReceiptError(''); }} placeholder="13-digit reference" maxLength={13}
                      className={`w-full px-4 py-3 rounded-xl border font-mono text-lg tracking-widest text-gray-700 transition-all ${error && error.includes('reference') ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`} />
                    <div className="flex justify-between mt-1"><p className="text-xs text-gray-400">Must be 13 digits</p><p className={`text-xs font-mono font-bold ${formData.gcashRefNumber.length === 13 ? 'text-emerald-500' : 'text-gray-400'}`}>{formData.gcashRefNumber.length}/13</p></div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><ImageIcon size={15} className="text-blue-500" /> Receipt Screenshot <span className="text-red-500">*</span></label>
                    {!receiptImage ? (
                      <div onClick={() => gcashReceiptRef.current?.click()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-blue-50 ${receiptError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'}`}>
                        <Upload size={24} className="text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload receipt</p>
                        <p className="text-xs text-gray-400">JPG, PNG · Max 5MB</p>
                      </div>
                    ) : (
                      <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-3 flex items-start gap-3">
                        <div className="w-20 h-28 rounded-lg overflow-hidden border border-blue-200 bg-white flex-shrink-0"><img src={receiptImage} alt="Receipt" className="w-full h-full object-contain" /></div>
                        <div className="flex-1 py-1">
                          <div className="flex items-center gap-2 mb-1"><CheckCircle2 size={14} className="text-emerald-500" /><span className="text-sm font-semibold text-emerald-700">Uploaded</span></div>
                          <p className="text-xs text-gray-500 truncate">{receiptFileName}</p>
                          <button type="button" onClick={() => gcashReceiptRef.current?.click()} className="text-xs text-blue-600 font-medium hover:text-blue-700 mt-1">Change</button>
                        </div>
                        <button type="button" onClick={removeReceipt} className="p-1 rounded-lg hover:bg-red-100 text-red-400"><X size={16} /></button>
                      </div>
                    )}
                    <input ref={gcashReceiptRef} type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
                  </div>
                  {receiptError && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200"><AlertTriangle size={16} className="text-red-500" /><p className="text-sm text-red-600 font-medium">{receiptError}</p></div>}
                </div>
              {error && (
                <div className="mt-4 flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200 animate-fadeIn">
                  <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div><p className="text-sm text-red-700 font-semibold">Payment Details Required</p><p className="text-sm text-red-600 mt-0.5">{error}</p></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== NAVIGATION BUTTONS ===== */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            onClick={() => step === 1 ? onNavigate('dashboard') : setStep(step - 1)}
            className="px-6 py-3 rounded-xl text-gray-600 font-semibold border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="px-8 py-3 rounded-xl text-white font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}
            >
              Continue
              <span>→</span>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.pickupDate || !formData.pickupTime}
              className="px-8 py-3 rounded-xl text-white font-semibold transition-all hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ShoppingBag size={18} /> Submit Custom Order</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
