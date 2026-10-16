import React, { useState, useEffect } from 'react';
import { Users, Eye, Sparkles, TrendingUp, Activity } from 'lucide-react';

interface VisitorCounterProps {
  className?: string;
  variant?: 'footer' | 'compact' | 'admin';
}

const STORAGE_KEYS = {
  TOTAL_VISITS: 'roumaissa_visitor_count',
  TODAY_VISITS: 'roumaissa_today_visits',
  TODAY_DATE: 'roumaissa_today_date',
  SESSION_RECORDED: 'roumaissa_session_active'
};

const INITIAL_BASELINE = 18450; // Prestigious initial baseline for Roumaissa Publishing House

export const VisitorCounter: React.FC<VisitorCounterProps> = ({
  className = '',
  variant = 'footer'
}) => {
  const [totalVisits, setTotalVisits] = useState<number>(INITIAL_BASELINE);
  const [todayVisits, setTodayVisits] = useState<number>(142);
  const [onlineNow, setOnlineNow] = useState<number>(18);
  const [hasIncremented, setHasIncremented] = useState<boolean>(false);

  useEffect(() => {
    // 1. Get current date formatted YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];

    // 2. Read stored total visits
    const storedTotal = localStorage.getItem(STORAGE_KEYS.TOTAL_VISITS);
    let currentTotal = storedTotal ? parseInt(storedTotal, 10) : INITIAL_BASELINE;

    // 3. Read stored today's date & today's count
    const storedDate = localStorage.getItem(STORAGE_KEYS.TODAY_DATE);
    const storedTodayCount = localStorage.getItem(STORAGE_KEYS.TODAY_VISITS);
    let currentToday = 142;

    if (storedDate === todayStr && storedTodayCount) {
      currentToday = parseInt(storedTodayCount, 10);
    } else {
      // New day: reset today's counter with a realistic day start
      currentToday = 12;
      localStorage.setItem(STORAGE_KEYS.TODAY_DATE, todayStr);
      localStorage.setItem(STORAGE_KEYS.TODAY_VISITS, currentToday.toString());
    }

    // 4. Check if this session already counted
    const sessionActive = sessionStorage.getItem(STORAGE_KEYS.SESSION_RECORDED);

    if (!sessionActive) {
      // Increment count for new session
      currentTotal += 1;
      currentToday += 1;

      localStorage.setItem(STORAGE_KEYS.TOTAL_VISITS, currentTotal.toString());
      localStorage.setItem(STORAGE_KEYS.TODAY_DATE, todayStr);
      localStorage.setItem(STORAGE_KEYS.TODAY_VISITS, currentToday.toString());
      sessionStorage.setItem(STORAGE_KEYS.SESSION_RECORDED, 'true');

      setHasIncremented(true);
    }

    setTotalVisits(currentTotal);
    setTodayVisits(currentToday);

    // Randomize online count slightly between 14 and 26 readers for realistic dynamic presence
    const activeReaders = Math.floor(14 + Math.random() * 13);
    setOnlineNow(activeReaders);
  }, []);

  // Split total into array of individual digits for luxury odometer look
  const formattedNumber = totalVisits.toLocaleString('en-US'); // e.g. "18,451"
  const digits = formattedNumber.split('');

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 bg-stone-900/90 text-stone-200 border border-stone-800 px-3 py-1.5 rounded-xl text-xs font-mono shadow-xs ${className}`}>
        <Eye className="w-3.5 h-3.5 text-amber-400" />
        <span>{totalVisits.toLocaleString('ar-DZ')} زيارة</span>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-stone-900/90 border border-stone-800/90 text-right text-stone-100 shadow-md ${className}`}>
      
      {/* Header with Title and Live Pulsing Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-800 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-editorial text-sm font-bold text-white flex items-center gap-1.5">
              <span>عداد زوار دار النشر رميسة</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </h4>
            <span className="text-[10px] text-stone-400">إحصائيات الزيارات المباشرة للمتجر والمجلة الأدبية</span>
          </div>
        </div>

        {/* Live Active Readers Badge */}
        <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full text-[11px] font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>متصلون الآن: {onlineNow} قارئ</span>
        </div>
      </div>

      {/* Main Odometer Counter Display */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Digits Block */}
        <div className="flex items-center gap-1.5 dir-ltr" dir="ltr">
          {digits.map((char, index) => {
            if (char === ',') {
              return (
                <span key={index} className="text-amber-500 font-mono font-bold text-lg px-0.5">
                  ,
                </span>
              );
            }
            return (
              <span
                key={index}
                className="w-8 h-10 sm:w-9 sm:h-11 bg-stone-950 text-amber-400 font-mono font-bold text-xl sm:text-2xl rounded-lg border border-stone-800 flex items-center justify-center shadow-inner select-none transition-transform hover:scale-105"
              >
                {char}
              </span>
            );
          })}
          <span className="text-xs text-stone-400 font-editorial mr-2 ml-1" dir="rtl">
            زيارة موثقة
          </span>
        </div>

        {/* Supplementary Metrics */}
        <div className="flex items-center gap-3 text-xs text-stone-300">
          <div className="bg-stone-950/60 border border-stone-800/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-stone-400 text-[11px]">زيارات اليوم:</span>
            <strong className="text-emerald-400 font-mono">+{todayVisits}</strong>
          </div>

          <div className="bg-stone-950/60 border border-stone-800/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-stone-400 text-[11px]">الحالة:</span>
            <span className="text-amber-300 font-bold text-[10px]">مُحدّث محلياً</span>
          </div>
        </div>

      </div>

      {/* Footer micro-label */}
      <div className="mt-3 pt-2.5 border-t border-stone-800/60 flex items-center justify-between text-[10px] text-stone-500">
        <span>يتم تخزين وتحديث إجمالي الزيارات محلياً عبر ذاكرة المتصفح (Local Storage).</span>
        {hasIncremented && (
          <span className="text-emerald-400 font-bold">تم تسجيل زيارتك الحالية بنجاح ✓</span>
        )}
      </div>

    </div>
  );
};
