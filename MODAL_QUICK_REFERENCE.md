# Modal System - Quick Reference Guide

## 🚀 Quick Start

### 1. Setup (Already Done!)

All modals are already implemented and exported from `src/components/modals/index.ts`.

### 2. Basic Usage Pattern

```tsx
import { useState } from 'react';
import { BaseModal } from './components/modals';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      <BaseModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="My Modal">
        <p>Content here</p>
      </BaseModal>
    </>
  );
}
```

---

## 📋 All Available Modals

### ✅ Image Source Selector
**When**: User wants to add a document
**Code**:
```tsx
import { ImageSourceSelector } from './components/modals';

<ImageSourceSelector
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSelectCamera={() => cameraInputRef.current?.click()}
  onSelectGallery={() => galleryInputRef.current?.click()}
/>
```

### ✅ Date Picker
**When**: User needs to select a date
**Code**:
```tsx
import { DatePicker } from './components/modals';

<DatePicker
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSelectDate={(date) => setSelectedDate(date)}
  selectedDate={selectedDate}
  minDate={new Date()} // Optional: future dates only
/>
```

### ✅ Category Picker
**When**: User selects document category
**Code**:
```tsx
import { CategoryPicker } from './components/modals';

<CategoryPicker
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSelectCategory={(cat) => setCategory(cat)}
  categories={categories}
  onCreateCategory={handleCreateCategory}
/>
```

### ✅ Delete Confirmation
**When**: User deletes a document
**Code**:
```tsx
import { DeleteConfirmation } from './components/modals';

<DeleteConfirmation
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={async () => await deleteDocument()}
  documentName="Passport"
  documentPreview="/path/to/image.jpg"
/>
```

### ✅ Share Sheet
**When**: User shares a document
**Code**:
```tsx
import { ShareSheet } from './components/modals';

<ShareSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  document={document}
  familyMembers={familyMembers}
  onShare={handleShare}
  onGenerateLink={handleGenerateLink}
/>
```

### ✅ Reminder Settings
**When**: User customizes reminders
**Code**:
```tsx
import { ReminderSettings } from './components/modals';

<ReminderSettings
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSave={handleSaveSettings}
  documentId={documentId}
  currentConfig={currentConfig}
/>
```

### ✅ Language Selector
**When**: User changes app language
**Code**:
```tsx
import { LanguageSelector } from './components/modals';

<LanguageSelector
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  currentLanguage={i18n.language}
  onSelectLanguage={handleChangeLanguage}
/>
```

### ✅ Onboarding Carousel
**When**: First-time user or tutorial
**Code**:
```tsx
import { OnboardingCarousel } from './components/modals';

<OnboardingCarousel
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onComplete={handleCompleteOnboarding}
/>
```

---

## 🎨 Toast Notifications

### Using the Toast Hook

```tsx
import { useToast, SuccessToast } from './components/modals';

function MyComponent() {
  const { toasts, showToast, dismissToast } = useToast();

  // Show success toast
  showToast('Document saved!', 'success');

  // Show error toast
  showToast('Upload failed', 'error');

  // Show with action button
  showToast('Document deleted', 'success', {
    action: {
      label: 'Undo',
      onClick: () => restoreDocument(),
    },
  });

  return (
    <>
      {/* Your component */}
      <SuccessToast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
```

### Toast Variants
- `'success'` - Green checkmark
- `'error'` - Red X
- `'info'` - Blue info icon
- `'warning'` - Orange warning icon

---

## ⏳ Loading Overlay

### Using the Loading Hook

```tsx
import { useLoading, LoadingOverlay } from './components/modals';

function MyComponent() {
  const { isLoading, loadingMessage, progress, showLoading, hideLoading, updateProgress } = useLoading();

  const handleUpload = async () => {
    showLoading('Uploading...');

    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      updateProgress(i, {
        speed: '2.5 MB/s',
        eta: `${Math.ceil((100 - i) / 10)} seconds`,
      });
      await sleep(500);
    }

    hideLoading();
    showToast('Upload complete!', 'success');
  };

  return (
    <>
      <button onClick={handleUpload}>Upload</button>
      <LoadingOverlay
        isOpen={isLoading}
        message={loadingMessage}
        showProgress={progress > 0}
        progress={progress}
        allowCancel={true}
        onCancel={() => hideLoading()}
      />
    </>
  );
}
```

---

## 🎯 Using Modal Context (Recommended)

### 1. Wrap your app with ModalProvider

```tsx
// App.tsx or _app.tsx
import { ModalProvider } from './contexts/ModalContext';

function App() {
  return (
    <ModalProvider>
      <YourApp />
    </ModalProvider>
  );
}
```

### 2. Use modals from anywhere

