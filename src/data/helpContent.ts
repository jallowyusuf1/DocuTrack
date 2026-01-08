export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  popular?: boolean;
}

export interface VideoTutorial {
  id: string;
  title: string;
  duration: string;
  youtubeId?: string;
  description: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface HelpSection {
  title: string;
  articles: HelpArticle[];
}

// Popular Articles
export const popularArticles: HelpArticle[] = [
  {
    id: 'add-document',
    title: 'How do I add a document?',
    category: 'Getting Started',
    popular: true,
    content: `To add a new document to DocuTrackr:

1. Click the "Add Document" button (or press Cmd/Ctrl + N)
2. Fill in the document details:
   - Document name
   - Document type (passport, license, insurance, etc.)
   - Expiry date
   - Upload a photo or scan
3. Add optional tags for better organization
4. Click "Save" to add the document

You can also use OCR (Optical Character Recognition) to automatically extract information from a document photo. Just tap the camera icon when adding a document.`,
    tags: ['documents', 'adding', 'basics', 'tutorial'],
  },
  {
    id: 'expiry-reminders',
    title: 'Setting up expiry reminders',
    category: 'Reminders',
    popular: true,
    content: `Configure expiry reminders to never miss an important deadline:

1. Go to Settings > Notifications
2. Enable "Expiry Reminders"
3. Choose your reminder preferences:
   - How many days before expiry (e.g., 90, 60, 30, 7 days)
   - Notification frequency
   - Email notifications
   - Push notifications
4. Set reminder times (when you want to be notified)
5. Save your preferences

You'll receive notifications for all documents that are expiring soon. You can also set custom reminders for individual documents.`,
    tags: ['reminders', 'notifications', 'expiry', 'settings'],
  },
  {
    id: 'family-sharing',
    title: 'Sharing documents with family',
    category: 'Sharing',
    popular: true,
    content: `Share documents with family members securely:

1. Go to Family > Connections
2. Send a connection request to a family member
3. Once accepted, go to the document you want to share
4. Click the "Share" button
5. Select the family member(s) you want to share with
6. Choose permission level:
   - View Only: They can see but not edit
   - Edit: They can view and edit the document
7. Add an optional message
8. Click "Share"

Shared documents will appear in their dashboard. You can manage sharing permissions anytime from the document details page.`,
    tags: ['sharing', 'family', 'connections', 'permissions'],
  },
  {
    id: 'export-data',
    title: 'Exporting my data',
    category: 'Data Management',
    popular: true,
    content: `Export your data for backup or to use elsewhere:

1. Go to Settings > Privacy & Data
2. Click "Export Data"
3. Choose export format:
   - JSON (machine-readable)
   - CSV (spreadsheet)
   - PDF (readable format)
4. Select what to export:
   - Documents
   - Document metadata
   - Important dates
   - Settings
5. Click "Generate Export"
6. Download will start automatically

Your data will be exported in the selected format. Large exports may take a few minutes to process. You'll receive an email when your export is ready.`,
    tags: ['export', 'backup', 'data', 'privacy'],
  },
  {
    id: 'enable-2fa',
    title: 'Enabling two-factor authentication',
    category: 'Security',
    popular: true,
    content: `Enable two-factor authentication (2FA) for extra security:

1. Go to Settings > Security
2. Find "Two-Factor Authentication"
3. Click "Enable 2FA"
4. Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.)
5. Enter the 6-digit code from the app to verify
6. Save backup codes in a safe place
7. Click "Confirm" to enable 2FA

From now on, you'll need both your password and the code from your authenticator app to sign in. This adds an extra layer of security to your account.`,
    tags: ['security', '2fa', 'authentication', 'safety'],
  },
];

// Video Tutorials
// Note: Replace 'placeholder' with actual YouTube video IDs when videos are created
export const videoTutorials: VideoTutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with DocuTrackr',
    duration: '2 min',
    youtubeId: 'placeholder', // Replace with actual YouTube ID (e.g., 'dQw4w9WgXcQ')
    description: 'Learn the basics of DocuTrackr in just 2 minutes. Perfect for new users.',
  },
  {
    id: 'ocr-scanning',
    title: 'Scanning Documents with OCR',
    duration: '3 min',
    youtubeId: 'placeholder', // Replace with actual YouTube ID
    description: 'Discover how to use OCR to automatically extract information from your documents.',
  },
  {
    id: 'family-sharing-tutorial',
    title: 'Setting Up Family Sharing',
    duration: '4 min',
    youtubeId: 'placeholder', // Replace with actual YouTube ID
    description: 'Learn how to securely share documents with family members and manage permissions.',
  },
  {
    id: 'reminders-tutorial',
    title: 'Managing Reminders',
    duration: '2 min',
    youtubeId: 'placeholder', // Replace with actual YouTube ID
    description: 'Set up and customize expiry reminders so you never miss an important deadline.',
  },
];

// FAQs
export const faqs: FAQ[] = [
  {
    id: 'faq-1',
    question: 'Is my data secure?',
    answer: 'Yes! DocuTrackr uses industry-standard encryption to protect your data. All documents are encrypted at rest and in transit. We never share your data with third parties.',
    category: 'Security',
  },
  {
    id: 'faq-2',
    question: 'Can I use DocuTrackr offline?',
    answer: 'Yes, DocuTrackr works offline! Your documents are cached locally, so you can view them even without an internet connection. Changes will sync automatically when you\'re back online.',
    category: 'Usage',
  },
  {
    id: 'faq-3',
    question: 'What document types are supported?',
    answer: 'DocuTrackr supports passports, driver\'s licenses, insurance cards, visas, permits, ID cards, certificates, and custom document types. You can create custom document types for any documents you need to track.',
    category: 'Features',
  },
  {
    id: 'faq-4',
    question: 'How many documents can I store?',
    answer: 'There\'s no limit on the number of documents you can store. However, individual files are limited to 10MB. For best performance, we recommend keeping document files under 5MB.',
    category: 'Limits',
  },
  {
    id: 'faq-5',
    question: 'Can I recover deleted documents?',
    answer: 'Documents are moved to a trash folder when deleted and can be recovered within 30 days. After 30 days, documents are permanently deleted and cannot be recovered.',
    category: 'Data Management',
  },
  {
    id: 'faq-6',
    question: 'Does DocuTrackr work on mobile?',
    answer: 'Yes! DocuTrackr is fully responsive and works on all devices including smartphones and tablets. You can also install it as a PWA (Progressive Web App) on your mobile device.',
    category: 'Usage',
  },
  {
    id: 'faq-7',
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel your subscription anytime from Settings > Billing. Your subscription will remain active until the end of the current billing period, and you\'ll continue to have access to all features.',
    category: 'Billing',
  },
  {
    id: 'faq-8',
    question: 'What payment methods are accepted?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. All payments are processed securely through our payment provider.',
    category: 'Billing',
  },
];

// Help Categories
export const helpCategories = [
  'Getting Started',
  'Documents',
  'Reminders',
  'Sharing',
  'Security',
  'Settings',
  'Billing',
  'Troubleshooting',
];

// Support Categories for Contact Form
export const supportCategories = [
  'Technical Issue',
  'Billing',
  'Feature Request',
  'Bug Report',
  'Account Issue',
  'Other',
];

