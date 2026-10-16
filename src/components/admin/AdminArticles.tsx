import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, Lock, ShieldCheck, Check, X, Search, Upload, Camera, Image as ImageIcon } from 'lucide-react';
import { Article } from '../../types';
import { StorageService } from '../../services/storage';
import { processImageFile, formatFileSize, ProcessedImage } from '../../utils/imageProcessor';

interface AdminArticlesProps {
  articles: Article[];
  onRefresh: () => void;
}

export const AdminArticles: React.FC<AdminArticlesProps> = ({
  articles,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [uploadStats, setUploadStats] = useState<ProcessedImage | null>(null);
  const [imageError, setImageError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setImageError('');
    try {
      const processed = await processImageFile(file, 1200, 800, 0.85);
      setUploadStats(processed);
      setEditingArticle(prev => prev ? { ...prev, coverImage: processed.dataUrl } : null);
    } catch (err: any) {
      setImageError(err.message || 'حدث خطأ أثناء معالجة صورة المقال');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRemoveCover = () => {
    setUploadStats(null);
    setEditingArticle(prev => prev ? { ...prev, coverImage: undefined } : null);
  };

  const filtered = articles.filter(a =>
    a.title.includes(searchTerm) || a.author.includes(searchTerm) || a.category.includes(searchTerm)
  );

  const handleOpenAdd = () => {
    setUploadStats(null);
    setImageError('');
    setEditingArticle({
      id: `art-${Date.now()}`,
      title: '',
      slug: `article-${Date.now()}`,
      excerpt: '',
      content: '',
      author: 'أسرة تحرير دار رميسة',
      authorRole: 'هيئة النشر والترجمة',
      category: 'دراسات وترجمات',
      publishDate: new Date().toLocaleDateString('ar-DZ'),
      readTime: '4 دقائق',
      coverColor: '#064e3b',
      tags: ['دار رميسة'],
      views: 1,
      isCopyProtected: true
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (article: Article) => {
    setUploadStats(null);
    setImageError('');
    setEditingArticle({ ...article });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المقال؟')) {
      StorageService.deleteArticle(id);
      onRefresh();
    }
  };

  const handleToggleCopyProtection = (article: Article) => {
    const updated = { ...article, isCopyProtected: !article.isCopyProtected };
    StorageService.updateArticle(updated);
    onRefresh();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !editingArticle.title || !editingArticle.content) return;

    const fullArt = editingArticle as Article;
    const exists = articles.some(a => a.id === fullArt.id);
    if (exists) {
      StorageService.updateArticle(fullArt);
    } else {
      StorageService.addArticle(fullArt);
    }

    setIsEditing(false);
    setEditingArticle(null);
    onRefresh();
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-800">
              خاصية منع النسخ والسرقة الفكرية مدمجة
            </span>
          </div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            إدارة المقالات والدراسات النقدية
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            نشر المقالات الأدبية والفكرية مع تفعيل حماية عدم قابلية النسخ لحفظ حقوق المؤلفين
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>كتابة مقال جديد</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث في المقالات بالعنوان، الكاتب، أو القسم..."
            className="w-full text-xs p-2.5 pr-8 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-2.5 top-3" />
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-right">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
              <tr>
                <th className="py-3 px-4">المقال والغلاف</th>
                <th className="py-3 px-4">الكاتب والمحرر</th>
                <th className="py-3 px-4">القسم</th>
                <th className="py-3 px-4">تاريخ النشر</th>
                <th className="py-3 px-4 text-center">المشاهدات</th>
                <th className="py-3 px-4 text-center">حماية منع النسخ</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((art) => (
                <tr key={art.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {art.coverImage ? (
                        <img
                          src={art.coverImage}
                          alt={art.title}
                          className="w-12 h-10 object-cover rounded-lg border border-stone-200 shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-12 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                          <FileText className="w-5 h-5 text-stone-400" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 line-clamp-1">
                          {art.title}
                        </h4>
                        <span className="text-[11px] text-stone-400 line-clamp-1">
                          {art.excerpt}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-stone-900">{art.author}</div>
                    <div className="text-[10px] text-stone-400">{art.authorRole}</div>
                  </td>

                  <td className="py-3 px-4 text-stone-700">
                    {art.category}
                  </td>

                  <td className="py-3 px-4 font-mono text-stone-500">
                    {art.publishDate}
                  </td>

                  <td className="py-3 px-4 text-center font-mono font-bold text-stone-700">
                    {art.views}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleCopyProtection(art)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center justify-center gap-1 mx-auto transition-colors ${
                        art.isCopyProtected
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      <Lock className="w-3 h-3" />
                      <span>{art.isCopyProtected ? 'ممنوع النسخ ✓' : 'النسخ متاح'}</span>
                    </button>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(art)}
                        className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-stone-100 rounded-lg transition-colors"
                        title="تعديل المقال"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(art.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="حذف"
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

      {/* Article Add/Edit Modal */}
      {isEditing && editingArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 text-right max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                {editingArticle.title ? 'تعديل المقال' : 'نشر مقال ثقافي جديد'}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  عنوان المقال *
                </label>
                <input
                  type="text"
                  required
                  value={editingArticle.title || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  placeholder="عنوان المقال الأدبي أو الفكري..."
                  className="w-full p-2.5 rounded-lg border border-stone-300 font-editorial text-base font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    اسم الكاتب / الباحث *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingArticle.author || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    صفة أو تخصص الكاتب
                  </label>
                  <input
                    type="text"
                    value={editingArticle.authorRole || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, authorRole: e.target.value })}
                    placeholder="مثال: روائي وأكاديمي جزائري"
                    className="w-full p-2.5 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    القسم
                  </label>
                  <select
                    value={editingArticle.category || 'دراسات وترجمات'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="دراسات وترجمات">دراسات وترجمات</option>
                    <option value="تاريخ وتراث">تاريخ وتراث</option>
                    <option value="إضاءات نقدية">إضاءات نقدية</option>
                    <option value="أخبار دار رميسة">أخبار دار رميسة</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    زمن القراءة المتوقع
                  </label>
                  <input
                    type="text"
                    value={editingArticle.readTime || '4 دقائق'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, readTime: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    تاريخ النشر
                  </label>
                  <input
                    type="text"
                    value={editingArticle.publishDate || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, publishDate: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 font-mono"
                  />
                </div>
              </div>

              {/* Anti-Copy Protection Toggle */}
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>جعل المقال غير قابل للنسخ (Anti-Copy Protection):</span>
                  </h4>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    يمنع تحديد النصوص، النقر بالزر الأيمن، واختصارات النسخ على كافة أجهزة الزوار.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={editingArticle.isCopyProtected ?? true}
                  onChange={(e) => setEditingArticle({ ...editingArticle, isCopyProtected: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </div>

              {/* Cover Image Upload (Processed client-side) */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-stone-800 text-xs flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-700" />
                    <span>صورة غلاف أو بانر المقال (اختياري - تُضغط تلقائياً لأقل من 150 ك.ب):</span>
                  </label>
                  {editingArticle.coverImage && (
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>حذف الصورة</span>
                    </button>
                  )}
                </div>

                {editingArticle.coverImage ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border border-stone-200">
                    <img
                      src={editingArticle.coverImage}
                      alt="معاينة غلاف المقال"
                      className="w-24 h-16 object-cover rounded-md border border-stone-200 shadow-xs shrink-0"
                    />
                    <div className="flex-1 text-[11px] space-y-1 text-stone-600">
                      <div className="font-bold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>تم تحسين وضغط الصورة بنجاح وتجهيزها للنشر</span>
                      </div>
                      {uploadStats && (
                        <p className="text-stone-500">
                          الحجم الأصلي: <strong className="font-mono">{formatFileSize(uploadStats.originalSize)}</strong> ← الحجم بعد الضغط: <strong className="font-mono text-emerald-800">{formatFileSize(uploadStats.compressedSize)}</strong> (توفير {uploadStats.savingsPercentage}%)
                        </p>
                      )}
                      <label className="inline-block mt-1 text-amber-800 font-bold hover:underline cursor-pointer">
                        <span>تغيير الصورة</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="border-2 border-dashed border-stone-300 hover:border-amber-600 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-white hover:bg-amber-50/20 text-center">
                      <div className="w-10 h-10 rounded-full bg-amber-100/60 text-amber-800 flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-stone-800">اضغط لرفع صورة من الكاميرا أو الهاتف</span>
                        <span className="text-stone-400 block text-[10px] mt-0.5">JPG, PNG, WebP (يتم ضغط الحجم تلقائياً لتسريع التصفح)</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isProcessingImage}
                        className="hidden"
                      />
                    </label>

                    {isProcessingImage && (
                      <p className="text-xs text-amber-700 animate-pulse mt-2 text-center">
                        جاري معالجة وضغط صورة المقال بجودة عالية...
                      </p>
                    )}

                    {imageError && (
                      <p className="text-xs text-rose-600 font-bold mt-1 text-center">
                        {imageError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  المقدمة / ملخص المقال (Excerpt) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingArticle.excerpt || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 font-editorial text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  نص المقال الكامل *
                </label>
                <textarea
                  rows={8}
                  required
                  value={editingArticle.content || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  placeholder="اكتب فقرات المقال هنا..."
                  className="w-full p-2.5 rounded-lg border border-stone-300 font-editorial text-base leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl hover:bg-stone-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>حفظ ونشر المقال</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
