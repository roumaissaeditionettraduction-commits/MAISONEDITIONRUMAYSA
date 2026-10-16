import React, { useState } from 'react';
import { Users, Search, Phone, Mail, ShoppingBag } from 'lucide-react';
import { Customer } from '../../types';

interface AdminCustomersProps {
  customers: Customer[];
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({ customers }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customers.filter(c =>
    c.name.includes(searchTerm) || c.phone.includes(searchTerm) || c.wilaya.includes(searchTerm)
  );

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            سجل وقاعدة بيانات العملاء (Customers CRM)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            متابعة القراء والزبائن، إجمالي الإنفاق، وتاريخ تكرار الشراء عبر الولايات
          </p>
        </div>

        <span className="text-xs font-mono bg-stone-100 text-stone-800 px-3.5 py-1.5 rounded-lg border border-stone-300 font-bold">
          {customers.length} عميل مسجل
        </span>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم الزبون، رقم الهاتف، أو الولاية..."
            className="w-full text-xs p-2.5 pr-8 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-2.5 top-3" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-right">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
              <tr>
                <th className="py-3 px-4">اسم الزبون</th>
                <th className="py-3 px-4">رقم الهاتف</th>
                <th className="py-3 px-4">الولاية</th>
                <th className="py-3 px-4">البريد الإلكتروني</th>
                <th className="py-3 px-4 text-center">عدد الطلبيات</th>
                <th className="py-3 px-4">إجمالي الإنفاق</th>
                <th className="py-3 px-4">آخر طلب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-stone-900 text-sm">
                    {c.name}
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold text-stone-700">
                    {c.phone}
                  </td>

                  <td className="py-3 px-4 text-stone-800 font-medium">
                    {c.wilaya}
                  </td>

                  <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                    {c.email || '—'}
                  </td>

                  <td className="py-3 px-4 text-center font-mono">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 font-bold border border-amber-200">
                      {c.ordersCount} طلب
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-emerald-800 tabular-nums">
                    {c.totalSpent.toLocaleString('ar-DZ')} دج
                  </td>

                  <td className="py-3 px-4 font-mono text-stone-400 text-[11px]">
                    {c.lastOrderDate}
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
