/**
 * Search Utilities - Fuzzy search, filtering, and ranking
 * Provides intelligent search across documents, dates, and other entities
 */

import type { Document } from '../types';

/**
 * Normalize text for search (lowercase, remove accents, trim)
 */
export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .trim();
}

/**
 * Check if a string contains a search query (case-insensitive, fuzzy)
 */
export function matchesSearch(text: string, query: string): boolean {
  if (!query || !text) return true;

  const normalizedText = normalizeSearchText(text);
  const normalizedQuery = normalizeSearchText(query);

  // Direct substring match
  if (normalizedText.includes(normalizedQuery)) return true;

  // Fuzzy match: check if all characters appear in order
  let textIndex = 0;
  for (const char of normalizedQuery) {
    textIndex = normalizedText.indexOf(char, textIndex);
    if (textIndex === -1) return false;
    textIndex++;
  }

  return true;
}

/**
 * Calculate search relevance score (0-100)
 * Higher score = better match
 */
export function calculateRelevanceScore(text: string, query: string): number {
  if (!query || !text) return 0;

  const normalizedText = normalizeSearchText(text);
  const normalizedQuery = normalizeSearchText(query);

  let score = 0;

  // Exact match: 100 points
  if (normalizedText === normalizedQuery) return 100;

  // Starts with query: 80 points
  if (normalizedText.startsWith(normalizedQuery)) score += 80;

  // Contains query: 60 points
  else if (normalizedText.includes(normalizedQuery)) score += 60;

  // Word boundary match: +20 points
  const words = normalizedText.split(/\s+/);
  if (words.some(word => word.startsWith(normalizedQuery))) score += 20;

  // Character density: +10 points max
  const density = normalizedQuery.length / normalizedText.length;
  score += Math.min(10, density * 100);

  return Math.min(100, score);
}

/**
 * Search documents by multiple fields
 */
export function searchDocuments(documents: Document[], query: string): Document[] {
  if (!query.trim()) return documents;

  const normalizedQuery = normalizeSearchText(query);

  return documents
    .map(doc => {
      // Search across multiple fields
      const searchableText = [
        doc.document_name,
        doc.document_type,
        doc.category,
        doc.notes,
        doc.tags?.join(' '),
      ]
        .filter(Boolean)
        .join(' ');

      const matches = matchesSearch(searchableText, normalizedQuery);
      const score = matches ? calculateRelevanceScore(searchableText, normalizedQuery) : 0;

      return { doc, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ doc }) => doc);
}

/**
 * Search by document type
 */
export function filterByDocumentType(documents: Document[], type: string): Document[] {
  if (!type) return documents;
  return documents.filter(doc =>
    normalizeSearchText(doc.document_type || '').includes(normalizeSearchText(type))
  );
}

/**
 * Search by category
 */
export function filterByCategory(documents: Document[], category: string): Document[] {
  if (!category) return documents;
  return documents.filter(doc =>
    normalizeSearchText(doc.category || '').includes(normalizeSearchText(category))
  );
}

/**
 * Search by tags
 */
export function filterByTags(documents: Document[], tags: string[]): Document[] {
  if (!tags || tags.length === 0) return documents;

  return documents.filter(doc => {
    if (!doc.tags || doc.tags.length === 0) return false;

    const normalizedDocTags = doc.tags.map(normalizeSearchText);
    const normalizedSearchTags = tags.map(normalizeSearchText);

    // Document must have at least one matching tag
    return normalizedSearchTags.some(searchTag =>
      normalizedDocTags.some(docTag => docTag.includes(searchTag))
    );
  });
}

/**
 * Search by date range
 */
export function filterByDateRange(
  documents: Document[],
  startDate?: Date | null,
  endDate?: Date | null
): Document[] {
  if (!startDate && !endDate) return documents;

  return documents.filter(doc => {
    if (!doc.expiry_date) return false;

    const expiryDate = new Date(doc.expiry_date);

    if (startDate && expiryDate < startDate) return false;
    if (endDate && expiryDate > endDate) return false;

    return true;
  });
}

/**
 * Multi-criteria search
 */
export interface SearchCriteria {
  query?: string;
  documentType?: string;
  category?: string;
  tags?: string[];
  startDate?: Date | null;
  endDate?: Date | null;
  status?: 'active' | 'expired' | 'expiring_soon';
}

export function advancedSearch(documents: Document[], criteria: SearchCriteria): Document[] {
  let results = [...documents];

  // Text search
  if (criteria.query) {
    results = searchDocuments(results, criteria.query);
  }

  // Document type filter
  if (criteria.documentType) {
    results = filterByDocumentType(results, criteria.documentType);
  }

  // Category filter
  if (criteria.category) {
    results = filterByCategory(results, criteria.category);
  }

  // Tags filter
  if (criteria.tags && criteria.tags.length > 0) {
    results = filterByTags(results, criteria.tags);
  }

  // Date range filter
  if (criteria.startDate || criteria.endDate) {
    results = filterByDateRange(results, criteria.startDate, criteria.endDate);
  }

  // Status filter
  if (criteria.status) {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    results = results.filter(doc => {
      if (!doc.expiry_date) return criteria.status === 'active';

      const expiryDate = new Date(doc.expiry_date);

      if (criteria.status === 'expired') {
        return expiryDate < now;
      } else if (criteria.status === 'expiring_soon') {
        return expiryDate >= now && expiryDate <= thirtyDaysFromNow;
      } else {
        return expiryDate >= now;
      }
    });
  }

  return results;
}

/**
 * Highlight search matches in text
 */
export function highlightMatches(text: string, query: string): string {
  if (!query || !text) return text;

  const normalizedQuery = normalizeSearchText(query);
  const regex = new RegExp(`(${normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Get search suggestions based on existing documents
 */
export function getSearchSuggestions(documents: Document[], query: string, limit = 5): string[] {
  if (!query.trim()) return [];

  const suggestions = new Set<string>();
  const normalizedQuery = normalizeSearchText(query);

  documents.forEach(doc => {
    // Suggest document names
    if (doc.document_name && matchesSearch(doc.document_name, query)) {
      suggestions.add(doc.document_name);
    }

    // Suggest document types
    if (doc.document_type && matchesSearch(doc.document_type, query)) {
      suggestions.add(doc.document_type);
    }

    // Suggest categories
    if (doc.category && matchesSearch(doc.category, query)) {
      suggestions.add(doc.category);
    }

    // Suggest tags
    if (doc.tags) {
      doc.tags.forEach(tag => {
        if (matchesSearch(tag, query)) {
          suggestions.add(tag);
        }
      });
    }
  });

  return Array.from(suggestions)
    .slice(0, limit)
    .sort((a, b) => calculateRelevanceScore(a, query) - calculateRelevanceScore(b, query))
    .reverse();
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
