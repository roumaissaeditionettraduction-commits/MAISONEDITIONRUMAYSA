import React from 'react';
import { Play, Clock, Eye, Video, Film } from 'lucide-react';
import { VideoItem } from '../types';

interface VideosSectionProps {
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
}

export const VideosSection: React.FC<VideosSectionProps> = ({
  videos,
  onSelectVideo
}) => {
  return (
    <section id="videos-section" className="bg-stone-900 text-stone-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-6 border-b border-stone-800 mb-8 text-right">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-400 tracking-wider">
              القناة الثقافية والمرئية لدار رميسة
            </span>
            <h2 className="font-editorial text-3xl font-bold text-white">
              ندوات توقيع الكتب، حوارات المؤلفين ووثائقيات النشر
            </h2>
          </div>

          <p className="text-xs text-stone-400 max-w-md text-right">
            محتوى مصور يوثق فعاليات الدار، لقاءات الكُتّاب وجلسات مناقشة أسرار الرواية وصناعة الكتاب في الجزائر.
          </p>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => onSelectVideo(vid)}
              className="group cursor-pointer bg-stone-800/80 rounded-2xl border border-stone-700/80 overflow-hidden hover:border-amber-500/50 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between text-right"
            >
              {/* Video Thumbnail with Play Button */}
              <div className="relative aspect-video w-full bg-stone-950 flex items-center justify-center overflow-hidden">
                <img
                  src={vid.customThumbnail || `https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to elegant CSS gradient if YouTube thumbnail is restricted
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

                {/* Duration Badge */}
                <div className="absolute bottom-3 left-3 bg-stone-950/90 text-amber-300 text-[11px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-stone-700">
                  <Clock className="w-3 h-3" />
                  <span>{vid.duration}</span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 right-3 bg-stone-900/90 text-stone-200 text-[10px] font-bold px-2 py-0.5 rounded border border-stone-700">
                  {vid.category}
                </div>

                {/* Big Center Play Icon */}
                <div className="w-12 h-12 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-amber-400 transition-all z-10">
                  <Play className="w-6 h-6 fill-stone-950 ml-0.5" />
                </div>
              </div>

              {/* Video Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                    <span className="font-bold text-amber-400">{vid.presenter}</span>
                    <span className="font-mono">{vid.publishDate}</span>
                  </div>

                  <h3 className="font-editorial text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
                    {vid.title}
                  </h3>

                  <p className="text-xs text-stone-400 line-clamp-2 mt-2 leading-relaxed">
                    {vid.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-700/60 flex items-center justify-between text-xs text-stone-400">
                  <span className="font-mono text-[11px] flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{vid.views} مشاهدة</span>
                  </span>
                  <span className="text-amber-400 font-bold group-hover:underline">
                    مشاهدة الفيديو ←
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
