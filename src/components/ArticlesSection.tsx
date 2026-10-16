import React from 'react';
import { BookOpen, Clock, Calendar, Lock, ArrowLeft, Eye } from 'lucide-react';
import { Article } from '../types';

interface ArticlesSectionProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const ArticlesSection: React.FC<ArticlesSectionProps> = ({
  articles,
  onSelectArticle
}) => {
  return (
    <section id="articles-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-stone-200">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-6 border-b border-stone-200 mb-8">
        <div className="space-y-1 text-right">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-800 tracking-wider">
              المجلة الثقافية والمقالات النقدية
            </span>
            <span className="text-[10px] bg-stone-200 text-stone-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Lock className="w-3 h-3 text-stone-600" />
              <span>نصوص محمية ضد النسخ</span>
            </span>
          </div>
          <h2 className="font-editorial text-3xl font-bold text-stone-950">
            أقلام الفكر ونوافذ الترجمة لدار رميسة
          </h2>
        </div>

        <p className="text-xs text-stone-500 max-w-md text-right">
          أطروحات نقدية وحوارات مع نخبة المترجمين والروائيين الجزائريين والعرب، تُنشر حصرياً ضمن منشورات الدار.
        </p>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((art) => (
          <article
            key={art.id}
            onClick={() => onSelectArticle(art)}
            className="group cursor-pointer bg-white rounded-2xl border border-stone-200 p-5 hover:border-amber-700/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between text-right"
          >
            <div>
              {/* Optional Cover Banner */}
              {art.coverImage && (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-4 border border-stone-100 bg-stone-100">
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent" />
                </div>
              )}

              {/* Header Badge Strip */}
              <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
                <span className="font-bold text-amber-900">{art.category}</span>
                <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                  <Clock className="w-3 h-3" />
                  <span>{art.readTime}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-editorial text-xl font-bold text-stone-900 group-hover:text-amber-900 transition-colors leading-snug mb-3">
                {art.title}
              </h3>

              {/* Excerpt */}
              <p className="text-xs text-stone-600 leading-relaxed line-clamp-3 mb-4">
                {art.excerpt}
              </p>
            </div>

            {/* Footer with Author & Protection Badge */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-400 font-editorial font-bold flex items-center justify-center text-xs">
                  ر
                </div>
                <div>
                  <span className="font-bold text-xs text-stone-900 block">
                    {art.author}
                  </span>
                  <span className="text-[10px] text-stone-400 block -mt-0.5">
                    {art.publishDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-amber-800 group-hover:translate-x-1 transition-transform">
                <span>قراءة المقال</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
