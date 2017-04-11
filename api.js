const express = require('express');
const cron = require('node-cron');
const moment = require('moment');
const app = express();
const { Observable } = require('rxjs');
const { pick } = require('ramda');
const { login, getGymboxTimeTable } = require('./requests');
const { extractTimeTable } = require('./timetable');
const { createRxMiddleware } = require('./utils/rx-middleware');
const { getUserLoginDetails } = require('./utils/login');
const { readfile, writeFile } = require('./utils/rx-fs');
const { main } = require('./booking');

const { email, password } = getUserLoginDetails();

const addClass = (classes, newClass) => {
  const copiedClasses = Object.assign({}, classes);
  const { date } = newClass;

  if (Array.isArray(copiedClasses[date])) {
    copiedClasses[date].push(newClass);
  } else {
    copiedClasses[date] = [newClass];
  }

  return copiedClasses;
}

/**
* Get the time table
* params: void
* return: Object
*/
app.get('/api/table', createRxMiddleware((req$) =>
  req$
    .flatMap(() =>
      Observable
        .fromPromise(login(email, password))
        .flatMap(() => Observable.fromPromise(getGymboxTimeTable()))
        .flatMap(extractTimeTable)
        .catch((err) => {
          console.error('Couldnt get the time table')
          // throw new Error(err);
        })
    )
));

/**
* Add a class to book using the booking script
* params: { className: "Name_of_class", time: "HH:mm", date: "YYYY-MM-DD" }
* return: Object | String
*/
app.get('/api/add', createRxMiddleware((req$) =>
  Observable
    .combineLatest(req$, readfile('./classes.json'))
    .flatMap(([req, file]) => {
      const newClass = pick(['className', 'time', 'date'], req.query);

      if (Object.keys(newClass).length < 3) {
        throw new Error('Missing parameter');
      }

      const classes = JSON.parse(file);
      const res = addClass(classes, newClass);

      return writeFile('./classes.json', JSON.stringify(res));
    })
    .map(() => ({ status: 'Successfuly added class' }))
    .catch((err) => {
      console.error('Couldn\'t add the class');
      // throw new Error(err);
    })
));

// Start the app and listen on port 3000
app.listen(3002);

main(email, password);

/**
* Run everyday at 7 am the booking script which is getting the classes to book from classes.json
* and book them accordingly 1 day before
*/
cron.schedule('*/3 * * * *', () => {
  console.log(`Running booking at ${moment().format()}`);
  main(email, password);
});
