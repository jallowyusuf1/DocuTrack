# Naming Conventions & Conflict Prevention Plan

## Problem
Identifier naming conflicts can occur when:
1. Context/hook variables have the same name as local state
2. Multiple imports provide similar named exports
3. Component props conflict with internal state
4. Global variables shadow local ones

## Solution: Comprehensive Naming Strategy

### 1. Context/Hook Variable Naming Pattern

**Rule:** When destructuring from contexts or hooks, always rename to be explicit about the source.

```typescript
// ❌ BAD - Generic name that can conflict
const { language, setLanguage } = useTranslation();
const [language, setLanguage] = useState('English'); // CONFLICT!

// ✅ GOOD - Explicit naming
const { language: currentLanguageCode, setLanguage: setLanguageCode } = useTranslation();
const [languageDisplayName, setLanguageDisplayName] = useState('English');
```

**Pattern:**
- Context values: `{value: valueFromContext}`
- Hook values: `{value: valueFromHook}`
- Local state: Use descriptive names like `valueDisplay`, `valueLocal`, `valueState`

### 2. State Variable Naming Conventions

**Rule:** Use descriptive suffixes to indicate the purpose and source.

```typescript
// Context/Hook values
const { theme: appTheme } = useTheme();
const { user: currentUser } = useAuth();
const { language: selectedLanguageCode } = useTranslation();

// Local state
const [themePreference, setThemePreference] = useState('dark');
const [userDisplayName, setUserDisplayName] = useState('');
const [languageDisplayName, setLanguageDisplayName] = useState('English');

// Computed/derived values
const themeFromContext = useTheme();
const userFromAuth = useAuth();
```

**Suffixes:**
- `Code` - Language codes, IDs (e.g., `languageCode`, `userId`)
- `Display` - Display strings (e.g., `languageDisplayName`, `userDisplayName`)
- `Local` - Local state (e.g., `themeLocal`, `userLocal`)
- `State` - Component state (e.g., `loadingState`, `errorState`)
- `FromContext` - Values from context (e.g., `themeFromContext`)
- `FromHook` - Values from hooks (e.g., `userFromHook`)

### 3. Import Naming Strategy

**Rule:** Use aliases when importing to avoid conflicts.

```typescript
// ❌ BAD - Potential conflict
import { useAuth } from './hooks/useAuth';
import { useAuth as useAuthContext } from './contexts/AuthContext';

// ✅ GOOD - Clear distinction
import { useAuth } from './hooks/useAuth';
import { useAuthContext } from './contexts/AuthContext';
```

### 4. Component Prop Naming

**Rule:** Prefix props with component name or use descriptive names.

```typescript
// ❌ BAD
interface ProfileProps {
  user: User;
  theme: Theme;
}

// ✅ GOOD
interface ProfileProps {
  profileUser: User;
  profileTheme: Theme;
  // OR
  user: User;
  theme: Theme;
  // But ensure no conflict with internal state
}
```

### 5. TypeScript ESLint Rules

Add to `tsconfig.json` or `.eslintrc`:

```json
{
  "rules": {
    "no-shadow": "error",
    "no-redeclare": "error",
    "@typescript-eslint/no-shadow": "error"
  }
}
```

### 6. Pre-commit Checklist

Before committing, verify:
- [ ] No duplicate variable names in same scope
- [ ] Context/hook values are renamed if local state exists
- [ ] All imports are properly aliased if needed
- [ ] TypeScript compilation passes without errors
- [ ] ESLint passes with no shadowing warnings

### 7. Code Review Guidelines

When reviewing code, check for:
1. **Variable Shadowing:** Look for variables with same name in nested scopes
2. **Context Conflicts:** Ensure context values don't conflict with local state
3. **Import Conflicts:** Verify imports don't create naming conflicts
4. **Type Conflicts:** Check TypeScript errors for type-related conflicts

### 8. Automated Prevention

#### ESLint Configuration

Create `.eslintrc.js`:

```javascript
module.exports = {
  rules: {
    'no-shadow': ['error', { 
      builtinGlobals: true,
      hoist: 'all',
      allow: ['resolve', 'reject', 'done', 'next', 'err', 'error']
    }],
    '@typescript-eslint/no-shadow': ['error', {
      ignoreTypeValueShadow: true
    }],
    'no-redeclare': 'error'
  }
};
```

#### Pre-commit Hook

Create `.husky/pre-commit`:

```bash
#!/bin/sh
npm run lint
npm run type-check
```

### 9. Common Conflict Patterns to Avoid

```typescript
// ❌ Pattern 1: Context + Local State
const { user } = useAuth();
const [user, setUser] = useState(null); // CONFLICT

// ✅ Solution
const { user: authUser } = useAuth();
const [user, setUser] = useState(null);

// ❌ Pattern 2: Multiple Hooks with Same Name
const { theme } = useTheme();
const { theme: appTheme } = useAppTheme(); // Still conflicts if used together

// ✅ Solution
const { theme: uiTheme } = useTheme();
const { theme: appTheme } = useAppTheme();

// ❌ Pattern 3: Props + State
function Component({ user }: { user: User }) {
  const [user, setUser] = useState(null); // CONFLICT
}

// ✅ Solution
function Component({ user: initialUser }: { user: User }) {
  const [user, setUser] = useState(initialUser);
}
```

### 10. File-Specific Naming Rules

#### Profile.tsx Specific Rules

```typescript
// Context values - always rename
const { language: currentLanguageCode } = useTranslation();
const { theme: appTheme } = useTheme();
const { user: currentUser } = useAuth();

// Local state - use descriptive names
const [languageDisplayName, setLanguageDisplayName] = useState('English');
const [themePreference, setThemePreference] = useState('dark');
const [userProfile, setUserProfile] = useState(null);
```

### 11. Refactoring Checklist

When refactoring code:
1. **Identify all variables** in the file
2. **Check for conflicts** with:
   - Context values
   - Hook returns
   - Props
   - Local state
   - Imports
3. **Rename conflicting variables** using conventions above
4. **Update all references** to renamed variables
5. **Run TypeScript compiler** to verify
6. **Run ESLint** to catch shadowing

### 12. Testing Strategy

```typescript
// Test file naming conflicts
describe('Naming Conflicts', () => {
  it('should not have duplicate variable names', () => {
    // Use AST parser to check for duplicate identifiers
  });
});
```

## Implementation Steps

1. ✅ Fix immediate error in Profile.tsx
2. ⬜ Add ESLint rules for no-shadow
3. ⬜ Update all files to follow naming conventions
4. ⬜ Add pre-commit hooks
5. ⬜ Document in team guidelines
6. ⬜ Create code review checklist
7. ⬜ Set up automated checks in CI/CD

## Quick Reference

| Source | Naming Pattern | Example |
|--------|---------------|---------|
| Context | `{value: valueFromContext}` | `{language: currentLanguageCode}` |
| Hook | `{value: valueFromHook}` | `{user: currentUser}` |
| Local State | `valueDisplay` or `valueLocal` | `languageDisplayName` |
| Props | `componentValue` or `initialValue` | `profileUser` or `initialUser` |
| Computed | `computedValue` | `computedTheme` |

