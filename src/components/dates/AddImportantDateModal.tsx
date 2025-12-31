import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Loader2, Search, Link as LinkIcon, Bell, Repeat } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { dateService } from '../../services/dateService';
import { documentService } from '../../services/documents';
import { useToast } from '../../hooks/useToast';
import type { DateFormData, Document } from '../../types';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import Toggle from '../ui/Toggle';
import Checkbox from '../ui/Checkbox';
import DatePickerModal from '../ui/DatePickerModal';
import Toast from '../ui/Toast';
import { getTransition, transitions, triggerHaptic } from '../../utils/animations';

// Categories with icons/emoji as per spec
const CATEGORIES = [
  { value: 'Birthday', label: 'Birthday', emoji: '🎂' },
  { value: 'Anniversary', label: 'Anniversary', emoji: '💑' },
  { value: 'Appointment', label: 'Appointment', emoji: '🗓️' },
  { value: 'Deadline', label: 'Deadline', emoji: '⏰' },
  { value: 'Holiday', label: 'Holiday', emoji: '🎉' },
  { value: 'Meeting', label: 'Meeting', emoji: '👥' },
  { value: 'Other', label: 'Other', emoji: '📅' },
];

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High', emoji: '🔴', color: 'text-red-400' },
  { value: 'medium', label: 'Medium', emoji: '🟠', color: 'text-orange-400' },
  { value: 'low', label: 'Low', emoji: '🟢', color: 'text-green-400' },
];

interface AddImportantDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string;
}

