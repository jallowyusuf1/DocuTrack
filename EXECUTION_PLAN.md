# DocuTrack Execution Plan
## AI-Powered Notifications, Offline Access & Secure Sharing

**Created:** January 2025  
**Status:** Planning Phase  
**Estimated Timeline:** 8-12 weeks (with 1-2 developers)

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Database Schema & Infrastructure](#phase-1-database-schema--infrastructure)
3. [Phase 2: AI-Powered Insights System](#phase-2-ai-powered-insights-system)
4. [Phase 3: Offline Access Enhancement](#phase-3-offline-access-enhancement)
5. [Phase 4: Secure Document Sharing](#phase-4-secure-document-sharing)
6. [Phase 5: Integration & Testing](#phase-5-integration--testing)
7. [Phase 6: Polish & Deployment](#phase-6-polish--deployment)
8. [Dependencies & Prerequisites](#dependencies--prerequisites)
9. [Risk Mitigation](#risk-mitigation)
10. [Success Metrics](#success-metrics)

---

## Overview

This plan implements three major features:
1. **AI-Powered Notifications & Document Intelligence** - Insights dashboard with predictive alerts
2. **Complete Offline Access** - Full read-only offline document access with smart caching
3. **Secure Temporary Document Sharing** - Multi-method sharing with expiration, passwords, and tracking

### Architecture Decisions

- **Insights Engine**: Client-side analysis with optional server-side processing for complex patterns
- **Offline Storage**: Enhance existing Dexie implementation with service worker caching
- **Sharing**: Token-based links with server-side validation and tracking
- **AI Features**: Rule-based intelligence initially, ML integration ready for future

---

## Phase 1: Database Schema & Infrastructure

**Duration:** 1-2 weeks  
**Priority:** Critical (blocks all other phases)

### 1.1 Insights Tables

**Migration:** `20250130000000_insights_system.sql`

```sql
-- Insights table
CREATE TABLE IF NOT EXISTS insights (
  insight_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(20) CHECK (type IN ('alert', 'opportunity', 'pattern', 'recommendation')) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'expiry_conflict', 'missing_document', etc.
  priority INTEGER CHECK (priority >= 0 AND priority <= 100) DEFAULT 50,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_documents JSONB DEFAULT '[]'::jsonb,
  action_url TEXT,
  action_label TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional data for rendering
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  acted_on BOOLEAN DEFAULT false,
  acted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insight actions log
CREATE TABLE IF NOT EXISTS insight_actions (
  action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id UUID REFERENCES insights(insight_id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type VARCHAR(20) CHECK (action_type IN ('dismissed', 'snoozed', 'completed', 'viewed')) NOT NULL,
  action_timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Notification preferences (enhanced)
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  insights_enabled BOOLEAN DEFAULT true,
  frequency VARCHAR(20) CHECK (frequency IN ('realtime', 'hourly', 'daily', 'weekly')) DEFAULT 'daily',
  priority_threshold INTEGER DEFAULT 50, -- Only show insights >= this priority
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  category_preferences JSONB DEFAULT '{}'::jsonb, -- Per-category toggles
  learning_enabled BOOLEAN DEFAULT true, -- AI learns preferences
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insight generation log (for monitoring)
CREATE TABLE IF NOT EXISTS insight_generation_log (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  insights_generated INTEGER DEFAULT 0,
  processing_time_ms INTEGER,
  errors JSONB DEFAULT '[]'::jsonb
);

-- Indexes
CREATE INDEX idx_insights_user_id ON insights(user_id);
CREATE INDEX idx_insights_type ON insights(type);
CREATE INDEX idx_insights_priority ON insights(priority DESC);
CREATE INDEX idx_insights_dismissed ON insights(dismissed);
CREATE INDEX idx_insights_expires_at ON insights(expires_at);
CREATE INDEX idx_insight_actions_insight_id ON insight_actions(insight_id);
CREATE INDEX idx_insight_actions_user_id ON insight_actions(user_id);
```

**Tasks:**
- [ ] Create migration file
- [ ] Add RLS policies for all tables
- [ ] Test migration on dev database
- [ ] Create TypeScript types for new tables
- [ ] Add indexes for performance

### 1.2 Offline Tables

**Migration:** `20250130000001_offline_system.sql`

```sql
-- Offline documents tracking
CREATE TABLE IF NOT EXISTS offline_documents (
  offline_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_offline TIMESTAMPTZ,
  cache_size_bytes BIGINT DEFAULT 0,
  pinned BOOLEAN DEFAULT false, -- User pinned to prevent eviction
  UNIQUE(document_id, user_id)
);

-- Offline sync log
CREATE TABLE IF NOT EXISTS offline_sync_log (
  sync_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sync_started_at TIMESTAMPTZ DEFAULT NOW(),
  sync_completed_at TIMESTAMPTZ,
  items_synced INTEGER DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('success', 'failed', 'partial')) DEFAULT 'success',
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Offline settings
CREATE TABLE IF NOT EXISTS offline_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  download_strategy VARCHAR(20) CHECK (download_strategy IN ('smart', 'all', 'manual')) DEFAULT 'smart',
  auto_sync BOOLEAN DEFAULT true,
  sync_frequency VARCHAR(20) CHECK (sync_frequency IN ('hourly', '4hours', 'daily', 'manual')) DEFAULT 'hourly',
  wifi_only BOOLEAN DEFAULT false,
  charging_only BOOLEAN DEFAULT false,
  max_cache_size_mb INTEGER DEFAULT 500,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_offline_documents_user_id ON offline_documents(user_id);
CREATE INDEX idx_offline_documents_document_id ON offline_documents(document_id);
CREATE INDEX idx_offline_sync_log_user_id ON offline_sync_log(user_id);
CREATE INDEX idx_offline_sync_log_status ON offline_sync_log(status);
```

**Tasks:**
- [ ] Create migration file
- [ ] Add RLS policies
- [ ] Update Dexie schema version
- [ ] Create TypeScript types

### 1.3 Sharing Tables

**Migration:** `20250130000002_sharing_system.sql`

```sql
-- Document shares
CREATE TABLE IF NOT EXISTS document_shares (
  share_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- sharer
  share_method VARCHAR(20) CHECK (share_method IN ('link', 'email', 'sms', 'qr', 'nearby', 'download')) NOT NULL,
  share_link_token VARCHAR(255) UNIQUE NOT NULL, -- For link-based shares
  expires_at TIMESTAMPTZ,
  max_views INTEGER,
  view_count INTEGER DEFAULT 0,
  password_hash TEXT, -- Hashed password if password protected
  watermark_config JSONB DEFAULT '{}'::jsonb,
  access_control VARCHAR(20) CHECK (access_control IN ('view_only', 'download', 'print')) DEFAULT 'view_only',
  require_signin BOOLEAN DEFAULT false,
  allowed_ips JSONB DEFAULT '[]'::jsonb, -- Array of IP addresses
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb -- Additional share-specific data
);

-- Share access log
CREATE TABLE IF NOT EXISTS share_access_log (
  access_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID REFERENCES document_shares(share_id) ON DELETE CASCADE NOT NULL,
  viewer_ip INET,
  viewer_device TEXT,
  viewer_location JSONB DEFAULT '{}'::jsonb, -- {city, country, lat, lng}
  action VARCHAR(20) CHECK (action IN ('viewed', 'downloaded', 'printed')) NOT NULL,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT
);

-- Share templates
CREATE TABLE IF NOT EXISTS share_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  settings JSONB NOT NULL, -- All share settings as JSON
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_document_shares_document_id ON document_shares(document_id);
CREATE INDEX idx_document_shares_user_id ON document_shares(user_id);
CREATE INDEX idx_document_shares_token ON document_shares(share_link_token);
CREATE INDEX idx_document_shares_revoked ON document_shares(revoked);
CREATE INDEX idx_share_access_log_share_id ON share_access_log(share_id);
CREATE INDEX idx_share_access_log_accessed_at ON share_access_log(accessed_at DESC);
```

**Tasks:**
- [ ] Create migration file
- [ ] Add RLS policies
- [ ] Create unique token generator utility
- [ ] Add TypeScript types

### 1.4 RLS Policies

**Tasks:**
- [ ] Write RLS policies for all new tables
- [ ] Test policies with different user roles
- [ ] Document policy logic

### 1.5 TypeScript Types

**File:** `src/types/insights.ts`, `src/types/offline.ts`, `src/types/sharing.ts`

**Tasks:**
- [ ] Define Insight interface
- [ ] Define OfflineDocument interface
- [ ] Define DocumentShare interface
- [ ] Export types from main types file

---

## Phase 2: AI-Powered Insights System

**Duration:** 3-4 weeks  
**Priority:** High  
**Dependencies:** Phase 1 complete

### 2.1 Insights Engine (Backend Logic)

**File:** `src/services/insightsEngine.ts`

**Core Functions:**
- `generateInsights(userId: string): Promise<Insight[]>`
- `checkExpiryConflicts(userId: string): Promise<Insight[]>`
- `detectMissingDocuments(userId: string): Promise<Insight[]>`
- `findInsuranceGaps(userId: string): Promise<Insight[]>`
- `detectValidationErrors(userId: string): Promise<Insight[]>`
- `analyzeDocumentHealth(userId: string): Promise<number>` (0-100 score)
- `calculateDocumentLifecycle(userId: string): Promise<LifecycleData>`
- `trackUsagePatterns(userId: string): Promise<UsageData>`

**Tasks:**
- [ ] Create insightsEngine service
- [ ] Implement expiry conflict detection
- [ ] Implement missing document detection
- [ ] Implement insurance gap detection
- [ ] Implement validation error detection
- [ ] Implement document health scoring
- [ ] Implement lifecycle analysis
- [ ] Implement usage pattern tracking
- [ ] Add unit tests for each function

### 2.2 Insights API Service

**File:** `src/services/insightsService.ts`

**Functions:**
- `getInsights(userId: string, filters?: InsightFilters): Promise<Insight[]>`
- `getCriticalAlerts(userId: string): Promise<Insight[]>`
- `getOpportunities(userId: string): Promise<Insight[]>`
- `getPatterns(userId: string): Promise<Insight[]>`
- `getRecommendations(userId: string): Promise<Insight[]>`
- `dismissInsight(insightId: string, userId: string): Promise<void>`
- `snoozeInsight(insightId: string, userId: string, until: Date): Promise<void>`
- `actOnInsight(insightId: string, userId: string): Promise<void>`
- `getDocumentHealthScore(userId: string): Promise<number>`

**Tasks:**
- [ ] Create insightsService
- [ ] Implement CRUD operations
- [ ] Add filtering and pagination
- [ ] Add caching layer
- [ ] Add error handling

### 2.3 Insights Generation Scheduler

**File:** `src/services/insightsScheduler.ts`

**Functions:**
- `scheduleInsightGeneration(userId: string): void`
- `generateInsightsForUser(userId: string): Promise<void>`
- `cleanupExpiredInsights(): Promise<void>`

**Tasks:**
- [ ] Create scheduler service
- [ ] Implement daily generation job
- [ ] Add cleanup job for expired insights
- [ ] Add error logging

### 2.4 Insights Dashboard Page

**File:** `src/pages/insights/InsightsDashboard.tsx`

**Components:**
- Header with title, subtitle, date range filter
- Tab switcher (Critical Alerts, Opportunities, Patterns & Trends, Recommendations)
- Insight cards with actions
- Empty states
- Loading states

**Tasks:**
- [ ] Create InsightsDashboard page component
- [ ] Add route in App.tsx (`/insights`)
- [ ] Create tab navigation component
- [ ] Create InsightCard component
- [ ] Implement date range filtering
- [ ] Add empty states
- [ ] Add loading skeletons
- [ ] Add error handling

### 2.5 Insight Card Components

**File:** `src/components/insights/InsightCard.tsx`

**Variants:**
- CriticalAlertCard (red/orange)
- OpportunityCard (green/blue)
- PatternCard (analytics style)
- RecommendationCard (purple)

**Tasks:**
- [ ] Create base InsightCard component
- [ ] Create variant components
- [ ] Add action buttons (Dismiss, Snooze, Act)
- [ ] Add document preview links
- [ ] Add animations

### 2.6 Critical Alerts Tab

**File:** `src/pages/insights/CriticalAlertsTab.tsx`

**Alert Types:**
- Expiry Conflicts
- Missing Documents
- Insurance Gaps
- Family Document Clusters
- Validation Errors
- Security Alerts
- Duplicate Documents
- Requirement Changes

**Tasks:**
- [ ] Create CriticalAlertsTab component
- [ ] Implement alert type rendering
- [ ] Add document side-by-side views
- [ ] Add action buttons per alert type
- [ ] Add priority sorting

### 2.7 Opportunities Tab

**File:** `src/pages/insights/OpportunitiesTab.tsx`

**Opportunity Types:**
- Renewal Discounts
- Family Bundles
- Document Benefits (TSA PreCheck, etc.)
- Digital Upgrades
- Proactive Actions

**Tasks:**
- [ ] Create OpportunitiesTab component
- [ ] Implement opportunity cards
- [ ] Add external link handling
- [ ] Add "Remind Me Later" functionality

### 2.8 Patterns & Trends Tab

**File:** `src/pages/insights/PatternsTab.tsx`

**Components:**
- Document Health Score (circular progress)
- Expiry Calendar (heatmap)
- Document Lifecycle chart
- Usage Patterns list
- Family Insights cards
- Cost Tracking cards
- Geographic Analysis map

**Tasks:**
- [ ] Create PatternsTab component
- [ ] Integrate chart library (recharts or similar)
- [ ] Create DocumentHealthScore component
- [ ] Create ExpiryCalendar heatmap
- [ ] Create LifecycleChart component
- [ ] Create UsagePatterns component
- [ ] Create CostTracking component
- [ ] Create GeographicAnalysis component (optional map integration)

### 2.9 Recommendations Tab

**File:** `src/pages/insights/RecommendationsTab.tsx`

**Recommendation Types:**
- Missing Document Types
- Security Improvements
- Organization (bundles)
- Backup
- Sharing
- Efficiency (templates)
- Proactive (calendar sync)
- Learning (guides)

**Tasks:**
- [ ] Create RecommendationsTab component
- [ ] Implement recommendation cards
- [ ] Add action buttons
- [ ] Link to relevant settings/features

### 2.10 Insights Widget (Dashboard)

**File:** `src/components/dashboard/InsightsWidget.tsx`

**Features:**
- Shows top 3 insights
- "View All Insights" link
- Click to expand

**Tasks:**
- [ ] Create InsightsWidget component
- [ ] Add to Dashboard page
- [ ] Implement expand/collapse
- [ ] Add loading state

### 2.11 Smart Notifications Enhancement

**File:** `src/services/smartNotifications.ts`

**Notification Types:**
- Predictive Reminders
- Anomaly Detection
- Opportunity Alerts
- Relationship Alerts
- Health Checks
- Milestone Alerts
- Learning Alerts

**Tasks:**
- [ ] Enhance existing notification service
- [ ] Add predictive reminder logic
- [ ] Add anomaly detection
- [ ] Add smart batching
- [ ] Add smart timing
- [ ] Add priority scoring
- [ ] Add user learning/preferences

### 2.12 Notification Settings Enhancement

**File:** `src/pages/settings/NotificationSettings.tsx` (enhance existing)

**New Settings:**
- Enable Smart Insights toggle
- Frequency selector
- Priority threshold slider
- Category checkboxes
- Quiet hours
- Learning toggle

**Tasks:**
- [ ] Enhance NotificationSettings component
- [ ] Add new preference fields
- [ ] Save preferences to database
- [ ] Add validation

### 2.13 Weekly Summary Email

**File:** `supabase/functions/weekly-insights-email/index.ts`

**Features:**
- Document Health Score
- Critical Alerts summary
- This Week's Tasks
- Upcoming Expirations
- New Insights
- Quick Stats

**Tasks:**
- [ ] Create Edge Function
- [ ] Set up email template
- [ ] Schedule cron job (Supabase cron)
- [ ] Test email delivery
- [ ] Add unsubscribe link

---

## Phase 3: Offline Access Enhancement

**Duration:** 2-3 weeks  
**Priority:** High  
**Dependencies:** Phase 1 complete

### 3.1 Offline Settings Page

**File:** `src/pages/settings/OfflineSettings.tsx`

**Sections:**
- Master toggle
- Download strategy (Smart/All/Manual)
- Storage management
- Auto-sync settings
- What to download checkboxes

**Tasks:**
- [ ] Create OfflineSettings page component
- [ ] Add route (`/settings/offline`)
- [ ] Implement master toggle
- [ ] Implement download strategy selection
- [ ] Add storage display
- [ ] Add auto-sync settings
- [ ] Add download checkboxes
- [ ] Save settings to database

### 3.2 Offline Service Enhancement

**File:** `src/services/offlineService.ts` (enhance existing)

**New Functions:**
- `enableOfflineMode(userId: string, strategy: string): Promise<void>`
- `downloadDocument(documentId: string, userId: string): Promise<void>`
- `downloadDocuments(documentIds: string[], userId: string): Promise<void>`
- `getOfflineDocuments(userId: string): Promise<Document[]>`
- `removeOfflineDocument(documentId: string, userId: string): Promise<void>`
- `clearOfflineCache(userId: string): Promise<void>`
- `getStorageUsage(userId: string): Promise<StorageUsage>`
- `syncOfflineData(userId: string): Promise<SyncResult>`

**Tasks:**
- [ ] Enhance offlineService
- [ ] Implement smart download strategy
- [ ] Implement bulk download
- [ ] Add storage management
- [ ] Add cache eviction logic
- [ ] Add sync logic

### 3.3 Service Worker Enhancement

**File:** `public/sw.js` (enhance existing)

**Cache Strategies:**
- Documents: Cache-first
- UI assets: Cache-first
- API calls: Network-first
- Images: Cache-first with size limits

**Tasks:**
- [ ] Enhance service worker
- [ ] Implement cache strategies
- [ ] Add cache size management
- [ ] Add LRU eviction
- [ ] Add background sync
- [ ] Add push notification queuing

### 3.4 Offline Indicator Component

**File:** `src/components/layout/OfflineIndicator.tsx`

**Features:**
- Shows online/offline status
- Banner when offline
- Toast notifications

**Tasks:**
- [ ] Create OfflineIndicator component
- [ ] Add to MainLayout
- [ ] Implement status detection
- [ ] Add banner styling
- [ ] Add toast notifications

### 3.5 Offline Document Badge

**File:** `src/components/documents/OfflineBadge.tsx`

**Features:**
- Shows download status on document cards
- Click to download
- Progress indicator

**Tasks:**
- [ ] Create OfflineBadge component
- [ ] Add to DocumentCard
- [ ] Implement download on click
- [ ] Add progress indicator
- [ ] Update badge state

### 3.6 Offline Document Detail Page

**File:** `src/pages/documents/OfflineDocumentDetail.tsx` (enhance existing)

**Features:**
- Show offline status
- Download button if not offline
- Disable edit/delete/share when offline
- Show cached data

**Tasks:**
- [ ] Enhance DocumentDetail page
- [ ] Add offline status check
- [ ] Disable actions when offline
- [ ] Show tooltips for disabled actions
- [ ] Handle encrypted fields

### 3.7 Offline Documents Page

**File:** `src/pages/documents/OfflineDocuments.tsx`

**Features:**
- Show only downloaded documents
- Banner showing count
- Filters work on cached data
- Search works on cached data

**Tasks:**
- [ ] Create OfflineDocuments page (or enhance Documents page)
- [ ] Filter to offline documents
- [ ] Add offline banner
- [ ] Ensure filters/search work offline

### 3.8 Offline Calendar

**File:** `src/pages/calendar/OfflineCalendar.tsx` (enhance existing)

**Features:**
- Show cached calendar data
- Mark online-only dates

**Tasks:**
- [ ] Enhance Calendar page
- [ ] Filter to offline documents
- [ ] Mark online-only dates
- [ ] Disable add/edit when offline

### 3.9 Offline First-Time Setup Wizard

**File:** `src/components/offline/OfflineSetupWizard.tsx`

**Steps:**
1. Welcome
2. Choose download strategy
3. Storage permission
4. Initial download
5. Complete

**Tasks:**
- [ ] Create OfflineSetupWizard component
- [ ] Implement step navigation
- [ ] Add storage permission request
- [ ] Add download progress
- [ ] Add completion screen

### 3.10 Sync Status Page

**File:** `src/pages/settings/SyncStatus.tsx`

**Features:**
- Last sync timestamp
- Next auto-sync time
- Sync now button
- Sync history log

**Tasks:**
- [ ] Create SyncStatus page
- [ ] Add route
- [ ] Display sync information
- [ ] Add manual sync button
- [ ] Show sync history

### 3.11 Offline Analytics

**File:** `src/pages/settings/OfflineAnalytics.tsx`

**Stats:**
- Documents accessed offline
- Time saved
- Data saved
- Storage breakdown
- Most accessed offline documents

**Tasks:**
- [ ] Create OfflineAnalytics component
- [ ] Track offline access
- [ ] Calculate statistics
- [ ] Display charts

---

## Phase 4: Secure Document Sharing

**Duration:** 2-3 weeks  
**Priority:** Medium  
**Dependencies:** Phase 1 complete

### 4.1 Share Modal Component

**File:** `src/components/sharing/ShareModal.tsx`

**Tabs:**
- Link
- Email
- SMS
- QR Code
- Nearby
- Download

**Tasks:**
- [ ] Create ShareModal component
- [ ] Implement tab navigation
- [ ] Add glass design styling
- [ ] Add close handler
- [ ] Add responsive design

### 4.2 Link Sharing Tab

**File:** `src/components/sharing/LinkSharingTab.tsx`

**Features:**
- Expiration settings
- Access control
- Password protection
- Watermark
- View limits
- Allowed IPs
- Generate link
- Copy link
- QR code generation
- Active shares table

**Tasks:**
- [ ] Create LinkSharingTab component
- [ ] Implement expiration radio buttons
- [ ] Implement access control
- [ ] Add password protection toggle
- [ ] Add watermark settings
- [ ] Add view limits
- [ ] Add IP restriction
- [ ] Implement link generation
- [ ] Add copy functionality
- [ ] Integrate QR code library
- [ ] Create active shares table
- [ ] Add revoke functionality

### 4.3 Email Sharing Tab

**File:** `src/components/sharing/EmailSharingTab.tsx`

**Features:**
- Multi-email input
- Subject field
- Message textarea
- Attachment method selection
- Email settings
- Send email
- Delivery status

**Tasks:**
- [ ] Create EmailSharingTab component
- [ ] Implement chip-style email input
- [ ] Add email validation
- [ ] Add autocomplete
- [ ] Implement email sending (Edge Function)
- [ ] Add delivery tracking
- [ ] Add resend functionality

### 4.4 SMS Sharing Tab

**File:** `src/components/sharing/SMSSharingTab.tsx`

**Features:**
- Phone number input with country code
- Message textarea
- Character counter
- Send SMS
- Credits display

**Tasks:**
- [ ] Create SMSSharingTab component
- [ ] Add phone number input with country selector
- [ ] Add character counter
- [ ] Implement SMS sending (Edge Function or third-party API)
- [ ] Add credits display

### 4.5 QR Code Tab

**File:** `src/components/sharing/QRCodeTab.tsx`

**Features:**
- QR code display
- Customization (color, logo, style)
- Download options (PNG, SVG)
- Print option

**Tasks:**
- [ ] Create QRCodeTab component
- [ ] Integrate QR code library (qrcode.js)
- [ ] Add customization options
- [ ] Implement download
- [ ] Add print functionality

### 4.6 Nearby Sharing Tab

**File:** `src/components/sharing/NearbySharingTab.tsx`

**Features:**
- Start broadcasting button
- Device discovery
- Device list
- Accept/decline flow
- Encrypted transfer

**Tasks:**
- [ ] Create NearbySharingTab component
- [ ] Implement WebRTC or Web Share API
- [ ] Add device discovery
- [ ] Add encryption
- [ ] Implement transfer

### 4.7 Download & Share Tab

**File:** `src/components/sharing/DownloadSharingTab.tsx`

**Features:**
- Format selection (Original, PDF, PDF with Details, Encrypted ZIP)
- Download buttons
- Native share sheet

**Tasks:**
- [ ] Create DownloadSharingTab component
- [ ] Implement PDF generation
- [ ] Implement ZIP creation
- [ ] Add watermark to downloads
- [ ] Integrate native share API

### 4.8 Share Service

**File:** `src/services/shareService.ts`

**Functions:**
- `createShare(documentId: string, userId: string, options: ShareOptions): Promise<Share>`
- `getShare(token: string): Promise<Share>`
- `getSharesForDocument(documentId: string, userId: string): Promise<Share[]>`
- `revokeShare(shareId: string, userId: string): Promise<void>`
- `revokeAllShares(documentId: string, userId: string): Promise<void>`
- `logAccess(shareId: string, action: string, metadata: AccessMetadata): Promise<void>`
- `getAccessLog(shareId: string, userId: string): Promise<AccessLogEntry[]>`
- `createShareTemplate(userId: string, name: string, settings: ShareSettings): Promise<ShareTemplate>`
- `getShareTemplates(userId: string): Promise<ShareTemplate[]>`

**Tasks:**
- [ ] Create shareService
- [ ] Implement share creation
- [ ] Implement token generation
- [ ] Implement access logging
- [ ] Implement revoke
- [ ] Add validation

### 4.9 Share Access Page (Public)

**File:** `src/pages/sharing/ShareAccess.tsx`

**Features:**
- Password entry if protected
- Document viewer
- Download button (if allowed)
- Print button (if allowed)
- Access tracking

**Tasks:**
- [ ] Create ShareAccess page
- [ ] Add route (`/s/:token`)
- [ ] Implement password check
- [ ] Implement IP check
- [ ] Implement view limit check
- [ ] Add document viewer
- [ ] Add download/print buttons
- [ ] Log access

### 4.10 Share Activity Component

**File:** `src/components/sharing/ShareActivity.tsx`

**Features:**
- Access log table
- Map view
- Timeline view
- Export CSV

**Tasks:**
- [ ] Create ShareActivity component
- [ ] Display access log
- [ ] Add map integration (optional)
- [ ] Add timeline view
- [ ] Add CSV export

### 4.11 Share Templates

**File:** `src/components/sharing/ShareTemplates.tsx`

**Features:**
- Save template button
- Template dropdown
- Use template

**Tasks:**
- [ ] Create ShareTemplates component
- [ ] Implement save template
- [ ] Implement load template
- [ ] Add template management

### 4.12 Share Button Integration

**File:** `src/pages/documents/DocumentDetail.tsx` (enhance existing)

**Tasks:**
- [ ] Add Share button to document detail page
- [ ] Open ShareModal on click
- [ ] Add share icon to document cards (optional)

### 4.13 Share Notifications

**File:** `src/services/shareNotifications.ts`

**Notification Types:**
- Document viewed
- Document downloaded
- Link expiring soon
- View limit reached
- Suspicious activity

**Tasks:**
- [ ] Create shareNotifications service
- [ ] Implement notification triggers
- [ ] Add notification preferences
- [ ] Send notifications

### 4.14 Edge Functions for Sharing

**Files:**
- `supabase/functions/create-share/index.ts`
- `supabase/functions/send-share-email/index.ts`
- `supabase/functions/send-share-sms/index.ts`

**Tasks:**
- [ ] Create create-share function
- [ ] Create send-share-email function
- [ ] Create send-share-sms function
- [ ] Add authentication
- [ ] Add error handling

---

## Phase 5: Integration & Testing

**Duration:** 1-2 weeks  
**Priority:** Critical

### 5.1 Integration Tasks

**Tasks:**
- [ ] Integrate Insights widget into Dashboard
- [ ] Add Insights link to navigation
- [ ] Integrate offline badge into document cards
- [ ] Integrate share button into document detail
- [ ] Add offline settings to Settings page
- [ ] Test all features together
- [ ] Fix integration issues

### 5.2 Unit Tests

**Files:**
- `src/services/__tests__/insightsEngine.test.ts`
- `src/services/__tests__/offlineService.test.ts`
- `src/services/__tests__/shareService.test.ts`

**Tasks:**
- [ ] Write unit tests for insights engine
- [ ] Write unit tests for offline service
- [ ] Write unit tests for share service
- [ ] Achieve >80% code coverage

### 5.3 Integration Tests

**Tasks:**
- [ ] Test insights generation flow
- [ ] Test offline download flow
- [ ] Test share creation and access flow
- [ ] Test sync flow
- [ ] Test error scenarios

### 5.4 E2E Tests (Optional)

**Tasks:**
- [ ] Set up Playwright/Cypress
- [ ] Write E2E tests for critical flows
- [ ] Run tests in CI/CD

### 5.5 Performance Testing

**Tasks:**
- [ ] Test insights generation performance
- [ ] Test offline download performance
- [ ] Test share access performance
- [ ] Optimize slow queries
- [ ] Add database indexes if needed

---

## Phase 6: Polish & Deployment

**Duration:** 1 week  
**Priority:** High

### 6.1 UI/UX Polish

**Tasks:**
- [ ] Review all components for consistency
- [ ] Add loading states everywhere
- [ ] Add error states everywhere
- [ ] Add empty states
- [ ] Improve animations
- [ ] Add haptic feedback (mobile)
- [ ] Test responsive design
- [ ] Test accessibility

### 6.2 Documentation

**Tasks:**
- [ ] Write user documentation
- [ ] Write developer documentation
- [ ] Add code comments
- [ ] Update README
- [ ] Create feature guides

### 6.3 Bug Fixes

**Tasks:**
- [ ] Fix all known bugs
- [ ] Test edge cases
- [ ] Fix performance issues
- [ ] Fix security issues

### 6.4 Deployment

**Tasks:**
- [ ] Run migrations on production
- [ ] Deploy Edge Functions
- [ ] Update environment variables
- [ ] Test production deployment
- [ ] Monitor for errors
- [ ] Rollback plan ready

### 6.5 Monitoring & Analytics

**Tasks:**
- [ ] Set up error tracking (Sentry)
- [ ] Set up analytics
- [ ] Monitor insights generation
- [ ] Monitor offline usage
- [ ] Monitor share usage
- [ ] Set up alerts

---

## Dependencies & Prerequisites

### External Dependencies

1. **QR Code Library**: `qrcode` or `qrcode.react`
2. **Chart Library**: `recharts` or `chart.js`
3. **PDF Generation**: `jspdf` or `pdfkit`
4. **ZIP Creation**: `jszip`
5. **Email Service**: Supabase Edge Functions + SMTP or SendGrid
6. **SMS Service**: Twilio or similar
7. **Maps (optional)**: Google Maps or Mapbox

### Internal Dependencies

- Existing notification system
- Existing offline DB (Dexie)
- Existing document service
- Existing authentication
- Existing Supabase setup

### Environment Variables

```env
# Email (for weekly summaries and share emails)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

# SMS (optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Maps (optional)
GOOGLE_MAPS_API_KEY=
```

---

## Risk Mitigation

### High Risk Areas

1. **Insights Generation Performance**
   - **Risk**: Slow generation for users with many documents
   - **Mitigation**: Batch processing, background jobs, caching

2. **Offline Storage Limits**
   - **Risk**: Users exceed storage quota
   - **Mitigation**: Clear cache warnings, LRU eviction, storage monitoring

3. **Share Security**
   - **Risk**: Unauthorized access to shared documents
   - **Mitigation**: Token validation, IP restrictions, password protection, expiration

4. **Service Worker Compatibility**
   - **Risk**: Not all browsers support service workers
   - **Mitigation**: Feature detection, fallback to basic offline

5. **Email/SMS Delivery**
   - **Risk**: Emails/SMS not delivered
   - **Mitigation**: Retry logic, delivery tracking, fallback to link sharing

### Contingency Plans

- If insights generation is too slow: Move to background job, show cached insights
- If offline storage fails: Fallback to online-only mode
- If sharing fails: Show error message, allow retry
- If Edge Functions fail: Fallback to client-side implementation where possible

---

## Success Metrics

### Insights System

- [ ] 80% of users receive at least 1 insight per week
- [ ] Average insight action rate >30%
- [ ] Document health score accuracy >90%
- [ ] Insights generation time <5 seconds per user

### Offline System

- [ ] 50% of users enable offline mode
- [ ] Average offline document count >20
- [ ] Offline access success rate >95%
- [ ] Sync success rate >98%

### Sharing System

- [ ] Average shares per user >5/month
- [ ] Share access success rate >95%
- [ ] Average share views >3 per share
- [ ] Revoke functionality used <10% of shares

---

## Timeline Summary

| Phase | Duration | Start Week | End Week |
|-------|----------|------------|----------|
| Phase 1: Database & Infrastructure | 1-2 weeks | Week 1 | Week 2 |
| Phase 2: Insights System | 3-4 weeks | Week 2 | Week 6 |
| Phase 3: Offline Access | 2-3 weeks | Week 3 | Week 6 |
| Phase 4: Secure Sharing | 2-3 weeks | Week 4 | Week 7 |
| Phase 5: Integration & Testing | 1-2 weeks | Week 7 | Week 9 |
| Phase 6: Polish & Deployment | 1 week | Week 9 | Week 10 |

**Total Estimated Duration:** 8-12 weeks

---

## Next Steps

1. **Review this plan** with the team
2. **Prioritize phases** based on business needs
3. **Assign developers** to phases
4. **Set up project tracking** (GitHub Projects, Jira, etc.)
5. **Create feature branches** for each phase
6. **Start Phase 1** immediately

---

## Notes

- This plan assumes 1-2 developers working full-time
- Adjust timeline based on team size and availability
- Some features can be developed in parallel (e.g., Insights and Offline)
- Consider MVP approach: implement core features first, enhance later
- Regular code reviews and testing are critical
- Keep users informed of progress through changelog

---

**Last Updated:** January 2025  
**Version:** 1.0


