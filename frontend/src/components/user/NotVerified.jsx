import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import Container from '../Container';

const NotVerified = () => {
  const { authInfo } = useAuth();
  const { isLoggedIn } = authInfo;
  const isVerified = authInfo.profile?.isVerified;

  const navigate = useNavigate();

  const navigateToVerification = () => {
    navigate('/auth/verification', { state: { user: authInfo.profile } });
  };
  return (
    <Container>
      {isLoggedIn && !isVerified ? (
        <p className='text-lg text-center bg-blue-50 p-2'>
          계정을 확인하지 않은 것 같습니다.{' '}
          <button
            onClick={navigateToVerification}
            className='text-blue-500 font-semibold hover:underline'
          >
            계정 확인.
          </button>
        </p>
      ) : null}
    </Container>
  );
};

export default NotVerified;
