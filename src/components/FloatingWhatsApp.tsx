import React, { useState } from 'react';
import { MessageCircle, X, Send, ShieldCheck } from 'lucide-react';
import { SocialLinks } from '../types';

interface FloatingWhatsAppProps {
  socialLinks: SocialLinks;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ socialLinks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  if (!socialLinks.showFloatingWhatsApp) return null;

  const quickQuestions = [
    'أرغب في الاستفسار عن خدمة التوصيل لولايتي...',
    'كيف أقوم بشراء كتاب ePub وتحميله مباشرة؟',
    'أود الاستفسار عن نشر عمل أدبي أو ترجمة جديدة...',
    'هل تتوفر تخفيضات على الطلبيات الكبيرة؟'
  ];

  const handleStartChat = (text: string) => {
    let cleanPhone = socialLinks.whatsappNumber.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '213' + cleanPhone.substring(1);
    }
    const encoded = encodeURIComponent(text || socialLinks.whatsappDefaultMsg);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 text-right">
      {/* Expanded Popup Chat Box */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-92 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold font-editorial text-base border border-white/30">
                ر
              </div>
              <div>
                <h4 className="font-bold text-sm">خدمة عملاء دار رميسة</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                  <span>متاحون الآن لمساعدتكم</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-100 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-stone-50 space-y-3 max-h-72 overflow-y-auto text-xs">
            {/* Agent Greeting */}
            <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs space-y-1">
              <span className="font-bold text-stone-900 block text-xs">
                مرحباً بك في دار النشر رميسة إيديسيو!
              </span>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                يسعدنا الإجابة عن كافة استفساراتكم حول الكتب الورقية، تحميل الكتب الإلكترونية ePub، وخدمات التوصيل لكافة الولايات.
              </p>
            </div>

            {/* Quick Questions Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-stone-400 font-bold block">
                أسئلة شائعة بنقرة واحدة:
              </span>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStartChat(q)}
                  className="w-full text-right p-2 rounded-lg bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 text-[11px] font-medium border border-emerald-200/60 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Input Footer */}
          <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
            <input
              type="text"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleStartChat(customMsg);
              }}
              placeholder="اكتب رسالتك للدار هنا..."
              className="flex-1 text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <button
              onClick={() => handleStartChat(customMsg)}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors shrink-0"
              title="إرسال عبر واتساب"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group relative"
        title="تواصل معنا عبر واتساب"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-stone-950">
          1
        </span>
      </button>
    </div>
  );
};
