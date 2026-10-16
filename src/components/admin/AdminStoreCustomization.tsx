import React, { useState } from 'react';
import { Palette, Save, Check, Store, Phone, Mail, MapPin, Quote, Upload, Trash2, Camera } from 'lucide-react';
import { StoreSettings } from '../../types';
import { StorageService } from '../../services/storage';
import { processImageFile, formatFileSize, ProcessedImage } from '../../utils/imageProcessor';

interface AdminStoreCustomizationProps {
  storeSettings: StoreSettings;
  onRefresh: () => void;
}

export const AdminStoreCustomization: React.FC<AdminStoreCustomizationProps> = ({
  storeSettings,
  onRefresh
}) => {
  const [form, setForm] = useState<StoreSettings>({ ...storeSettings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);
  const [logoStats, setLogoStats] = useState<ProcessedImage | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingLogo(true);
    try {
      const processed = await processImageFile(file, 400, 400, 0.9);
      setLogoStats(processed);
      setForm(prev => ({ ...prev, logoImage: processed.dataUrl }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoStats(null);
    setForm(prev => ({ ...prev, logoImage: undefined }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveStoreSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    onRefresh();
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            تخصيص هوية المتجر ودار النشر (Store Customization)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            تعديل اسم دار النشر، البانر الترويجي العلوي، نصوص الواجهة ومعلومات الاتصال
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
        >
          <Save className="w-4 h-4 text-amber-400" />
          <span>{savedSuccess ? 'تم حفظ التعديلات ✓' : 'حفظ هوية المتجر'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5 text-xs">
        
        {/* Brand Identity */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
          <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-700" />
            <span>الهوية الرسمية للدار</span>
          </h3>

          {/* Publisher Custom Logo Upload */}
          <div className="p-3.5 bg-white rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-stone-900 border border-stone-300 overflow-hidden flex items-center justify-center shrink-0 relative group">
              {form.logoImage ? (
                <>
                  <img
                    src={form.logoImage}
                    alt="Publisher Logo"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute inset-0 bg-stone-900/70 text-rose-300 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs"
                    title="حذف الشعار"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <span className="font-editorial text-2xl font-bold text-amber-400">ر</span>
              )}
            </div>

            <div className="flex-1 space-y-1.5 text-right w-full">
              <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg font-bold text-stone-800 cursor-pointer transition-colors shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-amber-700" />
                <span>{isProcessingLogo ? 'جارٍ المعالجة...' : 'رفع شعار دار النشر (PNG / JPG / SVG)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={isProcessingLogo}
                  className="hidden"
                />
              </label>

              {logoStats && (
                <div className="text-[10px] text-emerald-800 font-mono">
                  تم ضغط الشعار: {formatFileSize(logoStats.compressedSize)} ({logoStats.width}×{logoStats.height}px)
                </div>
              )}

              <p className="text-[10px] text-stone-500">
                يظهر الشعار في أعلى المتجر، الفواتير، وبوالص الشحن لكافة الولايات.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                اسم دار النشر بالعربية:
              </label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300 font-editorial text-base font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-800 mb-1">
                اسم دار النشر بالفرنسية / اللاتينية:
              </label>
              <input
                type="text"
                value={form.storeNameFr}
                onChange={(e) => setForm({ ...form, storeNameFr: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-800 mb-1">
              الشعار اللفظي (Tagline):
            </label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-stone-300 text-xs font-editorial"
            />
          </div>
        </div>

        {/* Top Announcement Ribbon */}
        <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-amber-950">
              الشريط الإعلاني العلوي (Top Announcement Bar):
            </h3>
            <label className="flex items-center gap-2 text-xs font-bold text-amber-900 cursor-pointer">
              <input
                type="checkbox"
                checked={form.showAnnouncement}
                onChange={(e) => setForm({ ...form, showAnnouncement: e.target.checked })}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>إظهار الشريط للزوار</span>
            </label>
          </div>

          <input
            type="text"
            value={form.announcementNotice}
            onChange={(e) => setForm({ ...form, announcementNotice: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-amber-300 bg-white text-xs font-medium"
          />
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-stone-900">
            معلومات الاتصال بالجزائر (تظهر في الفواتير والتذييل):
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                رقم الهاتف الثابت / المحمول:
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-left"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                رقم الواتساب الرسمي (خدمة العملاء):
              </label>
              <input
                type="text"
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-left"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                البريد الإلكتروني للدار:
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-left"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">
              المقر والعنوان بالجزائر:
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-stone-300"
            />
          </div>
        </div>

        {/* Homepage Quote */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
          <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
            <Quote className="w-4 h-4 text-amber-700" />
            <span>اقتباس ورسالة الواجهة الرئيسية (Editorial Quote):</span>
          </h3>

          <textarea
            rows={2}
            value={form.heroQuote}
            onChange={(e) => setForm({ ...form, heroQuote: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-stone-300 font-editorial text-sm leading-relaxed"
          />
        </div>

      </form>

    </div>
  );
};
