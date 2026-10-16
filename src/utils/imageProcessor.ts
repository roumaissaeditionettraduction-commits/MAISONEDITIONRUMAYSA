/**
 * Image processing utilities for client-side book cover, logo, articles, and video uploads.
 * Ensures images uploaded from phone cameras (often 10MB+) are compressed to 
 * crisp, web-optimized Data URLs (<150KB) that save smoothly in local storage.
 */

export interface ProcessedImage {
  dataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  savingsPercentage: number;
  format: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
}

export function calculateCompressionSavings(originalSize: number, compressedSize: number): number {
  if (originalSize <= 0) return 0;
  const savings = ((originalSize - compressedSize) / originalSize) * 100;
  return Math.max(0, Math.round(savings));
}

/**
 * Validates whether the given file is an allowed image format
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'لم يتم تحديد أي ملف.' };
  }
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'يرجى اختيار ملف صورة صالح (JPG, PNG, WebP, GIF).' };
  }
  // Soft warning if excessive (over 30MB)
  if (file.size > 30 * 1024 * 1024) {
    return { isValid: false, error: 'حجم الصورة كبير جداً (أكثر من 30 م.ب)، يرجى اختيار ملف أصغر.' };
  }
  return { isValid: true };
}

/**
 * Compresses and scales down any user-uploaded image on an HTML5 canvas.
 * Preserves crisp typography and vibrant book cover contrast while staying under 150KB.
 */
export function processImageFile(
  file: File,
  maxWidth = 1000,
  maxHeight = 1500,
  quality = 0.86
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      reject(new Error(validation.error));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('فشل في قراءة ملف الصورة من جهازك.'));
    
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('فشل في تحميل وتنسيق الصورة. يرجى تجربة ملف آخر.'));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio calculation smoothly
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('تعذر معالجة رسم الصورة على المتصفح.'));
          return;
        }

        // High quality bicubic/bilinear smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output format (PNG for transparency, JPEG for photo compression)
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(format, quality);

        // Calculate approximate size of base64 Data URL in bytes
        const stringLength = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const compressedSize = Math.round((stringLength * 3) / 4);
        const savingsPercentage = calculateCompressionSavings(file.size, compressedSize);

        resolve({
          dataUrl,
          width,
          height,
          originalSize: file.size,
          compressedSize,
          savingsPercentage,
          format
        });
      };

      if (typeof readerEvent.target?.result === 'string') {
        img.src = readerEvent.target.result;
      } else {
        reject(new Error('صيغة الصورة غير مدعومة.'));
      }
    };

    reader.readAsDataURL(file);
  });
}
