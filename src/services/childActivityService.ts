import { supabase } from '../config/supabase';

export type ActivityType =
  | 'document_view'
  | 'document_add'
  | 'document_edit'
  | 'document_delete'
  | 'document_share'
  | 'permission_request_submitted'
  | 'permission_request_approved'
  | 'permission_request_denied'
  | 'search_performed'
  | 'account_login'
  | 'account_logout'
  | 'settings_changed'
  | 'parent_approved_request'
  | 'parent_denied_request'
  | string;

export type ActivityStatus = 'success' | 'pending' | 'denied' | 'failed';

export interface ChildActivity {
  id: string;
  child_account_id: string;
  actor_user_id: string;
  action_type: ActivityType;
  document_id: string | null;
  status: ActivityStatus;
  details: Record<string, unknown>;
  created_at: string;
  // Joined data
  document?: {
    id: string;
    document_name: string;
    document_type: string;
    image_url: string;
  };
  actor?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ActivityFilters {
  activityType?: ActivityType;
  status?: ActivityStatus;
  documentType?: string;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

export interface ActivityStatistics {
  totalActivities: number;
  activitiesByType: Record<string, number>;
  mostViewedDocuments: Array<{
    document_id: string;
    document_name: string;
    view_count: number;
    last_viewed: string;
  }>;
  peakActivityHours: Record<number, number>; // hour -> count
  requestStats: {
    total: number;
    approved: number;
    denied: number;
    pending: number;
  };
}

/**
 * Get activity log for a child account
 */
export async function getChildActivity(
  childAccountId: string,
  filters?: ActivityFilters,
  limit: number = 100
): Promise<ChildActivity[]> {
  let query = supabase
    .from('child_account_activity')
    .select(`
      *,
      document:document_id (
        id,
        document_name,
        document_type,
        image_url
      ),
      actor:actor_user_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('child_account_id', childAccountId)
    .order('created_at', { ascending: false })
    .limit(limit);

  // Apply filters
  if (filters?.activityType) {
    query = query.eq('action_type', filters.activityType);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  const { data, error } = await query;

  if (error) throw error;

  let results = (data || []) as ChildActivity[];

  // Apply document type filter and search (in-memory)
  if (filters?.documentType || filters?.searchQuery) {
    results = results.filter(activity => {
      if (filters.documentType && activity.document?.document_type !== filters.documentType) {
        return false;
      }

      if (filters.searchQuery) {
        const search = filters.searchQuery.toLowerCase();
        const docName = activity.document?.document_name?.toLowerCase() || '';
        const actionType = activity.action_type.replace(/_/g, ' ').toLowerCase();
        const details = JSON.stringify(activity.details).toLowerCase();
        return docName.includes(search) || actionType.includes(search) || details.includes(search);
      }

      return true;
    });
  }

  return results;
}

/**
 * Get activity statistics for a child account
 */
export async function getChildActivityStatistics(
  childAccountId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<ActivityStatistics> {
  let query = supabase
    .from('child_account_activity')
    .select('*')
    .eq('child_account_id', childAccountId);

  if (dateFrom) {
    query = query.gte('created_at', dateFrom);
  }
  if (dateTo) {
    query = query.lte('created_at', dateTo);
  }

  const { data: activities, error } = await query;

  if (error) throw error;

  const activityList = (activities || []) as ChildActivity[];

  // Calculate statistics
  const activitiesByType: Record<string, number> = {};
  const documentViews: Record<string, { count: number; lastViewed: string; name: string }> = {};
  const peakHours: Record<number, number> = {};
  const requestStats = {
    total: 0,
    approved: 0,
    denied: 0,
    pending: 0,
  };

  activityList.forEach(activity => {
    // Count by type
    activitiesByType[activity.action_type] = (activitiesByType[activity.action_type] || 0) + 1;

    // Track document views
    if (activity.action_type === 'document_view' && activity.document_id) {
      const docId = activity.document_id;
      if (!documentViews[docId]) {
        documentViews[docId] = {
          count: 0,
          lastViewed: activity.created_at,
          name: (activity.document as any)?.document_name || 'Unknown Document',
        };
      }
      documentViews[docId].count++;
      if (activity.created_at > documentViews[docId].lastViewed) {
        documentViews[docId].lastViewed = activity.created_at;
      }
    }

    // Track peak hours
    const hour = new Date(activity.created_at).getHours();
    peakHours[hour] = (peakHours[hour] || 0) + 1;

    // Track request stats
    if (activity.action_type.includes('permission_request')) {
      requestStats.total++;
      if (activity.status === 'success' || activity.action_type.includes('approved')) {
        requestStats.approved++;
      } else if (activity.status === 'denied' || activity.action_type.includes('denied')) {
        requestStats.denied++;
      } else if (activity.status === 'pending') {
        requestStats.pending++;
      }
    }
  });

  // Get most viewed documents
  const mostViewedDocuments = Object.entries(documentViews)
    .map(([document_id, data]) => ({
      document_id,
      document_name: data.name,
      view_count: data.count,
      last_viewed: data.lastViewed,
    }))
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 5);

  return {
    totalActivities: activityList.length,
    activitiesByType,
    mostViewedDocuments,
    peakActivityHours: peakHours,
    requestStats,
  };
}

/**
 * Export activity data
 */
export async function exportChildActivity(
  childAccountId: string,
  filters?: ActivityFilters,
  format: 'csv' | 'json' = 'json'
): Promise<string> {
  const activities = await getChildActivity(childAccountId, filters, 10000);

  if (format === 'json') {
    return JSON.stringify(activities, null, 2);
  }

  // CSV format
  const headers = ['Date', 'Time', 'Action Type', 'Status', 'Document', 'Details'];
  const rows = activities.map(activity => {
    const date = new Date(activity.created_at);
    return [
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
      activity.action_type.replace(/_/g, ' '),
      activity.status,
      activity.document?.document_name || 'N/A',
      JSON.stringify(activity.details),
    ];
  });

  return [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
}

/**
 * Subscribe to real-time activity updates
 */
export function subscribeToChildActivity(
  childAccountId: string,
  callback: (activity: ChildActivity) => void
) {
  return supabase
    .channel(`child_activity_${childAccountId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'child_account_activity',
        filter: `child_account_id=eq.${childAccountId}`,
      },
      async (payload) => {
        const activity = payload.new as ChildActivity;
        
        // Fetch full activity with joined data
        const { data } = await supabase
          .from('child_account_activity')
          .select(`
            *,
            document:document_id (
              id,
              document_name,
              document_type,
              image_url
            ),
            actor:actor_user_id (
              id,
              email,
              full_name,
              avatar_url
            )
          `)
          .eq('id', activity.id)
          .single();

        if (data) {
          callback(data as ChildActivity);
        }
      }
    )
    .subscribe();
}

