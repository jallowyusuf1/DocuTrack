import { useState, useEffect, useMemo, useCallback } from 'react';
import { debounce } from '../utils/searchUtils';
import type { Document } from '../types';
import { searchDocuments, advancedSearch, type SearchCriteria } from '../utils/searchUtils';

/**
 * Hook for basic search functionality
 */
export function useSearch<T extends any[]>(
  items: T,
  searchFn: (items: T, query: string) => T,
  debounceMs = 300
) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  const debouncedSetQuery = useMemo(
    () => debounce((value: string) => setDebouncedQuery(value), debounceMs),
    [debounceMs]
  );

  useEffect(() => {
    debouncedSetQuery(query);
  }, [query, debouncedSetQuery]);

  // Perform search
  const results = useMemo(
    () => searchFn(items, debouncedQuery),
    [items, debouncedQuery, searchFn]
  );

  return {
    query,
    setQuery,
    results,
    isSearching: query !== debouncedQuery,
    hasQuery: !!debouncedQuery.trim(),
  };
}

/**
 * Hook for document search with filters
 */
export function useDocumentSearch(documents: Document[]) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<Omit<SearchCriteria, 'query'>>({});

  // Debounce the search query
  const debouncedSetQuery = useMemo(
    () => debounce((value: string) => setDebouncedQuery(value), 300),
    []
  );

  useEffect(() => {
    debouncedSetQuery(query);
  }, [query, debouncedSetQuery]);

  // Perform advanced search
  const results = useMemo(() => {
    return advancedSearch(documents, {
      query: debouncedQuery,
      ...filters,
    });
  }, [documents, debouncedQuery, filters]);

  const setDocumentType = useCallback((type: string) => {
    setFilters(prev => ({ ...prev, documentType: type }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setFilters(prev => ({ ...prev, category }));
  }, []);

  const setTags = useCallback((tags: string[]) => {
    setFilters(prev => ({ ...prev, tags }));
  }, []);

  const setDateRange = useCallback((startDate: Date | null, endDate: Date | null) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  }, []);

  const setStatus = useCallback((status: 'active' | 'expired' | 'expiring_soon' | undefined) => {
    setFilters(prev => ({ ...prev, status }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.documentType ||
      filters.category ||
      (filters.tags && filters.tags.length > 0) ||
      filters.startDate ||
      filters.endDate ||
      filters.status
    );
  }, [filters]);

  return {
    query,
    setQuery,
    results,
    filters,
    setDocumentType,
    setCategory,
    setTags,
    setDateRange,
    setStatus,
    clearFilters,
    hasActiveFilters,
    isSearching: query !== debouncedQuery,
    hasQuery: !!debouncedQuery.trim(),
    totalResults: results.length,
    totalDocuments: documents.length,
  };
}

/**
 * Hook for search history
 */
export function useSearchHistory(maxItems = 10) {
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('docutrackr_search_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addToHistory = useCallback(
    (query: string) => {
      if (!query.trim()) return;

      setHistory(prev => {
        // Remove duplicates and add to front
        const filtered = prev.filter(item => item !== query);
        const updated = [query, ...filtered].slice(0, maxItems);

        // Persist to localStorage
        try {
          localStorage.setItem('docutrackr_search_history', JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save search history:', error);
        }

        return updated;
      });
    },
    [maxItems]
  );

  const removeFromHistory = useCallback((query: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item !== query);

      try {
        localStorage.setItem('docutrackr_search_history', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }

      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem('docutrackr_search_history');
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
