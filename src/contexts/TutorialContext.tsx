import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TutorialContextType {
  isOpen: boolean;
  startTutorial: () => void;
  closeTutorial: () => void;
  hasSeenTutorial: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

export const TutorialProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    // Check local storage on mount
    const seen = localStorage.getItem('hasSeenTutorial');
    if (seen === 'true') {
      setHasSeenTutorial(true);
    }
  }, []);

  const startTutorial = () => {
    setIsOpen(true);
  };

  const closeTutorial = () => {
    setIsOpen(false);
    // Mark as seen when closed (or finished)
    localStorage.setItem('hasSeenTutorial', 'true');
    setHasSeenTutorial(true);
  };

  return (
    <TutorialContext.Provider value={{ isOpen, startTutorial, closeTutorial, hasSeenTutorial }}>
      {children}
    </TutorialContext.Provider>
  );
};