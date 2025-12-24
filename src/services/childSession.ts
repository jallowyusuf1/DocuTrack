import { supabase } from '../config/supabase';
import type { ChildPermissions, OversightLevel } from './childAccounts';
import { childAccountsService } from './childAccounts';

export type AccountType = 'adult' | 'child';
export type AccountRole = 'user' | 'parent' | 'child';

export interface ChildSessionContext {
  accountType: 'child';
  childAccountId: string;
  parentId: string;
  parentName: string;
  oversightLevel: OversightLevel;
  permissions: ChildPermissions;
  notificationPreferences: any;
}

const SESSION_KEY = 'dt.account';

export function readAccountSession(): { accountType: AccountType; role: AccountRole; child?: ChildSessionContext } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAccountSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('dt.accountType');
  } catch {
    // ignore
  }
}

export function writeAccountSession(payload: { accountType: AccountType; role: AccountRole; child?: ChildSessionContext }) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    sessionStorage.setItem('dt.accountType', payload.accountType);
  } catch {
    // ignore
  }
}

export async function hydrateAccountType(
  userId: string
): Promise<{ accountType: AccountType; role: AccountRole; child: ChildSessionContext | null }> {
  // Detect child account
  const { data: child, error } = await supabase
    .from('child_accounts')
    .select('id, parent_id, oversight_level, permissions, notification_preferences, status')
    .eq('child_user_id', userId)
    .neq('status', 'deleted')
    .maybeSingle();

  if (error) {
    writeAccountSession({ accountType: 'adult', role: 'user' });
    return { accountType: 'adult', role: 'user', child: null };
  }

  if (!child?.id) {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('account_role')
        .eq('user_id', userId)
        .maybeSingle();
      const role = (profile?.account_role as AccountRole | null) ?? 'user';
      writeAccountSession({ accountType: 'adult', role });
      return { accountType: 'adult', role, child: null };
    } catch {
      writeAccountSession({ accountType: 'adult', role: 'user' });
    }
    return { accountType: 'adult', role: 'user', child: null };
  }

  // Parent name (best-effort)
  const { data: parentProfile } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('user_id', child.parent_id)
    .maybeSingle();

  const ctx: ChildSessionContext = {
    accountType: 'child',
    childAccountId: child.id,
    parentId: child.parent_id,
    parentName: parentProfile?.full_name || 'Parent',
    oversightLevel: child.oversight_level,
    permissions: child.permissions,
    notificationPreferences: child.notification_preferences,
  };

  writeAccountSession({ accountType: 'child', role: 'child', child: ctx });

  // Log login (best-effort)
  try {
    await childAccountsService.logActivity({
      child_account_id: ctx.childAccountId,
      action_type: 'login',
      status: 'success',
      details: {
        path: window.location.pathname,
        user_agent: navigator.userAgent,
      },
    });
  } catch {
    // ignore
  }

  return { accountType: 'child', role: 'child', child: ctx };
}


