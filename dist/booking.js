const moment = require('moment');
const {
  login,
  logout,
  getGymboxTimeTable,
  postBooking,
  getActiveNotices,
  completeBasket,
  confirmPayment
} = require('./requests');

const { extractTimeTable, dateFormat } = require('./timetable');

const filterToBook = (lessons, classes) => {
  
  let classesToBook = Object.keys(classes)
    .filter(date => (
      // Is the class minus 1 days at 7am same or before current date / time
      moment(date)
        .subtract(1, 'day')
        .hour(7)
        .minute(0)
        .second(0)
        .isSameOrBefore(moment()) &&
      // Is the class after current date / time
      moment(date)
        .hour(23)
        .minute(59)
        .second(59)
        .isSameOrAfter(moment())
    ))
    .map(date => (
      lessons[date]
        .find(l =>(
          l.className === classes[date].className
          && l.time === classes[date].time
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

const bookClasses = (lessons) => {
  if (lessons && lessons.length > 0) {
    console.log(`Lessons ready to book: ${lessons.map(l => l.className).join(' ')}`);
    return Promise.all(lessons.map(postBooking));
  }

  throw new Error('No lessons to book today');
};

const main = (email, password, classes) => {
  const classesToFilter = classes || require('../data/classes.json');
  login({ shouldSetCookies: true })
    .then(() => login({ email, password }))
    .then(getGymboxTimeTable)
    .then(extractTimeTable)
    .then(lessons => filterToBook(lessons, classesToFilter))
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
        }

        if (typeof err === 'object' && err.Message) {
          errorMessage = err.Message;
        }

        console.error('Logged out, error: ', errorMessage);
      })
    })
};

const book = (email, password, date, className, time) => {

  console.log(`using email=${email}, password=****, date=${date}, className=${className}, time=${time}`);

  const classesToFilter = {};
  classesToFilter[date] = {};
  classesToFilter[date].className = className;
  classesToFilter[date].time = time;

  main(email, password, classesToFilter);
};

module.exports = {
  main,
  book
};
