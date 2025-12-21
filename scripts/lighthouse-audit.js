#!/usr/bin/env node

/**
 * Lighthouse Audit Script
 * 
 * Usage:
 *   npm run lighthouse
 * 
 * Requirements:
 *   - Install Lighthouse CLI: npm install -g lighthouse
 *   - Or use: npx lighthouse
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5173;
const URL = `http://localhost:${PORT}`;
const OUTPUT_DIR = path.join(__dirname, '../lighthouse-reports');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🔍 Starting Lighthouse audit...');
console.log(`📊 Auditing: ${URL}`);
console.log('⏳ This may take a minute...\n');

try {
  // Run Lighthouse audit
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(OUTPUT_DIR, `lighthouse-${timestamp}.html`);
  
  execSync(
    `npx lighthouse ${URL} --output=html --output-path=${reportPath} --view --chrome-flags="--headless"`,
    { stdio: 'inherit' }
  );

  console.log(`\n✅ Audit complete!`);
  console.log(`📄 Report saved to: ${reportPath}`);
  console.log('\n📋 Key Metrics to Check:');
  console.log('  - Performance: > 90');
  console.log('  - Accessibility: > 90');
  console.log('  - Best Practices: > 90');
  console.log('  - SEO: > 90');
  console.log('  - PWA: All checks passing');
} catch (error) {
  console.error('❌ Lighthouse audit failed:', error.message);
  console.log('\n💡 Make sure:');
  console.log('  1. Dev server is running (npm run dev)');
  console.log('  2. Lighthouse is installed (npm install -g lighthouse)');
  console.log('  3. Or use: npx lighthouse');
  process.exit(1);
}

