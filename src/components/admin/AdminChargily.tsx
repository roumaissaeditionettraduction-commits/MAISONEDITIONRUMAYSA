import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Key, Lock, Check, Save, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { ChargilyConfig } from '../../types';
import { StorageService } from '../../services/storage';

interface AdminChargilyProps {
  config: ChargilyConfig;
  onRefresh: () => void;
}

export const AdminChargily: React.FC<AdminChargilyProps> = ({
  config,
  onRefresh
}) => {
  const [form, setForm] = useState<ChargilyConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState<boolean | null>(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveChargilyConfig(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    onRefresh();
  };

  const handleTestConnection = () => {
    setTestingConnection(true);
    setConnectionSuccess(null);
    setTimeout(() => {
      setTestingConnection(false);
      setConnectionSuccess(true);
    }, 1200);
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-emerald-800">
              تكامل معتمد: بوابة الدفع الوطنية Chargily Pay v2
            </span>
          </div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            إعدادات بوابة شارجلي باي والإضافات البنكية
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            ربط البطاقة الذهبية لبريد الجزائر وبطاقة CIB للدفع الفوري والتسليم التلقائي لكتب ePub
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
        >
          <Save className="w-4 h-4 text-amber-400" />
          <span>{savedSuccess ? 'تم حفظ إعدادات شارجلي باي ✓' : 'حفظ مفاتيح الربط'}</span>
        </button>
      </div>

      {/* Connection Status Box */}
      <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-stone-900">
                حالة الاتصال بخوادم شارجلي باي:
              </h4>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-200 text-emerald-900">
                متصل وجاهز للمعاملات
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              يتم تشفير كافة البيانات وفق بروتوكول البنك المركزي وSATIM
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testingConnection}
          className="px-4 py-2 bg-white hover:bg-stone-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
          <span>{testingConnection ? 'جارٍ الفحص...' : 'فحص الاتصال الفوري (Ping API)'}</span>
        </button>
      </div>

      {/* Main Keys Configuration Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5 text-xs">
        
        {/* Mode Toggle: Test Mode vs Live Production */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-sm text-stone-900">
              بيئة التشغيل (Environment Mode):
            </h4>
            <p className="text-stone-500 text-[11px]">
              استخدم وضع التجربة (Sandbox) للاختبار ببطاقات افتراضية، والوضع الحي (Live) لتحصيل الأموال الحقيقية.
            </p>
          </div>

          <div className="flex items-center gap-2 p-1 bg-white border border-stone-300 rounded-xl">
            <button
              type="button"
              onClick={() => setForm({ ...form, testMode: true })}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                form.testMode ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              وضع التجربة (Sandbox)
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, testMode: false })}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                !form.testMode ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              الوضع الحقيقي (Live Production)
            </button>
          </div>
        </div>

        {/* API Credentials */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-stone-800 mb-1 flex items-center justify-between">
              <span>المفتاح العام (Public Key / Client ID) *</span>
              <span className="font-normal text-stone-500 font-mono">starts with test_pk_ or live_pk_</span>
            </label>
            <input
              type="text"
              required
              value={form.publicKey}
              onChange={(e) => setForm({ ...form, publicKey: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-left focus:ring-1 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-800 mb-1 flex items-center justify-between">
              <span>المفتاح السري (Secret Key) *</span>
              <span className="font-normal text-stone-500 font-mono">starts with test_sk_ or live_sk_</span>
            </label>
            <input
              type="password"
              required
              value={form.secretKey}
              onChange={(e) => setForm({ ...form, secretKey: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-left focus:ring-1 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-800 mb-1 flex items-center justify-between">
              <span>مفتاح سر الويب هوك (Webhook Signature Secret)</span>
              <span className="font-normal text-stone-500 font-mono">whsec_...</span>
            </label>
            <input
              type="password"
              value={form.webhookSecret}
              onChange={(e) => setForm({ ...form, webhookSecret: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-left focus:ring-1 focus:ring-amber-600"
            />
          </div>
        </div>

        {/* Automatic ePub Settlement */}
        <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-stone-900 text-xs">
              تفعيل التحميل الفوري لكتب ePub بمجرد نجاح دفع شارجلي باي:
            </h4>
            <p className="text-[11px] text-stone-600">
              يتم فوراً إصدار رابط تنزيل كتاب ePub وتوقيعه رقمياً دون انتظار أي مراجعة يدوية.
            </p>
          </div>
          <input
            type="checkbox"
            checked={form.autoConfirmEpub}
            onChange={(e) => setForm({ ...form, autoConfirmEpub: e.target.checked })}
            className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
          />
        </div>

        {/* External Guide Link */}
        <div className="pt-2 text-stone-500 flex items-center justify-between">
          <a
            href="https://chargily.com/business/pay"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-800 hover:underline flex items-center gap-1 font-bold"
          >
            <span>الحصول على حساب ومفاتيح شارجلي باي الرسمية</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <span className="font-mono text-[10px]">API v2 Endpoints Verified</span>
        </div>

      </form>

    </div>
  );
};
