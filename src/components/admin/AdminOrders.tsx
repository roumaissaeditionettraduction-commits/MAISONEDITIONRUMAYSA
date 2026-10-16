import React, { useState } from 'react';
import { ShoppingBag, Search, Printer, CheckCircle, Clock, Truck, XCircle, Eye } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { StorageService } from '../../services/storage';

interface AdminOrdersProps {
  orders: Order[];
  onRefresh: () => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.includes(searchTerm) || o.customerName.includes(searchTerm) || o.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    StorageService.updateOrderStatus(orderId, newStatus);
    onRefresh();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, orderStatus: newStatus } : null);
    }
  };

  const handlePrintSlip = (order: Order) => {
    setSelectedOrder(order);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            إدارة الطلبيات والمبيعات
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            متابعة الشحنات عبر 58 ولاية، تأكيد الدفعات وطباعة بوالص الشحن (Bordereau)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-stone-100 text-stone-800 px-3 py-1.5 rounded-lg border border-stone-300 font-bold">
            إجمالي الطلبيات: {orders.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث برقم الطلبية، اسم الزبون، أو رقم الهاتف..."
            className="w-full text-xs p-2.5 pr-8 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600 font-mono"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-2.5 top-3" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-52 text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600 bg-white"
        >
          <option value="all">كافة الحالات</option>
          <option value="new">طلبات جديدة</option>
          <option value="confirmed">طلبات مؤكدة</option>
          <option value="shipping">قيد الشحن والتوصيل</option>
          <option value="delivered">تم التسليم</option>
          <option value="cancelled">ملغاة</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-right">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
              <tr>
                <th className="py-3 px-4">رقم الطلب والتاريخ</th>
                <th className="py-3 px-4">الزبون والهاتف</th>
                <th className="py-3 px-4">الولاية والعنوان</th>
                <th className="py-3 px-4">الكتب المطلوبة</th>
                <th className="py-3 px-4">المبلغ الإجمالي</th>
                <th className="py-3 px-4">طريقة الدفع</th>
                <th className="py-3 px-4">حالة الطلبية</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-stone-900">{order.orderNumber}</div>
                    <div className="text-[10px] text-stone-400 font-mono">
                      {new Date(order.createdAt).toLocaleDateString('ar-DZ')}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-stone-900">{order.customerName}</div>
                    <div className="font-mono text-stone-600 text-[11px]">{order.phone}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-stone-900">{order.wilayaName}</div>
                    <div className="text-[11px] text-stone-500 truncate max-w-[160px]">
                      {order.commune} - {order.address}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-stone-700">
                          <span className={`w-1.5 h-1.5 rounded-full ${it.format === 'epub' ? 'bg-amber-600' : 'bg-stone-900'}`} />
                          <span className="truncate max-w-[180px]">{it.title}</span>
                          <span className="font-mono text-stone-400">({it.quantity})</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-stone-900 tabular-nums">
                    {order.totalAmount.toLocaleString('ar-DZ')} دج
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      order.paymentMethod === 'chargily'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      {order.paymentMethod === 'chargily' ? 'شارجلي باي' : 'الدفع عند الاستلام'}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                      className="text-xs p-1 rounded-lg border border-stone-300 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-600 bg-white"
                    >
                      <option value="new">جديد</option>
                      <option value="confirmed">مؤكد</option>
                      <option value="shipping">قيد الشحن</option>
                      <option value="delivered">تم التسليم</option>
                      <option value="cancelled">ملغى</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-colors"
                        title="تفاصيل الطلب"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrintSlip(order)}
                        className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors"
                        title="طباعة بوليصة الشحن (Bordereau)"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal / Print Slip */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            id="printable-area"
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 text-right max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-amber-800">
                  دار النشر رميسة إيديسيو
                </span>
                <h3 className="font-editorial text-xl font-bold text-stone-900">
                  بوليصة الشحن والفاتورة: {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <span className="text-stone-500 block">المرسل:</span>
                  <strong className="text-stone-900">دار رميسة للنشر والترجمة والتوزيع</strong>
                  <span className="block text-stone-600 mt-0.5">الجزائر العاصمة - هاتف: 0550123456</span>
                </div>
                <div>
                  <span className="text-stone-500 block">المرسل إليه:</span>
                  <strong className="text-stone-900">{selectedOrder.customerName}</strong>
                  <span className="block text-stone-600 mt-0.5 font-mono">{selectedOrder.phone}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-stone-200">
                  <span className="text-stone-500 block">العنوان الدقيق والولاية:</span>
                  <strong className="text-stone-900">
                    {selectedOrder.wilayaName} - {selectedOrder.commune} ({selectedOrder.address})
                  </strong>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-2">محتويات الطرد:</h4>
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-right">
                    <thead className="bg-stone-100 text-stone-600">
                      <tr>
                        <th className="py-2 px-3">العنوان</th>
                        <th className="py-2 px-3">الصيغة</th>
                        <th className="py-2 px-3 text-center">الكمية</th>
                        <th className="py-2 px-3 text-left">السعر</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {selectedOrder.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-medium text-stone-900">{it.title}</td>
                          <td className="py-2 px-3 text-stone-500">{it.format === 'epub' ? 'ePub رقمي' : 'ورقي'}</td>
                          <td className="py-2 px-3 text-center font-mono">{it.quantity}</td>
                          <td className="py-2 px-3 text-left font-mono">{(it.price * it.quantity).toLocaleString('ar-DZ')} دج</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-between font-bold text-sm">
                    <span>المبلغ الواجب تحصيله:</span>
                    <span className="font-mono text-base text-amber-800">{selectedOrder.totalAmount.toLocaleString('ar-DZ')} دج</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>طباعة بوليصة التوصيل فورا</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-bold hover:bg-stone-50"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
