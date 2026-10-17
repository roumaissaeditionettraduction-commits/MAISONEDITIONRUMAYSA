import React, { useState } from 'react';
import { BookOpen, ShoppingBag, Eye, Download, Check, Star } from 'lucide-react';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  onSelectBook: (book: Book) => void;
  onAddToCart: (book: Book, format: 'print' | 'epub') => void;
  onOpenReader: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onSelectBook,
  onAddToCart,
  onOpenReader
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'print' | 'epub'>('print');
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Compute stock status using the new stockCount field with fallback to stock
  const effectiveStock = book.stockCount !== undefined ? book.stockCount : book.stock;
  const isInStock = effectiveStock > 0;
  const isOutOfStockForFormat = selectedFormat === 'print' && !isInStock;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStockForFormat) {
      return;
    }
    onAddToCart(book, selectedFormat);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const currentPrice = selectedFormat === 'print' ? book.pricePrint : book.priceEpub;

  return (
    <div
      onClick={() => onSelectBook(book)}
      className="group cursor-pointer bg-white rounded-xl border border-stone-200/80 p-4 transition-all duration-300 hover:border-amber-700/30 hover:shadow-xl flex flex-col justify-between"
    >
      {/* 3D Realistic Book Cover Showcase */}
      <div className="relative aspect-[3/4] w-full max-w-[240px] mx-auto mb-4 perspective-800 flex items-center justify-center">
        {/* Stock Status Badge on Cover */}
        <div
          data-testid="stock-status-badge"
          className={`absolute top-2 right-2 z-20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-md border transition-all ${
            isInStock
              ? 'bg-emerald-600/90 text-white border-emerald-400/50'
              : 'bg-rose-700/95 text-white border-rose-400/50'
          }`}
          title={`حالة التوفر: ${isInStock ? 'متوفر' : 'نفذت الكمية'}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isInStock ? 'bg-emerald-200 animate-pulse' : 'bg-rose-200'}`} />
          <span>{isInStock ? 'متوفر' : 'نفذت الكمية'}</span>
        </div>

        <div
          className="book-cover-3d w-full h-full rounded-r-md rounded-l-xs overflow-hidden flex flex-col justify-between relative shadow-md"
          style={{
            backgroundColor: book.coverColor,
            color: '#fff'
          }}
        >
          {/* Spine depth simulation */}
          <div className="absolute right-0 top-0 bottom-0 w-3.5 book-spine z-10 border-l border-black/20" />
          
          {book.coverImage ? (
            /* Uploaded Real Cover Image */
            <div className="w-full h-full relative">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
              <div className="absolute top-2 left-2 z-10 text-[9px] bg-black/60 text-white font-mono px-1.5 py-0.5 rounded backdrop-blur-xs">
                {book.publishYear}
              </div>
            </div>
          ) : (
            /* Styled Vector / Typography Hardcover Cover */
            <div className="w-full h-full p-4 flex flex-col justify-between relative">
              {/* Textured cover watermark overlay */}
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/30 via-transparent to-black/40" />

              {/* Book Header / Publisher Emblem */}
              <div className="relative z-10 flex items-center justify-between text-xs opacity-90 border-b border-white/20 pb-2">
                <span className="font-editorial tracking-wider text-[11px] text-amber-200 font-bold">
                  دار رميسة للنشر
                </span>
                <span className="text-[10px] text-stone-200 font-mono">
                  {book.publishYear}
                </span>
              </div>

              {/* Book Title & Author in Center */}
              <div className="relative z-10 my-auto text-center px-1">
                <h3
                  className="font-editorial text-lg sm:text-xl font-bold leading-tight mb-2 tracking-wide"
                  style={{ color: book.coverAccent }}
                >
                  {book.title}
                </h3>
                <p className="text-xs text-stone-200 font-medium">
                  {book.author}
                </p>
                {book.translator && (
                  <p className="text-[10px] text-amber-200/90 mt-1 italic">
                    {book.translator}
                  </p>
                )}
              </div>

              {/* Book Footer / ISBN & Badge */}
              <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/20 text-[10px] text-stone-300 font-mono">
                <span>ISBN: {book.isbn.substring(0, 10)}...</span>
                <span>{book.pages} صفحة</span>
              </div>
            </div>
          )}
        </div>

        {/* Hover Quick View Overlay Button */}
        <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onSelectBook(book); }}
            className="px-3 py-1.5 bg-white text-stone-900 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 hover:bg-stone-100 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-stone-700" />
            <span>معاينة</span>
          </button>
          {book.hasEpub && (
            <button
              onClick={(e) => { e.stopPropagation(); onOpenReader(book); }}
              className="px-3 py-1.5 bg-amber-500 text-stone-950 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 hover:bg-amber-400 transition-colors"
              title="قراءة عينة رقمية مباشرة"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>تصفح ePub</span>
            </button>
          )}
        </div>
      </div>

      {/* Book Metadata - Zero Pill Discipline */}
      <div className="space-y-1.5 text-right flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-stone-700">{book.author}</span>
              {/* Stock Status Badge */}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border ${
                  isInStock
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isInStock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span>{isInStock ? 'متوفر' : 'نفذت الكمية'}</span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-amber-600 font-mono text-[11px] shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{book.rating.toFixed(1)}</span>
              <span className="text-stone-400">({book.reviewsCount})</span>
            </div>
          </div>

          <h4 className="font-editorial text-base sm:text-lg font-bold text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-1">
            {book.title}
          </h4>

          <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
            {book.summary}
          </p>
        </div>

        {/* Format Selector: Print Book vs ePub */}
        <div className="pt-3 border-t border-stone-100 mt-2">
          <div className="flex items-center justify-between gap-1 p-1 bg-stone-100 rounded-lg text-xs mb-3">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setSelectedFormat('print'); }}
              className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all ${
                selectedFormat === 'print'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              ورقي فاخر ({book.pricePrint} دج)
            </button>
            {book.hasEpub && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelectedFormat('epub'); }}
                className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all flex items-center justify-center gap-1 ${
                  selectedFormat === 'epub'
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>ePub رقمي</span>
                <span className="text-[10px] opacity-90">({book.priceEpub} دج)</span>
              </button>
            )}
          </div>

          {/* Price & Action Button */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs text-stone-500">
                {selectedFormat === 'print'
                  ? (isInStock ? 'نسخة ورقية مع توصيل' : 'نفذت النسخ الورقية')
                  : 'تحميل ePub فوري'}
              </div>
              <div className="font-mono text-base sm:text-lg font-bold text-stone-950 tabular-nums">
                {currentPrice.toLocaleString('ar-DZ')} <span className="text-xs font-normal text-stone-600">دج</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isOutOfStockForFormat}
              onClick={handleQuickAdd}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
                isOutOfStockForFormat
                  ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                  : addedAnimation
                  ? 'bg-emerald-600 text-white'
                  : selectedFormat === 'epub'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-stone-900 hover:bg-stone-800 text-white'
              }`}
            >
              {isOutOfStockForFormat ? (
                <span>نفذت الكمية</span>
              ) : addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>تمت الإضافة!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>طلب {selectedFormat === 'print' ? 'الورقي' : 'الـ ePub'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