export default function AddImportantDateModal({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
}: AddImportantDateModalProps) {
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State for document linking
  const [linkToDocument, setLinkToDocument] = useState(false);
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [documentSearch, setDocumentSearch] = useState('');
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // State for reminders
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [presetReminders, setPresetReminders] = useState({
    '30_days': true,
    '7_days': true,
    '1_day': true,
    'on_day': false,
  });
  const [reminderTime, setReminderTime] = useState('09:00');
  const [notificationMethods, setNotificationMethods] = useState({
    in_app: true,
    push: true,
    email: false,
    sms: false,
  });

  // State for repeat annually
  const [repeatAnnually, setRepeatAnnually] = useState(false);

  // State for priority
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState('Other');

  // Character counters
  const [titleLength, setTitleLength] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<DateFormData>({
    defaultValues: {
      title: '',
      description: '',
      date: '',
      category: 'Other',
      priority: 'medium',
    },
  });

  const watchedDate = watch('date');
  const watchedTitle = watch('title');
  const watchedDescription = watch('description');

  // Update character counters
  useEffect(() => {
    setTitleLength(watchedTitle?.length || 0);
  }, [watchedTitle]);

  useEffect(() => {
    setDescriptionLength(watchedDescription?.length || 0);
  }, [watchedDescription]);

  // Load user documents when link toggle is enabled
  useEffect(() => {
    if (linkToDocument && user?.id && userDocuments.length === 0) {
      loadUserDocuments();
    }
  }, [linkToDocument, user?.id]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        title: '',
        description: '',
        date: initialDate || '',
        category: 'Other',
        priority: 'medium',
      });
      setSelectedCategory('Other');
      setPriority('medium');
      setLinkToDocument(false);
      setSelectedDocuments([]);
      setRemindersEnabled(true);
      setRepeatAnnually(false);
      setPresetReminders({
        '30_days': true,
        '7_days': true,
        '1_day': true,
        'on_day': false,
      });
      setReminderTime('09:00');
      setNotificationMethods({
        in_app: true,
        push: true,
        email: false,
        sms: false,
      });
      setTitleLength(0);
      setDescriptionLength(0);
    }
  }, [isOpen, reset, initialDate]);

  const loadUserDocuments = async () => {
    if (!user?.id) return;
    setLoadingDocuments(true);
    try {
      const docs = await documentService.getDocuments(user.id);
      setUserDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      showToast('Failed to load documents', 'error');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleDateSelect = (date: string) => {
    triggerHaptic('light');
    setValue('date', date);
    setIsDatePickerOpen(false);
  };

  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const formattedDate = format(date, 'MMM dd, yyyy');

      // Show "In X days" or "X days ago"
      const distance = formatDistanceToNow(date, { addSuffix: true });
      return `${formattedDate} (${distance})`;
    } catch {
      return dateString;
    }
  };

  const toggleDocumentSelection = (docId: string) => {
    triggerHaptic('light');
    if (selectedDocuments.includes(docId)) {
      setSelectedDocuments(selectedDocuments.filter(id => id !== docId));
    } else {
      setSelectedDocuments([...selectedDocuments, docId]);
    }
  };

  const filteredDocuments = userDocuments.filter(doc =>
    doc.document_name.toLowerCase().includes(documentSearch.toLowerCase()) ||
    doc.document_type.toLowerCase().includes(documentSearch.toLowerCase())
  );

  const onSubmit = async (data: DateFormData) => {
    if (!user?.id) {
      showToast('Please log in to add dates', 'error');
      return;
    }

    // Validation
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
      // Create the date
      const dateData = {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        date: data.date,
        category: selectedCategory,
        priority,
        repeat_annually: repeatAnnually,
        user_id: user.id,
      };

      const createdDate = await dateService.createDate(dateData as any);

      // Link documents if any selected
      if (linkToDocument && selectedDocuments.length > 0) {
        await dateService.linkDocuments(createdDate.id, selectedDocuments);
      }

      // Create reminders if enabled
      if (remindersEnabled) {
        await dateService.createReminders(createdDate.id, data.date, {
          preset_reminders: presetReminders,
          time_of_day: reminderTime,
          notification_methods: notificationMethods,
          repeat_annually: repeatAnnually,
        });
      }

      const reminderCount = Object.values(presetReminders).filter(Boolean).length;
      const successMessage = remindersEnabled && reminderCount > 0
        ? `Important date added! ${reminderCount} reminder${reminderCount > 1 ? 's' : ''} set.`
        : 'Important date added successfully!';

      showToast(successMessage, 'success');
      triggerHaptic('success');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to create date:', error);
      const errorMessage = error.message || 'Failed to add date. Please try again.';
      showToast(errorMessage, 'error');
      triggerHaptic('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={getTransition(transitions.spring)}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] w-full max-h-[90vh] overflow-y-auto"
            style={{
              background: 'rgba(26, 26, 26, 0.95)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="w-10 h-1 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Add Important Date</h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="p-2 rounded-lg hover:bg-blue-600/20 active:bg-blue-600/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
              {/* Title with character counter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-white">
                    Date Name <span className="text-red-400">*</span>
                  </label>
                  <span className="text-xs text-white/50">{titleLength}/100</span>
                </div>
                <Input
                  placeholder="e.g., Mom's Birthday, Visa Interview"
                  maxLength={100}
                  {...register('title', {
                    required: 'Title is required',
                    minLength: { value: 3, message: 'Must be at least 3 characters' },
                    maxLength: { value: 100, message: 'Must be less than 100 characters' },
                  })}
                  error={errors.title?.message}
                  className="h-[52px]"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Date <span className="text-red-400">*</span>
                </label>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setIsDatePickerOpen(true);
                  }}
                  className={`
                    w-full h-[52px] px-4 rounded-xl
                    flex items-center gap-3
                    text-left transition-all
                    ${errors.date ? 'border-2 border-red-500' : 'border border-white/10'}
                  `}
                  style={{
                    background: errors.date
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(35, 29, 51, 0.6)',
                    backdropFilter: 'blur(15px)',
                    color: watchedDate ? '#FFFFFF' : '#60A5FA',
                  }}
                >
                  <Calendar className="w-5 h-5" style={{ color: '#60A5FA' }} />
                  <span className="text-sm">
                    {watchedDate ? formatDateDisplay(watchedDate) : 'Select date'}
                  </span>
                </motion.button>
                <input
                  type="hidden"
                  {...register('date', {
                    required: 'Date is required',
                  })}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-400">{errors.date.message}</p>
                )}
              </div>

              {/* Category with icons */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
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
                        setSelectedCategory(cat.value);
                      }}
                      className={`
                        p-3 rounded-xl transition-all text-center
                        ${selectedCategory === cat.value
                          ? 'bg-blue-600/30 border-2 border-blue-400'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">{cat.emoji}</div>
                      <div className="text-xs text-white/90">{cat.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Description with character counter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-white">
                    Description (Optional)
                  </label>
                  <span className="text-xs text-white/50">{descriptionLength}/500</span>
                </div>
                <Textarea
                  placeholder="Add notes about this date..."
                  maxLength={500}
                  {...register('description', {
                    maxLength: { value: 500, message: 'Must be less than 500 characters' },
                  })}
                  error={errors.description?.message}
                  className="min-h-[80px]"
                />
              </div>

              {/* Link to Document */}
              <div
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(35, 29, 51, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium text-white">Link to Document?</span>
                  </div>
                  <Toggle
                    checked={linkToDocument}
                    onChange={(checked) => {
                      triggerHaptic('light');
                      setLinkToDocument(checked);
                    }}
                  />
                </div>

                {linkToDocument && (
                  <div className="mt-3 space-y-2">
                    {/* Search documents */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                      <input
                        type="text"
                        placeholder="Search documents..."
                        value={documentSearch}
                        onChange={(e) => setDocumentSearch(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-lg text-sm text-white bg-white/5 border border-white/10 placeholder-white/50 focus:outline-none focus:border-blue-400"
                      />
                    </div>

                    {/* Document list */}
                    {loadingDocuments ? (
                      <div className="text-center text-white/50 text-sm py-4">
                        <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                        Loading documents...
                      </div>
                    ) : filteredDocuments.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {filteredDocuments.slice(0, 10).map((doc) => (
                          <motion.div
                            key={doc.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleDocumentSelection(doc.id)}
                            className={`
                              p-3 rounded-lg cursor-pointer transition-all
                              ${selectedDocuments.includes(doc.id)
                                ? 'bg-blue-600/20 border border-blue-400'
                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                              }
                            `}
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedDocuments.includes(doc.id)}
                                onChange={() => {}}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-white truncate">{doc.document_name}</div>
                                <div className="text-xs text-white/50">{doc.document_type}</div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-white/50 text-sm py-4">
                        {documentSearch ? 'No matching documents' : 'No documents available'}
                      </div>
                    )}

                    {selectedDocuments.length > 0 && (
                      <div className="text-xs text-blue-400 mt-2">
                        {selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''} selected
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Set Reminders */}
              <div
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(35, 29, 51, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium text-white">Set Reminders</span>
                  </div>
                  <Toggle
                    checked={remindersEnabled}
                    onChange={(checked) => {
                      triggerHaptic('light');
                      setRemindersEnabled(checked);
                    }}
                  />
                </div>

                {remindersEnabled && (
                  <div className="mt-3 space-y-3">
                    {/* Preset reminders */}
                    <div className="space-y-2">
                      <label className="text-xs text-white/70">Remind me:</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={presetReminders['30_days']}
                            onChange={(checked) => {
                              triggerHaptic('light');
                              setPresetReminders({ ...presetReminders, '30_days': checked });
                            }}
                          />
                          <span className="text-sm text-white">30 days before</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={presetReminders['7_days']}
                            onChange={(checked) => {
                              triggerHaptic('light');
                              setPresetReminders({ ...presetReminders, '7_days': checked });
                            }}
                          />
                          <span className="text-sm text-white">7 days before</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={presetReminders['1_day']}
                            onChange={(checked) => {
                              triggerHaptic('light');
                              setPresetReminders({ ...presetReminders, '1_day': checked });
                            }}
                          />
                          <span className="text-sm text-white">1 day before</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={presetReminders['on_day']}
                            onChange={(checked) => {
                              triggerHaptic('light');
                              setPresetReminders({ ...presetReminders, 'on_day': checked });
                            }}
                          />
                          <span className="text-sm text-white">On the day</span>
                        </label>
                      </div>
                    </div>

                    {/* Time of day */}
                    <div>
                      <label className="text-xs text-white/70 mb-1 block">Time of day:</label>
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => {
                          triggerHaptic('light');
                          setReminderTime(e.target.value);
                        }}
                        className="w-full h-10 px-3 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-blue-400"
                      />
                    </div>

                    {/* Notification methods */}
                    <div>
                      <label className="text-xs text-white/70 mb-2 block">Notify via:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={notificationMethods.in_app}
                            onChange={(checked) => {
                              triggerHaptic('light');
                              setNotificationMethods({ ...notificationMethods, in_app: checked });
                            }}
                          />
                          <span className="text-xs text-white">In-app</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={notificationMethods.push}
                            onChange={(checked) => {
                              triggerHaptic('light');
                              setNotificationMethods({ ...notificationMethods, push: checked });
                            }}
                          />
                          <span className="text-xs text-white">Push</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={notificationMethods.email}
                            onChange={(checked) => {
                              triggerHaptic('light');
                              setNotificationMethods({ ...notificationMethods, email: checked });
                            }}
                          />
                          <span className="text-xs text-white">Email</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={notificationMethods.sms}
                            onChange={(checked) => {
                              triggerHaptic('light');
                              setNotificationMethods({ ...notificationMethods, sms: checked });
                            }}
                          />
                          <span className="text-xs text-white">SMS</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Repeat Annually */}
              <div
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(35, 29, 51, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-sm font-medium text-white">Repeat Annually</div>
                      <div className="text-xs text-white/50">Useful for birthdays & anniversaries</div>
                    </div>
                  </div>
                  <Toggle
                    checked={repeatAnnually}
                    onChange={(checked) => {
                      triggerHaptic('light');
                      setRepeatAnnually(checked);
                    }}
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.value}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        triggerHaptic('light');
                        setPriority(opt.value as 'high' | 'medium' | 'low');
                      }}
                      className={`
                        p-3 rounded-xl transition-all
                        ${priority === opt.value
                          ? 'bg-blue-600/30 border-2 border-blue-400'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="text-xl mb-1">{opt.emoji}</div>
                      <div className={`text-xs ${priority === opt.value ? opt.color : 'text-white/70'}`}>
                        {opt.label}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
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
                    'Add Date'
                  )}
                </Button>
              </div>
            </form>

            {/* Date Picker Modal */}
            <DatePickerModal
              isOpen={isDatePickerOpen}
              onClose={() => setIsDatePickerOpen(false)}
              onSelect={handleDateSelect}
              selectedDate={watchedDate}
              minDate="2010-01-01"
              maxDate="2040-12-31"
            />

            {/* Toast Notifications */}
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
