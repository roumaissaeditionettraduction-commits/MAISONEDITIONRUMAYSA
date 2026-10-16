import React from 'react';
import { AlertCircle, MessageCircle, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { AbandonedCart } from '../../types';
import { StorageService } from '../../services/storage';

interface AdminAbandonedCartsProps {
  abandonedCarts: AbandonedCart[];
  onRefresh: () => void;
}

export const AdminAbandonedCarts: React.FC<AdminAbandonedCartsProps> = ({
  abandonedCarts,
  onRefresh
}) => {
  const handleSendWhatsAppReminder = (cart: AbandonedCart) => {
    // Generate Algerian WhatsApp link with pre-filled message
    let cleanPhone = cart.phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '213' + cleanPhone.substring(1);
    }

    const message = encodeURIComponent(
      `مرحباً بك ${cart.customerName}، لاحظنا في دار رميسة للنشر والترجمة أنك تركت سلة مشتريات تحتوي على: "${cart.items.map(i => i.title).join('، ')}". يسعدنا تقديم خصم إضافي خاص وتأكيد توصيلك فورا لباب منزلك! هل ترغب في تأكيد الطلبية الآن؟`
    );

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    StorageService.markAbandonedReminderSent(cart.id);
    onRefresh();
  };

  const handleMarkRecovered = (id: string) => {
    StorageService.markAbandonedCartRecovered(id);
    onRefresh();
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            إدارة السلات المتروكة واسترجاع العملاء
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            متابعة الزوار الذين كتبوا أرقام هواتفهم ولم يكملوا الطلب، وإرسال تذكيرات عبر واتساب
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-rose-50 text-rose-800 px-3 py-1.5 rounded-lg border border-rose-200 font-bold">
            السلات المعلقة: {abandonedCarts.filter(c => !c.recovered).length}
          </span>
        </div>
      </div>

      {/* Abandoned Carts Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-right">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
              <tr>
                <th className="py-3 px-4">الزبون والهاتف</th>
                <th className="py-3 px-4">الولاية</th>
                <th className="py-3 px-4">محتوى السلة المتروكة</th>
                <th className="py-3 px-4">قيمة السلة</th>
                <th className="py-3 px-4">تاريخ الترك</th>
                <th className="py-3 px-4 text-center">حالة التذكير</th>
                <th className="py-3 px-4 text-center">إجراء الاسترجاع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {abandonedCarts.map((cart) => (
                <tr key={cart.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-stone-900">{cart.customerName}</div>
                    <div className="font-mono text-stone-600 font-semibold text-[11px]">{cart.phone}</div>
                  </td>

                  <td className="py-3 px-4 text-stone-700">
                    {cart.wilayaName || 'غير محدد'}
                  </td>

                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      {cart.items.map((it, idx) => (
                        <div key={idx} className="font-medium text-stone-900 line-clamp-1">
                          • {it.title} ({it.format === 'epub' ? 'ePub' : 'ورقي'})
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-rose-800 tabular-nums">
                    {cart.totalAmount.toLocaleString('ar-DZ')} دج
                  </td>

                  <td className="py-3 px-4 text-stone-400 font-mono text-[11px]">
                    {new Date(cart.createdAt).toLocaleDateString('ar-DZ')}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {cart.recovered ? (
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        تم الاسترجاع بنجاح ✓
                      </span>
                    ) : cart.reminderSent ? (
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        أُرسل تذكير واتساب
                      </span>
                    ) : (
                      <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-[10px] font-bold">
                        لم يتم التذكير
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleSendWhatsAppReminder(cart)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                        title="تواصل مباشر عبر واتساب"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>واتساب</span>
                      </button>

                      {!cart.recovered && (
                        <button
                          onClick={() => handleMarkRecovered(cart.id)}
                          className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors border border-stone-300"
                          title="تعيين كمسترجعة"
                        >
                          تم الطلب
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
