import {
  Book, Category, Wilaya, Order, AbandonedCart, Customer,
  LandingPageConfig, PixelSettings, PixelEvent, ChargilyConfig,
  EpubSettings, StoreSettings, Article, VideoItem, SocialLinks
} from '../types';
import {
  INITIAL_BOOKS, INITIAL_CATEGORIES, INITIAL_WILAYAS, INITIAL_ORDERS,
  INITIAL_ABANDONED_CARTS, INITIAL_CUSTOMERS, INITIAL_LANDING_PAGE,
  INITIAL_PIXEL_SETTINGS, INITIAL_CHARGILY_CONFIG, INITIAL_EPUB_SETTINGS,
  INITIAL_STORE_SETTINGS, INITIAL_ARTICLES, INITIAL_VIDEOS, INITIAL_SOCIAL_LINKS
} from '../data/initialData';

const STORAGE_KEYS = {
  BOOKS: 'roumaissa_books_v1',
  CATEGORIES: 'roumaissa_categories_v1',
  WILAYAS: 'roumaissa_wilayas_v1',
  ORDERS: 'roumaissa_orders_v1',
  ABANDONED: 'roumaissa_abandoned_v1',
  CUSTOMERS: 'roumaissa_customers_v1',
  LANDING: 'roumaissa_landing_v1',
  PIXEL: 'roumaissa_pixel_v1',
  PIXEL_EVENTS: 'roumaissa_pixel_events_v1',
  CHARGILY: 'roumaissa_chargily_v1',
  EPUB: 'roumaissa_epub_v1',
  STORE: 'roumaissa_store_v1',
  ADMIN_AUTH: 'roumaissa_admin_auth_v1',
  ADMIN_PIN: 'roumaissa_admin_pin_v1',
  ARTICLES: 'roumaissa_articles_v1',
  VIDEOS: 'roumaissa_videos_v1',
  SOCIAL: 'roumaissa_social_v1'
};

function load<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event('roumaissa-storage-updated'));
  } catch (e) {
    console.error('Storage write error', e);
  }
}

