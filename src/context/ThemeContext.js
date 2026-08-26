import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = {
    tabBarActive: '#5A8BFF',
    tabBarInactive: isDarkMode ? '#888888' : '#A0A0A0',
    tabBar: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    tabBarBorder: isDarkMode ? '#333333' : '#EEEEEE',
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
