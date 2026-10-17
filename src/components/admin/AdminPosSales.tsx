import React, { useState } from 'react';
import {
  ShoppingBag, Search, Filter, Printer, CloudLightning,
  CheckCircle, ArrowUpRight, DollarSign, Calendar, MapPin,
  User, ExternalLink, Download, RefreshCw, X, Eye
} from 'lucide-react';
import { Order } from '../../types';
import { SanityService } from '../../services/sanityService';

interface AdminPosSalesProps {
  orders: Order[];
  onOpenPosTerminal: () => void;
}

export const AdminPosSales: React.FC<AdminPosSalesProps> = ({
  orders,
  onOpenPosTerminal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Filter POS orders only
  const posOrders = orders.filter(o => o.orderType === 'pos');

  const filteredOrders = posOrders.filter(order => {
    const matchesPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      order.orderNumber.toLowerCase().includes(q) ||
      (order.customerName && order.customerName.toLowerCase().includes(q)) ||
      (order.posCashierName && order.posCashierName.toLowerCase().includes(q)) ||
      (order.posStandLocation && order.posStandLocation.toLowerCase().includes(q));
    return matchesPayment && matchesSearch;
  });

  // Calculate POS statistics
  const totalPosRevenue = posOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalBooksSold = posOrders.reduce((sum, o) => sum + o.items.reduce((acc, i) => acc + i.quantity, 0), 0);
  const totalCashRevenue = posOrders.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.totalAmount, 0);
  const totalElectronicRevenue = posOrders.filter(o => o.paymentMethod !== 'cash').reduce((sum, o) => sum + o.totalAmount, 0);

  // Sync all POS sales to Sanity
  const handleSyncAllPosToSanity = async () => {
    setIsSyncing(true);
    setSyncMessage('جاري مزامنة مبيعات الـ POS سحابياً مع Sanity...');
    try {
      let syncedCount = 0;
      for (const order of posOrders) {
        const res = await SanityService.pushPosSale(order);
        if (res.success) syncedCount++;
      }
      setSyncMessage(`تمت مزامنة ${syncedCount} عملية بيع بنجاح مع Sanity!`);
    } catch (e: any) {
      setSyncMessage(`حدث خطأ أثناء المزامنة: ${e.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900 font-editorial">
              مبيعات نقطة البيع ومعارض الكتاب (POS Sales)
            </h2>
            <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {posOrders.length} عملية بيع
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            متابعة فورية للمبيعات الميدانية، إيصالات الدفع، إحصائيات المعارض ومزامنة السحاب الآلية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenPosTerminal}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-200" />
            <span>فتح واجهة الكاشير POS</span>
          </button>

          <button
            onClick={handleSyncAllPosToSanity}
            disabled={isSyncing || posOrders.length === 0}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            <CloudLightning className={`w-4 h-4 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>مزامنة سحابية مع Sanity</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
            <span>إجمالي مداخيل الـ POS</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-editorial text-2xl font-bold text-stone-900 font-mono">
            {totalPosRevenue.toLocaleString()} <span className="text-xs font-sans text-stone-500">دج</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            من المعارض الميدانية ونقاط البيع
          </p>
        </div>

        {/* Books Sold */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
            <span>الكتب المباعة ميدانياً</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-editorial text-2xl font-bold text-stone-900 font-mono">
            {totalBooksSold.toLocaleString()} <span className="text-xs font-sans text-stone-500">نسخة</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            خصمت من المخزون آلياً
          </p>
        </div>

        {/* Cash Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
            <span>المقبوض نقداً (Cash)</span>
            <div className="p-2 rounded-lg bg-stone-100 text-stone-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-editorial text-2xl font-bold text-stone-900 font-mono">
            {totalCashRevenue.toLocaleString()} <span className="text-xs font-sans text-stone-500">دج</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            {posOrders.length > 0 ? Math.round((totalCashRevenue / (totalPosRevenue || 1)) * 100) : 0}% من إجمالي المبيعات
          </p>
        </div>

        {/* Electronic Payments */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
            <span>دفع إلكتروني (ذهبية / TPE)</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <CloudLightning className="w-4 h-4" />
            </div>
          </div>
          <div className="font-editorial text-2xl font-bold text-stone-900 font-mono">
            {totalElectronicRevenue.toLocaleString()} <span className="text-xs font-sans text-stone-500">دج</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            بطاقة ذهبية، CIB وجهاز TPE
          </p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث برقم الوصل، اسم الزبون، الكاشير أو المعرض..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-10 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-stone-500 whitespace-nowrap">طريقة الدفع:</span>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:ring-1 focus:ring-amber-800"
          >
            <option value="all">كافة الطرق</option>
            <option value="cash">نقداً (Cash)</option>
            <option value="dahabia">البطاقة الذهبية / CIB</option>
            <option value="tpe">جهاز الدفع TPE</option>
          </select>
        </div>

      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">رقم الوصل</th>
                <th className="py-3 px-4">التاريخ والوقت</th>
                <th className="py-3 px-4">المعرض / الجناح</th>
                <th className="py-3 px-4">الزبون والكاشير</th>
                <th className="py-3 px-4">عدد الكتب والبنود</th>
                <th className="py-3 px-4">طريقة الدفع</th>
                <th className="py-3 px-4">المبلغ الإجمالي</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-900">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-4 text-stone-500">
                    {new Date(order.createdAt).toLocaleDateString('ar-DZ')} {new Date(order.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-medium text-stone-900">
                      <MapPin className="w-3 h-3 text-amber-700" />
                      {order.posStandLocation || 'معرض الكتب'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <span className="font-bold block text-stone-900">{order.customerName}</span>
                      <span className="text-[10px] text-stone-400">بواسطة: {order.posCashierName || 'الكاشير'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {order.items.reduce((sum, i) => sum + i.quantity, 0)} كتب
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      order.paymentMethod === 'cash'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : order.paymentMethod === 'dahabia'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                      {order.paymentMethod === 'cash' ? 'نقداً' : order.paymentMethod === 'dahabia' ? 'ذهبية' : 'TPE'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-stone-900 text-sm">
                    {order.totalAmount.toLocaleString()} دج
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedReceipt(order)}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors inline-flex items-center gap-1"
                      title="عرض وطباعة الوصل"
                    >
                      <Printer className="w-3.5 h-3.5 text-stone-600" />
                      <span className="text-[11px]">وصل</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-sm">لا توجد عمليات بيع POS مطابقة</p>
                    <p className="text-xs mt-1">ابدأ تسجيل مبيعاتك الميدانية بالضغط على "فتح واجهة الكاشير POS"</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">إعادة طباعة وصل البيع</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-stone-800 text-xs font-sans">
              
              <div className="text-center space-y-1 border-b border-dashed border-stone-300 pb-4">
                <h2 className="font-editorial font-bold text-lg text-stone-900">دار رميسة للنشر والترجمة والتوزيع</h2>
                <p className="text-[10px] text-stone-500">Roumaissa Éditions et Diffusion</p>
                <p className="text-[11px] font-medium text-amber-900 mt-1">{selectedReceipt.posStandLocation}</p>
                <p className="text-[10px] text-stone-500">
                  بتاريخ: {new Date(selectedReceipt.createdAt).toLocaleString('ar-DZ')}
                </p>
                <p className="font-mono font-bold text-xs bg-stone-100 py-1 rounded mt-1">
                  وصل رقم: {selectedReceipt.posReceiptNumber || selectedReceipt.orderNumber}
                </p>
              </div>

              <div className="flex justify-between text-[11px] text-stone-600 border-b border-stone-200 pb-2">
                <span>الكاشير: {selectedReceipt.posCashierName || 'دار رميسة'}</span>
                <span>الزبون: {selectedReceipt.customerName}</span>
              </div>

              <div className="space-y-1.5 border-b border-dashed border-stone-300 pb-3">
                {selectedReceipt.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="font-bold block truncate">{item.title}</span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {item.quantity} × {item.price.toLocaleString()} دج
                      </span>
                    </div>
                    <span className="font-mono font-bold shrink-0">
                      {(item.quantity * item.price).toLocaleString()} دج
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-1 font-mono text-xs">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{selectedReceipt.subtotal.toLocaleString()} دج</span>
                </div>
                {selectedReceipt.posDiscountAmount && selectedReceipt.posDiscountAmount > 0 && (
                  <div className="flex justify-between text-rose-700">
                    <span>التخفيض المطبق:</span>
                    <span>-{selectedReceipt.posDiscountAmount.toLocaleString()} دج</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-stone-900 pt-1 border-t border-stone-200">
                  <span>الإجمالي الصافي:</span>
                  <span>{selectedReceipt.totalAmount.toLocaleString()} دج</span>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-dashed border-stone-300">
                <p className="font-editorial text-xs font-bold text-stone-900">
                  شكراً لاقتنائكم من دار رميسة للنشر والترجمة
                </p>
              </div>

            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-3 shrink-0">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>طباعة الوصل فوراً</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-bold transition-all"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
