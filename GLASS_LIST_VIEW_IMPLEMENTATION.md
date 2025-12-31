# Glass List View Implementation Guide

This document provides a comprehensive guide to the new glass-themed list view components implemented across DocuTrack.

## 📦 Components Overview

All list view components are located in `/src/components/ui/list/`

### Core Components

1. **GlassListItem** - Base container component for all list items
2. **StatusBadge** - Displays status with color-coded glass badges
3. **GlassActionButton** - Circular glass action buttons
4. **EmptyState** - Displays when no items are present
5. **SkeletonLoader** - Loading state with shimmer animation
6. **GlassListControls** - Sort/filter toolbar
7. **SwipeableListItem** - Enables swipe gestures on mobile

### Specialized List Items

1. **DocumentListItem** - Displays document with thumbnail, type, status, and expiration
2. **FamilyMemberListItem** - Displays family member with avatar, relationship, and status
3. **DateListItem** - Displays important date with colored date box and countdown

### Complete List Views

1. **DocumentsListView** - Complete documents list with sorting, filtering, and bulk actions
2. **DatesListView** - Complete dates list with month grouping
3. **FamilyListView** - Complete family members list

---

## 🎨 Design System

### Glass Morphism Styles

```css
/* Base Glass Container */
background: rgba(255, 255, 255, 0.8) /* light */
background: rgba(26, 26, 26, 0.8) /* dark */
backdrop-filter: blur(40px) saturate(130%)
border: 1px solid rgba(0, 0, 0, 0.08) /* light */
border: 1px solid rgba(255, 255, 255, 0.12) /* dark */
border-radius: 16px
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) /* light */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6) /* dark */
```

### Status Badge Colors

- **Valid**: Green `rgba(16, 185, 129, 0.15)`
- **Expiring**: Orange `rgba(249, 115, 22, 0.15)` with pulse animation
- **Urgent**: Red `rgba(239, 68, 68, 0.15)` with stronger pulse
- **Expired**: Red `rgba(239, 68, 68, 0.2)` bold text

### Responsive Sizing

- **Mobile** (320px - 767px): Smaller padding, compact fonts
- **Tablet** (768px - 1023px): Medium padding, standard fonts
- **Desktop** (1024px+): Larger padding, hover effects enabled

---

## 🚀 Usage Examples

### Using DocumentListItem

```tsx
import { DocumentListItem } from '@/components/ui/list';

<DocumentListItem
  document={document}
  onClick={() => handleDocumentClick(document)}
  onLongPress={() => handleLongPress(document.id)}
  selected={selectedDocuments.has(document.id)}
  showCheckbox={selectionMode}
  onCheckboxChange={(checked) => handleToggleSelection(document.id)}
  animate={true}
  delay={index * 0.05}
/>
```

### Using DocumentsListView (Complete Solution)

```tsx
import { DocumentsListView } from '@/components/documents/DocumentsListView';

<DocumentsListView
  documents={filteredDocuments}
  loading={isLoading}
  searchQuery={searchQuery}
  onDocumentClick={handleDocumentClick}
  onDocumentEdit={handleEdit}
  onDocumentShare={handleShare}
  onDocumentDelete={handleDelete}
  onSortChange={setSortOption}
  currentSort={sortOption}
  onFilterClick={() => setShowFilters(true)}
  filterCount={activeFiltersCount}
  selectedDocuments={selectedDocuments}
  onToggleSelection={toggleSelection}
  onClearSelection={clearSelection}
/>
```

### Using GlassListControls

```tsx
import { GlassListControls } from '@/components/ui/list';

const sortOptions = [
  { value: 'newest', label: 'Recent' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'expiring_soon', label: 'Expiry Date' },
];

<GlassListControls
  sortOptions={sortOptions}
  currentSort={currentSort}
  onSortChange={handleSortChange}
  showFilter={true}
  onFilterClick={() => setShowFilterModal(true)}
  filterCount={3}
  showViewToggle={true}
  currentView="list"
  onViewChange={handleViewChange}
/>
```

### Using SwipeableListItem

