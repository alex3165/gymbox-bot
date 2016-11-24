const moment = require('moment');
const cheerio = require('cheerio');
const parseString = require('xml2js').parseString;
const {
  login,
  getGymboxTimeTable,
  postBooking
} = require('./requests');

const classes = require('./classes.json');

// process.argv.map(arg => )

const config = require('./config.json');

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

const filterToBook = (lessons) => {
  return Object.keys(classes)
    .filter(date => date === moment().add(1, 'day').format(dateFormat))
    .map(date =>
      classes[date]
        .map(lesson =>
          lessons[date] && lessons[date].find(l =>
            l.className === lesson.className
            && l.time === lesson.time
            && l.canBook
          )
        )
        .filter(Boolean)
    )
    .shift();
};

const bookClasses = (lessons) => {
  if (lessons) {
    console.log('Lessons about to book: ', lessons);
    return Promise.all(lessons.map(postBooking));
  }

  console.log('No lessons to book today');
  return;
}

const main = () => {
  login(config.email, config.password)
    .then(getGymboxTimeTable)
    .then(extractTimeTable)
    .then(formatTimeTable)
    .then(filterToBook)
    .then(bookClasses)
    .catch(err => {
      console.error(err);
      throw new Error(err);
    })
};

main();
