import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Check, X, Lock, Mail, User, Shield, ChevronLeft } from 'lucide-react';
import { supabase } from '../../config/supabase';

// Password strength calculation
const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#30D158'];

  return {
    score: Math.min(score, 4),
    label: labels[Math.min(score, 4)],
    color: colors[Math.min(score, 4)],
  };
};

type Step = 'basic' | 'password' | 'terms' | 'success';

export default function AppleSignUp() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [loading, setLoading] = useState(false);

  // Form data
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);

  // Validation states
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

  // Email validation
  useEffect(() => {
    if (email.length === 0) {
      setEmailValid(null);
      setEmailError('');
      return;
    }

    const timer = setTimeout(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(email);
      setEmailValid(isValid);
      setEmailError(isValid ? '' : 'Please enter a valid email');
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  // Password match validation
  useEffect(() => {
    if (confirmPassword.length === 0) {
      setPasswordsMatch(null);
      return;
    }

    const timer = setTimeout(() => {
      setPasswordsMatch(password === confirmPassword);
    }, 300);

    return () => clearTimeout(timer);
  }, [password, confirmPassword]);

  const passwordStrength = calculatePasswordStrength(password);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ];

  const allPasswordRequirementsMet = passwordRequirements.every(req => req.met);

  const canContinueStep1 = fullName.length > 0 && emailValid === true;
  const canContinueStep2 = allPasswordRequirementsMet && passwordsMatch === true;
  const canContinueStep3 = agreeToTerms;

  const handleContinueStep1 = () => {
    if (canContinueStep1) {
      setCurrentStep('password');
    }
  };

  const handleContinueStep2 = () => {
    if (canContinueStep2) {
      setCurrentStep('terms');
    }
  };

  const handleCreateAccount = async () => {
    if (!canContinueStep3) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            email_updates: emailUpdates,
          },
        },
      });

      if (error) throw error;

      setCurrentStep('success');

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Sign up error:', error);
      alert(error.message || 'Failed to create account');
      setLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: 'google' | 'apple') => {
    try {
      const { error} = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Social sign up error:', error);
      alert(error.message || `Failed to sign up with ${provider}`);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6 py-12"
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
        position: 'relative',
      }}
    >
      {/* Secure Connection Indicator */}
      <div className="fixed top-6 right-6 flex items-center gap-2 text-gray-500 text-sm">
        <Lock size={14} />
        <span>Secure connection</span>
      </div>

      {/* Main Container - Centered */}
      <div className="w-full max-w-md mx-auto">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-[22px] mb-4 shadow-xl">
            <span className="text-4xl">📄</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            DocuTrackr
          </h1>
          <p className="text-[17px] text-gray-600">
            Create your account
          </p>
        </div>

        {/* Progress Indicator */}
        {currentStep !== 'success' && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <div
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                currentStep === 'basic' ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            />
            <div
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                currentStep === 'password' ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            />
            <div
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                currentStep === 'terms' ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            />
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 'basic' && (
            <div className="animate-fadeIn">
              <h2 className="text-[32px] font-bold text-gray-900 mb-2">
                Let's get started
              </h2>
              <p className="text-[17px] text-gray-600 mb-8">
                We'll have you set up in no time
              </p>

              {/* Full Name */}
              <div className="mb-5">
                <label htmlFor="fullName" className="block text-[13px] text-gray-600 mb-2 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Appleseed"
                    className="w-full h-14 pl-12 pr-4 text-[17px] border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-6">
                <label htmlFor="email" className="block text-[13px] text-gray-600 mb-2 ml-1">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@icloud.com"
                    className={`w-full h-14 pl-12 pr-12 text-[17px] border rounded-xl focus:outline-none transition-all ${
                      emailValid === null
                        ? 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                        : emailValid
                        ? 'border-green-500 focus:border-green-500 focus:ring-4 focus:ring-green-100'
                        : 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                    }`}
                  />
                  {emailValid === true && (
                    <Check size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                  )}
                  {emailValid === false && (
                    <X size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />
                  )}
                </div>
                {emailError && (
                  <p className="text-[13px] text-red-500 mt-2 ml-1">{emailError}</p>
                )}
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinueStep1}
                disabled={!canContinueStep1}
                className={`w-full h-14 rounded-full font-semibold text-[17px] text-white transition-all ${
                  canContinueStep1
                    ? 'bg-[#0071E3] hover:bg-[#0051A3] active:scale-[0.98] shadow-lg shadow-blue-500/30'
                    : 'bg-gray-300 opacity-40 cursor-not-allowed'
                }`}
              >
                Continue
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-500">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Social Sign Up */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleSocialSignUp('apple')}
                  className="w-full h-14 bg-black text-white rounded-full font-semibold text-[17px] flex items-center justify-center gap-3 hover:bg-gray-900 active:scale-[0.98] transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Sign up with Apple
                </button>

                <button
                  onClick={() => handleSocialSignUp('google')}
                  className="w-full h-14 bg-white border border-gray-300 text-gray-900 rounded-full font-semibold text-[17px] flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-[0.98] transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </button>
              </div>

              {/* Sign In Link */}
              <p className="text-center text-[15px] text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-purple-600 font-semibold underline hover:text-purple-700"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {/* Step 2: Password */}
          {currentStep === 'password' && (
            <div className="animate-fadeIn">
              <button
                onClick={() => setCurrentStep('basic')}
                className="flex items-center gap-1 text-purple-600 font-medium mb-6 hover:text-purple-700 transition-colors"
              >
                <ChevronLeft size={20} />
                Back
              </button>

              <h2 className="text-[32px] font-bold text-gray-900 mb-2">
                Create a password
              </h2>
              <p className="text-[17px] text-gray-600 mb-8">
                Choose a strong, unique password
              </p>

              {/* Password */}
              <div className="mb-4">
                <label htmlFor="password" className="block text-[13px] text-gray-600 mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full h-14 pl-12 pr-12 text-[17px] border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="mb-6">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${(passwordStrength.score / 4) * 100}%`,
                        backgroundColor: passwordStrength.color,
                      }}
                    />
                  </div>
                  <p className="text-[13px] mt-1 ml-1" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}

              {/* Requirements */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-[13px] font-semibold text-gray-700 mb-3">
                  Your password must contain:
                </p>
                <div className="space-y-2">
                  {passwordRequirements.map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3"
                      style={{
                        animation: req.met ? 'checkmarkPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none',
                      }}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                          req.met ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        {req.met && <Check size={14} className="text-white" />}
                      </div>
                      <span className={`text-[15px] ${req.met ? 'text-green-700' : 'text-gray-600'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-[13px] text-gray-600 mb-2 ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className={`w-full h-14 pl-12 pr-12 text-[17px] border rounded-xl focus:outline-none transition-all ${
                      passwordsMatch === null
                        ? 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                        : passwordsMatch
                        ? 'border-green-500 focus:border-green-500 focus:ring-4 focus:ring-green-100'
                        : 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {passwordsMatch === true && (
                    <Check size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                  )}
                  {passwordsMatch === false && (
                    <X size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />
                  )}
                </div>
                {passwordsMatch === false && (
                  <p className="text-[13px] text-red-500 mt-2 ml-1">Passwords don't match</p>
                )}
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinueStep2}
                disabled={!canContinueStep2}
                className={`w-full h-14 rounded-full font-semibold text-[17px] text-white transition-all ${
                  canContinueStep2
                    ? 'bg-[#0071E3] hover:bg-[#0051A3] active:scale-[0.98] shadow-lg shadow-blue-500/30'
                    : 'bg-gray-300 opacity-40 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 3: Terms */}
          {currentStep === 'terms' && (
            <div className="animate-fadeIn">
              <button
                onClick={() => setCurrentStep('password')}
                className="flex items-center gap-1 text-purple-600 font-medium mb-6 hover:text-purple-700 transition-colors"
              >
                <ChevronLeft size={20} />
                Back
              </button>

              <h2 className="text-[32px] font-bold text-gray-900 mb-2">
                One last thing
              </h2>
              <p className="text-[17px] text-gray-600 mb-8">
                Review our terms and policies
              </p>

              {/* Terms Agreement */}
              <div className="border border-gray-300 rounded-xl p-5 mb-4">
                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="w-6 h-6 rounded border-2 border-gray-300 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 mt-0.5 cursor-pointer"
                  />
                  <span className="text-[15px] text-gray-700 leading-relaxed">
                    I agree to the{' '}
                    <a href="/terms" target="_blank" className="text-purple-600 underline hover:text-purple-700">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" className="text-purple-600 underline hover:text-purple-700">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              {/* Optional Email Updates */}
              <div className="border border-gray-300 rounded-xl p-5 mb-6">
                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailUpdates}
                    onChange={(e) => setEmailUpdates(e.target.checked)}
                    className="w-6 h-6 rounded border-2 border-gray-300 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 mt-0.5 cursor-pointer"
                  />
                  <span className="text-[15px] text-gray-700 leading-relaxed">
                    Send me tips and updates via email
                  </span>
                </label>
              </div>

              {/* Privacy Assurance */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Shield size={20} className="text-purple-500 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  Your data is encrypted and never shared. We take privacy seriously.
                </p>
              </div>

              {/* Create Account Button */}
              <button
                onClick={handleCreateAccount}
                disabled={!canContinueStep3 || loading}
                className={`w-full h-14 rounded-full font-semibold text-[17px] text-white transition-all flex items-center justify-center gap-3 ${
                  canContinueStep3 && !loading
                    ? 'bg-[#0071E3] hover:bg-[#0051A3] active:scale-[0.98] shadow-lg shadow-blue-500/30'
                    : 'bg-gray-300 opacity-40 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          )}

          {/* Success State */}
          {currentStep === 'success' && (
            <div className="text-center py-12 animate-fadeIn">
              <div
                className="inline-flex items-center justify-center w-30 h-30 bg-green-500 rounded-full mb-6"
                style={{
                  animation: 'checkmarkScale 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  width: '120px',
                  height: '120px',
                }}
              >
                <Check size={60} className="text-white" strokeWidth={3} />
              </div>

              <h2 className="text-[28px] font-bold text-gray-900 mb-2">
                Welcome to DocuTrackr!
              </h2>
              <p className="text-[17px] text-gray-600 mb-8">
                Your account is ready
              </p>

              {/* Progress indicator */}
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes checkmarkPop {
          0% {
            transform: scale(0.8);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes checkmarkScale {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
