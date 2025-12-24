import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import AuthProvider from './components/auth/AuthProvider';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import LoadingScreen from './components/ui/LoadingScreen';

// Lazy load routes for code splitting
const Landing = lazy(() => import('./pages/landing/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const OAuthCallback = lazy(() => import('./pages/auth/OAuthCallback'));
// Revert to the first/original Dashboard design
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard.backup'));
// Keep /expire-soon working but point it to the same original design
const ExpireSoon = lazy(() => import('./pages/dashboard/Dashboard.backup'));
const Documents = lazy(() => import('./pages/documents/Documents'));
const AddDocument = lazy(() => import('./pages/documents/AddDocument'));
const DocumentDetail = lazy(() => import('./pages/documents/DocumentDetail'));
const DesktopDocumentDetail = lazy(() => import('./pages/documents/DesktopDocumentDetail'));
const ComprehensiveDocumentDetail = lazy(() => import('./pages/documents/ComprehensiveDocumentDetail'));
const EditDocument = lazy(() => import('./pages/documents/EditDocument'));
const Dates = lazy(() => import('./pages/dates/Dates'));
const DesktopCalendar = lazy(() => import('./pages/calendar/DesktopCalendar'));
const MobileCalendar = lazy(() => import('./pages/calendar/MobileCalendar'));
const Family = lazy(() => import('./pages/family/Family'));
const Notifications = lazy(() => import('./pages/notifications/Notifications'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const ChangePassword = lazy(() => import('./pages/profile/ChangePassword'));
const Settings = lazy(() => import('./pages/profile/Settings'));
const ChildManage = lazy(() => import('./pages/profile/ChildManage'));
const DesktopSettings = lazy(() => import('./pages/settings/DesktopSettings'));
const DesktopSearch = lazy(() => import('./pages/search/DesktopSearch'));
const DesktopNotifications = lazy(() => import('./pages/notifications/DesktopNotifications'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const Features = lazy(() => import('./pages/info/Features'));
const Security = lazy(() => import('./pages/info/Security'));
const FamilySharing = lazy(() => import('./pages/info/FamilySharing'));
const HelpCenter = lazy(() => import('./pages/info/HelpCenter'));
const FAQ = lazy(() => import('./pages/info/FAQ'));
const MyRequests = lazy(() => import('./pages/child/MyRequests'));
const PendingRequests = lazy(() => import('./pages/requests/PendingRequests'));

// Onboarding routes
const EmailVerification = lazy(() => import('./pages/onboarding/EmailVerification'));
const VerifyEmail = lazy(() => import('./pages/onboarding/VerifyEmail'));
const ProfileCompletion = lazy(() => import('./pages/onboarding/ProfileCompletion'));
const SecuritySetup = lazy(() => import('./pages/onboarding/SecuritySetup'));

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
      <Routes location={location} key={location.pathname}>
        {/* Public routes - Landing page is the default home */}
        <Route
          path="/"
          element={
            <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
              <Landing />
            </Suspense>
          }
        />
        <Route
          path="/home"
          element={
            <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
              <Landing />
            </Suspense>
          }
        />
        <Route
          path="/login"
          element={
            <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/signup"
          element={
            <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
              <Signup />
            </Suspense>
          }
        />
        <Route
          path="/auth/callback"
          element={
            <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
              <OAuthCallback />
            </Suspense>
          }
        />

        {/* Onboarding (Stage 2 is public, Stage 3/4 are protected) */}
        <Route
          path="/onboarding/email"
          element={
            <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
              <EmailVerification />
            </Suspense>
          }
        />
        <Route
          path="/verify-email"
          element={
            <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
              <VerifyEmail />
            </Suspense>
          }
        />
        <Route
          path="/onboarding/profile"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                <ProfileCompletion />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/security"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                <SecuritySetup />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
              <ForgotPassword />
            </Suspense>
          }
        />
        <Route
          path="/privacy"
          element={
            <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
              <PrivacyPolicy />
            </Suspense>
          }
        />
        <Route
          path="/terms"
          element={
            <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
              <TermsOfService />
            </Suspense>
          }
        />
        <Route
          path="/features"
          element={
            <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
              <Features />
            </Suspense>
          }
        />
        <Route
          path="/security"
          element={
            <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
              <Security />
            </Suspense>
          }
        />
        <Route
          path="/family-sharing"
          element={
            <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
              <FamilySharing />
            </Suspense>
          }
        />
        <Route
          path="/help"
          element={
            <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
              <HelpCenter />
            </Suspense>
          }
        />
        <Route
          path="/faq"
          element={
            <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
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
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                  <Dashboard />
                </Suspense>
              } 
            />
            <Route
              path="my-requests"
              element={
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                  <MyRequests />
                </Suspense>
              }
            />
            <Route
              path="requests"
              element={
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                  <PendingRequests />
                </Suspense>
              }
            />
            <Route
              path="expire-soon"
              element={
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                  <ExpireSoon />
                </Suspense>
              }
            />
            <Route 
              path="documents" 
              element={
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                  <Documents />
                </Suspense>
              } 
            />
            <Route 
              path="add-document" 
              element={
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                  <AddDocument />
                </Suspense>
              } 
            />
            <Route 
              path="dates" 
              element={
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                  <Dates />
                </Suspense>
              } 
            />
            <Route 
              path="calendar" 
              element={
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                  <DesktopCalendar />
                </Suspense>
              } 
            />
            <Route 
              path="calendar-mobile" 
              element={
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                  <MobileCalendar />
                </Suspense>
              } 
            />
            <Route 
              path="profile" 
              element={
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                  <Profile />
                </Suspense>
              } 
            />
            <Route
              path="profile/child/:childId"
              element={
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                  <ChildManage />
                </Suspense>
              }
            />
            <Route 
              path="profile/change-password" 
              element={
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                  <ChangePassword />
                </Suspense>
              } 
            />
            <Route
              path="settings"
              element={
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                  <Settings />
                </Suspense>
              }
            />
            <Route
              path="desktop-settings"
              element={
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                  <DesktopSettings />
                </Suspense>
              }
            />
            <Route 
              path="family" 
              element={
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                  <Family />
                </Suspense>
              } 
            />
            <Route 
              path="notifications" 
              element={
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                  <Notifications />
                </Suspense>
              } 
            />
            <Route 
              path="search" 
              element={
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                  <DesktopSearch />
                </Suspense>
              } 
            />
            <Route 
              path="notifications" 
              element={
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
                  <DesktopNotifications />
                </Suspense>
              } 
            />
        </Route>

        {/* Document detail and edit routes (outside MainLayout - full screen) */}
        <Route
          path="/documents/:id"
          element={
            <ProtectedRoute>
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
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
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
              <DesktopDocumentDetail />
                </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/:id/edit"
          element={
            <ProtectedRoute>
                <Suspense fallback={<LoadingScreen subtitle="Loading..." />}>
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
