const moment = require('moment');
const {
  login,
  logout,
  getGymboxTimeTable,
  getGymboxTimeTableById,
  getAllClubs,
  postBooking,
  getActiveNotices,
  completeBasket,
  confirmPayment
} = require('./requests');

const { extractTimeTable, combineTimeTables } = require('./timetable');
const classesByDate = require('../data/classes.json');
const classesByDay = require('../data/classesByDay.json');
const { log } = require('./utils/logger');

const filterToBook = (classes, getClassDate) => lessons => {
  let classesToBook = Object.keys(classes)
    .filter(key => {
      // Is the class tomorrow
      return getClassDate(key)
        .subtract(1, 'day')
        .isSame(moment(), 'day');
    })
    .map(key =>
      lessons[getClassDate(key).format('YYYY-MM-DD')].find(
        l =>
          l.className === classes[key].className &&
          l.time === classes[key].time &&
          l.location === classes[key].location
      )
    )
    .filter(Boolean);

  return classesToBook.filter(l => {
    if (!l.canBook) {
      log(`Can't book class ${l.className} at ${l.time}`);
      return false;
    }

    return true;
  });
};

const filterToBookByDate = filterToBook(classesByDate, key => moment(key));
const filterToBookByDay = filterToBook(classesByDay, key =>
  moment(key, 'ddd dddd')
);

const filterAllClassesToBook = lessons => {
  const bookByDay = filterToBookByDay(lessons);
  const bookByDate = filterToBookByDate(lessons);
  return [].concat(bookByDate, bookByDay);
};

const bookClasses = lessons => {
  if (lessons && lessons.length > 0) {
    log(`Lessons ready to book: ${lessons.map(l => l.className).join(' ')}`);
    return Promise.all(lessons.map(postBooking));
  }

  throw new Error('No lessons to book today');
};

const getGymboxTimeTables = allClubs => {
  var clubs = JSON.parse(allClubs);
  return Promise.all(
    clubs.map(club =>
      getGymboxTimeTableById(club.Id).then(body =>
        extractTimeTable(club.Name, body)
      )
    )
  );
};

const main = (email, password) => {
  login({ shouldSetCookies: true })
    .then(() => login({ email, password }))
    .then(getAllClubs)
    .then(getGymboxTimeTables)
    .then(combineTimeTables)
    .then(data => filterAllClassesToBook(data))
    .then(bookClasses)
    .then(() =>
      getActiveNotices(
        'https://gymbox.legendonlineservices.co.uk/enterprise/Basket/'
      )
    )
    .then(completeBasket)
    .then(confirmPayment)
    .then(logout)
    .catch(err => {
      logout().then(() => {
        let errorMessage;

        if (typeof err === 'string') {
          errorMessage = err;
        }

        if (err instanceof Error) {
          errorMessage = err.message;
          log(err);
        }

        if (typeof err === 'object' && err.Message) {
          errorMessage = err.Message;
        }

        log('Logged out, error: ', errorMessage);
      });
    });
};

module.exports = {
  main
};
