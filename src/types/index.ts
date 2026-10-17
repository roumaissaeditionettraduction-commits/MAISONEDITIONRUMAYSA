export type BookFormat = 'print' | 'epub' | 'both';

export interface Book {
  id: string;
  title: string;
  originalTitle?: string;
  author: string;
  translator?: string;
  category: string;
  pricePrint: number; // in DZD
  priceEpub: number;  // in DZD
  hasEpub: boolean;
  epubFileName?: string;
  epubFileSize?: string;
  coverColor: string;
  coverImage?: string; // Base64 Data URL or compressed cover
  coverPattern?: 'arabesque' | 'geometric' | 'minimal' | 'classic';
  coverAccent: string;
  isbn: string;
  pages: number;
  publishYear: number;
  publisher: string;
  editionNumber: string;
  rating: number;
  reviewsCount: number;
  summary: string;
  excerpt: string;
  toc: string[];
  stock: number;
  isBestseller?: boolean;
  isNewRelease?: boolean;
  isFeatured?: boolean;
  tags: string[];
  sanityId?: string;
  lastSyncedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  nameFr: string;
  iconName: string;
  count: number;
  description: string;
}

export interface OrderItem {
  bookId: string;
  title: string;
  author: string;
  format: 'print' | 'epub';
  price: number;
  quantity: number;
}

export type OrderStatus = 'new' | 'confirmed' | 'processing' | 'shipping' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type PaymentMethod = 'cod' | 'chargily' | 'cash' | 'dahabia' | 'tpe';
export type OrderType = 'online' | 'pos';

export interface Order {
  id: string;
  orderNumber: string;
  orderType?: OrderType; // 'online' or 'pos'
  customerName: string;
  phone: string;
  email?: string;
  wilayaId: number;
  wilayaName: string;
  commune: string;
  address: string;
  deliveryType: 'home' | 'desk';
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  chargilyCheckoutUrl?: string;
  chargilyPaymentId?: string;
  downloadToken?: string;
  downloadCount?: number;
  notes?: string;

  // POS (Point of Sale) fields
  posCashierName?: string;
  posStandLocation?: string; // e.g., 'معرض الجزائر الدولي للكتاب SILA'
  posDiscountAmount?: number;
  posAmountPaid?: number; // Cash given by buyer
  posChangeDue?: number;  // Change returned
  posReceiptNumber?: string;

  // Sanity Cloud Sync metadata
  syncedToSanity?: boolean;
  sanityId?: string;
  lastSyncedAt?: string;
}

export interface AbandonedCart {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  wilayaName?: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  recovered: boolean;
  reminderSent: boolean;
  reminderSentAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  wilaya: string;
  ordersCount: number;
  totalSpent: number;
  registeredDate: string;
  lastOrderDate: string;
}

export interface Wilaya {
  id: number;
  code: string;
  nameAr: string;
  nameFr: string;
  homeDeliveryFee: number;
  deskDeliveryFee: number;
  isAvailable: boolean;
}

export interface LandingPageConfig {
  id: string;
  slug: string;
  bookId: string;
  isActive: boolean;
  heroHeadline: string;
  heroSubheadline: string;
  urgencyBanner: string;
  countdownMinutes: number;
  discountPercentage: number;
  guaranteeText: string;
  featuresList: string[];
}

export interface PixelSettings {
  facebookPixelId: string;
  tiktokPixelId: string;
  googleAnalyticsId: string;
  snapchatPixelId: string;
  isEnabled: boolean;
}

export interface PixelEvent {
  id: string;
  platform: 'facebook' | 'tiktok' | 'google' | 'snapchat';
  eventName: string;
  timestamp: string;
  parameters: Record<string, any>;
}

export interface ChargilyConfig {
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  testMode: boolean;
  isConnected: boolean;
  autoConfirmEpub: boolean;
}

export interface EpubSettings {
  allowInstantBrowserPreview: boolean;
  maxDownloadAttempts: number;
  linkExpiryHours: number;
  watermarkCustomerInfo: boolean;
  publisherStampText: string;
}

export interface StoreSettings {
  storeName: string;
  storeNameFr: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  freeShippingThreshold: number;
  announcementNotice: string;
  showAnnouncement: boolean;
  heroQuote: string;
  heroQuoteAuthor: string;
  logoImage?: string; // Base64 Data URL
}

// Articles / Blog (with anti-copy protection)
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  category: string;
  publishDate: string;
  readTime: string;
  coverColor: string;
  coverImage?: string; // Base64 Data URL
  tags: string[];
  views: number;
  isCopyProtected: boolean; // Protect content from copying
}

// Videos / Media
export interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtubeId: string; // YouTube Video ID or embed url
  duration: string;
  presenter: string;
  publishDate: string;
  views: number;
  category: string;
  isFeatured?: boolean;
  customThumbnail?: string; // Base64 Data URL or custom thumbnail
}

// Social Platforms & WhatsApp
export interface SocialLinks {
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  twitter: string;
  telegram: string;
  whatsappNumber: string;
  whatsappDefaultMsg: string;
  showFloatingWhatsApp: boolean;
  antiCopyGlobalEnabled: boolean;
}

// Sanity CMS Cloud Synchronization
export interface SanityConfig {
  projectId: string;
  dataset: string;
  apiVersion: string;
  apiToken: string; // Token with Editor/Write access
  useCdn: boolean;
  autoSyncOnSave: boolean; // Auto sync on every book edit or POS sale
  syncPosSales: boolean;
  isConnected?: boolean;
  lastSyncTime?: string;
  autoPullIntervalMinutes?: number; // 0 for off, e.g. 5 min
}

export interface SanitySyncLog {
  id: string;
  timestamp: string;
  action: 'push_book' | 'pull_books' | 'push_pos_sale' | 'batch_sync' | 'test_connection' | 'error';
  status: 'success' | 'failed' | 'pending';
  details: string;
  count?: number;
}
