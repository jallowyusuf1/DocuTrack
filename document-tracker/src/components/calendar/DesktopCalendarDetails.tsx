import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Eye, Edit, Share2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Document } from '../../types';
import { getDaysUntil } from '../../utils/dateUtils';
import { useImageUrl } from '../../hooks/useImageUrl';

interface DesktopCalendarDetailsProps {
  selectedDate: Date;
  documents: Document[];
  upcomingDocuments: Array<{ date: Date; documents: Document[] }>;
  allDocuments: Document[];
}

export default function DesktopCalendarDetails({
  selectedDate,
  documents,
  upcomingDocuments,
  allDocuments,
}: DesktopCalendarDetailsProps) {
  const navigate = useNavigate();

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    allDocuments.forEach((doc) => {
      if (doc.document_type) cats.add(doc.document_type);
    });
    return Array.from(cats);
  }, [allDocuments]);

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(categories)
  );
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const categoryMatch = selectedCategories.has(doc.document_type || '');
      const urgencyMatch =
        selectedUrgency === 'all' ||
        (selectedUrgency === 'urgent' && getDaysUntil(doc.expiration_date) <= 7) ||
        (selectedUrgency === 'soon' && getDaysUntil(doc.expiration_date) > 7 && getDaysUntil(doc.expiration_date) <= 30) ||
        (selectedUrgency === 'upcoming' && getDaysUntil(doc.expiration_date) > 30);
      return categoryMatch && urgencyMatch;
    });
  }, [documents, selectedCategories, selectedUrgency]);

  const dayName = format(selectedDate, 'EEEE');
  const dateFormatted = format(selectedDate, 'MMMM d, yyyy');

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'rgba(35, 29, 51, 0.4)' }}>
      {/* Selected Date Header */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="text-sm font-medium text-white/60 mb-1">{dayName}</div>
        <div className="text-2xl font-bold text-white mb-2">{dateFormatted}</div>
        <div className="text-sm text-white/60">
          {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Documents List */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Documents</h3>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <p>No documents for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((doc) => {
                const daysUntil = getDaysUntil(doc.expiration_date);
                let urgencyColor = '#8B5CF6'; // Default purple
                if (daysUntil <= 7) urgencyColor = '#EF4444'; // Red
                else if (daysUntil <= 30) urgencyColor = '#F59E0B'; // Orange
                else urgencyColor = '#10B981'; // Green
                const imageUrl = useImageUrl(doc.image_url);

                return (
                  <motion.div
                    key={doc.id}
                    whileHover={{ scale: 1.02 }}
                    className="group relative rounded-xl p-4 cursor-pointer transition-all"
                    style={{
                      background: 'rgba(42, 38, 64, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    onClick={() => navigate(`/documents/${doc.id}`)}
                  >
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div
                        className="flex-shrink-0 rounded-lg overflow-hidden"
                        style={{
                          width: '80px',
                          height: '107px',
                          background: 'rgba(35, 29, 51, 0.8)',
                        }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={doc.document_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl">📄</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-white mb-1 truncate">
                          {doc.document_name}
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium capitalize"
                            style={{
                              background: 'rgba(139, 92, 246, 0.2)',
                              color: '#A78BFA',
                            }}
                          >
                            {doc.document_type?.replace('_', ' ') || 'Document'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white/60">Expires:</span>
                          <span
                            className="text-sm font-medium"
                            style={{ color: urgencyColor }}
                          >
                            {daysUntil === 0
                              ? 'Today'
                              : daysUntil === 1
                              ? 'Tomorrow'
                              : `${daysUntil} days`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions (on hover) */}
                    <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/documents/${doc.id}`);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                        style={{ background: 'rgba(42, 38, 64, 0.8)' }}
                      >
                        <Eye className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/documents/${doc.id}/edit`);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                        style={{ background: 'rgba(42, 38, 64, 0.8)' }}
                      >
                        <Edit className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Section */}
        {upcomingDocuments.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Next 7 Days</h3>
            <div className="space-y-4">
              {upcomingDocuments.map((group) => (
                <div key={group.date.toISOString()}>
                  <div className="text-sm font-medium text-white/60 mb-2">
                    {format(group.date, 'EEEE, MMMM d')}
                  </div>
                  <div className="space-y-2">
                    {group.documents.map((doc) => {
                      const daysUntil = getDaysUntil(doc.expiration_date);
                      let urgencyColor = '#8B5CF6'; // Default purple
                      if (daysUntil <= 7) urgencyColor = '#EF4444'; // Red
                      else if (daysUntil <= 30) urgencyColor = '#F59E0B'; // Orange
                      else urgencyColor = '#10B981'; // Green

                      return (
                        <div
                          key={doc.id}
                          onClick={() => navigate(`/documents/${doc.id}`)}
                          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                          style={{
                            background: 'rgba(42, 38, 64, 0.4)',
                            borderLeft: `3px solid ${urgencyColor}`,
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {doc.document_name}
                            </div>
                            <div
                              className="text-xs mt-0.5"
                              style={{ color: urgencyColor }}
                            >
                              {daysUntil === 0
                                ? 'Expires today'
                                : daysUntil === 1
                                ? 'Expires tomorrow'
                                : `Expires in ${daysUntil} days`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="border-t border-white/10 pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
          
          {/* Category Filters */}
          <div className="mb-6">
            <div className="text-sm font-medium text-white/60 mb-3">Categories</div>
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(category)}
                    onChange={(e) => {
                      const newSet = new Set(selectedCategories);
                      if (e.target.checked) {
                        newSet.add(category);
                      } else {
                        newSet.delete(category);
                      }
                      setSelectedCategories(newSet);
                    }}
                    className="w-4 h-4 rounded accent-purple-500"
                  />
                  <span className="text-sm text-white capitalize">
                    {category.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Urgency Filter */}
          <div className="mb-4">
            <div className="text-sm font-medium text-white/60 mb-3">Urgency</div>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm text-white"
              style={{
                background: 'rgba(42, 38, 64, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <option value="all">All</option>
              <option value="urgent">Urgent (≤7 days)</option>
              <option value="soon">Soon (8-30 days)</option>
              <option value="upcoming">Upcoming (&gt;30 days)</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(selectedCategories.size < categories.length || selectedUrgency !== 'all') && (
            <button
              onClick={() => {
                setSelectedCategories(new Set(categories));
                setSelectedUrgency('all');
              }}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

