const express = require('express');
const app = express();
const { Observable } = require('rxjs');
const { pick } = require('ramda');
const { login, getGymboxTimeTable } = require('./dist/requests');
const { extractTimeTable } = require('./dist/timetable');
const { createRxMiddleware } = require('./utils/rx-middleware');
const { readfile, writeFile } = require('./utils/rx-fs');

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
