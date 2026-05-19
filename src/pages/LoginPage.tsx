import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flower2, Eye, EyeOff, LogIn, MapPin, Navigation, Clock, Phone, ExternalLink } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(async () => {
      const result = await login(identifier, password);
      if (result.success) {
        // Navigation handled by App.tsx
      } else {
        setError(result.message);
      }
      setLoading(false);
    }, 500);
  };

  const LAT = 10.414779;
  const LNG = 125.185361;

  // Google Maps Embed using the place mode for a proper pin
  const mapEmbedUrl = `https://maps.google.com/maps?q=${LAT},${LNG}&t=m&z=16&output=embed&iwloc=near`;

  // Google Maps link for "Open in Google Maps" / "Get Directions"
  const mapLinkUrl = `https://www.google.com/maps/place/${LAT},${LNG}/@${LAT},${LNG},16z`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`;

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)' }}>
      {/* Left side - Branding & Google Maps */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full border-2 border-white" />
          <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full border-2 border-white" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full border border-white" />
        </div>
        <div className="text-center text-white z-10 px-10 max-w-lg w-full">
          {/* Logo & Name */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Flower2 size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Macel's</h1>
          <h2 className="text-3xl font-light mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Flower Shop</h2>
          <div className="w-16 h-0.5 bg-white/60 mx-auto my-4" />
          <p className="text-sm opacity-90 leading-relaxed mb-5">
            Beautiful flowers for every occasion.<br />
            Order fresh blooms online with ease.
          </p>

          {/* Google Maps Embed */}
          <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 mb-4 relative group">
            <iframe
              title="Macel's Flower Shop - Google Maps"
              src={mapEmbedUrl}
              width="100%"
              height="220"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
            {/* Overlay link to open in Google Maps */}
            <a
              href={mapLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-3 bg-white rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-3.5 h-3.5" />
              Open in Google Maps
              <ExternalLink size={10} />
            </a>
          </div>

          {/* Location Details Card */}
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-left">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-rose-200 uppercase tracking-wider">Address</p>
                  <p className="text-sm font-semibold text-white leading-tight">Canipaan</p>
                  <p className="text-xs text-rose-200">Hinunangan, Southern Leyte</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Navigation size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-rose-200 uppercase tracking-wider">Coordinates</p>
                  <p className="text-xs font-mono font-semibold text-white">{LAT}</p>
                  <p className="text-xs font-mono font-semibold text-white">{LNG}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-rose-200 uppercase tracking-wider">Hours</p>
                  <p className="text-sm font-semibold text-white">8:00 AM – 5:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-rose-200 uppercase tracking-wider">Order</p>
                  <p className="text-sm font-semibold text-white">Online 24/7</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-rose-600 text-sm font-bold hover:bg-rose-50 transition-all shadow-md"
              >
                <Navigation size={14} />
                Get Directions
              </a>
              <a
                href={mapLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-all"
              >
                <MapPin size={14} />
                View on Map
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-md animate-fadeIn">
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}>
                <Flower2 size={28} className="text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-rose-800" style={{ fontFamily: "'Playfair Display', serif" }}>Macel's Flower Shop</h1>
            <p className="text-rose-500 text-sm mt-1 flex items-center justify-center gap-1">
              <MapPin size={12} />
              Canipaan, Hinunangan, Southern Leyte
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-rose-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>Welcome Back</h2>
              <p className="text-gray-500 mt-2">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email or Username</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-gray-700"
                  placeholder="Enter your email or username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-gray-700 pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={20} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => onNavigate('register')}
                  className="text-rose-600 font-semibold hover:text-rose-700 transition-colors"
                >
                  Register here
                </button>
              </p>
            </div>

            <div className="mt-6 p-3 rounded-lg bg-rose-50 border border-rose-100">
              <p className="text-xs text-rose-600 text-center font-medium">Demo Admin Login</p>
              <p className="text-xs text-rose-500 text-center mt-1">Username: admin | Password: admin123</p>
            </div>
          </div>

          {/* Google Maps Location Card (below login) */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">
            {/* Google Maps Embed (mobile + desktop) */}
            <div className="relative group">
              <iframe
                title="Macel's Flower Shop Location - Google Maps"
                src={mapEmbedUrl}
                width="100%"
                height="180"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
              {/* Google Maps branding overlay */}
              <a
                href={mapLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 bg-white rounded-md px-2 py-1 shadow-md flex items-center gap-1 text-[10px] font-semibold text-gray-600 hover:bg-gray-50 transition-all opacity-80 group-hover:opacity-100"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-3 h-3" />
                Google Maps
                <ExternalLink size={8} />
              </a>
            </div>

            {/* Location Info */}
            <div className="p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}>
                  <MapPin size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>Macel's Flower Shop</p>
                  <p className="text-xs text-gray-400">📍 Visit us or order online</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 rounded-xl p-2.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <MapPin size={12} className="text-rose-400" />
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Address</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700">Canipaan</p>
                  <p className="text-[11px] text-gray-500">Hinunangan, So. Leyte</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Navigation size={12} className="text-rose-400" />
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">GPS</span>
                  </div>
                  <p className="text-xs font-mono font-semibold text-gray-700">{LAT}</p>
                  <p className="text-xs font-mono font-semibold text-gray-700">{LNG}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Clock size={12} className="text-rose-400" />
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Hours</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700">8:00 AM – 5:00 PM</p>
                  <p className="text-[11px] text-gray-500">Mon – Sat</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Phone size={12} className="text-rose-400" />
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Order</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700">Online 24/7</p>
                  <p className="text-[11px] text-gray-500">Via this website</p>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}
                >
                  <Navigation size={14} />
                  Get Directions
                </a>
                <a
                  href={mapLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 transition-all"
                >
                  <ExternalLink size={14} />
                  Open Map
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
