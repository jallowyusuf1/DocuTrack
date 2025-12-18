# DocuTrack - Document Expiry Tracking System

A modern, full-stack document management application that helps users track important documents and their expiry dates. Built with React, TypeScript, and Supabase.

![DocuTrack](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/react-19.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.6.2-3178c6.svg)
![Supabase](https://img.shields.io/badge/supabase-latest-3fcf8e.svg)

## 🌟 Features

### Core Features
- **Document Management**: Upload, organize, and track documents with expiry dates
- **Smart Notifications**: Customizable reminders for expiring documents (30/14/7/1 days before expiry)
- **Multi-Language Support**: English, French, Spanish, Arabic, and Urdu
- **Secure Authentication**: Email/password and Google OAuth sign-in
- **Family Sharing**: Share documents with family members securely
- **Document Categories**: Passport, ID, Visa, License, Insurance, Medical, Legal, Financial, Education, and Custom
- **Document Locking**: Password-protect sensitive documents
- **Quick Notes**: Add private notes to documents
- **Image Compression**: Automatic image optimization for storage efficiency
- **Offline Support**: Progressive Web App (PWA) with offline capabilities

### Desktop Features
- **Advanced Document Grid**: Multi-column responsive layout with filters and sorting
- **Desktop Calendar**: Full calendar view for tracking document expiry dates
- **Desktop Settings**: Comprehensive settings panel with sidebar navigation
- **Desktop Document Detail**: Full-screen document viewer with enhanced UI
- **Bulk Actions**: Select and manage multiple documents at once

### Mobile Features
- **Bottom Navigation**: iOS-style navigation for easy access
- **Swipe Gestures**: Intuitive swipe actions for document management
- **Touch Optimized**: Haptic feedback and touch-friendly interfaces
- **Mobile Document Cards**: Optimized card layout for small screens
- **Quick Add Modal**: Fast document addition with camera integration

### UI/UX Features
- **Glass Morphism Design**: Modern frosted glass effects throughout
- **Dark Theme**: Beautiful gradient dark theme with purple accents
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Design**: Fully responsive from mobile to desktop
- **Accessibility**: WCAG compliant with keyboard navigation
- **Loading States**: Skeleton screens and smooth loading transitions

### Security Features
- **Row Level Security (RLS)**: Supabase RLS policies for data protection
- **Password Protected Documents**: Additional layer of security for sensitive files
- **Two-Factor Authentication Ready**: Infrastructure for 2FA implementation
- **Session Management**: Secure session handling with automatic timeouts
- **Privacy Controls**: Granular privacy settings for shared documents

## 🚀 Tech Stack

### Frontend
- **React 19.2** - Latest React with concurrent features
- **TypeScript 5.6** - Type-safe development
- **Vite 7.2** - Lightning-fast build tool
- **Framer Motion 12** - Smooth animations
- **React Router 7** - Client-side routing
- **React Hook Form 7** - Form management
- **i18next** - Internationalization
- **Lucide React** - Beautiful icons

### Backend & Services
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Storage
  - Realtime subscriptions
- **Google OAuth** - Social authentication
- **PWA** - Service workers for offline support

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Tailwind CSS** (utility classes) - Rapid styling

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Google Cloud Console account (for OAuth)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd document-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Supabase Setup**
   - Create a new Supabase project
   - Run the database migrations (see `/supabase` folder)
   - Enable Google OAuth in Authentication > Providers
   - Configure Storage buckets for document uploads

5. **Google OAuth Setup**
   - Create OAuth 2.0 credentials in Google Cloud Console
   - Add authorized redirect URI: `https://[your-project].supabase.co/auth/v1/callback`
   - Add Client ID and Secret to Supabase

6. **Run Development Server**
```bash
npm run dev
```

The app will be available at `http://localhost:5174`

## 🏗️ Project Structure

```
document-tracker/
├── public/
│   ├── icons/              # PWA icons
│   ├── sw.js              # Service worker
│   └── manifest.json      # PWA manifest
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── documents/    # Document management
│   │   ├── layout/       # Layout components
│   │   ├── ui/          # Reusable UI components
│   │   └── ...
│   ├── config/           # Configuration files
│   ├── contexts/         # React contexts
│   ├── hooks/           # Custom hooks
│   ├── layouts/         # Page layouts
│   ├── locales/         # Translation files
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── .env                 # Environment variables
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎯 Key Components

### Authentication (`/src/pages/auth/`)
- `Login.tsx` - Email/password and Google OAuth login
- `Signup.tsx` - User registration with form validation
- `ForgotPassword.tsx` - Password reset flow

### Documents (`/src/pages/documents/`)
- `Documents.tsx` - Main document listing (mobile/desktop responsive)
- `DesktopDocuments.tsx` - Desktop-optimized document grid
- `AddDocument.tsx` - Document upload form
- `DocumentDetail.tsx` - Full document view
- `EditDocument.tsx` - Document editing

### Dashboard (`/src/pages/dashboard/`)
- `Dashboard.tsx` - Main dashboard with urgency summary
- Activity charts
- Document statistics
- Quick actions

### Settings (`/src/pages/settings/`)
- `DesktopSettings.tsx` - Comprehensive settings panel
- Email & Password management
- Two-Factor Authentication
- Connected Devices
- Notifications
- Appearance
- Language
- Storage
- Export Data
- Family Sharing

## 🌐 Deployment

### Vercel Deployment

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel --prod
```

### Environment Variables (Vercel)
Add these in Vercel Dashboard → Settings → Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Build Configuration
The project uses Vite for building. The build output goes to `/dist`.

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

### Vercel Configuration File
Create `vercel.json` in the root directory:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 📱 Progressive Web App (PWA)

DocuTrack is a fully functional PWA with:
- Offline support
- Install to home screen
- Push notifications (ready)
- Background sync (ready)

To install on mobile:
1. Visit the deployed URL
2. Tap "Add to Home Screen"
3. Use like a native app

## 🔐 Security

### Implemented Security Features
- ✅ Row Level Security (RLS) in Supabase
- ✅ Password strength validation
- ✅ Email verification
- ✅ Session timeout handling
- ✅ Document password protection
- ✅ Secure file uploads
- ✅ XSS protection
- ✅ CSRF protection
- ✅ SQL injection prevention

### Recommended Production Settings
- Enable 2FA for all admin accounts
- Regular security audits
- Keep dependencies updated
- Monitor Supabase logs
- Rate limiting on API endpoints
- Content Security Policy headers

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Type checking
npm run type-check

# Lint
npm run lint
```

## 📊 Database Schema

### Main Tables
- `user_profiles` - User information
- `documents` - Document records
- `family_connections` - Family sharing relationships
- `shared_documents` - Document sharing records
- `notification_settings` - User notification preferences

See `/supabase` folder for complete schema and migrations.

## 🎨 Design System

### Colors
- Primary: Purple (`#8B5CF6`)
- Secondary: Pink (`#EC4899`)
- Background: Dark gradients
- Accent: Blue (`#3B82F6`)

### Typography
- Font: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto
- Sizes: 11px - 48px responsive scale

### Spacing
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64px

## 🌍 Internationalization

Supported languages:
- English (en)
- French (fr)
- Spanish (es)
- Arabic (ar) - RTL support
- Urdu (ur) - RTL support

Translation files in `/src/locales/`

## 📝 Recent Changes

### Latest Updates (December 17, 2025)
- ✅ Fixed Signup page label visibility (black text on white background)
- ✅ Fixed input placeholder visibility (darker gray for better contrast)
- ✅ Fixed terms agreement text visibility (black text)
- ✅ Implemented Google OAuth authentication
- ✅ Added comprehensive Desktop Settings page with sidebar navigation
- ✅ Created Desktop Documents page with advanced filtering and sorting
- ✅ Added Desktop Calendar view
- ✅ Implemented document password protection
- ✅ Added quick notes feature
- ✅ Mobile navigation polish
- ✅ Glass morphism design system

### Previous Updates
- Desktop navigation implementation
- Document locking feature
- Family sharing infrastructure
- PWA optimization
- Multi-language support
- Dark theme implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React team for React 19
- Supabase team for amazing BaaS
- Framer Motion for smooth animations
- Lucide for beautiful icons
- Tailwind CSS for utility classes

## 📞 Support

For support, email support@docutrack.app or open an issue on GitHub.

## 🗺️ Roadmap

### Upcoming Features
- [ ] Calendar sync (Google Calendar, iCal)
- [ ] OCR for automatic document data extraction
- [ ] Bulk import/export
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] Document templates
- [ ] Reminders via SMS
- [ ] Integration with government portals
- [ ] Blockchain verification (optional)

---

Built with ❤️ using React, TypeScript, and Supabase

**Version:** 1.0.0
**Last Updated:** December 17, 2025
