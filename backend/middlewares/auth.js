const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/helper');
const User = require('../models/user');

exports.isAuth = () => async (req, res, next) => {
  const token = req.headers?.authorization;

  const jwtToken = token.split('Bearer ')[1];
  if (!jwtToken) return sendError(res, '유효하지않은 토큰입니다.');

  const decode = jwt.verify(jwtToken, process.env.JWT_SECRET);
  const { userId } = decode;

  const user = await User.findById(userId);

  if (!user)
    return sendError(res, '잘못된 접근입니다. 사용자를 찾을 수 없습니다.', 404);

  req.user = user;

  next();
};
