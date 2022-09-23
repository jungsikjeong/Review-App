const { check, validationResult } = require('express-validator');
const { isValidObjectId } = require('mongoose');
const genres = require('../models/genres');

exports.userValidator = [
  check('name').trim().not().isEmpty().withMessage('Name is missing!'),
  check('email').normalizeEmail().isEmail().withMessage('Email is invalid!'),
  check('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Password is missing!')
    .isLength({ min: 6, max: 20 })
    .withMessage('Password must be 6 to 20 characters long!'),
];

exports.validatePassword = [
  check('newPassword')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Password is missing!')
    .isLength({ min: 6, max: 20 })
    .withMessage('Password must be 6 to 20 characters long!'),
];

exports.signInValidator = [
  check('email').normalizeEmail().isEmail().withMessage('Email is invalid!'),
  check('password').trim().not().isEmpty().withMessage('Password is missing!'),
];

exports.actorInfoValidator = [
  check('name').trim().not().isEmpty().withMessage('Actor name is missing!'),
  check('about')
    .trim()
    .not()
    .isEmpty()
    .withMessage('About is a required field!'),
  check('gender')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Gender a required field!'),
];

exports.validateMovie = [
  check('title')
    .trim()
    .not()
    .isEmpty()
    .withMessage('영화의 제목을 입력해주세요!'),
  check('storyLine')
    .trim()
    .not()
    .isEmpty()
    .withMessage('스토리라인을 입력해주세요!'),
  check('language').trim().not().isEmpty().withMessage('언어를 입력해주세요!'),
  check('releaseDate').isDate().withMessage('출시일을 입력해주세요!'),
  check('status')
    .isIn(['public', 'private'])
    .withMessage('영화 상태는 공개 또는 비공개여야 합니다!'),
  check('type')
    .trim()
    .not()
    .isEmpty()
    .withMessage('영화의 타입을 입력해주세요!'),
  check('genres')
    .isArray()
    .withMessage('장르는 문자열 배열이어야 합니다!')
    .custom((value) => {
      for (let g of value) {
        if (!genres.includes(g)) throw Error('잘못된 장르입니다!');
      }

      return true;
    }),
  check('tags')
    .isArray({ min: 1 })
    .withMessage('태그는 문자열 배열이어야 합니다!')
    .custom((tags) => {
      for (let tag of tags) {
        if (typeof tag !== 'string') throw Error('태그는 문자열이어야 합니다!');
      }

      return true;
    }),
  check('cast')
    .isArray()
    .withMessage('캐스트는 문자열 배열이어야 합니다!')
    .custom((cast) => {
      for (let c of cast) {
        if (!isValidObjectId(c.actor))
          throw Error('캐스트에 잘못된 캐스트ID가 있습니다!');
        if (!c.roleAs?.trim()) throw Error('캐스트에 없는 역할!');
        if (typeof c.leadActor !== 'boolean')
          throw Error('캐스트 leadActor는 true 또는 false 값만 허용됩니다!');
      }

      return true;
    }),
  check('trailer')
    .isObject()
    .withMessage('trailer url 및 public_id가 있는 객체여야 합니다.')
    .custom(({ url, public_id }) => {
      try {
        const result = new URL(url);
        if (!result.protocol.includes('http')) {
          throw Error('Trailer url이 잘못되었습니다!');
        }

        // url의 '/'이 포함되거를 제거하고 배열로 나열함
        // url의 배열길이의 - 1을하면 '... .mp4'가 나옴
        const arr = url.split('/');
        const publicId = arr[arr.length - 1].split('.')[0];

        if (public_id !== publicId)
          throw Error('Trailer public_id가 잘못되었습니다!');

        return true;
      } catch (error) {
        throw Error('Trailer url이 잘못되었습니다!!!');
      }
    }),

  // multer 미들웨어의 req.file
  // check('poster').custom((_, { req }) => {
  //   if (!req.file) throw Error('게시글의 file이 없습니다!');

  //   return true;
  // }),
];

exports.validate = (req, res, next) => {
  const error = validationResult(req).array();

  if (error.length) {
    return res.json({ error: error[0].msg });
  }

  next();
};
