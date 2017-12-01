'use strict';

const { book } = require('../dist/booking');
const { writeFile } = require('../dist/utils/rx-fs');
const moment = require('moment');
const fs = require('fs');

console.log('Loading function');

exports.handler = (event, context, callback) => {

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    switch (event.httpMethod) {
        case 'POST':
            const body = JSON.parse(event.body);

            const date = body.date || moment().format('YYYY-MM-DD');
            const className = body.className || 'Frame Fitness';
            const time = body.time || '12:15';

            const res = book(body.email, body.password, date, className, time);
            done(null, res);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};