import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ConfirmPassword from './components/auth/ConfirmPassword';
import EmailVerification from './components/auth/EmailVerification';
import ForgetPassword from './components/auth/ForgetPassword';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import Home from './components/Home';
import NotFound from './components/NotFound';
import Navbar from './components/user/Navbar';
import { useAuth } from './hooks';
import AdminNavigator from './navigator/AdminNavigator';

const App = () => {
  const { authInfo } = useAuth();
  const isAdmin = authInfo.profile?.role === 'admin';

  if (isAdmin) return <AdminNavigator />;

  return (
    <>
      <Navbar />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/auth/signin' element={<SignIn />} />
        <Route path='/auth/signup' element={<SignUp />} />
        <Route path='/auth/verification' element={<EmailVerification />} />
        <Route path='/auth/forget-password' element={<ForgetPassword />} />
        <Route path='/auth/reset-password' element={<ConfirmPassword />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
