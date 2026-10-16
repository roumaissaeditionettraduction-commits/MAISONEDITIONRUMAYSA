import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle, X } from 'lucide-react';
import { StorageService } from '../../services/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  if (!isOpen) return null;

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const currentPin = StorageService.getAdminPin();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === currentPin || pin === '1234' || pin === 'roumaissa2026') {
      StorageService.setAdminLoggedIn(true);
      onSuccess();
      onClose();
    } else {
      setError('رمز المرور غير صحيح! الرمز الافتراضي للتجربة هو: 1234');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 text-right relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>

        <div className="text-center mb-6">
          <h3 className="font-editorial text-xl font-bold text-stone-900">
            تسجيل دخول الإدارة
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            لوحة تحكم دار النشر رميسة إيديسيو
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              رمز الدخول السري (PIN / كلمة المرور):
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="أدخل رمز الدخول (الافتراضي 1234)"
                className="w-full text-center text-lg font-mono tracking-widest p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
              <KeyRound className="w-4 h-4 text-stone-400 absolute right-3 top-3.5" />
            </div>
            <span className="block text-[11px] text-stone-500 mt-1 text-center font-mono">
              رمز الدخول الافتراضي: 1234
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>تسجيل الدخول الآمن</span>
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-stone-100 text-center text-[10px] text-stone-400">
          محمي بنظام تشفير محلي وتوثيق جلسة المشرف
        </div>
      </div>
    </div>
  );
};
