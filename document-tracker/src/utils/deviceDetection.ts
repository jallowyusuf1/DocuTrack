/**
 * Detect if device is mobile or tablet
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Check for mobile devices
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isMobile = mobileRegex.test(userAgent);
  
  // Check for tablet (iPad, Android tablets)
  const tabletRegex = /ipad|android(?!.*mobile)/i;
  const isTablet = tabletRegex.test(userAgent);
  
  // Check screen width (fallback)
  const isSmallScreen = window.innerWidth < 768;
  
  return isMobile || isTablet || isSmallScreen;
}

/**
 * Detect if device is desktop
 */
export function isDesktopDevice(): boolean {
  return !isMobileDevice();
}
