import React from 'react';
import { CheckCircle2, Download, BookOpen, Printer, X, Truck, ShieldCheck } from 'lucide-react';
import { Order, Book } from '../types';
import { EpubService } from '../services/epubService';
import { StorageService } from '../services/storage';

interface OrderConfirmationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReader: (book: Book) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose,
  onOpenReader
}) => {
  if (!isOpen || !order) return null;

  const books = StorageService.getBooks();
  const epubItems = order.items.filter(i => i.format === 'epub');
  const printItems = order.items.filter(i => i.format === 'print');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadEpub = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      EpubService.downloadEpubFile(book, order.customerName, order.orderNumber);
    }
  };

  const handleOpenReaderForBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      onOpenReader(book);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        id="printable-area"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden text-right flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
            دار رميسة للنشر والترجمة والتوزيع
          </span>
          <h2 className="font-editorial text-2xl font-bold mt-1">
            تم استلام وتأكيد طلبيتكم بنجاح!
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            رقم الطلبية المرجعي:{' '}
            <span className="font-mono font-bold text-amber-300 tracking-wider">
              {order.orderNumber}
            </span>
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Digital ePub Downloads Section (if any) */}
          {epubItems.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>الكتب الرقمية ePub المشتراة جاهزة للتحميل والقراءة:</span>
                </span>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-mono font-bold">
                  ترخيص مدفوع
                </span>
              </div>

              <div className="space-y-2">
                {epubItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-lg border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-right"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">
                        {item.title}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {item.author} · بصيغة ePub
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleDownloadEpub(item.bookId)}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تحميل ملف .epub</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenReaderForBook(item.bookId)}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-stone-300"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>قراءة في المتصفح</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Physical Delivery Note (if any) */}
          {printItems.length > 0 && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-700 flex items-start gap-3">
              <Truck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">
                  النسخ الورقية المطبوعة قيد التجهيز والتسليم
                </h4>
                <p className="leading-relaxed">
                  سيقوم مندوب التوصيل بالاتصال بكم على الرقم{' '}
                  <strong className="font-mono font-bold text-stone-900">{order.phone}</strong>{' '}
                  قبل الوصول إلى{' '}
                  <strong className="text-stone-900">{order.wilayaName} ({order.commune})</strong>.
                  مدة التوصيل المعتادة هي 24 إلى 48 ساعة.
                </p>
              </div>
            </div>
          )}

          {/* Order Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs border border-stone-200 rounded-xl p-4 bg-white">
            <div>
              <span className="text-stone-500 block mb-1">الزبون:</span>
              <span className="font-bold text-stone-900 text-sm">{order.customerName}</span>
              <span className="text-stone-600 block font-mono mt-0.5">{order.phone}</span>
            </div>

            <div>
              <span className="text-stone-500 block mb-1">طريقة الدفع:</span>
              <span className="font-bold text-stone-900">
                {order.paymentMethod === 'chargily'
                  ? 'دفع إلكتروني شارجلي باي (تم السداد بنجاح)'
                  : 'الدفع نقداً عند استلام الطرد (COD)'}
              </span>
            </div>

            <div className="col-span-2 pt-2 border-t border-stone-100">
              <span className="text-stone-500 block mb-1">عنوان التسليم:</span>
              <span className="font-medium text-stone-900">
                {order.wilayaName} - {order.commune} ({order.address})
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <h4 className="font-bold text-sm text-stone-900 mb-2">
              تفاصيل العناصر:
            </h4>
            <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-right">
                <thead className="bg-stone-100 text-stone-600 border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">الكتاب</th>
                    <th className="py-2.5 px-3">النوع</th>
                    <th className="py-2.5 px-3 text-center">الكمية</th>
                    <th className="py-2.5 px-3 text-left">السعر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2.5 px-3 font-medium text-stone-900">{item.title}</td>
                      <td className="py-2.5 px-3 text-stone-600">
                        {item.format === 'epub' ? 'ePub رقمي' : 'ورقي فاخر'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-left font-mono tabular-nums font-bold">
                        {(item.price * item.quantity).toLocaleString('ar-DZ')} دج
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bg-stone-50 p-3 border-t border-stone-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span className="font-mono font-bold">{order.subtotal.toLocaleString('ar-DZ')} دج</span>
                </div>
                <div className="flex justify-between">
                  <span>رسوم التوصيل:</span>
                  <span className="font-mono font-bold">
                    {order.shippingCost === 0 ? 'مجاني' : `${order.shippingCost.toLocaleString('ar-DZ')} دج`}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-950">
                  <span>المبلغ الإجمالي:</span>
                  <span className="font-mono text-base text-amber-800">
                    {order.totalAmount.toLocaleString('ar-DZ')} دج
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-200">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-stone-300"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة / الوصل</span>
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              العودة للمتجر
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
