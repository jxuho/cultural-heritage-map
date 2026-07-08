require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');

const AppError = require('./utils/AppError');
const errorController = require('./controllers/errorController');
const apiRoutes = require('./routes');
const corsOptions = require('./config/corsOptions');
const apiLimiter = require('./config/rateLimiter');
const { swaggerUi, swaggerDocument } = require('./config/swagger');
require('./config/passport');

const app = express();

// 서버 앞에 있는 '리버스 프록시 서버' 한개를 신뢰하고, 그 프록시가 넘겨주는 클라이언트의 진짜 정보를 사용하겠다. https문제발생가능
app.set('trust proxy', 1);

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.static(`${__dirname}/public`));
app.use(passport.initialize());
app.use('/api', apiLimiter);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1', apiRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('Message from the server: Server is Running!');
});

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorController);

module.exports = app;
