import React, { useState } from 'react';
import { Layout, Save, ExternalLink, Plus, Trash2, Check, Clock, Gift } from 'lucide-react';
import { LandingPageConfig, Book } from '../../types';
import { StorageService } from '../../services/storage';

interface AdminLandingPagesProps {
  config: LandingPageConfig;
  books: Book[];
  onRefresh: () => void;
  onPreviewLanding: () => void;
}

export const AdminLandingPages: React.FC<AdminLandingPagesProps> = ({
  config,
  books,
  onRefresh,
  onPreviewLanding
}) => {
  const [form, setForm] = useState<LandingPageConfig>({ ...config });
  const [newFeature, setNewFeature] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveLandingPage(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    onRefresh();
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setForm({
        ...form,
        featuresList: [...form.featuresList, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setForm({
      ...form,
      featuresList: form.featuresList.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            إدارة صفحات الهبوط الإعلانية (Landing Pages)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            إنشاء صفحات هبوط خاصة بحملات فيسبوك وتيك توك مع استمارة طلب مباشرة وعداد تنازلي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPreviewLanding}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
          >
            <ExternalLink className="w-4 h-4 text-amber-700" />
            <span>معاينة صفحة الهبوط الحية</span>
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{savedSuccess ? 'تم حفظ التعديلات ✓' : 'حفظ صفحة الهبوط'}</span>
          </button>
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 text-xs">
        
        {/* Book Selector */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-stone-800 mb-1">
              الكتاب المخصص لهذه الصفحة:
            </label>
            <select
              value={form.bookId}
              onChange={(e) => setForm({ ...form, bookId: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-stone-300 bg-white font-bold text-stone-900"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.author})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-800 mb-1">
              الرابط المخصص (Slug):
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-left"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-stone-800 mb-1">
            العنوان التسويقي الرئيسي (Headline):
          </label>
          <input
            type="text"
            required
            value={form.heroHeadline}
            onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-stone-300 font-editorial text-base font-bold text-stone-900"
          />
        </div>

        <div>
          <label className="block font-bold text-stone-800 mb-1">
            العنوان الفرعي المقنع (Subheadline):
          </label>
          <textarea
            rows={2}
            value={form.heroSubheadline}
            onChange={(e) => setForm({ ...form, heroSubheadline: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-stone-300 font-editorial text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-stone-800 mb-1">
              شريط الحث السريع (Urgency Banner):
            </label>
            <input
              type="text"
              value={form.urgencyBanner}
              onChange={(e) => setForm({ ...form, urgencyBanner: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-stone-300 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-800 mb-1">
              مدة العداد التنازلي (بالدقائق):
            </label>
            <input
              type="number"
              min={5}
              max={180}
              value={form.countdownMinutes}
              onChange={(e) => setForm({ ...form, countdownMinutes: Number(e.target.value) })}
              className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-center font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-800 mb-1">
              نسبة الخصم الترويجي (%):
            </label>
            <input
              type="number"
              min={5}
              max={70}
              value={form.discountPercentage}
              onChange={(e) => setForm({ ...form, discountPercentage: Number(e.target.value) })}
              className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-center font-bold"
            />
          </div>
        </div>

        {/* Features / Gifts List */}
        <div>
          <label className="block font-bold text-stone-800 mb-1">
            قائمة الهدايا والمزايا الحصرية المرفقة بالعرض:
          </label>
          
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="أضف ميزة أو هدية جديدة (مثال: فاصل كتب نحاسي فاخر)..."
              className="flex-1 p-2 rounded-lg border border-stone-300"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg font-bold"
            >
              إضافة
            </button>
          </div>

          <div className="space-y-1.5">
            {form.featuresList.map((feat, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-stone-50 rounded-lg border border-stone-200">
                <span className="font-medium text-stone-800">• {feat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(i)}
                  className="text-stone-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </form>

    </div>
  );
};
