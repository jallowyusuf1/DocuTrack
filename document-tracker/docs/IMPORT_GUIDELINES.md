# Import Guidelines & Error Prevention

## Problem: Missing Export Errors

**Error Example:**
```
Uncaught SyntaxError: The requested module 'framer-motion' does not provide an export named 'Transition'
```

This happens when trying to import something that doesn't exist in a library.

## Solution: Custom Type Definitions

### For Framer Motion

❌ **DON'T:**
```typescript
import type { Transition } from 'framer-motion'; // Transition doesn't exist!
```

✅ **DO:**
```typescript
import type { Variants } from 'framer-motion';

// Define Transition type locally
export type Transition = {
  duration?: number;
  delay?: number;
  ease?: string | number[];
  type?: 'tween' | 'spring' | 'inertia' | 'keyframes';
  stiffness?: number;
  damping?: number;
  mass?: number;
  repeat?: number;
  repeatType?: 'loop' | 'reverse' | 'mirror';
  repeatDelay?: number;
};
```

## Valid Framer Motion Exports

### Runtime Exports (use `import`)
- `motion`
- `AnimatePresence`
- `useAnimation`
- `useMotionValue`
- `useTransform`
- `useSpring`
- `usePresence`

### Type Exports (use `import type`)
- `Variants`
- `MotionValue`
- `AnimationControls`
- `Target`
- `TargetAndTransition`

### NOT Exported (define custom types)
- `Transition` - Define custom type
- `AnimationProps` - Use `TargetAndTransition` instead

## Verification Checklist

Before importing from any library:

1. ✅ Check library documentation
2. ✅ Verify in TypeScript (IDE will show error)
3. ✅ Run `npm run build` to catch errors
4. ✅ Run `npm run validate-imports` (custom script)
5. ✅ Test in browser console if unsure

## Type-Only Import Rules

Always use `import type` for TypeScript-only imports:

```typescript
// ✅ Correct
import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';

// ❌ Wrong (causes runtime error)
import { Variants } from 'framer-motion'; // Type-only, use 'import type'
```

## Library-Specific Notes

### Framer Motion
- Version: Check `package.json`
- Docs: https://www.framer.com/motion/
- Most types are NOT exported - define custom types

### React Router
- All exports are valid
- Use `import` for components, `import type` for types

### Supabase
- All exports are valid
- Use `import` for client, `import type` for types

## Prevention Tools

1. **Pre-build Validation**
   - Runs automatically before `npm run build`
   - Checks for known problematic imports

2. **TypeScript Compiler**
   - Catches missing exports at compile time
   - Always fix TypeScript errors before committing

3. **ESLint Rules** (if configured)
   - Can catch import/export issues
   - Enforce `import type` usage

## Quick Fix Guide

If you get an import error:

1. **Check the error message** - Which export is missing?
2. **Check library docs** - Does it exist?
3. **Check package version** - Is it available in your version?
4. **Define custom type** - If it's a type, define it locally
5. **Test build** - Run `npm run build`
6. **Test in browser** - Check console for errors

## Common Mistakes

1. ❌ Importing types as values
2. ❌ Assuming all types are exported
3. ❌ Not checking library version compatibility
4. ❌ Not running build after adding imports
5. ❌ Copying code without verifying imports

## Best Practices

1. ✅ Always verify imports exist
2. ✅ Use `import type` for TypeScript-only
3. ✅ Define custom types when needed
4. ✅ Run validation scripts
5. ✅ Check library documentation
6. ✅ Test builds frequently
7. ✅ Keep dependencies updated

