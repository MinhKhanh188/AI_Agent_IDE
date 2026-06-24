import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [fontSize, setFontSize] = useState(13);
  return (
    <AppContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
