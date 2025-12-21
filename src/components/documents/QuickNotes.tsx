import React, { useState, useEffect } from 'react';
import { StickyNote } from 'lucide-react';
import type { Document } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface QuickNotesProps {
  document: Document;
}

// AI-generated note based on document type and expiration
const generateAINote = (document: Document): string => {
  const typeLabel = document.document_type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const daysLeft = Math.floor(
    (new Date(document.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const expirationDate = formatDate(document.expiration_date);
  
  if (daysLeft < 0) {
    return `This ${typeLabel.toLowerCase()} expired on ${expirationDate}. Consider renewing or replacing it soon.`;
  } else if (daysLeft === 0) {
    return `This ${typeLabel.toLowerCase()} expires today. Take action immediately to renew or replace it.`;
  } else if (daysLeft <= 7) {
    return `This ${typeLabel.toLowerCase()} expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} on ${expirationDate}. Renewal or replacement needed soon.`;
  } else if (daysLeft <= 30) {
    return `This ${typeLabel.toLowerCase()} expires on ${expirationDate} (${daysLeft} days). Start planning for renewal or replacement.`;
  } else {
    return `This ${typeLabel.toLowerCase()} is valid until ${expirationDate}. Keep it safe and review renewal requirements ahead of time.`;
  }
};

function QuickNotes({ document }: QuickNotesProps) {
  const [displayNote, setDisplayNote] = useState<string>('');

  useEffect(() => {
    if (!document) return;
    
    try {
      // Use existing notes if available, otherwise generate AI note
      if (document.notes && document.notes.trim()) {
        setDisplayNote(document.notes);
      } else if (document.expiration_date && document.document_type) {
        // Generate AI note
        const aiNote = generateAINote(document);
        setDisplayNote(aiNote);
      } else {
        // Fallback if document data is incomplete
        setDisplayNote('Document information available.');
      }
    } catch (error) {
      console.error('Error generating note:', error);
      // Fallback note
      setDisplayNote('Document information available.');
    }
  }, [document?.notes, document?.expiration_date, document?.document_type]);

  if (!displayNote || !document) {
    return null;
  }

  return (
    <div className="flex items-start gap-2">
      <StickyNote className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#A78BFA' }} />
      <p className="text-[12px] text-white/80 leading-relaxed line-clamp-3">
        {displayNote}
      </p>
    </div>
  );
}

export default QuickNotes;
