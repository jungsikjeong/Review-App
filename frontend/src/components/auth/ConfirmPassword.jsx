import React, { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { commonModalClasses } from '../../utils/theme';
import { ImSpinner3 } from 'react-icons/im';
import Container from '../Container';
import FormContainer from '../form/FormContainer';
import FormInput from '../form/FormInput';
import Submit from '../form/Submit';
import Title from '../form/Title';
import { resetPassword, verifyPasswordResetToken } from '../../api/auth';
import { useNotification } from '../../hooks';

const ConfirmPassword = () => {
  const [password, setPassword] = useState({
    one: '',
    two: '',
  });
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const id = searchParams.get('id');

  const { updateNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    isValidToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isValidToken = async () => {
    const { error, valid } = await verifyPasswordResetToken(token, id);
    setIsVerifying(false);
    if (error) {
      navigate('/auth/reset-password', { replace: true });
      return updateNotification('error', error);
    }

    if (!valid) {
      setIsValid(false);
      return navigate('/auth/reset-password', { replace: true });
    }

    setIsValid(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPassword({ ...password, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.one.trim()) {
      return updateNotification('error', '비밀번호를 입력해주세요!');
    }

    if (password.one.trim().length < 6) {
      return updateNotification('error', '패스워드는 6자 이상으로 해주세요!');
    }

    if (password.one !== password.two)
      return updateNotification('error', '패스워드가 일치하지 않습니다!');

    const { error, message } = await resetPassword({
      newPassword: password.one,
      userId: id,
      token,
    });

    if (error) return updateNotification('error', error);

    updateNotification('success', message);
    navigate('/auth/signin', { replace: true });
  };

  if (isVerifying)
    return (
      <FormContainer>
        <Container>
          <div className='flex space-x-2 items-center'>
            <h1 className='text-4xl font-semibold dark:text-white text-primary'>
              토큰을 확인하는 중이니 기다려 주십시오!
            </h1>
            <ImSpinner3 className='animate-spin text-4xl dark:text-white text-primary' />
          </div>
        </Container>
      </FormContainer>
    );

  if (!isValid)
    return (
      <FormContainer>
        <Container>
          <h1 className='text-4xl font-semibold dark:text-white text-primary'>
            죄송합니다. 토큰이 잘못되었습니다!
          </h1>
        </Container>
      </FormContainer>
    );

  return (
    <FormContainer>
      <Container>
        <form onSubmit={handleSubmit} className={commonModalClasses + ' w-96'}>
          <Title>Enter New Password</Title>
          <FormInput
            value={password.one}
            onChange={handleChange}
            label='New Password'
            placeholder='******'
            name='one'
            type='password'
          />

          <FormInput
            value={password.two}
            onChange={handleChange}
            label='Confirm Password'
            placeholder='******'
            name='two'
            type='password'
          />

          <Submit value='Confirm Password' />
        </form>
      </Container>
    </FormContainer>
  );
};

export default ConfirmPassword;
