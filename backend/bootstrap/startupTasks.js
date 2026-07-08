const { loadCityBoundary } = require('../utils/locationUtils');
const seedIfEmpty = require('../utils/seedIfEmpty');
const migrateDistricts = require('../scripts/migrateDistricts');

const runStartupTasks = async (cityName) => {
  if (process.env.NODE_ENV !== 'production') {
    const isSeeded = await seedIfEmpty();
    if (isSeeded) {
      console.log('Starting District Migration Check...');
      await migrateDistricts();
    }
  }

  try {
    loadCityBoundary(cityName);
    console.log(`${cityName.toUpperCase()} boundary data loaded successfully.`);
  } catch (error) {
    console.error(`Failed to load ${cityName} boundary data:`, error);
  }
};

module.exports = runStartupTasks;
