const express = require('express');
const app = express();
const { Observable } = require('rxjs');
const { pick } = require('ramda');
const {
  login,
  getGymboxTimeTableById,
  getAllClubs
} = require('./dist/requests');
const { extractTimeTable, combineTimeTables } = require('./dist/timetable');
const { createRxMiddleware } = require('./dist/utils/rx-middleware');
const { readfile, writeFile } = require('./dist/utils/rx-fs');
const { log } = require('./dist/utils/logger');

const classesPath = './data/classes.json';
const classesByDayPath = './data/classesByDay.json';

const addClass = (classes, newClass) => {
  const copiedClasses = Object.assign({}, classes);
  const { date } = newClass;

  if (Array.isArray(copiedClasses[date])) {
    copiedClasses[date].push(newClass);
  } else {
    copiedClasses[date] = [newClass];
  }

  return copiedClasses;
};

app.get(
  '/',
  createRxMiddleware(req$ =>
    req$
      .flatMap(() =>
        Observable.combineLatest(
          req$,
          readfile(classesPath),
          readfile(classesByDayPath)
        )
      )
      .flatMap(([req, classes, classesByDay]) => {
        if (!req.query.email || !req.query.password) {
          return Observable.of({
            message: 'Provide email and password query parameters'
          });
        }

        return Observable.fromPromise(
          login({ shouldSetCookies: true }).then(() =>
            login({ email: req.query.email, password: req.query.password })
          )
        ).map(() => {
          return req.query.byDay
            ? JSON.parse(classesByDay)
            : JSON.parse(classes);
        });
      })
  )
);

/**
 * Get the time table
 * params: void
 * return: Object
 */
app.get(
  '/api/table',
  createRxMiddleware(req$ =>
    req$.flatMap(req => {
      if (!req.query.email || !req.query.password) {
        return Observable.of({
          message: 'Provide email and password query parameters'
        });
      }

      return Observable.fromPromise(
        login({ shouldSetCookies: true }).then(() =>
          login({ email: req.query.email, password: req.query.password })
        )
      )
        .flatMap(() => Observable.fromPromise(getAllClubs()))
        .flatMap(res => {
          var clubs = JSON.parse(res);
          const timetables = clubs.map(club =>
            getGymboxTimeTableById(club.Id).then(body =>
              extractTimeTable(club.Name, body)
            )
          );

          return Observable.fromPromise(Promise.all(timetables));
        })
        .map(combineTimeTables)
        .catch(err => {
          console.error("Couldn't get the time table");
          console.error(err);
          return Observable.of({ error: err });
        });
    })
  )
);

/**
 * Add a class to book using the booking script
 * params: { className: "Name_of_class", time: "HH:mm", date: "YYYY-MM-DD" }
 * return: Object | String
 */
app.get(
  '/api/add',
  createRxMiddleware(req$ =>
    req$
      .flatMap(req => {
        if (!req.query.email || !req.query.password) {
          return Observable.of({
            message: 'Provide email and password query parameters'
          });
        }

        return Observable.fromPromise(
          login({ shouldSetCookies: true }).then(() =>
            login({ email: req.query.email, password: req.query.password })
          )
        );
      })
      .flatMap(() => Observable.combineLatest(req$, readfile(classesPath)))
      .flatMap(([req, file]) => {
        const newClass = pick(
          ['className', 'time', 'date', 'location'],
          req.query
        );

        if (Object.keys(newClass).length < 4) {
          throw new Error('Missing parameter');
        }

        const classes = JSON.parse(file);
        const res = addClass(classes, newClass);

        return writeFile(classesPath, JSON.stringify(res));
      })
      .map(() => ({ status: 'Successfuly added class' }))
      .catch(err => {
        console.error("Couldn't add the class");
        console.error(err);
        return Observable.of({ error: err.message });
      })
  )
);

const PORT = 3002;

// Start the app and listen on port 3000
app.listen(PORT, () => {
  log(`
    Listening app on port ${PORT}, endpoints:
      - GET: /api/table: return the gymbox time table
      - Query params:
        - email: Gymbox user email
        - password: Gymbox user password
    
    - GET: /api/add: Add a class to book
      - Query params:
        - email: Gymbox user email
        - password: Gymbox user password
        - className: The name of the class to book
        - time: The time of the class to book, format: HH:mm
        - date: The date of the class to book, format: YYYY-MM-DD
        - location: The gym location of the class to book
  `);
});
