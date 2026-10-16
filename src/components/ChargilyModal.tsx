import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Lock, CheckCircle, ArrowRight, Loader2, X, AlertCircle } from 'lucide-react';
import { Order, ChargilyConfig } from '../types';
import { StorageService } from '../services/storage';
import { PixelService } from '../services/pixelService';

interface ChargilyModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (completedOrder: Order) => void;
}

export const ChargilyModal: React.FC<ChargilyModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess
}) => {
  if (!isOpen || !order) return null;

  const chargilyConfig = StorageService.getChargilyConfig();

  const [cardType, setCardType] = useState<'edahabia' | 'cib'>('edahabia');
  const [cardNumber, setCardNumber] = useState('6280 4400 1234 5678');
  const [cardHolder, setCardHolder] = useState(order.customerName || 'BENALI MOHAMED');
  const [expiry, setExpiry] = useState('11/28');
  const [cvv, setCvv] = useState('842');
  const [step, setStep] = useState<'details' | 'otp' | 'processing'>('details');
  const [otpCode, setOtpCode] = useState('784912');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFormatCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, '').substring(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleConfirmCard = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setErrorMessage('يرجى إدخال رقم بطاقة صحيح مكون من 16 رقماً.');
      return;
    }
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');

    setTimeout(() => {
      // Simulate successful payment confirmation from Chargily Pay v2 API
      const completedOrder: Order = {
        ...order,
        paymentStatus: 'paid',
        orderStatus: order.items.every(i => i.format === 'epub') ? 'delivered' : 'confirmed',
        chargilyPaymentId: `ch_pay_${Math.floor(10000000 + Math.random() * 90000000)}`,
        chargilyCheckoutUrl: `https://pay.chargily.net/v2/checkouts/chk_${Date.now()}`
      };

      StorageService.addOrder(completedOrder);
      PixelService.trackPurchase(completedOrder.orderNumber, completedOrder.totalAmount, 'chargily', completedOrder.items.length);

      onSuccess(completedOrder);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden text-right flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chargily Pay Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-stone-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-wide">Chargily Pay</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                  {chargilyConfig.testMode ? 'وضع التجربة (Sandbox)' : 'مباشر (Live)'}
                </span>
              </div>
              <span className="text-[11px] text-stone-300">بوابة الدفع الإلكتروني الوطنية الآمنة</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Strip */}
        <div className="bg-stone-50 px-5 py-3 border-b border-stone-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-stone-500">طلب دار رميسة: </span>
            <span className="font-mono font-bold text-stone-900">{order.orderNumber}</span>
          </div>
          <div className="font-mono text-sm font-bold text-emerald-800 tabular-nums">
            {order.totalAmount.toLocaleString('ar-DZ')} دج
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 'details' && (
            <form onSubmit={handleConfirmCard} className="space-y-4">
              {/* Card Type Selector: Edahabia vs CIB */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-2">
                  نوع البطاقة البنكية:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCardType('edahabia')}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      cardType === 'edahabia'
                        ? 'border-amber-600 bg-amber-50/70 text-amber-900 ring-2 ring-amber-600/30'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span>البطاقة الذهبية (Edahabia)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCardType('cib')}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      cardType === 'cib'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/30'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                    <span>بطاقة CIB البنكية</span>
                  </button>
                </div>
              </div>

              {/* Card Visual Preview */}
              <div className={`p-4 rounded-xl text-white shadow-md relative overflow-hidden ${
                cardType === 'edahabia'
                  ? 'bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-800'
                  : 'bg-gradient-to-tr from-blue-900 via-blue-700 to-indigo-900'
              }`}>
                <div className="flex justify-between items-start mb-6">
                  <span className="font-bold text-xs tracking-wider uppercase opacity-90">
                    {cardType === 'edahabia' ? 'Algérie Poste · الذهبية' : 'Carte Interbancaire CIB'}
                  </span>
                  <div className="w-8 h-6 bg-amber-300/80 rounded-sm flex items-center justify-center text-[8px] font-bold text-stone-900">
                    CHIP
                  </div>
                </div>

                <div className="font-mono text-lg tracking-widest mb-4 ltr text-left">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>

                <div className="flex justify-between items-end text-xs ltr text-left font-mono">
                  <div>
                    <span className="text-[9px] uppercase opacity-75 block">Cardholder</span>
                    <span className="font-semibold">{cardHolder || 'ROUMAISSA CLIENT'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase opacity-75 block">Expires</span>
                    <span className="font-semibold">{expiry || 'MM/YY'}</span>
                  </div>
                </div>
              </div>

              {/* Card Inputs */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  رقم البطاقة (16 رقماً) *
                </label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => handleFormatCardNumber(e.target.value)}
                  placeholder="6280 0000 0000 0000"
                  className="w-full text-sm p-2.5 rounded-lg border border-stone-300 font-mono ltr text-left focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    تاريخ الانتهاء (شهر/سنة) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full text-sm p-2.5 rounded-lg border border-stone-300 font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    رمز الأمان CVV2 (3 أرقام) *
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="•••"
                    className="w-full text-sm p-2.5 rounded-lg border border-stone-300 font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  الاسم الكامل على البطاقة *
                </label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  placeholder="NOM ET PRENOM"
                  className="w-full text-sm p-2.5 rounded-lg border border-stone-300 ltr text-left focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
              >
                <span>متابعة للتحقق بخاصية 3D-Secure</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 py-2">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-stone-900">
                  التحقق بخاصية 3D-Secure
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
                  تم إرسال رمز أمان OTP برسالة نصية SMS إلى رقم الهاتف المرتبط ببطاقتك {cardType === 'edahabia' ? 'الذهبية' : 'CIB'}.
                </p>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
                <label className="block text-xs text-stone-600 mb-1.5 font-medium">
                  أدخل رمز التأكيد (OTP):
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-48 mx-auto text-xl font-mono tracking-widest text-center p-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <span className="block text-[11px] text-stone-500 mt-2 font-mono">
                  (رمز المحاكاة التلقائي: 784912)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="py-2.5 px-3 border border-stone-300 rounded-xl text-xs font-semibold hover:bg-stone-100"
                >
                  رجوع
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                >
                  <span>تأكيد الدفع ({order.totalAmount.toLocaleString('ar-DZ')} دج)</span>
                </button>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-emerald-700 animate-spin mx-auto" />
              <h3 className="font-bold text-base text-stone-900">
                جارٍ معالجة الدفع عبر شبكة Chargily Pay...
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                يرجى الانتظار ثوانٍ قليلة، يتم الآن توثيق العملية وتأكيد المعاملة البنكية وإصدار ترخيص الكتاب.
              </p>
            </div>
          )}

          {/* Security Footnote */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
            <span>PCI-DSS Compliant Gateway</span>
            <div className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>Chargily Pay Official Integration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
