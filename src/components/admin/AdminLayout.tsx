import React, { useState } from 'react';
import {
  LayoutDashboard, BookOpen, Layers, ShoppingBag, AlertCircle,
  Users, Truck, Layout, Target, CreditCard, FileText, Palette,
  ShieldCheck, LogOut, ExternalLink, ArrowRight, Menu, X,
  FileCode, Video, Share2, CloudLightning, ShoppingCart
} from 'lucide-react';
import {
  Order, AbandonedCart, Book, Category, Wilaya, Customer,
  LandingPageConfig, PixelSettings, ChargilyConfig, EpubSettings,
  StoreSettings, Article, VideoItem, SocialLinks
} from '../../types';

import { AdminOverview } from './AdminOverview';
import { AdminBooks } from './AdminBooks';
import { AdminCategories } from './AdminCategories';
import { AdminOrders } from './AdminOrders';
import { AdminAbandonedCarts } from './AdminAbandonedCarts';
import { AdminCustomers } from './AdminCustomers';
import { AdminDelivery } from './AdminDelivery';
import { AdminLandingPages } from './AdminLandingPages';
import { AdminPixel } from './AdminPixel';
import { AdminChargily } from './AdminChargily';
import { AdminEpubSettings } from './AdminEpubSettings';
import { AdminStoreCustomization } from './AdminStoreCustomization';
import { AdminSecurity } from './AdminSecurity';
import { AdminArticles } from './AdminArticles';
import { AdminVideos } from './AdminVideos';
import { AdminSocialSettings } from './AdminSocialSettings';
import { AdminPosSales } from './AdminPosSales';
import { AdminSanitySync } from './AdminSanitySync';

