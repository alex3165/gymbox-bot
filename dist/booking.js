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
    .filter(
      key =>
        // Is the class minus 1 days at 7am same or before current date / time
        getClassDate(key)
          .subtract(1, 'day')
          .hour(7)
          .minute(0)
          .second(0)
          .isSameOrBefore(moment()) &&
        // Is the class after current date / time
        getClassDate(key)
          .hour(23)
          .minute(59)
          .second(59)
          .isSameOrAfter(moment())
    )
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

const bookClasses = async lessons => {
  const res = [];
  if (lessons && lessons.length > 0) {
    log(`Booking lesson: ${lessons.map(l => l.className).join(' ')}`);
    for (const lesson of lessons) {
      try {
        const lessonResponse = await postBooking(lesson);
        res.push(lessonResponse);
      } catch (err) {
        console.error(err);
      }
    }
    console.log(res);
    return res;
  }

  throw new Error('No lessons to book today');
};

const getGymboxTimeTables = async allClubs => {
  const clubs = JSON.parse(allClubs);
  const result = [];
  for (const club of clubs) {
    const body = await getGymboxTimeTableById(club.Id, club.Name);
    try {
      const timetable = await extractTimeTable(club.Name, body);
      result.push(timetable);
      console.log(`Extracted timetable for club ${club.Name}`);
    } catch (err) {
      console.log(`Failed extracting timetable for club ${club.Name}`);
      console.error(err);
    }
  }

  return result;
};

const main = (email, password) => {
  login({ shouldSetCookies: true })
    .then(() => login({ email, password }))
    .then(getAllClubs)
    .then(getGymboxTimeTables)
    .then(combineTimeTables)
    .then(filterAllClassesToBook)
    .then(bookClasses)
    .then(async bookedClasses => {
      if (bookedClasses.length) {
        console.log('Booking executed, completing payment');
        const activeNotices = await getActiveNotices(
          'https://gymbox.legendonlineservices.co.uk/enterprise/Basket/'
        );

        const completedBasket = await completeBasket(activeNotices);
        const confirmedPayment = await confirmPayment(completedBasket);
        await logout(confirmedPayment);
      } else {
        console.log('No booking for today, logging out');
      }
    })
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
