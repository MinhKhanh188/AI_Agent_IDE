import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [fontSize, setFontSize] = useState(13);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-size', `${fontSize}px`);
    document.documentElement.style.setProperty('--app-icon-size', `${fontSize + 4}px`);
  }, [fontSize]);

  return (
    <AppContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
