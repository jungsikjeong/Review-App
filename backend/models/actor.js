const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const actorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    about: {
      type: String,
      trim: true,
      required: true,
    },
    gender: { type: String, trim: true, required: true },
    avatar: {
      type: Object,
      url: String,
      public_id: String,
    },
  },
  { timestamps: true }
);

// 먼저 검색 기능을 쓰기 위해서는 인덱스가 만들어져야한다.
// 내 Post 스키마에서 title, body 를 검색하고 싶다면
// PostSchema.index({ title: 'text', body: 'text' });
// 이런 식으로 스키마를 만드는 코드 맨 마지막에 이렇게 title과 body에 index를 만들어줘야 한다. (mongoose기준이다)
// mongoDB에서는 createIndex 를 쓴다고 한다.
actorSchema.index({ name: 'text' });

module.exports = mongoose.model('Actor', actorSchema);
