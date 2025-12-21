import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../config/supabase';

interface LanguageContextType {
  language: string;
  changeLanguage: (lang: string, saveToDB?: boolean) => Promise<void>;
  isRTL: boolean;
  isChanging: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  // Always call hooks - React rules require this
  let i18n;
  try {
    const translation = useTranslation();
    i18n = translation.i18n;
  } catch (error) {
    console.error('useTranslation hook error:', error);
    // Create a fallback i18n object
    i18n = {
      language: 'en',
      changeLanguage: async () => {},
    } as any;
  }

  const [language, setLanguage] = useState(i18n?.language || 'en');
  const [isRTL, setIsRTL] = useState(['ar', 'ur'].includes(i18n?.language || 'en'));
  const [isChanging, setIsChanging] = useState(false);

  // Update user language in database
  const updateUserLanguage = async (lang: string) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user?.id) {
        console.debug('User not authenticated, skipping language save');
        return;
      }

      // Try to update existing profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ language: lang })
        .eq('user_id', user.id);

      // If update fails (profile might not exist), try to insert
      if (updateError) {
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            language: lang,
            full_name: user.user_metadata?.full_name || null,
            email: user.email || null,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Failed to save user language:', insertError);
        }
      }
    } catch (error) {
      console.error('Error updating user language:', error);
    }
  };

  // Load user language preference on mount
  useEffect(() => {
    const loadUserLanguage = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user?.id) return;

        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('language')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single to handle no profile case

        if (!error && profile?.language) {
          await changeLanguage(profile.language, false); // Don't save again
        }
      } catch (error) {
        // Silently fail - user might not be logged in yet
        console.debug('Could not load user language:', error);
      }
    };

    // Wait a bit for auth to initialize
    const timer = setTimeout(() => {
      loadUserLanguage();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const changeLanguage = async (lang: string, saveToDB: boolean = true) => {
    if (isChanging || !i18n) return; // Prevent rapid changes
    
    setIsChanging(true);
    try {
      // Fade out animation
      if (typeof document !== 'undefined') {
        document.body.style.opacity = '0.7';
        document.body.style.transition = 'opacity 0.2s ease';
      }

      await new Promise(resolve => setTimeout(resolve, 150));

      if (i18n?.changeLanguage) {
        await i18n.changeLanguage(lang);
      }
      setLanguage(lang);
      setIsRTL(['ar', 'ur'].includes(lang));
      localStorage.setItem('language', lang);

      // Update HTML dir and lang attributes
      if (typeof document !== 'undefined') {
        const isRTLNew = ['ar', 'ur'].includes(lang);
        const oldDir = document.documentElement.dir;
        document.documentElement.dir = isRTLNew ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;

        // Slide animation for RTL switch
        if (oldDir !== (isRTLNew ? 'rtl' : 'ltr')) {
          document.body.style.transform = isRTLNew 
            ? 'translateX(-20px)' 
            : 'translateX(20px)';
          document.body.style.transition = 'transform 0.3s ease';
          
          await new Promise(resolve => setTimeout(resolve, 100));
          document.body.style.transform = 'translateX(0)';
        }

        // Fade in animation
        await new Promise(resolve => setTimeout(resolve, 100));
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.3s ease';
      }

      // Save to user profile in database
      if (saveToDB) {
        await updateUserLanguage(lang);
      }
    } catch (error) {
      console.error('Error changing language:', error);
      if (typeof document !== 'undefined') {
        document.body.style.opacity = '1';
        document.body.style.transform = 'translateX(0)';
      }
    } finally {
      setIsChanging(false);
    }
  };

  // Set initial direction on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    const isRTLInitial = ['ar', 'ur'].includes(savedLanguage);
    document.documentElement.dir = isRTLInitial ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLanguage;
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, isRTL, isChanging }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

