import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, Loader2, Link as LinkIcon, Bell, Repeat, 
  AlertCircle, Check, Plus, Trash2, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { dateService } from '../../services/dateService';
import { documentService } from '../../services/documents';
import { useToast } from '../../hooks/useToast';
import type { DateFormData, Document } from '../../types';
import { GlassCard, GlassButton, GlassInput, GlassTile } from '../ui/glass/Glass';
import { useTheme } from '../../contexts/ThemeContext';
import { triggerHaptic } from '../../utils/animations';

const CATEGORIES = [
  { value: 'birthday', label: 'Birthday', emoji: '🎂' },
  { value: 'anniversary', label: 'Anniversary', emoji: '💑' },
  { value: 'appointment', label: 'Appointment', emoji: '🗓️' },
  { value: 'deadline', label: 'Deadline', emoji: '⏰' },
  { value: 'holiday', label: 'Holiday', emoji: '🎉' },
  { value: 'meeting', label: 'Meeting', emoji: '👥' },
  { value: 'other', label: 'Other', emoji: '📅' },
];

const PRIORITIES = [
  { value: 'high', label: 'High', emoji: '🔴', color: '#EF4444' },
  { value: 'medium', label: 'Medium', emoji: '🟠', color: '#F97316' },
  { value: 'low', label: 'Low', emoji: '🟢', color: '#10B981' },
];

interface AddImportantDateModalEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string;
  editingDateId?: string;
}

interface CustomReminder {
  id: string;
  days_before: number;
  time_of_day: string;
}

