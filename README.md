# DocuTrack - Smart Document Management System.

A modern, feature-rich document tracking and management application built with React 19, TypeScript, and Supabase.

## Features

### Document Management
- **Smart Organization**: Categorize documents (Passport, Driver's License, Insurance, etc.)
- **Expiry Tracking**: Never miss document renewals with intelligent urgency indicators
- **Password Protection**: Lock sensitive documents with encryption
- **Quick Notes**: Add notes to documents for better organization
- **Image Scanning**: Capture document images directly from your camera
- **Document Search**: Fast, full-text search across all your documents

### Dashboard & Analytics
- **Activity Charts**: Visualize your document activity over time
- **Urgency Summary**: See documents requiring immediate attention
- **Recent Documents**: Quick access to recently added or modified documents
- **Greeting Section**: Personalized welcome with time-based greetings

### Calendar & Dates
- **Important Dates**: Track document expiry dates, renewals, and reminders
- **Calendar View**: Visual calendar with document expiration highlights
- **Urgency Filtering**: Filter by urgent, soon, or upcoming dates

### Family Sharing
- **Secure Sharing**: Share documents with family members
- **Connection Requests**: Approve/deny sharing requests
- **Shared Document Management**: View and manage shared documents

### Multi-language Support
- English
- Spanish (Español)
- French (Français)
- Arabic (العربية)
- Urdu (اردو)

### Theme Support
- Light Mode
- Dark Mode
- Auto (follows system preference)

### Authentication
- Email/Password authentication.
- Google OAuth integration.
- Password reset functionality.
- Protected routes and secure session management.

## Tech Stack

### Frontend
- **React 19.2** - Latest React with improved performance.
- **TypeScript** - Type-safe development.
- **Vite 7.2** - Lightning-fast build tool.
- **Framer Motion** - Smooth animations and transitions.
- **React Router 7** - Client-side routing.
- **Lucide React** - Modern icon library.

### Backend & Database
- **Supabase** - Backend-as-a-Service.
  - PostgreSQL database.
  - Authentication.
  - Real-time subscriptions.
  - Storage for document images.
  - Row-level security.

### State Management & Storage
- **Zustand** - Lightweight state management
- **Dexie.js** - IndexedDB wrapper for offline storage
- **React Hook Form** - Form validation and management

### Internationalization
- **i18next** - Internationalization framework
- **react-i18next** - React bindings for i18next

### Utilities
- **date-fns** - Modern date utility library
- **clsx** - Conditional className utility

## Project Structure

```
DocuTrack-1/
├── document-tracker/          # Main application directory
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── dashboard/    # Dashboard widgets
│   │   │   ├── documents/    # Document management
│   │   │   ├── calendar/     # Calendar components
│   │   │   ├── family/       # Family sharing
│   │   │   ├── layout/       # Layout components
│   │   │   ├── settings/     # Settings components
│   │   │   ├── shared/       # Shared/common components
│   │   │   └── ui/           # UI primitives
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── hooks/            # Custom React hooks
│   │   ├── contexts/         # React contexts
│   │   ├── utils/            # Utility functions
│   │   ├── types/            # TypeScript types
│   │   ├── locales/          # Translation files
│   │   ├── config/           # Configuration files
│   │   └── styles/           # Global styles
│   ├── public/               # Static assets
│   ├── package.json
│   └── vite.config.ts
├── vercel.json               # Vercel deployment config
├── build.sh                  # Build script
└── README.md

```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jallowyusuf1/DocuTrack.git
   cd DocuTrack-1
   ```

2. **Install dependencies**
   ```bash
   cd document-tracker
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the `document-tracker` directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # OCR Services (Optional)
   # Google Cloud Vision API Key - Optional, Tesseract.js works offline as fallback
   VITE_GOOGLE_CLOUD_VISION_API_KEY=your_google_cloud_vision_api_key
   ```

   **Note:** OCR functionality works without Google Cloud Vision API key. The system will automatically use Tesseract.js (offline) as a fallback. Google Cloud Vision provides higher accuracy but requires an API key.

4. **Set up Supabase**

   Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor.

5. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Running Tests

```bash
npm run test
```

## Deployment

### Vercel Deployment

This project is configured for easy deployment on Vercel.

1. **Connect your GitHub repository** to Vercel

2. **Configure build settings:**
   - Framework Preset: `Other`
   - Build Command: `bash build.sh`
   - Output Directory: `document-tracker/dist`
   - Install Command: `npm ci`

3. **Add environment variables:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_CLOUD_VISION_API_KEY` (Optional - for enhanced OCR accuracy)

4. **Deploy!**

The `vercel.json` and `build.sh` files are already configured for monorepo structure.

### Manual Deployment

```bash
# From project root
bash build.sh

# Deploy the document-tracker/dist folder to your hosting provider
```

## Database Schema

### Tables

- **profiles** - User profile information
- **documents** - Document records
- **family_connections** - Family member connections
- **shared_documents** - Shared document permissions
- **important_dates** - Important date reminders

See `supabase/schema.sql` for complete schema.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `VITE_GOOGLE_CLOUD_VISION_API_KEY` | Google Cloud Vision API key for enhanced OCR | No |

## OCR Scanning

DocuTrack includes advanced OCR (Optical Character Recognition) functionality for automatically extracting information from document images.

### Features

- **Multi-Service OCR**: Uses Google Cloud Vision (primary) with Tesseract.js (offline fallback)
- **Automatic Field Extraction**: Extracts document numbers, dates, names, and other fields
- **Document Type Detection**: Automatically detects document type from OCR text
- **Multi-Language Support**: Supports 12+ languages including English, Spanish, French, German, Arabic, Chinese, Japanese, and more
- **Image Quality Assessment**: Checks image quality before processing
- **Smart Suggestions**: Shows OCR results as suggestions that you can accept or reject
- **Manual Re-scan**: Option to re-scan documents if results are unsatisfactory

### Setup

1. **Google Cloud Vision (Optional)**: 
   - Get an API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Cloud Vision API
   - Add the key to your `.env` file as `VITE_GOOGLE_CLOUD_VISION_API_KEY`
   - Provides higher accuracy but requires internet connection

2. **Tesseract.js (Default)**:
   - Works offline, no API key required
   - Automatically used as fallback if Google Cloud Vision is unavailable
   - Supports multiple languages

### Usage

1. Capture or upload a document image
2. OCR automatically scans the image when you reach the document details step
3. Review extracted fields in the OCR Results Panel
4. Accept or reject individual fields, or accept/reject all at once
5. Accepted fields are automatically populated in the form
6. You can manually edit any field or re-scan if needed

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Features in Development

- [x] Document OCR (text extraction from images) ✅
- [ ] Email notifications for expiring documents
- [ ] Document templates
- [ ] Bulk document operations
- [ ] Export documents (PDF, ZIP)
- [ ] Advanced search filters
- [ ] Document version history

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

## Support

For support, email support@docutrack.com or open an issue on GitHub.

## Authors

- Yusuf Diallo - [GitHub](https://github.com/jallowyusuf1)

---

**Latest Build Status:** ✅ Passing
**Build Time:** ~5.35s
**Latest Commit:** `b597682` - Enhance image handling and authentication flow
