const cron = require('node-cron');
const { overpassUpdater } = require('../services/overpassService');

const scheduleOverpassUpdates = (cityName) => {
  cron.schedule(
    '0 0 * * 0',
    async () => {
      console.log(
        `Weekly Overpass data update task for ${cityName} started...`,
      );
      try {
        await overpassUpdater(cityName);
        console.log(
          `Weekly Overpass data update task for ${cityName} completed successfully.`,
        );
      } catch (error) {
        console.error(
          `Error during weekly Overpass update for ${cityName}:`,
          error,
        );
      }
    },
    {
      scheduled: true,
      timezone: 'Europe/Berlin',
    },
  );

  console.log('Overpass data update scheduled for every Sunday 00:00.');
};

module.exports = scheduleOverpassUpdates;
