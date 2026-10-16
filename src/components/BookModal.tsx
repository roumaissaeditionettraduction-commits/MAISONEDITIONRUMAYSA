import React, { useState } from 'react';
import { X, BookOpen, ShoppingBag, Download, Star, ShieldCheck, Check, Truck, Share2 } from 'lucide-react';
import { Book } from '../types';

interface BookModalProps {
  book: Book | null;
  onClose: () => void;
  onAddToCart: (book: Book, format: 'print' | 'epub', quantity?: number) => void;
  onBuyNow: (book: Book, format: 'print' | 'epub') => void;
  onOpenReader: (book: Book) => void;
}

export const BookModal: React.FC<BookModalProps> = ({
  book,
  onClose,
  onAddToCart,
  onBuyNow,
  onOpenReader
}) => {
  if (!book) return null;

  const [selectedFormat, setSelectedFormat] = useState<'print' | 'epub'>('print');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'summary' | 'toc' | 'sample'>('summary');
  const [copied, setCopied] = useState(false);

  const price = selectedFormat === 'print' ? book.pricePrint : book.priceEpub;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 relative text-right flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-xs text-stone-500 font-mono hidden sm:inline">
              ISBN: {book.isbn}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'تم نسخ الرابط!' : 'مشاركة'}</span>
            </button>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              إصدارات دار رميسة
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: 3D Book Cover & Quick Spec */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[280px] aspect-[3/4] mb-6">
              <div
                className="book-cover-3d w-full h-full rounded-r-lg rounded-l-xs overflow-hidden flex flex-col justify-between relative shadow-2xl"
                style={{ backgroundColor: book.coverColor, color: '#fff' }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-4 book-spine z-10 border-l border-black/20" />
                
                {book.coverImage ? (
                  <div className="w-full h-full relative">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
                    <div className="absolute top-3 left-3 z-10 text-[10px] bg-black/60 text-white font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                      {book.publishYear}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full p-6 flex flex-col justify-between relative">
                    <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/30 via-transparent to-black/40" />

                    <div className="relative z-10 flex items-center justify-between text-xs opacity-90 border-b border-white/20 pb-2">
                      <span className="font-editorial text-amber-200 font-bold tracking-wide">
                        {book.publisher}
                      </span>
                      <span className="font-mono text-[11px]">{book.publishYear}</span>
                    </div>

                    <div className="relative z-10 my-auto text-center px-2">
                      <h2
                        className="font-editorial text-xl sm:text-2xl font-bold leading-tight mb-2"
                        style={{ color: book.coverAccent }}
                      >
                        {book.title}
                      </h2>
                      <p className="text-sm text-stone-200 font-medium">
                        {book.author}
                      </p>
                      {book.translator && (
                        <p className="text-xs text-amber-200 mt-1 italic">
                          {book.translator}
                        </p>
                      )}
                    </div>

                    <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/20 text-xs text-stone-300 font-mono">
                      <span>{book.editionNumber}</span>
                      <span>{book.pages} ص</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Digital Preview / Reader CTA */}
            {book.hasEpub && (
              <button
                type="button"
                onClick={() => onOpenReader(book)}
                className="w-full max-w-[280px] py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>فتح القارئ الإلكتروني ePub وتصفح العينة</span>
              </button>
            )}

            {/* Physical Specs Strip */}
            <div className="w-full max-w-[280px] mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5 text-stone-600">
              <div className="flex justify-between">
                <span>تجليد وغلاف:</span>
                <span className="font-medium text-stone-900">ورق مقوى سلوفان مطفي</span>
              </div>
              <div className="flex justify-between">
                <span>نوع الورق:</span>
                <span className="font-medium text-stone-900">شمواه إيطالي 70غ خفيف</span>
              </div>
              <div className="flex justify-between">
                <span>المتوفر بالمخزن:</span>
                <span className="font-medium text-emerald-700">{book.stock} نسخة ورقية جاهزة للشحن</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Format Selector, Buy Box, Tabs */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="text-amber-800 font-semibold">{book.publisher}</span>
                <div className="flex items-center gap-1 text-amber-600 font-mono">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-bold text-sm">{book.rating.toFixed(1)}</span>
                  <span className="text-stone-400">({book.reviewsCount} تقييم قارئ)</span>
                </div>
              </div>

              {/* Title & Author */}
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-950 mb-2 leading-tight">
                {book.title}
              </h1>
              <p className="text-base text-stone-700 font-medium mb-4">
                تأليف: <span className="text-stone-900 font-bold">{book.author}</span>
                {book.translator && (
                  <span className="text-stone-500 mr-2">· {book.translator}</span>
                )}
              </p>

              {/* Choose Format: Physical vs ePub */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 mb-5">
                <div className="text-xs font-bold text-stone-800 mb-2.5">
                  اختر الصيغة المطلوبة:
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('print')}
                    className={`p-3 rounded-lg border text-right transition-all flex flex-col justify-between ${
                      selectedFormat === 'print'
                        ? 'border-amber-600 bg-white ring-2 ring-amber-600/20 shadow-xs'
                        : 'border-stone-200 bg-white/60 hover:bg-white text-stone-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-stone-900">نسخة ورقية فاخرة</span>
                      {selectedFormat === 'print' && <Check className="w-4 h-4 text-amber-600" />}
                    </div>
                    <span className="text-[11px] text-stone-500 mt-1">توصيل لباب المنزل في 58 ولاية</span>
                    <div className="mt-2 font-mono text-base font-bold text-stone-950 tabular-nums">
                      {book.pricePrint.toLocaleString('ar-DZ')} دج
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('epub')}
                    disabled={!book.hasEpub}
                    className={`p-3 rounded-lg border text-right transition-all flex flex-col justify-between ${
                      !book.hasEpub
                        ? 'opacity-40 cursor-not-allowed border-stone-200'
                        : selectedFormat === 'epub'
                        ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600/20 shadow-xs'
                        : 'border-stone-200 bg-white/60 hover:bg-white text-stone-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-stone-900">كتاب رقمي ePub</span>
                      {selectedFormat === 'epub' && <Check className="w-4 h-4 text-amber-600" />}
                    </div>
                    <span className="text-[11px] text-stone-500 mt-1">تحميل فوري بصيغة ePub وقارئ متصفح</span>
                    <div className="mt-2 font-mono text-base font-bold text-amber-800 tabular-nums">
                      {book.priceEpub.toLocaleString('ar-DZ')} دج
                    </div>
                  </button>
                </div>
              </div>

              {/* Purchase Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                {selectedFormat === 'print' && (
                  <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 p-1 w-full sm:w-auto justify-between sm:justify-start">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center font-bold text-stone-700 hover:bg-white rounded"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-mono font-bold text-stone-900 tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center font-bold text-stone-700 hover:bg-white rounded"
                    >
                      +
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(book, selectedFormat, quantity);
                    onClose();
                  }}
                  className="w-full sm:flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors border border-stone-300"
                >
                  <ShoppingBag className="w-4 h-4 text-stone-700" />
                  <span>إضافة إلى السلة ({(price * quantity).toLocaleString('ar-DZ')} دج)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onBuyNow(book, selectedFormat);
                    onClose();
                  }}
                  className="w-full sm:flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-md active:scale-95"
                >
                  <span>شراء فوري مباشر</span>
                </button>
              </div>

              {/* Delivery & Security Trust Markers */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 py-3 border-t border-b border-stone-200">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>توصيل سريع لكافة 58 ولاية جزائرية</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>دفع إلكتروني آمن بشارجلي باي أو عند الاستلام</span>
                </div>
              </div>
            </div>

            {/* Information Tabs */}
            <div className="mt-4">
              <div className="flex items-center gap-2 border-b border-stone-200 pb-1 mb-4 text-sm font-bold">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`py-1.5 px-3 border-b-2 transition-colors ${
                    activeTab === 'summary'
                      ? 'border-amber-600 text-amber-900'
                      : 'border-transparent text-stone-500 hover:text-stone-900'
                  }`}
                >
                  عن الكتاب
                </button>
                <button
                  onClick={() => setActiveTab('toc')}
                  className={`py-1.5 px-3 border-b-2 transition-colors ${
                    activeTab === 'toc'
                      ? 'border-amber-600 text-amber-900'
                      : 'border-transparent text-stone-500 hover:text-stone-900'
                  }`}
                >
                  فهرس المحتويات ({book.toc.length})
                </button>
                <button
                  onClick={() => setActiveTab('sample')}
                  className={`py-1.5 px-3 border-b-2 transition-colors ${
                    activeTab === 'sample'
                      ? 'border-amber-600 text-amber-900'
                      : 'border-transparent text-stone-500 hover:text-stone-900'
                  }`}
                >
                  عينة للقراءة المجانية
                </button>
              </div>

              {/* Tab Content */}
              <div className="text-sm text-stone-700 leading-relaxed min-h-[140px]">
                {activeTab === 'summary' && (
                  <p className="whitespace-pre-line font-editorial text-base leading-relaxed text-stone-800">
                    {book.summary}
                  </p>
                )}

                {activeTab === 'toc' && (
                  <ul className="space-y-2 font-editorial">
                    {book.toc.map((chapter, idx) => (
                      <li key={idx} className="flex items-center justify-between py-1.5 border-b border-stone-100">
                        <span className="font-semibold text-stone-900">{chapter}</span>
                        <span className="text-xs text-stone-400 font-mono">0{idx + 1}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === 'sample' && (
                  <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/60 font-editorial text-stone-800 italic leading-loose text-base">
                    "{book.excerpt}"
                    <div className="mt-3 text-xs not-italic text-amber-900 font-sans font-bold flex items-center justify-between">
                      <span>تتوفر النسخة الكاملة فور إتمام الطلب</span>
                      {book.hasEpub && (
                        <button
                          onClick={() => onOpenReader(book)}
                          className="underline hover:text-amber-700"
                        >
                          متابعة القراءة في قارئ ePub ←
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
