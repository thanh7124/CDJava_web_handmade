import React from 'react';

export const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}