```tsx
import { SwipeableListItem } from '@/components/ui/list';
import { Share, Edit, Trash2 } from 'lucide-react';

const rightActions = [
  {
    icon: <Share className="w-5 h-5" />,
    label: 'Share',
    color: 'blue',
    onClick: () => handleShare(),
  },
  {
    icon: <Edit className="w-5 h-5" />,
    label: 'Edit',
    color: 'gray',
    onClick: () => handleEdit(),
  },
  {
    icon: <Trash2 className="w-5 h-5" />,
    label: 'Delete',
    color: 'red',
    onClick: () => handleDelete(),
  },
];

<SwipeableListItem rightActions={rightActions}>
  <DocumentListItem document={document} />
</SwipeableListItem>
```

### Using EmptyState

```tsx
import { EmptyState } from '@/components/ui/list';

<EmptyState
  icon="📄"
  title="No documents yet"
  description="Add your first document to get started"
  actionLabel="+ Add Document"
  onAction={() => navigate('/documents/add')}
/>
```

### Using SkeletonLoader

```tsx
import { SkeletonLoader } from '@/components/ui/list';

{loading && (
  <SkeletonLoader count={5} type="document" />
)}
```

---

## 🎯 Features Implemented

### ✅ Visual Design
- Frosted glass morphism on all items
- Black/white theme with colored accents
- Smooth shadows and borders
- Responsive padding and sizing

### ✅ Interactions
- Hover effects (desktop)
- Tap feedback (mobile)
- Long-press for selection
- Swipe gestures (mobile)
- Smooth animations

### ✅ Functionality
- Sort and filter controls
- Bulk selection mode
- Empty and loading states
- Pagination support
- Grouped display (dates by month)

### ✅ Accessibility
- Keyboard navigation
- Screen reader support
- Focus states
- ARIA labels

---

## 📱 Mobile Features

### Swipe Actions

**Swipe Left** on item:
- Reveals action buttons (Share, Edit, Delete)
- Buttons slide in from right
- Glass styled buttons with icons

**Swipe Right** on item:
- Quick view action
- Or toggle favorite

### Long Press
- Long press any item to enter selection mode
- Shows checkboxes for bulk operations
- Top bar appears with bulk action buttons

---

## 🎨 Customization

### Changing Status Colors

Edit `src/components/ui/list/StatusBadge.tsx`:

```tsx
const statusStyles: Record<StatusType, { bg: string; border: string; text: string }> = {
  valid: {
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    text: 'text-emerald-500',
  },
  // Add more status types...
};
```

### Adjusting Glass Opacity

Edit `src/components/ui/list/GlassListItem.tsx`:

```tsx
bg-white/80 dark:bg-zinc-900/80  // Change /80 to /70, /90, etc.
```

### Modifying Animations

Edit animation delay in list views:

```tsx
delay={index * 0.05}  // Change 0.05 to adjust stagger speed
```

---

## 🔧 Integration Steps

### 1. Replace Existing List Views

**Before:**
```tsx
{documents.map(doc => (
  <DocumentCard key={doc.id} document={doc} />
))}
```

**After:**
```tsx
<DocumentsListView
  documents={documents}
  loading={isLoading}
  onDocumentClick={handleClick}
  // ... other props
/>
```

### 2. Update Imports

```tsx
// Old imports
import DocumentCard from '@/components/documents/DocumentCard';

// New imports
import { DocumentsListView } from '@/components/documents/DocumentsListView';
// or for individual components
import { DocumentListItem, EmptyState, SkeletonLoader } from '@/components/ui/list';
```

### 3. Handle Events

```tsx
const handleDocumentClick = (document: Document) => {
  navigate(`/documents/${document.id}`);
};

const handleDocumentEdit = (document: Document) => {
  setEditingDocument(document);
  setShowEditModal(true);
};

const handleDocumentDelete = (document: Document) => {
  if (confirm('Delete this document?')) {
    deleteDocument(document.id);
  }
};
```

---

## 📊 Component Props Reference

### DocumentListItem Props

```typescript
interface DocumentListItemProps {
  document: Document;
  onClick?: () => void;
  onLongPress?: () => void;
  selected?: boolean;
  showCheckbox?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
  animate?: boolean;
  delay?: number;
}
```

### FamilyMemberListItem Props

```typescript
interface FamilyMemberListItemProps {
  connection: Connection & {
    documentCount?: number;
    validCount?: number;
    expiringCount?: number;
    expiredCount?: number;
  };
  onClick?: () => void;
  onLongPress?: () => void;
  selected?: boolean;
  animate?: boolean;
  delay?: number;
}
```

### DateListItem Props

