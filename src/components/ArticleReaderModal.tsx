import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Share2, Clock, Calendar, Lock, Check, AlertTriangle, Eye } from 'lucide-react';
import { Article, SocialLinks } from '../types';

interface ArticleReaderModalProps {
  article: Article | null;
  onClose: () => void;
  socialLinks: SocialLinks;
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({
  article,
  onClose,
  socialLinks
}) => {
  if (!article) return null;

  const [copyWarning, setCopyWarning] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const isProtected = article.isCopyProtected && socialLinks.antiCopyGlobalEnabled;

  // Anti-Copy Event Handlers
  useEffect(() => {
    if (!isProtected) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      setCopyWarning('⚠️ محتوى المقال محمي بحقوق الملكية الفكرية لدار رميسة للنشر والترجمة. يمنع نسخ النصوص.');
      setTimeout(() => setCopyWarning(null), 3000);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setCopyWarning('⚠️ النقر بالزر الأيمن معطل لحماية المقال من النسخ غير المصرح به.');
      setTimeout(() => setCopyWarning(null), 2500);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'p' || e.key === 'x')) {
        e.preventDefault();
        setCopyWarning('⚠️ اختصارات النسخ والطباعة معطلة لحماية حقوق الكاتب ودار النشر.');
        setTimeout(() => setCopyWarning(null), 3000);
      }
    };

    window.addEventListener('copy', handleCopy);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProtected]);

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`أنصحك بقراءة مقال "${article.title}" على موقع دار رميسة للنشر:\n${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden text-right flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Anti-Copy Floating Toast Alert */}
        {copyWarning && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 bg-stone-900 text-amber-300 border border-amber-400/40 px-5 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-4 duration-150">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{copyWarning}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Social Share Strip & Copy-Protection Tag */}
          <div className="flex items-center gap-2">
            {isProtected && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>محتوى محمي وغير قابل للنسخ</span>
              </span>
            )}

            <button
              onClick={handleShareWhatsApp}
              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200 text-xs flex items-center gap-1 font-bold"
              title="مشاركة عبر واتساب"
            >
              <span>واتساب</span>
            </button>

            <button
              onClick={handleShareFacebook}
              className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200 text-xs flex items-center gap-1 font-bold"
              title="مشاركة على فيسبوك"
            >
              <span>فيسبوك</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors border border-stone-300 text-xs flex items-center gap-1"
              title="نسخ الرابط"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'تم النسخ!' : 'رابط'}</span>
            </button>
          </div>
        </div>

        {/* Article Body (Protected against text selection if enabled) */}
        <div
          className={`p-6 sm:p-10 overflow-y-auto space-y-6 ${
            isProtected ? 'select-none' : ''
          }`}
          style={isProtected ? { WebkitUserSelect: 'none', userSelect: 'none' } : {}}
        >
          {/* Optional Cover Image */}
          {article.coverImage && (
            <div className="relative aspect-video max-h-80 w-full rounded-2xl overflow-hidden mb-6 border border-stone-200 shadow-sm bg-stone-100">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-2 border-b border-stone-100 pb-5">
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
              <span className="font-bold text-amber-800">{article.category}</span>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{article.publishDate}</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>قراءة {article.readTime}</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1 font-mono">
                <Eye className="w-3.5 h-3.5" />
                <span>{article.views} مشاهدة</span>
              </div>
            </div>

            <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-950 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-stone-900 text-amber-400 font-editorial font-bold flex items-center justify-center text-lg">
                ر
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900">
                  بقلم: {article.author}
                </h4>
                <span className="text-xs text-stone-500">
                  {article.authorRole} · دار رميسة للنشر
                </span>
              </div>
            </div>
          </div>

          {/* Excerpt callout */}
          <div className="p-4 bg-amber-50/50 rounded-xl border-r-4 border-amber-600 font-editorial text-base text-stone-800 italic leading-relaxed">
            "{article.excerpt}"
          </div>

          {/* Article Text Content */}
          <div className="font-editorial text-lg leading-loose text-stone-800 space-y-6">
            {article.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-500">الكلمات المفتاحية:</span>
            {article.tags.map((tag, i) => (
              <span
                key={i}
                className="text-xs bg-stone-100 text-stone-700 px-3 py-1 rounded-lg border border-stone-200"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Copyright Warning Footnote */}
          {isProtected && (
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-500 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>جميع الحقوق الفكرية والنصوص محفوظة لدار النشر رميسة إيديسيو الجزائر © {new Date().getFullYear()}</span>
              </div>
              <span className="font-mono text-[10px] text-amber-800 font-bold">Copy Protection Active</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
