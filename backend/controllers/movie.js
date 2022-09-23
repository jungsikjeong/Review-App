const { sendError } = require('../utils/helper');
const cloudinary = require('../cloud');
const Movie = require('../models/movie');
const { isValidObjectId } = require('mongoose');

exports.uploadTrailer = async (req, res) => {
  const { file } = req;

  if (!file) return sendError(res, '비디오 파일이 없습니다!');

  const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    file.path,
    {
      resource_type: 'video',
    }
  );

  res.status(201).json({ url, public_id });
};

exports.createMovie = async (req, res) => {
  const { file, body } = req;

  const {
    title,
    storyLine,
    director,
    releaseDate,
    status,
    type,
    genres,
    tags,
    cast,
    writers,
    trailer,
    language,
  } = body;

  const newMovie = new Movie({
    title,
    storyLine,
    releaseDate,
    status,
    type,
    genres,
    tags,
    cast,
    trailer,
    language,
  });

  if (director) {
    if (!isValidObjectId(director)) {
      return sendError(res, 'Invalid director id!');
    }

    newMovie.director = director;
  }

  if (writers) {
    for (let writerId of writers) {
      if (!isValidObjectId(writerId)) {
        return sendError(res, 'Invalid writer id!');
      }
    }

    newMovie.writers = writers;
  }

  // uploading poster (포스터 파일 사이즈 조절)
  const {
    secure_url: url,
    public_id,
    responsive_breakpoints,
  } = await cloudinary.uploader.upload(file.path, {
    transformation: {
      width: 1280,
      height: 720,
    },
    responsive_breakpoints: {
      create_derived: true,
      max_width: 640,
      max_images: 3,
    },
  });

  const finalPoster = { url, public_id, responsive: [] };

  const { breakpoints } = responsive_breakpoints[0];

  if (breakpoints.length) {
    for (let imgObj of breakpoints) {
      const { secure_url } = imgObj;
      finalPoster.responsive.push(secure_url);
    }
  }
  newMovie.poster = finalPoster;

  await newMovie.save();

  res.status(201).json({
    id: newMovie._id,
    title,
  });
};

exports.updateMovieWithoutPoster = async (req, res) => {
  const { movieId } = req.params;

  if (!isValidObjectId(movieId)) return sendError(res, '잘못된 영화ID 입니다!');

  const movie = await Movie.findById(movieId);

  if (!movie) return sendError(res, 'Movie Not Found!', 404);

  const {
    title,
    storyLine,
    director,
    releaseDate,
    status,
    type,
    genres,
    tags,
    cast,
    writers,
    trailer,
    language,
  } = req.body;

  movie.title = title;
  movie.storyLine = storyLine;
  movie.tags = tags;
  movie.releaseDate = releaseDate;
  movie.status = status;
  movie.type = type;
  movie.genres = genres;
  movie.cast = cast;
  movie.trailer = trailer;
  movie.language = language;

  if (director) {
    if (!isValidObjectId(director)) {
      return sendError(res, 'Invalid director id!');
    }

    movie.director = director;
  }

  if (writers) {
    for (let writerId of writers) {
      if (!isValidObjectId(writerId)) {
        return sendError(res, 'Invalid writer id!');
      }
    }
    movie.writers = writers;
  }

  await movie.save();

  res.json({ message: '영화 업데이트 완료', movie });
};

exports.updateMovieWithPoster = async (req, res) => {
  const { movieId } = req.params;

  if (!isValidObjectId(movieId)) return sendError(res, '잘못된 영화ID 입니다!');

  if (!req.file) return sendError(res, '영화 포스터가 없습니다!');

  const movie = await Movie.findById(movieId);

  if (!movie) return sendError(res, 'Movie Not Found!', 404);

  const {
    title,
    storyLine,
    director,
    releaseDate,
    status,
    type,
    genres,
    tags,
    cast,
    writers,
    trailer,
    language,
  } = req.body;

  movie.title = title;
  movie.storyLine = storyLine;
  movie.tags = tags;
  movie.releaseDate = releaseDate;
  movie.status = status;
  movie.type = type;
  movie.genres = genres;
  movie.cast = cast;
  movie.trailer = trailer;
  movie.language = language;

  if (director) {
    if (!isValidObjectId(director)) {
      return sendError(res, 'Invalid director id!');
    }

    movie.director = director;
  }

  if (writers) {
    for (let writerId of writers) {
      if (!isValidObjectId(writerId)) {
        return sendError(res, 'Invalid writer id!');
      }
    }
    movie.writers = writers;
  }

  // update poster.
  // 포스터가 있는 경우 클라우드에서 포스터를 제거합니다.
  const posterId = movie.poster?.public_id;

  if (posterId) {
    const { result } = await cloudinary.uploader.destroy(posterId);

    if (result !== 'ok') {
      return sendError(res, 'Cloud not update poster at the moment');
    }
  }

  // uploading poster (포스터 파일 사이즈 조절)
  const {
    secure_url: url,
    public_id,
    responsive_breakpoints,
  } = await cloudinary.uploader.upload(req.file.path, {
    transformation: {
      width: 1280,
      height: 720,
    },
    responsive_breakpoints: {
      create_derived: true,
      max_width: 640,
      max_images: 3,
    },
  });

  const finalPoster = { url, public_id, responsive: [] };

  const { breakpoints } = responsive_breakpoints[0];

  if (breakpoints.length) {
    for (let imgObj of breakpoints) {
      const { secure_url } = imgObj;
      finalPoster.responsive.push(secure_url);
    }
  }
  movie.poster = finalPoster;

  await movie.save();

  res.json({ message: '영화 업데이트 완료', movie });
};

exports.removeMovie = async (req, res) => {
  const { movieId } = req.params;

  if (!isValidObjectId(movieId)) return sendError(res, '잘못된 영화ID 입니다!');

  const movie = await Movie.findById(movieId);

  if (!movie) return sendError(res, 'Movie Not Found!', 404);

  // 포스터 체크 후 있으면 제거
  const posterId = movie.poster?.public_id;
  if (posterId) {
    const { result } = await cloudinary.uploader.destroy(posterId);
    if (result !== 'ok') {
      return sendError(res, 'Cloud not remove poster from cloud!');
    }
  }

  // 트레일러 삭제
  const trailerId = movie.trailer?.public_id;
  if (trailerId) {
    const { result } = await cloudinary.uploader.destroy(trailerId, {
      resource_type: 'video',
    });
    if (result !== 'ok') {
      return sendError(res, 'Cloud not find trailer in the cloud!');
    }
  }

  await Movie.findByIdAndRemove(movieId);

  res.json({ message: '영화가 성공적으로 제거되었습니다.' });
};
