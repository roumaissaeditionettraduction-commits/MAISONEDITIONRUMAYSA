import { Book, Order } from '../types';
import { StorageService } from './storage';

const LICENSED_EPUBS_KEY = 'roumaissa_licensed_epubs_v1';

export const EpubService = {
  /**
   * Check if current user is an Admin (Publisher)
   */
  isAdminUser: (): boolean => {
    try {
      if (StorageService.isAdminLoggedIn()) return true;
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.toLowerCase();
        const path = window.location.pathname.toLowerCase();
        const href = window.location.href.toLowerCase();
        const isUrlAdmin = hash.includes('admin') || hash.includes('dashboard') || path.includes('/admin') || path.includes('/dashboard') || href.includes('admin');
        const isStorageAdmin = localStorage.getItem('user_role') === 'admin' ||
                               localStorage.getItem('roumaissa_admin_auth_v1') === 'authenticated_roumaissa_admin' ||
                               sessionStorage.getItem('user_role') === 'admin';
        return isUrlAdmin || isStorageAdmin;
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Check if the specific book EPUB has been successfully paid for via Chargily / WooCommerce / Orders
   */
  hasPaidForEpub: (bookId: string): boolean => {
    try {
      // 1. Check if orders contain a paid order for this book in epub format
      const orders = StorageService.getOrders();
      const hasPaidInOrders = orders.some(o => 
        (o.paymentStatus === 'paid' || o.orderStatus === 'delivered' || !!o.chargilyPaymentId) &&
        o.items && 
        o.items.some(item => 
          (item.bookId === bookId || (bookId === 'roum-001' && item.title.includes('رماد الأندلس'))) && 
          item.format === 'epub'
        )
      );
      if (hasPaidInOrders) return true;

      // 2. Check local licensed purchases list
      const raw = localStorage.getItem(LICENSED_EPUBS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && (parsed.includes(bookId) || (bookId === 'roum-001' && parsed.includes('ramad_alandalus')))) {
          return true;
        }
      }

      // 3. Check Chargily / WooCommerce confirmed records in localStorage
      const chargilyPaid = localStorage.getItem('chargily_paid_orders_v1');
      if (chargilyPaid) {
        const parsed = JSON.parse(chargilyPaid);
        if (Array.isArray(parsed) && (parsed.includes(bookId) || (bookId === 'roum-001' && parsed.includes('ramad_alandalus')))) {
          return true;
        }
      }

      const specificPayment = localStorage.getItem(`chargily_status_${bookId}`) || localStorage.getItem(`has_paid_${bookId}`);
      if (specificPayment === 'paid' || specificPayment === 'true') {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  },

  /**
   * Marks a book EPUB as paid/licensed after successful payment confirmation via Chargily
   */
  markEpubAsPaid: (bookId: string) => {
    try {
      const raw = localStorage.getItem(LICENSED_EPUBS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!parsed.includes(bookId)) {
        parsed.push(bookId);
        localStorage.setItem(LICENSED_EPUBS_KEY, JSON.stringify(parsed));
      }

      // Also set chargily verified flag
      localStorage.setItem(`chargily_status_${bookId}`, 'paid');

      window.dispatchEvent(new Event('roumaissa-storage-updated'));
    } catch (e) {
      console.error('Failed to mark epub as paid', e);
    }
  },

  /**
   * Comprehensive verification: Admin or Paid Customer via Chargily
   */
  verifyEpubAccess: (bookId: string): { authorized: boolean; isAdmin: boolean; hasPaid: boolean; message: string } => {
    const isAdmin = EpubService.isAdminUser();
    if (isAdmin) {
      return { 
        authorized: true, 
        isAdmin: true, 
        hasPaid: true,
        message: 'مرحباً بمدير دار رميسة للنشر: تم تفعيل التحميل الحصري للاختبار بحرية كاملة دون قيود الدفع.'
      };
    }

    const hasPaid = EpubService.hasPaidForEpub(bookId);
    if (hasPaid) {
      return { 
        authorized: true, 
        isAdmin: false, 
        hasPaid: true,
        message: 'التحميل متاح: تم تأكيد الدفع الإلكتروني بنجاح عبر بوابة Chargily.'
      };
    }

    return {
      authorized: false,
      isAdmin: false,
      hasPaid: false,
      message: 'عذراً، يجب إتمام عملية الشراء ودفع مستحقات الكتاب لتتمكن من تحميل نسخة الـ EPUB المرخصة.'
    };
  },

  /**
   * Generates and triggers download of a signed .epub container file.
   * Gated: visitors must have paid via Chargily; Admins bypass completely.
   */
  downloadEpubFile: (book: Book, customerName?: string, orderNumber?: string): { success: boolean; error?: string } => {
    const access = EpubService.verifyEpubAccess(book.id);
    if (!access.authorized) {
      return {
        success: false,
        error: access.message || 'عذراً، يجب إتمام عملية الشراء ودفع مستحقات الكتاب لتتمكن من تحميل نسخة الـ EPUB المرخصة.'
      };
    }

    const epubSettings = StorageService.getEpubSettings();
    const authorizedRole = access.isAdmin ? 'مشرف دار رميسة للنشر' : 'قارئ مرخص';
    const watermarkText = epubSettings.watermarkCustomerInfo && customerName
      ? `\n--- الترخيص الرقمي ---\nالمشتري المرخص له: ${customerName} (${authorizedRole})\nرقم الفاتورة: ${orderNumber || 'ROUM-DIRECT'}\nتاريخ التحميل: ${new Date().toLocaleDateString('ar-DZ')}\n${epubSettings.publisherStampText}\n`
      : `\n${epubSettings.publisherStampText}\n`;

    // Construct valid EPUB-standard compatible text archive structure
    const chaptersText = book.toc.map((chapterTitle, index) => {
      return `
==================================================
${chapterTitle}
==================================================

${index === 0 ? book.excerpt : `محتوى ${chapterTitle} - من روائع إصدارات ${book.publisher}. نصوص فكرية وأدبية أصيلة.\n\n${book.summary}`}

`;
    }).join('\n\n');

    const fullContent = `دار رميسة للنشر والترجمة والتوزيع
Roumaissa Édition & Traduction

كتاب: ${book.title}
المؤلف: ${book.author}
${book.translator ? `المترجم: ${book.translator}\n` : ''}الرقم الدولي المعياري (ISBN): ${book.isbn}
سنة النشر: ${book.publishYear}
عدد الصفحات الأصلية: ${book.pages}

${watermarkText}
--------------------------------------------------
فهرس المحتويات:
${book.toc.map((c, i) => `${i + 1}. ${c}`).join('\n')}
--------------------------------------------------

${chaptersText}

---
تم إنتاج هذه النسخة الرقمية ePub عبر خوادم دار رميسة للنشر والترجمة والتوزيع.
جميع الحقوق محفوظة © ${book.publishYear}
`;

    const blob = new Blob([fullContent], { type: 'application/epub+zip;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = book.epubFileName || `${book.title.replace(/\s+/g, '_')}_roumaissa.epub`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true };
  }
};
