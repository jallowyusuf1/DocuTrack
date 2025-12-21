-- Family & Friends Social Layer Schema
-- Run this in Supabase SQL Editor

-- Connections table
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connected_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  relationship VARCHAR(50), -- 'spouse', 'parent', 'child', 'sibling', 'friend', 'other'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  CONSTRAINT unique_connection UNIQUE(user_id, connected_user_id),
  CONSTRAINT no_self_connection CHECK (user_id != connected_user_id)
);

-- Shared documents
CREATE TABLE IF NOT EXISTS shared_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_with_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission VARCHAR(20) CHECK (permission IN ('view', 'edit')) DEFAULT 'view',
  shared_at TIMESTAMPTZ DEFAULT NOW(),
  message TEXT,
  CONSTRAINT unique_share UNIQUE(document_id, shared_with_id),
  CONSTRAINT no_self_share CHECK (owner_id != shared_with_id)
);

-- Household groups
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Household members
CREATE TABLE IF NOT EXISTS household_members (
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (household_id, user_id)
);

-- Unlock requests for locked shared documents
CREATE TABLE IF NOT EXISTS unlock_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_document_id UUID REFERENCES shared_documents(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'denied')) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- 15 minutes after approval
  approved_at TIMESTAMPTZ
);

-- Row Level Security Policies

-- Connections policies
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connections"
  ON connections FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY "Users can create connections"
  ON connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections"
  ON connections FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY "Users can delete their own connections"
  ON connections FOR DELETE
  USING (auth.uid() = user_id);

-- Shared documents policies
ALTER TABLE shared_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents shared with them"
  ON shared_documents FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = shared_with_id);

CREATE POLICY "Owners can share their documents"
  ON shared_documents FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update shares"
  ON shared_documents FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete shares"
  ON shared_documents FOR DELETE
  USING (auth.uid() = owner_id);

-- Households policies
ALTER TABLE households ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can view their households"
  ON households FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = households.id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create households"
  ON households FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update households"
  ON households FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = households.id
      AND household_members.user_id = auth.uid()
      AND household_members.role = 'admin'
    )
  );

-- Household members policies
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can view members"
  ON household_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = household_members.household_id
      AND hm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can add members"
  ON household_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_members.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role = 'admin'
    )
  );

-- Unlock requests policies
ALTER TABLE unlock_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view relevant unlock requests"
  ON unlock_requests FOR SELECT
  USING (
    auth.uid() = requester_id OR
    EXISTS (
      SELECT 1 FROM shared_documents
      WHERE shared_documents.id = unlock_requests.shared_document_id
      AND shared_documents.owner_id = auth.uid()
    )
  );

CREATE POLICY "Shared users can create unlock requests"
  ON unlock_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_connected_user_id ON connections(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);

CREATE INDEX IF NOT EXISTS idx_shared_documents_document_id ON shared_documents(document_id);
CREATE INDEX IF NOT EXISTS idx_shared_documents_owner_id ON shared_documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_shared_documents_shared_with_id ON shared_documents(shared_with_id);

CREATE INDEX IF NOT EXISTS idx_household_members_household_id ON household_members(household_id);
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON household_members(user_id);

-- Functions for helper queries

-- Get user's connections count
CREATE OR REPLACE FUNCTION get_connections_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM connections
  WHERE (user_id = user_uuid OR connected_user_id = user_uuid)
  AND status = 'accepted';
$$ LANGUAGE SQL STABLE;

-- Get shared documents count
CREATE OR REPLACE FUNCTION get_shared_documents_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM shared_documents
  WHERE owner_id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- Check if users are connected
CREATE OR REPLACE FUNCTION are_users_connected(user1_uuid UUID, user2_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM connections
    WHERE ((user_id = user1_uuid AND connected_user_id = user2_uuid)
       OR (user_id = user2_uuid AND connected_user_id = user1_uuid))
    AND status = 'accepted'
  );
$$ LANGUAGE SQL STABLE;
