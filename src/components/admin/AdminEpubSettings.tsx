import React, { useState } from 'react';
import { BookOpen, Download, ShieldCheck, Check, Save, FileText, AlertCircle } from 'lucide-react';
import { EpubSettings, Book } from '../../types';
import { StorageService } from '../../services/storage';
import { EpubService } from '../../services/epubService';

interface AdminEpubSettingsProps {
  settings: EpubSettings;
  books: Book[];
  onRefresh: () => void;
}

export const AdminEpubSettings: React.FC<AdminEpubSettingsProps> = ({
  settings,
  books,
  onRefresh
}) => {
  const [form, setForm] = useState<EpubSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testDownloading, setTestDownloading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveEpubSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    onRefresh();
  };

  const handleTestDownloadEpub = () => {
    const sampleBook = books[0];
    if (sampleBook) {
      setTestDownloading(true);
      EpubService.downloadEpubFile(sampleBook, 'مشرف دار رميسة (تجربة)');
      setTimeout(() => setTestDownloading(false), 1500);
    }
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            إعدادات نشر وتحميل الكتب الإلكترونية (ePub & eBooks)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            إدارة حماية الملكية الفكرية، توليد ملفات .epub الرقمية، التوقيع المائي، وضبط صلاحيات التحميل
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestDownloadEpub}
            disabled={testDownloading}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>{testDownloading ? 'جارٍ توليد الملف...' : 'تجربة تحميل ملف ePub فوري'}</span>
          </button>
          
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{savedSuccess ? 'تم حفظ الإعدادات ✓' : 'حفظ إعدادات ePub'}</span>
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5 text-xs">
        
        {/* DRM & Watermark Banner */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-sm text-stone-900">
              حماية الملفات والعلامة المائية الرقمية (Digital Watermarking)
            </h3>
          </div>
          <p className="text-stone-600 leading-relaxed text-[11px]">
            يقوم نظام دار رميسة بدمج بيانات المشتري ورقم الطلب وختم الناشر تلقائياً داخل كل ملف .epub يتم تحميله، لمنع إعادة النشر غير القانونية وتأمين حقوق المؤلف والدار.
          </p>

          <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
            <input
              type="checkbox"
              id="watermarkCheck"
              checked={form.watermarkCustomerInfo}
              onChange={(e) => setForm({ ...form, watermarkCustomerInfo: e.target.checked })}
              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
            />
            <label htmlFor="watermarkCheck" className="font-bold text-stone-900 cursor-pointer">
              ختم اسم الزبون ورقم هاتفه ورقم الفاتورة داخل ملف ePub تلقائياً
            </label>
          </div>
        </div>

        {/* Publisher Stamp Text */}
        <div>
          <label className="block font-bold text-stone-800 mb-1">
            صيغة ختم الملكية الفكرية المعتمد لدار رميسة:
          </label>
          <textarea
            rows={2}
            value={form.publisherStampText}
            onChange={(e) => setForm({ ...form, publisherStampText: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-stone-300 font-editorial text-sm focus:ring-1 focus:ring-amber-600 leading-relaxed"
          />
        </div>

        {/* Security Limits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <label className="block font-bold text-stone-800 mb-1">
              الحد الأقصى لمحاولات التنزيل للعميل الواحد:
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={form.maxDownloadAttempts}
              onChange={(e) => setForm({ ...form, maxDownloadAttempts: Number(e.target.value) })}
              className="w-full p-2.5 bg-white rounded-lg border border-stone-300 font-mono text-center font-bold"
            />
            <span className="text-[10px] text-stone-500 mt-1 block">
              يمنع مشاركة الرابط مع أشخاص آخرين بعد استنفاد التنزيلات.
            </span>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <label className="block font-bold text-stone-800 mb-1">
              صلاحية رابط التنزيل (بالساعات):
            </label>
            <input
              type="number"
              min={1}
              max={720}
              value={form.linkExpiryHours}
              onChange={(e) => setForm({ ...form, linkExpiryHours: Number(e.target.value) })}
              className="w-full p-2.5 bg-white rounded-lg border border-stone-300 font-mono text-center font-bold"
            />
            <span className="text-[10px] text-stone-500 mt-1 block">
              72 ساعة تعادل 3 أيام من تاريخ الشراء.
            </span>
          </div>
        </div>

        {/* In-Browser Reader Permission */}
        <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-stone-900 text-xs">
              السماح بفتح عينات القراءة داخل المتصفح (Browser ePub Reader):
            </h4>
            <p className="text-[11px] text-stone-600">
              يتيح للزوار تجربة قراءة الفصول الأولى قبل الشراء لزيادة المبيعات.
            </p>
          </div>
          <input
            type="checkbox"
            checked={form.allowInstantBrowserPreview}
            onChange={(e) => setForm({ ...form, allowInstantBrowserPreview: e.target.checked })}
            className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
          />
        </div>

      </form>

    </div>
  );
};
