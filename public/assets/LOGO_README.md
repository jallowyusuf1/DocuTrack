# Logo Files Reference

## Current Logo
- **`logo-modern-d.svg`** - Modern flat "D" with purple/glass/black colors (ACTIVE)

## Backup Logos
- **`logo-glass-d.png`** - 3D glass "D" with translucent purple/blue/pink gradient (BACKUP)
- **`logo.png`** - Original 3D glass D (copy of glass-d)
- **`logo.svg`** - Original generated SVG

## How to Revert to 3D Glass Logo

To switch back to the 3D glass logo, update these files:

### 1. BrandLogo Component
File: `src/components/ui/BrandLogo.tsx`

Change line 17 from:
```typescript
const src = useMemo(() => (useFallback ? '/assets/logo-glass-d.png' : '/assets/logo-modern-d.svg'), [useFallback]);
```

To:
```typescript
const src = useMemo(() => (useFallback ? '/assets/logo-modern-d.svg' : '/assets/logo-glass-d.png'), [useFallback]);
```

### 2. Favicon (index.html)
File: `index.html`

Change lines 10-11 from:
```html
<link rel="icon" type="image/svg+xml" href="/assets/logo-modern-d.svg" />
<link rel="icon" type="image/png" href="/assets/logo-glass-d.png" />
```

To:
```html
<link rel="icon" type="image/png" href="/assets/logo-glass-d.png" />
<link rel="icon" type="image/svg+xml" href="/assets/logo-modern-d.svg" />
```

That's it! The changes will hot-reload automatically.
