import React, { useState, useEffect } from 'react';
import {
  CloudLightning, Database, Check, AlertCircle, RefreshCw,
  UploadCloud, DownloadCloud, Key, ShieldCheck, Copy,
  CheckCircle, ArrowRight, ExternalLink, Terminal, Eye, EyeOff,
  Radio, Zap, Layers, Trash2
} from 'lucide-react';
import { Book, Order, SanityConfig, SanitySyncLog } from '../../types';
import { SanityService } from '../../services/sanityService';
import { StorageService } from '../../services/storage';

interface AdminSanitySyncProps {
  books: Book[];
  orders: Order[];
  onRefreshAll: () => void;
}

export const AdminSanitySync: React.FC<AdminSanitySyncProps> = ({
  books,
  orders,
  onRefreshAll
}) => {
  const [config, setConfig] = useState<SanityConfig>(SanityService.getConfig());
  const [logs, setLogs] = useState<SanitySyncLog[]>(SanityService.getLogs());
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  
  const [isBatchPushing, setIsBatchPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const schemas = SanityService.getSanitySchemas();

  useEffect(() => {
    const handleLogUpdate = () => {
      setLogs(SanityService.getLogs());
    };
    window.addEventListener('roumaissa-sanity-logs-updated', handleLogUpdate);
    return () => window.removeEventListener('roumaissa-sanity-logs-updated', handleLogUpdate);
  }, []);

  const handleSaveConfig = () => {
    SanityService.saveConfig(config);
    setActionMessage('تم حفظ إعدادات الربط السحابي Sanity بنجاح.');
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await SanityService.testConnection(config);
    setTestResult(res);
    setIsTesting(false);
  };

  // Push all books
  const handleBatchPushBooks = async () => {
    if (!config.projectId || !config.apiToken) {
      alert('يرجى أولاً إدخال معرف المشروع (Project ID) والـ API Token مع صلاحية الكتابة.');
      return;
    }
    setIsBatchPushing(true);
    setActionMessage('جاري رفع ومزامنة جميع الكتب إلى Sanity سحابياً...');
    
    const res = await SanityService.batchPushAllBooks(books);
    setIsBatchPushing(false);
    
    if (res.success) {
      setActionMessage(`نجحت العملية! تم رفع ومزامنة ${res.count} كتاب سحابياً بدون الحاجة لإعادة بناء الموقع.`);
    } else {
      setActionMessage(`فشلت المزامنة: ${res.error}`);
    }
    setTimeout(() => setActionMessage(null), 5000);
  };

  // Pull books from Sanity
  const handlePullBooks = async () => {
    if (!config.projectId) {
      alert('يرجى إدخال معرف المشروع أولاً.');
      return;
    }
    setIsPulling(true);
    setActionMessage('جاري سحب الكتب من سحابة Sanity...');
    
    const res = await SanityService.fetchBooks();
    setIsPulling(false);
    
    if (res.success && res.books.length > 0) {
      StorageService.saveBooks(res.books);
      onRefreshAll();
      setActionMessage(`تم سحب وتحديث ${res.books.length} كتاب من Sanity بنجاح!`);
    } else if (res.success && res.books.length === 0) {
      setActionMessage('تم الاتصال بسحابة Sanity ولكن لا توجد مستندات كتب بعد.');
    } else {
      setActionMessage(`تعذر سحب البيانات: ${res.error}`);
    }
    setTimeout(() => setActionMessage(null), 5000);
  };

  const handleCopySchema = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(key);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  const handleClearLogs = () => {
    SanityService.clearLogs();
  };

  const posOrdersCount = orders.filter(o => o.orderType === 'pos').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Automation Summary */}
      <div className="bg-stone-900 text-white p-6 rounded-2xl shadow-md border border-stone-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <CloudLightning className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold font-editorial text-amber-300">
                الأتمتة السحابية الكاملة (Sanity CMS Real-Time Sync)
              </h2>
            </div>
            <p className="text-xs text-stone-300 mt-2 max-w-2xl leading-relaxed">
              تتيح لك هذه الميزة تحديث وإضافة الكتب، رفع الأغلفة، وتوثيق مبيعات الكاشير POS مباشرة عبر السحاب دون الحاجة لنسخ ولصق الأكواد، ودون الحاجة لإعادة البناء (No Rebuild) أو إرسال أوامر عبر حاسوبك الشخصي.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              <span>اختبار سرعة الاتصال (Ping)</span>
            </button>
            {config.lastSyncTime && (
              <span className="text-[11px] text-stone-400">
                آخر اتصال ناجح: {config.lastSyncTime}
              </span>
            )}
          </div>
        </div>

        {/* Live Test Result Alert */}
        {testResult && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-medium flex items-center justify-between border ${
            testResult.success
              ? 'bg-emerald-950/80 text-emerald-200 border-emerald-800'
              : 'bg-rose-950/80 text-rose-200 border-rose-800'
          }`}>
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
            {testResult.latencyMs !== undefined && (
              <span className="font-mono text-[11px] bg-black/40 px-2 py-0.5 rounded">
                {testResult.latencyMs} ms
              </span>
            )}
          </div>
        )}
      </div>

      {actionMessage && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Grid: Credentials Form & 1-Click Cloud Sync Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Credentials & Automation Settings (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-700" />
              <span>بيانات اعتماد Sanity CMS</span>
            </h3>
            <span className="text-[11px] text-stone-400">
              API v{config.apiVersion}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Project ID */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                معرف المشروع (Project ID) *
              </label>
              <input
                type="text"
                value={config.projectId}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value.trim() })}
                placeholder="مثال: 9h7y3abc أو المعرف من sanity.io/manage"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800"
              />
              <p className="text-[10px] text-stone-400 mt-0.5">
                تجد هذا المعرف في لوحة تحكم مشروعك على Sanity.io.
              </p>
            </div>

            {/* Dataset Name */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                اسم قاعدة البيانات (Dataset) *
              </label>
              <input
                type="text"
                value={config.dataset}
                onChange={(e) => setConfig({ ...config, dataset: e.target.value.trim() })}
                placeholder="production"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800"
              />
            </div>

            {/* API Token */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                رمز الوصول للكتابة (API Token with Editor / Write Permissions) *
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={config.apiToken}
                  onChange={(e) => setConfig({ ...config, apiToken: e.target.value.trim() })}
                  placeholder="sk..."
                  className="w-full pl-10 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">
                أنشئ Token بنوع <strong>Editor</strong> من: Project Settings &gt; API &gt; Tokens
              </p>
            </div>

            {/* Automation Toggles */}
            <div className="pt-2 border-t border-stone-100 space-y-2.5">
              <label className="font-bold text-stone-800 block mb-1">خيارات الأتمتة المباشرة:</label>
              
              {/* Auto Sync on Save */}
              <label className="flex items-center justify-between p-3 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 cursor-pointer transition-colors">
                <div>
                  <span className="font-bold text-stone-900 block">المزامنة التلقائية الفورية للكتب</span>
                  <span className="text-[10px] text-stone-500">حفظ الكتب وتعديل الأسعار ورفع الأغلفة مباشرة في سحابة Sanity</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoSyncOnSave}
                  onChange={(e) => setConfig({ ...config, autoSyncOnSave: e.target.checked })}
                  className="w-4 h-4 accent-amber-800 rounded"
                />
              </label>

              {/* Sync POS Sales */}
              <label className="flex items-center justify-between p-3 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 cursor-pointer transition-colors">
                <div>
                  <span className="font-bold text-stone-900 block">مزامنة مبيعات الـ POS والمعارض سحابياً</span>
                  <span className="text-[10px] text-stone-500">توثيق كل عملية بيع في المعرض كـ posSale في Sanity مع خصم المخزون</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.syncPosSales}
                  onChange={(e) => setConfig({ ...config, syncPosSales: e.target.checked })}
                  className="w-4 h-4 accent-amber-800 rounded"
                />
              </label>
            </div>

            {/* Save Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleSaveConfig}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>حفظ إعدادات الربط السحابي</span>
              </button>
            </div>

          </div>
        </div>

        {/* 1-Click Cloud Sync Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2 border-b border-stone-100 pb-3">
              <Zap className="w-4 h-4 text-amber-700" />
              <span>إجراءات المزامنة السحابية الفورية</span>
            </h3>

            <div className="space-y-3">
              {/* Batch Upload All Books */}
              <button
                onClick={handleBatchPushBooks}
                disabled={isBatchPushing}
                className="w-full p-3.5 bg-gradient-to-r from-stone-900 to-stone-800 hover:from-stone-800 hover:to-stone-700 text-white rounded-xl text-right flex items-center justify-between shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <div>
                  <h4 className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4" />
                    <span>رفع كافة الكتب إلى Sanity سحابياً</span>
                  </h4>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    رفع ومزامنة {books.length} كتاب بضغطة زر واحدة
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
              </button>

              {/* Pull Books from Sanity */}
              <button
                onClick={handlePullBooks}
                disabled={isPulling}
                className="w-full p-3.5 bg-stone-50 hover:bg-stone-100 border border-stone-300 text-stone-900 rounded-xl text-right flex items-center justify-between transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <div>
                  <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <DownloadCloud className="w-4 h-4 text-emerald-700" />
                    <span>سحب التحديثات والكتب من Sanity</span>
                  </h4>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    تحديث المتجر بآخر الكتب المضافة في Sanity
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
              </button>
            </div>

            {/* Quick Status overview */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-1.5 text-xs text-stone-700">
              <div className="flex justify-between">
                <span>الكتب الجاهزة للمزامنة:</span>
                <span className="font-bold font-mono">{books.length} كتاب</span>
              </div>
              <div className="flex justify-between">
                <span>مبيعات المعارض الميدانية POS:</span>
                <span className="font-bold font-mono">{posOrdersCount} مبيعة</span>
              </div>
              <div className="flex justify-between">
                <span>المزامنة التلقائية:</span>
                <span className="font-bold text-emerald-700">
                  {config.autoSyncOnSave ? 'نشطة ومفعلة' : 'معطلة'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Setup Guide Card */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs text-stone-600">
            <h4 className="font-bold text-stone-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>كيف تعمل الأتمتة دون حاسوبك الشخصي؟</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-500 leading-relaxed">
              <li>المتجر وتطبيق الـ PWA يتصلان مباشرة بـ Sanity API عبر المتصفح.</li>
              <li>عند إضافة كتاب جديد، يُحفظ في Sanity فوراً ويظهر لجميع الزوار.</li>
              <li>لا حاجة لعمل Git Push أو إعادة بناء Build على Vercel عند إضافة المحتوى.</li>
            </ul>
          </div>

        </div>

      </div>

      {/* Sanity Activity & Sync Event Log */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-700" />
            <h3 className="font-bold text-stone-900 text-xs">سجل نشاط المزامنة السحابية (Real-Time Sync Log)</h3>
            <span className="text-[10px] bg-stone-200 text-stone-700 font-mono font-bold px-2 py-0.5 rounded-full">
              {logs.length} حدث
            </span>
          </div>

          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="text-[11px] text-stone-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>مسح السجل</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto max-h-60">
          <table className="w-full text-right text-xs">
            <thead className="bg-stone-100/60 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-4">التوقيت</th>
                <th className="py-2.5 px-4">النوع</th>
                <th className="py-2.5 px-4">الحالة</th>
                <th className="py-2.5 px-4">تفاصيل العملية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50">
                  <td className="py-2.5 px-4 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-mono text-[11px] bg-stone-100 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {log.status === 'success' ? 'نجاح' : 'فشل'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-stone-700 text-[11px]">
                    {log.details}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-stone-400 text-xs">
                    لا توجد أحداث مزامنة مسجلة بعد. سيتم توثيق أي عملية سحابية هنا تلقائياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sanity Studio Schemas (Ready to Copy) */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-700" />
              <span>مخططات Sanity Studio الجاهزة للنسخ (Schemas)</span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              إذا كنت تستخدم استوديو Sanity، يمكنك نسخ هذه المخططات مباشرة لملفات المشروع:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Book Schema */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-800">
              <span>مخطط الكتب: schemaTypes/book.js</span>
              <button
                onClick={() => handleCopySchema(schemas.bookSchema, 'book')}
                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg flex items-center gap-1 transition-colors text-[11px]"
              >
                {copiedTab === 'book' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTab === 'book' ? 'تم النسخ!' : 'نسخ الكود'}</span>
              </button>
            </div>
            <pre className="p-3 bg-stone-900 text-amber-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-48 text-left dir-ltr">
              {schemas.bookSchema}
            </pre>
          </div>

          {/* POS Sale Schema */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-800">
              <span>مخطط مبيعات الـ POS: schemaTypes/posSale.js</span>
              <button
                onClick={() => handleCopySchema(schemas.posSaleSchema, 'pos')}
                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg flex items-center gap-1 transition-colors text-[11px]"
              >
                {copiedTab === 'pos' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTab === 'pos' ? 'تم النسخ!' : 'نسخ الكود'}</span>
              </button>
            </div>
            <pre className="p-3 bg-stone-900 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-48 text-left dir-ltr">
              {schemas.posSaleSchema}
            </pre>
          </div>

        </div>
      </div>

    </div>
  );
};
