import React, { createContext } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { getIsAuth, signInUser } from '../api/auth';

export const AuthContext = createContext();

const defaultAuthInfo = {
  profile: null,
  isLoggedIn: false,
  isPending: false,
  error: '',
};

export const AuthProvider = ({ children }) => {
  const [authInfo, setAuthInfo] = useState({ ...defaultAuthInfo });

  const handleLogin = async (email, password) => {
    setAuthInfo({ ...defaultAuthInfo, isPending: true });
    const { error, user } = await signInUser({ email, password });
    if (error) {
      return setAuthInfo({ ...authInfo, isPending: false, error });
    }
    setAuthInfo({
      profile: { ...user },
      isLoggedIn: true,
      isPending: false,
      error: '',
    });

    localStorage.setItem('auth-token', user.token);
  };

  const isAuth = async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) return;

    setAuthInfo({ ...authInfo, isPending: true });

    const { error, user } = await getIsAuth(token);

    if (error) return setAuthInfo({ ...authInfo, isPending: false, error });

    setAuthInfo({
      profile: { ...user },
      isLoggedIn: true,
      isPending: false,
      error: '',
    });
  };

  useEffect(() => {
    isAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // handleLogout, isAuth
  return (
    <AuthContext.Provider value={{ authInfo, handleLogin, isAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
