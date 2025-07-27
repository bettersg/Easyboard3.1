import React, { createContext, useContext, useState } from 'react';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Types for different sections of the app state
type AuthState = {
  confirmation: FirebaseAuthTypes.ConfirmationResult | null;
  hasAuthen: boolean;
  userType: string | null;
  firstTimeUser: boolean;
};

type AuthActions = {
  setConfirmation: (confirmation: FirebaseAuthTypes.ConfirmationResult | null) => void;
  setAuthentication: (hasAuthen: boolean, userType: string | null, firstTimeUser?: boolean) => void;
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
  const [hasAuthen, setHasAuthen] = useState<boolean>(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [firstTimeUser, setFirstTimeUser] = useState<boolean>(false);

  const setAuthentication = (hasAuthen: boolean, userType: string | null, firstTimeUser: boolean = false) => {
    setHasAuthen(hasAuthen);
    setUserType(userType);
    setFirstTimeUser(firstTimeUser);
  };

  // Combine all context values
  const contextValue: AppContextType = {
    auth: {
      // States
      confirmation,
      hasAuthen,
      userType,
      firstTimeUser,
      // Actions
      setConfirmation,
      setAuthentication,
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