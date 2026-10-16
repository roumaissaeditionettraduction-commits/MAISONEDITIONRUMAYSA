import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { OrderItem, Wilaya, Order, StoreSettings } from '../types';
import { StorageService } from '../services/storage';
import { PixelService } from '../services/pixelService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onCheckoutCod: (order: Order) => void;
  onCheckoutChargily: (order: Order) => void;
  storeSettings: StoreSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutCod,
  onCheckoutChargily,
  storeSettings
}) => {
  if (!isOpen) return null;

  const wilayas = StorageService.getWilayas().filter(w => w.isAvailable);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedWilayaId, setSelectedWilayaId] = useState<number>(16); // Default Alger
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'home' | 'desk'>('home');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'chargily'>('cod');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  const selectedWilaya = wilayas.find(w => w.id === selectedWilayaId) || wilayas[0];

  // Calculate Subtotal
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Check if cart has only ePub digital items
  const isOnlyEpub = items.length > 0 && items.every(i => i.format === 'epub');

  // Shipping calculation: Free if threshold met or if order is digital ePub only!
  const isFreeShipping = isOnlyEpub || subtotal >= storeSettings.freeShippingThreshold;
  const shippingFee = isFreeShipping
    ? 0
    : deliveryType === 'home'
    ? (selectedWilaya?.homeDeliveryFee || 500)
    : (selectedWilaya?.deskDeliveryFee || 350);

  const totalAmount = subtotal + shippingFee;

  // Track abandoned cart automatically when name and phone are filled
  useEffect(() => {
    if (phone.length >= 9 && items.length > 0) {
      StorageService.addAbandonedCart({
        id: `ab-${Date.now()}`,
        customerName: customerName || 'زبون زائر',
        phone,
        email,
        wilayaName: selectedWilaya?.nameAr,
        items,
        totalAmount,
        createdAt: new Date().toISOString(),
        recovered: false,
        reminderSent: false
      });
    }
  }, [phone, items, subtotal, customerName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (items.length === 0) {
      setValidationError('السلة فارغة، يرجى اختيار كتاب أولاً.');
      return;
    }

    if (!customerName.trim()) {
      setValidationError('يرجى كتابة الاسم الكامل.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 9) {
      setValidationError('يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0550123456).');
      return;
    }

    if (!isOnlyEpub && !address.trim()) {
      setValidationError('يرجى تحديد عنوان التوصيل أو الحي.');
      return;
    }

    const orderNumber = `ROUM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName,
      phone,
      email,
      wilayaId: selectedWilayaId,
      wilayaName: selectedWilaya?.nameAr || 'الجزائر العاصمة',
      commune: commune || 'المركز',
      address: isOnlyEpub ? 'طلب إلكتروني (رابط تنزيل مباشر)' : address,
      deliveryType,
      items,
      subtotal,
      shippingCost: shippingFee,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'chargily' ? 'pending' : 'pending',
      orderStatus: 'new',
      createdAt: new Date().toISOString(),
      downloadToken: `dl_${Math.random().toString(36).substring(2, 10)}_epub`,
      downloadCount: 0,
      notes
    };

    PixelService.trackInitiateCheckout(totalAmount, items.length);

    if (paymentMethod === 'chargily') {
      onCheckoutChargily(newOrder);
    } else {
      onCheckoutCod(newOrder);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs flex justify-start animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto text-right border-l border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-700" />
            <h2 className="font-editorial text-lg sm:text-xl font-bold text-stone-900">
              سلة التسوق وإتمام الطلب
            </h2>
            <span className="text-xs text-stone-500 font-mono">({items.length} عنصر)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Alert Banner */}
        {!isOnlyEpub && (
          <div className="bg-amber-50/80 px-4 py-2 border-b border-amber-200/60 text-xs text-amber-900 flex items-center justify-between">
            {isFreeShipping ? (
              <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                <Truck className="w-4 h-4 text-emerald-600" />
                تهانينا! طلبيتك مؤهلة للشحن المجاني لكافة الولايات.
              </span>
            ) : (
              <span>
                أضف كتباً بقيمة{' '}
                <strong className="font-mono font-bold text-stone-900">
                  {(storeSettings.freeShippingThreshold - subtotal).toLocaleString('ar-DZ')} دج
                </strong>{' '}
                إضافية للحصول على توصيل مجاني!
              </span>
            )}
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-stone-600 font-medium text-sm">
                سلة مشترياتك فارغة حالياً.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800 transition-colors"
              >
                تصفح معرض الكتب
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={`${item.bookId}-${item.format}-${index}`}
                  className="flex items-center justify-between gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-right"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          item.format === 'epub'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-stone-200 text-stone-800'
                        }`}
                      >
                        {item.format === 'epub' ? 'كتاب إلكتروني ePub' : 'ورقي مطبوع'}
                      </span>
                      <span className="text-xs text-stone-500 truncate">{item.author}</span>
                    </div>
                    <h4 className="font-bold text-sm text-stone-900 truncate">
                      {item.title}
                    </h4>
                    <div className="font-mono text-xs font-bold text-stone-900 mt-1 tabular-nums">
                      {item.price.toLocaleString('ar-DZ')} دج{' '}
                      {item.quantity > 1 && (
                        <span className="text-[11px] text-stone-500 font-normal">
                          (المجموع: {(item.price * item.quantity).toLocaleString('ar-DZ')} دج)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center gap-2">
                    {item.format === 'print' && (
                      <div className="flex items-center border border-stone-300 bg-white rounded-lg">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                          className="px-2 py-0.5 text-stone-600 hover:text-stone-950 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          className="px-2 py-0.5 text-stone-600 hover:text-stone-950 font-bold"
                        >
                          +
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                      title="حذف من السلة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Checkout Form */}
          {items.length > 0 && (
            <form onSubmit={handleSubmit} className="pt-4 border-t border-stone-200 space-y-4">
              <h3 className="font-bold text-sm text-stone-900 flex items-center justify-between">
                <span>معلومات الزبون والشحن</span>
                <span className="text-[11px] font-normal text-stone-500">
                  (يتم حفظ السلة تلقائياً لضمان طلبك)
                </span>
              </h3>

              {validationError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                  {validationError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="مثال: عبد القادر الجزائري"
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    رقم الهاتف (للتوصيل) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05 / 06 / 07 ..."
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  البريد الإلكتروني (لتسلم نسخة ePub والفاتورة)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600 font-mono text-left"
                />
              </div>

              {!isOnlyEpub && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            {w.code} - {w.nameAr} ({w.nameFr})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        البلدية / الدائرة
                      </label>
                      <input
                        type="text"
                        value={commune}
                        onChange={(e) => setCommune(e.target.value)}
                        placeholder="البلدية أو الحي"
                        className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      عنوان التوصيل الدقيق *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="اسم الشارع، رقم العمارة أو علامة مميزة"
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600"
                    />
                  </div>

                  {/* Delivery Location Type */}
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1.5">
                      مكان استلام الطرد:
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setDeliveryType('home')}
                        className={`p-2.5 rounded-lg border text-right transition-all flex flex-col justify-between ${
                          deliveryType === 'home'
                            ? 'border-amber-600 bg-amber-50/50 font-bold ring-1 ring-amber-600'
                            : 'border-stone-200 bg-stone-50 text-stone-600'
                        }`}
                      >
                        <span>توصيل لباب المنزل</span>
                        <span className="font-mono text-stone-900 mt-1">
                          {isFreeShipping ? 'مجاني' : `${selectedWilaya?.homeDeliveryFee} دج`}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryType('desk')}
                        className={`p-2.5 rounded-lg border text-right transition-all flex flex-col justify-between ${
                          deliveryType === 'desk'
                            ? 'border-amber-600 bg-amber-50/50 font-bold ring-1 ring-amber-600'
                            : 'border-stone-200 bg-stone-50 text-stone-600'
                        }`}
                      >
                        <span>استلام من المكتب (Stop Desk)</span>
                        <span className="font-mono text-stone-900 mt-1">
                          {isFreeShipping ? 'مجاني' : `${selectedWilaya?.deskDeliveryFee} دج`}
                        </span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-900 mb-1.5">
                  طريقة الدفع المفضلة:
                </label>
                <div className="space-y-2">
                  {!isOnlyEpub && (
                    <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <div>
                          <div className="text-xs font-bold text-stone-900">
                            الدفع نقداً عند الاستلام (COD)
                          </div>
                          <div className="text-[11px] text-stone-500">
                            تدفع لعامل التوصيل بعد معاينة كتابك الورقي
                          </div>
                        </div>
                      </div>
                      <Truck className="w-5 h-5 text-stone-400" />
                    </label>
                  )}

                  <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    paymentMethod === 'chargily'
                      ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'chargily'}
                        onChange={() => setPaymentMethod('chargily')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                          <span>دفع إلكتروني عبر شارجلي باي (Chargily Pay)</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                            الذهبية و CIB
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500">
                          دفع آمن وفوري 100%، يفتح رابط تنزيل ePub فوراً
                        </div>
                      </div>
                    </div>
                    <CreditCard className="w-5 h-5 text-amber-700" />
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  ملاحظات إضافية للناشر أو الموزع (اختياري)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="وقت التوصيل المناسب، طلب إهداء أو توقيع الكاتب..."
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              {/* Price Calculation Summary */}
              <div className="p-3.5 bg-stone-100 rounded-xl space-y-1.5 text-xs text-stone-700">
                <div className="flex justify-between">
                  <span>مجموع الكتب:</span>
                  <span className="font-mono font-bold text-stone-900 tabular-nums">
                    {subtotal.toLocaleString('ar-DZ')} دج
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>مصاريف التوصيل ({selectedWilaya?.nameAr}):</span>
                  <span className="font-mono font-bold text-stone-900 tabular-nums">
                    {isFreeShipping ? (
                      <span className="text-emerald-700 font-bold">مجاني</span>
                    ) : (
                      `${shippingFee.toLocaleString('ar-DZ')} دج`
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-950">
                  <span>المبلغ الإجمالي للدفع:</span>
                  <span className="font-mono text-base text-amber-800 tabular-nums">
                    {totalAmount.toLocaleString('ar-DZ')} دج
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
              >
                <span>
                  {paymentMethod === 'chargily'
                    ? 'الانتقال لبوابة الدفع شارجلي باي (Chargily Pay)'
                    : 'تأكيد طلب الشراء والدفع عند الاستلام'}
                </span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>جميع المعاملات مشفرة ومحمية ببروتوكول SSL 256-Bit</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
