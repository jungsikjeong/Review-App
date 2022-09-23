const { isValidObjectId } = require('mongoose');
const Actor = require('../models/actor');
const {
  sendError,
  uploadImageToCloud,
  formatActor,
} = require('../utils/helper');
const cloudinary = require('../cloud');

exports.createActor = async (req, res) => {
  const { name, about, gender } = req.body;

  const { file } = req;
  const newActor = new Actor({ name, about, gender });

  if (file) {
    const { url, public_id } = await uploadImageToCloud(file.path);
    // secure_url는 해당 이미지의 url, public_id로는 검색을 할 수있었다.
    newActor.avatar = { url, public_id };
  }

  await newActor.save();

  res.status(201).json(formatActor(newActor));
};

// update
// 업데이트 시 고려해야 할 사항.
// 1번 - 이미지 파일은 / 아바타도 업데이트 중입니다.
// 2번 - 그렇다면 새 이미지/아바타를 업로드하기 전에 이전 이미지를 제거합니다.

exports.updateActor = async (req, res) => {
  const { name, about, gender } = req.body;
  const { file } = req;
  const { actorId } = req.params;

  if (!isValidObjectId(actorId)) return sendError(res, '잘못된 요청입니다!');

  const actor = await Actor.findById(actorId);

  if (!actor)
    return sendError(res, '잘못된 요청입니다. 기록을 찾을 수 없습니다!');

  const public_id = actor.avatar?.public_id;

  // 오래된 이미지가 있으면 제거합니다!
  if (public_id && file) {
    const { result } = await cloudinary.uploader.destroy(public_id);

    if (result !== 'ok') {
      return sendError(res, '클라우드에서 이미지를 제거할 수 없습니다!');
    }
  }

  // 새 아바타가 있는 경우 업로드합니다!
  if (file) {
    const { url, public_id } = await uploadImageToCloud(file.path)(
      // secure_url는 해당 이미지의 url, public_id로는 검색을 할 수있었다.
      (actor.avatar = { url, public_id })
    );
  }

  actor.name = name;
  actor.about = about;
  actor.gender = gender;

  await actor.save();

  res.status(201).json(formatActor(actor));
};

exports.removeActor = async (req, res) => {
  const { actorId } = req.params;

  if (!isValidObjectId(actorId)) return sendError(res, '잘못된 요청입니다!');

  const actor = await Actor.findById(actorId);

  if (!actor)
    return sendError(res, '잘못된 요청입니다. 기록을 찾을 수 없습니다!');

  const public_id = actor.avatar?.public_id;

  // 이미지 제거, public_id가 필요함 공식문서에도 적혀있음
  if (public_id) {
    const { result } = await cloudinary.uploader.destroy(public_id);

    if (result !== 'ok') {
      return sendError(res, '클라우드에서 이미지를 제거할 수 없습니다!');
    }
  }

  await Actor.findByIdAndDelete(actorId);

  res.json({ message: '이미지 제거 완료' });
};

exports.searchActor = async (req, res) => {
  const { query } = req;

  //   ""를 안붙여주면 정중식 폴이라고 쳤는데 정중식이라는 name을 가진 actor도 검색이된다.
  const result = await Actor.find({ $text: { $search: `"${query.name}"` } });

  const actors = result.map((actor) => formatActor(actor));

  res.json(actors);
};

exports.getLatestActors = async (req, res) => {
  // -1은 내림차순, 1 은 올림차순
  const result = await Actor.find().sort({ createdAt: '-1' }).limit(12);

  const actors = result.map((actor) => formatActor(actor));

  res.json(actors);
};

exports.getSingleActor = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) return sendError(res, '잘못된 요청입니다!');

  const actor = await Actor.findById(id);

  if (!actor) return sendError(res, '배우를 찾을 수 없습니다!', 404);

  res.json(formatActor(actor));
};
