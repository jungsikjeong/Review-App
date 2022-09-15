const { isValidObjectId } = require('mongoose');
const passwordResetToken = require('../models/passwordResetToken');
const { sendError } = require('../utils/helper');

exports.isValidPassResetToken = async (req, res, next) => {
  const { token, userId } = req.body;

  // 토큰이 빈 문자열이거나(!""은 true임), userId가 ObjectId아니면 에러발생
  if (!token.trim() || !isValidObjectId(userId))
    return sendError(res, '잘못된 요청입니다!');

  const resetToken = await passwordResetToken.findOne({ owner: userId });
  if (!resetToken) return sendError(res, '허가받지않는 요청입니다!');

  const matched = await resetToken.compareToken(token);
  if (!matched) return sendError(res, '허가받지않는 요청입니다!');

  req.resetToken = resetToken;

  next();
};
