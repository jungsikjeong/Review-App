import React, { useEffect, useState } from 'react';
import { commonModalClasses } from '../../utils/theme';
import { useNavigate } from 'react-router-dom';
import { useAuth, useNotification } from '../../hooks';

import Container from '../Container';
import CustomLink from '../CustomLink';
import FormContainer from '../form/FormContainer';
import FormInput from '../form/FormInput';
import Submit from '../form/Submit';
import Title from '../form/Title';

const validateUserInfo = ({ name, email, password }) => {
  const isValidEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if (!email.trim()) return { ok: false, error: '이메일을 입력해주세요!' };
  if (!isValidEmail.test(email))
    return { ok: false, error: '유효하지않은 이메일입니다!' };

  if (!password.trim()) return { ok: false, error: '패스워드를 입력해주세요!' };
  if (password.length < 6)
    return { ok: false, error: '비밀번호는 6자여야 합니다!' };

  return { ok: true };
};

const SignIn = () => {
  const [userInfo, setUserInfo] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const { updateNotification } = useNotification();
  const { handleLogin, authInfo } = useAuth();
  const { isPending, isLoggedIn } = authInfo;

  const handleChange = (e) => {
    const { value, name } = e.target;

    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { ok, error } = validateUserInfo(userInfo);

    if (!ok) return updateNotification('error', error);

    handleLogin(userInfo.email, userInfo.password);
  };

  useEffect(() => {
    if (isLoggedIn) navigate('/');
  }, [isLoggedIn, navigate]);

  return (
    <FormContainer>
      <Container>
        <form onSubmit={handleSubmit} className={commonModalClasses + ' w-72'}>
          <Title>Sign In</Title>
          <FormInput
            value={userInfo.email}
            onChange={handleChange}
            label='Email'
            placeholder='john@email.com'
            name='email'
          />
          <FormInput
            value={userInfo.password}
            onChange={handleChange}
            label='Password'
            placeholder='******'
            name='password'
            type='password'
          />
          <Submit value='Sign in' busy={isPending} />

          <div className='flex justify-between'>
            <CustomLink to='/auth/forget-password'>Forget password</CustomLink>
            <CustomLink to='/auth/signup'> Sign up</CustomLink>
          </div>
        </form>
      </Container>
    </FormContainer>
  );
};

export default SignIn;
