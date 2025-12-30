# Technical Architecture
## AI-Powered Notifications, Offline Access & Secure Sharing

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Insights System Architecture](#insights-system-architecture)
3. [Offline System Architecture](#offline-system-architecture)
4. [Sharing System Architecture](#sharing-system-architecture)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [Security Considerations](#security-considerations)
7. [Performance Optimizations](#performance-optimizations)
8. [Scalability Considerations](#scalability-considerations)

---

## System Overview

### Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Offline Storage**: Dexie (IndexedDB wrapper)
- **Service Worker**: Custom implementation
- **State Management**: Zustand + React Context
- **Routing**: React Router v7
- **Styling**: Tailwind CSS + Glass Design System

### Architecture Principles

1. **Client-First**: Most logic runs client-side for responsiveness
2. **Progressive Enhancement**: Features degrade gracefully
3. **Offline-First**: Core functionality works offline
4. **Security-First**: All sharing requires explicit permissions
5. **Performance-First**: Lazy loading, code splitting, caching

---

## Insights System Architecture

### Overview

The Insights system analyzes user documents to generate actionable insights, alerts, opportunities, and recommendations.

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    Insights System                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │  Insights    │──────▶│  Insights    │                │
│  │   Engine     │      │   Service    │                │
│  │  (Analysis)  │      │   (CRUD)     │                │
│  └──────────────┘      └──────────────┘                │
│         │                      │                        │
│         │                      │                        │
│         ▼                      ▼                        │
│  ┌──────────────┐      ┌──────────────┐                │
│  │  Insights    │      │  Insights    │                │
│  │  Scheduler   │      │  Dashboard   │                │
│  │  (Cron)      │      │   (UI)       │                │
│  └──────────────┘      └──────────────┘                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Insights Engine (`insightsEngine.ts`)

**Purpose**: Analyzes documents and generates insights

**Key Functions**:

```typescript
// Main entry point
async function generateInsights(userId: string): Promise<Insight[]>

// Specific analyzers
async function checkExpiryConflicts(userId: string): Promise<Insight[]>
async function detectMissingDocuments(userId: string): Promise<Insight[]>
async function findInsuranceGaps(userId: string): Promise<Insight[]>
async function detectValidationErrors(userId: string): Promise<Insight[]>
async function analyzeDocumentHealth(userId: string): Promise<number>
```

**Analysis Flow**:

1. Fetch user documents from database
2. Fetch user's family documents (if applicable)
3. Run each analyzer function
4. Score insights by priority (0-100)
5. Filter insights based on user preferences
6. Return insights array

**Priority Scoring**:

- **90-100**: Critical (expiry conflicts, security alerts)
- **50-89**: Important (missing documents, opportunities)
- **0-49**: Informational (patterns, recommendations)

### Insights Service (`insightsService.ts`)

**Purpose**: CRUD operations for insights

**Key Functions**:

```typescript
async function getInsights(userId: string, filters?: InsightFilters): Promise<Insight[]>
async function dismissInsight(insightId: string, userId: string): Promise<void>
async function snoozeInsight(insightId: string, userId: string, until: Date): Promise<void>
async function actOnInsight(insightId: string, userId: string): Promise<void>
```

**Caching Strategy**:

- Cache insights for 1 hour
- Invalidate on document changes
- Use React Query or SWR for client-side caching

### Insights Scheduler (`insightsScheduler.ts`)

**Purpose**: Schedule insight generation

**Implementation Options**:

1. **Client-Side**: Generate on page load (simple, but slower)
2. **Edge Function Cron**: Daily job (recommended)
3. **Database Trigger**: Generate on document change (real-time)

**Recommended**: Edge Function Cron

```typescript
// supabase/functions/generate-insights/index.ts
// Runs daily at 2 AM UTC
```

### Database Schema

```sql
insights (
  insight_id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  type VARCHAR(20), -- 'alert', 'opportunity', 'pattern', 'recommendation'
  category VARCHAR(50), -- 'expiry_conflict', 'missing_document', etc.
  priority INTEGER, -- 0-100
  title TEXT,
  description TEXT,
  affected_documents JSONB, -- Array of document IDs
  action_url TEXT,
  action_label TEXT,
  metadata JSONB, -- Additional data
  generated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  dismissed BOOLEAN,
  acted_on BOOLEAN
)
```

### Frontend Components

**Component Hierarchy**:

```
InsightsDashboard
├── InsightsHeader (title, subtitle, date filter)
├── TabSwitcher
│   ├── CriticalAlertsTab
│   │   └── InsightCard[] (CriticalAlertCard)
│   ├── OpportunitiesTab
│   │   └── InsightCard[] (OpportunityCard)
│   ├── PatternsTab
│   │   ├── DocumentHealthScore
│   │   ├── ExpiryCalendar
│   │   ├── LifecycleChart
│   │   └── UsagePatterns
│   └── RecommendationsTab
│       └── InsightCard[] (RecommendationCard)
└── InsightsWidget (Dashboard)
```

---

## Offline System Architecture

### Overview

The Offline system enables read-only access to documents without internet connection using IndexedDB and Service Worker caching.

### Components

```
┌─────────────────────────────────────────────────────────┐
│                   Offline System                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │   Service    │      │    Dexie     │                │
│  │   Worker     │──────▶│  (IndexedDB)│                │
│  │  (Caching)   │      │              │                │
│  └──────────────┘      └──────────────┘                │
│         │                      │                        │
│         │                      │                        │
│         ▼                      ▼                        │
│  ┌──────────────┐      ┌──────────────┐                │
│  │   Offline    │      │   Offline    │                │
│  │   Service    │      │   Settings   │                │
│  │  (Download)  │      │     (UI)     │                │
│  └──────────────┘      └──────────────┘                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Service Worker (`public/sw.js`)

**Cache Strategies**:

1. **Documents**: Cache-first
   - Serve from cache if available
   - Fallback to network if not cached
   - Update cache in background

2. **UI Assets**: Cache-first
   - HTML, CSS, JS, icons
   - Never expire (versioned by build)

3. **API Calls**: Network-first
   - Try network first
   - Fallback to cache if offline
   - Queue failed requests for sync

4. **Images**: Cache-first with size limits
   - Cache images up to 500 MB
   - LRU eviction when limit reached

**Cache Management**:

```javascript
// Cache size limit
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500 MB

// LRU eviction
function evictOldCache() {
  // Remove least recently used documents
  // Preserve pinned documents
  // Preserve expiring soon documents
}
```

### Offline Service (`offlineService.ts`)

**Download Strategies**:

1. **Smart Download** (default):
   - Documents expiring within 90 days
   - Frequently accessed (3+ views)
   - Recently added (last 30 days)
   - All favorites/starred

2. **Download All**:
   - Entire document library
   - Warning for large libraries

3. **Manual Selection**:
   - User chooses specific documents

**Download Flow**:

```typescript
async function downloadDocument(documentId: string, userId: string) {
  // 1. Fetch document from API
  const document = await documentService.getDocument(documentId);
  
  // 2. Fetch document image
  const imageBlob = await fetch(document.image_url).then(r => r.blob());
  
  // 3. Store in IndexedDB
  await db.documents.put({
    ...document,
    cachedAt: Date.now(),
    imageBlob: imageBlob
  });
  
  // 4. Store in Service Worker cache
  await caches.open('documents').then(cache => {
    cache.put(document.image_url, new Response(imageBlob));
  });
  
  // 5. Update offline_documents table
  await supabase.from('offline_documents').insert({
    document_id: documentId,
    user_id: userId,
    downloaded_at: new Date().toISOString()
  });
}
```

### Dexie Schema (`src/db/offlineDB.ts`)

```typescript
class OfflineDatabase extends Dexie {
  documents!: Table<CachedDocument, string>;
  cachedImages!: Table<CachedImage, string>;
  syncMetadata!: Table<SyncMetadata, string>;
  
  constructor() {
    super('DocumentTrackerDB');
    
    this.version(2).stores({
      documents: 'id, user_id, expiration_date, cachedAt, pinned',
      cachedImages: 'id, documentId, timestamp',
      syncMetadata: 'key, lastSyncedAt'
    });
  }
}
```

### Sync Process

**When Coming Online**:

1. Detect online connection
2. Show sync banner
3. Upload queued changes (if any)
4. Download new documents (matching strategy)
5. Update modified documents
6. Sync reminders and calendar
7. Update family data
8. Clear expired cache

**Sync Status**:

```typescript
interface SyncStatus {
  syncing: boolean;
  lastSynced: Date | null;
  pendingCount: number;
  hasPendingChanges: boolean;
  error: string | null;
}
```

---

## Sharing System Architecture

### Overview

The Sharing system enables secure, temporary sharing of documents with multiple methods (link, email, SMS, QR code, nearby, download).

### Components

```
┌─────────────────────────────────────────────────────────┐
│                   Sharing System                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │   Share      │──────▶│   Share      │                │
│  │   Service    │      │   Access     │                │
│  │  (Create)    │      │   (Public)   │                │
│  └──────────────┘      └──────────────┘                │
│         │                      │                        │
│         │                      │                        │
│         ▼                      ▼                        │
│  ┌──────────────┐      ┌──────────────┐                │
│  │   Share      │      │   Access     │                │
│  │   Modal      │      │    Log       │                │
│  │    (UI)      │      │  (Tracking)  │                │
│  └──────────────┘      └──────────────┘                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Share Creation Flow

```typescript
async function createShare(
  documentId: string,
  userId: string,
  options: ShareOptions
): Promise<Share> {
  // 1. Generate unique token
  const token = generateSecureToken();
  
  // 2. Hash password if provided
  const passwordHash = options.password 
    ? await bcrypt.hash(options.password, 10)
    : null;
  
  // 3. Create share record
  const share = await supabase.from('document_shares').insert({
    document_id: documentId,
    user_id: userId,
    share_link_token: token,
    expires_at: options.expiresAt,
    max_views: options.maxViews,
    password_hash: passwordHash,
    watermark_config: options.watermark,
    access_control: options.accessControl,
    require_signin: options.requireSignin,
    allowed_ips: options.allowedIPs
  });
  
  // 4. Return share with public URL
  return {
    ...share,
    shareUrl: `https://docutrackr.com/s/${token}`
  };
}
```

### Token Generation

```typescript
function generateSecureToken(): string {
  // Use crypto.randomUUID() or similar
  // Format: 32 character alphanumeric
  // Example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
  
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
```

### Share Access Flow

```typescript
async function accessShare(token: string, password?: string): Promise<Document> {
  // 1. Fetch share record
  const share = await supabase
    .from('document_shares')
    .select('*')
    .eq('share_link_token', token)
    .single();
  
  // 2. Check if revoked
  if (share.revoked) {
    throw new Error('Share has been revoked');
  }
  
  // 3. Check expiration
  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    throw new Error('Share has expired');
  }
  
  // 4. Check view limit
  if (share.max_views && share.view_count >= share.max_views) {
    throw new Error('Share view limit reached');
  }
  
  // 5. Check password
  if (share.password_hash) {
    if (!password) {
      throw new Error('Password required');
    }
    const valid = await bcrypt.compare(password, share.password_hash);
    if (!valid) {
      throw new Error('Invalid password');
    }
  }
  
  // 6. Check IP restriction
  if (share.allowed_ips && share.allowed_ips.length > 0) {
    const clientIP = getClientIP();
    if (!share.allowed_ips.includes(clientIP)) {
      throw new Error('IP address not allowed');
    }
  }
  
  // 7. Log access
  await logAccess(share.share_id, 'viewed');
  
  // 8. Increment view count
  await supabase
    .from('document_shares')
    .update({ view_count: share.view_count + 1 })
    .eq('share_id', share.share_id);
  
  // 9. Fetch document
  const document = await documentService.getDocument(share.document_id);
  
  // 10. Apply watermark if configured
  if (share.watermark_config.enabled) {
    document.image_url = applyWatermark(document.image_url, share.watermark_config);
  }
  
  return document;
}
```

### Access Logging

```typescript
async function logAccess(
  shareId: string,
  action: 'viewed' | 'downloaded' | 'printed',
  metadata?: AccessMetadata
): Promise<void> {
  await supabase.from('share_access_log').insert({
    share_id: shareId,
    viewer_ip: metadata?.ip,
    viewer_device: metadata?.device,
    viewer_location: metadata?.location,
    action: action,
    user_agent: navigator.userAgent
  });
  
  // Send notification to sharer if enabled
  await shareNotifications.notifyShareAccess(shareId, action);
}
```

### Watermarking

```typescript
function applyWatermark(
  imageUrl: string,
  config: WatermarkConfig
): string {
  // Use Canvas API to add watermark
  // Return new image URL (or data URL)
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    // Add watermark text
    ctx.fillStyle = `rgba(0, 0, 0, ${config.opacity})`;
    ctx.font = '24px Arial';
    ctx.fillText(config.text, config.x, config.y);
  };
  
  return canvas.toDataURL();
}
```

---

## Data Flow Diagrams

### Insights Generation Flow

```
User Action/Time Trigger
    │
    ▼
Insights Scheduler
    │
    ▼
Insights Engine
    │
    ├──► Fetch Documents
    ├──► Analyze Expiry Conflicts
    ├──► Detect Missing Documents
    ├──► Find Insurance Gaps
    ├──► Detect Validation Errors
    └──► Calculate Health Score
    │
    ▼
Score & Filter Insights
    │
    ▼
Save to Database
    │
    ▼
Notify User (if enabled)
```

### Offline Download Flow

```
User Enables Offline Mode
    │
    ▼
Choose Download Strategy
    │
    ├──► Smart Download
    ├──► Download All
    └──► Manual Selection
    │
    ▼
For Each Document:
    ├──► Fetch Document Data
    ├──► Fetch Document Image
    ├──► Store in IndexedDB
    ├──► Cache in Service Worker
    └──► Update Database Record
    │
    ▼
Show Completion
```

### Share Creation Flow

```
User Clicks Share Button
    │
    ▼
Open Share Modal
    │
    ▼
Select Sharing Method
    │
    ├──► Link
    ├──► Email
    ├──► SMS
    ├──► QR Code
    ├──► Nearby
    └──► Download
    │
    ▼
Configure Share Settings
    │
    ├──► Expiration
    ├──► Access Control
    ├──► Password
    ├──► Watermark
    └──► View Limits
    │
    ▼
Generate Share
    │
    ├──► Create Token
    ├──► Hash Password
    ├──► Save to Database
    └──► Return Share URL
    │
    ▼
Display Share URL/QR Code
```

### Share Access Flow

```
User Accesses Share URL
    │
    ▼
Fetch Share Record
    │
    ├──► Check Revoked
    ├──► Check Expiration
    ├──► Check View Limit
    ├──► Check Password
    └──► Check IP Restriction
    │
    ▼
If Valid:
    ├──► Log Access
    ├──► Increment View Count
    ├──► Fetch Document
    └──► Apply Watermark
    │
    ▼
Display Document
```

---

## Security Considerations

### Insights System

1. **Data Privacy**: Insights only visible to document owner
2. **RLS Policies**: Enforce at database level
3. **No External Data**: All analysis uses user's own data

### Offline System

1. **Encryption**: Encrypted fields require online connection to decrypt
2. **Storage Limits**: Prevent excessive storage usage
3. **Cache Eviction**: Remove sensitive data when offline disabled

### Sharing System

1. **Token Security**: Cryptographically secure random tokens
2. **Password Hashing**: Use bcrypt with salt
3. **Expiration**: Enforce expiration dates
4. **View Limits**: Enforce maximum views
5. **IP Restrictions**: Validate IP addresses
6. **Revocation**: Immediate revocation capability
7. **Access Logging**: Track all access for security audit
8. **Watermarking**: Prevent unauthorized copying
9. **RLS Policies**: Enforce sharing permissions

### Best Practices

1. **Never store passwords in plain text**
2. **Use HTTPS for all API calls**
3. **Validate all user inputs**
4. **Rate limit share access**
5. **Monitor for suspicious activity**
6. **Regular security audits**

---

## Performance Optimizations

### Insights System

1. **Caching**: Cache insights for 1 hour
2. **Background Generation**: Generate insights in background
3. **Pagination**: Load insights in pages
4. **Lazy Loading**: Load insights on demand
5. **Debouncing**: Debounce insight generation triggers

### Offline System

1. **Lazy Loading**: Load documents on demand
2. **Compression**: Compress images before caching
3. **LRU Eviction**: Remove unused documents
4. **Batch Operations**: Batch database operations
5. **IndexedDB Indexes**: Optimize queries with indexes

### Sharing System

1. **Token Caching**: Cache share records
2. **CDN**: Use CDN for shared document images
3. **Image Optimization**: Optimize images before sharing
4. **Rate Limiting**: Limit share creation rate

---

## Scalability Considerations

### Database

1. **Indexes**: Add indexes on frequently queried columns
2. **Partitioning**: Partition large tables by date
3. **Archiving**: Archive old insights and access logs

### Caching

1. **Redis**: Use Redis for share token caching
2. **CDN**: Use CDN for static assets
3. **Edge Caching**: Cache at edge locations

### Background Jobs

1. **Queue System**: Use queue for insight generation
2. **Batch Processing**: Process insights in batches
3. **Rate Limiting**: Limit API calls

### Monitoring

1. **Performance Metrics**: Track response times
2. **Error Tracking**: Track errors with Sentry
3. **Usage Analytics**: Track feature usage
4. **Database Monitoring**: Monitor query performance

---

## Conclusion

This architecture provides a solid foundation for implementing the three major features while maintaining security, performance, and scalability. The modular design allows for independent development and testing of each system.

---

**Last Updated:** January 2025


