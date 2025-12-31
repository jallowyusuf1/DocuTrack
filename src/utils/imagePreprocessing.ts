/**
 * Image Preprocessing Utilities
 * Enhances image quality before OCR processing
 */

/**
 * Convert File to ImageData for processing
 */
async function fileToImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convert ImageData back to File
 */
function imageDataToFile(imageData: ImageData, filename: string = 'processed.jpg'): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob'));
        return;
      }
      resolve(new File([blob], filename, { type: 'image/jpeg', lastModified: Date.now() }));
    }, 'image/jpeg', 0.95);
  });
}

/**
 * Detect skew angle in image using Hough Transform approximation
 */
function detectSkewAngle(imageData: ImageData): number {
  // Simplified skew detection using horizontal edge detection
  // For production, consider using a library like OpenCV.js
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  let maxAngle = 0;
  let maxScore = 0;
  
  // Test angles from -45 to +45 degrees
  for (let angle = -45; angle <= 45; angle += 1) {
    const radians = (angle * Math.PI) / 180;
    let score = 0;
    
    // Sample horizontal lines and count edge pixels
    for (let y = height * 0.2; y < height * 0.8; y += 10) {
      for (let x = 0; x < width; x++) {
        const adjustedY = Math.round(y + x * Math.tan(radians));
        if (adjustedY >= 0 && adjustedY < height) {
          const idx = (adjustedY * width + x) * 4;
          const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
          
          // Check if it's an edge (high contrast)
          if (x > 0 && x < width - 1) {
            const prevIdx = (adjustedY * width + (x - 1)) * 4;
            const prevGray = data[prevIdx] * 0.299 + data[prevIdx + 1] * 0.587 + data[prevIdx + 2] * 0.114;
            if (Math.abs(gray - prevGray) > 30) {
              score++;
            }
          }
        }
      }
    }
    
    if (score > maxScore) {
      maxScore = score;
      maxAngle = angle;
    }
  }
  
  return maxAngle;
}

/**
 * Rotate image to correct skew
 */
function rotateImage(imageData: ImageData, angle: number): ImageData {
  if (Math.abs(angle) < 0.5) {
    return imageData; // No rotation needed
  }

  const radians = (angle * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  
  const width = imageData.width;
  const height = imageData.height;
  
  // Calculate new dimensions
  const newWidth = Math.ceil(Math.abs(width * cos) + Math.abs(height * sin));
  const newHeight = Math.ceil(Math.abs(width * sin) + Math.abs(height * cos));
  
  const output = new ImageData(newWidth, newHeight);
  const inputData = imageData.data;
  const outputData = output.data;
  
  const centerX = width / 2;
  const centerY = height / 2;
  const newCenterX = newWidth / 2;
  const newCenterY = newHeight / 2;
  
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      // Transform coordinates
      const srcX = Math.round((x - newCenterX) * cos - (y - newCenterY) * sin + centerX);
      const srcY = Math.round((x - newCenterX) * sin + (y - newCenterY) * cos + centerY);
      
      if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (y * newWidth + x) * 4;
        outputData[dstIdx] = inputData[srcIdx];
        outputData[dstIdx + 1] = inputData[srcIdx + 1];
        outputData[dstIdx + 2] = inputData[srcIdx + 2];
        outputData[dstIdx + 3] = inputData[srcIdx + 3];
      } else {
        // Fill with white background
        const dstIdx = (y * newWidth + x) * 4;
        outputData[dstIdx] = 255;
        outputData[dstIdx + 1] = 255;
        outputData[dstIdx + 2] = 255;
        outputData[dstIdx + 3] = 255;
      }
    }
  }
  
  return output;
}

/**
 * Deskew image (straighten tilted images)
 */
export async function deskewImage(file: File): Promise<File> {
  try {
    const imageData = await fileToImageData(file);
    const angle = detectSkewAngle(imageData);
    
    if (Math.abs(angle) > 0.5) {
      const rotated = rotateImage(imageData, -angle);
      return await imageDataToFile(rotated, file.name);
    }
    
    return file;
  } catch (error) {
    console.warn('Deskew failed, using original:', error);
    return file;
  }
}

