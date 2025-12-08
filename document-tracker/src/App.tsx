import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
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
const EditDocument = lazy(() => import('./pages/documents/EditDocument'));
const Dates = lazy(() => import('./pages/dates/Dates'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const ChangePassword = lazy(() => import('./pages/profile/ChangePassword'));
const Settings = lazy(() => import('./pages/profile/Settings'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <Skeleton variant="circular" width={60} height={60} />
      <Skeleton variant="text" width={200} height={20} />
    </div>
  </div>
);

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
        {/* Public routes */}
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

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
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
          </Route>

          {/* Document detail and edit routes (outside MainLayout) */}
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
