import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Truck, Star, CheckCircle, ArrowRight, BookOpen, Gift, ArrowLeft } from 'lucide-react';
import { Book, Wilaya, Order, LandingPageConfig } from '../types';
import { StorageService } from '../services/storage';
import { PixelService } from '../services/pixelService';

interface LandingPageViewProps {
  config: LandingPageConfig;
  book: Book;
  onBackToStore: () => void;
  onOrderSuccess: (order: Order) => void;
  onOrderChargily: (order: Order) => void;
  onOpenReader: (book: Book) => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  config,
  book,
  onBackToStore,
  onOrderSuccess,
  onOrderChargily,
  onOpenReader
}) => {
  const wilayas = StorageService.getWilayas().filter(w => w.isAvailable);

  const [timeLeft, setTimeLeft] = useState(config.countdownMinutes * 60);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedWilayaId, setSelectedWilayaId] = useState<number>(16);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'chargily'>('cod');
  const [selectedFormat, setSelectedFormat] = useState<'print' | 'epub'>('print');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  const selectedWilaya = wilayas.find(w => w.id === selectedWilayaId) || wilayas[0];

  useEffect(() => {
    PixelService.trackViewContent(book.title, book.pricePrint, 'landing_page');
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [book]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const basePrice = selectedFormat === 'print' ? book.pricePrint : book.priceEpub;
  const discountedPrice = Math.round(basePrice * (1 - config.discountPercentage / 100));
  const shippingFee = selectedFormat === 'epub' ? 0 : 350; // Discounted promotional delivery rate
  const grandTotal = (discountedPrice * quantity) + shippingFee;

  // Auto record abandoned cart
  useEffect(() => {
    if (phone.length >= 9) {
      StorageService.addAbandonedCart({
        id: `ab-lp-${Date.now()}`,
        customerName: customerName || 'زائر صفحة الهبوط',
        phone,
        wilayaName: selectedWilaya?.nameAr,
        items: [{
          bookId: book.id,
          title: book.title,
          author: book.author,
          format: selectedFormat,
          price: discountedPrice,
          quantity
        }],
        totalAmount: grandTotal,
        createdAt: new Date().toISOString(),
        recovered: false,
        reminderSent: false
      });
    }
  }, [phone, selectedFormat, quantity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('يرجى إدخال اسمك الكريم');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      setError('يرجى إدخال رقم هاتف صحيح');
      return;
    }
    if (selectedFormat === 'print' && !address.trim()) {
      setError('يرجى كتابة عنوان التوصيل');
      return;
    }

    const order: Order = {
      id: `ord-lp-${Date.now()}`,
      orderNumber: `ROUM-LP-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      phone,
      wilayaId: selectedWilayaId,
      wilayaName: selectedWilaya.nameAr,
      commune: 'البلدية المركزية',
      address: selectedFormat === 'epub' ? 'طلب رقمي مباشر' : address,
      deliveryType: 'home',
      items: [{
        bookId: book.id,
        title: book.title,
        author: book.author,
        format: selectedFormat,
        price: discountedPrice,
        quantity
      }],
      subtotal: discountedPrice * quantity,
      shippingCost: shippingFee,
      totalAmount: grandTotal,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'new',
      createdAt: new Date().toISOString(),
      notes: 'طلب عبر صفحة الهبوط الترويجية الخاصة'
    };

    PixelService.trackInitiateCheckout(grandTotal, 1);

    if (paymentMethod === 'chargily') {
      onOrderChargily(order);
    } else {
      StorageService.addOrder(order);
      PixelService.trackPurchase(order.orderNumber, grandTotal, 'cod', 1);
      onOrderSuccess(order);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 text-right pb-16">
      {/* Top Floating Urgency Bar */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-950 text-white py-2.5 px-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span>{config.urgencyBanner}</span>
          </div>

          <div className="flex items-center gap-2 font-mono bg-black/30 px-3 py-1 rounded-full text-amber-300 font-bold">
            <Clock className="w-4 h-4 text-rose-300" />
            <span>
              ينتهي العرض خلال: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Top Brand Bar */}
      <div className="bg-white border-b border-stone-200 py-4 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rotate-180" />
            <span>العودة للمتجر الرئيسي</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 font-editorial font-bold flex items-center justify-center text-base">
              ر
            </div>
            <span className="font-editorial text-lg font-bold text-stone-900">
              دار النشر رميسة إيديسيو
            </span>
          </div>
        </div>
      </div>

      {/* Hero Campaign Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Right/Main Content Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block px-3 py-1 bg-rose-100 text-rose-900 rounded-full text-xs font-bold border border-rose-300">
              طبعة خاصة محدودة · خصم {config.discountPercentage}% حصري
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-950 leading-tight">
              {config.heroHeadline}
            </h1>

            <p className="font-editorial text-lg text-stone-700 leading-relaxed">
              {config.heroSubheadline}
            </p>

            {/* Price Badge */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-500 block">السعر الترويجي الخاص:</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-extrabold text-rose-800 tabular-nums">
                    {discountedPrice.toLocaleString('ar-DZ')} دج
                  </span>
                  <span className="font-mono text-base text-stone-400 line-through tabular-nums">
                    {basePrice.toLocaleString('ar-DZ')} دج
                  </span>
                </div>
              </div>

              <div className="text-left font-mono text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 font-bold">
                توفير: {(basePrice - discountedPrice).toLocaleString('ar-DZ')} دج
              </div>
            </div>

            {/* Exclusive Gifts / Features List */}
            <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/80 space-y-3">
              <h3 className="font-bold text-sm text-amber-950 flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-700" />
                <span>المزايا والهدايا الحصرية المرفقة مع هذا العرض:</span>
              </h3>
              <ul className="space-y-2 text-xs text-stone-700">
                {config.featuresList.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reader Reviews & Social Proof */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-sm text-stone-900">
                آراء نخبة القراء والنقاد:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                  <p className="italic text-stone-700 mb-2">
                    "من أعمق الروايات التي صدرت بالجزائر هذا العام، طبعة دار رميسة فاخرة جداً والورق مريح للغاية."
                  </p>
                  <span className="font-bold text-stone-900 block">— أ. مراد بن سالم، أستاذ أدب مقارن (قسنطينة)</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                  <p className="italic text-stone-700 mb-2">
                    "وصلني الطرد في وهران خلال 24 ساعة، تغليف ممتاز وفاصل الكتب هدية راقية جداً."
                  </p>
                  <span className="font-bold text-stone-900 block">— د. سارة خثير، طبيبة وقارئة (وهران)</span>
                </div>
              </div>
            </div>

          </div>

          {/* Left/Embedded Direct Order Box */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="bg-white rounded-2xl border-2 border-amber-600/40 p-6 shadow-xl relative">
              <div className="text-center pb-4 mb-4 border-b border-stone-200">
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-1">
                  استمارة الطلب السريع بنقرة واحدة
                </span>
                <h3 className="font-editorial text-xl font-bold text-stone-900">
                  احجز نسختك الآن قبل نفاد الكمية!
                </h3>
              </div>

              {error && (
                <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Format Selector */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    اختر نوع النسخة:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedFormat('print')}
                      className={`p-2.5 rounded-lg border text-right transition-all ${
                        selectedFormat === 'print'
                          ? 'border-amber-600 bg-amber-50 font-bold ring-1 ring-amber-600'
                          : 'border-stone-200 bg-stone-50'
                      }`}
                    >
                      <div>نسخة ورقية فاخرة</div>
                      <div className="font-mono text-stone-900 mt-1 font-bold">
                        {Math.round(book.pricePrint * 0.8).toLocaleString('ar-DZ')} دج
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFormat('epub')}
                      className={`p-2.5 rounded-lg border text-right transition-all ${
                        selectedFormat === 'epub'
                          ? 'border-amber-600 bg-amber-50 font-bold ring-1 ring-amber-600'
                          : 'border-stone-200 bg-stone-50'
                      }`}
                    >
                      <div>كتاب رقمي ePub</div>
                      <div className="font-mono text-amber-800 mt-1 font-bold">
                        {Math.round(book.priceEpub * 0.8).toLocaleString('ar-DZ')} دج
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    الاسم واللقب *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="اكتب اسمك الكامل"
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    رقم الهاتف المحمول (مهم للتوصيل) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05 / 06 / 07 ..."
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600 font-mono text-right"
                  />
                </div>

                {selectedFormat === 'print' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        الولاية (58 ولاية) *
                      </label>
                      <select
                        value={selectedWilayaId}
                        onChange={(e) => setSelectedWilayaId(Number(e.target.value))}
                        className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600 bg-white"
                      >
                        {wilayas.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.code} - {w.nameAr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        البلدية / العنوان الدقيق *
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="اسم الحي أو الشارع لتسليم الطرد"
                        className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600"
                      />
                    </div>
                  </>
                )}

                {/* Payment Option */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    طريقة الدفع:
                  </label>
                  <div className="space-y-1.5 text-xs">
                    {selectedFormat === 'print' && (
                      <label className="flex items-center gap-2 p-2 rounded-lg border border-stone-200 cursor-pointer">
                        <input
                          type="radio"
                          name="lp_pay"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="text-amber-600"
                        />
                        <span>الدفع نقداً عند الاستلام بعد معاينة الكتاب</span>
                      </label>
                    )}
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-stone-200 cursor-pointer">
                      <input
                        type="radio"
                        name="lp_pay"
                        checked={paymentMethod === 'chargily'}
                        onChange={() => setPaymentMethod('chargily')}
                        className="text-amber-600"
                      />
                      <span>دفع إلكتروني عبر Chargily Pay (الذهبية و CIB)</span>
                    </label>
                  </div>
                </div>

                {/* Total Summary */}
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>ثمن الكتاب:</span>
                    <span className="font-mono font-bold">{discountedPrice.toLocaleString('ar-DZ')} دج</span>
                  </div>
                  <div className="flex justify-between">
                    <span>التوصيل المخفض:</span>
                    <span className="font-mono font-bold">
                      {shippingFee === 0 ? 'مجاني' : `${shippingFee} دج`}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-stone-200 flex justify-between font-bold text-sm text-stone-900">
                    <span>الإجمالي:</span>
                    <span className="font-mono text-base text-rose-800 font-extrabold">
                      {grandTotal.toLocaleString('ar-DZ')} دج
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 animate-pulse hover:animate-none"
                >
                  <span>اضغط هنا لتأكيد الطلب الآن</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>

                <p className="text-[11px] text-stone-500 text-center">
                  {config.guaranteeText}
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