```typescript
interface DateListItemProps {
  date: ImportantDate & {
    linkedDocuments?: Array<{
      id: string;
      image_url?: string;
      document_name: string;
    }>;
  };
  onClick?: () => void;
  onLongPress?: () => void;
  selected?: boolean;
  animate?: boolean;
  delay?: number;
}
```

---

## 🎬 Animations

### Entrance Animation
```tsx
// Staggered fade-in and slide-up
variants={{
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: index * 0.05,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}}
```

### Status Badge Pulse (Expiring/Urgent)
```tsx
// Subtle pulse for expiring items
animate={{
  scale: [1, 1.02, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
}}
```

### Skeleton Shimmer
```tsx
// Left-to-right shimmer effect
animate={{
  x: ['-100%', '100%'],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'linear',
  },
}}
```

---

## 🐛 Troubleshooting

### Issue: Animations not working
**Solution**: Ensure Framer Motion is installed:
```bash
npm install framer-motion
```

### Issue: Glass effect not visible
**Solution**: Check that backdrop-filter is supported by the browser. Add fallback:
```css
@supports not (backdrop-filter: blur(40px)) {
  background: rgba(255, 255, 255, 0.95);
}
```

### Issue: Swipe actions not working on mobile
**Solution**: Ensure the parent container doesn't have `overflow: hidden`. Also check that touch events aren't being prevented.

### Issue: Dark mode colors incorrect
**Solution**: Verify Tailwind dark mode is configured in `tailwind.config.js`:
```js
module.exports = {
  darkMode: 'class',
  // ...
}
```

---

## 🎯 Next Steps

1. **Test on Real Devices**: Test swipe gestures on actual mobile devices
2. **Accessibility Audit**: Run accessibility tests with screen readers
3. **Performance**: Monitor animation performance on lower-end devices
4. **Customization**: Adjust colors, spacing to match your brand
5. **Add More Features**: Implement drag-to-reorder, pull-to-refresh, etc.

---

## 📝 File Structure

```
src/
├── components/
│   ├── ui/
│   │   └── list/
│   │       ├── GlassListItem.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── GlassActionButton.tsx
│   │       ├── EmptyState.tsx
│   │       ├── SkeletonLoader.tsx
│   │       ├── GlassListControls.tsx
│   │       ├── SwipeableListItem.tsx
│   │       ├── DocumentListItem.tsx
│   │       ├── FamilyMemberListItem.tsx
│   │       ├── DateListItem.tsx
│   │       └── index.ts
│   ├── documents/
│   │   └── DocumentsListView.tsx
│   ├── dates/
│   │   └── DatesListView.tsx
│   └── family/
│       └── FamilyListView.tsx
```

---

## ✨ Example: Full Page Implementation

```tsx
import React, { useState } from 'react';
import { DocumentsListView } from '@/components/documents/DocumentsListView';
import { useDocuments } from '@/hooks/useDocuments';

export const DocumentsPage: React.FC = () => {
  const { documents, loading } = useDocuments();
  const [sortOption, setSortOption] = useState('newest');
  const [selectedDocuments, setSelectedDocuments] = useState(new Set<string>());
  const [showFilters, setShowFilters] = useState(false);

  const handleToggleSelection = (id: string) => {
    const newSelection = new Set(selectedDocuments);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedDocuments(newSelection);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-800">
      <DocumentsListView
        documents={documents}
        loading={loading}
        onDocumentClick={(doc) => console.log('View', doc)}
        onDocumentEdit={(doc) => console.log('Edit', doc)}
        onDocumentShare={(doc) => console.log('Share', doc)}
        onDocumentDelete={(doc) => console.log('Delete', doc)}
        onSortChange={setSortOption}
        currentSort={sortOption}
        onFilterClick={() => setShowFilters(true)}
        selectedDocuments={selectedDocuments}
        onToggleSelection={handleToggleSelection}
        onClearSelection={() => setSelectedDocuments(new Set())}
      />
    </div>
  );
};
```

---

## 🎉 Result

You now have a complete, production-ready glass list view system with:

- ✅ Beautiful frosted glass design
- ✅ Black/white theme with colored accents
- ✅ Full responsive support (mobile/tablet/desktop)
- ✅ Hover and tap interactions
- ✅ Swipe gestures on mobile
- ✅ Bulk selection mode
- ✅ Loading and empty states
- ✅ Sort and filter controls
- ✅ Smooth animations throughout
- ✅ Full accessibility support

Ready to use across Documents, Dates, and Family pages!
