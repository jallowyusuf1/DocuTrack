/**
 * OCR Results Panel
 * Displays OCR results as suggestions with accept/reject functionality
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import type { OCRResult, DocumentType } from '../../../types';

interface OCRResultsPanelProps {
  result: OCRResult;
  onAcceptField: (fieldKey: string, value: string) => void;
  onRejectField: (fieldKey: string) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  acceptedFields?: Set<string>;
}

export default function OCRResultsPanel({
  result,
  onAcceptField,
  onRejectField,
  onAcceptAll,
  onRejectAll,
  acceptedFields = new Set(),
}: OCRResultsPanelProps) {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 95) return '#10B981'; // Green
    if (confidence >= 70) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 95) return 'High';
    if (confidence >= 70) return 'Medium';
    return 'Low';
  };

  const toggleField = (fieldKey: string) => {
    setExpandedFields((prev) => {
      const next = new Set(prev);
      if (next.has(fieldKey)) {
        next.delete(fieldKey);
      } else {
        next.add(fieldKey);
      }
      return next;
    });
  };

  const fields = result.fields || {};
  const fieldEntries = Object.entries(fields).filter(([_, field]) => field !== undefined);

  if (fieldEntries.length === 0) {
    return (
      <div
        className="rounded-xl p-4 mb-4"
        style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}
      >
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">No fields could be extracted from this document.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-4 mb-4"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm">OCR Results</span>
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{
              background: result.source === 'google' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(139, 92, 246, 0.2)',
              color: result.source === 'google' ? '#60A5FA' : '#A78BFA',
            }}
          >
            {result.source === 'google' ? 'Google Vision' : 'Tesseract'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAcceptAll}
            className="text-xs px-2 py-1 rounded text-green-400 hover:bg-green-400/10 transition-colors"
          >
            Accept All
          </button>
          <button
            onClick={onRejectAll}
            className="text-xs px-2 py-1 rounded text-red-400 hover:bg-red-400/10 transition-colors"
          >
            Reject All
          </button>
        </div>
      </div>

      {/* Detected Document Type */}
      {result.detectedDocumentType && (
        <div
          className="rounded-lg p-3 mb-3"
          style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white/70 text-xs">Detected Type:</span>
              <span className="text-white font-medium ml-2">
                {result.detectedDocumentType.type.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                background: `rgba(${result.detectedDocumentType.confidence >= 70 ? '16, 185, 129' : '245, 158, 11'}, 0.2)`,
                color: result.detectedDocumentType.confidence >= 70 ? '#10B981' : '#F59E0B',
              }}
            >
              {result.detectedDocumentType.confidence}%
            </span>
          </div>
        </div>
      )}

      {/* Quality Warning */}
      {result.quality && result.quality.score < 80 && (
        <div
          className="rounded-lg p-3 mb-3"
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
          }}
        >
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">
              Image quality: {result.quality.score}% - {result.quality.issues.join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Fields */}
      <div className="space-y-2">
        {fieldEntries.map(([fieldKey, field]) => {
          if (!field) return null;

          const isAccepted = acceptedFields.has(fieldKey);
          const isExpanded = expandedFields.has(fieldKey);
          const confidenceColor = getConfidenceColor(field.confidence);
          const confidenceLabel = getConfidenceLabel(field.confidence);

          return (
            <motion.div
              key={fieldKey}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg p-3"
              style={{
                background: isAccepted
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isAccepted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/90 text-sm font-medium capitalize">
                      {fieldKey.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    {isAccepted && (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm truncate">{field.value}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{
                        background: `${confidenceColor}20`,
                        color: confidenceColor,
                      }}
                    >
                      {field.confidence}% ({confidenceLabel})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {!isAccepted ? (
                    <>
                      <button
                        onClick={() => onAcceptField(fieldKey, field.value)}
                        className="w-7 h-7 rounded flex items-center justify-center hover:bg-green-500/20 transition-colors"
                        style={{ color: '#10B981' }}
                        title="Accept"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRejectField(fieldKey)}
                        className="w-7 h-7 rounded flex items-center justify-center hover:bg-red-500/20 transition-colors"
                        style={{ color: '#EF4444' }}
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onRejectField(fieldKey)}
                      className="text-xs px-2 py-1 rounded text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      Undo
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full Text Preview (Collapsible) */}
      {result.text && (
        <div className="mt-4">
          <button
            onClick={() => toggleField('_fullText')}
            className="text-xs text-white/60 hover:text-white/80 transition-colors"
          >
            {expandedFields.has('_fullText') ? 'Hide' : 'Show'} full extracted text
          </button>
          {expandedFields.has('_fullText') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-3 rounded-lg"
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <pre className="text-xs text-white/70 whitespace-pre-wrap font-mono">
                {result.text}
              </pre>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}



