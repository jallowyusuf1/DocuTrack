# 🎨 Glass Morphism System Guide
## iOS 18 / macOS 15 Style Frosted Glass Throughout Your App

This guide shows you how to use the unified glass morphism system throughout DocuTrack.

---

## 📦 Quick Start

### Import Components

```tsx
import { GlassContainer, GlassCard, GlassTile, GlassPanel } from '@/components/ui/GlassContainer';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';
import { getGlassCardStyle, getGlassAvatarStyle } from '@/utils/glassStyles';
```

---

## 🎯 Component Usage

### 1. GlassContainer (Base Component)

The most flexible glass component. Use for any container.

```tsx
<GlassContainer
  intensity="medium"      // 'subtle' | 'medium' | 'strong' | 'extreme'
  padding="medium"         // 'none' | 'small' | 'medium' | 'large'
  rounded="lg"            // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  elevated={true}         // Adds stronger shadow
  interactive={true}      // Adds hover/tap animations
  onClick={() => {}}
>
  Your content here
</GlassContainer>
```

### 2. GlassCard (Pre-configured Card)

Perfect for profile cards, info cards, etc.

```tsx
<GlassCard padding="large" elevated>
  <h2>Title</h2>
  <p>Content</p>
</GlassCard>
```

### 3. GlassTile (Grid Items)

Use for grid layouts, document cards, etc.

```tsx
<GlassTile interactive onClick={() => {}}>
  <img src="..." />
  <h3>Document Name</h3>
</GlassTile>
```

### 4. GlassPanel (Modals, Sidebars)

For elevated surfaces like modals and sidebars.

```tsx
<GlassPanel padding="large">
  <h1>Modal Title</h1>
  <p>Modal content</p>
</GlassPanel>
```

### 5. GlassButton

Styled buttons with glass effect.

```tsx
<GlassButton
  variant="primary"    // 'primary' | 'secondary' | 'ghost'
  size="md"            // 'sm' | 'md' | 'lg'
  fullWidth={false}
  onClick={() => {}}
>
  Click Me
</GlassButton>
```

### 6. GlassInput

Glass-styled input fields.

```tsx
<GlassInput
  type="text"
  placeholder="Enter text..."
  error={false}
/>
```

---

## 🎨 Utility Functions

### getGlassCardStyle()

Get glass card styles for custom components.

```tsx
import { getGlassCardStyle } from '@/utils/glassStyles';

<div style={getGlassCardStyle({ intensity: 'medium', elevated: true })}>
  Content
</div>
```

### getGlassAvatarStyle()

Get glass avatar styles.

```tsx
import { getGlassAvatarStyle } from '@/utils/glassStyles';

<div style={getGlassAvatarStyle(80)}>
  <img src="avatar.jpg" />
</div>
```

### getGlassButtonStyle()

Get glass button styles.

```tsx
import { getGlassButtonStyle } from '@/utils/glassStyles';

<button style={getGlassButtonStyle('primary')}>
  Button
</button>
```

### getGlassInputStyle()

Get glass input styles.

```tsx
import { getGlassInputStyle } from '@/utils/glassStyles';

<input style={getGlassInputStyle()} />
```

---

## 📋 Common Patterns

### Profile Card

```tsx
<GlassCard padding="large">
  <div style={getGlassAvatarStyle(80)}>
    <span>JD</span>
  </div>
  <h2>John Doe</h2>
  <p>john@example.com</p>
  <GlassButton variant="secondary">Edit Profile</GlassButton>
</GlassCard>
```

### Settings List

```tsx
<GlassCard>
  <div className="space-y-2">
    <div className="flex items-center justify-between p-4 border-b border-white/10">
      <span>Email Notifications</span>
      <Toggle />
    </div>
    <div className="flex items-center justify-between p-4 border-b border-white/10">
      <span>Push Notifications</span>
      <Toggle />
    </div>
  </div>
</GlassCard>
```

### Statistics Cards

```tsx
<div className="flex gap-3">
  <GlassContainer
    intensity="medium"
    padding="small"
    className="flex-1 text-center"
    style={{
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.15))',
      border: '1px solid rgba(59, 130, 246, 0.3)',
    }}
  >
    <FolderIcon />
    <div className="text-2xl font-bold">42</div>
    <div className="text-sm">Documents</div>
  </GlassContainer>
</div>
```

### Modal

```tsx
<div style={getGlassModalBackdropStyle()}>
  <GlassPanel padding="large" style={{ maxWidth: '600px' }}>
    <h1>Modal Title</h1>
    <p>Modal content</p>
    <GlassButton variant="primary">Confirm</GlassButton>
  </GlassPanel>
</div>
```

### Navigation Bar

```tsx
<nav style={getGlassNavStyle()}>
  <div className="flex items-center justify-between">
    <Logo />
    <NavigationItems />
  </div>
</nav>
```

### Form

```tsx
<GlassCard padding="large">
  <h2>Create Document</h2>
  <GlassInput type="text" placeholder="Document Name" />
  <GlassInput type="date" />
  <GlassButton variant="primary" fullWidth>Submit</GlassButton>
</GlassCard>
```

---

## 🎨 Intensity Levels

- **subtle**: Very light glass (0.04 opacity, 20px blur) - For backgrounds
- **medium**: Standard glass (0.08 opacity, 40px blur) - For cards, buttons
- **strong**: Heavy glass (0.12 opacity, 60px blur) - For modals, navigation
- **extreme**: Maximum glass (0.16 opacity, 80px blur) - For overlays, popovers

---

## 🎯 Best Practices

1. **Use GlassCard for main content containers**
2. **Use GlassTile for grid items**
3. **Use GlassPanel for modals and elevated surfaces**
4. **Use GlassButton for all buttons**
5. **Use GlassInput for all form inputs**
6. **Keep intensity consistent** - Don't mix extreme and subtle on the same page
7. **Use elevated prop** for important cards
8. **Use interactive prop** for clickable items

---

## 🔄 Migration Guide

### Before (Old Style)

```tsx
<div
  style={{
    background: 'rgba(42, 38, 64, 0.6)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '20px',
  }}
>
  Content
</div>
```

### After (Glass System)

```tsx
<GlassCard padding="medium">
  Content
</GlassCard>
```

---

## 📱 Responsive Considerations

The glass system automatically adjusts blur for mobile devices:
- Desktop: Full blur (40-80px)
- Mobile: Reduced blur (20-40px) for better performance

---

## 🎨 Customization

You can override styles by passing a `style` prop:

```tsx
<GlassCard
  style={{
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(109, 40, 217, 0.2))',
    border: '1px solid rgba(139, 92, 246, 0.4)',
  }}
>
  Custom styled card
</GlassCard>
```

---

## 🚀 Performance Tips

1. **Limit simultaneous blurs** - Too many blurred elements can hurt performance
2. **Use subtle intensity** for background elements
3. **Use medium intensity** for most cards
4. **Use strong/extreme** only for modals and overlays
5. **Mobile**: Automatically uses reduced blur

---

## ✅ Checklist

When applying glass throughout your app:

- [ ] Replace all card containers with `GlassCard`
- [ ] Replace all buttons with `GlassButton`
- [ ] Replace all inputs with `GlassInput`
- [ ] Use `GlassTile` for grid items
- [ ] Use `GlassPanel` for modals
- [ ] Apply glass to navigation bars
- [ ] Apply glass to settings pages
- [ ] Apply glass to profile pages
- [ ] Test on mobile devices
- [ ] Verify performance is smooth

---

**Created**: January 2025  
**Status**: Ready to use throughout the app


