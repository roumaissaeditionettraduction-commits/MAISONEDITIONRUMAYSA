import React from 'react';
import { TrendingUp, ShoppingBag, BookOpen, AlertCircle, Users, CheckCircle, Truck, DollarSign } from 'lucide-react';
import { Order, AbandonedCart, Book, Customer } from '../../types';

interface AdminOverviewProps {
  orders: Order[];
  abandonedCarts: AbandonedCart[];
  books: Book[];
  customers: Customer[];
  onNavigateTab: (tab: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  orders,
  abandonedCarts,
  books,
  customers,
  onNavigateTab
}) => {
  // Metric Calculations
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const completedOrders = orders.filter(o => o.orderStatus === 'delivered' || o.paymentStatus === 'paid');
  const pendingOrders = orders.filter(o => o.orderStatus === 'new' || o.orderStatus === 'confirmed');
  const epubOrdersCount = orders.filter(o => o.items.some(i => i.format === 'epub')).length;

  const totalAbandonedAmount = abandonedCarts
    .filter(c => !c.recovered)
    .reduce((acc, c) => acc + c.totalAmount, 0);

  const conversionRate = orders.length > 0 ? ((orders.length / (orders.length + abandonedCarts.length)) * 100).toFixed(1) : '0';

  // Wilayas distribution
  const wilayaStats: Record<string, number> = {};
  orders.forEach(o => {
    wilayaStats[o.wilayaName] = (wilayaStats[o.wilayaName] || 0) + 1;
  });
  const topWilayas = Object.entries(wilayaStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <span className="text-xs text-amber-800 font-bold tracking-wider">
            دار النشر رميسة إيديسيو · نظام التجارة والتوزيع الموحد
          </span>
          <h2 className="font-editorial text-2xl font-bold text-stone-900 mt-1">
            لوحة الإحصائيات والمؤشرات العامة
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-3.5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors shadow-xs"
          >
            عرض كافة الطلبيات ({orders.length})
          </button>
          <button
            onClick={() => onNavigateTab('books')}
            className="px-3.5 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors shadow-xs"
          >
            إضافة كتاب جديد
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">إجمالي المبيعات المحققة</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-extrabold text-stone-900 tabular-nums">
            {totalRevenue.toLocaleString('ar-DZ')}{' '}
            <span className="text-xs font-normal text-stone-500">دج</span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-2 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>طلب ورقي وإلكتروني مؤكد</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">الطلبيات المستلمة</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-extrabold text-stone-900 tabular-nums">
            {orders.length}
          </div>
          <div className="text-[11px] text-amber-800 mt-2 font-medium">
            <span>{pendingOrders.length} طلبية بانتظار التجهيز والشحن</span>
          </div>
        </div>

        {/* ePub Digital Downloads */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">مبيعات الكتب الرقمية ePub</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-extrabold text-blue-900 tabular-nums">
            {epubOrdersCount}
          </div>
          <div className="text-[11px] text-blue-700 mt-2 font-medium">
            <span>تحميل فوري عبر رابط مشفر</span>
          </div>
        </div>

        {/* Abandoned Carts */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs cursor-pointer hover:border-rose-300 transition-colors"
          onClick={() => onNavigateTab('abandoned')}
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">السلات المتروكة</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-extrabold text-rose-800 tabular-nums">
            {abandonedCarts.filter(c => !c.recovered).length}
          </div>
          <div className="text-[11px] text-rose-700 mt-2 font-medium">
            <span>قيمة {totalAbandonedAmount.toLocaleString('ar-DZ')} دج قابلة للاسترجاع</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Orders & Top Wilayas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-stone-900">
              أحدث الطلبيات الواردة
            </h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-amber-800 hover:underline"
            >
              عرض الكل ←
            </button>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-right">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">رقم الطلب</th>
                  <th className="py-2.5 px-3">الزبون</th>
                  <th className="py-2.5 px-3">الولاية</th>
                  <th className="py-2.5 px-3">المبلغ</th>
                  <th className="py-2.5 px-3">الدفع</th>
                  <th className="py-2.5 px-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-stone-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-stone-900">
                      {order.customerName}
                    </td>
                    <td className="py-2.5 px-3 text-stone-600">
                      {order.wilayaName}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-stone-900 tabular-nums">
                      {order.totalAmount.toLocaleString('ar-DZ')} دج
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.paymentMethod === 'chargily'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {order.paymentMethod === 'chargily' ? 'شارجلي باي' : 'عند الاستلام'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.orderStatus === 'delivered'
                          ? 'bg-emerald-50 text-emerald-800'
                          : order.orderStatus === 'shipping'
                          ? 'bg-blue-50 text-blue-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}>
                        {order.orderStatus === 'delivered' ? 'مستلم' : order.orderStatus === 'shipping' ? 'قيد الشحن' : 'جديد'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Algerian Wilayas & Delivery Stats */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-stone-900">
            الولايات الأكثر طلباً
          </h3>
          <p className="text-xs text-stone-500">
            توزيع المبيعات والشحنات عبر الولايات الجزائرية:
          </p>

          <div className="space-y-3">
            {topWilayas.length > 0 ? (
              topWilayas.map(([wilayaName, count], idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-stone-800">{wilayaName}</span>
                    <span className="font-mono text-stone-600">{count} طلبية</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (count / orders.length) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-400">لا توجد بيانات كافية بعد.</p>
            )}
          </div>

          <div className="pt-4 border-t border-stone-200">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span>إجمالي زيارات الموقع (Local Storage):</span>
                <span className="font-mono font-bold text-amber-800">
                  {parseInt(localStorage.getItem('roumaissa_visitor_count') || '18450', 10).toLocaleString('ar-DZ')} زيارة
                </span>
              </div>
              <div className="flex justify-between">
                <span>نسبة تحويل المتجر:</span>
                <span className="font-mono font-bold text-emerald-700">{conversionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>قاعدة العملاء المسجلين:</span>
                <span className="font-mono font-bold text-stone-900">{customers.length} عميل</span>
              </div>
              <div className="flex justify-between">
                <span>الكتب المعروضة:</span>
                <span className="font-mono font-bold text-stone-900">{books.length} إصدار</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
