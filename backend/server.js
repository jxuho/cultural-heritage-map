require('dotenv').config();

require('./models/User');
require('./models/CulturalSite');
require('./models/Review');

const app = require('./app');
const connectDatabase = require('./bootstrap/database');
const runStartupTasks = require('./bootstrap/startupTasks');
const scheduleOverpassUpdates = require('./bootstrap/scheduler');

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;
const currentCity = process.env.CITY_NAME || 'berlin';

const startServer = async () => {
  try {
    await connectDatabase(MONGO_URI);
    console.log('Connected to MongoDB');

    await runStartupTasks(currentCity);
    scheduleOverpassUpdates(currentCity);

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = startServer;
