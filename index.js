const moment = require('moment');
const cheerio = require('cheerio');
const parseString = require('xml2js').parseString;
const GRequest = require('./requests');

const classes = require('./classes.json');
const config = require('./config.json');
const session = require('./session.json');

const cookies = Object.keys(session).map(key => `${key}=${session[key]}`).join('; ');

const gymboxBaseUrl = 'https://gymbox.legendonlineservices.co.uk/enterprise'
const gymboxTimeTableUrl = `${gymboxBaseUrl}/BookingsCentre/MemberTimetable`;

const dateFormat = "YYYY-MM-DD";

const extractTimeTable = (body) => {
  return new Promise((res, reject) => {
    const timeTable = /<table id=\'MemberTimetable\'.*<\/table>/.exec(body)[0];

    parseString(cheerio.load(timeTable).xml(), (err, result) => {
      if(!err) {
        console.log('Extracted time table');
        return res(result);
      }

      return reject(err);
    });
  });
};

const formatTimeTable = (timeTable) => {

  const tt = timeTable.table.tr.reduce((acc, tr) => {
    if (tr.$ && tr.$.class === 'dayHeader') {
      const date = moment(tr.td[0].h5[0].trim(), "dddd - DD MMMM YYYY");
      acc[date.format(dateFormat)] = {};
      return acc;
    }

    if (!tr.$ || tr.$.class === 'altRow') {
      // const lastKey = Object.keys(acc)
      // TODOOOOOOO
      return acc
    }

  }, {});

  // const date = timeTable.table.tr[0].td[0].h5[0].trim();
  // const d = moment(date, "dddd - DD MMMM YYYY");
  // console.log(timeTable.table.tr);
};

const main = () => {
  GRequest.login(config.email, config.password, cookies)
    .then(GRequest.getGymboxTimeTable.bind(null, gymboxTimeTableUrl, cookies))
    .then(extractTimeTable)
    .then(formatTimeTable)
    .catch(err => {
      throw new Error(err);
    })
};

main();