```tsx
import { useModals } from './contexts/ModalContext';

function AnyComponent() {
  const modals = useModals();

  // Open image selector
  const handleAddDocument = () => {
    modals.imageSourceSelector.open((file) => {
      console.log('Selected:', file);
      navigate('/preview', { state: { file } });
    });
  };

  // Open date picker
  const handleSelectDate = () => {
    modals.datePicker.open(
      (date) => setExpiryDate(date),
      { minDate: new Date() } // Options
    );
  };

  // Open delete confirmation
  const handleDelete = () => {
    modals.deleteConfirmation.open('Passport', async () => {
      await deleteDocument(id);
      showToast('Deleted!', 'success');
    });
  };

  return (
    <div>
      <button onClick={handleAddDocument}>Add Document</button>
      <button onClick={handleSelectDate}>Select Date</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
```

---

## 🎬 Common Workflows

### Add Document Flow
```tsx
const handleAddDocument = () => {
  // 1. Open image source selector
  modals.imageSourceSelector.open((file) => {
    // 2. Navigate to preview with file
    navigate('/preview', { state: { file } });
  });
};
```

### Edit Document with Category
```tsx
const handleEditCategory = () => {
  // 1. Open category picker
  modals.categoryPicker.open((category) => {
    // 2. Update document
    updateDocument({ ...document, category_id: category.id });

    // 3. Show success
    showToast('Category updated', 'success');
  });
};
```

### Delete with Confirmation
```tsx
const handleDelete = () => {
  // 1. Show confirmation
  modals.deleteConfirmation.open(document.name, async () => {
    try {
      // 2. Show loading
      showLoading('Deleting document...');

      // 3. Delete from database
      await deleteDocument(document.id);

      // 4. Hide loading
      hideLoading();

      // 5. Show success
      showToast('Document deleted', 'success', {
        action: {
          label: 'Undo',
          onClick: async () => {
            await restoreDocument(document.id);
            showToast('Document restored', 'success');
          },
        },
      });

      // 6. Navigate away
      navigate('/dashboard');
    } catch (error) {
      hideLoading();
      showToast('Failed to delete', 'error');
    }
  });
};
```

### Upload with Progress
```tsx
const handleUpload = async (file: File) => {
  // 1. Show loading
  showLoading('Uploading document...');

  try {
    // 2. Upload with progress tracking
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(path, file, {
        onUploadProgress: (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          updateProgress(percent, {
            speed: calculateSpeed(progress),
            eta: calculateETA(progress),
          });
        },
      });

    if (error) throw error;

    // 3. Hide loading
    hideLoading();

    // 4. Show success
    showToast('Upload complete!', 'success');

    // 5. Navigate to document
    navigate(`/documents/${data.id}`);
  } catch (error) {
    hideLoading();
    showToast('Upload failed', 'error');
  }
};
```

---

## 🎨 Styling Guide

All modals use:
- **Base colors**: Purple (#8B5CF6) for primary actions
- **Border radius**: 16px for modals, 12px for buttons
- **Shadows**: `0 20px 60px rgba(0, 0, 0, 0.3)`
- **Animations**: Framer Motion with fade + scale
- **Backdrop**: `rgba(0, 0, 0, 0.5)` with blur

---

## 🔧 Customization

### Custom Modal Size
```tsx
<BaseModal size="lg"> {/* sm | md | lg | full */}
  ...
</BaseModal>
```

### Disable Backdrop Close
```tsx
<BaseModal closeOnBackdrop={false}>
  ...
</BaseModal>
```

### Disable ESC Close
```tsx
<BaseModal closeOnEscape={false}>
  ...
</BaseModal>
```

### Hide Close Button
```tsx
<BaseModal showCloseButton={false}>
  ...
</BaseModal>
```

---

## 🐛 Troubleshooting

### Modal won't open
✅ Check `isOpen` is set to `true`
✅ Verify modal is rendered in DOM
✅ Check for JavaScript errors in console

### Backdrop not working
✅ Ensure `closeOnBackdrop={true}` (default)
✅ Check for z-index conflicts
✅ Verify no other elements catching clicks

### Animations stuttering
✅ Check Framer Motion is installed
✅ Reduce number of elements
✅ Use `React.memo` for heavy content

---

## 📚 Full Documentation

For detailed documentation, see [MODAL_SYSTEM.md](./MODAL_SYSTEM.md)

For component source code, see `src/components/modals/`

---

## 🎯 Checklist for New Modal

When creating a new modal:

- [ ] Extend `BaseModal` or create standalone
- [ ] Add proper TypeScript types
- [ ] Implement ESC/backdrop close
- [ ] Add to `modals/index.ts` exports
- [ ] Add to `ModalContext` if global
- [ ] Add to documentation
- [ ] Test on mobile and desktop
- [ ] Test accessibility (keyboard nav)
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success feedback (toast)

---

## 🚀 Performance Tips

1. **Lazy load** heavy modals:
   ```tsx
   const HeavyModal = React.lazy(() => import('./HeavyModal'));
   ```

2. **Use React.memo** for static content:
   ```tsx
   const ModalContent = React.memo(() => <div>Static content</div>);
   ```

3. **Avoid re-renders**:
   ```tsx
   const handleSubmit = useCallback(async () => {
     await save();
   }, []);
   ```

4. **Clean up on unmount**:
   ```tsx
   useEffect(() => {
     return () => {
       // Cleanup timers, listeners, etc.
     };
   }, []);
   ```

---

**Happy coding! 🎉**
