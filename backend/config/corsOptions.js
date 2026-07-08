const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://cultural-heritage-map.vercel.app',
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

module.exports = corsOptions;
