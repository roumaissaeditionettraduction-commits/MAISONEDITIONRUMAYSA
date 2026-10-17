import { createClient } from '@sanity/client';
import { Book, Order, SanityConfig, SanitySyncLog } from '../types';

// Sanity client configured for Vite with explicit fallbacks requested by user
export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || '5mczm6mo',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: import.meta.env.VITE_SANITY_API_TOKEN || undefined,
});

export { createClient };

const SANITY_CONFIG_KEY = 'roumaissa_sanity_config_v1';
const SANITY_LOGS_KEY = 'roumaissa_sanity_logs_v1';

// Default initial Sanity config with robust fallback values
export const DEFAULT_SANITY_CONFIG: SanityConfig = {
  projectId: (import.meta.env.VITE_SANITY_PROJECT_ID as string) || '5mczm6mo',
  dataset: (import.meta.env.VITE_SANITY_DATASET as string) || 'production',
  apiVersion: '2024-01-01',
  apiToken: (import.meta.env.VITE_SANITY_API_TOKEN as string) || '',
  useCdn: false, // For real-time updates without cache delay
  autoSyncOnSave: true, // Auto-push to Sanity on book edit/create & POS sale
  syncPosSales: true,
  isConnected: true,
  lastSyncTime: undefined,
  autoPullIntervalMinutes: 5
};

