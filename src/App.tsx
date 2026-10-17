import React, { useState, useEffect } from 'react';
import {
  BookOpen, ShoppingBag, ShieldCheck, Truck, Sparkles,
  ArrowRight, Search, Check, Heart, Award, Globe, Phone, Mail, MapPin,
  Lock, MessageCircle, Play, Video, Share2
} from 'lucide-react';

import { Book, Category, OrderItem, Order, Wilaya, AbandonedCart, Customer, Article, VideoItem, SocialLinks } from './types';
import { StorageService } from './services/storage';
import { PixelService } from './services/pixelService';

import { Navbar } from './components/Navbar';
import { BookCard } from './components/BookCard';
import { BookModal } from './components/BookModal';
import { EpubReaderModal } from './components/EpubReaderModal';
import { CartDrawer } from './components/CartDrawer';
import { ChargilyModal } from './components/ChargilyModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { LandingPageView } from './components/LandingPageView';

import { ArticlesSection } from './components/ArticlesSection';
import { ArticleReaderModal } from './components/ArticleReaderModal';
import { VideosSection } from './components/VideosSection';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { VisitorCounter } from './components/VisitorCounter';

import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { PosTerminal } from './components/pos/PosTerminal';
import { SanityService } from './services/sanityService';

export default function App() {
  // Global Data State
  const [books, setBooks] = useState<Book[]>(StorageService.getBooks());
  const [categories, setCategories] = useState<Category[]>(StorageService.getCategories());
  const [wilayas, setWilayas] = useState<Wilaya[]>(StorageService.getWilayas());
  const [orders, setOrders] = useState<Order[]>(StorageService.getOrders());
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>(StorageService.getAbandonedCarts());
  const [customers, setCustomers] = useState<Customer[]>(StorageService.getCustomers());
  const [landingConfig, setLandingConfig] = useState(StorageService.getLandingPage());
  const [pixelSettings, setPixelSettings] = useState(StorageService.getPixelSettings());
  const [chargilyConfig, setChargilyConfig] = useState(StorageService.getChargilyConfig());
  const [epubSettings, setEpubSettings] = useState(StorageService.getEpubSettings());
  const [storeSettings, setStoreSettings] = useState(StorageService.getStoreSettings());

  // New Articles, Videos, Social State
  const [articles, setArticles] = useState<Article[]>(StorageService.getArticles());
  const [videos, setVideos] = useState<VideoItem[]>(StorageService.getVideos());
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(StorageService.getSocialLinks());

  // Navigation & View State
  const [currentView, setCurrentView] = useState<'store' | 'admin' | 'landing' | 'pos'>('store');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(StorageService.isAdminLoggedIn());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Cart & Modals
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeEpubBook, setActiveEpubBook] = useState<Book | null>(null);
  const [chargilyOrder, setChargilyOrder] = useState<Order | null>(null);
  const [isChargilyModalOpen, setIsChargilyModalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // Articles & Videos Modals
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // Storefront Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Refresh data listener
  const refreshAllData = () => {
    setBooks(StorageService.getBooks());
    setCategories(StorageService.getCategories());
    setWilayas(StorageService.getWilayas());
    setOrders(StorageService.getOrders());
    setAbandonedCarts(StorageService.getAbandonedCarts());
    setCustomers(StorageService.getCustomers());
    setLandingConfig(StorageService.getLandingPage());
    setPixelSettings(StorageService.getPixelSettings());
    setChargilyConfig(StorageService.getChargilyConfig());
    setEpubSettings(StorageService.getEpubSettings());
    setStoreSettings(StorageService.getStoreSettings());
    setArticles(StorageService.getArticles());
    setVideos(StorageService.getVideos());
    setSocialLinks(StorageService.getSocialLinks());
    setIsAdminLoggedIn(StorageService.isAdminLoggedIn());
  };

  useEffect(() => {
    window.addEventListener('roumaissa-storage-updated', refreshAllData);
    PixelService.trackPageView('الصفحة الرئيسية لدار رميسة');

    // Dedicated URL hash and route listener (/admin, /pos, /landing, etc.)
    const handleUrlRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();

      if (hash === '#admin' || hash === '#dashboard' || path === '/admin' || path === '/dashboard') {
        if (StorageService.isAdminLoggedIn()) {
          setCurrentView('admin');
        } else {
          setIsLoginModalOpen(true);
        }
      } else if (hash === '#pos' || path === '/pos') {
        setCurrentView('pos');
      } else if (hash === '#landing' || path === '/landing') {
        setCurrentView('landing');
      } else if (hash === '#store' || hash === '' || path === '/') {
        setCurrentView('store');
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);

    // Automated Real-Time Background sync with Sanity CMS
    const sanityCfg = SanityService.getConfig();
    if (sanityCfg.projectId && sanityCfg.dataset) {
      SanityService.fetchBooks().then((res) => {
        if (res.success && res.books.length > 0) {
          StorageService.saveBooks(res.books);
          setBooks(res.books);
        }
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('roumaissa-storage-updated', refreshAllData);
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, []);

  // Cart Management
  const handleAddToCart = (book: Book, format: 'print' | 'epub', quantity: number = 1) => {
    const price = format === 'print' ? book.pricePrint : book.priceEpub;
    const existingIndex = cartItems.findIndex(i => i.bookId === book.id && i.format === format);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += quantity;
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          bookId: book.id,
          title: book.title,
          author: book.author,
          format,
          price,
          quantity
        }
      ]);
    }

    PixelService.trackAddToCart(book.title, price, quantity, format);
  };

  const handleUpdateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    const updated = [...cartItems];
    updated[index].quantity = quantity;
    setCartItems(updated);
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleBuyNowDirect = (book: Book, format: 'print' | 'epub') => {
    handleAddToCart(book, format, 1);
    setIsCartOpen(true);
  };

  // Checkout Handlers
  const handleCheckoutCod = (newOrder: Order) => {
    StorageService.addOrder(newOrder);
    PixelService.trackPurchase(newOrder.orderNumber, newOrder.totalAmount, 'cod', newOrder.items.length);
    setCartItems([]);
    setIsCartOpen(false);
    setConfirmedOrder(newOrder);
    setIsConfirmationModalOpen(true);
  };

  const handleCheckoutChargily = (newOrder: Order) => {
    setChargilyOrder(newOrder);
    setIsCartOpen(false);
    setIsChargilyModalOpen(true);
  };

  const handleChargilySuccess = (completedOrder: Order) => {
    setIsChargilyModalOpen(false);
    setCartItems([]);
    setConfirmedOrder(completedOrder);
    setIsConfirmationModalOpen(true);
  };

  // Admin Navigation Auth
  const handleNavigateAdmin = () => {
    if (StorageService.isAdminLoggedIn()) {
      setCurrentView('admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLogout = () => {
    StorageService.setAdminLoggedIn(false);
    setIsAdminLoggedIn(false);
    setCurrentView('store');
  };

  const handleScrollToSection = (sectionId: string) => {
    setCurrentView('store');
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Filter books
  const filteredBooks = books.filter(b => {
    const matchesQuery = b.title.includes(searchQuery) || b.author.includes(searchQuery) || b.isbn.includes(searchQuery);
    if (selectedCategory === 'all') return matchesQuery;
    if (selectedCategory === 'epub') return matchesQuery && b.hasEpub;
    return matchesQuery && b.category === selectedCategory;
  });

  const featuredBook = books.find(b => b.id === landingConfig.bookId) || books[0];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      
      {/* View Router: POS Cashier Terminal, Admin Dashboard, Landing Page, or Storefront */}
      {currentView === 'pos' ? (
        <PosTerminal
          books={books}
          onBackToStore={() => setCurrentView('store')}
          onNavigateAdmin={handleNavigateAdmin}
        />
      ) : currentView === 'admin' ? (
        <AdminLayout
          onBackToStore={() => setCurrentView('store')}
          onLogout={handleLogout}
          onOpenPosTerminal={() => setCurrentView('pos')}
          orders={orders}
          abandonedCarts={abandonedCarts}
          books={books}
          categories={categories}
          wilayas={wilayas}
          customers={customers}
          landingConfig={landingConfig}
          pixelSettings={pixelSettings}
          chargilyConfig={chargilyConfig}
          epubSettings={epubSettings}
          storeSettings={storeSettings}
          articles={articles}
          videos={videos}
          socialLinks={socialLinks}
          onRefreshAll={refreshAllData}
          onPreviewLanding={() => setCurrentView('landing')}
        />
      ) : currentView === 'landing' ? (
        /* Dedicated Marketing Landing Page */
        <LandingPageView
          config={landingConfig}
          book={featuredBook}
          onBackToStore={() => setCurrentView('store')}
          onOrderSuccess={(order) => {
            setConfirmedOrder(order);
            setIsConfirmationModalOpen(true);
          }}
          onOrderChargily={(order) => {
            setChargilyOrder(order);
            setIsChargilyModalOpen(true);
          }}
          onOpenReader={(b) => setActiveEpubBook(b)}
        />
      ) : (
        /* Primary Prestigious Publishing Storefront */
        <>
          <Navbar
            cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
            onOpenCart={() => setIsCartOpen(true)}
            onNavigateHome={() => {
              setCurrentView('store');
              setSelectedCategory('all');
            }}
            onNavigateLanding={() => setCurrentView('landing')}
            onNavigateAdmin={handleNavigateAdmin}
            onNavigatePos={() => setCurrentView('pos')}
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onScrollToSection={handleScrollToSection}
            storeSettings={storeSettings}
            socialLinks={socialLinks}
            activeSection={currentView}
          />

          <main className="flex-1">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 to-stone-50 border-b border-stone-200/80 py-12 sm:py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Text Column */}
                  <div className="lg:col-span-7 space-y-6 text-right">
                    
                    {/* Prestigious Stamp */}
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600">
                      <span>الجمهورية الجزائرية الديمقراطية الشعبية</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-800 font-bold">دار النشر والتوزيع المعتمدة</span>
                    </div>

                    <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-950 tracking-tight leading-[1.2] text-wrap-balance">
                      حيث تلتقي عراقة الفكر بألق الكلمة والترجمات العالمية
                    </h1>

                    <p className="font-editorial text-lg sm:text-xl text-stone-700 leading-relaxed max-w-2xl">
                      {storeSettings.heroQuote}
                    </p>

                    {/* Action CTAs */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
                      >
                        <BookOpen className="w-4 h-4 text-amber-400" />
                        <span>استكشف معرض الإصدارات</span>
                      </button>

                      <button
                        onClick={() => handleScrollToSection('articles-section')}
                        className="px-5 py-3.5 bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-xs"
                      >
                        <span>المقالات النقدية</span>
                      </button>

                      <button
                        onClick={() => setCurrentView('landing')}
                        className="px-6 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-xs"
                      >
                        <Sparkles className="w-4 h-4 text-rose-600" />
                        <span>عرض الأسبوع: رماد الأندلس</span>
                      </button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="pt-6 border-t border-stone-200/80 flex flex-wrap items-center gap-6 text-xs text-stone-600">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-amber-700" />
                        <span>توصيل لكافة 58 ولاية جزائرية</span>
                      </div>
                      <span aria-hidden="true">·</span>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>شارجلي باي (الذهبية و CIB) والدفع عند الاستلام</span>
                      </div>
                      <span aria-hidden="true">·</span>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-stone-700" />
                        <span>نسخ ورقية ورقمية ePub</span>
                      </div>
                    </div>

                  </div>

                  {/* 3D Visual Featured Hero Presentation */}
                  <div className="lg:col-span-5 flex justify-center">
                    <div
                      onClick={() => setSelectedBook(featuredBook)}
                      className="cursor-pointer group relative max-w-[320px] w-full aspect-[3/4]"
                    >
                      <div
                        className="book-cover-3d w-full h-full rounded-r-xl rounded-l-xs overflow-hidden flex flex-col justify-between p-6 relative shadow-2xl border border-black/10"
                        style={{ backgroundColor: featuredBook.coverColor, color: '#fff' }}
                      >
                        <div className="absolute right-0 top-0 bottom-0 w-4.5 book-spine z-10 border-l border-black/25" />
                        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/30 via-transparent to-black/50" />

                        <div className="relative z-10 flex items-center justify-between text-xs border-b border-white/20 pb-2.5">
                          <span className="font-editorial text-amber-200 font-bold tracking-wide">
                            دار رميسة للنشر
                          </span>
                          <span className="font-mono text-stone-200">{featuredBook.publishYear}</span>
                        </div>

                        <div className="relative z-10 text-center my-auto px-2">
                          <h2
                            className="font-editorial text-2xl sm:text-3xl font-bold leading-tight mb-2 tracking-wide"
                            style={{ color: featuredBook.coverAccent }}
                          >
                            {featuredBook.title}
                          </h2>
                          <p className="text-sm text-stone-200 font-medium">
                            {featuredBook.author}
                          </p>
                          <span className="inline-block mt-3 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono backdrop-blur-xs">
                            الطبعة الفاخرة المحدودة
                          </span>
                        </div>

                        <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/20 text-xs text-stone-300 font-mono">
                          <span>{featuredBook.pages} صفحة</span>
                          <span className="text-amber-200 font-bold">{featuredBook.pricePrint} دج</span>
                        </div>
                      </div>

                      <div className="text-center mt-3 text-xs text-stone-500 font-medium group-hover:text-amber-900 transition-colors">
                        اضغط للمعاينة وقراءة الفصول التجريبية ←
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* Catalog Section */}
            <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
              
              {/* Section Header & Search */}
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-stone-200">
                <div className="space-y-1 text-right">
                  <span className="text-xs font-bold text-amber-800 tracking-wider">
                    معرض الكتب والإصدارات
                  </span>
                  <h2 className="font-editorial text-3xl font-bold text-stone-950">
                    أحدث عناوين دار رميسة في الأدب والفكر والترجمة
                  </h2>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن عنوان، كاتب، أو رقم ISBN..."
                    className="w-full text-xs p-3 pr-9 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600 bg-white"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3.5" />
                </div>
              </div>

              {/* Segmented Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-4 scrollbar-none text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  كافة الإصدارات ({books.length})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('epub')}
                  className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === 'epub'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>الكتب الرقمية ePub المدفوعة</span>
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-stone-900 text-white font-bold shadow-xs'
                        : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Books Grid */}
              {filteredBooks.length === 0 ? (
                <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-stone-200 my-4">
                  <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
                  <p className="text-stone-600 font-medium text-sm">
                    لم يتم العثور على كتب تطابق بحثك حالياً.
                  </p>
                  <button
                    onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                    className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold"
                  >
                    إعادة ضبط الفلاتر
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                  {filteredBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onSelectBook={(b) => setSelectedBook(b)}
                      onAddToCart={(b, format) => handleAddToCart(b, format, 1)}
                      onOpenReader={(b) => setActiveEpubBook(b)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Cultural & Literary Articles Section (With Anti-Copy Protection) */}
            <ArticlesSection
              articles={articles}
              onSelectArticle={(art) => setSelectedArticle(art)}
            />

            {/* Cultural & Documentary Videos Section */}
            <VideosSection
              videos={videos}
              onSelectVideo={(vid) => setSelectedVideo(vid)}
            />

            {/* Editorial Craftsmanship & Publishing Standards Section */}
            <section className="bg-white border-t border-b border-stone-200 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
                  <span className="text-xs font-bold text-amber-800 tracking-wider">
                    معايير دار رميسة للنشر
                  </span>
                  <h3 className="font-editorial text-3xl font-bold text-stone-950">
                    صناعة الكتاب بأعلى درجات العناية والإتقان
                  </h3>
                  <p className="text-stone-600 text-xs sm:text-sm">
                    نلتزم في دار رميسة بتقديم محتوى راقٍ وتجليد فاخر يحترم عقل القارئ ويحفظ بهاء المكتبة العربية.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
                  <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold">
                      01
                    </div>
                    <h4 className="font-editorial text-lg font-bold text-stone-900">
                      ورق شمواه إيطالي وطباعة محكمة
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      نعتمد ورق شمواه طبيعي مريح للعين أثناء القراءة الطويلة، مع تجليد مقوى خياطة وسلوفان مطفي يحمي الغلاف لسنوات.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold">
                      02
                    </div>
                    <h4 className="font-editorial text-lg font-bold text-stone-900">
                      نشر رقمي آمن بصيغة ePub
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      تحميل فوري لملفات ePub مع علامة مائية رقمية تحمي الملكية، وقارئ إلكتروني أنيق مدمج يتيح القراءة في أي جهاز.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold">
                      03
                    </div>
                    <h4 className="font-editorial text-lg font-bold text-stone-900">
                      شحن وتوزيع لكافة الـ 58 ولاية
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      اتفاقيات مع كبرى شركات التوصيل السريع لتسليم الطرود لباب منزلك مع إمكانية الدفع نقداً أو بالبطاقة الذهبية.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Footer with Social Media Integration */}
          <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 text-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-right">
                
                {/* Brand & Social Strip */}
                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-editorial font-bold text-lg">
                      ر
                    </div>
                    <span className="font-editorial text-xl font-bold text-white">
                      {storeSettings.storeName}
                    </span>
                  </div>
                  <p className="text-stone-400 text-xs max-w-md leading-relaxed">
                    {storeSettings.tagline} · متجر متخصص في نشر وتوزيع أحدث الإصدارات الأدبية والفكرية والترجمات في الجزائر والوطن العربي.
                  </p>

                  {/* Social Media Channels Links */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-stone-400 block">
                      تابعونا على منصات التواصل الاجتماعي:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {socialLinks.facebook && (
                        <a
                          href={socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors flex items-center gap-1.5 font-bold text-[11px] border border-stone-700"
                        >
                          <span>فيسبوك</span>
                        </a>
                      )}
                      {socialLinks.instagram && (
                        <a
                          href={socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors flex items-center gap-1.5 font-bold text-[11px] border border-stone-700"
                        >
                          <span>إنستغرام</span>
                        </a>
                      )}
                      {socialLinks.tiktok && (
                        <a
                          href={socialLinks.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors flex items-center gap-1.5 font-bold text-[11px] border border-stone-700"
                        >
                          <span>تيك توك</span>
                        </a>
                      )}
                      {socialLinks.youtube && (
                        <a
                          href={socialLinks.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors flex items-center gap-1.5 font-bold text-[11px] border border-stone-700"
                        >
                          <span>يوتيوب</span>
                        </a>
                      )}
                      {socialLinks.telegram && (
                        <a
                          href={socialLinks.telegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors flex items-center gap-1.5 font-bold text-[11px] border border-stone-700"
                        >
                          <span>تيليجرام</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-500 flex items-center gap-2 pt-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>جميع الحقوق محفوظة لدار رميسة للنشر والترجمة © {new Date().getFullYear()}</span>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-sm mb-3">
                    أقسام المنصة
                  </h4>
                  <ul className="space-y-2 text-stone-400">
                    <li>
                      <button onClick={() => { setSelectedCategory('all'); }} className="hover:text-white transition-colors">
                        معرض الكتب الكامل
                      </button>
                    </li>
                    <li>
                      <button onClick={() => { setSelectedCategory('epub'); }} className="hover:text-white transition-colors">
                        الكتب الإلكترونية ePub
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleScrollToSection('articles-section')} className="hover:text-white transition-colors">
                        المقالات النقدية (محمية)
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleScrollToSection('videos-section')} className="hover:text-white transition-colors">
                        القناة المرئية والندوات
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setCurrentView('landing')} className="hover:text-white transition-colors text-rose-400">
                        عرض الرواية الأكثر مبيعاً
                      </button>
                    </li>
                    <li>
                      <button onClick={handleNavigateAdmin} className="hover:text-white transition-colors flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
                        <span>دخول المشرفين (Admin)</span>
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Contact info & WhatsApp */}
                <div className="space-y-2 text-stone-400">
                  <h4 className="font-bold text-white text-sm mb-3">
                    المقر والتواصل بالجزائر
                  </h4>
                  <p className="flex items-center gap-2 text-stone-300">
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{storeSettings.address}</span>
                  </p>
                  <p className="flex items-center gap-2 font-mono">
                    <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{storeSettings.phone}</span>
                  </p>
                  <p className="flex items-center gap-2 font-mono">
                    <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{storeSettings.email}</span>
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-1 rounded border border-stone-700">
                      بوابة Chargily Pay مفعّلة
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-1 rounded border border-emerald-800">
                      دعم واتساب متاح
                    </span>
                  </div>
                </div>

              </div>

              {/* Real-time Visitor Counter Section */}
              <div className="mt-12 pt-8 border-t border-stone-800">
                <VisitorCounter variant="footer" />
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Floating WhatsApp Live Chat Widget */}
      {currentView === 'store' && (
        <FloatingWhatsApp socialLinks={socialLinks} />
      )}

      {/* Global Modals */}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onCheckoutCod={handleCheckoutCod}
        onCheckoutChargily={handleCheckoutChargily}
        storeSettings={storeSettings}
      />

      {/* Book Detail Modal */}
      <BookModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onAddToCart={(b, format, qty) => handleAddToCart(b, format, qty || 1)}
        onBuyNow={(b, format) => handleBuyNowDirect(b, format)}
        onOpenReader={(b) => {
          setSelectedBook(null);
          setActiveEpubBook(b);
        }}
      />

      {/* In-Browser ePub Reader Modal */}
      <EpubReaderModal
        book={activeEpubBook}
        onClose={() => setActiveEpubBook(null)}
      />

      {/* Article Reader Modal (Copy-Protected) */}
      <ArticleReaderModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        socialLinks={socialLinks}
      />

      {/* Video Player Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />

      {/* Chargily Pay Checkout Simulation Modal */}
      <ChargilyModal
        order={chargilyOrder}
        isOpen={isChargilyModalOpen}
        onClose={() => setIsChargilyModalOpen(false)}
        onSuccess={handleChargilySuccess}
      />

      {/* Order Confirmation Screen */}
      <OrderConfirmationModal
        order={confirmedOrder}
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onOpenReader={(b) => setActiveEpubBook(b)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsAdminLoggedIn(true);
          setCurrentView('admin');
        }}
      />

    </div>
  );
}
