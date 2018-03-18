const moment = require('moment');
const cheerio = require('cheerio');
const parseString = require('xml2js').parseString;
const dateFormat = 'YYYY-MM-DD';

const extractTimeTable = (clubLocation, body) => {
  return new Promise((res, reject) => {
    const timeTable = /<table id=\'MemberTimetable\'.*<\/table>/.exec(body)[0];

    parseString(cheerio.load(timeTable).xml(), (err, result) => {
      if(!err) {
        console.log(`Extracted time table for ${clubLocation}`);
        return res(formatTimeTable(clubLocation, result));
      }

      return reject(err);
    });
  });
};

const formatTimeTable = (clubLocation, timeTable) => {
  return timeTable.table.tr.reduce((acc, tr) => {
    if (tr.$ && tr.$.class === 'dayHeader') {
      const date = moment(tr.td[0].h5[0].trim(), 'dddd - DD MMMM YYYY');
      acc[date.format(dateFormat)] = [];
    }

    if (!tr.$ || tr.$.class === 'altRow') {
      const lastKey = Object.keys(acc).pop();

      acc[lastKey].push({
        id: parseInt(tr.td[5].span[0].a[0].$.rel.split('=')[1]),
        className: tr.td[1].span[0].a[0]._,
        time: tr.td[0].span[0]._,
        location: clubLocation,
        canBook: !(tr.td[7] === 'Add To Waiting List' || tr.td[7] === 'Past')
      });
    }
    return acc;
  }, {});
};

const combineTimeTables = (timeTables) => 
  timeTables.reduce(function(r, e) {
    return Object.keys(e).forEach(function(k) {
      if(!r[k]) r[k] = [].concat(e[k])
      else r[k] = r[k].concat(e[k])
    }), r
  }, {});

module.exports = {
  extractTimeTable,
  combineTimeTables,
  dateFormat
};