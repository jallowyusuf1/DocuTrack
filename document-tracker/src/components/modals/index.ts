// Base modal component
export { DesktopModal } from './DesktopModal';

// New desktop-optimized modals
export { ImageSourceSelector } from './ImageSourceSelector';
export { DatePicker } from './DatePicker';
export { CategoryPicker } from './CategoryPicker';
export { DeleteConfirmation } from './DeleteConfirmation';
export { ReminderSettings } from './ReminderSettings';
export { ShareSheet } from './ShareSheet';
export { LanguageSelector } from './LanguageSelector';
export { OnboardingCarousel } from './OnboardingCarousel';

// Loading and toast components
export { default as LoadingOverlay, useLoading } from './LoadingOverlay';
export { SuccessToast, useToast } from './SuccessToast';

// Legacy desktop modals (for backwards compatibility)
export { default as ImageSourceSelectorModal } from './ImageSourceSelectorModal';
export { default as DesktopDatePickerModal } from './DesktopDatePickerModal';
export { default as CategoryPickerModal } from './CategoryPickerModal';
export { default as DesktopDeleteConfirmationModal } from './DesktopDeleteConfirmationModal';
export { default as ReminderSettingsModal } from './ReminderSettingsModal';
export { default as ShareSheetModal } from './ShareSheetModal';
export { default as DesktopLanguageSelectorModal } from './DesktopLanguageSelectorModal';
export { default as OnboardingCarouselModal } from './OnboardingCarouselModal';

// Types
export type { ReminderConfig } from './ReminderSettings';

