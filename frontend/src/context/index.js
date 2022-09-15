import React from 'react';
import { AuthProvider } from './AuthProvider';
import NotificationProvider from './NotificationProvider';
import { ThemeProvider } from './ThemeProvider';

export const ContextProviders = ({ children }) => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};
