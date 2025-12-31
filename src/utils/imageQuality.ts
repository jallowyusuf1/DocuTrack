/**
 * Image Quality Assessment Utilities
 * Evaluates image quality before OCR processing
 */

export interface QualityAssessment {
  score: number; // 0-100
  quality: 'poor' | 'fair' | 'good';
  issues: string[];
}

/**
 * Apply Laplacian operator for blur detection
 */
function applyLaplacian(imageData: ImageData): number[] {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const laplacian: number[] = [];
  
  const kernel = [
    0, -1, 0,
    -1, 4, -1,
    0, -1, 0
  ];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          sum += gray * kernel[kernelIdx];
        }
      }
      
      laplacian.push(Math.abs(sum));
    }
  }
  
  return laplacian;
}

/**
 * Calculate variance of values
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  
  return variance;
}

/**
 * Detect blur using Laplacian variance method
 */
export async function detectBlur(file: File): Promise<{ quality: 'poor' | 'fair' | 'good'; score: number; reason: string }> {
  try {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return { quality: 'poor', score: 0, reason: 'Failed to get canvas context' };
    }

    return new Promise((resolve) => {
      img.onload = () => {
        // Limit processing size for performance
        const maxSize = 1024;
        let width = img.width;
        let height = img.height;
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        const imageData = ctx.getImageData(0, 0, width, height);
        const laplacian = applyLaplacian(imageData);
        const variance = calculateVariance(laplacian);
        
        if (variance < 100) {
          resolve({ quality: 'poor', score: 30, reason: 'Image is too blurry' });
        } else if (variance < 300) {
          resolve({ quality: 'fair', score: 60, reason: 'Slight blur detected' });
        } else {
          resolve({ quality: 'good', score: 95, reason: 'Clear image' });
        }
      };
      
      img.onerror = () => {
        resolve({ quality: 'poor', score: 0, reason: 'Failed to load image' });
      };
      
      img.src = URL.createObjectURL(file);
    });
  } catch (error) {
    console.error('Blur detection failed:', error);
    return { quality: 'poor', score: 0, reason: 'Blur detection failed' };
  }
}

/**
 * Check image brightness
 */
export async function checkBrightness(file: File): Promise<{ quality: 'poor' | 'fair' | 'good'; score: number; reason?: string }> {
  try {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return { quality: 'poor', score: 0, reason: 'Failed to get canvas context' };
    }

    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let sum = 0;
        
        // Sample pixels (every 10th pixel for performance)
        for (let i = 0; i < data.length; i += 40) {
          sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        
        const avg = sum / (data.length / 40);
        
        if (avg < 50) {
          resolve({ quality: 'poor', score: 40, reason: 'Too dark' });
        } else if (avg > 220) {
          resolve({ quality: 'poor', score: 40, reason: 'Too bright/overexposed' });
        } else {
          resolve({ quality: 'good', score: 90 });
        }
      };
      
      img.onerror = () => {
        resolve({ quality: 'poor', score: 0, reason: 'Failed to load image' });
      };
      
      img.src = URL.createObjectURL(file);
    });
  } catch (error) {
    console.error('Brightness check failed:', error);
    return { quality: 'fair', score: 50, reason: 'Brightness check failed' };
  }
}

/**
 * Check image resolution
 */
export async function checkResolution(file: File): Promise<{ quality: 'poor' | 'fair' | 'good'; score: number; reason?: string }> {
  try {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        const pixels = img.width * img.height;
        
        if (pixels < 300000) { // < 0.3 megapixels
          resolve({ quality: 'poor', score: 30, reason: 'Resolution too low' });
        } else if (pixels < 1000000) { // < 1 megapixel
          resolve({ quality: 'fair', score: 70, reason: 'Acceptable resolution' });
        } else {
          resolve({ quality: 'good', score: 95 });
        }
      };
      
      img.onerror = () => {
        resolve({ quality: 'poor', score: 0, reason: 'Failed to load image' });
      };
      
      img.src = URL.createObjectURL(file);
    });
  } catch (error) {
    console.error('Resolution check failed:', error);
    return { quality: 'fair', score: 50, reason: 'Resolution check failed' };
  }
}

/**
 * Comprehensive image quality assessment
 */
export async function assessImageQuality(file: File): Promise<QualityAssessment> {
  const issues: string[] = [];
  let totalScore = 0;
  let assessmentCount = 0;

  // Check blur
  const blurAssessment = await detectBlur(file);
  totalScore += blurAssessment.score;
  assessmentCount++;
  if (blurAssessment.quality !== 'good') {
    issues.push(`Blur: ${blurAssessment.reason}`);
  }

  // Check brightness
  const brightnessAssessment = await checkBrightness(file);
  totalScore += brightnessAssessment.score;
  assessmentCount++;
  if (brightnessAssessment.quality !== 'good') {
    issues.push(`Brightness: ${brightnessAssessment.reason || 'Issue detected'}`);
  }

  // Check resolution
  const resolutionAssessment = await checkResolution(file);
  totalScore += resolutionAssessment.score;
  assessmentCount++;
  if (resolutionAssessment.quality !== 'good') {
    issues.push(`Resolution: ${resolutionAssessment.reason || 'Issue detected'}`);
  }

  const averageScore = Math.round(totalScore / assessmentCount);

  let quality: 'poor' | 'fair' | 'good';
  if (averageScore >= 80) {
    quality = 'good';
  } else if (averageScore >= 50) {
    quality = 'fair';
  } else {
    quality = 'poor';
  }

  return {
    score: averageScore,
    quality,
    issues,
  };
}
