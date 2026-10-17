import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag, Search, Plus, Minus, Trash2, Printer, CheckCircle,
  CloudLightning, Wifi, User, CreditCard, Banknote, ShieldCheck,
  RotateCcw, Sparkles, Tag, ArrowRight, X, AlertTriangle, BookOpen
} from 'lucide-react';
import { Book, Order, OrderItem, PaymentMethod } from '../../types';
import { StorageService } from '../../services/storage';
import { SanityService } from '../../services/sanityService';

interface PosTerminalProps {
  books: Book[];
  onBackToStore: () => void;
  onNavigateAdmin: () => void;
}

export const PosTerminal: React.FC<PosTerminalProps> = ({
  books,
  onBackToStore,
  onNavigateAdmin
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posCart, setPosCart] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('زبون المعرض');
  const [customerPhone, setCustomerPhone] = useState('');
  const [standLocation, setStandLocation] = useState('صالون الجزائر الدولي للكتاب SILA');
  const [cashierName, setCashierName] = useState('أمين الصندوق - دار رميسة');
  const [discountDzd, setDiscountDzd] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [lastReceiptOrder, setLastReceiptOrder] = useState<Order | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [sanityStatus, setSanityStatus] = useState<'connected' | 'offline' | 'syncing'>('offline');
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Check Sanity connection on mount
  useEffect(() => {
    const config = SanityService.getConfig();
    if (config.projectId && config.apiToken) {
      setSanityStatus('connected');
    }
  }, []);

  // Filter books
  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q ||
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      (book.isbn && book.isbn.includes(q));
    return matchesCategory && matchesQuery;
  });

  const categories = ['all', ...Array.from(new Set(books.map(b => b.category)))];

  // Cart operations
  const addToCart = (book: Book) => {
    if (book.stock <= 0) {
      alert(`عذراً، كتاب "${book.title}" نفد من المخزون تماماً.`);
      return;
    }

    const existingIndex = posCart.findIndex(item => item.bookId === book.id);
    if (existingIndex > -1) {
      const currentQty = posCart[existingIndex].quantity;
      if (currentQty >= book.stock) {
        alert(`تم الوصول للحد الأقصى المتوفر بالمخزون (${book.stock} نسخة).`);
        return;
      }
      const updated = [...posCart];
      updated[existingIndex].quantity += 1;
      setPosCart(updated);
    } else {
      setPosCart([
        ...posCart,
        {
          bookId: book.id,
          title: book.title,
          author: book.author,
          format: 'print',
          price: book.pricePrint,
          quantity: 1
        }
      ]);
    }
  };

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    const item = posCart[index];
    const originalBook = books.find(b => b.id === item.bookId);
    if (originalBook && newQty > originalBook.stock) {
      alert(`الكمية القصوى المتوفرة لهذا الكتاب هي ${originalBook.stock} نسخة.`);
      return;
    }
    const updated = [...posCart];
    updated[index].quantity = newQty;
    setPosCart(updated);
  };

  const removeFromCart = (index: number) => {
    setPosCart(posCart.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setPosCart([]);
    setDiscountDzd(0);
    setAmountPaid(0);
    setCustomerName('زبون المعرض');
    setCustomerPhone('');
  };

  // Financial calculations
  const subtotal = posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalAmount = Math.max(0, subtotal - discountDzd);
  const changeDue = Math.max(0, amountPaid - totalAmount);

  // Quick cash setters
  const handleQuickCash = (amount: number) => {
    setAmountPaid(amount);
  };

  // Complete POS Sale
  const handleCompleteSale = async () => {
    if (posCart.length === 0) {
      alert('يرجى إضافة كتب إلى سلة البيع أولاً.');
      return;
    }

    if (paymentMethod === 'cash' && amountPaid > 0 && amountPaid < totalAmount) {
      alert('المبلغ المقبوض أقل من الإجمالي المطلوب.');
      return;
    }

    const orderNumber = `POS-${Date.now().toString().slice(-6)}`;
    const finalAmountPaid = paymentMethod === 'cash' ? (amountPaid || totalAmount) : totalAmount;
    const finalChange = paymentMethod === 'cash' ? Math.max(0, finalAmountPaid - totalAmount) : 0;

    const newOrder: Order = {
      id: `pos-${Date.now()}`,
      orderNumber,
      orderType: 'pos',
      customerName: customerName || 'زبون المعرض',
      phone: customerPhone || '',
      wilayaId: 16,
      wilayaName: standLocation,
      commune: 'معرض الكتاب',
      address: standLocation,
      deliveryType: 'desk',
      items: posCart,
      subtotal,
      shippingCost: 0,
      totalAmount,
      paymentMethod,
      paymentStatus: 'paid',
      orderStatus: 'delivered', // Handed to customer immediately
      createdAt: new Date().toISOString(),
      posCashierName: cashierName,
      posStandLocation: standLocation,
      posDiscountAmount: discountDzd,
      posAmountPaid: finalAmountPaid,
      posChangeDue: finalChange,
      posReceiptNumber: orderNumber,
      syncedToSanity: false
    };

    // 1. Save in local storage & auto decrement stock
    StorageService.addOrder(newOrder);

    // 2. Set for receipt modal
    setLastReceiptOrder(newOrder);
    setShowReceiptModal(true);

    // 3. Trigger Sanity Cloud Sync
    setSanityStatus('syncing');
    setSyncToast(`جاري مزامنة المبيعة ${orderNumber} سحابياً مع Sanity CMS...`);
    
    try {
      const res = await SanityService.pushPosSale(newOrder);
      if (res.success) {
        setSanityStatus('connected');
        setSyncToast(`تم حفظ ومزامنة المبيعة ${orderNumber} في السحاب بنجاح!`);
      } else {
        setSanityStatus('connected');
        setSyncToast(`تم حفظ المبيعة محلياً (ستتم المزامنة التلقائية لاحقاً)`);
      }
    } catch {
      setSanityStatus('offline');
      setSyncToast(`تم التخزين المحلي بنجاح (وضع العمل غير المتصل)`);
    }

    setTimeout(() => {
      setSyncToast(null);
    }, 4500);

    // Clear cart
    clearCart();
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-right font-sans select-none">
      
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-amber-500/30 flex items-center gap-3 animate-bounce">
          <CloudLightning className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-medium">{syncToast}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="bg-stone-900 text-stone-100 px-4 py-3 shadow-md flex items-center justify-between border-b border-stone-800 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-xs font-semibold rounded-lg transition-colors border border-stone-700"
          >
            <ArrowRight className="w-4 h-4 text-amber-400" />
            <span>المتجر</span>
          </button>
          <button
            onClick={onNavigateAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-xs font-semibold rounded-lg transition-colors border border-stone-700 text-stone-300"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>لوحة التحكم الإدارية</span>
          </button>

          <div className="h-4 w-px bg-stone-700 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="font-editorial font-bold text-lg text-amber-400">دار رميسة</span>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
              نظام الكاشير الميداني POS
            </span>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-stone-400 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>{cashierName}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-stone-800 border border-stone-700">
            {sanityStatus === 'connected' && (
              <>
                <CloudLightning className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-emerald-300 hidden sm:inline">Sanity سحابي: متصل ومزامن</span>
              </>
            )}
            {sanityStatus === 'syncing' && (
              <>
                <CloudLightning className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="text-amber-300 hidden sm:inline">جاري المزامنة السحابية...</span>
              </>
            )}
            {sanityStatus === 'offline' && (
              <>
                <Wifi className="w-4 h-4 text-stone-400" />
                <span className="text-stone-300 hidden sm:inline">وضع أوفلاين (تخزين محلي مؤمن)</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Terminal Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Side: Product Catalog (Touch Grid & Search) */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden border-l border-stone-200">
          
          {/* Top Controls: Search & Category Pills */}
          <div className="space-y-3 mb-4 shrink-0">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="ابحث بالعنوان، الكاتب، أو الرقم الدولي ISBN / الباركود..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-11 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/40 focus:border-amber-800 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  {cat === 'all' ? 'جميع الكتب المعروضة' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Book Touch Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredBooks.map((book) => {
                const cartQty = posCart.find(i => i.bookId === book.id)?.quantity || 0;
                const isOutOfStock = book.stock <= 0;

                return (
                  <button
                    key={book.id}
                    onClick={() => addToCart(book)}
                    disabled={isOutOfStock}
                    className={`text-right p-2.5 rounded-xl border transition-all flex flex-col justify-between relative group ${
                      isOutOfStock
                        ? 'bg-stone-100 border-stone-200 opacity-50 cursor-not-allowed'
                        : cartQty > 0
                        ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                        : 'bg-white border-stone-200 hover:border-amber-700 hover:shadow-xs active:scale-[0.98]'
                    }`}
                  >
                    {/* Badge of items already in cart */}
                    {cartQty > 0 && (
                      <span className="absolute -top-2 -left-2 w-6 h-6 bg-stone-900 text-amber-400 text-xs font-bold rounded-full flex items-center justify-center shadow-md z-10 border border-amber-500/40">
                        {cartQty}
                      </span>
                    )}

                    <div className="w-full">
                      {/* Book Thumbnail */}
                      <div className="aspect-[3/4] w-full rounded-lg overflow-hidden mb-2 bg-stone-200 relative">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-white"
                            style={{ backgroundColor: book.coverColor || '#292524' }}
                          >
                            <BookOpen className="w-6 h-6 mb-1 text-amber-300 opacity-80" />
                            <span className="text-[10px] font-bold line-clamp-2 leading-tight">
                              {book.title}
                            </span>
                          </div>
                        )}

                        {/* Stock indicator badge */}
                        <div className="absolute bottom-1 right-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shadow-xs ${
                            book.stock > 5
                              ? 'bg-stone-900/80 text-emerald-300 backdrop-blur-xs'
                              : book.stock > 0
                              ? 'bg-amber-600 text-white'
                              : 'bg-rose-600 text-white'
                          }`}>
                            {book.stock > 0 ? `${book.stock} متاح` : 'نفد'}
                          </span>
                        </div>
                      </div>

                      {/* Title & Author */}
                      <h4 className="font-bold text-xs text-stone-900 line-clamp-2 leading-snug">
                        {book.title}
                      </h4>
                      <p className="text-[10px] text-stone-500 truncate mt-0.5">
                        {book.author}
                      </p>
                    </div>

                    {/* Price Strip */}
                    <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-amber-900 font-mono">
                        {book.pricePrint.toLocaleString()} دج
                      </span>
                      <span className="p-1 rounded-md bg-stone-100 group-hover:bg-amber-100 text-stone-700 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredBooks.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 mt-4">
                <Search className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="text-stone-600 font-bold text-sm">لم يتم العثور على كتب مطابقة</p>
                <p className="text-stone-400 text-xs mt-1">جرب البحث بكلمة مختلفة أو اختر تصنيفاً آخر</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: POS Cart, Financials & Checkout (Fixed 380px or responsive) */}
        <div className="w-full lg:w-[420px] bg-white border-t lg:border-t-0 flex flex-col shadow-lg shrink-0 overflow-hidden">
          
          {/* Cart Header */}
          <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-700" />
              <h3 className="font-bold text-stone-900 text-sm">سلة المشتريات الميدانية</h3>
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                {posCart.reduce((sum, i) => sum + i.quantity, 0)} كتاب
              </span>
            </div>

            {posCart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>تفريغ</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[300px] lg:max-h-none">
            {posCart.map((item, idx) => (
              <div
                key={`${item.bookId}-${idx}`}
                className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-stone-900 truncate">{item.title}</h5>
                  <div className="flex items-center gap-2 mt-0.5 text-stone-500 font-mono">
                    <span>{item.price.toLocaleString()} دج</span>
                    <span>×</span>
                    <span className="font-bold text-stone-800">{item.quantity}</span>
                    <span>=</span>
                    <span className="font-bold text-amber-900">
                      {(item.price * item.quantity).toLocaleString()} دج
                    </span>
                  </div>
                </div>

                {/* Steppers */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateQuantity(idx, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-stone-300 hover:bg-stone-200 flex items-center justify-center font-bold text-stone-700 active:scale-95 transition-all"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-bold font-mono text-sm text-stone-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(idx, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-stone-900 text-white hover:bg-stone-800 flex items-center justify-center font-bold active:scale-95 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeFromCart(idx)}
                    className="p-1 text-stone-400 hover:text-rose-600 transition-colors mr-1"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {posCart.length === 0 && (
              <div className="py-12 text-center text-stone-400 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto stroke-1 text-stone-300" />
                <p className="text-xs font-medium">السلة فارغة، انقر على أي كتاب لإضافته للبيع فوراً</p>
              </div>
            )}
          </div>

          {/* Quick Customer & Stand Metadata */}
          <div className="p-3 bg-stone-50 border-t border-stone-200 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-stone-500 mb-1 font-medium">اسم المشتري (اختياري)</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="زبون المعرض"
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-800"
                />
              </div>
              <div>
                <label className="block text-stone-500 mb-1 font-medium">هاتف الزبون</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="06/05/07..."
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-500 mb-1 font-medium">المعرض أو الجناح</label>
              <select
                value={standLocation}
                onChange={(e) => setStandLocation(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-amber-800"
              >
                <option value="صالون الجزائر الدولي للكتاب SILA">صالون الجزائر الدولي للكتاب SILA</option>
                <option value="المقر الرئيسي لدار رميسة - باتنة">المقر الرئيسي لدار رميسة - باتنة</option>
                <option value="معرض قسنطينة للكتاب">معرض قسنطينة للكتاب</option>
                <option value="معرض وهران الدولي">معرض وهران الدولي</option>
                <option value="كشك البيع الميداني">كشك البيع الميداني</option>
              </select>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-3 border-t border-stone-200 bg-white space-y-2">
            <label className="block text-xs font-bold text-stone-700">طريقة الدفع في المعرض:</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>نقداً</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('dahabia')}
                className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  paymentMethod === 'dahabia'
                    ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>ذهبية / CIB</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('tpe')}
                className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  paymentMethod === 'tpe'
                    ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>TPE إلكتروني</span>
              </button>
            </div>

            {/* If Cash: Change Due Calculator */}
            {paymentMethod === 'cash' && totalAmount > 0 && (
              <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80 space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-700">المبلغ المقبوض من المشتري:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={amountPaid || ''}
                      onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                      placeholder={totalAmount.toString()}
                      className="w-24 px-2 py-1 bg-white border border-amber-300 rounded font-mono font-bold text-left text-sm"
                    />
                    <span className="font-bold text-stone-600">دج</span>
                  </div>
                </div>

                {/* Quick denomination pills */}
                <div className="flex gap-1.5 overflow-x-auto text-[11px] font-mono">
                  <button
                    onClick={() => handleQuickCash(totalAmount)}
                    className="px-2 py-0.5 bg-white border border-amber-300 rounded hover:bg-amber-100 font-bold whitespace-nowrap"
                  >
                    تماماً ({totalAmount})
                  </button>
                  <button
                    onClick={() => handleQuickCash(Math.ceil(totalAmount / 500) * 500)}
                    className="px-2 py-0.5 bg-white border border-amber-300 rounded hover:bg-amber-100 font-bold whitespace-nowrap"
                  >
                    {Math.ceil(totalAmount / 500) * 500} دج
                  </button>
                  <button
                    onClick={() => handleQuickCash(Math.ceil(totalAmount / 1000) * 1000)}
                    className="px-2 py-0.5 bg-white border border-amber-300 rounded hover:bg-amber-100 font-bold whitespace-nowrap"
                  >
                    {Math.ceil(totalAmount / 1000) * 1000} دج
                  </button>
                  <button
                    onClick={() => handleQuickCash(amountPaid + 1000)}
                    className="px-2 py-0.5 bg-white border border-amber-300 rounded hover:bg-amber-100 font-bold whitespace-nowrap"
                  >
                    +1,000
                  </button>
                </div>

                {/* Change Due Display */}
                {amountPaid > totalAmount && (
                  <div className="pt-1.5 border-t border-amber-200/80 flex items-center justify-between text-xs font-bold text-emerald-800">
                    <span>الباقي للزبون (الفكة):</span>
                    <span className="font-mono text-base">{changeDue.toLocaleString()} دج</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Financial Summary & Big Action Button */}
          <div className="p-4 bg-stone-900 text-white shrink-0 space-y-3">
            <div className="space-y-1.5 text-xs text-stone-300">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-mono">{subtotal.toLocaleString()} دج</span>
              </div>

              {/* Discount field */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-amber-300">
                  <Tag className="w-3 h-3" />
                  <span>تخفيض خاص:</span>
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={discountDzd || ''}
                    onChange={(e) => setDiscountDzd(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-16 px-1.5 py-0.5 bg-stone-800 border border-stone-700 rounded text-amber-300 text-left font-mono font-bold text-xs"
                  />
                  <span>دج</span>
                </div>
              </div>

              <div className="border-t border-stone-800 pt-2 flex justify-between items-baseline text-white">
                <span className="font-bold text-sm">المبلغ الإجمالي المطلوب:</span>
                <span className="font-editorial text-2xl font-bold text-amber-400 font-mono">
                  {totalAmount.toLocaleString()} <span className="text-xs font-sans text-stone-400">دج</span>
                </span>
              </div>
            </div>

            {/* Complete Sale Button */}
            <button
              onClick={handleCompleteSale}
              disabled={posCart.length === 0}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                posCart.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-5 h-5 text-emerald-200" />
              <span>إتمام عملية البيع وطباعة الوصل</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Printable Receipt Modal */}
      {showReceiptModal && lastReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">وصل بيع رسمي لدار رميسة</h3>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Paper */}
            <div id="pos-printable-receipt" className="p-6 overflow-y-auto space-y-4 text-stone-800 text-xs font-sans">
              
              {/* Receipt Header */}
              <div className="text-center space-y-1 border-b border-dashed border-stone-300 pb-4">
                <h2 className="font-editorial font-bold text-lg text-stone-900">دار رميسة للنشر والترجمة والتوزيع</h2>
                <p className="text-[10px] text-stone-500">Roumaissa Éditions et Diffusion</p>
                <p className="text-[11px] font-medium text-amber-900 mt-1">{lastReceiptOrder.posStandLocation}</p>
                <p className="text-[10px] text-stone-500">
                  بتاريخ: {new Date(lastReceiptOrder.createdAt).toLocaleString('ar-DZ')}
                </p>
                <p className="font-mono font-bold text-xs bg-stone-100 py-1 rounded mt-1">
                  وصل رقم: {lastReceiptOrder.posReceiptNumber || lastReceiptOrder.orderNumber}
                </p>
              </div>

              {/* Customer & Cashier Info */}
              <div className="flex justify-between text-[11px] text-stone-600 border-b border-stone-200 pb-2">
                <span>الكاشير: {lastReceiptOrder.posCashierName}</span>
                <span>الزبون: {lastReceiptOrder.customerName}</span>
              </div>

              {/* Items Table */}
              <div className="space-y-1.5 border-b border-dashed border-stone-300 pb-3">
                {lastReceiptOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="font-bold block truncate">{item.title}</span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {item.quantity} × {item.price.toLocaleString()} دج
                      </span>
                    </div>
                    <span className="font-mono font-bold shrink-0">
                      {(item.quantity * item.price).toLocaleString()} دج
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="space-y-1 pt-1 font-mono text-xs">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{lastReceiptOrder.subtotal.toLocaleString()} دج</span>
                </div>
                {lastReceiptOrder.posDiscountAmount && lastReceiptOrder.posDiscountAmount > 0 && (
                  <div className="flex justify-between text-rose-700">
                    <span>التخفيض المطبق:</span>
                    <span>-{lastReceiptOrder.posDiscountAmount.toLocaleString()} دج</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-stone-900 pt-1 border-t border-stone-200">
                  <span>الإجمالي الصافي:</span>
                  <span>{lastReceiptOrder.totalAmount.toLocaleString()} دج</span>
                </div>

                {lastReceiptOrder.paymentMethod === 'cash' && (
                  <>
                    <div className="flex justify-between text-stone-600 pt-1">
                      <span>المقبوض نقداً:</span>
                      <span>{(lastReceiptOrder.posAmountPaid || lastReceiptOrder.totalAmount).toLocaleString()} دج</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-800">
                      <span>الباقي المرجع:</span>
                      <span>{(lastReceiptOrder.posChangeDue || 0).toLocaleString()} دج</span>
                    </div>
                  </>
                )}
              </div>

              {/* Footer Note & Barcode */}
              <div className="text-center pt-3 border-t border-dashed border-stone-300 space-y-2">
                <p className="font-editorial text-xs font-bold text-stone-900">
                  «قراءةٌ تصنع الوعي، وأثرٌ يمتد عبر الأجيال»
                </p>
                <p className="text-[10px] text-stone-500">
                  شكراً لاقتنائكم من منشورات دار رميسة. نرجو لكم قراءة ماتعة!
                </p>
                <p className="text-[9px] text-stone-400 font-mono">
                  * هذا الوصل يعتبر إثبات شراء رسمي صالح للمعارض والمبيعات الميدانية *
                </p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-3 shrink-0">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>طباعة الوصل فوراً (Print)</span>
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-bold transition-all"
              >
                إغلاق وبدء بيعة جديدة
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
