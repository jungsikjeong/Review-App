import React, { createContext, useEffect } from 'react';

export const ThemeContext = createContext();

const defaultTheme = 'light';
const darkTheme = 'dark';

export const ThemeProvider = ({ children }) => {
  const toggleTheme = () => {
    const oldTheme = getTheme();
    const newTheme = oldTheme === defaultTheme ? darkTheme : defaultTheme;
    // 다크모드는 tailwind.config.js에서  darkMode: 'class'를 해줘서
    // html class=dark 로 해주면 dark로 클래스명 준것들은 다 그 색상으로 변하게된다.
    updateTheme(newTheme, oldTheme);
  };

  useEffect(() => {
    const theme = getTheme();

    if (!theme) updateTheme(defaultTheme);
    else updateTheme(theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const getTheme = () => localStorage.getItem('theme');

const updateTheme = (theme, themeToRemove) => {
  if (themeToRemove) document.documentElement.classList.remove(themeToRemove);

  // console.log(document.documentElement);
  document.documentElement.classList.add(theme);
  localStorage.setItem('theme', theme);
};
