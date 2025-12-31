/**
 * OCR Configuration Verification Script
 * Verifies that OCR services are properly configured
 */

import { getOCRConfig, validateOCRConfig } from '../src/config/ocr';

console.log('🔍 Verifying OCR Configuration...\n');

const config = getOCRConfig();
const validation = validateOCRConfig();

console.log('📋 Configuration Status:');
console.log('─'.repeat(50));
console.log(`Microblink API Key: ${config.isMicroblinkEnabled ? '✅ Configured' : '❌ Not configured (optional)'}`);
console.log(`Google Cloud Vision API Key: ${config.isGoogleVisionEnabled ? '✅ Configured' : '❌ Not configured'}`);
console.log(`Tesseract.js: ${config.isTesseractEnabled ? '✅ Available' : '❌ Not available'}`);
console.log('─'.repeat(50));

if (validation.errors.length > 0) {
  console.error('\n❌ Configuration Errors:');
  validation.errors.forEach(error => console.error(`  - ${error}`));
}

if (validation.warnings.length > 0) {
  console.warn('\n⚠️  Configuration Warnings:');
  validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
}

if (validation.isValid) {
  console.log('\n✅ OCR Configuration is valid!');
  console.log('\n📝 OCR Service Availability:');
  console.log('─'.repeat(50));
  
  if (config.isMicroblinkEnabled) {
    console.log('✅ Microblink BlinkID: Available (primary for ID documents)');
  } else {
    console.log('⚠️  Microblink BlinkID: Not available (will use fallback)');
  }
  
  if (config.isGoogleVisionEnabled) {
    console.log('✅ Google Cloud Vision: Available (secondary for generic documents)');
  } else {
    console.log('⚠️  Google Cloud Vision: Not available (will use fallback)');
  }
  
  console.log('✅ Tesseract.js: Always available (offline fallback)');
  console.log('─'.repeat(50));
  
  console.log('\n🎯 OCR Scanning Strategy:');
  if (config.isMicroblinkEnabled && config.isGoogleVisionEnabled) {
    console.log('  → ID Documents: Microblink → Google Vision → Tesseract');
    console.log('  → Generic Documents: Google Vision → Tesseract');
  } else if (config.isGoogleVisionEnabled) {
    console.log('  → All Documents: Google Vision → Tesseract');
  } else {
    console.log('  → All Documents: Tesseract (offline)');
  }
  
  console.log('\n✨ OCR scanning is ready to use!');
} else {
  console.error('\n❌ OCR Configuration has errors. Please fix them before using OCR.');
  process.exit(1);
}

