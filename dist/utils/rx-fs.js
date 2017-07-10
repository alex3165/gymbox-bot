const { Observable } = require('rxjs');
const fs = require('fs');

const readfile = (path = '', encoding = 'utf-8') => (
  Observable.create((observer) => {
    fs.readFile(path, encoding, (err, file) => {

      if (err) {
        return observer.error(err);
      }

      observer.next(file);
      observer.complete();
    });
  })
);

const mkdir = (path) => (
  Observable.create((observer) => {
    const complete = (err) => {
      if(err) {
        return observer.error(err);
      }

      observer.next(path);
      observer.complete();
    };

    const checkExistence = (exists) => (
      exists ? complete() : fs.mkdir(path, complete)
    );

    fs.exists(path, checkExistence);
  })
);

const writeFile = (path, file) => {

  const dirs = path.split('/');
  if(dirs[0] === '.') {
    dirs.pop();
  }

  const makeDirsObs = Observable.from(dirs)
    .scan((a, b) => `${a}/${b}`)
    .flatMap(mkdir)
    .onErrorResumeNext(Observable.empty());

  const writeFileObs = Observable.create((observer) => {

    fs.writeFile(path, file, (err, file) => {

      if (err) {
        return observer.error(err);
      }

      observer.next(file);
      observer.complete();
    });
  });

  return makeDirsObs.ignoreElements().concat(writeFileObs);
};

module.exports = {
  readfile,
  writeFile,
  mkdir
};
