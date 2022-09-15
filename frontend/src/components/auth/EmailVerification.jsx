import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useState } from 'react';
import { commonModalClasses } from '../../utils/theme';
import Container from '../Container';
import FormContainer from '../form/FormContainer';
import Submit from '../form/Submit';
import Title from '../form/Title';
import { verifyUserEmail } from '../../api/auth';
import { NotificationContext } from '../../context/NotificationProvider';

const OTP_LENGTH = 6;
let currentOTPIndex;

const isValidOTP = (otp) => {
  let valid = false;

  for (let val of otp) {
    // isNaN은 숫자가 아닌게 true임,
    // !isNaN은 숫자인게 true로 나왔음
    valid = !isNaN(parseInt(val));

    if (!valid) break;
  }

  return valid;
};

const EmailVerification = () => {
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);

  const inputRef = useRef();
  const { updateNotification } = NotificationContext();

  const { state } = useLocation();
  const user = state?.user;

  const navigate = useNavigate();

  const focusNextInputField = (index) => {
    setActiveOtpIndex(index + 1);
  };

  const focusPrevInputField = (index) => {
    let nextIndex;
    const diff = index - 1;
    nextIndex = diff !== 0 ? diff : 0;

    setActiveOtpIndex(nextIndex);
  };

  const handleOtpChange = (e) => {
    const { value } = e.target;
    const newOtp = [...otp];
    newOtp[currentOTPIndex] = value.substring(value.length - 1, value.length);
    // 숫자를 지우면 이전 input filed로 커서가 옮겨감
    if (!value) focusPrevInputField(currentOTPIndex);
    else focusNextInputField(currentOTPIndex);

    setOtp([...newOtp]);
  };

  const handleKeyDown = ({ key }, index) => {
    currentOTPIndex = index;

    if (key === 'Backspace') {
      focusPrevInputField(currentOTPIndex);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidOTP(otp)) {
      return updateNotification('error', '유효하지않은 OTP');
    }

    // submit otp
    const { error, message } = await verifyUserEmail({
      OTP: otp.join(''), // ['1','2'] -> '12'
      userId: user.id,
    });
    if (error) return updateNotification('error', error);

    updateNotification('success', message);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeOtpIndex]);

  useEffect(() => {
    if (!user) navigate('/not-fund');
  }, [user, navigate]);

  return (
    <FormContainer>
      <Container>
        <form onSubmit={handleSubmit} className={commonModalClasses}>
          <div>
            <Title>OTP를 입력하여 계정을 확인하세요.</Title>
            <p className='text-center dark:text-dark-subtle text-light-subtle'>
              귀하의 이메일로 OTP가 전송되었습니다.
            </p>
          </div>

          <div className='flex justify-center items-center space-x-4'>
            {otp.map((_, index) => {
              return (
                <input
                  ref={activeOtpIndex === index ? inputRef : null}
                  key={index}
                  type='number'
                  value={otp[index] || ''}
                  onChange={handleOtpChange}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className='w-12 h-12 border-2 dark:border-dark-subtle border-light-subtle dark:focus:border-white focus:border-primary rounded bg-transparent outline-none 
                text-center dark:text-white text-primary font-semibold text-xl
                spin-button-none'
                />
              );
            })}
          </div>
          <Submit value='Verify Account' />
        </form>
      </Container>
    </FormContainer>
  );
};

export default EmailVerification;
