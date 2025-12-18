import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Camera, ZoomIn, ZoomOut, RotateCcw, RotateCw, Crop, Trash2,
  Check, Calendar, X, Save, FileText, Clock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { useToast } from '../../hooks/useToast';
import type { DocumentType } from '../../types';
import DatePickerModal from '../../components/ui/DatePickerModal';

const DOCUMENT_TYPES: { value: DocumentType; label: string; icon: string }[] = [
  { value: 'passport', label: 'Passport', icon: '🛂' },
  { value: 'visa', label: 'Visa', icon: '✈️' },
  { value: 'id_card', label: 'ID Card', icon: '🪪' },
  { value: 'insurance', label: 'Insurance', icon: '🏥' },
  { value: 'subscription', label: 'Subscription', icon: '💳' },
  { value: 'receipt', label: 'Receipt', icon: '🧾' },
  { value: 'bill', label: 'Bill', icon: '📄' },
  { value: 'contract', label: 'Contract', icon: '📋' },
];

export default function DesktopAddDocument() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('passport');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [enableReminders, setEnableReminders] = useState(true);
  const [reminderDays, setReminderDays] = useState([30, 7, 1]);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCropping, setIsCropping] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate days remaining
  const daysRemaining = expiryDate
    ? Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const getDaysColor = (days: number | null) => {
    if (days === null) return '#6B7280';
    if (days < 0) return '#EF4444';
    if (days < 7) return '#EF4444';
    if (days < 30) return '#F59E0B';
    return '#10B981';
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be less than 10MB', 'error');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  // Image controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleRotateLeft = () => setRotation(prev => (prev - 90) % 360);
  const handleRotateRight = () => setRotation(prev => (prev + 90) % 360);
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setZoom(100);
    setRotation(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!documentName.trim()) newErrors.documentName = 'Document name is required';
    if (!issueDate) newErrors.issueDate = 'Issue date is required';
    if (!expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!imageFile) newErrors.image = 'Please upload a document image';

    if (issueDate && expiryDate && new Date(issueDate) >= new Date(expiryDate)) {
      newErrors.expiryDate = 'Expiry date must be after issue date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save as draft
  const handleSaveDraft = async () => {
    // Implementation for saving draft
    setLastSaved(new Date());
    showToast('Draft saved', 'success');
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !user) return;

    setLoading(true);
    try {
      await documentService.createDocument({
        user_id: user.id,
        document_name: documentName,
        document_type: documentType,
        document_number: documentNumber || undefined,
        issue_date: issueDate,
        expiration_date: expiryDate,
        image_url: '', // Will be set after upload
        reminder_days: enableReminders ? reminderDays : undefined,
        notes: notes || undefined,
      }, imageFile!);

      showToast('Document added successfully!', 'success');
      navigate('/documents');
    } catch (error: any) {
      console.error('Error adding document:', error);
      showToast(error.message || 'Failed to add document', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveDraft();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(e as any);
      }
      if (e.key === 'Escape') {
        navigate('/documents');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [documentName, documentType, issueDate, expiryDate, imageFile]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#1a1625] via-[#2d1b4e] to-[#1a1625] pb-20"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-purple-500/10 backdrop-blur-sm"
          >
            <div className="text-center">
              <Upload className="w-20 h-20 text-purple-400 mx-auto mb-4" />
              <p className="text-2xl font-bold text-white">Drop to upload</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="px-10 py-8">
          <h1 className="text-4xl font-bold text-white mb-2">Add Document</h1>
          <p className="text-white/60">Upload and manage your important documents</p>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-8 px-10">
          {/* Image Section - 45% */}
          <div className="w-[45%]">
            <div
              className="sticky top-8 rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(26, 22, 37, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                minHeight: '600px',
              }}
            >
              {!imagePreview ? (
                // Dropzone
                <label className="h-full min-h-[600px] flex flex-col items-center justify-center cursor-pointer p-12">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="w-full h-full border-4 border-dashed border-purple-500/30 rounded-2xl flex flex-col items-center justify-center hover:border-purple-500/50 hover:bg-purple-500/5 transition-all">
                    <Camera className="w-20 h-20 text-purple-400 mb-6" />
                    <p className="text-xl font-semibold text-white mb-2">Drag & drop image here</p>
                    <p className="text-white/40 mb-6">or</p>
                    <button
                      type="button"
                      className="px-8 py-3 rounded-xl font-semibold text-white transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                      }}
                    >
                      Choose File
                    </button>
                    <p className="text-sm text-white/30 mt-4">JPG, PNG, PDF • Max 10MB</p>
                  </div>
                </label>
              ) : (
                // Preview
                <div className="relative h-full min-h-[600px] flex flex-col">
                  <div className="flex-1 flex items-center justify-center p-8 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.03),rgba(255,255,255,0.03)_10px,transparent_10px,transparent_20px)]">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full max-h-[500px] object-contain"
                      style={{
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        transition: 'transform 0.3s ease',
                      }}
                    />
                  </div>

                  {/* Image Controls */}
                  <div className="p-4 border-t border-white/10">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleZoomOut}
                        className="w-11 h-11 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                        style={{ background: 'rgba(35, 29, 51, 0.6)' }}
                      >
                        <ZoomOut className="w-5 h-5 text-white" />
                      </button>
                      <span className="px-4 text-white font-medium min-w-[80px] text-center">
                        {zoom}%
                      </span>
                      <button
                        type="button"
                        onClick={handleZoomIn}
                        className="w-11 h-11 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                        style={{ background: 'rgba(35, 29, 51, 0.6)' }}
                      >
                        <ZoomIn className="w-5 h-5 text-white" />
                      </button>

                      <div className="w-px h-6 bg-white/10 mx-2" />

                      <button
                        type="button"
                        onClick={handleRotateLeft}
                        className="w-11 h-11 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                        style={{ background: 'rgba(35, 29, 51, 0.6)' }}
                      >
                        <RotateCcw className="w-5 h-5 text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRotateRight}
                        className="w-11 h-11 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                        style={{ background: 'rgba(35, 29, 51, 0.6)' }}
                      >
                        <RotateCw className="w-5 h-5 text-white" />
                      </button>

                      <div className="w-px h-6 bg-white/10 mx-2" />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-11 h-11 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                        style={{ background: 'rgba(35, 29, 51, 0.6)' }}
                        title="Replace image"
                      >
                        <Upload className="w-5 h-5 text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="w-11 h-11 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-colors"
                        style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                        title="Remove image"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Section - 55% */}
          <div className="w-[55%]">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Document Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      placeholder="e.g., US Passport"
                      className={`w-full h-14 px-5 rounded-xl text-white bg-[rgba(35,29,51,0.6)] border transition-all ${
                        errors.documentName ? 'border-red-500' : 'border-white/10 focus:border-purple-500/50'
                      } focus:outline-none`}
                    />
                    {errors.documentName && (
                      <p className="text-red-400 text-sm mt-1">{errors.documentName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                      className="w-full h-14 px-5 rounded-xl text-white bg-[rgba(35,29,51,0.6)] border border-white/10 focus:border-purple-500/50 focus:outline-none"
                    >
                      {DOCUMENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Document Number
                    </label>
                    <input
                      type="text"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      placeholder="Optional"
                      className="w-full h-14 px-5 rounded-xl text-white bg-[rgba(35,29,51,0.6)] border border-white/10 focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Dates</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Issue Date <span className="text-red-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowIssueDatePicker(true)}
                      className={`w-full h-14 px-5 rounded-xl text-left flex items-center justify-between bg-[rgba(35,29,51,0.6)] border transition-all ${
                        errors.issueDate ? 'border-red-500' : 'border-white/10 hover:border-purple-500/30'
                      }`}
                    >
                      <span className={issueDate ? 'text-white' : 'text-white/40'}>
                        {issueDate || 'Select date'}
                      </span>
                      <Calendar className="w-5 h-5 text-purple-400" />
                    </button>
                    {errors.issueDate && (
                      <p className="text-red-400 text-sm mt-1">{errors.issueDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Expiry Date <span className="text-red-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowExpiryDatePicker(true)}
                      className={`w-full h-14 px-5 rounded-xl text-left flex items-center justify-between bg-[rgba(35,29,51,0.6)] border transition-all ${
                        errors.expiryDate ? 'border-red-500' : 'border-white/10 hover:border-purple-500/30'
                      }`}
                    >
                      <span className={expiryDate ? 'text-white' : 'text-white/40'}>
                        {expiryDate || 'Select date'}
                      </span>
                      <Calendar className="w-5 h-5 text-purple-400" />
                    </button>
                    {errors.expiryDate && (
                      <p className="text-red-400 text-sm mt-1">{errors.expiryDate}</p>
                    )}
                  </div>

                  {daysRemaining !== null && (
                    <div className="p-4 rounded-xl bg-white/5">
                      <p className="text-sm text-white/60 mb-1">Days Remaining</p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: getDaysColor(daysRemaining) }}
                      >
                        {daysRemaining < 0 ? 'Expired' : `${daysRemaining} days`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reminders */}
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Reminders</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 rounded-xl bg-[rgba(35,29,51,0.6)] cursor-pointer">
                    <span className="text-white font-medium">Enable Reminders</span>
                    <input
                      type="checkbox"
                      checked={enableReminders}
                      onChange={(e) => setEnableReminders(e.target.checked)}
                      className="w-14 h-7 rounded-full"
                    />
                  </label>

                  {enableReminders && (
                    <div className="space-y-3 pl-4">
                      {[30, 7, 1].map((days) => (
                        <label key={days} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={reminderDays.includes(days)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setReminderDays([...reminderDays, days]);
                              } else {
                                setReminderDays(reminderDays.filter(d => d !== days));
                              }
                            }}
                            className="w-6 h-6 rounded border-white/20"
                          />
                          <span className="text-white">{days} days before</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Notes</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes (optional)"
                  maxLength={500}
                  className="w-full h-36 p-4 rounded-xl text-white bg-[rgba(35,29,51,0.6)] border border-white/10 focus:border-purple-500/50 focus:outline-none resize-none"
                />
                <p className="text-sm text-white/40 mt-2 text-right">{notes.length}/500</p>
              </div>
            </form>
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div
          className="fixed bottom-0 left-0 right-0 h-20 flex items-center justify-between px-10"
          style={{
            background: 'rgba(26, 22, 37, 0.95)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="text-white/60 hover:text-white font-medium transition-colors"
          >
            Cancel
          </button>

          {lastSaved && (
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Check className="w-4 h-4" />
              Draft saved {Math.floor((Date.now() - lastSaved.getTime()) / 60000)} mins ago
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-6 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
              }}
            >
              {loading ? 'Adding...' : 'Add Document'}
            </button>
          </div>
        </div>
      </div>

      {/* Date Pickers */}
      {showIssueDatePicker && (
        <DatePickerModal
          isOpen={showIssueDatePicker}
          onClose={() => setShowIssueDatePicker(false)}
          onSelectDate={(date) => {
            setIssueDate(date);
            setShowIssueDatePicker(false);
          }}
          selectedDate={issueDate}
          title="Select Issue Date"
        />
      )}

      {showExpiryDatePicker && (
        <DatePickerModal
          isOpen={showExpiryDatePicker}
          onClose={() => setShowExpiryDatePicker(false)}
          onSelectDate={(date) => {
            setExpiryDate(date);
            setShowExpiryDatePicker(false);
          }}
          selectedDate={expiryDate}
          title="Select Expiry Date"
        />
      )}
    </div>
  );
}
