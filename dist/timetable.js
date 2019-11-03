const moment = require('moment');
const cheerio = require('cheerio');
const parseString = require('xml2js').Parser({ strict: false }).parseString;
const { log } = require('./utils/logger');

const dateFormat = 'YYYY-MM-DD';

const extractTimeTable = (clubLocation, body) => {
  return new Promise((res, reject) => {
    const timeTableArr = /<table id=\'MemberTimetable\'.*<\/table>/.exec(body);
    if (!Array.isArray(timeTableArr) || !timeTableArr.length) {
      return res({});
    }

    const timeTable = timeTableArr[0];

    parseString(cheerio.load(timeTable).xml(), (err, result) => {
      if (!err) {
        log(`Extracted time table for ${clubLocation}`);
        return res(formatTimeTable(clubLocation, result));
      }

      return reject(err);
    });
  });
};

const formatTimeTable = (clubLocation, timeTable) => {
  return timeTable.TABLE.TR.reduce((acc, tr) => {
    if (tr.$ && tr.$.CLASS === 'dayHeader') {
      const date = moment(tr.TD[0].H5[0].trim(), 'dddd - DD MMMM YYYY');
      acc[date.format(dateFormat)] = [];
    }

    if (!tr.$ || tr.$.CLASS === 'altRow') {
      const lastKey = Object.keys(acc).pop();

      acc[lastKey].push({
        id: parseInt(tr.TD[5].SPAN[0].A[0].$.REL.split('=')[1]),
        className: tr.TD[1].SPAN[0].A[0]._,
        time: tr.TD[0].SPAN[0]._,
        location: clubLocation,
        canBook: !(tr.TD[7] === 'Add To Waiting List' || tr.TD[7] === 'Past')
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
