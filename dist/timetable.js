const moment = require('moment');
const { parser } = require('./timetable-parser');

const dateFormat = 'YYYY-MM-DD';

const extractTimeTable = async (clubLocation, body) => {
  const timetable = await parser(body);
  let lastKey;

  return timetable.reduce((acc, next) => {
    if (typeof next === 'string') {
      const date = moment(next, 'dddd - DD MMMM YYYY');
      if (!date.isValid()) {
        return acc;
      }

      const key = date.format(dateFormat);
      acc[key] = [];
      lastKey = key;
    }

    if (typeof next === 'object' && !next.slot) {
      console.error('Missing slot', next);
    }

    if (typeof next === 'object') {
      acc[lastKey].push({
        id: next.slot,
        className: next.name,
        time: next.time,
        location: clubLocation,
        canBook:
          next.action !== 'Add To Waiting List' ||
          next.action !== 'Past' ||
          next.action !== 'Full'
      });
    }

    return acc;
  }, {});
};

const combineTimeTables = timeTables => {
  return timeTables.reduce((acc, curr) => {
    Object.keys(curr).forEach(date => {
      acc[date] = (acc[date] || []).concat(curr[date]);
    });

    return acc;
  }, {});
};

module.exports = {
  extractTimeTable,
  combineTimeTables,
  dateFormat
};
