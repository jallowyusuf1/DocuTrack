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

// Onboarding routes
const EmailVerification = lazy(() => import('./pages/onboarding/EmailVerification'));
const VerifyEmail = lazy(() => import('./pages/onboarding/VerifyEmail'));
const ProfileCompletion = lazy(() => import('./pages/onboarding/ProfileCompletion'));
const SecuritySetup = lazy(() => import('./pages/onboarding/SecuritySetup'));

// Loading fallback component
const PageLoader = () => (
  <div 
    className="flex items-center justify-center min-h-screen relative overflow-hidden"
    style={{
      background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
    }}
  >
    {/* Enhanced Floating Gradient Orbs */}
    <motion.div
      className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
      style={{
        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
      }}
      animate={{
        x: [0, 50, 0],
        y: [0, 30, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    <motion.div
      className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
      style={{
        background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
      }}
      animate={{
        x: [0, -40, 0],
        y: [0, -50, 0],
        scale: [1, 1.15, 1],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    <motion.div
      className="absolute bottom-1/2 left-1/2 w-[400px] h-[400px] rounded-full opacity-20 blur-[120px]"
      style={{
        background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
      }}
      animate={{
        x: [0, 30, 0],
        y: [0, -40, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />

    {/* Floating Document Icons */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{
          left: `${15 + i * 15}%`,
          top: `${20 + (i % 3) * 25}%`,
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0.3, 0.6, 0.3],
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 3 + i * 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: i * 0.3,
        }}
      >
        <div
          className="w-12 h-16 rounded-lg flex items-center justify-center"
          style={{
            background: 'rgba(139, 92, 246, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
          }}
        >
          <Calendar className="w-6 h-6 text-purple-400" />
        </div>
      </motion.div>
    ))}

    {/* Main Loading Card - Enhanced */}
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="relative z-10 flex flex-col items-center gap-6 p-8 md:p-10 rounded-3xl"
      style={{
        background: 'rgba(42, 38, 64, 0.75)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 80px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        minWidth: '280px',
        maxWidth: '320px',
      }}
    >
      {/* Tiled Glass Pattern Overlay */}
      <div
        className="absolute inset-0 rounded-3xl opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Animated Logo with Pulse Effect */}
      <motion.div
        className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(109, 40, 217, 0.9))',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 360],
        }}
        transition={{
          scale: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
          rotate: {
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
      >
        {/* Pulse Ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            border: '2px solid rgba(139, 92, 246, 0.5)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
        
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Calendar className="w-12 h-12 md:w-14 md:h-14 text-white" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))' }} />
        </motion.div>
      </motion.div>

      {/* Enhanced Loading Spinner */}
      <div className="relative" style={{ width: '32px', height: '32px' }}>
        <motion.div
          className="absolute inset-0 rounded-full border-3"
          style={{
            borderColor: 'rgba(139, 92, 246, 0.2)',
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-3 border-transparent"
          style={{
            borderTopColor: '#8B5CF6',
            borderRightColor: '#6D28D9',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        {/* Inner Glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Enhanced Loading Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center relative z-10"
      >
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-white mb-2"
          style={{
            textShadow: '0 0 30px rgba(139, 92, 246, 0.8), 0 2px 10px rgba(0, 0, 0, 0.5)',
            letterSpacing: '-0.5px',
            fontFamily: 'SF Pro Display, -apple-system, sans-serif',
          }}
          animate={{
            backgroundPosition: ['0%', '100%', '0%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <span
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #A78BFA 50%, #8B5CF6 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            DocuTrackr
          </span>
        </motion.h2>
        <motion.p
          className="text-sm md:text-base"
          style={{
            color: '#A78BFA',
            fontFamily: 'SF Pro Text, -apple-system, sans-serif',
            letterSpacing: '-0.2px',
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          Loading your documents...
        </motion.p>
      </motion.div>

      {/* Progress Dots */}
      <div className="flex items-center gap-2 mt-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: 'rgba(139, 92, 246, 0.6)',
              boxShadow: '0 0 8px rgba(139, 92, 246, 0.8)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>

    {/* Animated Particles */}
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={`particle-${i}`}
        className="absolute w-1 h-1 rounded-full"
        style={{
          background: 'rgba(139, 92, 246, 0.6)',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          boxShadow: '0 0 6px rgba(139, 92, 246, 0.8)',
        }}
        animate={{
          y: [0, -100, 0],
          opacity: [0, 1, 0],
          scale: [0, 1, 0],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          ease: 'easeOut',
          delay: Math.random() * 2,
        }}
      />
    ))}
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

        {/* Onboarding (Stage 2 is public, Stage 3/4 are protected) */}
        <Route
          path="/onboarding/email"
          element={
            <Suspense fallback={<PageLoader />}>
              <EmailVerification />
            </Suspense>
          }
        />
        <Route
          path="/verify-email"
          element={
            <Suspense fallback={<PageLoader />}>
              <VerifyEmail />
            </Suspense>
          }
        />
        <Route
          path="/onboarding/profile"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <ProfileCompletion />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/security"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <SecuritySetup />
              </Suspense>
            </ProtectedRoute>
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
              path="calendar-mobile" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <MobileCalendar />
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
            <Route 
              path="search" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <DesktopSearch />
                </Suspense>
              } 
            />
            <Route 
              path="notifications" 
              element={
                <Suspense fallback={<PageLoader />}>
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
