/**
 * Client-side image compression utility before upload to Supabase storage.
 * Enforces the 5MB maximum limit and reduces canvas dimensions for fast mobile uploads.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number; // 5MB = 5 * 1024 * 1024 = 5242880
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1400,
  maxHeight: 1400,
  quality: 0.85,
  maxSizeBytes: 5242880, // 5MB
};

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Validate mime type
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are permitted.");
  }

  // If non-resizable image or SVG, verify size directly
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    if (file.size > opts.maxSizeBytes) {
      throw new Error("Image exceeds 5MB maximum file size limit.");
    }
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image for compression."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaling preserving aspect ratio
        if (width > opts.maxWidth || height > opts.maxHeight) {
          if (width / height > opts.maxWidth / opts.maxHeight) {
            height = Math.round((height * opts.maxWidth) / width);
            width = opts.maxWidth;
          } else {
            width = Math.round((width * opts.maxHeight) / height);
            height = opts.maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Canvas context unavailable."));
        }

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = "image/webp";
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Image compression failed."));
            }

            if (blob.size > opts.maxSizeBytes) {
              // Try higher compression ratio if still over 5MB
              canvas.toBlob(
                (fallbackBlob) => {
                  if (!fallbackBlob || fallbackBlob.size > opts.maxSizeBytes) {
                    return reject(new Error("Compressed image still exceeds 5MB limit."));
                  }
                  const compressedFile = new File([fallbackBlob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                    type: mimeType,
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                },
                mimeType,
                0.6
              );
              return;
            }

            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
              type: mimeType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          mimeType,
          opts.quality
        );
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
