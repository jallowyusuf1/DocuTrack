# Execution Plan: Prevent Import Syntax Errors

## Problem
```
Uncaught SyntaxError: The requested module 'framer-motion' does not provide an export named 'Transition'
```

## Root Cause
- `Transition` is not exported from `framer-motion`
- TypeScript type imports can cause runtime errors if the type doesn't exist
- No validation before build

## Solution Implemented

### 1. ✅ Fixed Immediate Issue
- Removed invalid `Transition` import from `framer-motion`
- Created custom `Transition` type definition in `animations.ts`
- Updated all usages to use custom type

### 2. ✅ Created Validation Script
- **File**: `scripts/validate-imports.js`
- Checks for known problematic imports
- Runs automatically before build (`prebuild` hook)
- Prevents committing code with invalid imports

### 3. ✅ Added Documentation
- **File**: `docs/IMPORT_GUIDELINES.md`
- Lists valid/invalid exports for each library
- Provides examples of correct usage
- Quick reference guide

### 4. ✅ Added Development Rules
- **File**: `.cursorrules`
- Import safety rules
- Library-specific guidelines
- Best practices checklist

## Prevention Strategy

### Phase 1: Immediate (✅ Complete)
1. ✅ Fix current error
2. ✅ Create validation script
3. ✅ Add pre-build hook
4. ✅ Document guidelines

### Phase 2: Short-term (Next Steps)
1. **Add ESLint Rule** (Recommended)
   ```json
   {
     "rules": {
       "no-restricted-imports": ["error", {
         "paths": [{
           "name": "framer-motion",
           "importNames": ["Transition"],
           "message": "Transition is not exported from framer-motion. Use custom type instead."
         }]
       }]
     }
   }
   ```

2. **Add TypeScript Strict Checks**
   - Enable `strict: true` in `tsconfig.json`
   - Add `noUnusedLocals: true`
   - Add `noUnusedParameters: true`

3. **Pre-commit Hook** (Optional)
   ```bash
   npm install --save-dev husky lint-staged
   ```
   - Run validation before commit
   - Prevent invalid imports from being committed

### Phase 3: Long-term (Best Practices)
1. **Code Review Checklist**
   - [ ] All imports verified
   - [ ] TypeScript builds successfully
   - [ ] No console errors
   - [ ] Validation script passes

2. **Library Update Process**
   - Check changelog for export changes
   - Run validation after updates
   - Update documentation if needed

3. **Team Training**
   - Share import guidelines
   - Review common mistakes
   - Document library-specific quirks

## Validation Workflow

### Before Committing
```bash
# 1. Run validation
npm run validate-imports

# 2. Build to catch TypeScript errors
npm run build

# 3. Test in browser
npm run dev
# Check console for errors
```

### Automated Checks
- ✅ Pre-build validation (runs automatically)
- ✅ TypeScript compiler (catches type errors)
- ⚠️ ESLint rules (recommended to add)
- ⚠️ Pre-commit hooks (optional)

## Quick Reference

### Framer Motion Exports

✅ **Valid Exports:**
```typescript
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
```

❌ **Invalid Exports:**
```typescript
import type { Transition } from 'framer-motion'; // Doesn't exist!
```

✅ **Solution:**
```typescript
// Define custom type
export type Transition = {
  duration?: number;
  // ... other properties
};
```

## Testing Checklist

After implementing fixes:
- [x] Build succeeds (`npm run build`)
- [x] No console errors in browser
- [x] Validation script runs successfully
- [x] All animations work correctly
- [ ] ESLint passes (if configured)
- [ ] Pre-commit hooks work (if added)

## Monitoring

### Watch for These Errors
1. `does not provide an export named 'X'`
2. `Cannot find module 'X'`
3. `'X' is not exported from 'Y'`

### When You See Them
1. Check library documentation
2. Verify package version
3. Check `IMPORT_GUIDELINES.md`
4. Run validation script
5. Fix and test

## Success Metrics

- ✅ Zero import syntax errors
- ✅ Build passes every time
- ✅ Validation catches issues early
- ✅ Team follows guidelines
- ✅ Documentation is up-to-date

## Maintenance

### Weekly
- Review any new import errors
- Update validation script if needed
- Check for library updates

### Monthly
- Review import guidelines
- Update documentation
- Check for new best practices

### On Library Updates
- Check changelog for export changes
- Update validation script
- Update documentation
- Test thoroughly

## Emergency Fix Process

If you get an import error:

1. **Stop and identify**
   - Which export is missing?
   - Which library?
   - What file?

2. **Check documentation**
   - Library docs
   - `IMPORT_GUIDELINES.md`
   - Package version

3. **Fix immediately**
   - Remove invalid import
   - Use valid export or custom type
   - Test build

4. **Prevent recurrence**
   - Add to validation script
   - Update documentation
   - Share with team

## Contact & Support

- Check `docs/IMPORT_GUIDELINES.md` first
- Review `.cursorrules` for development rules
- Run `npm run validate-imports` for validation
- Check library documentation for latest info

---

**Last Updated**: After fixing Transition import error
**Status**: ✅ Implemented and tested

