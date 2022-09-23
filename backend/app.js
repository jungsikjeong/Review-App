const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const dotenv = require('dotenv').config();

const userRouter = require('./routes/user');
const actorRouter = require('./routes/actor');
const movieRouter = require('./routes/movie');

const connectDB = require('./db');

const { errorHandler } = require('./middlewares/error');
const { handleNotFound } = require('./utils/helper');
const cors = require('cors');

const PORT = process.env.PORT || 8000;

connectDB();

const app = express();

app.use(cors());
app.use(express.json()); // 서버가 json구문을 받아와줌
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use('/api/user', userRouter);
app.use('/api/actor', actorRouter);
app.use('/api/movie', movieRouter);

app.use('/*', handleNotFound);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Sever started on port ${PORT}`);
});
