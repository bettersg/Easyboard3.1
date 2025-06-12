import React, { createContext, useContext, useState } from 'react';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Types for different sections of the app state
type AuthState = {
  confirmation: FirebaseAuthTypes.ConfirmationResult | null;
};

type AuthActions = {
  setConfirmation: (confirmation: FirebaseAuthTypes.ConfirmationResult | null) => void;
};

// Main context type that can be extended later
type AppContextType = {
  auth: AuthState & AuthActions;
  // Add other sections here as needed
  // example:
  // settings: SettingsState & SettingsActions;
  // theme: ThemeState & ThemeActions;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Auth related states
  const [confirmation, setConfirmation] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  // Combine all context values
  const contextValue: AppContextType = {
    auth: {
      // States
      confirmation,
      // Actions
      setConfirmation,
    },
    // Add other sections here as needed
    // example:
    // settings: { ... },
    // theme: { ... },
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Convenience hook for auth-related functionality
export function useAuth() {
  const { auth } = useApp();
  return auth;
} 