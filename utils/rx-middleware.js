const { Observable } = require('rxjs');
const express = require('express');

const createRxMiddleware = (trigger, successCode = 200) =>
  (req, res, next) => {
  trigger(Observable.of(req))
    .first()
    .finally(next)
    .subscribe(
      x => {
        res.status(successCode).json(x);
      },
      (error) => {
        res.status(500).json(error.message ? error.message : error.toString());
      }
    );
};

module.exports = {
  createRxMiddleware
};