export default function AddImportantDateModalEnhanced({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
  editingDateId,
}: AddImportantDateModalEnhancedProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { toasts, showToast, removeToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [showDocumentSearch, setShowDocumentSearch] = useState(false);
  const [documentSearchTerm, setDocumentSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['date-info']));
  const [customReminders, setCustomReminders] = useState<CustomReminder[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    getValues,
  } = useForm<DateFormData>({
    defaultValues: {
      title: '',
      description: '',
      date: initialDate || '',
      category: 'other',
      priority: 'medium',
      repeat_annually: false,
      linked_document_ids: [],
      reminders: {
        enabled: true,
        preset_reminders: {
          '30_days': false,
          '7_days': true,
          '1_day': true,
          'on_day': true,
        },
        time_of_day: '09:00',
        notification_methods: {
          in_app: true,
          push: true,
          email: false,
          sms: false,
        },
      },
    },
  });

  const watchedTitle = watch('title');
  const watchedDescription = watch('description');
  const watchedDate = watch('date');
  const watchedCategory = watch('category');
  const watchedPriority = watch('priority');
  const watchedRepeatAnnually = watch('repeat_annually');
  const watchedRemindersEnabled = watch('reminders.enabled');
  const watchedLinkedDocs = watch('linked_document_ids') || [];
  const watchedPresetReminders = watch('reminders.preset_reminders') || {};
  const watchedTimeOfDay = watch('reminders.time_of_day') || '09:00';
  const watchedNotificationMethods = watch('reminders.notification_methods') || {};

  // Load documents for linking
  useEffect(() => {
    if (isOpen && user?.id && showDocumentSearch) {
      loadDocuments();
    }
  }, [isOpen, user?.id, showDocumentSearch]);

  // Load existing date if editing
  useEffect(() => {
    if (isOpen && editingDateId) {
      loadExistingDate();
    } else if (isOpen) {
      reset({
        title: '',
        description: '',
        date: initialDate || '',
        category: 'other',
        priority: 'medium',
        repeat_annually: false,
        linked_document_ids: [],
        reminders: {
          enabled: true,
          preset_reminders: {
            '30_days': false,
            '7_days': true,
            '1_day': true,
            'on_day': true,
          },
          time_of_day: '09:00',
          notification_methods: {
            in_app: true,
            push: true,
            email: false,
            sms: false,
          },
        },
      });
    }
  }, [isOpen, editingDateId, initialDate, reset]);

  const loadDocuments = async () => {
    if (!user?.id) return;
    setLoadingDocuments(true);
    try {
      const docs = await documentService.getDocuments(user.id);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      showToast('Failed to load documents', 'error');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const loadExistingDate = async () => {
    if (!editingDateId || !user?.id) return;
    try {
      const date = await dateService.getDateById(editingDateId);
      if (date) {
        reset({
          title: date.title,
          description: date.description || '',
          date: date.date,
          category: date.category || 'other',
          priority: (date as any).priority || 'medium',
          repeat_annually: (date as any).repeat_annually || false,
        });
      }
    } catch (error) {
      console.error('Failed to load date:', error);
      showToast('Failed to load date', 'error');
    }
  };

  const filteredDocuments = useMemo(() => {
    if (!documentSearchTerm) return documents;
    const term = documentSearchTerm.toLowerCase();
    return documents.filter(
      (doc) =>
        doc.document_name.toLowerCase().includes(term) ||
        doc.document_type.toLowerCase().includes(term) ||
        doc.category?.toLowerCase().includes(term)
    );
  }, [documents, documentSearchTerm]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const addCustomReminder = () => {
    const newReminder: CustomReminder = {
      id: Date.now().toString(),
      days_before: 1,
      time_of_day: '09:00',
    };
    setCustomReminders([...customReminders, newReminder]);
  };

  const removeCustomReminder = (id: string) => {
    setCustomReminders(customReminders.filter((r) => r.id !== id));
  };

  const updateCustomReminder = (id: string, field: keyof CustomReminder, value: any) => {
    setCustomReminders(
      customReminders.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const toggleLinkedDocument = (docId: string) => {
    const current = watchedLinkedDocs || [];
    if (current.includes(docId)) {
      setValue('linked_document_ids', current.filter((id) => id !== docId));
    } else {
      setValue('linked_document_ids', [...current, docId]);
    }
    triggerHaptic('light');
  };

  const getDateContext = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = parseISO(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysDiff = differenceInDays(date, today);
      
      if (daysDiff === 0) return 'Today';
      if (daysDiff === 1) return 'Tomorrow';
      if (daysDiff === -1) return 'Yesterday';
      if (daysDiff > 0) return `In ${daysDiff} days`;
      return `${Math.abs(daysDiff)} days ago`;
    } catch {
      return '';
    }
  };

  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const onSubmit = async (data: DateFormData) => {
    if (!user?.id) {
      showToast('Please log in to add dates', 'error');
      return;
    }

    if (!data.title || data.title.trim().length < 3) {
      showToast('Title must be at least 3 characters', 'error');
      return;
    }

    if (!data.date) {
      showToast('Please select a date', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const dateData: any = {
        title: data.title.trim(),
        date: data.date,
        category: data.category,
        description: data.description?.trim() || null,
        priority: data.priority || 'medium',
        repeat_annually: data.repeat_annually || false,
        user_id: user.id,
      };

      let dateId: string;
      if (editingDateId) {
        await dateService.updateDate(editingDateId, dateData);
        dateId = editingDateId;
      } else {
        const created = await dateService.createDate(dateData);
        dateId = created.id;
      }

      // Link documents
      if (data.linked_document_ids && data.linked_document_ids.length > 0) {
        await dateService.linkDocuments(dateId, data.linked_document_ids);
      }

      // Create reminders
      if (data.reminders?.enabled) {
        await dateService.createReminders(dateId, data.date, {
          preset_reminders: data.reminders.preset_reminders || {},
          custom_reminders: customReminders,
          time_of_day: data.reminders.time_of_day || '09:00',
          notification_methods: data.reminders.notification_methods || {},
          repeat_annually: data.repeat_annually || false,
        });
      }

      showToast(
        editingDateId ? 'Important date updated successfully!' : 'Important date added successfully!',
        'success'
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save date:', error);
      const errorMessage = error.message || 'Failed to save date. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const isLight = theme === 'light';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{
              background: isLight ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] w-full max-h-[90vh] overflow-y-auto"
            style={{
              background: isLight ? 'var(--glass-bg-light)' : 'var(--glass-bg-dark)',
              backdropFilter: 'blur(60px) saturate(150%)',
              WebkitBackdropFilter: 'blur(60px) saturate(150%)',
              border: isLight ? 'var(--glass-border-light)' : 'var(--glass-border-dark)',
              boxShadow: isLight ? 'var(--glass-shadow-light)' : 'var(--glass-shadow-dark)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="w-10 h-1 rounded-full"
                style={{
                  background: isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)',
                }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b"
              style={{
                borderColor: isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <h2 className="text-xl font-bold" style={{ color: isLight ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                {editingDateId ? 'Edit Important Date' : 'Add Important Date'}
              </h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="p-2 rounded-lg transition-colors"
                style={{
                  color: isLight ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-4">
              {/* Date Name */}
              <GlassInput
                label={
                  <>
                    Date Name <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </>
                }
                placeholder="e.g., Mom's Birthday, Visa Interview"
                maxLength={100}
                icon={<Calendar className="w-5 h-5" />}
                {...register('title', {
                  required: 'Date name is required',
                  minLength: { value: 3, message: 'Must be at least 3 characters' },
                  maxLength: { value: 100, message: 'Must be less than 100 characters' },
                })}
                error={errors.title?.message}
              />

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: isLight ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                  Date <span style={{ color: 'var(--accent-red)' }}>*</span>
                </label>
                <input
                  type="date"
                  {...register('date', { required: 'Date is required' })}
                  className="w-full h-[52px] px-4 rounded-xl text-base"
                  style={{
                    background: isLight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(40, 40, 40, 0.6)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    border: errors.date
                      ? '1px solid var(--accent-red)'
                      : isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: isLight ? 'var(--text-primary)' : 'var(--text-primary)',
                  }}
                />
                {watchedDate && (
                  <p className="mt-1 text-sm" style={{ color: isLight ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}>
                    {formatDateDisplay(watchedDate)} • {getDateContext(watchedDate)}
                  </p>
                )}
                {errors.date && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--accent-red)' }}>{errors.date.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: isLight ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                  Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat.value}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        triggerHaptic('light');
                        setValue('category', cat.value);
                      }}
                      className="p-3 rounded-xl text-center transition-all"
                      style={{
                        background: watchedCategory === cat.value
                          ? isLight ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.3)'
                          : isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(40, 40, 40, 0.5)',
                        border: watchedCategory === cat.value
                          ? '2px solid var(--accent-blue)'
                          : isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(30px)',
                        WebkitBackdropFilter: 'blur(30px)',
                      }}
                    >
                      <div className="text-2xl mb-1">{cat.emoji}</div>
                      <div className="text-xs font-medium" style={{ color: isLight ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                        {cat.label}
                      </div>
                    </motion.button>
                  ))}
                </div>
                <input type="hidden" {...register('category')} />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: isLight ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                  Description <span className="text-xs" style={{ color: isLight ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}>(Optional)</span>
                </label>
                <textarea
                  {...register('description', {
                    maxLength: { value: 500, message: 'Must be less than 500 characters' },
                  })}
                  placeholder="Add notes about this date..."
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-base resize-none"
                  style={{
                    background: isLight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(40, 40, 40, 0.6)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    border: errors.description
                      ? '1px solid var(--accent-red)'
                      : isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: isLight ? 'var(--text-primary)' : 'var(--text-primary)',
                  }}
                />
                <div className="flex justify-between mt-1">
                  {errors.description && (
                    <p className="text-sm" style={{ color: 'var(--accent-red)' }}>{errors.description.message}</p>
                  )}
                  <p className="text-xs ml-auto" style={{ color: isLight ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}>
                    {(watchedDescription || '').length}/500
                  </p>
                </div>
              </div>

              {/* Link to Document - Collapsible */}
              <GlassTile
                interactive
                onClick={() => {
                  triggerHaptic('light');
                  toggleSection('document-link');
                  if (!showDocumentSearch) setShowDocumentSearch(true);
                }}
                className="p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LinkIcon className="w-5 h-5" style={{ color: isLight ? 'var(--text-secondary)' : 'var(--text-tertiary)' }} />
                    <div>
                      <div className="font-medium" style={{ color: isLight ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                        Link to Document
                      </div>
                      <div className="text-xs" style={{ color: isLight ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}>
                        {watchedLinkedDocs.length > 0 ? `${watchedLinkedDocs.length} document(s) linked` : 'Optional - Link related documents'}
                      </div>
                    </div>
                  </div>
                  {expandedSections.has('document-link') ? (
                    <ChevronUp className="w-5 h-5" style={{ color: isLight ? 'var(--text-secondary)' : 'var(--text-tertiary)' }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: isLight ? 'var(--text-secondary)' : 'var(--text-tertiary)' }} />
                  )}
                </div>

                <AnimatePresence>
                  {expandedSections.has('document-link') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 overflow-hidden"
                    >
                      {loadingDocuments ? (
                        <div className="text-center py-4">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" style={{ color: isLight ? 'var(--text-secondary)' : 'var(--text-tertiary)' }} />
                        </div>
                      ) : (
                        <>
                          <GlassInput
                            placeholder="Search documents..."
                            value={documentSearchTerm}
                            onChange={(e) => setDocumentSearchTerm(e.target.value)}
                            icon={<Calendar className="w-5 h-5" />}
                            className="mb-3"
                          />
                          <div className="max-h-48 overflow-y-auto space-y-2">
                            {filteredDocuments.length === 0 ? (
                              <p className="text-sm text-center py-4" style={{ color: isLight ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}>
                                No documents found
                              </p>
                            ) : (
                              filteredDocuments.map((doc) => {
                                const isSelected = watchedLinkedDocs.includes(doc.id);
                                return (
                                  <motion.button
                                    key={doc.id}
                                    type="button"
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleLinkedDocument(doc.id)}
                                    className="w-full p-3 rounded-xl text-left flex items-center gap-3 transition-all"
                                    style={{
                                      background: isSelected
                                        ? isLight ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.3)'
                                        : isLight ? 'rgba(255, 255, 255, 0.4)' : 'rgba(40, 40, 40, 0.4)',
                                      border: isSelected
                                        ? '2px solid var(--accent-blue)'
                                        : isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.1)',
                                    }}
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium text-sm" style={{ color: isLight ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                                        {doc.document_name}
                                      </div>
                                      <div className="text-xs" style={{ color: isLight ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}>
                                        {doc.document_type} • {doc.category}
                                      </div>
                                    </div>
                                    {isSelected && <Check className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />}
                                  </motion.button>
                                );
                              })
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassTile>

              {/* Reminder Settings - Collapsible */}
              <GlassTile
                interactive
                onClick={() => {
                  triggerHaptic('light');
                  toggleSection('reminders');
                }}
                className="p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5" style={{ color: isLight ? 'var(--text-secondary)' : 'var(--text-tertiary)' }} />
                    <div>
                      <div className="font-medium" style={{ color: isLight ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                        Reminder Settings
                      </div>
                      <div className="text-xs" style={{ color: isLight ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}>
                        {watchedRemindersEnabled ? 'Reminders enabled' : 'Reminders disabled'}
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={watchedRemindersEnabled}
                      onChange={(e) => setValue('reminders.enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div
                      className="w-11 h-6 rounded-full peer transition-colors"
                      style={{
                        background: watchedRemindersEnabled
                          ? 'var(--accent-blue)'
                          : isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full bg-white transition-transform"
                        style={{
                          transform: watchedRemindersEnabled ? 'translateX(22px)' : 'translateX(2px)',
                        }}
                      />
                    </div>
                  </label>
                </div>

                <AnimatePresence>
                  {expandedSections.has('reminders') && watchedRemindersEnabled && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 overflow-hidden space-y-3"
                    >
                      {/* Preset Reminders */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: isLight ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                          Preset Reminders
                        </label>
                        <div className="space-y-2">
                          {[
                            { key: '30_days', label: '30 days before' },
                            { key: '7_days', label: '7 days before' },
                            { key: '1_day', label: '1 day before' },
                            { key: 'on_day', label: 'On the day' },
                          ].map((preset) => (
                            <label key={preset.key} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={watchedPresetReminders[preset.key as keyof typeof watchedPresetReminders] || false}
                                onChange={(e) =>
                                  setValue(`reminders.preset_reminders.${preset.key}`, e.target.checked)
                                }
                                className="w-5 h-5 rounded"
                                style={{
                                  accentColor: 'var(--accent-blue)',
                                }}
                              />
                              <span className="text-sm" style={{ color: isLight ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                                {preset.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Time of Day */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: isLight ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                          Time of Day
                        </label>
                        <input
                          type="time"
                          value={watchedTimeOfDay}
                          onChange={(e) => setValue('reminders.time_of_day', e.target.value)}
                          className="w-full h-[52px] px-4 rounded-xl text-base"
                          style={{
                            background: isLight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(40, 40, 40, 0.6)',
                            backdropFilter: 'blur(30px)',
                            WebkitBackdropFilter: 'blur(30px)',
                            border: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.15)',
                            color: isLight ? 'var(--text-primary)' : 'var(--text-primary)',
                          }}
                        />
                      </div>

                      {/* Notification Methods */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: isLight ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                          Notification Methods
                        </label>
                        <div className="space-y-2">
                          {[
                            { key: 'in_app', label: 'In-app notification' },
                            { key: 'push', label: 'Push notification' },
                            { key: 'email', label: 'Email' },
                            { key: 'sms', label: 'SMS' },
                          ].map((method) => (
                            <label key={method.key} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={watchedNotificationMethods[method.key as keyof typeof watchedNotificationMethods] || false}
                                onChange={(e) =>
                                  setValue(`reminders.notification_methods.${method.key}`, e.target.checked)
                                }
                                className="w-5 h-5 rounded"
                                style={{
                                  accentColor: 'var(--accent-blue)',
                                }}
                              />
                              <span className="text-sm" style={{ color: isLight ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                                {method.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Custom Reminders */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium" style={{ color: isLight ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                            Custom Reminders
                          </label>
                          <GlassButton
                            type="button"
                            variant="secondary"
                            onClick={addCustomReminder}
                            icon={<Plus className="w-4 h-4" />}
                            className="text-xs"
                          >
                            Add Custom
                          </GlassButton>
                        </div>
                        {customReminders.length > 0 && (
                          <div className="space-y-2">
                            {customReminders.map((reminder) => (
                              <div key={reminder.id} className="flex items-center gap-2 p-3 rounded-xl"
                                style={{
                                  background: isLight ? 'rgba(255, 255, 255, 0.4)' : 'rgba(40, 40, 40, 0.4)',
                                }}
                              >
                                <input
                                  type="number"
                                  min="0"
                                  max="365"
                                  value={reminder.days_before}
                                  onChange={(e) =>
                                    updateCustomReminder(reminder.id, 'days_before', parseInt(e.target.value) || 0)
                                  }
                                  className="w-20 h-10 px-2 rounded-lg text-sm"
                                  style={{
                                    background: isLight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(40, 40, 40, 0.6)',
                                    border: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.15)',
                                    color: isLight ? 'var(--text-primary)' : 'var(--text-primary)',
                                  }}
                                />
                                <span className="text-sm" style={{ color: isLight ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}>
                                  days before at
                                </span>
                                <input
                                  type="time"
                                  value={reminder.time_of_day}
                                  onChange={(e) =>
                                    updateCustomReminder(reminder.id, 'time_of_day', e.target.value)
                                  }
                                  className="h-10 px-2 rounded-lg text-sm"
                                  style={{
                                    background: isLight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(40, 40, 40, 0.6)',
                                    border: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.15)',
                                    color: isLight ? 'var(--text-primary)' : 'var(--text-primary)',
                                  }}
                                />
                                <motion.button
                                  type="button"
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => removeCustomReminder(reminder.id)}
                                  className="p-2 rounded-lg"
                                  style={{
                                    color: 'var(--accent-red)',
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassTile>

              {/* Repeat Annually */}
              <GlassTile className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Repeat className="w-5 h-5" style={{ color: isLight ? 'var(--text-secondary)' : 'var(--text-tertiary)' }} />
                    <div>
                      <div className="font-medium" style={{ color: isLight ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                        Repeat Annually
                      </div>
                      <div className="text-xs" style={{ color: isLight ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}>
                        {watchedRepeatAnnually ? 'This date will repeat every year' : 'One-time date'}
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={watchedRepeatAnnually}
                      onChange={(e) => setValue('repeat_annually', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div
                      className="w-11 h-6 rounded-full peer transition-colors"
                      style={{
                        background: watchedRepeatAnnually
                          ? 'var(--accent-green)'
                          : isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full bg-white transition-transform"
                        style={{
                          transform: watchedRepeatAnnually ? 'translateX(22px)' : 'translateX(2px)',
                        }}
                      />
                    </div>
                  </label>
                </div>
              </GlassTile>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: isLight ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRIORITIES.map((priority) => (
                    <motion.button
                      key={priority.value}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        triggerHaptic('light');
                        setValue('priority', priority.value as any);
                      }}
                      className="p-3 rounded-xl text-center transition-all"
                      style={{
                        background: watchedPriority === priority.value
                          ? isLight ? `${priority.color}20` : `${priority.color}30`
                          : isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(40, 40, 40, 0.5)',
                        border: watchedPriority === priority.value
                          ? `2px solid ${priority.color}`
                          : isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(30px)',
                        WebkitBackdropFilter: 'blur(30px)',
                      }}
                    >
                      <div className="text-xl mb-1">{priority.emoji}</div>
                      <div className="text-xs font-medium" style={{ color: isLight ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                        {priority.label}
                      </div>
                    </motion.button>
                  ))}
                </div>
                <input type="hidden" {...register('priority')} />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <GlassButton
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Cancel
                </GlassButton>
                <GlassButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingDateId ? 'Update Date' : 'Add Date'
                  )}
                </GlassButton>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

