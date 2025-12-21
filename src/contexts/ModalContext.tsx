import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Global Modal Context
 *
 * Provides centralized state management for all modals in the application.
 * This prevents prop drilling and makes it easy to open modals from anywhere.
 */

interface ModalContextType {
  // Image Source Selector
  imageSourceSelector: {
    isOpen: boolean;
    open: (onSelect: (file: File) => void) => void;
    close: () => void;
  };

  // Date Picker
  datePicker: {
    isOpen: boolean;
    open: (onSelect: (date: Date) => void, options?: { minDate?: Date; maxDate?: Date }) => void;
    close: () => void;
  };

  // Category Picker
  categoryPicker: {
    isOpen: boolean;
    open: (onSelect: (category: any) => void) => void;
    close: () => void;
  };

  // Delete Confirmation
  deleteConfirmation: {
    isOpen: boolean;
    open: (documentName: string, onConfirm: () => Promise<void>) => void;
    close: () => void;
  };

  // Share Sheet
  shareSheet: {
    isOpen: boolean;
    open: (document: any) => void;
    close: () => void;
  };

  // Reminder Settings
  reminderSettings: {
    isOpen: boolean;
    open: (documentId: string, currentConfig?: any) => void;
    close: () => void;
  };

  // Language Selector
  languageSelector: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
  };

  // Onboarding Carousel
  onboardingCarousel: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
  };
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  // Image Source Selector State
  const [imageSourceSelectorOpen, setImageSourceSelectorOpen] = useState(false);
  const [imageSourceCallback, setImageSourceCallback] = useState<((file: File) => void) | null>(null);

  // Date Picker State
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [datePickerCallback, setDatePickerCallback] = useState<((date: Date) => void) | null>(null);
  const [datePickerOptions, setDatePickerOptions] = useState<{ minDate?: Date; maxDate?: Date }>({});

  // Category Picker State
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [categoryPickerCallback, setCategoryPickerCallback] = useState<((category: any) => void) | null>(null);

  // Delete Confirmation State
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteConfirmationData, setDeleteConfirmationData] = useState<{
    documentName: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Share Sheet State
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [shareSheetDocument, setShareSheetDocument] = useState<any>(null);

  // Reminder Settings State
  const [reminderSettingsOpen, setReminderSettingsOpen] = useState(false);
  const [reminderSettingsData, setReminderSettingsData] = useState<{
    documentId: string;
    currentConfig?: any;
  } | null>(null);

  // Language Selector State
  const [languageSelectorOpen, setLanguageSelectorOpen] = useState(false);

  // Onboarding Carousel State
  const [onboardingCarouselOpen, setOnboardingCarouselOpen] = useState(false);

  const value: ModalContextType = {
    imageSourceSelector: {
      isOpen: imageSourceSelectorOpen,
      open: (onSelect) => {
        setImageSourceCallback(() => onSelect);
        setImageSourceSelectorOpen(true);
      },
      close: () => {
        setImageSourceSelectorOpen(false);
        setImageSourceCallback(null);
      },
    },

    datePicker: {
      isOpen: datePickerOpen,
      open: (onSelect, options = {}) => {
        setDatePickerCallback(() => onSelect);
        setDatePickerOptions(options);
        setDatePickerOpen(true);
      },
      close: () => {
        setDatePickerOpen(false);
        setDatePickerCallback(null);
        setDatePickerOptions({});
      },
    },

    categoryPicker: {
      isOpen: categoryPickerOpen,
      open: (onSelect) => {
        setCategoryPickerCallback(() => onSelect);
        setCategoryPickerOpen(true);
      },
      close: () => {
        setCategoryPickerOpen(false);
        setCategoryPickerCallback(null);
      },
    },

    deleteConfirmation: {
      isOpen: deleteConfirmationOpen,
      open: (documentName, onConfirm) => {
        setDeleteConfirmationData({ documentName, onConfirm });
        setDeleteConfirmationOpen(true);
      },
      close: () => {
        setDeleteConfirmationOpen(false);
        setDeleteConfirmationData(null);
      },
    },

    shareSheet: {
      isOpen: shareSheetOpen,
      open: (document) => {
        setShareSheetDocument(document);
        setShareSheetOpen(true);
      },
      close: () => {
        setShareSheetOpen(false);
        setShareSheetDocument(null);
      },
    },

    reminderSettings: {
      isOpen: reminderSettingsOpen,
      open: (documentId, currentConfig) => {
        setReminderSettingsData({ documentId, currentConfig });
        setReminderSettingsOpen(true);
      },
      close: () => {
        setReminderSettingsOpen(false);
        setReminderSettingsData(null);
      },
    },

    languageSelector: {
      isOpen: languageSelectorOpen,
      open: () => setLanguageSelectorOpen(true),
      close: () => setLanguageSelectorOpen(false),
    },

    onboardingCarousel: {
      isOpen: onboardingCarouselOpen,
      open: () => setOnboardingCarouselOpen(true),
      close: () => setOnboardingCarouselOpen(false),
    },
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModals must be used within a ModalProvider');
  }
  return context;
}

/**
 * Usage Examples:
 *
 * // In your App.tsx or _app.tsx:
 * <ModalProvider>
 *   <App />
 * </ModalProvider>
 *
 * // In any component:
 * const modals = useModals();
 *
 * // Open image selector
 * modals.imageSourceSelector.open((file) => {
 *   console.log('Selected file:', file);
 *   // Navigate to preview, etc.
 * });
 *
 * // Open date picker
 * modals.datePicker.open((date) => {
 *   setExpiryDate(date);
 * }, { minDate: new Date() });
 *
 * // Open delete confirmation
 * modals.deleteConfirmation.open('Passport', async () => {
 *   await deleteDocument(id);
 * });
 *
 * // Open share sheet
 * modals.shareSheet.open(document);
 */
