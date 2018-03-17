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

const { extractTimeTable, dateFormat, combineTimeTables } = require('./timetable');
const classesByDate = require('../data/classes.json');
const classesByDay = require('../data/classesByDay.json');

const filterToBook = (classes, getClassDate) => (lessons) => {
  let classesToBook = Object.keys(classes)
    .filter(key => (
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
    ))
    .map(key => (
      lessons[getClassDate(key).format('YYYY-MM-DD')]
        .find(l =>(
          l.className === classes[key].className
          && l.time === classes[key].time
          && l.location === classes[key].clubName
        ))
    ))
    .filter(Boolean);

    return classesToBook.filter(l => {
      if (!l.canBook) {
        console.log(`Can't book class ${l.className} at ${l.time}`)
        return false
      }

      return true;
    })
};

const filterToBookByDate = filterToBook(classesByDate, key => moment(key))
const filterToBookByDay = filterToBook(classesByDay, key => moment(key, "ddd dddd"))
const filterAllClassesToBook = (lessons) => filterToBookByDate(lessons).concat(filterToBookByDay(lessons))

const bookClasses = (lessons) => {
  if (lessons && lessons.length > 0) {
    console.log(`Lessons ready to book: ${lessons.map(l => l.className).join(' ')}`);
    return Promise.all(lessons.map(postBooking));
  }

  throw new Error('No lessons to book today');
};

const getGymboxTimeTables = (allClubs) => {
  var clubs = JSON.parse(allClubs);
  return Promise.all(clubs.map(
          (club) => getGymboxTimeTableById(club.Id).then((body) => extractTimeTable(club.Name, body))
         ));
}

const main = (email, password) => {
  login({ shouldSetCookies: true })
    .then(() => login({ email, password }))
    .then(getAllClubs)
    .then(getGymboxTimeTables)
    .then(combineTimeTables)
    .then(filterAllClassesToBook)
    .then(bookClasses)
    .then(() => getActiveNotices('https://gymbox.legendonlineservices.co.uk/enterprise/Basket/'))
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
          console.log(err)
        }

        if (typeof err === 'object' && err.Message) {
          errorMessage = err.Message;

        }

        console.error('Logged out, error: ', errorMessage);
      })
    })
};

module.exports = {
  main
};
