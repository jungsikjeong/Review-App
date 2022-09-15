import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../../api/auth';
import { useAuth, useNotification } from '../../hooks';
import { commonModalClasses } from '../../utils/theme';

import Container from '../Container';
import CustomLink from '../CustomLink';
import FormContainer from '../form/FormContainer';
import FormInput from '../form/FormInput';
import Submit from '../form/Submit';
import Title from '../form/Title';

const validateUserInfo = ({ name, email, password }) => {
  const isValidEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const isValidName = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|]+$/;

  if (!name.trim()) return { ok: false, error: '이름을 입력해주세요!' };
  if (name.length < 3)
    return { ok: false, error: '이름은 세글자 이상으로 입력해주세요!' };
  if (!isValidName.test(name))
    return {
      ok: false,
      error: '유효하지 않은 이름입니다!',
    };
  if (!email.trim()) return { ok: false, error: '이메일을 입력해주세요!' };
  if (!isValidEmail.test(email))
    return { ok: false, error: '유효하지않은 이메일입니다!' };

  if (!password.trim()) return { ok: false, error: '패스워드를 입력해주세요!' };
  if (password.length < 6)
    return { ok: false, error: '비밀번호는 6자여야 합니다!' };

  return { ok: true };
};

const SignUp = () => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const { updateNotification } = useNotification();
  const { authInfo } = useAuth();
  const { isLoggedIn } = authInfo;

  const handleChange = (e) => {
    const { value, name } = e.target;

    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { ok, error } = validateUserInfo(userInfo);

    if (!ok) return updateNotification('error', error);

    const response = await createUser(userInfo);
    if (response.error) return console.log('response.error:', response.error);

    navigate('/auth/verification', {
      state: { user: response.user },
      replace: true,
    });
  };

  const { name, email, password } = userInfo;

  useEffect(() => {
    if (isLoggedIn) navigate('/');
  }, [isLoggedIn, navigate]);

  return (
    <FormContainer>
      <Container>
        <form onSubmit={handleSubmit} className={commonModalClasses + ' w-72'}>
          <Title>Sign Up</Title>
          <FormInput
            value={name}
            label='Name'
            placeholder='Your name'
            name='name'
            onChange={handleChange}
          />
          <FormInput
            value={email}
            label='Email'
            placeholder='user@email.com'
            name='email'
            onChange={handleChange}
          />
          <FormInput
            value={password}
            label='Password'
            autoComplete='on'
            placeholder='******'
            name='password'
            type='password'
            onChange={handleChange}
          />
          <Submit value='Sign up' />

          <div className='flex justify-between'>
            <CustomLink to='/auth/forget-password'>Forget password</CustomLink>
            <CustomLink to='/auth/signin'> Sign in</CustomLink>
          </div>
        </form>
      </Container>
    </FormContainer>
  );
};

export default SignUp;
