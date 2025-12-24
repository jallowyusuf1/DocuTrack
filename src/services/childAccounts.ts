import { supabase } from '../config/supabase';

export type OversightLevel = 'full_supervision' | 'monitored_access' | 'limited_independence';
export type ChildAccountStatus = 'active' | 'paused' | 'deleted';

export type ChildRelationship = 'son' | 'daughter' | 'dependent' | 'other';

export interface ChildPermissions {
  view_family_documents: boolean;
  add_new_documents: boolean;
  edit_documents: boolean;
  delete_documents: boolean;
  share_documents_externally: boolean;
}

export interface ChildNotificationPreferences {
  activity_summary: 'daily' | 'weekly' | 'monthly';
  alert_on_delete: boolean;
  alert_on_share: boolean;
  alert_on_account_changes: boolean;
}

export interface ChildAccountRow {
  id: string;
  parent_id: string;
  child_user_id: string;
  full_name: string;
  date_of_birth: string; // YYYY-MM-DD
  age_years: number;
  relationship: ChildRelationship;
  oversight_level: OversightLevel;
  permissions: ChildPermissions;
  notification_preferences: ChildNotificationPreferences;
  status: ChildAccountStatus;
  consented_at: string;
  consent_ip: string | null;
  avatar_url: string | null;
  last_active_at: string | null;
  document_count: number;
  auto_convert_on_18: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChildAccountWithStats extends ChildAccountRow {
  pending_requests: number;
}

export interface CreateChildAccountInput {
  full_name: string;
  date_of_birth: string; // YYYY-MM-DD
  relationship: ChildRelationship;
  email: string;
  auto_generate_password: boolean;
  password?: string;
  oversight_level: OversightLevel;
  permissions: ChildPermissions;
  notification_preferences: ChildNotificationPreferences;
  legal_consent: boolean;
}

export interface CreateChildAccountResult {
  child_account: Pick<ChildAccountRow, 'id' | 'child_user_id' | 'full_name' | 'date_of_birth' | 'age_years' | 'relationship' | 'oversight_level' | 'status'>;
  generated_password?: string;
}

export function calculateAgeYears(dobISO: string) {
  const dob = new Date(dobISO + 'T00:00:00');
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

export function timeAgoLabel(ts: string | null) {
  if (!ts) return '—';
  const d = new Date(ts);
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return '—';
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export const childAccountsService = {
  async logActivity(input: {
    child_account_id: string;
    action_type: string;
    status?: 'success' | 'pending' | 'denied' | 'failed';
    document_id?: string | null;
    details?: Record<string, unknown>;
  }) {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user?.id) throw new Error('Not authenticated');

    const { error } = await supabase.from('child_account_activity').insert({
      child_account_id: input.child_account_id,
      actor_user_id: user.id,
      action_type: input.action_type,
      document_id: input.document_id ?? null,
      status: input.status ?? 'success',
      details: input.details ?? {},
    });

    if (error) throw error;
  },

  async listParentActivity(params: { childAccountId: string; parentId: string }) {
    const { data, error } = await supabase
      .from('child_account_activity')
      .select('*')
      .eq('child_account_id', params.childAccountId)
      .eq('actor_user_id', params.parentId)
      .order('created_at', { ascending: false })
      .limit(5);
    if (error) throw error;
    return data ?? [];
  },

  async listMyRequests(childAccountId: string) {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user?.id) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('child_account_requests')
      .select('*')
      .eq('child_account_id', childAccountId)
      .eq('requested_by_user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async cancelMyRequest(requestId: string) {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user?.id) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('child_account_requests')
      .update({ status: 'cancelled', resolved_at: new Date().toISOString(), resolved_by_user_id: user.id })
      .eq('id', requestId);
    if (error) throw error;
  },

  async createPermissionRequest(input: {
    child_account_id: string;
    request_type: string;
    document_id?: string | null;
    message?: string | null;
  }) {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user?.id) throw new Error('Not authenticated');

    const { data: inserted, error } = await supabase
      .from('child_account_requests')
      .insert({
        child_account_id: input.child_account_id,
        requested_by_user_id: user.id,
        request_type: input.request_type,
        document_id: input.document_id ?? null,
        message: input.message ?? null,
        status: 'pending',
      })
      .select('*')
      .single();
    if (error) throw error;

    // Notify parent (best-effort)
    try {
      const { data: ca } = await supabase.from('child_accounts').select('parent_id, full_name').eq('id', input.child_account_id).single();
      if (ca?.parent_id) {
        const { sendRequestNotification } = await import('./notifications');
        const { data: doc } = input.document_id 
          ? await supabase.from('documents').select('document_name').eq('id', input.document_id).single()
          : { data: null };
        
        await sendRequestNotification(
          ca.parent_id,
          ca.full_name,
          input.request_type,
          doc?.document_name,
          inserted.id
        );
      }
    } catch (error) {
      console.warn('Failed to send request notification:', error);
    }

    // Log request submitted
    try {
      await this.logActivity({
        child_account_id: input.child_account_id,
        action_type: 'permission_request_submitted',
        status: 'pending',
        document_id: input.document_id ?? null,
        details: { request_id: inserted.id, request_type: input.request_type },
      });
    } catch {
      // ignore
    }

    return inserted;
  },

  async listMyChildren(): Promise<ChildAccountWithStats[]> {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user?.id) throw new Error('Not authenticated');

    const { data: children, error } = await supabase
      .from('child_accounts')
      .select('*')
      .eq('parent_id', user.id)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const childRows = (children ?? []) as unknown as ChildAccountRow[];

    // Stats: pending requests + current doc count (best-effort)
    const withStats = await Promise.all(
      childRows.map(async (c) => {
        const [{ count: pendingCount }, { count: docCount }] = await Promise.all([
          supabase
            .from('child_account_requests')
            .select('*', { count: 'exact', head: true })
            .eq('child_account_id', c.id)
            .eq('status', 'pending'),
          supabase
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', c.child_user_id)
            .is('deleted_at', null),
        ]);

        return {
          ...c,
          pending_requests: pendingCount || 0,
          document_count: docCount || c.document_count || 0,
        } satisfies ChildAccountWithStats;
      })
    );

    return withStats;
  },

