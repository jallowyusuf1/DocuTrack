# Error Prevention Execution Plan

## Current Issues Fixed

### 1. ✅ Select Component TypeErrors
**Problem:** `Cannot read properties of undefined (reading 'name')` and `(reading 'target')`

**Root Cause:** 
- The `handleSelect` function was trying to access properties on undefined objects
- Complex try-catch logic was causing confusion
- react-hook-form's `register()` expects a specific event object format

**Solution Applied:**
- Simplified `handleSelect` to always create proper event object
- Removed nested try-catch blocks
- Ensured event object always has `target` and `currentTarget` with required properties
- Added proper error handling without breaking the flow

**Prevention:**
- Always create complete event objects when calling react-hook-form handlers
- Test Select component with both `register()` and `Controller`
- Add TypeScript types for event objects

### 2. ✅ Form Spacing Issues
**Problem:** Labels and inputs were "touching" - insufficient spacing

**Root Cause:**
- Labels had `mb-2` (8px) which was too small
- No top margin on labels
- Inconsistent spacing across form components

**Solution Applied:**
- Changed label spacing from `mb-2` to `mb-3 mt-1` (12px bottom, 4px top)
- Applied consistently to Input, Select, and Textarea components
- Added spacing to date picker labels in AddDocument

**Prevention:**
- Use consistent spacing system (4px base unit)
- Document spacing standards in design system
- Use CSS variables for spacing
- Regular visual audits

### 3. ✅ ThemeProvider React Hook Errors
**Problem:** `Cannot read properties of null (reading 'useState')`

**Root Cause:**
- Sentry was being imported synchronously, potentially causing React version conflicts
- Initialization happening before React is fully loaded

**Solution Applied:**
- Changed Sentry to lazy import
- Delayed initialization with setTimeout
- Made all Sentry functions async
- Added proper error handling

**Prevention:**
- Always lazy-load third-party libraries that might conflict with React
- Initialize external services after React is mounted
- Test with and without optional dependencies

### 4. ✅ Supabase 400 Errors
**Problem:** Multiple 400 Bad Request errors for `notification_preferences`

**Root Cause:**
- Query using `.single()` fails when no profile exists
- Missing error handling for missing profiles

**Solution Applied (Previously):**
- Changed to `.maybeSingle()` to handle missing profiles
- Added fallback to create profile if it doesn't exist

**Prevention:**
- Always use `.maybeSingle()` for optional queries
- Handle missing data gracefully
- Test with new users (no existing profile)

## Prevention Strategy

### 1. Code Quality Standards

#### A. TypeScript Strict Mode
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noImplicitAny": true
  }
}
```

#### B. ESLint Rules for React Hook Form
```javascript
rules: {
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',
  '@typescript-eslint/no-explicit-any': 'warn',
}
```

### 2. Component Testing Checklist

Before committing any form component:
- [ ] Test with react-hook-form `register()`
- [ ] Test with react-hook-form `Controller`
- [ ] Verify onChange receives proper event object
- [ ] Test error states
- [ ] Test disabled states
- [ ] Verify spacing is consistent
- [ ] Check accessibility (keyboard navigation, ARIA labels)

### 3. Form Component Standards

#### A. Spacing
- Labels: `mb-3 mt-1` (12px bottom, 4px top)
- Between form fields: `space-y-5` (20px)
- Error messages: `mt-1.5` (6px top)

#### B. Event Handling
```typescript
// Always create complete event objects
const syntheticEvent = {
  target: {
    value: stringValue,
    name: fieldName,
    type: 'select-one' | 'text' | etc,
  },
  currentTarget: {
    value: stringValue,
    name: fieldName,
    type: 'select-one' | 'text' | etc,
  },
};
```

#### C. Error Handling
```typescript
// Always wrap in try-catch
try {
  onChange(syntheticEvent);
} catch (err) {
  console.error('Error in component:', err);
  // Don't break the flow
}
```

### 4. Database Query Standards

#### A. Always Use `.maybeSingle()` for Optional Data
```typescript
// ❌ Bad
const { data } = await supabase
  .from('table')
  .select('*')
  .eq('id', userId)
  .single(); // Fails if no row exists

// ✅ Good
const { data } = await supabase
  .from('table')
  .select('*')
  .eq('id', userId)
  .maybeSingle(); // Returns null if no row exists
```

#### B. Handle Missing Data
```typescript
if (!data) {
  // Create default or return early
  return defaultValue;
}
```

### 5. Third-Party Library Integration

#### A. Lazy Loading
```typescript
// ❌ Bad - Synchronous import
import * as Sentry from '@sentry/react';

// ✅ Good - Lazy import
const Sentry = await import('@sentry/react');
```

#### B. Conditional Initialization
```typescript
// ✅ Good - Check if needed before loading
if (needsFeature) {
  const module = await import('./feature');
  module.initialize();
}
```

### 6. Visual Consistency

#### A. Spacing System
- Use 4px base unit
- Document in design system
- Use CSS variables
- Regular audits

#### B. Component Library
- Consistent prop interfaces
- Shared spacing utilities
- Standardized error handling
- Unified styling approach

### 7. Error Monitoring

#### A. Development
- Console logging for all errors
- Clear error messages
- Stack traces preserved

#### B. Production
- Sentry integration (when configured)
- User-friendly error messages
- Never expose technical details

## Implementation Checklist

### Immediate Actions:
- [x] Fix Select component handleSelect
- [x] Fix form spacing (labels and inputs)
- [x] Fix Sentry initialization
- [x] Verify Supabase query fixes

### This Week:
- [ ] Add TypeScript strict mode
- [ ] Add ESLint rules for form components
- [ ] Create form component test template
- [ ] Document spacing standards
- [ ] Add visual regression tests

### Ongoing:
- [ ] Code review checklist for forms
- [ ] Regular spacing audits
- [ ] Error log reviews
- [ ] User feedback monitoring

## Testing Protocol

### Before Every Commit:
1. Test all form interactions
2. Verify spacing visually
3. Check console for errors
4. Test with new user (no existing data)
5. Test error states
6. Test disabled states

### Before Every Release:
1. Full form testing suite
2. Visual spacing audit
3. Error handling review
4. Accessibility audit
5. Performance check
6. Cross-browser testing

## Success Metrics

- Zero TypeErrors in Select component
- Consistent spacing across all forms
- No React hook errors
- No Supabase 400 errors for missing data
- All forms work with react-hook-form
- Visual consistency maintained

## Notes

- All fixes have been applied
- Prevention plan is documented
- Testing protocols established
- Standards defined for future development

