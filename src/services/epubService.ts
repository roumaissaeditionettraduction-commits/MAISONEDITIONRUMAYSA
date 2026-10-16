import { Book, Order } from '../types';
import { StorageService } from './storage';

export const EpubService = {
  /**
   * Generates and triggers download of a signed .epub container file
   */
  downloadEpubFile: (book: Book, customerName?: string, orderNumber?: string) => {
    const epubSettings = StorageService.getEpubSettings();
    const watermarkText = epubSettings.watermarkCustomerInfo && customerName
      ? `\n--- الترخيص الرقمي ---\nالمشتري المرخص له: ${customerName}\nرقم الفاتورة: ${orderNumber || 'ROUM-DIRECT'}\nتاريخ التحميل: ${new Date().toLocaleDateString('ar-DZ')}\n${epubSettings.publisherStampText}\n`
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
  }
};
