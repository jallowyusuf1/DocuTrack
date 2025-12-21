import { useState, useEffect } from 'react';
import { Calendar, Bell, AlertCircle, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DocumentType } from '../../../types';
import { getDaysUntil } from '../../../utils/dateUtils';
import { triggerHaptic } from '../../../utils/animations';

interface DocumentFormData {
  documentName: string;
  category: DocumentType;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  notes: string;
  remindersEnabled: boolean;
  reminder30Days: boolean;
  reminder7Days: boolean;
  reminder1Day: boolean;
  customReminderValue: number;
  customReminderUnit: 'days' | 'weeks' | 'months';
}

interface DocumentFormScreenProps {
  imageFile: File;
  imagePreview: string;
  onSubmit: (data: DocumentFormData) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

interface FormErrors {
  documentName?: string;
  category?: string;
  expiryDate?: string;
}

const DOCUMENT_CATEGORIES: { value: DocumentType; label: string }[] = [
  { value: 'passport', label: 'Passport' },
  { value: 'visa', label: 'Visa' },
  { value: 'id_card', label: 'ID Card' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'bill', label: 'Bill' },
  { value: 'contract', label: 'Contract' },
  { value: 'warranty', label: 'Warranty' },
  { value: 'license_plate', label: 'License Plate' },
  { value: 'registration', label: 'Registration' },
  { value: 'membership', label: 'Membership' },
  { value: 'certification', label: 'Certification' },
  { value: 'food', label: 'Food' },
  { value: 'other', label: 'Other' },
];

const NOTES_MAX_LENGTH = 500;

export default function DocumentFormScreen({
  imageFile,
  imagePreview,
  onSubmit,
  onBack,
  isSubmitting,
}: DocumentFormScreenProps) {
  const [formData, setFormData] = useState<DocumentFormData>({
    documentName: '',
    category: 'passport',
    documentNumber: '',
    issueDate: '',
    expiryDate: '',
    notes: '',
    remindersEnabled: true,
    reminder30Days: true,
    reminder7Days: true,
    reminder1Day: true,
    customReminderValue: 0,
    customReminderUnit: 'days',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  // Calculate days remaining when expiry date changes
  useEffect(() => {
    if (formData.expiryDate) {
      const days = getDaysUntil(formData.expiryDate);
      setDaysRemaining(days);
    } else {
      setDaysRemaining(null);
    }
  }, [formData.expiryDate]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.documentName.trim()) {
      newErrors.documentName = 'Document name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const expiryDate = new Date(formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (expiryDate <= today) {
        newErrors.expiryDate = 'Expiry date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      triggerHaptic('error');
      return;
    }

    triggerHaptic('success');
    onSubmit(formData);
  };

  const updateField = <K extends keyof DocumentFormData>(
    field: K,
    value: DocumentFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-[#1a1625] via-[#231d32] to-[#1a1625]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
          <span>Back</span>
        </button>

        <h1 className="text-xl font-semibold text-white">Document Details</h1>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Document</span>
          )}
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-6">
              {/* Image Preview */}
              <div className="bg-[rgba(26,22,37,0.6)] backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <label className="block text-sm font-medium text-white mb-3">
                  Document Image
                </label>
                <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                  <img
                    src={imagePreview}
                    alt="Document preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Document Name */}
              <div className="bg-[rgba(26,22,37,0.6)] backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <label htmlFor="documentName" className="block text-sm font-medium text-white mb-2">
                  Document Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="documentName"
                  type="text"
                  value={formData.documentName}
                  onChange={(e) => updateField('documentName', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="e.g., US Passport"
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                    errors.documentName ? 'border-red-500' : 'border-white/10'
                  } text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50`}
                />
                {errors.documentName && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.documentName}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="bg-[rgba(26,22,37,0.6)] backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value as DocumentType)}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                    errors.category ? 'border-red-500' : 'border-white/10'
                  } text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50`}
                >
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-[#1a1625]">
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Document Number */}
              <div className="bg-[rgba(26,22,37,0.6)] backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <label htmlFor="documentNumber" className="block text-sm font-medium text-white mb-2">
                  Document Number <span className="text-white/50">(Optional)</span>
                </label>
                <input
                  id="documentNumber"
                  type="text"
                  value={formData.documentNumber}
                  onChange={(e) => updateField('documentNumber', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="e.g., A12345678"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                {/* Issue Date */}
                <div className="bg-[rgba(26,22,37,0.6)] backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                  <label htmlFor="issueDate" className="block text-sm font-medium text-white mb-2">
                    Issue Date
                  </label>
                  <div className="relative">
                    <input
                      id="issueDate"
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => updateField('issueDate', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="bg-[rgba(26,22,37,0.6)] backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-white mb-2">
                    Expiry Date <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => updateField('expiryDate', e.target.value)}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                        errors.expiryDate ? 'border-red-500' : 'border-white/10'
                      } text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50`}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
                  </div>
                  {errors.expiryDate && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.expiryDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Days Remaining Display */}
              {daysRemaining !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border ${
                    daysRemaining < 0
                      ? 'bg-gray-500/10 border-gray-500/30'
                      : daysRemaining < 7
                      ? 'bg-red-500/10 border-red-500/30'
                      : daysRemaining < 30
                      ? 'bg-orange-500/10 border-orange-500/30'
                      : 'bg-green-500/10 border-green-500/30'
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      daysRemaining < 0
                        ? 'text-gray-400'
                        : daysRemaining < 7
                        ? 'text-red-400'
                        : daysRemaining < 30
                        ? 'text-orange-400'
                        : 'text-green-400'
                    }`}
                  >
                    {daysRemaining < 0
                      ? 'This document has expired'
                      : daysRemaining === 0
                      ? 'Expires today'
                      : daysRemaining === 1
                      ? '1 day remaining'
                      : `${daysRemaining} days remaining`}
                  </p>
                </motion.div>
              )}

