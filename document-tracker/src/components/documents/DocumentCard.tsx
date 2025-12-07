import { Link } from 'react-router-dom';
import type { Document } from '../../types';
import { formatDate, getDaysUntil, getUrgencyLevel, getUrgencyBorderColor, getUrgencyTextColor } from '../../utils/dateUtils';
import { FileText } from 'lucide-react';
import Button from '../ui/Button';

interface DocumentCardProps {
  document: Document;
  onMarkRenewed: (document: Document) => void;
}

export default function DocumentCard({ document, onMarkRenewed }: DocumentCardProps) {
  const daysUntil = getDaysUntil(document.expiration_date);
  const urgency = getUrgencyLevel(document.expiration_date);
  const borderColor = getUrgencyBorderColor(urgency);
  const textColor = getUrgencyTextColor(urgency);

  return (
    <div className={`bg-white rounded-xl p-4 border-l-4 ${borderColor} shadow-sm`}>
      {/* Document Type Badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-full">
          <FileText className="w-3 h-3 text-gray-600" />
          <span className="text-[11px] font-medium text-gray-700 capitalize">
            {document.document_type.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Document Name */}
      <h3 className="text-base font-bold text-gray-900 mb-2">
        {document.document_name}
      </h3>

      {/* Expiration Info */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-1">
          Expires: {formatDate(document.expiration_date)}
        </p>
        <p className={`text-base font-semibold ${textColor}`}>
          {daysUntil === 0
            ? 'Expires today'
            : daysUntil === 1
            ? '1 day left'
            : daysUntil < 0
            ? `${Math.abs(daysUntil)} days overdue`
            : `${daysUntil} days left`}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Link to="/documents" className="flex-1">
          <Button variant="secondary" size="small" className="w-full">
            View
          </Button>
        </Link>
        <Button
          variant="primary"
          size="small"
          className="flex-1"
          onClick={() => onMarkRenewed(document)}
        >
          Mark Renewed
        </Button>
      </div>
    </div>
  );
}

