# Lighthouse Audit Guide

## Quick Start

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Run Lighthouse audit:**
   ```bash
   npm run lighthouse
   ```

   This will:
   - Audit your app at `http://localhost:5173`
   - Generate an HTML report
   - Open the report in your browser
   - Save report to `lighthouse-reports/` folder

## Manual Audit

### Using Chrome DevTools:
1. Open your app in Chrome
2. Open DevTools (F12)
3. Go to "Lighthouse" tab
4. Select categories (Performance, Accessibility, Best Practices, SEO, PWA)
5. Click "Analyze page load"

### Using CLI:
```bash
# Install Lighthouse globally
npm install -g lighthouse

# Run audit
lighthouse http://localhost:5173 --view

# Generate specific format
lighthouse http://localhost:5173 --output=html,json --output-path=./report
```

## Target Scores

Aim for:
- **Performance**: > 90
- **Accessibility**: > 90
- **Best Practices**: > 90
- **SEO**: > 90
- **PWA**: All checks passing

## Common Issues & Fixes

### Performance Issues:

**Large bundle size:**
- ✅ Already fixed with code splitting
- Check bundle analyzer: `npm run build -- --analyze`

**Slow images:**
- ✅ Already fixed with lazy loading
- Ensure images are optimized
- Use WebP format when possible

**Render-blocking resources:**
- Move scripts to end of body
- Use `defer` or `async` attributes

### Accessibility Issues:

**Missing alt text:**
- Add `alt` attributes to all images
- Use descriptive text

**Low contrast:**
- Check text contrast ratios
- Use WCAG AA standards (4.5:1 for normal text)

**Missing ARIA labels:**
- Add `aria-label` to icon buttons
- Use semantic HTML

**Keyboard navigation:**
- Ensure all interactive elements are keyboard accessible
- Add visible focus indicators

### PWA Issues:

**Missing manifest:**
- ✅ Already created
- Verify `/manifest.json` is accessible

**Missing icons:**
- Generate icons (see PWA setup guide)
- Ensure 192x192 and 512x512 icons exist

**No service worker:**
- ✅ Already created
- Verify service worker registers in production

**Not served over HTTPS:**
- Required for production
- Use HTTPS or localhost for development

## Continuous Monitoring

Set up Lighthouse CI for automated audits:
1. Install: `npm install -g @lhci/cli`
2. Configure: Create `lighthouserc.js`
3. Run: `lhci autorun`

## Interpreting Results

**Performance:**
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Cumulative Layout Shift (CLS): < 0.1

**Accessibility:**
- All checks should pass
- Focus on ARIA labels and keyboard navigation

**Best Practices:**
- HTTPS enabled
- No console errors
- Proper image aspect ratios
- Modern JavaScript features

**SEO:**
- Meta tags present
- Descriptive titles
- Semantic HTML
- Mobile-friendly
