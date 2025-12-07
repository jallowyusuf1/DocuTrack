# TypeScript Icon Types Guide

## Lucide React Icons

**❌ WRONG - DO NOT USE:**
```typescript
import type { LucideIcon } from 'lucide-react'; // This type does NOT exist!
```

**✅ CORRECT - Use one of these approaches:**

### Option 1: ComponentType with LucideProps (Recommended)
```typescript
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

interface MyComponentProps {
  icon: ComponentType<LucideProps>;
}

// Usage:
const MyComponent = ({ icon: Icon }: MyComponentProps) => {
  return <Icon className="w-6 h-6" />;
};
```

### Option 2: React.ComponentType
```typescript
import type { ComponentType } from 'react';

interface MyComponentProps {
  icon: ComponentType<{ className?: string }>;
}
```

### Option 3: Direct component type
```typescript
interface MyComponentProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}
```

## Best Practice

Always use `ComponentType<LucideProps>` from React and `LucideProps` from lucide-react when typing Lucide icons.

