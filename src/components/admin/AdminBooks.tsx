import React, { useState } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Download, Search, Check, X, Upload, Image as ImageIcon, Camera } from 'lucide-react';
import { Book, Category } from '../../types';
import { StorageService } from '../../services/storage';
import { processImageFile, formatFileSize, ProcessedImage } from '../../utils/imageProcessor';

interface AdminBooksProps {
  books: Book[];
  categories: Category[];
  onRefresh: () => void;
}

export const AdminBooks: React.FC<AdminBooksProps> = ({
  books,
  categories,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingBook, setEditingBook] = useState<Partial<Book> | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [uploadStats, setUploadStats] = useState<ProcessedImage | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setImageError('');
    try {
      const processed = await processImageFile(file, 800, 1200, 0.85);
      setUploadStats(processed);
      setEditingBook((prev: Partial<Book> | null) => prev ? { ...prev, coverImage: processed.dataUrl } : null);
    } catch (err: any) {
      setImageError(err.message || 'حدث خطأ أثناء معالجة الصورة');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRemoveCoverImage = () => {
    setUploadStats(null);
    setEditingBook((prev: Partial<Book> | null) => prev ? { ...prev, coverImage: undefined } : null);
  };

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.includes(searchTerm) || b.author.includes(searchTerm) || b.isbn.includes(searchTerm);
    const matchesCat = selectedCategory === 'all' || b.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingBook({
      id: `roum-${Date.now()}`,
      title: '',
      author: '',
      translator: '',
      category: categories[0]?.id || 'novels',
      pricePrint: 1500,
      priceEpub: 650,
      hasEpub: true,
      epubFileName: 'book_edition_roumaissa.epub',
      epubFileSize: '3.5 MB',
      coverColor: '#881337',
      coverAccent: '#fbbf24',
      coverPattern: 'arabesque',
      isbn: `978-9931-74-${Math.floor(100 + Math.random() * 900)}-0`,
      pages: 320,
      publishYear: 2026,
      publisher: 'دار رميسة للنشر والترجمة',
      editionNumber: 'الطبعة الأولى',
      rating: 5.0,
      reviewsCount: 1,
      summary: '',
      excerpt: '',
      toc: ['المقدمة', 'الفصل الأول', 'الفصل الثاني', 'الخاتمة'],
      stock: 50,
      stockCount: 50,
      isBestseller: false,
      isNewRelease: true,
      tags: ['دار رميسة']
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (book: Book) => {
    setEditingBook({ ...book, stockCount: book.stockCount !== undefined ? book.stockCount : book.stock });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الكتاب؟')) {
      StorageService.deleteBook(id);
      onRefresh();
    }
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook || !editingBook.title || !editingBook.author) return;

    const stockVal = Number(editingBook.stockCount !== undefined ? editingBook.stockCount : editingBook.stock) || 0;
    const fullBook: Book = {
      ...editingBook,
      stock: stockVal,
      stockCount: stockVal
    } as Book;

    const existing = books.find(b => b.id === fullBook.id);
    if (existing) {
      StorageService.updateBook(fullBook);
    } else {
      StorageService.addBook(fullBook);
    }

    setIsEditing(false);
    setEditingBook(null);
    onRefresh();
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            إدارة الكتب والإصدارات
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            إضافة وتعديل الكتب الورقية والرقمية ePub المدفوعة وضبط الأسعار والمخزون
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>إضافة كتاب جديد للمتجر</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالعنوان، اسم المؤلف، أو رقم ISBN..."
            className="w-full text-xs p-2.5 pr-8 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-2.5 top-3" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-56 text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600 bg-white"
        >
          <option value="all">كافة الأقسام والتصنيفات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-right">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
              <tr>
                <th className="py-3 px-4">الكتاب والغلاف</th>
                <th className="py-3 px-4">المؤلف / المترجم</th>
                <th className="py-3 px-4">القسم</th>
                <th className="py-3 px-4">سعر الورقي</th>
                <th className="py-3 px-4">سعر الـ ePub</th>
                <th className="py-3 px-4 text-center">المخزون الورقي</th>
                <th className="py-3 px-4 text-center">حالة ePub</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-9 h-12 rounded object-cover shadow-xs border border-stone-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div
                          className="w-9 h-12 rounded shadow-xs flex items-center justify-center text-[10px] font-bold text-white shrink-0 border border-black/10"
                          style={{ backgroundColor: book.coverColor }}
                        >
                          ر
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 line-clamp-1">
                          {book.title}
                        </h4>
                        <span className="text-[11px] text-stone-400 font-mono">
                          ISBN: {book.isbn}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-stone-900">{book.author}</div>
                    {book.translator && (
                      <div className="text-[10px] text-stone-500 italic">{book.translator}</div>
                    )}
                  </td>

                  <td className="py-3 px-4 text-stone-700">
                    {categories.find(c => c.id === book.category)?.name || book.category}
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-stone-900 tabular-nums">
                    {book.pricePrint.toLocaleString('ar-DZ')} دج
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-amber-800 tabular-nums">
                    {book.hasEpub ? `${book.priceEpub.toLocaleString('ar-DZ')} دج` : 'غير مفعل'}
                  </td>

                  <td className="py-3 px-4 text-center font-mono">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      book.stock > 10 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                    }`}>
                      {book.stock} نسخة
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    {book.hasEpub ? (
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        ePub متاح ({book.epubFileSize || '3 MB'})
                      </span>
                    ) : (
                      <span className="text-stone-400 text-[11px]">—</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(book)}
                        className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-stone-100 rounded-lg transition-colors"
                        title="تعديل الكتاب"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="حذف الكتاب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Add/Edit Modal */}
      {isEditing && editingBook && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 text-right max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                {editingBook.id && books.some(b => b.id === editingBook.id) ? 'تعديل بيانات الكتاب' : 'إضافة كتاب جديد'}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-4 text-xs">
              
              {/* Cover Image Upload & Compression Section */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-700" />
                    <span className="font-bold text-stone-900 text-xs">
                      صورة غلاف الكتاب الحقيقية (تحميل من الهاتف أو الحاسوب):
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono">
                    ضغط تلقائي ذكي &lt; 150 ك.ب
                  </span>
                </div>

                {imageError && (
                  <div className="p-2 bg-rose-50 text-rose-700 rounded border border-rose-200 text-[11px]">
                    {imageError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Image Preview Container */}
                  <div className="w-24 h-32 rounded-lg bg-stone-200 border border-stone-300 overflow-hidden flex items-center justify-center shrink-0 relative group">
                    {editingBook.coverImage ? (
                      <>
                        <img
                          src={editingBook.coverImage}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveCoverImage}
                          className="absolute inset-0 bg-stone-900/60 text-rose-300 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold"
                          title="حذف الصورة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-2 text-stone-400">
                        <Camera className="w-6 h-6 mx-auto mb-1 opacity-60" />
                        <span className="text-[9px] block">لا توجد صورة</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls & Compression Info */}
                  <div className="flex-1 space-y-2 text-right w-full">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg font-bold text-stone-800 cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-amber-700" />
                      <span>{isProcessingImage ? 'جارٍ ضغط ومعالجة الصورة...' : 'اختر صورة الغلاف (JPG, PNG, WebP)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isProcessingImage}
                        className="hidden"
                      />
                    </label>

                    {uploadStats && (
                      <div className="p-2 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 text-[11px] space-y-0.5">
                        <div className="font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>تم ضغط الصورة بنجاح وتجهيزها للويب:</span>
                        </div>
                        <div className="font-mono text-[10px] text-emerald-800">
                          الحجم الأصلي: <strong>{formatFileSize(uploadStats.originalSize)}</strong> ➔ الحجم المحسّن: <strong>{formatFileSize(uploadStats.compressedSize)}</strong> ({uploadStats.width}×{uploadStats.height}px)
                        </div>
                      </div>
                    )}

                    <p className="text-[10px] text-stone-500 leading-relaxed">
                      يتم ضغط الصور الكبيرة الملتقطة بكاميرا الهاتف (حتى 15 ميغابايت) محلياً دون بطء، مع الحفاظ على وضوح التفاصيل ونسب الأبعاد.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    عنوان الكتاب *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBook.title || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600 font-editorial text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    اسم المؤلف *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBook.author || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    المترجم (إن وجد)
                  </label>
                  <input
                    type="text"
                    value={editingBook.translator || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, translator: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    القسم / التصنيف *
                  </label>
                  <select
                    value={editingBook.category || 'novels'}
                    onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Formats */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <span className="font-bold text-stone-900 block">
                  الأسعار وإعدادات النشر الرقمي ePub:
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      سعر النسخة الورقية (دج) *
                    </label>
                    <input
                      type="number"
                      required
                      value={editingBook.pricePrint || 0}
                      onChange={(e) => setEditingBook({ ...editingBook, pricePrint: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-left"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      سعر النسخة الرقمية ePub (دج)
                    </label>
                    <input
                      type="number"
                      value={editingBook.priceEpub || 0}
                      onChange={(e) => setEditingBook({ ...editingBook, priceEpub: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-left"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
                  <input
                    type="checkbox"
                    id="hasEpubCheck"
                    checked={editingBook.hasEpub ?? true}
                    onChange={(e) => setEditingBook({ ...editingBook, hasEpub: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="hasEpubCheck" className="font-bold text-stone-900 cursor-pointer">
                    تفعيل بيع الكتاب كملف إلكتروني مدفوع بصيغة ePub
                  </label>
                </div>

                {editingBook.hasEpub && (
                  <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-amber-950 mb-1">
                        اسم ملف ePub الرقمي:
                      </label>
                      <input
                        type="text"
                        value={editingBook.epubFileName || ''}
                        onChange={(e) => setEditingBook({ ...editingBook, epubFileName: e.target.value })}
                        placeholder="book_name.epub"
                        className="w-full p-2 text-xs rounded border border-amber-300 bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-amber-950 mb-1">
                        حجم الملف التقريبي:
                      </label>
                      <input
                        type="text"
                        value={editingBook.epubFileSize || '3.5 MB'}
                        onChange={(e) => setEditingBook({ ...editingBook, epubFileSize: e.target.value })}
                        placeholder="3.5 MB"
                        className="w-full p-2 text-xs rounded border border-amber-300 bg-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Physical Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    رقم ISBN المعياري
                  </label>
                  <input
                    type="text"
                    value={editingBook.isbn || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, isbn: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    عدد الصفحات
                  </label>
                  <input
                    type="number"
                    value={editingBook.pages || 0}
                    onChange={(e) => setEditingBook({ ...editingBook, pages: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    المخزون المتوفر (ورقي)
                  </label>
                  <input
                    type="number"
                    value={editingBook.stockCount !== undefined ? editingBook.stockCount : (editingBook.stock || 0)}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingBook({ ...editingBook, stock: val, stockCount: val });
                    }}
                    className="w-full p-2.5 rounded-lg border border-stone-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  نبذة ملخصة عن الكتاب *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingBook.summary || ''}
                  onChange={(e) => setEditingBook({ ...editingBook, summary: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600 font-editorial text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  عينة من النص للقراءة المجانية / القارئ الرقمي
                </label>
                <textarea
                  rows={3}
                  value={editingBook.excerpt || ''}
                  onChange={(e) => setEditingBook({ ...editingBook, excerpt: e.target.value })}
                  placeholder="مقطع أدبي أو مقدمة الكتاب..."
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600 font-editorial text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl hover:bg-stone-50 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-xs"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>حفظ بيانات الكتاب</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
