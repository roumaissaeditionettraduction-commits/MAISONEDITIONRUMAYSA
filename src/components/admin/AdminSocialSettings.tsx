import React, { useState } from 'react';
import { Share2, MessageCircle, Save, Check, ShieldCheck, Lock, Globe } from 'lucide-react';
import { SocialLinks } from '../../types';
import { StorageService } from '../../services/storage';

interface AdminSocialSettingsProps {
  socialLinks: SocialLinks;
  onRefresh: () => void;
}

export const AdminSocialSettings: React.FC<AdminSocialSettingsProps> = ({
  socialLinks,
  onRefresh
}) => {
  const [form, setForm] = useState<SocialLinks>({ ...socialLinks });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSocialLinks(form);
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
            ربط منصات التواصل الاجتماعي والواتساب وحماية المحتوى
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            إدارة روابط فيسبوك، إنستغرام، تيك توك، يوتيوب، زر الواتساب العائم، ونظام منع النسخ
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
        >
          <Save className="w-4 h-4 text-amber-400" />
          <span>{savedSuccess ? 'تم حفظ الروابط والإعدادات ✓' : 'حفظ إعدادات التواصل'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* Anti-Copy Protection Master Switch */}
        <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-stone-900">
                  الحماية الشاملة للمحتوى من النسخ والسرقة الفكرية:
                </h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  form.antiCopyGlobalEnabled ? 'bg-emerald-200 text-emerald-900' : 'bg-stone-200 text-stone-700'
                }`}>
                  {form.antiCopyGlobalEnabled ? 'مفعّل ونشط' : 'معطل'}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 mt-0.5">
                يقوم بتعطيل التحديد (User Select None)، النقر بالزر الأيمن، واختصارات النسخ على كافة المقالات والنصوص لمنع سرقتها.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 font-bold text-stone-900 cursor-pointer p-2 bg-white rounded-xl border border-emerald-300">
            <input
              type="checkbox"
              checked={form.antiCopyGlobalEnabled}
              onChange={(e) => setForm({ ...form, antiCopyGlobalEnabled: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span>تفعيل منع النسخ الشامل</span>
          </label>
        </div>

        {/* WhatsApp Integration Box */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-stone-900">
                إعدادات الواتساب الرسمية وزر الدردشة العائم (WhatsApp Support)
              </h3>
            </div>

            <label className="flex items-center gap-2 font-bold text-stone-900 cursor-pointer">
              <input
                type="checkbox"
                checked={form.showFloatingWhatsApp}
                onChange={(e) => setForm({ ...form, showFloatingWhatsApp: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>إظهار زر الواتساب العائم في المتجر</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                رقم هاتف الواتساب (بالصيغة الدولية):
              </label>
              <input
                type="text"
                required
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                placeholder="+213 550 12 34 56"
                className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-left"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                مخصص لفتح الدردشة المباشرة مع زوار المتجر فور النقر
              </span>
            </div>

            <div>
              <label className="block font-bold text-stone-800 mb-1">
                الرسالة الافتراضية الترحيبية:
              </label>
              <input
                type="text"
                value={form.whatsappDefaultMsg}
                onChange={(e) => setForm({ ...form, whatsappDefaultMsg: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links Grid */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-200">
            <Share2 className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-sm text-stone-900">
              حسابات ومنصات التواصل الاجتماعي الرسمية لدار رميسة
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Facebook */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <label className="block font-bold text-stone-900">
                صفحة فيسبوك (Facebook Page):
              </label>
              <input
                type="url"
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                placeholder="https://facebook.com/roumaissa.edition"
                className="w-full p-2 bg-white rounded-lg border border-stone-300 font-mono text-left"
              />
            </div>

            {/* Instagram */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <label className="block font-bold text-stone-900">
                حساب إنستغرام (Instagram):
              </label>
              <input
                type="url"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="https://instagram.com/roumaissa_edition"
                className="w-full p-2 bg-white rounded-lg border border-stone-300 font-mono text-left"
              />
            </div>

            {/* TikTok */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <label className="block font-bold text-stone-900">
                حساب تيك توك (TikTok):
              </label>
              <input
                type="url"
                value={form.tiktok}
                onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                placeholder="https://tiktok.com/@roumaissa.edition"
                className="w-full p-2 bg-white rounded-lg border border-stone-300 font-mono text-left"
              />
            </div>

            {/* YouTube */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <label className="block font-bold text-stone-900">
                قناة يوتيوب (YouTube Channel):
              </label>
              <input
                type="url"
                value={form.youtube}
                onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                placeholder="https://youtube.com/@roumaissa-edition"
                className="w-full p-2 bg-white rounded-lg border border-stone-300 font-mono text-left"
              />
            </div>

            {/* Twitter / X */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <label className="block font-bold text-stone-900">
                منصة إكس (Twitter / X):
              </label>
              <input
                type="url"
                value={form.twitter}
                onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                placeholder="https://x.com/roumaissa_ed"
                className="w-full p-2 bg-white rounded-lg border border-stone-300 font-mono text-left"
              />
            </div>

            {/* Telegram */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <label className="block font-bold text-stone-900">
                قناة تيليجرام (Telegram Channel):
              </label>
              <input
                type="url"
                value={form.telegram}
                onChange={(e) => setForm({ ...form, telegram: e.target.value })}
                placeholder="https://t.me/roumaissa_edition"
                className="w-full p-2 bg-white rounded-lg border border-stone-300 font-mono text-left"
              />
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};
