const mongoose = require('mongoose');

const connectDatabase = (mongoUri) => mongoose.connect(mongoUri);

module.exports = connectDatabase;
