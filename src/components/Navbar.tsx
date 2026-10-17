import React, { useState } from 'react';
import { ShoppingBag, ShieldCheck, BookOpen, Menu, X, ArrowLeft, MessageCircle, Download, Smartphone } from 'lucide-react';
import { StoreSettings, SocialLinks } from '../types';
import { usePwaInstall } from '../hooks/usePwaInstall';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onNavigateHome: () => void;
  onNavigateLanding: () => void;
  onNavigateAdmin: () => void;
  onNavigatePos: () => void;
  onSelectCategory: (catId: string) => void;
  onScrollToSection: (sectionId: string) => void;
  storeSettings: StoreSettings;
  socialLinks: SocialLinks;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onNavigateHome,
  onNavigateLanding,
  onNavigateAdmin,
  onNavigatePos,
  onSelectCategory,
  onScrollToSection,
  storeSettings,
  socialLinks,
  activeSection
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);

  const { isInstallable, isInstalled, isIOS, triggerInstall } = usePwaInstall();

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosTip(true);
      return;
    }
    const success = await triggerInstall();
    if (!success && !isInstallable) {
      // If browser doesn't support automatic prompt, show friendly tip
      setShowIosTip(true);
    }
  };

  const handleOpenWhatsApp = () => {
    let cleanPhone = socialLinks.whatsappNumber.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '213' + cleanPhone.substring(1);
    }
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(socialLinks.whatsappDefaultMsg)}`, '_blank');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Slim Dismissible Announcement Banner */}
      {!dismissBanner && storeSettings.showAnnouncement && (
        <div className="bg-stone-900 text-stone-200 text-xs px-4 py-2 text-center flex items-center justify-between">
          <div className="w-6"></div>
          <span className="font-medium truncate max-w-2xl">
            {storeSettings.announcementNotice}
          </span>
          <button
            onClick={() => setDismissBanner(true)}
            className="text-stone-400 hover:text-white p-0.5 rounded transition-colors"
            title="إغلاق التنبيه"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (4-5 Nav Links) - Zone 3 (Primary Action) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={onNavigateHome}
          className="text-right flex items-center gap-3 shrink-0 group text-stone-900 focus:outline-none"
        >
          {storeSettings.logoImage ? (
            <img
              src={storeSettings.logoImage}
              alt={storeSettings.storeName}
              className="w-10 h-10 rounded-lg object-contain bg-white border border-stone-200 shadow-2xs p-0.5"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-editorial font-bold text-xl shadow-inner border border-amber-500/20">
              ر
            </div>
          )}
          <div className="flex flex-col text-right">
            <span className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors whitespace-nowrap">
              {storeSettings.storeName}
            </span>
            <span className="text-[10px] text-stone-500 tracking-wider font-medium uppercase -mt-1 hidden sm:block">
              {storeSettings.storeNameFr}
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-700">
          <button
            onClick={onNavigateHome}
            className={`transition-colors whitespace-nowrap hover:text-stone-900 ${activeSection === 'home' ? 'text-amber-900 font-bold' : ''}`}
          >
            الرئيسية
          </button>
          <button
            onClick={() => { onNavigateHome(); onSelectCategory('all'); }}
            className="transition-colors whitespace-nowrap hover:text-stone-900"
          >
            معرض الكتب
          </button>
          <button
            onClick={() => { onNavigateHome(); onSelectCategory('epub'); }}
            className="transition-colors whitespace-nowrap hover:text-stone-900 flex items-center gap-1.5"
          >
            <span>كتب ePub الرقمية</span>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">فوري</span>
          </button>
          <button
            onClick={() => onScrollToSection('articles-section')}
            className="transition-colors whitespace-nowrap hover:text-stone-900 flex items-center gap-1"
          >
            <span>المقالات النقدية</span>
            <span className="text-[9px] bg-stone-100 text-stone-600 px-1 py-0.2 rounded font-mono">محمي</span>
          </button>
          <button
            onClick={() => onScrollToSection('videos-section')}
            className="transition-colors whitespace-nowrap hover:text-stone-900"
          >
            القناة المرئية
          </button>
          <button
            onClick={onNavigateLanding}
            className="transition-colors whitespace-nowrap text-rose-700 hover:text-rose-900 font-semibold"
          >
            عرض الأسبوع: رماد الأندلس
          </button>
        </nav>

        {/* Zone 3: Primary Action (Shopping bag + Admin Dashboard toggle + WhatsApp) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick WhatsApp button in header */}
          <button
            onClick={handleOpenWhatsApp}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
            title="تواصل مباشر عبر واتساب دار رميسة"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>واتساب</span>
          </button>

          {/* POS Terminal access button */}
          <button
            onClick={onNavigatePos}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap border border-emerald-300 shadow-2xs"
            title="نقطة البيع ومعارض الكتاب POS"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>نقطة البيع POS</span>
          </button>

          {/* Admin access button */}
          <button
            onClick={onNavigateAdmin}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap border border-stone-200"
            title="الدخول إلى لوحة التحكم الإدارية"
          >
            <ShieldCheck className="w-4 h-4 text-stone-600" />
            <span>لوحة التحكم</span>
          </button>

          {/* PWA Install Button */}
          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-all whitespace-nowrap shadow-2xs active:scale-95"
              title="تثبيت متجر دار رميسة كتطبيق PWA"
            >
              <Download className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">تثبيت التطبيق</span>
              <span className="sm:hidden">تثبيت</span>
            </button>
          )}

          {/* Cart button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-all shadow-sm whitespace-nowrap active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>السلة</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 bg-amber-500 text-stone-950 text-xs font-bold rounded-full flex items-center justify-center -ml-1">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-700 hover:text-stone-900 focus:outline-none"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-stone-50 border-b border-stone-200 px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2 text-base font-medium text-stone-800 text-right">
            <button
              onClick={() => { onNavigateHome(); setMobileMenuOpen(false); }}
              className="text-right py-2 px-3 rounded-md hover:bg-stone-200 transition-colors"
            >
              الرئيسية
            </button>
            <button
              onClick={() => { onNavigateHome(); onSelectCategory('all'); setMobileMenuOpen(false); }}
              className="text-right py-2 px-3 rounded-md hover:bg-stone-200 transition-colors"
            >
              معرض الكتب الكامل
            </button>
            <button
              onClick={() => { onNavigateHome(); onSelectCategory('epub'); setMobileMenuOpen(false); }}
              className="text-right py-2 px-3 rounded-md hover:bg-stone-200 transition-colors"
            >
              الكتب الرقمية ePub المدفوعة
            </button>
            <button
              onClick={() => { onScrollToSection('articles-section'); setMobileMenuOpen(false); }}
              className="text-right py-2 px-3 rounded-md hover:bg-stone-200 transition-colors"
            >
              المقالات الثقافية والنقدية (محمية)
            </button>
            <button
              onClick={() => { onScrollToSection('videos-section'); setMobileMenuOpen(false); }}
              className="text-right py-2 px-3 rounded-md hover:bg-stone-200 transition-colors"
            >
              القناة المرئية لدار رميسة
            </button>
            <button
              onClick={() => { onNavigateLanding(); setMobileMenuOpen(false); }}
              className="text-right py-2 px-3 rounded-md bg-rose-50 text-rose-800 font-bold transition-colors"
            >
              صفحة العرض الخاص: رواية رماد الأندلس
            </button>
            <button
              onClick={() => { handleOpenWhatsApp(); setMobileMenuOpen(false); }}
              className="text-right py-2 px-3 rounded-md bg-emerald-50 text-emerald-800 font-bold transition-colors flex items-center justify-between"
            >
              <span>محادثة واتساب مباشرة</span>
              <MessageCircle className="w-4 h-4 text-emerald-600" />
            </button>
            <div className="pt-2 border-t border-stone-200 space-y-2">
              {!isInstalled && (
                <button
                  onClick={() => { handleInstallClick(); setMobileMenuOpen(false); }}
                  className="w-full text-right py-2.5 px-3 rounded-md bg-amber-50 text-amber-900 border border-amber-300 font-bold flex items-center justify-between"
                >
                  <span>تثبيت تطبيق دار رميسة</span>
                  <Download className="w-4 h-4 text-amber-700" />
                </button>
              )}

              <button
                onClick={() => { onNavigatePos(); setMobileMenuOpen(false); }}
                className="w-full text-right py-2.5 px-3 rounded-md bg-emerald-800 text-white font-bold flex items-center justify-between shadow-2xs"
              >
                <span>نقطة البيع ومعارض الكتاب POS</span>
                <BookOpen className="w-4 h-4 text-emerald-300" />
              </button>

              <button
                onClick={() => { onNavigateAdmin(); setMobileMenuOpen(false); }}
                className="w-full text-right py-2.5 px-3 rounded-md bg-stone-900 text-white flex items-center justify-between"
              >
                <span>الدخول للوحة تحكم المشرف</span>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* iOS Safari Home Screen Guide Modal */}
      {showIosTip && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-right space-y-4 shadow-2xl border border-stone-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-600" />
                <span>تثبيت التطبيق على آيفون / آيباد</span>
              </span>
              <button onClick={() => setShowIosTip(false)} className="p-1 rounded text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              لتثبيت متجر دار رميسة كتطبيق مستقل على شاشة هاتفك:
            </p>
            <ol className="text-xs text-stone-800 space-y-2 list-decimal list-inside pr-1 font-medium">
              <li>اضغط على زر المشاركة <strong>(Share / مربع به سهم للأعلى)</strong> في متصفح سفاري.</li>
              <li>مرر للأسفل واختر <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>.</li>
              <li>اضغط <strong>"إضافة" (Add)</strong> في الزاوية العلوية لتثبيت التطبيق فوراً.</li>
            </ol>
            <button
              onClick={() => setShowIosTip(false)}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
