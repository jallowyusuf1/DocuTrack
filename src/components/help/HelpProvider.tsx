import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import HelpButton from './HelpButton';
import HelpPanel from './HelpPanel';
import ContactSupportModal from './ContactSupportModal';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import LiveChatWidget from './LiveChatWidget';
import ContextualHelpProvider from './ContextualHelpProvider';

interface HelpContextType {
  openHelp: () => void;
  closeHelp: () => void;
  openContactSupport: () => void;
  closeContactSupport: () => void;
  openKeyboardShortcuts: () => void;
  closeKeyboardShortcuts: () => void;
  openLiveChat: () => void;
  closeLiveChat: () => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export function useHelp() {
  const context = useContext(HelpContext);
  if (context === undefined) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
}

interface HelpProviderProps {
  children: ReactNode;
}

export default function HelpProvider({ children }: HelpProviderProps) {
  const [isHelpPanelOpen, setIsHelpPanelOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);

  // Keyboard shortcuts handler (? key)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Press ? to open keyboard shortcuts (only if no input is focused)
      if (e.key === '?' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName || '')) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      }
      // Press ESC to close modals/panels
      if (e.key === 'Escape') {
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
        } else if (isLiveChatOpen) {
          setIsLiveChatOpen(false);
        } else if (isLiveChatOpen) {
          setIsLiveChatOpen(false);
        } else if (isContactModalOpen) {
          setIsContactModalOpen(false);
        } else if (isHelpPanelOpen) {
          setIsHelpPanelOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isHelpPanelOpen, isContactModalOpen, isShortcutsModalOpen, isLiveChatOpen]);

  const openHelp = () => setIsHelpPanelOpen(true);
  const closeHelp = () => setIsHelpPanelOpen(false);
  const openContactSupport = () => {
    setIsHelpPanelOpen(false);
    setIsContactModalOpen(true);
  };
  const closeContactSupport = () => setIsContactModalOpen(false);
  const openKeyboardShortcuts = () => setIsShortcutsModalOpen(true);
  const closeKeyboardShortcuts = () => setIsShortcutsModalOpen(false);
  const openLiveChat = () => setIsLiveChatOpen(true);
  const closeLiveChat = () => setIsLiveChatOpen(false);

  return (
    <HelpContext.Provider
      value={{
        openHelp,
        closeHelp,
        openContactSupport,
        closeContactSupport,
        openKeyboardShortcuts,
        closeKeyboardShortcuts,
        openLiveChat,
        closeLiveChat,
      }}
    >
      {children}
      <ContextualHelpProvider />
      <HelpButton onClick={openHelp} />
      <HelpPanel
        isOpen={isHelpPanelOpen}
        onClose={closeHelp}
        onContactSupport={openContactSupport}
      />
      <ContactSupportModal isOpen={isContactModalOpen} onClose={closeContactSupport} />
      <KeyboardShortcutsModal isOpen={isShortcutsModalOpen} onClose={closeKeyboardShortcuts} />
      <LiveChatWidget isOpen={isLiveChatOpen} onClose={closeLiveChat} />
    </HelpContext.Provider>
  );
}

