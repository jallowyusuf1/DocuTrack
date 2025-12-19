# DocuTrack - Smart Document Management System

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
- Email/Password authentication
- Google OAuth integration
- Password reset functionality
- Protected routes and secure session management

## Tech Stack

### Frontend
- **React 19.2** - Latest React with improved performance
- **TypeScript** - Type-safe development
- **Vite 7.2** - Lightning-fast build tool
- **Framer Motion** - Smooth animations and transitions
- **React Router 7** - Client-side routing
- **Lucide React** - Modern icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Storage for document images
  - Row-level security

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
   ```

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
   - Install Command: `cd document-tracker && npm ci`

3. **Add environment variables:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

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

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Features in Development

- [ ] Document OCR (text extraction from images)
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