/**
 * Enhance contrast using CLAHE-like algorithm
 */
function enhanceContrast(imageData: ImageData, factor: number = 1.5): ImageData {
  const data = imageData.data;
  const output = new ImageData(imageData.width, imageData.height);
  const outputData = output.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Apply contrast enhancement
    outputData[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));     // R
    outputData[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128)); // G
    outputData[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128)); // B
    outputData[i + 3] = data[i + 3]; // Alpha
  }
  
  return output;
}

/**
 * Enhance contrast of image
 */
export async function enhanceContrastImage(file: File, factor: number = 1.5): Promise<File> {
  try {
    const imageData = await fileToImageData(file);
    const enhanced = enhanceContrast(imageData, factor);
    return await imageDataToFile(enhanced, file.name);
  } catch (error) {
    console.warn('Contrast enhancement failed, using original:', error);
    return file;
  }
}

/**
 * Binarize image (convert to black and white)
 */
function binarize(imageData: ImageData, threshold: number = 128): ImageData {
  const data = imageData.data;
  const output = new ImageData(imageData.width, imageData.height);
  const outputData = output.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Convert to grayscale
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const value = gray > threshold ? 255 : 0;
    
    outputData[i] = value;     // R
    outputData[i + 1] = value; // G
    outputData[i + 2] = value; // B
    outputData[i + 3] = data[i + 3]; // Alpha
  }
  
  return output;
}

/**
 * Binarize image (black & white conversion)
 */
export async function binarizeImage(file: File, threshold: number = 128): Promise<File> {
  try {
    const imageData = await fileToImageData(file);
    const binarized = binarize(imageData, threshold);
    return await imageDataToFile(binarized, file.name);
  } catch (error) {
    console.warn('Binarization failed, using original:', error);
    return file;
  }
}

/**
 * Apply median filter for denoising
 */
function applyMedianFilter(imageData: ImageData, kernelSize: number = 3): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const output = new ImageData(width, height);
  const outputData = output.data;
  
  const radius = Math.floor(kernelSize / 2);
  const neighbors: number[] = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      neighbors.length = 0;
      
      // Collect neighbors
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const idx = (ny * width + nx) * 4;
            const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
            neighbors.push(gray);
          }
        }
      }
      
      // Sort and get median
      neighbors.sort((a, b) => a - b);
      const median = neighbors[Math.floor(neighbors.length / 2)];
      
      const idx = (y * width + x) * 4;
      outputData[idx] = median;     // R
      outputData[idx + 1] = median; // G
      outputData[idx + 2] = median; // B
      outputData[idx + 3] = data[idx + 3]; // Alpha
    }
  }
  
  return output;
}

/**
 * Denoise image using median filter
 */
export async function denoiseImage(file: File, kernelSize: number = 3): Promise<File> {
  try {
    const imageData = await fileToImageData(file);
    const denoised = applyMedianFilter(imageData, kernelSize);
    return await imageDataToFile(denoised, file.name);
  } catch (error) {
    console.warn('Denoising failed, using original:', error);
    return file;
  }
}

/**
 * Preprocess image with all enhancements
 */
export async function preprocessImage(
  file: File,
  options: {
    deskew?: boolean;
    enhanceContrast?: boolean;
    binarize?: boolean;
    denoise?: boolean;
  } = {}
): Promise<File> {
  const {
    deskew = true,
    enhanceContrast: enhance = true,
    binarize: bin = false,
    denoise = true,
  } = options;

  let processed = file;

  try {
    // Step 1: Deskew
    if (deskew) {
      processed = await deskewImage(processed);
    }

    // Step 2: Denoise (before other operations)
    if (denoise) {
      processed = await denoiseImage(processed);
    }

    // Step 3: Enhance contrast
    if (enhance) {
      processed = await enhanceContrastImage(processed);
    }

    // Step 4: Binarize (if needed - makes OCR faster but may lose information)
    if (bin) {
      processed = await binarizeImage(processed);
    }

    return processed;
  } catch (error) {
    console.error('Image preprocessing failed:', error);
    return file; // Return original on error
  }
}
