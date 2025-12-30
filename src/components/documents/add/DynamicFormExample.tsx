// Example integration of DynamicDocumentForm
// This shows how to integrate the dynamic form into existing form screens

import React, { useState } from 'react';
import { DynamicDocumentForm } from '../DynamicDocumentForm';
import { DocumentTypeSelector } from '../DocumentTypeSelector';
import type { DocumentType } from '../../../types';
import { validateAllFields } from '../../../utils/fieldValidation';
import { documentTypesService } from '../../../services/documentTypes';

interface DynamicFormExampleProps {
  imageFile: File;
  imagePreview: string;
  onSubmit: (data: {
    document_type: DocumentType;
    document_name: string;
    fieldValues: Record<string, any>;
    image: File;
  }) => void;
  onBack: () => void;
}

export const DynamicFormExample: React.FC<DynamicFormExampleProps> = ({
  imageFile,
  imagePreview,
  onSubmit,
  onBack,
}) => {
  const [documentType, setDocumentType] = useState<DocumentType>('passport');
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Get template to validate required fields
    const template = await documentTypesService.getTemplateByType(documentType);
    if (!template) {
      setErrors({ document_type: 'Invalid document type' });
      return;
    }

    // Validate all fields
    const fieldDefinitions = template.fields
      .filter(f => f.is_required)
      .map(f => f.field_definition);

    const validationErrors = validateAllFields(fieldDefinitions, fieldValues);
    
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    // Extract document_name from field values or use a default
    const documentName = fieldValues.document_name || 
                        fieldValues.full_name || 
                        `${template.name} - ${new Date().toLocaleDateString()}`;

    setIsSubmitting(true);
    try {
      await onSubmit({
        document_type: documentType,
        document_name: documentName,
        fieldValues,
        image: imageFile,
      });
    } finally {
      setIsSubmitting(false);
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
          Back
        </button>
        <h1 className="text-xl font-semibold text-white">Add Document</h1>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-800 hover:to-blue-800 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
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

          {/* Document Type Selector */}
          <div className="bg-[rgba(26,22,37,0.6)] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <DocumentTypeSelector
              value={documentType}
              onChange={setDocumentType}
              error={errors.document_type}
            />
          </div>

          {/* Dynamic Form */}
          <DynamicDocumentForm
            documentType={documentType}
            values={fieldValues}
            onChange={setFieldValues}
            errors={errors}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
