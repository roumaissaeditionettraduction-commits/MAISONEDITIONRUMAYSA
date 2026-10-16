import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Video, Play, Check, X, Search, Clock, Camera, Upload, Image as ImageIcon } from 'lucide-react';
import { VideoItem } from '../../types';
import { StorageService } from '../../services/storage';
import { processImageFile, formatFileSize, ProcessedImage } from '../../utils/imageProcessor';

interface AdminVideosProps {
  videos: VideoItem[];
  onRefresh: () => void;
}

export const AdminVideos: React.FC<AdminVideosProps> = ({
  videos,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Partial<VideoItem> | null>(null);
  const [isProcessingThumbnail, setIsProcessingThumbnail] = useState(false);
  const [thumbnailStats, setThumbnailStats] = useState<ProcessedImage | null>(null);
  const [thumbnailError, setThumbnailError] = useState('');

  const filtered = videos.filter(v =>
    v.title.includes(searchTerm) || v.presenter.includes(searchTerm) || v.category.includes(searchTerm)
  );

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingThumbnail(true);
    setThumbnailError('');
    try {
      const processed = await processImageFile(file, 1280, 720, 0.85);
      setThumbnailStats(processed);
      setEditingVideo(prev => prev ? { ...prev, customThumbnail: processed.dataUrl } : null);
    } catch (err: any) {
      setThumbnailError(err.message || 'حدث خطأ أثناء معالجة صورة الفيديو');
    } finally {
      setIsProcessingThumbnail(false);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailStats(null);
    setEditingVideo(prev => prev ? { ...prev, customThumbnail: undefined } : null);
  };

  const handleOpenAdd = () => {
    setThumbnailStats(null);
    setThumbnailError('');
    setEditingVideo({
      id: `vid-${Date.now()}`,
      title: '',
      description: '',
      youtubeId: '3JZ_D3ELwOQ',
      duration: '15:00',
      presenter: 'فريق دار رميسة للنشر',
      publishDate: new Date().toLocaleDateString('ar-DZ'),
      views: 1,
      category: 'ندوات ولقاءات',
      isFeatured: false
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (video: VideoItem) => {
    setThumbnailStats(null);
    setThumbnailError('');
    setEditingVideo({ ...video });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
      StorageService.deleteVideo(id);
      onRefresh();
    }
  };

  const extractYouTubeId = (input: string) => {
    // If full URL is pasted, extract ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = input.match(regExp);
    return (match && match[2].length === 11) ? match[2] : input.trim();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo || !editingVideo.title || !editingVideo.youtubeId) return;

    const cleanId = extractYouTubeId(editingVideo.youtubeId);
    const fullVideo = { ...editingVideo, youtubeId: cleanId } as VideoItem;

    const exists = videos.some(v => v.id === fullVideo.id);
    if (exists) {
      StorageService.updateVideo(fullVideo);
    } else {
      StorageService.addVideo(fullVideo);
    }

    setIsEditing(false);
    setEditingVideo(null);
    onRefresh();
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            إدارة الفيديوهات والندوات الثقافية (Media & Videos)
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            نشر وتضمين الفيديوهات وحوارات المؤلفين وتغطيات معارض الكتاب لدار رميسة
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>إضافة فيديو جديد</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث في الفيديوهات بالعنوان، المقدم، أو التصنيف..."
            className="w-full text-xs p-2.5 pr-8 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-2.5 top-3" />
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((vid) => (
          <div
            key={vid.id}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={vid.customThumbnail || `https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                  alt={vid.title}
                  className="w-full h-full object-cover opacity-85"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute bottom-2 left-2 bg-stone-900/90 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded">
                  {vid.duration}
                </div>
                <div className="absolute top-2 right-2 bg-stone-900/90 text-stone-200 text-[10px] px-2 py-0.5 rounded font-bold">
                  {vid.category}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <span className="text-[11px] text-amber-800 font-bold block">
                  {vid.presenter}
                </span>
                <h4 className="font-editorial text-base font-bold text-stone-900 line-clamp-2">
                  {vid.title}
                </h4>
                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                  {vid.description}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="font-mono">{vid.views} مشاهدة</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(vid)}
                  className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-stone-100 rounded-lg"
                  title="تعديل"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(vid.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Add/Edit Modal */}
      {isEditing && editingVideo && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                {editingVideo.title ? 'تعديل الفيديو' : 'إضافة فيديو جديد'}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-stone-400 hover:text-stone-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  عنوان الفيديو *
                </label>
                <input
                  type="text"
                  required
                  value={editingVideo.title || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  placeholder="مثال: ندوة مناقشة رواية رماد الأندلس..."
                  className="w-full p-2.5 rounded-lg border border-stone-300 font-editorial text-sm font-bold"
                />
              </div>

              {/* Custom Thumbnail Upload */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-stone-800 text-xs flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-700" />
                    <span>صورة غلاف مخصصة للفيديو (اختياري - بديلة عن صورة يوتيوب):</span>
                  </label>
                  {editingVideo.customThumbnail && (
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>حذف الصورة</span>
                    </button>
                  )}
                </div>

                {editingVideo.customThumbnail ? (
                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-stone-200">
                    <img
                      src={editingVideo.customThumbnail}
                      alt="معاينة مصغرة الفيديو"
                      className="w-24 h-14 object-cover rounded-md border border-stone-200 shrink-0"
                    />
                    <div className="text-[11px] space-y-1 text-stone-600 flex-1">
                      <div className="font-bold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>تم تحسين وضغط الصورة بنجاح</span>
                      </div>
                      {thumbnailStats && (
                        <p className="text-stone-500 font-mono text-[10px]">
                          الأصل: {formatFileSize(thumbnailStats.originalSize)} ← بعد الضغط: {formatFileSize(thumbnailStats.compressedSize)} (-{thumbnailStats.savingsPercentage}%)
                        </p>
                      )}
                      <label className="text-amber-800 font-bold hover:underline cursor-pointer block">
                        <span>تغيير الصورة</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="border-2 border-dashed border-stone-300 hover:border-amber-600 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors bg-white hover:bg-amber-50/20 text-center">
                      <Upload className="w-4 h-4 text-amber-800" />
                      <span className="text-[11px] font-bold text-stone-800">اضغط لرفع صورة غلاف مخصصة</span>
                      <span className="text-stone-400 text-[10px]">تُضغط تلقائياً لسرعة التصفح (&lt;150 ك.ب)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        disabled={isProcessingThumbnail}
                        className="hidden"
                      />
                    </label>

                    {isProcessingThumbnail && (
                      <p className="text-xs text-amber-700 animate-pulse mt-1 text-center">
                        جاري معالجة وضغط الصورة...
                      </p>
                    )}

                    {thumbnailError && (
                      <p className="text-xs text-rose-600 font-bold mt-1 text-center">
                        {thumbnailError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1 flex items-center justify-between">
                  <span>رابط الفيديو أو معرف اليوتيوب (YouTube ID) *</span>
                  <span className="font-normal text-stone-400 font-mono">ID or https://youtube.com/watch?v=...</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingVideo.youtubeId || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, youtubeId: e.target.value })}
                  placeholder="e.g. 3JZ_D3ELwOQ"
                  className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-left"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    المتحدث / المقدم
                  </label>
                  <input
                    type="text"
                    value={editingVideo.presenter || ''}
                    onChange={(e) => setEditingVideo({ ...editingVideo, presenter: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    مدة الفيديو
                  </label>
                  <input
                    type="text"
                    value={editingVideo.duration || '15:00'}
                    onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  التصنيف
                </label>
                <input
                  type="text"
                  value={editingVideo.category || 'ندوات ولقاءات'}
                  onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  وصف مختصر لمحتوى الفيديو
                </label>
                <textarea
                  rows={3}
                  value={editingVideo.description || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl hover:bg-stone-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>حفظ ونشر الفيديو</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
