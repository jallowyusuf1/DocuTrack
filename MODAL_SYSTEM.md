# DocuTrack Modal System Documentation

This document provides comprehensive documentation for all modals in the DocuTrack application, including their interactions, data flow, and usage examples.

## Table of Contents

1. [Base Modal Component](#base-modal-component)
2. [Image Source Selector](#image-source-selector)
3. [Date Picker](#date-picker)
4. [Category Picker](#category-picker)
5. [Delete Confirmation](#delete-confirmation)
6. [Reminder Settings](#reminder-settings)
7. [Share Sheet](#share-sheet)
8. [Language Selector](#language-selector)
9. [Success Toast](#success-toast)
10. [Loading Overlay](#loading-overlay)
11. [Onboarding Carousel](#onboarding-carousel)

---

## Base Modal Component

### Purpose
Provides the foundational modal wrapper with common functionality.

### Features
- ✅ Backdrop click to dismiss
- ✅ ESC key to close
- ✅ Body scroll lock when open
- ✅ Smooth fade + scale animations
- ✅ Multiple size options (sm, md, lg, full)

### Props
```typescript
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}
```

### Usage Example
```tsx
import BaseModal from './components/modals/BaseModal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="My Modal"
      size="md"
    >
      <p>Modal content goes here</p>
    </BaseModal>
  );
}
```

---

## Image Source Selector

### Purpose
Allows users to choose between taking a photo with camera or selecting from gallery.

### Trigger
- "Add Document" button click

### Features
- ✅ Camera option with `capture="environment"`
- ✅ Gallery option with file picker
- ✅ Automatic modal dismiss after selection
- ✅ File type validation (`image/*`)
- ✅ Hover effects and animations

### Props
```typescript
interface ImageSourceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectGallery: () => void;
}
```

### Data Flow
1. User clicks "Add Document" button
2. Modal opens with Camera and Gallery options
3. User selects an option:
   - **Camera**: Opens camera capture → Returns File
   - **Gallery**: Opens file picker → Returns File
4. Modal dismisses
5. Navigate to preview screen with selected image

### Usage Example
```tsx
import { ImageSourceSelector } from './components/modals';

function AddDocument() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImageSelected = (file: File) => {
    setSelectedFile(file);
    setIsOpen(false);
    // Navigate to preview screen
    navigate('/preview', { state: { file } });
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Add Document</button>
      <ImageSourceSelector
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelectCamera={() => {
          // Trigger camera input
          cameraInputRef.current?.click();
        }}
        onSelectGallery={() => {
          // Trigger gallery input
          galleryInputRef.current?.click();
        }}
      />
    </>
  );
}
```

---

## Date Picker

### Purpose
Advanced date selection with calendar grid and iOS-style wheel picker modes.

### Trigger
- Click on date input field

### Features
- ✅ **Two modes**: Calendar grid OR Wheel picker
- ✅ **Calendar Mode**:
  - Click date to select
  - Purple highlight for selected date
  - Navigation arrows for months
  - "Today" indicator
- ✅ **Wheel Mode**:
  - Scrollable Month/Day/Year wheels
  - Auto-update on scroll
  - iOS-style picker
- ✅ **Presets Sidebar**: Today, +1 month, +3 months, +6 months, +1 year
- ✅ **Validation**: Min/max dates (expiry must be future)
- ✅ **Range Selection** (optional): Start and end dates

### Props
```typescript
interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
  allowRange?: boolean;
  minDate?: Date;
  maxDate?: Date;
}
```

### Data Flow
1. User clicks date input field
2. Modal opens with current/selected date
3. User interacts:
   - **Calendar**: Click date cells
   - **Wheel**: Scroll to select month/day/year
   - **Presets**: Click quick select button
4. User clicks "Done"
5. Selected date returned to form
6. Modal closes
7. Input field updates with formatted date

### Usage Example
```tsx
import { DatePicker } from './components/modals';

function DocumentForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);

  return (
    <>
      <input
        type="text"
        value={expiryDate ? expiryDate.toLocaleDateString() : ''}
        onClick={() => setIsOpen(true)}
        readOnly
        placeholder="Select expiry date"
      />
      <DatePicker
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelectDate={(date) => {
          setExpiryDate(date);
          setIsOpen(false);
        }}
        selectedDate={expiryDate || undefined}
        minDate={new Date()} // Must be future
      />
    </>
  );
}
```

---

## Category Picker

### Purpose
Select or create document categories with visual cards and search.

### Trigger
- Click category dropdown

### Features
- ✅ Grid of category cards (Icon + Name + Count)
- ✅ Real-time search filter
- ✅ "+ Add Custom" button
- ✅ Inline custom category form (Name + Icon picker)
- ✅ Auto-insert to database
- ✅ Auto-select after creation

### Props
```typescript
interface CategoryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: Category) => void;
  selectedCategoryId?: string;
  categories: Category[];
  onCreateCategory: (name: string, icon: string) => Promise<Category>;
}
```

### Data Flow
1. User clicks category dropdown
2. Modal opens with all categories
3. User can:
   - **Search**: Type to filter categories
   - **Select**: Click existing category card
   - **Create**: Click "+ Add Custom" → Show form → Fill name/icon → Save
4. On select/create:
   - Update form field
   - Close modal
5. If custom created:
   - Insert to `categories` table
   - Add to local state
   - Auto-select new category

### Usage Example
```tsx
import { CategoryPicker } from './components/modals';
import { supabase } from './config/supabase';

function DocumentForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const handleCreateCategory = async (name: string, icon: string) => {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, icon, user_id: user.id })
      .select()
      .single();

    if (error) throw error;

    setCategories([...categories, data]);
    return data;
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        {category ? category.name : 'Select Category'}
      </button>
      <CategoryPicker
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelectCategory={(cat) => {
          setCategory(cat);
          setIsOpen(false);
        }}
        categories={categories}
        onCreateCategory={handleCreateCategory}
      />
    </>
  );
}
```

---

## Delete Confirmation

### Purpose
Confirm destructive delete action with warning message.

### Trigger
- Delete button on document

### Features
- ✅ Document preview thumbnail
- ✅ "Cannot be undone" warning
- ✅ Shared document indicator ("Will remove from X members")
- ✅ Cancel and Delete buttons (red)
- ✅ Blocks backdrop close
- ✅ Success toast after deletion

### Props
```typescript
interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  documentName: string;
  documentPreview?: string;
  isShared?: boolean;
  sharedWithCount?: number;
}
```

### Data Flow
1. User clicks delete button
2. Modal opens with document details
3. Shows warnings:
   - "This action cannot be undone"
   - If shared: "Will also remove from X family members"
4. User chooses:
   - **Cancel**: Close modal, no action
   - **Delete**: Call delete API
5. On delete success:
   - Delete from `documents` table
   - Delete image from storage
   - Show success toast
   - Navigate back/refresh list
6. On error:
   - Show error toast
   - Keep modal open

### Usage Example
```tsx
import { DeleteConfirmation } from './components/modals';
import { useToast } from './components/modals';

function DocumentView() {
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();

  const handleDelete = async () => {
    try {
      // Delete document
      const { error: docError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (docError) throw docError;

      // Delete image from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.image_path]);

      if (storageError) throw storageError;

      setIsOpen(false);
      showToast('Document deleted successfully', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast('Failed to delete document', 'error');
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Delete</button>
      <DeleteConfirmation
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        documentName={document.name}
        documentPreview={document.image_url}
        isShared={document.shared_with?.length > 0}
        sharedWithCount={document.shared_with?.length}
      />
    </>
  );
}
```

---

## Reminder Settings

### Purpose
Customize document expiry reminder notifications.

### Trigger
- "Customize Reminders" button

### Features
- ✅ Enable/disable toggle
- ✅ Preset checkboxes (30d, 7d, 1d before expiry)
- ✅ Custom reminder (number input + unit dropdown + time)
- ✅ Quiet hours (toggle + time range)
- ✅ Notification types (Push, Email checkboxes)
- ✅ Visual timeline (shows when reminders fire)
- ✅ Save to database

### Props
```typescript
interface ReminderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ReminderConfig) => Promise<void>;
  documentId: string;
  currentConfig?: ReminderConfig;
}

interface ReminderConfig {
  enabled: boolean;
  presets: { days: number; enabled: boolean }[];
  custom?: { value: number; unit: 'days' | 'weeks' | 'months'; time: string };
  quietHours?: { enabled: boolean; start: string; end: string };
  notifications: { push: boolean; email: boolean };
}
```

### Data Flow
1. User clicks "Customize Reminders"
2. Modal opens with current settings (or defaults)
3. User configures:
   - Enable/disable reminders
   - Select preset reminders
   - Add custom reminder
   - Set quiet hours
   - Choose notification types
4. Timeline updates in real-time
5. User clicks "Save"
6. Update `user_document_reminders` table
7. Close modal
8. Show success toast

### Usage Example
```tsx
import { ReminderSettings } from './components/modals';

function DocumentSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ReminderConfig | null>(null);

  const handleSave = async (newConfig: ReminderConfig) => {
    const { error } = await supabase
      .from('user_document_reminders')
      .upsert({
        document_id: documentId,
        user_id: user.id,
        ...newConfig,
      });

    if (error) throw error;

    setConfig(newConfig);
    setIsOpen(false);
    showToast('Reminder settings saved', 'success');
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Customize Reminders</button>
      <ReminderSettings
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
        documentId={documentId}
        currentConfig={config}
      />
    </>
  );
}
```

---

## Share Sheet

### Purpose
Share documents with family members or external apps.

### Trigger
- Share button on document

### Features
- ✅ **3 Tabs**: Family, Apps, Link
- ✅ **Family Tab**:
  - List of family connections
  - Checkboxes for multi-select
  - Permission toggle (view/edit)
  - Share button
- ✅ **Apps Tab**:
  - Native share API (`navigator.share()`)
  - OR app icons (Email, Messages, etc.)
- ✅ **Link Tab**:
  - Generate shareable link
  - Copy button
  - Expiry dropdown (1 day, 7 days, 30 days, Never)
  - QR code (optional)

### Props
```typescript
interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
  familyMembers: FamilyMember[];
  onShare: (members: string[], permission: 'view' | 'edit') => Promise<void>;
  onGenerateLink: (expiry?: Date) => Promise<string>;
}
```

### Data Flow

**Family Sharing:**
1. User clicks share button
2. Modal opens on Family tab
3. User selects family members (checkboxes)
4. User sets permission (view/edit)
5. User clicks "Share"
6. Insert records to `shared_documents` table
7. Send push notifications to recipients
8. Show success toast
9. Close modal

**Link Sharing:**
1. User switches to Link tab
2. User sets expiry
3. User clicks "Generate Link"
4. Create record in `document.shareable_links` table
5. Generate unique URL
6. Display link + copy button
7. User copies link
8. Show "Copied!" toast

### Usage Example
```tsx
import { ShareSheet } from './components/modals';

function DocumentView() {
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = async (memberIds: string[], permission: 'view' | 'edit') => {
    const records = memberIds.map(memberId => ({
      document_id: document.id,
      shared_with_user_id: memberId,
      permission,
      shared_by_user_id: user.id,
    }));

    const { error } = await supabase
      .from('shared_documents')
      .insert(records);

    if (error) throw error;

    // Send notifications
    await sendPushNotifications(memberIds, {
      title: `${user.name} shared a document`,
      body: document.name,
    });

    showToast(`Shared with ${memberIds.length} members`, 'success');
  };

  const handleGenerateLink = async (expiry?: Date) => {
    const token = crypto.randomUUID();
    const { data, error } = await supabase
      .from('shareable_links')
      .insert({
        document_id: document.id,
        token,
        expires_at: expiry,
      })
      .select()
      .single();

    if (error) throw error;

    return `${window.location.origin}/shared/${token}`;
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Share</button>
      <ShareSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        document={document}
        familyMembers={familyMembers}
        onShare={handleShare}
        onGenerateLink={handleGenerateLink}
      />
    </>
  );
}
```

---

## Language Selector

### Purpose
Change app language with preview and confirmation.

### Trigger
- Language setting click in settings

### Features
- ✅ List of languages with flags + names
- ✅ Preview panel (shows UI sample)
- ✅ Confirmation dialog ("App will reload")
- ✅ Update user locale in database
- ✅ Reload page with new i18n

### Props
```typescript
interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
  onSelectLanguage: (language: string) => Promise<void>;
}
```

### Languages
- 🇺🇸 English
- 🇫🇷 Français
- 🇪🇸 Español
- 🇸🇦 العربية

### Data Flow
1. User clicks language setting
2. Modal opens with language list
3. User hovers over language:
   - Preview panel shows sample UI in that language
4. User clicks language
5. Confirmation dialog: "App will reload to apply changes"
6. User confirms
7. Update user locale in database
8. Store in localStorage
9. Reload page
10. i18n loads new language

### Usage Example
```tsx
import { LanguageSelector } from './components/modals';
import { useTranslation } from 'react-i18next';

function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();

  const handleSelectLanguage = async (language: string) => {
    // Update database
    const { error } = await supabase
      .from('user_profiles')
      .update({ locale: language })
      .eq('id', user.id);

    if (error) throw error;

    // Update localStorage
    localStorage.setItem('language', language);

    // Change i18n language
    await i18n.changeLanguage(language);

    // Reload page
    window.location.reload();
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Language: {i18n.language}
      </button>
      <LanguageSelector
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentLanguage={i18n.language}
        onSelectLanguage={handleSelectLanguage}
      />
    </>
  );
}
```

---

## Success Toast

### Purpose
Show feedback for user actions with auto-dismiss and variants.

### Trigger
- Successful action (add, update, delete, share)

### Features
- ✅ **4 Variants**: Success (green), Error (red), Info (blue), Warning (orange)
- ✅ Auto-dismiss after 3-4 seconds
- ✅ Progress bar showing time remaining
- ✅ Pause on hover
- ✅ Action button (e.g., "Undo")
- ✅ Close button
- ✅ Stacking (max 3 visible)
- ✅ Smooth slide-in animation

### Usage with Hook
```tsx
import { useToast, SuccessToast } from './components/modals';

function App() {
  const { toasts, showToast, dismissToast } = useToast();

  const handleSave = async () => {
    try {
      await saveDocument();
      showToast('Document saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save document', 'error');
    }
  };

  const handleDelete = async () => {
    const documentId = '123';
    await deleteDocument(documentId);

    showToast('Document deleted', 'success', {
      action: {
        label: 'Undo',
        onClick: async () => {
          await restoreDocument(documentId);
          showToast('Document restored', 'success');
        },
      },
    });
  };

  return (
    <>
      <YourApp />
      <SuccessToast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
```

### Toast Variants
```tsx
// Success
showToast('Document saved!', 'success');

// Error
showToast('Failed to upload', 'error');

// Info
showToast('Processing your request', 'info');

// Warning
showToast('Document will expire soon', 'warning');

// With action button
showToast('Item deleted', 'success', {
  action: {
    label: 'Undo',
    onClick: () => restore(),
  },
});

// Custom duration (default 4s)
showToast('Quick message', 'info', {
  duration: 2000,
});
```

---

## Loading Overlay

### Purpose
Show loading state for long-running operations.

### Trigger
- Upload, export, processing operations

### Features
- ✅ Spinner animation
- ✅ Loading message
- ✅ **Progress mode**:
  - Progress bar
  - Percentage
  - Speed (e.g., "2.5 MB/s")
  - ETA (e.g., "30 seconds remaining")
- ✅ Cancel button (if supported)
- ✅ Cancel confirmation
- ✅ Blocks all interaction

### Usage with Hook
```tsx
import { useLoading, LoadingOverlay } from './components/modals';

function Upload() {
  const { isLoading, loadingMessage, progress, speed, eta, showLoading, hideLoading, updateProgress } = useLoading();

  const handleUpload = async (file: File) => {
    showLoading('Uploading document...');

    try {
      // Simulate upload with progress
      for (let i = 0; i <= 100; i += 10) {
        updateProgress(i, {
          speed: `${(Math.random() * 5 + 1).toFixed(1)} MB/s`,
          eta: `${Math.ceil((100 - i) / 10)} seconds`,
        });
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      hideLoading();
      showToast('Upload complete!', 'success');
    } catch (error) {
      hideLoading();
      showToast('Upload failed', 'error');
    }
  };

  return (
    <>
      <button onClick={() => handleUpload(file)}>Upload</button>
      <LoadingOverlay
        isOpen={isLoading}
        message={loadingMessage}
        showProgress={progress > 0}
        progress={progress}
        speed={speed}
        eta={eta}
        allowCancel={true}
        onCancel={() => {
          hideLoading();
          showToast('Upload cancelled', 'info');
        }}
      />
    </>
  );
}
```

---

## Onboarding Carousel

### Purpose
Welcome new users with interactive tutorial.

### Trigger
- First-time user OR "View Tutorial" button

### Features
- ✅ 5 onboarding screens
- ✅ Swipe/arrow navigation
- ✅ Dot indicators for progress
- ✅ "Skip" button (dismiss + mark as seen)
- ✅ Last screen: "Get Started" button
- ✅ Auto-save completion to user preferences

### Screens
1. **Welcome** - "Track all your important documents"
2. **Add Documents** - "Snap a photo or upload from gallery"
3. **Set Reminders** - "Never miss an expiry date"
4. **Share** - "Collaborate with family members"
5. **Get Started** - "You're all set!"

### Props
```typescript
interface OnboardingCarouselProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => Promise<void>;
}
```

### Data Flow
1. Check if user has seen onboarding
2. If not, show modal on first app load
3. User navigates through screens:
   - Swipe left/right
   - Click arrow buttons
   - Track current screen with dots
4. User can:
   - **Skip**: Close modal, mark as seen
   - **Get Started** (last screen): Complete onboarding
5. Save to database: `user_preferences.has_seen_onboarding = true`
6. Close modal
7. Proceed to app

### Usage Example
```tsx
import { OnboardingCarousel } from './components/modals';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const checkOnboarding = async () => {
      const { data } = await supabase
        .from('user_preferences')
        .select('has_seen_onboarding')
        .eq('user_id', user.id)
        .single();

      if (!data?.has_seen_onboarding) {
        setShowOnboarding(true);
      }
    };

    checkOnboarding();
  }, []);

  const handleComplete = async () => {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        has_seen_onboarding: true,
      });

    if (error) throw error;

    setShowOnboarding(false);
  };

  return (
    <>
      <YourApp />
      <OnboardingCarousel
        isOpen={showOnboarding}
        onClose={handleComplete}
        onComplete={handleComplete}
      />
    </>
  );
}
```

---

## Common Modal Patterns

### 1. Form Modals
```tsx
function FormModal() {
  const [data, setData] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Save data
    await save(data);
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <button type="submit">Save</button>
      </form>
    </BaseModal>
  );
}
```

### 2. Confirmation Modals
```tsx
function ConfirmModal() {
  const handleConfirm = async () => {
    await performAction();
    onClose();
    showToast('Action completed', 'success');
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <h2>Are you sure?</h2>
      <p>This action cannot be undone.</p>
      <button onClick={onClose}>Cancel</button>
      <button onClick={handleConfirm}>Confirm</button>
    </BaseModal>
  );
}
```

### 3. Multi-step Modals
```tsx
function MultiStepModal() {
  const [step, setStep] = useState(1);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      {step === 1 && <Step1 onNext={() => setStep(2)} />}
      {step === 2 && <Step2 onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <Step3 onComplete={handleComplete} onBack={() => setStep(2)} />}
    </BaseModal>
  );
}
```

---

## Best Practices

### 1. State Management
- Use `useState` for modal open/close state
- Store modal data in component state or context
- Clear modal state on close

### 2. Error Handling
```tsx
const handleAction = async () => {
  try {
    await performAction();
    onClose();
    showToast('Success!', 'success');
  } catch (error) {
    showToast(error.message, 'error');
    // Keep modal open to allow retry
  }
};
```

### 3. Loading States
```tsx
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await save();
  } finally {
    setIsLoading(false);
  }
};
```

### 4. Accessibility
- Always provide `title` prop
- Use semantic HTML
- Support keyboard navigation
- Add ARIA labels where needed

### 5. Performance
- Lazy load heavy modals
- Use `React.memo` for complex content
- Avoid unnecessary re-renders
- Clean up timers/listeners on unmount

---

## Testing Modals

### Unit Tests
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BaseModal } from './BaseModal';

test('closes on backdrop click', () => {
  const onClose = jest.fn();
  render(<BaseModal isOpen={true} onClose={onClose}>Content</BaseModal>);

  const backdrop = screen.getByRole('presentation');
  fireEvent.click(backdrop);

  expect(onClose).toHaveBeenCalled();
});
```

### Integration Tests
```tsx
test('ImageSourceSelector flow', async () => {
  const onSelectCamera = jest.fn();
  render(<ImageSourceSelector isOpen={true} onSelectCamera={onSelectCamera} />);

  const cameraButton = screen.getByText('Take Photo');
  fireEvent.click(cameraButton);

  expect(onSelectCamera).toHaveBeenCalled();
});
```

---

## Troubleshooting

### Modal not opening
- Check `isOpen` prop is `true`
- Verify parent component is rendering
- Check z-index conflicts

### Backdrop not blocking clicks
- Ensure `closeOnBackdrop` is not `false`
- Check for overlapping elements with higher z-index

### Scroll issues
- Body scroll lock should auto-apply
- Check for `overflow: hidden` conflicts

### Animation glitches
- Ensure Framer Motion is installed
- Check for CSS transitions interfering
- Verify AnimatePresence wrapper is present

---

## Summary

All modals in DocuTrack follow these principles:

✅ **Consistent UX**: Backdrop click, ESC key, smooth animations
✅ **Accessibility**: Keyboard navigation, semantic HTML, ARIA labels
✅ **Data Flow**: Clear props, callbacks, and state management
✅ **Error Handling**: Try/catch, user feedback via toasts
✅ **Performance**: Lazy loading, memo optimization
✅ **Mobile-First**: Touch-friendly, responsive design

For any questions or issues, refer to the component source code in `src/components/modals/`.