export const SanityService = {
  // Config
  getConfig: (): SanityConfig => {
    try {
      const stored = localStorage.getItem(SANITY_CONFIG_KEY);
      if (!stored) {
        return DEFAULT_SANITY_CONFIG;
      }
      const parsed = JSON.parse(stored);
      // Auto-heal empty projectId or dataset from previous local cache
      const effectiveProjectId = (parsed.projectId && parsed.projectId.trim() !== '') 
        ? parsed.projectId 
        : ((import.meta.env.VITE_SANITY_PROJECT_ID as string) || '5mczm6mo');
      const effectiveDataset = (parsed.dataset && parsed.dataset.trim() !== '') 
        ? parsed.dataset 
        : ((import.meta.env.VITE_SANITY_DATASET as string) || 'production');

      return { 
        ...DEFAULT_SANITY_CONFIG, 
        ...parsed,
        projectId: effectiveProjectId,
        dataset: effectiveDataset,
        useCdn: false
      };
    } catch {
      return DEFAULT_SANITY_CONFIG;
    }
  },

  saveConfig: (config: SanityConfig): void => {
    try {
      localStorage.setItem(SANITY_CONFIG_KEY, JSON.stringify(config));
      window.dispatchEvent(new Event('roumaissa-sanity-config-updated'));
    } catch (e) {
      console.error('Failed to save Sanity config', e);
    }
  },

  // Logs
  getLogs: (): SanitySyncLog[] => {
    try {
      const raw = localStorage.getItem(SANITY_LOGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  addLog: (
    action: SanitySyncLog['action'],
    status: SanitySyncLog['status'],
    details: string,
    count?: number
  ): void => {
    try {
      const current = SanityService.getLogs();
      const newLog: SanitySyncLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        action,
        status,
        details,
        count
      };
      const updated = [newLog, ...current.slice(0, 49)]; // Keep last 50 logs
      localStorage.setItem(SANITY_LOGS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('roumaissa-sanity-logs-updated'));
    } catch (e) {
      console.error('Failed to save log', e);
    }
  },

  clearLogs: (): void => {
    localStorage.removeItem(SANITY_LOGS_KEY);
    window.dispatchEvent(new Event('roumaissa-sanity-logs-updated'));
  },

  // Connection Test
  testConnection: async (overrideConfig?: SanityConfig): Promise<{ success: boolean; message: string; latencyMs?: number }> => {
    const config = overrideConfig || SanityService.getConfig();
    const projectId = config.projectId || (import.meta.env.VITE_SANITY_PROJECT_ID as string) || '5mczm6mo';
    const dataset = config.dataset || (import.meta.env.VITE_SANITY_DATASET as string) || 'production';

    const startTime = performance.now();
    try {
      // Query sanity dataset endpoint
      const query = encodeURIComponent('*[_type == "book"][0...1]{ _id }');
      const url = `https://${projectId}.api.sanity.io/v${config.apiVersion}/data/query/${dataset}?query=${query}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (config.apiToken) {
        headers['Authorization'] = `Bearer ${config.apiToken.trim()}`;
      }

      const res = await fetch(url, { headers });
      const latencyMs = Math.round(performance.now() - startTime);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.message || `خطأ Sanity كود ${res.status}`;
        SanityService.addLog('test_connection', 'failed', `فشل الاتصال: ${errorMsg}`);
        return { success: false, message: `فشل الاتصال: ${errorMsg}`, latencyMs };
      }

      const data = await res.json();
      const updatedConfig = {
        ...config,
        projectId,
        dataset,
        isConnected: true,
        lastSyncTime: new Date().toLocaleTimeString('ar-DZ')
      };
      SanityService.saveConfig(updatedConfig);
      SanityService.addLog('test_connection', 'success', `تم الاتصال بنجاح مع Sanity (${latencyMs}ms)`);

      return {
        success: true,
        message: `تم الاتصال بنجاح مع قاعدة Sanity (${dataset}) بسرعة ${latencyMs} ميلي ثانية.`,
        latencyMs
      };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      SanityService.addLog('test_connection', 'failed', `خطأ في الشبكة أو CORS: ${err.message}`);
      return {
        success: false,
        message: `تعذر الاتصال بـ Sanity: ${err.message || 'خطأ في الشبكة'}`,
        latencyMs
      };
    }
  },

  // Push single book to Sanity
  pushBook: async (book: Book): Promise<{ success: boolean; error?: string }> => {
    const config = SanityService.getConfig();
    const projectId = config.projectId || (import.meta.env.VITE_SANITY_PROJECT_ID as string) || '5mczm6mo';
    const dataset = config.dataset || (import.meta.env.VITE_SANITY_DATASET as string) || 'production';
    if (!config.apiToken) {
      return { success: false, error: 'يرجى إدخال API Token مع صلاحية الكتابة (Editor Token)' };
    }

    try {
      const docId = book.sanityId || `book-${book.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      const doc = {
        _id: docId,
        _type: 'book',
        title: book.title,
        originalTitle: book.originalTitle || '',
        author: book.author,
        translator: book.translator || '',
        category: book.category,
        pricePrint: book.pricePrint,
        priceEpub: book.priceEpub,
        hasEpub: book.hasEpub,
        stock: book.stock,
        stockCount: book.stockCount !== undefined ? book.stockCount : book.stock,
        isbn: book.isbn,
        pages: book.pages,
        publishYear: book.publishYear,
        publisher: book.publisher,
        summary: book.summary,
        excerpt: book.excerpt,
        coverColor: book.coverColor,
        coverImage: book.coverImage || '',
        isBestseller: !!book.isBestseller,
        isNewRelease: !!book.isNewRelease,
        isFeatured: !!book.isFeatured,
        tags: book.tags || [],
        updatedAt: new Date().toISOString()
      };

      const url = `https://${config.projectId}.api.sanity.io/v${config.apiVersion}/data/mutate/${config.dataset}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiToken.trim()}`
        },
        body: JSON.stringify({
          mutations: [
            {
              createOrReplace: doc
            }
          ]
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `خطأ ${res.status}`);
      }

      SanityService.addLog('push_book', 'success', `تمت مزامنة كتاب: "${book.title}" سحابياً`);
      return { success: true };
    } catch (e: any) {
      SanityService.addLog('push_book', 'failed', `فشل رفع كتاب "${book.title}": ${e.message}`);
      return { success: false, error: e.message };
    }
  },

  // Batch Push All Books
  batchPushAllBooks: async (books: Book[]): Promise<{ success: boolean; count: number; error?: string }> => {
    const config = SanityService.getConfig();
    const projectId = config.projectId || (import.meta.env.VITE_SANITY_PROJECT_ID as string) || '5mczm6mo';
    const dataset = config.dataset || (import.meta.env.VITE_SANITY_DATASET as string) || 'production';
    if (!config.apiToken) {
      return { success: false, count: 0, error: 'يرجى تكوين API Token مع صلاحية الكتابة (Editor Token)' };
    }

    try {
      const mutations = books.map(book => {
        const docId = `book-${book.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
        return {
          createOrReplace: {
            _id: docId,
            _type: 'book',
            title: book.title,
            originalTitle: book.originalTitle || '',
            author: book.author,
            translator: book.translator || '',
            category: book.category,
            pricePrint: book.pricePrint,
            priceEpub: book.priceEpub,
            hasEpub: book.hasEpub,
            stock: book.stock,
            stockCount: book.stockCount !== undefined ? book.stockCount : book.stock,
            isbn: book.isbn,
            pages: book.pages,
            publishYear: book.publishYear,
            publisher: book.publisher,
            summary: book.summary,
            excerpt: book.excerpt,
            coverColor: book.coverColor,
            coverImage: book.coverImage || '',
            isBestseller: !!book.isBestseller,
            isNewRelease: !!book.isNewRelease,
            isFeatured: !!book.isFeatured,
            tags: book.tags || [],
            updatedAt: new Date().toISOString()
          }
        };
      });

      const url = `https://${projectId}.api.sanity.io/v${config.apiVersion}/data/mutate/${dataset}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiToken.trim()}`
        },
        body: JSON.stringify({ mutations })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `خطأ ${res.status}`);
      }

      SanityService.addLog('batch_sync', 'success', `تم رفع ${books.length} كتاب إلى Sanity سحابياً بضغطة واحدة`, books.length);
      return { success: true, count: books.length };
    } catch (e: any) {
      SanityService.addLog('batch_sync', 'failed', `فشل رفع الكتب دفعة واحدة: ${e.message}`);
      return { success: false, count: 0, error: e.message };
    }
  },

  // Delete Book from Sanity
  deleteBook: async (bookId: string): Promise<{ success: boolean; error?: string }> => {
    const config = SanityService.getConfig();
    if (!config.projectId || !config.dataset || !config.apiToken) return { success: false };

    try {
      const docId = `book-${bookId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      const url = `https://${config.projectId}.api.sanity.io/v${config.apiVersion}/data/mutate/${config.dataset}`;
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiToken.trim()}`
        },
        body: JSON.stringify({
          mutations: [{ delete: { id: docId } }]
        })
      });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  // Fetch Books from Sanity
  fetchBooks: async (): Promise<{ success: boolean; books: Book[]; count: number; error?: string }> => {
    const config = SanityService.getConfig();
    const projectId = config.projectId || (import.meta.env.VITE_SANITY_PROJECT_ID as string) || '5mczm6mo';
    const dataset = config.dataset || (import.meta.env.VITE_SANITY_DATASET as string) || 'production';

    try {
      const groqQuery = '*[_type == "book"] | order(_createdAt desc)';
      let rawBooks: any[] = [];

      try {
        rawBooks = await sanityClient.fetch(groqQuery);
      } catch (err) {
        // Fallback to fetch HTTP endpoint
        const groq = encodeURIComponent(groqQuery);
        const url = `https://${projectId}.api.sanity.io/v${config.apiVersion}/data/query/${dataset}?query=${groq}`;
        const headers: Record<string, string> = {};
        if (config.apiToken) {
          headers['Authorization'] = `Bearer ${config.apiToken.trim()}`;
        }

        const res = await fetch(url, { headers });
        if (!res.ok) {
          throw new Error(`Sanity HTTP ${res.status}`);
        }

        const body = await res.json();
        rawBooks = body.result || [];
      }

      const converted: Book[] = rawBooks.map((item: any) => ({
        id: item._id.replace(/^book-/, '') || `sanity-${Date.now()}`,
        sanityId: item._id,
        title: item.title || 'بدون عنوان',
        originalTitle: item.originalTitle,
        author: item.author || 'مؤلف غير معروف',
        translator: item.translator,
        category: item.category || 'روايات وأدب عالمي',
        pricePrint: Number(item.pricePrint) || 1200,
        priceEpub: Number(item.priceEpub) || 600,
        hasEpub: !!item.hasEpub,
        stock: typeof item.stock === 'number' ? item.stock : 25,
        stockCount: typeof item.stockCount === 'number' ? item.stockCount : (typeof item.stock === 'number' ? item.stock : 25),
        isbn: item.isbn || '978-9931-00-000-0',
        pages: Number(item.pages) || 250,
        publishYear: Number(item.publishYear) || 2024,
        publisher: item.publisher || 'دار رميسة للنشر والترجمة والتوزيع',
        editionNumber: item.editionNumber || 'الطبعة الأولى',
        rating: 4.9,
        reviewsCount: 18,
        summary: item.summary || '',
        excerpt: item.excerpt || '',
        toc: item.toc || ['المقدمة', 'الفصل الأول', 'خاتمة'],
        coverColor: item.coverColor || '#1c1917',
        coverAccent: '#d97706',
        coverImage: item.coverImage,
        isBestseller: !!item.isBestseller,
        isNewRelease: !!item.isNewRelease,
        isFeatured: !!item.isFeatured,
        tags: item.tags || [],
        lastSyncedAt: new Date().toISOString()
      }));

      SanityService.addLog('pull_books', 'success', `تم سحب ${converted.length} كتاب من Sanity بنجاح`, converted.length);
      return { success: true, books: converted, count: converted.length };
    } catch (e: any) {
      SanityService.addLog('pull_books', 'failed', `فشل سحب الكتب من Sanity: ${e.message}`);
      return { success: false, books: [], count: 0, error: e.message };
    }
  },

  // Push POS Sale / Order to Sanity
  pushPosSale: async (order: Order): Promise<{ success: boolean; error?: string }> => {
    const config = SanityService.getConfig();
    const projectId = config.projectId || (import.meta.env.VITE_SANITY_PROJECT_ID as string) || '5mczm6mo';
    const dataset = config.dataset || (import.meta.env.VITE_SANITY_DATASET as string) || 'production';
    if (!config.apiToken || !config.syncPosSales) {
      return { success: false, error: 'مزامنة مبيعات الـ POS غير مفعلة أو تفتقر لرمز الـ API Token' };
    }

    try {
      const docId = `pos-${order.orderNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      const doc = {
        _id: docId,
        _type: 'posSale',
        orderNumber: order.orderNumber,
        orderType: order.orderType || 'pos',
        customerName: order.customerName || 'زبون المعرض / نقطة البيع',
        phone: order.phone || '',
        itemsCount: order.items.reduce((acc, i) => acc + i.quantity, 0),
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        posCashierName: order.posCashierName || 'أمين الصندوق',
        posStandLocation: order.posStandLocation || 'معرض الكتب',
        posAmountPaid: order.posAmountPaid || order.totalAmount,
        posChangeDue: order.posChangeDue || 0,
        createdAt: order.createdAt || new Date().toISOString(),
        items: order.items.map(item => ({
          bookId: item.bookId,
          title: item.title,
          author: item.author,
          format: item.format,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        }))
      };

      const url = `https://${projectId}.api.sanity.io/v${config.apiVersion}/data/mutate/${dataset}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiToken.trim()}`
        },
        body: JSON.stringify({
          mutations: [{ createOrReplace: doc }]
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      SanityService.addLog('push_pos_sale', 'success', `تم توثيق عملية البيع ${order.orderNumber} في Sanity سحابياً`);
      return { success: true };
    } catch (e: any) {
      SanityService.addLog('push_pos_sale', 'failed', `فشل رفع مبيعة الـ POS: ${e.message}`);
      return { success: false, error: e.message };
    }
  },

  // Generates Sanity Studio schema file definitions for the user
  getSanitySchemas: () => {
    const bookSchema = `// schemaTypes/book.js in Sanity Studio
export default {
  name: 'book',
  title: 'كتاب - دار رميسة',
  type: 'document',
  fields: [
    { name: 'title', title: 'عنوان الكتاب', type: 'string', validation: Rule => Rule.required() },
    { name: 'author', title: 'المؤلف', type: 'string', validation: Rule => Rule.required() },
    { name: 'category', title: 'التصنيف', type: 'string' },
    { name: 'pricePrint', title: 'سعر النسخة الورقية (دج)', type: 'number' },
    { name: 'priceEpub', title: 'سعر النسخة الإلكترونية (دج)', type: 'number' },
    { name: 'stock', title: 'المخزون المتاح', type: 'number' },
    { name: 'isbn', title: 'الرقم الدولي ISBN', type: 'string' },
    { name: 'pages', title: 'عدد الصفحات', type: 'number' },
    { name: 'coverImage', title: 'رابط الغلاف أو DataURL', type: 'text' },
    { name: 'summary', title: 'نبذة عن الكتاب', type: 'text' },
    { name: 'isBestseller', title: 'الأكثر مبيعاً', type: 'boolean' },
    { name: 'isNewRelease', title: 'إصدار جديد', type: 'boolean' }
  ]
};`;

    const posSaleSchema = `// schemaTypes/posSale.js in Sanity Studio
export default {
  name: 'posSale',
  title: 'مبيعات نقطة البيع والمعارض POS',
  type: 'document',
  fields: [
    { name: 'orderNumber', title: 'رقم الوصل', type: 'string' },
    { name: 'customerName', title: 'اسم الزبون', type: 'string' },
    { name: 'totalAmount', title: 'المبلغ الإجمالي (دج)', type: 'number' },
    { name: 'paymentMethod', title: 'طريقة الدفع (cash/dahabia/tpe)', type: 'string' },
    { name: 'posCashierName', title: 'الكاشير', type: 'string' },
    { name: 'posStandLocation', title: 'المعرض / الجناح', type: 'string' },
    { name: 'createdAt', title: 'تاريخ وتوقيت البيع', type: 'datetime' }
  ]
};`;

    return { bookSchema, posSaleSchema };
  }
};
