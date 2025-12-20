/**
 * Compress an image file to optimize for storage and upload
 * @param file - The original image file
 * @param maxWidth - Maximum width in pixels (default: 1920)
 * @param maxHeight - Maximum height in pixels (default: 1920)
 * @param quality - JPEG quality 0-1 (default: 0.85)
 * @returns Compressed image file
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = (height / width) * maxWidth;
            width = maxWidth;
          } else {
            width = (width / height) * maxHeight;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            // Create new file from blob
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Check if image compression is needed based on file size
 * @param file - The image file to check
 * @param maxSizeInMB - Maximum acceptable size in MB (default: 2)
 * @returns true if compression is needed
 */
export function needsCompression(file: File, maxSizeInMB: number = 2): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size > maxSizeInBytes;
}

/**
 * Get human-readable file size
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Rotates an image by specified degrees
 * @param file - Image file to rotate
 * @param degrees - Rotation angle (90, 180, 270)
 * @returns Rotated image file
 */
export async function rotateImage(file: File, degrees: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Swap dimensions for 90 and 270 degree rotations
        if (degrees === 90 || degrees === 270) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        // Apply rotation
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((degrees * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to rotate image'));
              return;
            }

            const rotatedFile = new File(
              [blob],
              file.name,
              {
                type: file.type || 'image/jpeg',
                lastModified: Date.now(),
              }
            );

            resolve(rotatedFile);
          },
          file.type || 'image/jpeg',
          0.95
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Crops an image to specified dimensions
 * @param file - Image file to crop
 * @param cropArea - Crop area coordinates and dimensions
 * @returns Cropped image file
 */
export async function cropImage(
  file: File,
  cropArea: { x: number; y: number; width: number; height: number }
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = cropArea.width;
        canvas.height = cropArea.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw cropped portion
        ctx.drawImage(
          img,
          cropArea.x,
          cropArea.y,
          cropArea.width,
          cropArea.height,
          0,
          0,
          cropArea.width,
          cropArea.height
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to crop image'));
              return;
            }

            const croppedFile = new File(
              [blob],
              file.name,
              {
                type: file.type || 'image/jpeg',
                lastModified: Date.now(),
              }
            );

            resolve(croppedFile);
          },
          file.type || 'image/jpeg',
          0.95
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validates if a file is an image
 * @param file - File to validate
 * @returns true if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}