  async createChildAccount(input: CreateChildAccountInput): Promise<CreateChildAccountResult> {
    const { data, error } = await supabase.functions.invoke('create-child-account', {
      body: input,
    });
    if (error) throw error;
    return data as CreateChildAccountResult;
  },

  async checkEmailAvailable(email: string): Promise<{ available: boolean }> {
    const { data, error } = await supabase.functions.invoke('child-email-available', {
      body: { email },
    });
    if (error) throw error;
    return data as { available: boolean };
  },

  async getChildAccount(childAccountId: string): Promise<ChildAccountRow> {
    const { data, error } = await supabase
      .from('child_accounts')
      .select('*')
      .eq('id', childAccountId)
      .single();
    if (error) throw error;
    return data as unknown as ChildAccountRow;
  },

  async listPendingRequests(childAccountId: string) {
    const { data, error } = await supabase
      .from('child_account_requests')
      .select('*')
      .eq('child_account_id', childAccountId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async resolveRequest(params: { request_id: string; action: 'approve' | 'deny'; denial_reason?: string }) {
    const { data, error } = await supabase.functions.invoke('resolve-child-request', {
      body: params,
    });
    if (error) throw error;
    return data as { ok: true };
  },

  async updateChildAccount(
    childAccountId: string,
    updates: Partial<Pick<ChildAccountRow, 'permissions' | 'oversight_level' | 'status' | 'notification_preferences' | 'auto_convert_on_18'>>
  ) {
    const { data, error } = await supabase
      .from('child_accounts')
      .update(updates as any)
      .eq('id', childAccountId)
      .select('*')
      .single();
    if (error) throw error;
    return data as unknown as ChildAccountRow;
  },

  async touchLastActive(childUserId: string) {
    // Best-effort: only works for child users if RLS allows.
    await supabase
      .from('child_accounts')
      .update({ last_active_at: new Date().toISOString() })
      .eq('child_user_id', childUserId);
  },
};


