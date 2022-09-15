const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  password: { type: String, required: true },
  isVerified: { type: Boolean, required: true, default: false },
});

userSchema.pre('save', async function (next) {
  // isModified에대한것 https://www.inflearn.com/questions/191348
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

userSchema.methods.comparePassword = async function (password) {
  {
    const result = await bcrypt.compare(password, this.password);
    // console.log('result:', result); // output:true
    return result;
  }
};

module.exports = mongoose.model('User', userSchema);
