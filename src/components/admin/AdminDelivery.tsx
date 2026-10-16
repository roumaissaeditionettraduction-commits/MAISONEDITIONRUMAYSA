import React, { useState } from 'react';
import { Truck, Check, Search, Save, Settings } from 'lucide-react';
import { Wilaya, StoreSettings } from '../../types';
import { StorageService } from '../../services/storage';

interface AdminDeliveryProps {
  wilayas: Wilaya[];
  storeSettings: StoreSettings;
  onRefresh: () => void;
}

export const AdminDelivery: React.FC<AdminDeliveryProps> = ({
  wilayas,
  storeSettings,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [freeThreshold, setFreeThreshold] = useState(storeSettings.freeShippingThreshold);
  const [localWilayas, setLocalWilayas] = useState<Wilaya[]>(wilayas);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const filteredWilayas = localWilayas.filter(w =>
    w.nameAr.includes(searchTerm) || w.nameFr.toLowerCase().includes(searchTerm.toLowerCase()) || w.code.includes(searchTerm)
  );

  const handleUpdateFee = (id: number, field: 'homeDeliveryFee' | 'deskDeliveryFee', value: number) => {
    setLocalWilayas(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const handleToggleAvailable = (id: number) => {
    setLocalWilayas(prev => prev.map(w => w.id === id ? { ...w, isAvailable: !w.isAvailable } : w));
  };

  const handleSaveAll = () => {
    StorageService.saveWilayas(localWilayas);
    StorageService.saveStoreSettings({
      ...storeSettings,
      freeShippingThreshold: freeThreshold
    });
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
            إعدادات التوصيل والشحن (58 ولاية جزائرية)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            ضبط أسعار التوصيل لباب المنزل ونقاط الاستلام Stop Desk لشركات الشحن (ياليدين، زر إكسبريس...)
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
        >
          <Save className="w-4 h-4 text-amber-400" />
          <span>{savedSuccess ? 'تم حفظ التعديلات بنجاح ✓' : 'حفظ كافة إعدادات التوصيل'}</span>
        </button>
      </div>

      {/* Free Delivery Threshold Box */}
      <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-stone-900">
              ميزة الشحن المجاني التلقائي:
            </h4>
            <p className="text-xs text-stone-600">
              يصبح التوصيل مجانياً بالكامل إذا تجاوزت سلة الكتب الورقية هذا المبلغ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-stone-800">
            الحد الأدنى للشحن المجاني (دج):
          </label>
          <input
            type="number"
            value={freeThreshold}
            onChange={(e) => setFreeThreshold(Number(e.target.value))}
            className="w-32 p-2 bg-white rounded-lg border border-amber-300 font-mono text-center font-bold text-sm"
          />
        </div>
      </div>

      {/* Search Wilaya */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالولاية (مثال: الجزائر، وهران، قسنطينة، 16...)"
            className="w-full text-xs p-2.5 pr-8 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-2.5 top-3" />
        </div>
      </div>

      {/* Wilayas Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-right">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
              <tr>
                <th className="py-3 px-4">الرمز</th>
                <th className="py-3 px-4">اسم الولاية (العربية / الفرنسية)</th>
                <th className="py-3 px-4">سعر التوصيل للمنزل (دج)</th>
                <th className="py-3 px-4">سعر الاستلام من المكتب Stop Desk (دج)</th>
                <th className="py-3 px-4 text-center">حالة التوصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredWilayas.map((wilaya) => (
                <tr key={wilaya.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-stone-900">
                    {wilaya.code}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-stone-900 text-sm ml-2">
                      {wilaya.nameAr}
                    </span>
                    <span className="text-stone-400 font-mono text-[11px]">
                      ({wilaya.nameFr})
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={wilaya.homeDeliveryFee}
                      onChange={(e) => handleUpdateFee(wilaya.id, 'homeDeliveryFee', Number(e.target.value))}
                      className="w-28 p-1.5 rounded-lg border border-stone-300 font-mono text-center font-bold text-stone-900 focus:ring-1 focus:ring-amber-600"
                    />
                  </td>

                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={wilaya.deskDeliveryFee}
                      onChange={(e) => handleUpdateFee(wilaya.id, 'deskDeliveryFee', Number(e.target.value))}
                      className="w-28 p-1.5 rounded-lg border border-stone-300 font-mono text-center font-bold text-stone-900 focus:ring-1 focus:ring-amber-600"
                    />
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleAvailable(wilaya.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${
                        wilaya.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {wilaya.isAvailable ? 'متاح للشحن ✓' : 'معطل مؤقتاً'}
                    </button>
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
