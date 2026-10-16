import React, { useState } from 'react';
import { Target, Activity, Check, Save, Play, Trash2, ShieldCheck } from 'lucide-react';
import { PixelSettings, PixelEvent } from '../../types';
import { StorageService } from '../../services/storage';
import { PixelService } from '../../services/pixelService';

interface AdminPixelProps {
  pixelSettings: PixelSettings;
  onRefresh: () => void;
}

export const AdminPixel: React.FC<AdminPixelProps> = ({
  pixelSettings,
  onRefresh
}) => {
  const [form, setForm] = useState<PixelSettings>({ ...pixelSettings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [events, setEvents] = useState<PixelEvent[]>(StorageService.getPixelEvents());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.savePixelSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    onRefresh();
  };

  const handleFireTestEvent = (eventName: string) => {
    switch (eventName) {
      case 'PageView':
        PixelService.trackPageView('صفحة اختبار البكسل');
        break;
      case 'ViewContent':
        PixelService.trackViewContent('رواية رماد الأندلس (اختبار)', 1450, 'print');
        break;
      case 'AddToCart':
        PixelService.trackAddToCart('رواية رماد الأندلس (اختبار)', 1450, 1, 'print');
        break;
      case 'Purchase':
        PixelService.trackPurchase('ROUM-TEST-9999', 1850, 'chargily', 1);
        break;
    }
    setEvents(StorageService.getPixelEvents());
  };

  const handleClearEvents = () => {
    StorageService.clearPixelEvents();
    setEvents([]);
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            إعدادات البكسل والتتبع الإعلاني (Pixels & Analytics)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            ربط بكسلات Meta Facebook و TikTok و Google Analytics لتتبع الحملات الإعلانية ومعدل التحويل
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
        >
          <Save className="w-4 h-4 text-amber-400" />
          <span>{savedSuccess ? 'تم حفظ المفاتيح بنجاح ✓' : 'حفظ إعدادات البكسل'}</span>
        </button>
      </div>

      {/* Pixels Input Form */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-sm text-stone-900">
              مفاتيح التتبع للأحداث القياسية (E-commerce Events)
            </h3>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isEnabled}
              onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span>تفعيل إطلاق الأحداث الإعلانية (Pixel Active)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Facebook Pixel */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Meta (Facebook) Pixel ID</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">fbq standard</span>
            </div>
            <input
              type="text"
              value={form.facebookPixelId}
              onChange={(e) => setForm({ ...form, facebookPixelId: e.target.value })}
              placeholder="مثال: 109283746592019"
              className="w-full p-2.5 bg-white rounded-lg border border-stone-300 font-mono text-left focus:ring-1 focus:ring-amber-600"
            />
            <span className="text-[10px] text-stone-500 mt-1 block">
              يتتبع: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase
            </span>
          </div>

          {/* TikTok Pixel */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-stone-950"></span>
                <span>TikTok Pixel ID</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">ttq standard</span>
            </div>
            <input
              type="text"
              value={form.tiktokPixelId}
              onChange={(e) => setForm({ ...form, tiktokPixelId: e.target.value })}
              placeholder="مثال: C789102X90Y1"
              className="w-full p-2.5 bg-white rounded-lg border border-stone-300 font-mono text-left focus:ring-1 focus:ring-amber-600"
            />
            <span className="text-[10px] text-stone-500 mt-1 block">
              متوافق مع حملات تيك توك في الجزائر للكتب الأكثر مبيعاً
            </span>
          </div>

          {/* Google Analytics 4 */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                <span>Google Analytics 4 (Measurement ID)</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">gtag.js</span>
            </div>
            <input
              type="text"
              value={form.googleAnalyticsId}
              onChange={(e) => setForm({ ...form, googleAnalyticsId: e.target.value })}
              placeholder="مثال: G-ROUM99482"
              className="w-full p-2.5 bg-white rounded-lg border border-stone-300 font-mono text-left focus:ring-1 focus:ring-amber-600"
            />
          </div>

          {/* Snapchat Pixel */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                <span>Snapchat Pixel ID</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">snaptr</span>
            </div>
            <input
              type="text"
              value={form.snapchatPixelId}
              onChange={(e) => setForm({ ...form, snapchatPixelId: e.target.value })}
              placeholder="معرف بكسل سناب شات (اختياري)"
              className="w-full p-2.5 bg-white rounded-lg border border-stone-300 font-mono text-left focus:ring-1 focus:ring-amber-600"
            />
          </div>
        </div>
      </div>

      {/* Live Pixel Event Tester & Realtime Activity Stream */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-sm text-stone-900">
                مراقب الأحداث المباشر واختبار الإرسال (Pixel Event Inspector)
              </h3>
              <p className="text-[11px] text-stone-500">
                تحقق لحظياً من الأحداث التي يتم إرسالها إلى خوادم فيسبوك وتيك توك
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFireTestEvent('ViewContent')}
              className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Play className="w-3 h-3 text-amber-700" />
              <span>فحص ViewContent</span>
            </button>
            <button
              onClick={() => handleFireTestEvent('AddToCart')}
              className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Play className="w-3 h-3 text-amber-700" />
              <span>فحص AddToCart</span>
            </button>
            <button
              onClick={() => handleFireTestEvent('Purchase')}
              className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Play className="w-3 h-3 text-emerald-700" />
              <span>فحص Purchase</span>
            </button>
            <button
              onClick={handleClearEvents}
              className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
              title="مسح السجل"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Events Feed */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-6">
              لم يتم تسجيل أحداث بعد. اضغط على أزرار الفحص أعلاه أو تصفح المتجر لاختبار الإرسال.
            </p>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex items-center justify-between gap-3 font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ev.platform === 'facebook'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-stone-900 text-white'
                  }`}>
                    {ev.platform.toUpperCase()}
                  </span>
                  <span className="font-bold text-stone-900 font-sans">
                    {ev.eventName}
                  </span>
                  <span className="text-stone-500 text-[11px]">
                    {JSON.stringify(ev.parameters)}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 shrink-0">
                  {ev.timestamp}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
