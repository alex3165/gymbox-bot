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
  return timeTable.table.tr.reduce((acc, tr) => {

    if (tr.$ && tr.$.class === 'dayHeader') {
      const date = moment(tr.td[0].h5[0].trim(), "dddd - DD MMMM YYYY");
      acc[date.format(dateFormat)] = [];
    }

    if (!tr.$ || tr.$.class === 'altRow') {
      const lastKey = Object.keys(acc).pop();

      acc[lastKey].push({
        id: parseInt(tr.td[5].span[0].a[0].$.rel.split('=')[1]),
        className: tr.td[1].span[0].a[0]._,
        time: tr.td[0].span[0]._,
        canBook: !(tr.td[6] === 'Full' || tr.td[6] === 'Past')
      });
    }

    return acc;

  }, {});
};

const filterClasses

const main = () => {
  GRequest.login(config.email, config.password, cookies)
    .then(GRequest.getGymboxTimeTable.bind(null, gymboxTimeTableUrl, cookies))
    .then(extractTimeTable)
    .then(formatTimeTable)
    .then((res) => {
      console.log(res);
    })
    .catch(err => {
      throw new Error(err);
    })
};

main();
