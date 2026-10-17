import React, { useState } from 'react';
import { X, BookOpen, Download, Sun, Moon, Coffee, ChevronRight, ChevronLeft, Type, ShieldCheck, Check, Lock, AlertCircle, CreditCard } from 'lucide-react';
import { Book } from '../types';
import { EpubService } from '../services/epubService';

interface EpubReaderModalProps {
  book: Book | null;
  onClose: () => void;
  customerName?: string;
  onBuyEpub?: (book: Book) => void;
}

export const EpubReaderModal: React.FC<EpubReaderModalProps> = ({
  book,
  onClose,
  customerName,
  onBuyEpub
}) => {
  if (!book) return null;

  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');
  const [fontSize, setFontSize] = useState<number>(18);
  const access = EpubService.verifyEpubAccess(book.id);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [paymentWarning, setPaymentWarning] = useState<string | null>(
    !access.authorized ? "عذراً، يجب إتمام عملية الشراء ودفع مستحقات الكتاب لتتمكن من تحميل نسخة الـ EPUB المرخصة." : null
  );

  const chapters = book.toc.length > 0 ? book.toc : ['المقدمة العامة', 'الفصل الأول', 'الفصل الثاني'];

  const handleDownload = () => {
    const check = EpubService.verifyEpubAccess(book.id);
    if (!check.authorized) {
      setPaymentWarning("عذراً، يجب إتمام عملية الشراء ودفع مستحقات الكتاب لتتمكن من تحميل نسخة الـ EPUB المرخصة.");
      return;
    }

    const res = EpubService.downloadEpubFile(book, customerName || (check.isAdmin ? 'مدير دار رميسة' : 'قارئ مرخص'));
    if (res.success) {
      setDownloadSuccess(true);
      setPaymentWarning(null);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } else {
      setPaymentWarning(res.error || "عذراً، يجب إتمام عملية الشراء ودفع مستحقات الكتاب لتتمكن من تحميل نسخة الـ EPUB المرخصة.");
    }
  };

  const getThemeStyles = () => {
    switch (theme) {
      case 'sepia':
        return 'bg-[#fbf0d9] text-[#433422] border-[#ebd4b3]';
      case 'dark':
        return 'bg-[#18181b] text-[#e4e4e7] border-[#27272a]';
      default:
        return 'bg-white text-stone-900 border-stone-200';
    }
  };

  const getContentBg = () => {
    switch (theme) {
      case 'sepia':
        return 'bg-[#f7ebd0]';
      case 'dark':
        return 'bg-[#121214]';
      default:
        return 'bg-stone-50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl h-[94vh] rounded-2xl shadow-2xl flex flex-col border transition-colors duration-200 ${getThemeStyles()}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className={`px-4 sm:px-6 py-3 border-b flex items-center justify-between gap-4 ${getThemeStyles()}`}>
          {/* Right: Book Title & Chapter */}
          <div className="flex items-center gap-3 truncate text-right">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:opacity-75 transition-opacity"
              title="إغلاق القارئ"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="truncate">
              <h2 className="font-editorial text-base sm:text-lg font-bold truncate">
                {book.title}
              </h2>
              <span className="text-xs opacity-75 hidden sm:inline">
                {book.author} · دار رميسة للنشر
              </span>
            </div>
          </div>

          {/* Left: Reader Settings & Download Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Font size controls */}
            <div className="flex items-center border rounded-lg px-2 py-1 gap-1.5 text-xs font-mono">
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="hover:font-bold px-1"
                title="تصغير الخط"
              >
                A-
              </button>
              <span className="opacity-60">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(26, fontSize + 2))}
                className="hover:font-bold px-1"
                title="تكبير الخط"
              >
                A+
              </button>
            </div>

            {/* Themes Toggle */}
            <div className="flex items-center border rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded ${theme === 'light' ? 'bg-stone-200 font-bold' : 'opacity-60'}`}
                title="الوضع النهاري"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('sepia')}
                className={`p-1.5 rounded ${theme === 'sepia' ? 'bg-[#ebd4b3] text-[#433422] font-bold' : 'opacity-60'}`}
                title="الوضع الورقي المعتق (Sepia)"
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded ${theme === 'dark' ? 'bg-stone-700 text-white font-bold' : 'opacity-60'}`}
                title="الوضع الليلي"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Official ePub File Download Button with Strict Payment Guard */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={!access.authorized}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                !access.authorized
                  ? 'bg-stone-200/90 text-stone-400 border border-stone-300 cursor-not-allowed opacity-75'
                  : downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : access.isAdmin
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer active:scale-95'
                  : 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer active:scale-95'
              }`}
              title={
                !access.authorized
                  ? 'عذراً، يجب إتمام عملية الشراء ودفع مستحقات الكتاب لتتمكن من تحميل نسخة الـ EPUB المرخصة.'
                  : access.isAdmin
                  ? 'تحميل واختبار الملف بصلاحية مدير دار رميسة'
                  : 'تحميل ملف ePub المرخص'
              }
            >
              {!access.authorized ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">التحميل مقفل (يتطلب الشراء)</span>
                  <span className="sm:hidden">مقفل</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تم تجهيز ePub!</span>
                </>
              ) : access.isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                  <span className="hidden sm:inline">تحميل ملف (حصري للأدمن)</span>
                  <span className="sm:hidden">أدمن</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تحميل ملف .epub</span>
                  <span className="sm:hidden">تحميل</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Payment Required Warning Banner */}
        {paymentWarning && (
          <div className="px-4 sm:px-6 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-900 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-right">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{paymentWarning}</span>
            </div>
            {onBuyEpub && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBuyEpub(book);
                }}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 active:scale-95"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>إتمام الشراء عبر Chargily ({book.priceEpub.toLocaleString('ar-DZ')} دج)</span>
              </button>
            )}
          </div>
        )}

        {/* Reader Watermark / Publisher Notice */}
        <div className="px-6 py-1.5 text-[11px] opacity-75 border-b flex items-center justify-between text-right">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {access.isAdmin
                ? 'وضع استعراض وتحميل المسؤول (Admin Mode)'
                : access.hasPaid
                ? 'نسخة رقمية ePub مرخصة ومدفوعة'
                : 'نسخة رقمية ePub مشفرة ومحمية بحقوق دار النشر رميسة إيديسيو الجزائر'}
            </span>
          </div>
          <span className="font-mono text-[10px]">
            ملف: {book.epubFileName || 'book.epub'} ({book.epubFileSize || '3.5 MB'})
          </span>
        </div>

        {/* Book Reading Canvas */}
        <div className={`flex-1 overflow-y-auto px-6 sm:px-16 py-8 sm:py-12 ${getContentBg()} transition-colors`}>
          <div className="max-w-2xl mx-auto text-right">
            
            {/* Chapter Header */}
            <div className="text-center mb-8 pb-4 border-b border-current opacity-30">
              <span className="text-xs uppercase tracking-widest font-mono block mb-1">
                الفصل {currentChapterIndex + 1} من {chapters.length}
              </span>
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold">
                {chapters[currentChapterIndex]}
              </h1>
            </div>

            {/* Chapter Text Body */}
            <div
              className="font-editorial leading-loose transition-all duration-150 space-y-6"
              style={{ fontSize: `${fontSize}px` }}
            >
              {currentChapterIndex === 0 ? (
                <>
                  <p className="first-letter:text-3xl first-letter:font-bold">
                    {book.excerpt}
                  </p>
                  <p>
                    {book.summary}
                  </p>
                  <p>
                    تواصلت الصفحات والمخطوطات لتثبت أن الفكر واللغة عصيان على الزوال. كان الكتاب يتنقل من يد إلى يد بين زوايا الجزائر ومكتبات قسنطينة وموانئ وهران، يحمل معه عبق الحبر العتيق وأصوات أولئك الذين أودعوا في السطور حنينهم وأملهم المشترك.
                  </p>
                  <blockquote className="pr-4 border-r-2 border-amber-600 my-4 italic opacity-90 text-sm">
                    "إن أعظم ما يقدمه الناشر لقرائه ليس مجرد حبر على ورق، بل نافذة يطلون منها على عوالم لم تكن لتُكتشف لولا شجاعة الكلمة."
                  </blockquote>
                  <p>
                    وهكذا بدأت فصول هذه الرحلة المعرفية، لتفتح أمام القارئ الكريم أسرار الصنعة الأدبية والفكرية التي دأبت دار رميسة للنشر والترجمة على تقديمها بأعلى معايير الإتقان والجودة.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-3">
                    المبحث: {chapters[currentChapterIndex]}
                  </h3>
                  <p>
                    يتناول هذا القسم أبعاداً جديدة في سياق الطرح العام للكتاب، حيث تم تفكيك المحاور بالاستناد إلى مراجع موثقة ومقاربات نقدية رصينة تسهم في تعميق الفهم وإثراء المعارف.
                  </p>
                  <p>
                    تؤكد الدراسات الحديثة في حقل النشر وصناعة الكتاب أن التفاعل بين النص الورقي والنص الرقمي بصيغة ePub يخلق تكاملاً معرفياً فريداً، يتيح للقارئ ملاءمة ظروف قراءته واقتناء مكتبته في كل مكان.
                  </p>
                  <p>
                    {book.summary}
                  </p>
                </>
              )}
            </div>

            {/* End of chapter signature */}
            <div className="mt-12 pt-6 border-t border-current opacity-25 text-center text-xs font-editorial">
              — نهاية الفصل — دار رميسة للنشر والترجمة والتوزيع
            </div>

          </div>
        </div>

        {/* Bottom Navigation & Chapter Slider */}
        <div className={`px-4 sm:px-6 py-3 border-t flex items-center justify-between gap-4 ${getThemeStyles()}`}>
          <button
            onClick={() => setCurrentChapterIndex(Math.max(0, currentChapterIndex - 1))}
            disabled={currentChapterIndex === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
          >
            <ChevronRight className="w-4 h-4" />
            <span>الفصل السابق</span>
          </button>

          {/* Chapters Dropdown */}
          <div className="flex-1 max-w-xs text-center">
            <select
              value={currentChapterIndex}
              onChange={(e) => setCurrentChapterIndex(Number(e.target.value))}
              className={`w-full text-xs font-medium py-1 px-2 rounded-lg border text-center ${getThemeStyles()} focus:outline-none`}
            >
              {chapters.map((ch, idx) => (
                <option key={idx} value={idx}>
                  {idx + 1}. {ch}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setCurrentChapterIndex(Math.min(chapters.length - 1, currentChapterIndex + 1))}
            disabled={currentChapterIndex === chapters.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
          >
            <span>الفصل التالي</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