interface AdminLayoutProps {
  onBackToStore: () => void;
  onLogout: () => void;
  onOpenPosTerminal: () => void;
  orders: Order[];
  abandonedCarts: AbandonedCart[];
  books: Book[];
  categories: Category[];
  wilayas: Wilaya[];
  customers: Customer[];
  landingConfig: LandingPageConfig;
  pixelSettings: PixelSettings;
  chargilyConfig: ChargilyConfig;
  epubSettings: EpubSettings;
  storeSettings: StoreSettings;
  articles: Article[];
  videos: VideoItem[];
  socialLinks: SocialLinks;
  onRefreshAll: () => void;
  onPreviewLanding: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  onBackToStore,
  onLogout,
  onOpenPosTerminal,
  orders,
  abandonedCarts,
  books,
  categories,
  wilayas,
  customers,
  landingConfig,
  pixelSettings,
  chargilyConfig,
  epubSettings,
  storeSettings,
  articles,
  videos,
  socialLinks,
  onRefreshAll,
  onPreviewLanding
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'new').length;
  const abandonedCount = abandonedCarts.filter(c => !c.recovered).length;
  const posOrdersCount = orders.filter(o => o.orderType === 'pos').length;

  const navItems = [
    { id: 'overview', label: 'لوحة التحكم العامة', icon: LayoutDashboard },
    { id: 'sanity_sync', label: 'الربط السحابي Sanity CMS', icon: CloudLightning, badge: 'آلي', badgeColor: 'bg-emerald-600' },
    { id: 'pos_sales', label: 'مبيعات الـ POS والمعارض', icon: ShoppingBag, badge: posOrdersCount > 0 ? posOrdersCount : undefined, badgeColor: 'bg-amber-600' },
    { id: 'books', label: 'المنتجات والكتب', icon: BookOpen, badge: books.length },
    { id: 'articles', label: 'المقالات (حماية النسخ)', icon: FileCode, badge: articles.length },
    { id: 'videos', label: 'الفيديوهات والندوات', icon: Video, badge: videos.length },
    { id: 'categories', label: 'الأقسام والتصنيفات', icon: Layers },
    { id: 'orders', label: 'الطلبيات والمبيعات', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined, badgeColor: 'bg-amber-600' },
    { id: 'abandoned', label: 'السلة المتروكة', icon: AlertCircle, badge: abandonedCount > 0 ? abandonedCount : undefined, badgeColor: 'bg-rose-600' },
    { id: 'customers', label: 'العملاء والزبائن', icon: Users },
    { id: 'delivery', label: 'إعدادات التوصيل (58 ولاية)', icon: Truck },
    { id: 'social', label: 'التواصل الاجتماعي والواتساب', icon: Share2 },
    { id: 'landing', label: 'صفحات الهبوط الإعلانية', icon: Layout },
    { id: 'pixel', label: 'إعدادات البكسل والتتبع', icon: Target },
    { id: 'chargily', label: 'شارجلي باي والإضافات', icon: CreditCard },
    { id: 'epub', label: 'نشر الكتب الرقمية ePub', icon: FileText },
    { id: 'customization', label: 'تخصيص المتجر', icon: Palette },
    { id: 'security', label: 'الأمان ورمز PIN', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex text-right text-stone-900 font-sans">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex flex-col w-68 bg-stone-900 text-stone-200 border-l border-stone-800 shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-editorial font-bold text-xl shadow-xs">
              ر
            </div>
            <div>
              <h1 className="font-editorial text-base font-bold text-white tracking-wide">
                لوحة تحكم دار رميسة
              </h1>
              <span className="text-[10px] text-stone-400 font-mono">الإصدار 2.5 · الجزائر</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold text-white ${item.badgeColor || 'bg-stone-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-stone-800 space-y-2">
          <button
            onClick={onBackToStore}
            className="w-full py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>معاينة واجهة المتجر</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>

          <button
            onClick={onLogout}
            className="w-full py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-rose-900/50"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج الآمن</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-stone-200 h-16 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                {navItems.find(n => n.id === activeTab)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenPosTerminal}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              title="فتح كاشير نقطة البيع ومعارض الكتاب"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-200" />
              <span>كاشير المعارض POS</span>
            </button>

            <button
              onClick={onBackToStore}
              className="px-3.5 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
              <span>زيارة المتجر</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 text-stone-500 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition-colors"
              title="قفل وتسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content View Container */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <AdminOverview
              orders={orders}
              abandonedCarts={abandonedCarts}
              books={books}
              customers={customers}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'sanity_sync' && (
            <AdminSanitySync
              books={books}
              orders={orders}
              onRefreshAll={onRefreshAll}
            />
          )}

          {activeTab === 'pos_sales' && (
            <AdminPosSales
              orders={orders}
              onOpenPosTerminal={onOpenPosTerminal}
            />
          )}

          {activeTab === 'books' && (
            <AdminBooks
              books={books}
              categories={categories}
              onRefresh={onRefreshAll}
            />
          )}

          {activeTab === 'articles' && (
            <AdminArticles
              articles={articles}
              onRefresh={onRefreshAll}
            />
          )}

          {activeTab === 'videos' && (
            <AdminVideos
              videos={videos}
              onRefresh={onRefreshAll}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategories
              categories={categories}
              onRefresh={onRefreshAll}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrders
              orders={orders}
              onRefresh={onRefreshAll}
            />
          )}

          {activeTab === 'abandoned' && (
            <AdminAbandonedCarts
              abandonedCarts={abandonedCarts}
              onRefresh={onRefreshAll}
            />
          )}

          {activeTab === 'customers' && (
            <AdminCustomers
              customers={customers}
            />
          )}

          {activeTab === 'delivery' && (
            <AdminDelivery
              wilayas={wilayas}
              storeSettings={storeSettings}
              onRefresh={onRefreshAll}
            />
          )}

          {activeTab === 'social' && (
            <AdminSocialSettings
              socialLinks={socialLinks}
              onRefresh={onRefreshAll}
            />
          )}

          {activeTab === 'landing' && (
            <AdminLandingPages
              config={landingConfig}
              books={books}
              onRefresh={onRefreshAll}
              onPreviewLanding={onPreviewLanding}
            />
          )}

          {activeTab === 'pixel' && (
            <AdminPixel
              pixelSettings={pixelSettings}
              onRefresh={onRefreshAll}
            />
          )}

          {activeTab === 'chargily' && (
            <AdminChargily
              config={chargilyConfig}
              onRefresh={onRefreshAll}
            />
          )}

          {activeTab === 'epub' && (
            <AdminEpubSettings
              settings={epubSettings}
              books={books}
              onRefresh={onRefreshAll}
            />
          )}

          {activeTab === 'customization' && (
            <AdminStoreCustomization
              storeSettings={storeSettings}
              onRefresh={onRefreshAll}
            />
          )}

          {activeTab === 'security' && (
            <AdminSecurity
              onLogout={onLogout}
            />
          )}
        </main>
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-xs bg-stone-900 text-stone-200 h-full flex flex-col z-10 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-2">
              <span className="font-editorial text-base font-bold text-white">
                لوحة تحكم دار رميسة
              </span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto text-xs">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-amber-600 text-white font-bold'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-stone-800">
              <button
                onClick={() => {
                  onBackToStore();
                  setMobileSidebarOpen(false);
                }}
                className="w-full py-2 px-3 bg-stone-800 text-stone-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 mb-2"
              >
                <span>معاينة المتجر</span>
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setMobileSidebarOpen(false);
                }}
                className="w-full py-2 px-3 bg-rose-950 text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
              >
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