              {/* Notes */}
              <div className="bg-[rgba(26,22,37,0.6)] backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <label htmlFor="notes" className="block text-sm font-medium text-white mb-2">
                  Notes <span className="text-white/50">(Optional)</span>
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => {
                    if (e.target.value.length <= NOTES_MAX_LENGTH) {
                      updateField('notes', e.target.value);
                    }
                  }}
                  disabled={isSubmitting}
                  placeholder="Add any additional notes..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition-colors resize-none disabled:opacity-50"
                />
                <p className="mt-2 text-sm text-white/50 text-right">
                  {formData.notes.length}/{NOTES_MAX_LENGTH}
                </p>
              </div>
            </div>

            {/* Right Column - Reminders */}
            <div className="space-y-6">
              <div className="bg-[rgba(26,22,37,0.6)] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-6 h-6 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">Reminder Settings</h2>
                </div>

                {/* Enable Reminders Toggle */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                  <span className="text-white font-medium">Enable Reminders</span>
                  <label className="relative inline-block w-12 h-6 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.remindersEnabled}
                      onChange={(e) => updateField('remindersEnabled', e.target.checked)}
                      disabled={isSubmitting}
                      className="sr-only peer"
                    />
                    <div className="w-full h-full bg-white/10 rounded-full peer-checked:bg-purple-500 transition-colors peer-disabled:opacity-50"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                  </label>
                </div>

                {/* Reminder Checkboxes */}
                {formData.remindersEnabled && (
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.reminder30Days}
                        onChange={(e) => updateField('reminder30Days', e.target.checked)}
                        disabled={isSubmitting}
                        className="w-5 h-5 rounded border-2 border-white/30 bg-white/5 checked:bg-purple-500 checked:border-purple-500 cursor-pointer disabled:opacity-50"
                      />
                      <span className="text-white group-hover:text-purple-300 transition-colors">
                        30 days before expiry
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.reminder7Days}
                        onChange={(e) => updateField('reminder7Days', e.target.checked)}
                        disabled={isSubmitting}
                        className="w-5 h-5 rounded border-2 border-white/30 bg-white/5 checked:bg-purple-500 checked:border-purple-500 cursor-pointer disabled:opacity-50"
                      />
                      <span className="text-white group-hover:text-purple-300 transition-colors">
                        7 days before expiry
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.reminder1Day}
                        onChange={(e) => updateField('reminder1Day', e.target.checked)}
                        disabled={isSubmitting}
                        className="w-5 h-5 rounded border-2 border-white/30 bg-white/5 checked:bg-purple-500 checked:border-purple-500 cursor-pointer disabled:opacity-50"
                      />
                      <span className="text-white group-hover:text-purple-300 transition-colors">
                        1 day before expiry
                      </span>
                    </label>

                    {/* Custom Reminder */}
                    <div className="pt-4 border-t border-white/10">
                      <label className="block text-sm font-medium text-white mb-3">
                        Custom Reminder
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          value={formData.customReminderValue}
                          onChange={(e) => updateField('customReminderValue', Number(e.target.value))}
                          disabled={isSubmitting}
                          placeholder="0"
                          className="w-24 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                        />
                        <select
                          value={formData.customReminderUnit}
                          onChange={(e) => updateField('customReminderUnit', e.target.value as 'days' | 'weeks' | 'months')}
                          disabled={isSubmitting}
                          className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                        >
                          <option value="days" className="bg-[#1a1625]">Days</option>
                          <option value="weeks" className="bg-[#1a1625]">Weeks</option>
                          <option value="months" className="bg-[#1a1625]">Months</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
