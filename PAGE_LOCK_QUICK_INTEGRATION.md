# Quick Integration Guide for Page Locks

## ✅ Completed

1. **usePageLock Hook** - Reusable hook for all pages
2. **Page Lock Service** - Full backend with session management
3. **Page Lock Modal** - Black & white glass design
4. **Page Lock Settings Modal** - Settings interface
5. **Dashboard Integration** ✅ - Fully integrated with lock

## 🚀 Quick Integration Pattern

For each remaining page, follow this exact pattern:

### Step 1: Add Imports
```typescript
import { usePageLock } from '../../hooks/usePageLock';
import PageLockModal from '../../components/lock/PageLockModal';
```

### Step 2: Add Hook (after existing hooks)
```typescript
// Page lock (replace 'pagename' with: documents, profile, family, dates, notifications, settings)
const { isLocked, lockType, handleUnlock } = usePageLock('pagename');
```

### Step 3: Wrap Return in Fragment
```typescript
return (
  <>
    {/* Page Lock Modal */}
    <PageLockModal
      isOpen={isLocked}
      pageName="Page Name"  // Use: Documents, Profile, Family, Dates, Notifications, Settings
      lockType={lockType}
      onUnlock={handleUnlock}
    />

    {/* Existing content here */}
    <div>
      ... your existing page content ...
    </div>
  </>
);
```

## 📁 Files to Update

### 1. Documents Page
**File:** `/src/pages/documents/MobileDocuments.tsx` AND `/src/pages/documents/DesktopDocuments.tsx`
**Page Type:** `'documents'`
**Display Name:** `"Documents"`

### 2. Profile Page
**File:** `/src/pages/profile/Profile.tsx`
**Page Type:** `'profile'`
**Display Name:** `"Profile"`

### 3. Family Page
**File:** `/src/pages/family/Family.tsx` OR `/src/pages/family/ComprehensiveFamily.tsx`
**Page Type:** `'family'`
**Display Name:** `"Family"`

### 4. Dates Page
**File:** `/src/pages/dates/Dates.tsx`
**Page Type:** `'dates'`
**Display Name:** `"Important Dates"`

### 5. Notifications Page
**File:** `/src/pages/notifications/Notifications.tsx` AND `/src/pages/notifications/DesktopNotifications.tsx`
**Page Type:** `'notifications'`
**Display Name:** `"Notifications"`

### 6. Settings Page
**File:** `/src/pages/profile/Settings.tsx` AND `/src/pages/settings/DesktopSettings.tsx`
**Page Type:** `'settings'`
**Display Name:** `"Settings"`

## 🔧 Add Settings Button

In `/src/pages/profile/Settings.tsx` or `/src/pages/settings/DesktopSettings.tsx`:

```typescript
import { useState } from 'react';
import PageLockSettingsModal from '../../components/settings/PageLockSettingsModal';
import { Lock } from 'lucide-react';

function Settings() {
  const [showPageLockSettings, setShowPageLockSettings] = useState(false);

  return (
    <>
      {/* In your settings menu */}
      <button
        onClick={() => setShowPageLockSettings(true)}
        className="flex items-center gap-3 p-4 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <Lock className="w-5 h-5 text-white/70" />
        <div>
          <div className="text-white font-medium">Page Lock Settings</div>
          <div className="text-white/60 text-sm">Lock pages with PIN or password</div>
        </div>
      </button>

      {/* Modal */}
      <PageLockSettingsModal
        isOpen={showPageLockSettings}
        onClose={() => setShowPageLockSettings(false)}
      />
    </>
  );
}
```

## 🗄️ Database Setup

Run this SQL in Supabase Dashboard or via CLI:

```bash
# Copy the contents of:
supabase/migrations/20250130000000_create_page_locks.sql

# And run in Supabase SQL Editor
```

## 🔐 Clear Locks on Logout

In `/src/store/authStore.ts`:

```typescript
import { pageLockService } from '../services/pageLock';

// Find your logout function and add:
logout: async () => {
  const userId = get().user?.id;
  if (userId) {
    pageLockService.clearSessionUnlocks(userId);
  }
  // ... rest of logout logic
}
```

## 🎨 Supported Pages

All these pages can be locked:
- ✅ Dashboard (completed)
- ⏳ Documents
- ⏳ Profile
- ⏳ Family
- ⏳ Dates (Important Dates)
- ⏳ Notifications
- ⏳ Settings

## 📱 Responsive Design

The lock modal automatically adapts:
- **Mobile** (< 768px): Full-screen overlay, auto-submit for PIN
- **Tablet** (768px - 1023px): Same as mobile
- **Desktop** (>= 1024px): Centered modal, slightly larger

## 🎯 Features

- 6-digit PIN or password (min 8 chars)
- Visual PIN dots indicator
- Auto-submit for PIN
- 3 attempt limit with error messages
- Session-based unlocking (stays unlocked until logout)
- SHA-256 password hashing
- Black & white glass morphism design

## ✅ Testing Checklist

After integration:
- [ ] Can set PIN lock for each page
- [ ] Can set password lock for each page
- [ ] Correct lock modal appears when visiting locked page
- [ ] Can unlock with correct credentials
- [ ] Wrong credentials show error
- [ ] 3 attempt limit works
- [ ] Can enable/disable locks
- [ ] Can remove locks
- [ ] Locks persist across page navigation
- [ ] All locks clear on logout
