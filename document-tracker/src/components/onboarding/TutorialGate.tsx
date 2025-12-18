import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import OnboardingTutorial from './OnboardingTutorial';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';

interface TutorialGateProps {
  children: React.ReactNode;
}

export default function TutorialGate({ children }: TutorialGateProps) {
  const { user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const checkTutorialStatus = async () => {
      if (!user?.id) {
        setIsChecking(false);
        return;
      }

      try {
        // Check if user just signed up (account created in last 5 minutes)
        const accountAge = user.created_at ? Date.now() - new Date(user.created_at).getTime() : Infinity;
        const isNewUser = accountAge < 5 * 60 * 1000; // 5 minutes

        // Only show tutorial for new signups, not logins
        if (!isNewUser) {
          setIsChecking(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_profiles')
          .select('tutorial_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking tutorial status:', error);
          setIsChecking(false);
          return;
        }

        // Show tutorial if not completed AND user just signed up
        if (!data?.tutorial_completed && isNewUser) {
          setShowTutorial(true);
        }

        setIsChecking(false);
      } catch (error) {
        console.error('Error checking tutorial status:', error);
        setIsChecking(false);
      }
    };

    checkTutorialStatus();
  }, [user?.id, user?.created_at]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    // Show success toast
    showToast('Welcome to DocuTrackr! 🎉', 'success');
    
    // Show success toast and highlight + button
    if (typeof window !== 'undefined') {
      // Small delay to ensure tutorial closes first
      setTimeout(() => {
        // Highlight the + button with a pulse animation
        const fabButton = document.querySelector('[data-fab-button]') as HTMLElement;
        if (fabButton) {
          // Add pulse animation
          const originalBoxShadow = fabButton.style.boxShadow;
          fabButton.style.animation = 'pulse 2s infinite';
          fabButton.style.boxShadow = '0 0 30px rgba(139, 92, 246, 0.8)';
          
          // Add tooltip
          const tooltip = document.createElement('div');
          tooltip.textContent = 'Tap + to add your first document';
          tooltip.className = 'absolute bottom-full mb-2 px-3 py-2 rounded-lg text-xs text-white whitespace-nowrap pointer-events-none';
          tooltip.style.background = 'rgba(42, 38, 64, 0.95)';
          tooltip.style.backdropFilter = 'blur(10px)';
          tooltip.style.border = '1px solid rgba(255, 255, 255, 0.1)';
          tooltip.style.zIndex = '9999';
          tooltip.style.left = '50%';
          tooltip.style.transform = 'translateX(-50%)';
          
          const buttonParent = fabButton.parentElement;
          if (buttonParent) {
            buttonParent.style.position = 'relative';
            buttonParent.appendChild(tooltip);
            
            setTimeout(() => {
              tooltip.remove();
              fabButton.style.animation = '';
              fabButton.style.boxShadow = originalBoxShadow;
            }, 5000);
          }
        }
      }, 500);
    }
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    // Show tooltip on + button
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const fabButton = document.querySelector('[data-fab-button]') as HTMLElement;
        if (fabButton && fabButton.parentElement) {
          // Create tooltip element
          const tooltip = document.createElement('div');
          tooltip.textContent = 'Tap here to add your first document';
          tooltip.className = 'absolute bottom-full mb-2 px-3 py-2 rounded-lg text-xs text-white whitespace-nowrap pointer-events-none';
          tooltip.style.background = 'rgba(42, 38, 64, 0.95)';
          tooltip.style.backdropFilter = 'blur(10px)';
          tooltip.style.border = '1px solid rgba(255, 255, 255, 0.1)';
          tooltip.style.zIndex = '9999';
          tooltip.style.left = '50%';
          tooltip.style.transform = 'translateX(-50%)';
          
          const buttonParent = fabButton.parentElement;
          buttonParent.style.position = 'relative';
          buttonParent.appendChild(tooltip);
          
          setTimeout(() => {
            tooltip.remove();
          }, 5000);
        }
      }, 500);
    }
  };

  // Show loading state while checking
  if (isChecking) {
    return null; // Or a loading spinner
  }

  return (
    <>
      {showTutorial && (
        <OnboardingTutorial
          isOpen={showTutorial}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}
      {!showTutorial && children}
    </>
  );
}
