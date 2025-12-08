# Quick Fix Guide: Naming Conflicts

## 🚨 If You Get a "Identifier 'X' has already been declared" Error

### Step 1: Identify the Conflict
Look for:
- Same variable name used twice in the same scope
- Context/hook value conflicting with local state
- Import conflicting with local variable

### Step 2: Quick Fix Pattern

**If it's a Context/Hook conflict:**
```typescript
// Before (ERROR)
const { language } = useTranslation();
const [language, setLanguage] = useState('English');

// After (FIXED)
const { language: currentLanguageCode } = useTranslation();
const [languageDisplayName, setLanguageDisplayName] = useState('English');
```

**If it's a duplicate declaration:**
```typescript
// Before (ERROR)
const user = getUser();
const user = getAnotherUser();

// After (FIXED)
const user = getUser();
const anotherUser = getAnotherUser();
```

### Step 3: Update All References
Search for the old variable name and replace:
- `language` → `currentLanguageCode` (for context value)
- `language` → `languageDisplayName` (for display state)

### Step 4: Verify
```bash
npm run type-check
npm run check-naming
```

## 📋 Prevention Checklist

Before writing code:
- [ ] Check existing variables in the file
- [ ] Rename context/hook values explicitly
- [ ] Use descriptive suffixes for local state

After writing code:
- [ ] Check ESLint output (should show in IDE)
- [ ] Check TypeScript errors (should show in IDE)
- [ ] Run `npm run check-naming`

## 🎯 Common Patterns

| Conflict Type | Solution |
|--------------|----------|
| Context + State | Rename context: `{value: valueFromContext}` |
| Hook + State | Rename hook: `{value: valueFromHook}` |
| Props + State | Rename prop: `{prop: initialValue}` |
| Duplicate const | Rename one: `const value2 = ...` |

## ⚡ Quick Commands

```bash
# Check for naming conflicts
npm run check-naming

# Type check
npm run type-check

# Full lint
npm run lint

# Build (runs checks automatically)
npm run build
```

