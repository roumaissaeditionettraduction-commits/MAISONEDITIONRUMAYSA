import React, { useState } from 'react';
import { X, Play, ShieldCheck, Share2, Eye, Clock, Calendar } from 'lucide-react';
import { VideoItem } from '../types';

interface VideoPlayerModalProps {
  video: VideoItem | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose
}) => {
  if (!video) return null;

  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl bg-stone-900 text-white rounded-2xl shadow-2xl border border-stone-800 overflow-hidden text-right flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-bold">
              {video.category}
            </span>
            <button
              onClick={handleShare}
              className="px-3 py-1 bg-stone-800 hover:bg-stone-700 rounded-lg text-xs flex items-center gap-1.5 text-stone-300 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'تم النسخ!' : 'مشاركة'}</span>
            </button>
          </div>
        </div>

        {/* Responsive Video Container (Protected from drag & context menu) */}
        <div className="relative aspect-video w-full bg-black select-none" onContextMenu={(e) => e.preventDefault()}>
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Video Info */}
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400 border-b border-stone-800 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-bold">{video.presenter}</span>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{video.duration}</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1 font-mono">
                <Eye className="w-3.5 h-3.5" />
                <span>{video.views} مشاهدة</span>
              </div>
            </div>
            <span className="font-mono">{video.publishDate}</span>
          </div>

          <h2 className="font-editorial text-xl sm:text-2xl font-bold leading-snug text-white">
            {video.title}
          </h2>

          <p className="text-sm text-stone-300 leading-relaxed">
            {video.description}
          </p>

          <div className="pt-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-800">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>محتوى مرئي خاص بدار النشر رميسة إيديسيو - محمي بموجب قوانين الملكية الفكرية</span>
            </div>
            <span className="font-mono text-[10px]">Roumaissa Media Channel</span>
          </div>
        </div>
      </div>
    </div>
  );
};
