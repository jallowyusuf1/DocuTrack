import { supabase } from '../config/supabase';
import type { Connection, SharedDocument, Permission, RelationshipType } from '../types';

export interface FamilyMember {
  id: string;
  user_id: string;
  connected_user_id: string;
  relationship: RelationshipType;
  status: 'accepted' | 'pending';
  created_at: string;
  accepted_at?: string;
  connected_user: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
  shared_documents_count?: number;
  last_active?: string;
}

export interface FamilyInvitation {
  id: string;
  inviter_id: string;
  invitee_email: string;
  invitee_id?: string;
  relationship: RelationshipType;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  created_at: string;
  inviter?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface SharedDocumentWithDetails extends SharedDocument {
  document: {
    id: string;
    document_name: string;
    document_type: string;
    expiration_date: string;
    image_url: string;
    category: string;
  };
  owner: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

/**
 * Get all family connections (accepted)
 */
export async function getFamilyConnections(): Promise<FamilyMember[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('connections')
    .select(`
      *,
      connected_user:connected_user_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Get shared documents count and last active for each connection
  const membersWithStats = await Promise.all(
    (data || []).map(async (member) => {
      const { count } = await supabase
        .from('shared_documents')
        .select('*', { count: 'exact', head: true })
        .or(`and(owner_id.eq.${user.id},shared_with_id.eq.${member.connected_user_id}),and(owner_id.eq.${member.connected_user_id},shared_with_id.eq.${user.id})`);

      // Get last active (from user_profiles or connections updated_at)
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('updated_at')
        .eq('user_id', member.connected_user_id)
        .single();

      return {
        ...member,
        shared_documents_count: count || 0,
        last_active: profile?.updated_at || member.accepted_at,
      } as FamilyMember;
    })
  );

  return membersWithStats;
}

/**
 * Get documents shared with current user
 */
export async function getSharedWithMe(): Promise<SharedDocumentWithDetails[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('shared_documents')
    .select(`
      *,
      document:document_id (
        id,
        document_name,
        document_type,
        expiration_date,
        image_url,
        category
      ),
      owner:owner_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('shared_with_id', user.id)
    .order('shared_at', { ascending: false });

  if (error) throw error;
  return (data || []) as SharedDocumentWithDetails[];
}

/**
 * Get documents shared by current user
 */
export async function getDocumentsIShared(): Promise<SharedDocumentWithDetails[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('shared_documents')
    .select(`
      *,
      document:document_id (
        id,
        document_name,
        document_type,
        expiration_date,
        image_url,
        category
      ),
      shared_with:shared_with_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('owner_id', user.id)
    .order('shared_at', { ascending: false });

  if (error) throw error;
  return (data || []) as SharedDocumentWithDetails[];
}

/**
 * Get pending invitations (sent and received)
 */
export async function getPendingInvitations(): Promise<{
  sent: FamilyInvitation[];
  received: FamilyInvitation[];
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get sent invitations
  const { data: sentData, error: sentError } = await supabase
    .from('family_invitations')
    .select('*')
    .eq('inviter_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (sentError && sentError.code !== 'PGRST116') {
    console.error('Error fetching sent invitations:', sentError);
  }

  // Get received invitations
  const { data: receivedData, error: receivedError } = await supabase
    .from('family_invitations')
    .select(`
      *,
      inviter:inviter_id (
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('invitee_email', user.email)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (receivedError && receivedError.code !== 'PGRST116') {
    console.error('Error fetching received invitations:', receivedError);
  }

  return {
    sent: (sentData || []) as FamilyInvitation[],
    received: (receivedData || []) as FamilyInvitation[],
  };
}

/**
 * Send family invitation
 */
export async function sendFamilyInvitation(
  email: string,
  relationship: RelationshipType,
  message?: string
): Promise<FamilyInvitation> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user exists
  const { data: targetUser } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('email', email)
    .single();

  // Insert invitation
  const { data, error } = await supabase
    .from('family_invitations')
    .insert({
      inviter_id: user.id,
      invitee_email: email,
      invitee_id: targetUser?.user_id || null,
      relationship,
      message,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    // If table doesn't exist, try using connections table as fallback
    if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
      // Fallback to connections table
      return await sendConnectionRequestFallback(email, relationship, message);
    }
    throw error;
  }

  // Send email notification (if email service is configured)
  try {
    // TODO: Implement email sending
    console.log('Sending invitation email to:', email);
  } catch (emailError) {
    console.warn('Failed to send invitation email:', emailError);
  }

  return data as FamilyInvitation;
}

/**
 * Fallback to connections table if family_invitations doesn't exist
 */
async function sendConnectionRequestFallback(
  email: string,
  relationship: RelationshipType,
  message?: string
): Promise<any> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: targetUser } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('email', email)
    .single();

  if (!targetUser) throw new Error('User not found');

  const { data, error } = await supabase
    .from('connections')
    .insert({
      user_id: user.id,
      connected_user_id: targetUser.user_id,
      relationship,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Accept invitation
 */
export async function acceptInvitation(invitationId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get invitation
  const { data: invitation, error: fetchError } = await supabase
    .from('family_invitations')
    .select('*')
    .eq('id', invitationId)
    .single();

  if (fetchError) {
    // Try connections table fallback
    await acceptConnectionFallback(invitationId);
    return;
  }

  if (!invitation || invitation.status !== 'pending') {
    throw new Error('Invitation not found or already processed');
  }

  // Update invitation status
  await supabase
    .from('family_invitations')
    .update({ status: 'accepted' })
    .eq('id', invitationId);

  // Create connection in both directions
  const connectionData = {
    user_id: invitation.inviter_id,
    connected_user_id: user.id,
    relationship: invitation.relationship,
    status: 'accepted' as const,
    accepted_at: new Date().toISOString(),
  };

  await supabase.from('connections').insert(connectionData);

  // Create reverse connection
  await supabase.from('connections').insert({
    user_id: user.id,
    connected_user_id: invitation.inviter_id,
    relationship: invitation.relationship,
    status: 'accepted' as const,
    accepted_at: new Date().toISOString(),
  });

  // Send confirmation notification
  try {
    await supabase.from('notifications').insert({
      user_id: invitation.inviter_id,
      title: 'Invitation Accepted',
      message: `${user.email} accepted your family invitation`,
      type: 'invitation_accepted',
    });
  } catch (notifError) {
    console.warn('Failed to send notification:', notifError);
  }
}

/**
 * Fallback to connections table
 */
async function acceptConnectionFallback(connectionId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: connection, error } = await supabase
    .from('connections')
    .select('*')
    .eq('id', connectionId)
    .eq('connected_user_id', user.id)
    .eq('status', 'pending')
    .single();

  if (error || !connection) throw new Error('Connection not found');

  // Update connection
  await supabase
    .from('connections')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', connectionId);

  // Create reverse connection
  await supabase.from('connections').insert({
    user_id: user.id,
    connected_user_id: connection.user_id,
    relationship: connection.relationship,
    status: 'accepted',
    accepted_at: new Date().toISOString(),
  });
}

/**
 * Decline invitation
 */
export async function declineInvitation(invitationId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Try family_invitations first
  const { data: invitation } = await supabase
    .from('family_invitations')
    .select('*')
    .eq('id', invitationId)
    .single();

  if (invitation) {
    await supabase
      .from('family_invitations')
      .update({ status: 'declined' })
      .eq('id', invitationId);
  } else {
    // Fallback to connections
    await supabase
      .from('connections')
      .delete()
      .eq('id', invitationId)
      .eq('connected_user_id', user.id);
  }

  // Notify sender
  if (invitation) {
    try {
      await supabase.from('notifications').insert({
        user_id: invitation.inviter_id,
        title: 'Invitation Declined',
        message: `${user.email} declined your family invitation`,
        type: 'invitation_declined',
      });
    } catch (notifError) {
      console.warn('Failed to send notification:', notifError);
    }
  }
}

/**
 * Cancel sent invitation
 */
export async function cancelInvitation(invitationId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('family_invitations')
    .update({ status: 'cancelled' })
    .eq('id', invitationId)
    .eq('inviter_id', user.id);

  if (error && error.code !== 'PGRST116') {
    // Fallback to connections
    await supabase
      .from('connections')
      .delete()
      .eq('id', invitationId)
      .eq('user_id', user.id);
  }
}

/**
 * Resend invitation
 */
export async function resendInvitation(invitationId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: invitation, error } = await supabase
    .from('family_invitations')
    .select('*')
    .eq('id', invitationId)
    .eq('inviter_id', user.id)
    .single();

  if (error || !invitation) throw new Error('Invitation not found');

  // Send email notification
  try {
    // TODO: Implement email sending
    console.log('Resending invitation email to:', invitation.invitee_email);
  } catch (emailError) {
    console.warn('Failed to resend invitation email:', emailError);
  }
}

/**
 * Share document with family members
 */
export async function shareDocumentWithFamily(
  documentId: string,
  memberIds: string[],
  permission: Permission
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Insert shared_documents records
  const shares = memberIds.map(memberId => ({
    document_id: documentId,
    owner_id: user.id,
    shared_with_id: memberId,
    permission,
    shared_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('shared_documents')
    .insert(shares);

  if (error) throw error;

  // Send notifications
  const { data: document } = await supabase
    .from('documents')
    .select('document_name')
    .eq('id', documentId)
    .single();

  const notifications = memberIds.map(memberId => ({
    user_id: memberId,
    title: 'Document Shared With You',
    message: `${user.email} shared "${document?.document_name || 'a document'}" with you`,
    type: 'document_shared',
    action_url: `/documents/${documentId}`,
  }));

  try {
    await supabase.from('notifications').insert(notifications);
  } catch (notifError) {
    console.warn('Failed to send notifications:', notifError);
  }
}

/**
 * Remove family connection
 */
export async function removeFamilyConnection(connectionId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get connection details
  const { data: connection } = await supabase
    .from('connections')
    .select('user_id, connected_user_id')
    .eq('id', connectionId)
    .single();

  if (!connection) throw new Error('Connection not found');

  const otherUserId = connection.user_id === user.id
    ? connection.connected_user_id
    : connection.user_id;

  // Delete both directions of connection
  await supabase
    .from('connections')
    .delete()
    .or(`and(user_id.eq.${user.id},connected_user_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},connected_user_id.eq.${user.id})`);

  // Remove all shared documents between these users
  await supabase
    .from('shared_documents')
    .delete()
    .or(`and(owner_id.eq.${user.id},shared_with_id.eq.${otherUserId}),and(owner_id.eq.${otherUserId},shared_with_id.eq.${user.id})`);

  // Notify the other user
  try {
    await supabase.from('notifications').insert({
      user_id: otherUserId,
      title: 'Connection Removed',
      message: `${user.email} removed you from their family connections`,
      type: 'connection_removed',
    });
  } catch (notifError) {
    console.warn('Failed to send notification:', notifError);
  }
}

/**
 * Get document share permission for current user
 */
export async function getDocumentPermission(documentId: string): Promise<Permission | 'owner' | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Check if user owns the document
  const { data: document } = await supabase
    .from('documents')
    .select('user_id')
    .eq('id', documentId)
    .single();

  if (document?.user_id === user.id) {
    return 'owner';
  }

  // Check if document is shared with user
  const { data: share } = await supabase
    .from('shared_documents')
    .select('permission')
    .eq('document_id', documentId)
    .eq('shared_with_id', user.id)
    .single();

  return share?.permission || null;
}

/**
 * Get member details with shared documents and activity
 */
export async function getMemberDetails(memberId: string): Promise<{
  member: FamilyMember;
  sharedDocuments: SharedDocumentWithDetails[];
  activity: any[];
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get member info
  const { data: connection } = await supabase
    .from('connections')
    .select(`
      *,
      connected_user:connected_user_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('id', memberId)
    .eq('user_id', user.id)
    .single();

  if (!connection) throw new Error('Member not found');

  // Get shared documents
  const { data: sharedDocs } = await supabase
    .from('shared_documents')
    .select(`
      *,
      document:document_id (
        id,
        document_name,
        document_type,
        expiration_date,
        image_url,
        category
      )
    `)
    .or(`and(owner_id.eq.${user.id},shared_with_id.eq.${connection.connected_user_id}),and(owner_id.eq.${connection.connected_user_id},shared_with_id.eq.${user.id})`)
    .order('shared_at', { ascending: false });

  // Get activity (from shared_documents and connections)
  const activity: any[] = [];
  
  // Add document sharing activities
  (sharedDocs || []).forEach(share => {
    activity.push({
      type: 'document_shared',
      timestamp: share.shared_at,
      description: `Document "${share.document?.document_name}" shared`,
    });
  });

  // Add connection activity
  activity.push({
    type: 'connection_created',
    timestamp: connection.created_at,
    description: 'Connection established',
  });

  activity.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return {
    member: connection as FamilyMember,
    sharedDocuments: (sharedDocs || []) as SharedDocumentWithDetails[],
    activity: activity.slice(0, 20), // Last 20 activities
  };
}

/**
 * Setup real-time subscription for invitations
 */
export async function subscribeToInvitations(
  callback: (invitation: FamilyInvitation) => void
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  return supabase
    .channel('family_invitations')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'family_invitations',
        filter: `invitee_email=eq.${user.email}`,
      },
      (payload) => {
        callback(payload.new as FamilyInvitation);
      }
    )
    .subscribe();
}

/**
 * Setup real-time subscription for shared documents
 */
export async function subscribeToSharedDocuments(
  callback: (share: SharedDocumentWithDetails) => void
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  return supabase
    .channel('shared_documents')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'shared_documents',
        filter: `shared_with_id=eq.${user.id}`,
      },
      (payload) => {
        callback(payload.new as SharedDocumentWithDetails);
      }
    )
    .subscribe();
}
