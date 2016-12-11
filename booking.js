const moment = require('moment');
const {
  login,
  logout,
  getGymboxTimeTable,
  postBooking,
  completeBasket
} = require('./requests');

const { extractTimeTable, dateFormat } = require('./timetable');

const classes = require('./classes.json');

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

const main = (email, password) => {
  login(email, password)
    .then(getGymboxTimeTable)
    .then(extractTimeTable)
    .then(filterToBook)
    .then(bookClasses)
    .then(completeBasket)
    .then(logout)
    .catch(err => {
      if (err) {
        console.error('Error: ', err);
      }

      logout().then(() => {
        throw new Error(err);
      })
    })
};

module.exports = {
  main
};
