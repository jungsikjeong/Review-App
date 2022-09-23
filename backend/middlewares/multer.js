const multer = require('multer');
const storage = multer.diskStorage({});

const imageFileFilter = (req, file, cb) => {
  // startsWith()괄호안의 image로 시작하면 true
  if (!file.mimetype.startsWith('image')) {
    cb('이미지 파일만 지원합니다!', false); // cb(false)는 파일 업로드를 거부한다는 뜻
  }

  cb(null, true);
};

const videoFileFilter = (req, file, cb) => {
  // startsWith()괄호안의 image로 시작하면 true
  if (!file.mimetype.startsWith('video')) {
    cb('비디오 파일만 지원합니다!', false); // cb(false)는 파일 업로드를 거부한다는 뜻
  }

  cb(null, true);
};

exports.uploadImage = multer({ storage, fileFilter: imageFileFilter });
exports.uploadVideo = multer({ storage, fileFilter: videoFileFilter });