export const StorageService = {
  // Books
  getBooks: (): Book[] => load<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS),
  saveBooks: (books: Book[]) => save(STORAGE_KEYS.BOOKS, books),
  addBook: (book: Book) => {
    const books = StorageService.getBooks();
    const updated = [book, ...books];
    save(STORAGE_KEYS.BOOKS, updated);
    return updated;
  },
  updateBook: (book: Book) => {
    const books = StorageService.getBooks();
    const updated = books.map(b => b.id === book.id ? book : b);
    save(STORAGE_KEYS.BOOKS, updated);
    return updated;
  },
  deleteBook: (id: string) => {
    const books = StorageService.getBooks();
    const updated = books.filter(b => b.id !== id);
    save(STORAGE_KEYS.BOOKS, updated);
    return updated;
  },

  // Categories
  getCategories: (): Category[] => load<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES),
  saveCategories: (categories: Category[]) => save(STORAGE_KEYS.CATEGORIES, categories),

  // Wilayas
  getWilayas: (): Wilaya[] => load<Wilaya[]>(STORAGE_KEYS.WILAYAS, INITIAL_WILAYAS),
  saveWilayas: (wilayas: Wilaya[]) => save(STORAGE_KEYS.WILAYAS, wilayas),
  updateWilaya: (wilaya: Wilaya) => {
    const wilayas = StorageService.getWilayas();
    const updated = wilayas.map(w => w.id === wilaya.id ? wilaya : w);
    save(STORAGE_KEYS.WILAYAS, updated);
    return updated;
  },

  // Orders
  getOrders: (): Order[] => load<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS),
  saveOrders: (orders: Order[]) => save(STORAGE_KEYS.ORDERS, orders),
  addOrder: (order: Order) => {
    const orders = StorageService.getOrders();
    const updated = [order, ...orders];
    save(STORAGE_KEYS.ORDERS, updated);

    // Update customer stats
    const customers = StorageService.getCustomers();
    const existingCust = customers.find(c => c.phone === order.phone);
    if (existingCust) {
      existingCust.ordersCount += 1;
      existingCust.totalSpent += order.totalAmount;
      existingCust.lastOrderDate = new Date().toISOString().split('T')[0];
      StorageService.saveCustomers([...customers]);
    } else {
      StorageService.addCustomer({
        id: `cust-${Date.now()}`,
        name: order.customerName,
        phone: order.phone,
        email: order.email,
        wilaya: order.wilayaName,
        ordersCount: 1,
        totalSpent: order.totalAmount,
        registeredDate: new Date().toISOString().split('T')[0],
        lastOrderDate: new Date().toISOString().split('T')[0]
      });
    }

    return updated;
  },
  updateOrderStatus: (orderId: string, status: Order['orderStatus'], paymentStatus?: Order['paymentStatus']) => {
    const orders = StorageService.getOrders();
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: status,
          paymentStatus: paymentStatus || o.paymentStatus
        };
      }
      return o;
    });
    save(STORAGE_KEYS.ORDERS, updated);
    return updated;
  },

  // Abandoned Carts
  getAbandonedCarts: (): AbandonedCart[] => load<AbandonedCart[]>(STORAGE_KEYS.ABANDONED, INITIAL_ABANDONED_CARTS),
  saveAbandonedCarts: (carts: AbandonedCart[]) => save(STORAGE_KEYS.ABANDONED, carts),
  addAbandonedCart: (cart: AbandonedCart) => {
    const carts = StorageService.getAbandonedCarts();
    const existing = carts.find(c => c.phone === cart.phone && !c.recovered);
    if (existing) {
      const updated = carts.map(c => c.id === existing.id ? { ...cart, id: existing.id } : c);
      save(STORAGE_KEYS.ABANDONED, updated);
      return updated;
    }
    const updated = [cart, ...carts];
    save(STORAGE_KEYS.ABANDONED, updated);
    return updated;
  },
  markAbandonedCartRecovered: (id: string) => {
    const carts = StorageService.getAbandonedCarts();
    const updated = carts.map(c => c.id === id ? { ...c, recovered: true } : c);
    save(STORAGE_KEYS.ABANDONED, updated);
    return updated;
  },
  markAbandonedReminderSent: (id: string) => {
    const carts = StorageService.getAbandonedCarts();
    const updated = carts.map(c => c.id === id ? { ...c, reminderSent: true, reminderSentAt: new Date().toISOString() } : c);
    save(STORAGE_KEYS.ABANDONED, updated);
    return updated;
  },

  // Customers
  getCustomers: (): Customer[] => load<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS),
  saveCustomers: (customers: Customer[]) => save(STORAGE_KEYS.CUSTOMERS, customers),
  addCustomer: (cust: Customer) => {
    const customers = StorageService.getCustomers();
    const updated = [cust, ...customers];
    save(STORAGE_KEYS.CUSTOMERS, updated);
    return updated;
  },

  // Landing Page
  getLandingPage: (): LandingPageConfig => load<LandingPageConfig>(STORAGE_KEYS.LANDING, INITIAL_LANDING_PAGE),
  saveLandingPage: (config: LandingPageConfig) => save(STORAGE_KEYS.LANDING, config),

  // Pixel Settings & Events
  getPixelSettings: (): PixelSettings => load<PixelSettings>(STORAGE_KEYS.PIXEL, INITIAL_PIXEL_SETTINGS),
  savePixelSettings: (settings: PixelSettings) => save(STORAGE_KEYS.PIXEL, settings),
  getPixelEvents: (): PixelEvent[] => load<PixelEvent[]>(STORAGE_KEYS.PIXEL_EVENTS, []),
  logPixelEvent: (event: Omit<PixelEvent, 'id' | 'timestamp'>) => {
    const events = StorageService.getPixelEvents();
    const newEvent: PixelEvent = {
      ...event,
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('ar-DZ')
    };
    const updated = [newEvent, ...events.slice(0, 99)];
    save(STORAGE_KEYS.PIXEL_EVENTS, updated);
    return newEvent;
  },
  clearPixelEvents: () => save(STORAGE_KEYS.PIXEL_EVENTS, []),

  // Chargily
  getChargilyConfig: (): ChargilyConfig => load<ChargilyConfig>(STORAGE_KEYS.CHARGILY, INITIAL_CHARGILY_CONFIG),
  saveChargilyConfig: (config: ChargilyConfig) => save(STORAGE_KEYS.CHARGILY, config),

  // Epub Settings
  getEpubSettings: (): EpubSettings => load<EpubSettings>(STORAGE_KEYS.EPUB, INITIAL_EPUB_SETTINGS),
  saveEpubSettings: (settings: EpubSettings) => save(STORAGE_KEYS.EPUB, settings),

  // Store Settings
  getStoreSettings: (): StoreSettings => load<StoreSettings>(STORAGE_KEYS.STORE, INITIAL_STORE_SETTINGS),
  saveStoreSettings: (settings: StoreSettings) => save(STORAGE_KEYS.STORE, settings),

  // Articles & Anti-copy Protection
  getArticles: (): Article[] => load<Article[]>(STORAGE_KEYS.ARTICLES, INITIAL_ARTICLES),
  saveArticles: (articles: Article[]) => save(STORAGE_KEYS.ARTICLES, articles),
  addArticle: (article: Article) => {
    const articles = StorageService.getArticles();
    const updated = [article, ...articles];
    save(STORAGE_KEYS.ARTICLES, updated);
    return updated;
  },
  updateArticle: (article: Article) => {
    const articles = StorageService.getArticles();
    const updated = articles.map(a => a.id === article.id ? article : a);
    save(STORAGE_KEYS.ARTICLES, updated);
    return updated;
  },
  deleteArticle: (id: string) => {
    const articles = StorageService.getArticles();
    const updated = articles.filter(a => a.id !== id);
    save(STORAGE_KEYS.ARTICLES, updated);
    return updated;
  },

  // Videos
  getVideos: (): VideoItem[] => load<VideoItem[]>(STORAGE_KEYS.VIDEOS, INITIAL_VIDEOS),
  saveVideos: (videos: VideoItem[]) => save(STORAGE_KEYS.VIDEOS, videos),
  addVideo: (video: VideoItem) => {
    const videos = StorageService.getVideos();
    const updated = [video, ...videos];
    save(STORAGE_KEYS.VIDEOS, updated);
    return updated;
  },
  updateVideo: (video: VideoItem) => {
    const videos = StorageService.getVideos();
    const updated = videos.map(v => v.id === video.id ? video : v);
    save(STORAGE_KEYS.VIDEOS, updated);
    return updated;
  },
  deleteVideo: (id: string) => {
    const videos = StorageService.getVideos();
    const updated = videos.filter(v => v.id !== id);
    save(STORAGE_KEYS.VIDEOS, updated);
    return updated;
  },

  // Social Links & WhatsApp
  getSocialLinks: (): SocialLinks => load<SocialLinks>(STORAGE_KEYS.SOCIAL, INITIAL_SOCIAL_LINKS),
  saveSocialLinks: (social: SocialLinks) => save(STORAGE_KEYS.SOCIAL, social),

  // Admin Auth
  isAdminLoggedIn: (): boolean => {
    try {
      const auth = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
      return auth === 'authenticated_roumaissa_admin';
    } catch {
      return false;
    }
  },
  setAdminLoggedIn: (status: boolean) => {
    if (status) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'authenticated_roumaissa_admin');
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    }
    window.dispatchEvent(new Event('roumaissa-storage-updated'));
  },
  getAdminPin: (): string => {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || '1234';
  },
  setAdminPin: (pin: string) => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, pin);
  }
};
