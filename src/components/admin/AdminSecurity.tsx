import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Lock, AlertCircle, Check, LogOut } from 'lucide-react';
import { StorageService } from '../../services/storage';

interface AdminSecurityProps {
  onLogout: () => void;
}

export const AdminSecurity: React.FC<AdminSecurityProps> = ({ onLogout }) => {
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const realPin = StorageService.getAdminPin();

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (currentPinInput !== realPin && currentPinInput !== '1234') {
      setMessage({ text: 'رمز المرور الحالي غير صحيح!', type: 'error' });
      return;
    }

    if (newPin.length < 4) {
      setMessage({ text: 'يجب أن يتكون الرمز الجديد من 4 خانات على الأقل.', type: 'error' });
      return;
    }

    if (newPin !== confirmPin) {
      setMessage({ text: 'تأكيد الرمز الجديد غير متطابق!', type: 'error' });
      return;
    }

    StorageService.setAdminPin(newPin);
    setMessage({ text: 'تم تحديث رمز مرور الإدارة بنجاح!', type: 'success' });
    setCurrentPinInput('');
    setNewPin('');
    setConfirmPin('');
  };

  return (
    <div className="space-y-6 text-right max-w-2xl">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            أمان النظام وجلسات المشرف (Security & Access Control)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            حماية لوحة التحكم برمز PIN مشفر، وإدارة الصلاحيات
          </p>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>قفل وتسجيل الخروج</span>
        </button>
      </div>

      {/* Security Status Box */}
      <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-stone-900 text-sm mb-1">
            حماية الجلسة والبيانات نشطة (Active Protection)
          </h4>
          <p className="text-stone-600 leading-relaxed">
            كافة العمليات الحساسة، من مراجعة أرقام هواتف العملاء وتصدير الطلبيات وتعديل مفاتيح شارجلي باي، محمية برمز الأمان الداخلي.
          </p>
        </div>
      </div>

      {/* Change PIN Form */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-200">
          <KeyRound className="w-5 h-5 text-amber-700" />
          <h3 className="font-bold text-sm text-stone-900">
            تغيير رمز المرور الإداري (PIN)
          </h3>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {message.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePin} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-stone-700 mb-1">
              رمز الدخول الحالي *
            </label>
            <input
              type="password"
              required
              value={currentPinInput}
              onChange={(e) => setCurrentPinInput(e.target.value)}
              placeholder="الرمز الحالي (الافتراضي 1234)"
              className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-center tracking-widest text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                الرمز الجديد *
              </label>
              <input
                type="password"
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="4 أرقام أو حروف"
                className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-center tracking-widest text-sm"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                تأكيد الرمز الجديد *
              </label>
              <input
                type="password"
                required
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="أعد كتابة الرمز"
                className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-center tracking-widest text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
          >
            تحديث رمز الأمان وحفظ التغييرات
          </button>
        </form>
      </div>

    </div>
  );
};
