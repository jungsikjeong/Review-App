const jwt = require('jsonwebtoken');
const User = require('../models/user');
const EmailVerificationToken = require('../models/emailVerificationToken');
const passwordResetToken = require('../models/passwordResetToken');

const { isValidObjectId } = require('mongoose');
const { generateOTP, generateMailTransporter } = require('../utils/mail');
const { sendError, generateRandomByte } = require('../utils/helper');

exports.create = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });

  if (oldUser) return sendError(res, '이 이메일은 이미 사용중입니다!', 404);

  const newUser = new User({ name, email, password });

  // 이걸안해주니까 db에 저장이안됨~
  await newUser.save();

  // 6자리 otp 생성
  let OTP = generateOTP();

  // db에 otp를 저장
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  // 해당 otp를 사용자에게 보냅니다.
  var transport = generateMailTransporter();

  transport.sendMail({
    from: 'admin',
    to: newUser.email,
    subject: 'Email Verification',
    html: `
    <p>Your verification OTP</p>
    <h1>${OTP}</h1>
    `,
  });

  res.status(201).json({
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  });
};

exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;

  if (!isValidObjectId(userId))
    return res.json({ error: '잘못된 사용자 ID입니다!' });

  const user = await User.findById(userId);

  if (!user) return sendError(res, '사용자를 찾을 수 없습니다!!');

  if (user.isVerified) return sendError(res, '사용자가 이미 확인되었습니다!');

  const token = await EmailVerificationToken.findOne({ owner: userId });
  if (!token) return sendError(res, '토큰을 찾을 수 없습니다!!');

  const isMatched = await token.compareToken(OTP);

  if (!isMatched) return sendError(res, '유효한 OTP를 제출하세요!');

  user.isVerified = true;
  await user.save();

  await EmailVerificationToken.findByIdAndDelete(token._id);

  // 해당 otp를 사용자에게 보냅니다.
  var transport = generateMailTransporter();

  transport.sendMail({
    from: '관리자',
    to: user.email,
    subject: 'Welcome Email',
    html: '<h1>저희 앱에 오신 것을 환영합니다. 저희를 선택해 주셔서 감사합니다.</h1>',
  });

  const jwtToken = jwt.sign({ userId: _id }, process.env.JWT_SECRET);
  res.json({
    user: { id: user._id, name: user.name, email: user.email, token: jwtToken },
    message: '이메일이 확인되었습니다.',
  });
};

exports.resendEmailVerificationToken = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return sendError(res, '사용자를 찾을 수 없습니다!!');

  if (user.isVerified) {
    return sendError(res, '이 이메일 ID는 이미 확인되었습니다.');
  }

  const alreadyHasToken = await EmailVerificationToken.findOne({
    owner: userId,
  });
  if (alreadyHasToken)
    return sendError(res, '한 시간 후에만 다른 토큰을 요청할 수 있습니다!');

  // 6자리 otp 생성
  let OTP = generateOTP();
  // db에 otp를 저장
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  // 해당 otp를 사용자에게 보냅니다.
  var transport = generateMailTransporter();

  transport.sendMail({
    from: 'smtp.mailtrap.io',
    to: user.email,
    subject: 'Email Verification',
    html: `
    <p>Your verification OTP</p>
    <h1>${OTP}</h1>
    `,
  });

  res.json({ message: '등록된 이메일 계정으로 새 OTP가 전송되었습니다.!' });
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return sendError(res, '이메일이 누락되었습니다!');

  const user = await User.findOne({ email });
  if (!user) return sendError(res, '유저를 찾을 수 없습니다!');

  const alreadyHasToken = await passwordResetToken.findOne({ owner: user._id });
  if (alreadyHasToken)
    return sendError(res, '한 시간 후에만 다른 토큰을 요청할 수 있습니다!');

  const token = await generateRandomByte();
  const newPasswordResetToken = await passwordResetToken({
    owner: user._id,
    token,
  });
  await newPasswordResetToken.save();

  const resetPasswordUrl = `http://localhost:3000/reset-password?token=${token}&id=${user._id}`;

  const transport = generateMailTransporter();

  transport.sendMail({
    from: 'security.mailtrap.io',
    to: user.email,
    subject: 'Reset Password Link',
    html: `
    <p>비밀번호를 재설정하려면 여기를 클릭하세요</p>
    <a href='${resetPasswordUrl}'>Change Password</a>
    `,
  });

  res.json({ message: '이메일로 링크가 전송되었습니다!' });
};

exports.sendResetPasswordTokenStatus = (req, res) => {
  res.json({ valid: true });
};

exports.resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;

  const user = await User.findById(userId);
  const matched = await user.comparePassword(newPassword);

  if (matched)
    return sendError(res, '새 비밀번호는 이전 비밀번호와 달라야 합니다!');

  user.password = newPassword;
  await user.save();

  await passwordResetToken.findByIdAndDelete(req.resetToken._id);

  const transport = generateMailTransporter();

  transport.sendMail({
    from: 'security.mailtrap.io',
    to: user.email,
    subject: 'Password Reset Successfully',
    html: `
    <h1>비밀번호 재설정 성공</h1>
    <p>이제 새 비밀번호를 사용할 수 있습니다.</p>
    `,
  });

  res.json({
    message: '비밀번호 재설정 성공,이제 새 비밀번호를 사용할 수 있습니다',
  });
};

exports.signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return sendError(res, '이메일/비밀번호 불일치');

  const matched = await user.comparePassword(password);
  if (!matched) return sendError(res, '이메일/비밀번호 불일치');

  const { _id, name } = user;

  const jwtToken = jwt.sign({ userId: _id }, process.env.JWT_SECRET);

  res.json({ user: { id: _id, name, email, token: jwtToken } });
};
