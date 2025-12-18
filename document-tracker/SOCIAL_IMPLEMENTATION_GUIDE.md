# DocuTrackr Social Layer Implementation Guide

## ✅ COMPLETED: Database Schema

The complete database schema has been created in `SOCIAL_SCHEMA.sql`.

### To Apply:
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the entire `SOCIAL_SCHEMA.sql` file
4. Run the query
5. Verify all tables are created successfully

---

## 📋 IMPLEMENTATION STEPS

### Step 1: Add Social Types (5 minutes)

Add these types to `src/types/index.ts`:

```typescript
// Social/Connection types
export type ConnectionStatus = 'pending' | 'accepted' | 'blocked';
export type RelationshipType = 'spouse' | 'parent' | 'child' | 'sibling' | 'friend' | 'other';
export type Permission = 'view' | 'edit';
export type HouseholdRole = 'admin' | 'member';

export interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: ConnectionStatus;
  relationship: RelationshipType;
  created_at: string;
  accepted_at?: string;
  connected_user?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface SharedDocument {
  id: string;
  document_id: string;
  owner_id: string;
  shared_with_id: string;
  permission: Permission;
  shared_at: string;
  message?: string;
  document?: Document;
  owner?: {
    email: string;
    full_name?: string;
  };
  shared_with?: {
    email: string;
    full_name?: string;
  };
}

export interface Household {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  household_id: string;
  user_id: string;
  role: HouseholdRole;
  joined_at: string;
  user?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}
```

---

### Step 2: Create Social Services (10 minutes)

Create `src/services/social.ts`:

```typescript
import { supabase } from '../lib/supabase';
import { Connection, SharedDocument, Household } from '../types';

// Connections
export async function getConnections() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

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

  if (error) throw error;
  return data as Connection[];
}

export async function getPendingConnections() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

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

  if (error) throw error;
  return data;
}

export async function sendConnectionRequest(
  email: string,
  relationship: string
) {
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

  if (error) throw error;

  // Send notification
  await supabase.from('notifications').insert({
    user_id: targetUser.id,
    title: 'New Connection Request',
    message: `${user.email} sent you a connection request`,
    type: 'connection_request'
  });

  return data;
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('shared_documents')
    .select(`
      *,
      document:document_id (*),
      owner:owner_id (email, full_name, avatar_url)
    `)
    .eq('shared_with_id', user.id)
    .order('shared_at', { ascending: false });

  if (error) throw error;
  return data as SharedDocument[];
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

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

  if (error) throw error;
  return data;
}
```

---

### Step 3: Update Bottom Navigation (5 minutes)

Edit `src/components/layout/BottomNav.tsx`:

Add Family icon to imports:
```typescript
import { Users } from 'lucide-react';
```

Add Family tab to navigation array (after Documents):
```typescript
{
  id: 'family',
  label: t('nav.family'),
  icon: Users,
  path: '/family',
},
```

---

### Step 4: Add Route (2 minutes)

Edit `src/App.tsx`:

Import:
```typescript
import Family from './pages/family/Family';
```

Add route:
```typescript
<Route path="/family" element={<ProtectedRoute><Family /></ProtectedRoute>} />
```

---

### Step 5: Add Translation Keys (3 minutes)

Add to all locale files (`src/locales/*.json`):

```json
{
  "nav": {
    "family": "Family"
  },
  "family": {
    "title": "Family & Friends",
    "addConnection": "Add Connection",
    "connections": "Connections",
    "sharedWithMe": "Shared with Me",
    "households": "Households",
    "noConnections": "No connections yet",
    "noPending": "No pending requests",
    "noShared": "No shared documents",
    "shareDocument": "Share Document",
    "viewShared": "View Shared Documents",
    "editRelationship": "Edit Relationship",
    "removeConnection": "Remove Connection",
    "acceptRequest": "Accept",
    "declineRequest": "Decline",
    "documentsShared": "documents shared",
    "sharedBy": "Shared by",
    "viewOnly": "View Only",
    "canEdit": "Can Edit",
    "sendInvitation": "Send Invitation",
    "searchByEmail": "Search by email",
    "relationship": "Relationship",
    "spouse": "Spouse",
    "parent": "Parent",
    "child": "Child",
    "sibling": "Sibling",
    "friend": "Friend",
    "other": "Other"
  }
}
```

---

## 🎨 SUMMARY

I've created:

1. ✅ **Complete Database Schema** (`SOCIAL_SCHEMA.sql`)
   - Connections table with RLS policies
   - Shared documents table
   - Households and members tables
   - Unlock requests for locked documents
   - Helper functions and indexes

2. ✅ **TypeScript Types** (add to `types/index.ts`)
   - Connection, SharedDocument, Household interfaces
   - Status and permission types

3. ✅ **Social Services** (`services/social.ts`)
   - Connection management (send, accept, decline, remove)
   - Document sharing (share, view shared, remove)
   - Household management (create, view, manage)
   - Notification integration

4. 📝 **Next Steps for You:**
   - Apply the SQL schema in Supabase
   - Add the TypeScript types
   - Create the social services file
   - Create the Family page component (I can provide this if needed)
   - Update navigation and routes
   - Add translations

---

## 🚀 FLAWLESS EXECUTION CHECKLIST

- [ ] Run `SOCIAL_SCHEMA.sql` in Supabase SQL Editor
- [ ] Add social types to `src/types/index.ts`
- [ ] Create `src/services/social.ts` with all functions
- [ ] Add Family icon to Bottom Navigation
- [ ] Add `/family` route to App.tsx
- [ ] Add translation keys to all locale files
- [ ] Create Family page component
- [ ] Create modals (Add Connection, Share Document)
- [ ] Test connection flow
- [ ] Test sharing flow
- [ ] Test household creation

---

**The foundation is SOLID. The implementation is CLEAN. The UX will be DELIGHTFUL!** 🎉

Would you like me to create the Family page component and modals next?
