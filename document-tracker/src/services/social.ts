import { supabase } from '../config/supabase';
import { isTableNotFound } from '../utils/errorHandling';
import type { Connection, SharedDocument, Household } from '../types';

// Connections
export async function getConnections() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        connected_user:connected_user_id (
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false });

    if (error) {
      if (isTableNotFound(error)) {
        console.warn('Connections table not found, returning empty array');
        return [];
      }
      throw error;
    }
    return (data || []) as Connection[];
  } catch (error: any) {
    if (isTableNotFound(error)) {
      console.warn('Connections feature not available:', error.message);
      return [];
    }
    console.error('Error fetching connections:', error);
    return [];
  }
}

export async function getPendingConnections() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        user:user_id (
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('connected_user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      if (isTableNotFound(error)) {
        console.warn('Connections table not found, returning empty array');
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (error: any) {
    if (isTableNotFound(error)) {
      console.warn('Connections feature not available:', error.message);
      return [];
    }
    console.error('Error fetching pending connections:', error);
    return [];
  }
}

export async function sendConnectionRequest(
  email: string,
  relationship: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Find user by email
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (userError) throw new Error('User not found');

    const { data, error } = await supabase
      .from('connections')
      .insert({
        user_id: user.id,
        connected_user_id: targetUser.id,
        relationship,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      if (isTableNotFound(error)) {
        throw new Error('Family sharing feature is not available. Please contact support.');
      }
      throw error;
    }

    // Send notification (gracefully handle if notifications table doesn't exist)
    try {
      await supabase.from('notifications').insert({
        user_id: targetUser.id,
        title: 'New Connection Request',
        message: `${user.email} sent you a connection request`,
        type: 'connection_request'
      });
    } catch (notifError) {
      // Notification failure shouldn't block connection request
      console.warn('Failed to send notification:', notifError);
    }

    return data;
  } catch (error: any) {
    console.error('Error sending connection request:', error);
    throw error;
  }
}

export async function acceptConnection(connectionId: string) {
  const { data, error } = await supabase
    .from('connections')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('id', connectionId)
    .select()
    .single();

  if (error) throw error;

  // Create reverse connection
  const connection = data as Connection;
  await supabase.from('connections').insert({
    user_id: connection.connected_user_id,
    connected_user_id: connection.user_id,
    relationship: connection.relationship,
    status: 'accepted',
    accepted_at: new Date().toISOString()
  });

  return data;
}

export async function declineConnection(connectionId: string) {
  const { error } = await supabase
    .from('connections')
    .delete()
    .eq('id', connectionId);

  if (error) throw error;
}

export async function removeConnection(connectionId: string) {
  // Delete both directions of the connection
  const { data: connection } = await supabase
    .from('connections')
    .select('user_id, connected_user_id')
    .eq('id', connectionId)
    .single();

  if (!connection) throw new Error('Connection not found');

  await supabase
    .from('connections')
    .delete()
    .or(`and(user_id.eq.${connection.user_id},connected_user_id.eq.${connection.connected_user_id}),and(user_id.eq.${connection.connected_user_id},connected_user_id.eq.${connection.user_id})`);
}

// Shared Documents
export async function shareDocument(
  documentId: string,
  userId: string,
  permission: 'view' | 'edit',
  message?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('shared_documents')
    .insert({
      document_id: documentId,
      owner_id: user.id,
      shared_with_id: userId,
      permission,
      message
    })
    .select()
    .single();

  if (error) throw error;

  // Send notification
  const { data: doc } = await supabase
    .from('documents')
    .select('document_name')
    .eq('id', documentId)
    .single();

  await supabase.from('notifications').insert({
    user_id: userId,
    title: 'Document Shared With You',
    message: `${user.email} shared "${doc?.document_name}" with you`,
    type: 'document_shared',
    action_url: `/document/${documentId}`
  });

  return data;
}

export async function getSharedDocuments() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('shared_documents')
      .select(`
        *,
        document:document_id (*),
        owner:owner_id (email, full_name, avatar_url)
      `)
      .eq('shared_with_id', user.id)
      .order('shared_at', { ascending: false });

    if (error) {
      if (isTableNotFound(error)) {
        console.warn('Shared documents table not found, returning empty array');
        return [];
      }
      throw error;
    }
    return (data || []) as SharedDocument[];
  } catch (error: any) {
    if (isTableNotFound(error)) {
      console.warn('Shared documents feature not available:', error.message);
      return [];
    }
    console.error('Error fetching shared documents:', error);
    return [];
  }
}

export async function getDocumentsIShared() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('shared_documents')
    .select(`
      *,
      document:document_id (*),
      shared_with:shared_with_id (email, full_name, avatar_url)
    `)
    .eq('owner_id', user.id)
    .order('shared_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function removeShare(shareId: string) {
  const { error } = await supabase
    .from('shared_documents')
    .delete()
    .eq('id', shareId);

  if (error) throw error;
}

// Households
export async function createHousehold(name: string, memberIds: string[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: household, error: householdError } = await supabase
    .from('households')
    .insert({ name, created_by: user.id })
    .select()
    .single();

  if (householdError) throw householdError;

  // Add creator as admin
  await supabase.from('household_members').insert({
    household_id: household.id,
    user_id: user.id,
    role: 'admin'
  });

  // Add other members
  if (memberIds.length > 0) {
    await supabase.from('household_members').insert(
      memberIds.map(id => ({
        household_id: household.id,
        user_id: id,
        role: 'member'
      }))
    );
  }

  return household;
}

export async function getHouseholds() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('households')
      .select(`
        *,
        members:household_members (
          user_id,
          role,
          joined_at,
          user:user_id (email, full_name, avatar_url)
        )
      `)
      .eq('household_members.user_id', user.id);

    if (error) {
      if (isTableNotFound(error)) {
        console.warn('Households table not found, returning empty array');
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (error: any) {
    if (isTableNotFound(error)) {
      console.warn('Households feature not available:', error.message);
      return [];
    }
    console.error('Error fetching households:', error);
    return [];
  }
}
