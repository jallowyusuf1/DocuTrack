import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import AuthProvider from './components/auth/AuthProvider';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Skeleton from './components/ui/Skeleton';
import { fadeIn } from './utils/animations';
import { motion } from 'framer-motion';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load routes for code splitting
const Landing = lazy(() => import('./pages/landing/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Documents = lazy(() => import('./pages/documents/Documents'));
const AddDocument = lazy(() => import('./pages/documents/AddDocument'));
const DocumentDetail = lazy(() => import('./pages/documents/DocumentDetail'));
const DesktopDocumentDetail = lazy(() => import('./pages/documents/DesktopDocumentDetail'));
const EditDocument = lazy(() => import('./pages/documents/EditDocument'));
const Dates = lazy(() => import('./pages/dates/Dates'));
const DesktopCalendar = lazy(() => import('./pages/calendar/DesktopCalendar'));
const Family = lazy(() => import('./pages/family/Family'));
const Notifications = lazy(() => import('./pages/notifications/Notifications'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const ChangePassword = lazy(() => import('./pages/profile/ChangePassword'));
const Settings = lazy(() => import('./pages/profile/Settings'));
const DesktopSettings = lazy(() => import('./pages/settings/DesktopSettings'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const Features = lazy(() => import('./pages/info/Features'));
const Security = lazy(() => import('./pages/info/Security'));
const FamilySharing = lazy(() => import('./pages/info/FamilySharing'));
const HelpCenter = lazy(() => import('./pages/info/HelpCenter'));
const FAQ = lazy(() => import('./pages/info/FAQ'));

// Loading fallback component
const PageLoader = () => (
  <div 
    className="flex items-center justify-center min-h-screen relative overflow-hidden"
    style={{
      background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)',
    }}
  >
    {/* Floating Gradient Orbs */}
    <motion.div
      className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px]"
      style={{
        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
      }}
      animate={{
        x: [0, 50, 0],
        y: [0, 30, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    <motion.div
      className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-15 blur-[120px]"
      style={{
        background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
      }}
      animate={{
        x: [0, -40, 0],
        y: [0, -50, 0],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    <motion.div
      className="absolute bottom-1/2 left-1/2 w-[400px] h-[400px] rounded-full opacity-15 blur-[120px]"
      style={{
        background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
      }}
      animate={{
        x: [0, 30, 0],
        y: [0, -40, 0],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />

    {/* Main Loading Card */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 flex flex-col items-center gap-6 p-8 rounded-3xl"
      style={{
        background: 'rgba(42, 38, 64, 0.7)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 60px rgba(139, 92, 246, 0.2)',
        width: '120px',
        height: '120px',
      }}
      data-tablet-loading-card="true"
    >
      <style>{`
        @media (min-width: 768px) {
          [data-tablet-loading-card="true"] {
            width: 160px !important;
            height: 160px !important;
          }
        }
      `}</style>
      {/* Animated Logo */}
      <motion.div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(109, 40, 217, 0.8))',
          boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 360],
        }}
        transition={{
          scale: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
          rotate: {
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
      >
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Calendar className="w-10 h-10 text-white" />
        </motion.div>
      </motion.div>

      {/* Loading Spinner */}
      <div className="relative" style={{ width: '20px', height: '20px' }} data-tablet-loading-spinner="true">
        <style>{`
          @media (min-width: 768px) {
            [data-tablet-loading-spinner="true"] {
              width: 32px !important;
              height: 32px !important;
            }
          }
        `}</style>
        <motion.div
          className="absolute inset-0 rounded-full border-4"
          style={{
            borderColor: 'rgba(139, 92, 246, 0.2)',
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="text-center"
      >
        <h2 className="text-xl font-bold text-white mb-2" style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.5)', fontSize: '20px' }} data-tablet-loading-title="true">
          <style>{`
            @media (min-width: 768px) {
              [data-tablet-loading-title="true"] {
                font-size: 19px !important;
              }
            }
          `}</style>
          DocuTrackr
        </h2>
        <p className="text-sm" style={{ color: '#A78BFA', fontSize: '15px' }} data-tablet-loading-text="true">
          <style>{`
            @media (min-width: 768px) {
              [data-tablet-loading-text="true"] {
                font-size: 19px !important;
              }
            }
          `}</style>
          Loading...
        </p>
      </motion.div>
    </motion.div>
  </div>
);

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
      <Routes location={location} key={location.pathname}>
        {/* Public routes - Landing page is the default home */}
        <Route
          path="/"
          element={
            <Suspense fallback={<PageLoader />}>
              <Landing />
            </Suspense>
          }
        />
        <Route
          path="/home"
          element={
            <Suspense fallback={<PageLoader />}>
              <Landing />
            </Suspense>
          }
        />
        <Route
          path="/login"
          element={
            <Suspense fallback={<PageLoader />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/signup"
          element={
            <Suspense fallback={<PageLoader />}>
              <Signup />
            </Suspense>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<PageLoader />}>
              <ForgotPassword />
            </Suspense>
          }
        />
        <Route
          path="/privacy"
          element={
            <Suspense fallback={<PageLoader />}>
              <PrivacyPolicy />
            </Suspense>
          }
        />
        <Route
          path="/terms"
          element={
            <Suspense fallback={<PageLoader />}>
              <TermsOfService />
            </Suspense>
          }
        />
        <Route
          path="/features"
          element={
            <Suspense fallback={<PageLoader />}>
              <Features />
            </Suspense>
          }
        />
        <Route
          path="/security"
          element={
            <Suspense fallback={<PageLoader />}>
              <Security />
            </Suspense>
          }
        />
        <Route
          path="/family-sharing"
          element={
            <Suspense fallback={<PageLoader />}>
              <FamilySharing />
            </Suspense>
          }
        />
        <Route
          path="/help"
          element={
            <Suspense fallback={<PageLoader />}>
              <HelpCenter />
            </Suspense>
          }
        />
        <Route
          path="/faq"
          element={
            <Suspense fallback={<PageLoader />}>
              <FAQ />
            </Suspense>
          }
        />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
            <Route
              path="dashboard" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              } 
            />
            <Route 
              path="documents" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <Documents />
                </Suspense>
              } 
            />
            <Route 
              path="add-document" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <AddDocument />
                </Suspense>
              } 
            />
            <Route 
              path="dates" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <Dates />
                </Suspense>
              } 
            />
            <Route 
              path="calendar" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <DesktopCalendar />
                </Suspense>
              } 
            />
            <Route 
              path="profile" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <Profile />
                </Suspense>
              } 
            />
            <Route 
              path="profile/change-password" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <ChangePassword />
                </Suspense>
              } 
            />
            <Route
              path="settings"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Settings />
                </Suspense>
              }
            />
            <Route
              path="desktop-settings"
              element={
                <Suspense fallback={<PageLoader />}>
                  <DesktopSettings />
                </Suspense>
              }
            />
            <Route 
              path="family" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <Family />
                </Suspense>
              } 
            />
            <Route 
              path="notifications" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <Notifications />
                </Suspense>
              } 
            />
        </Route>

        {/* Document detail and edit routes (outside MainLayout - full screen) */}
        <Route
          path="/documents/:id"
          element={
            <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
              <DocumentDetail />
                </Suspense>
            </ProtectedRoute>
          }
        />
        {/* Desktop document detail route */}
        <Route
          path="/documents/:id/desktop"
          element={
            <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
              <DesktopDocumentDetail />
                </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/:id/edit"
          element={
            <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
              <EditDocument />
                </Suspense>
              </ProtectedRoute>
            }
          />

        {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
