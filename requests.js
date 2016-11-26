const request = require('request');
const session = require('./session.json');

const cookies = Object.keys(session).map(key => `${key}=${session[key]}`).join('; ');

const baseUrl = 'https://gymbox.legendonlineservices.co.uk/enterprise'
const loginUrl = `${baseUrl}/account/login`;
const timeTableUrl = `${baseUrl}/BookingsCentre/MemberTimetable`;
const bookClassUrl = `${baseUrl}/BookingsCentre/AddBooking`;
const completeBasketUrl = `${baseUrl}/Basket/Pay`;

module.exports = {
  login(email, password) {
    return new Promise((res, rej) => {
      request.post({
        url: loginUrl,
        headers: {
          'Cookie': cookies,
        },
        formData: {
          'login.Email': email,
          'login.Password': password
        }
      }, (err, _, body) => {
        if (!err && _.statusCode === 302) {
          console.log('Login succeed code: ', _.statusCode);
          return res();
        }

        return rej(err);
      });
    });
  },
  getGymboxTimeTable() {
    return new Promise((res, rej) => {
      request.get({
        url: timeTableUrl,
        headers: {
          'Cookie': cookies
        }
      }, (err, _, body) => {
        if (!err) {
          console.log('Fetched time table');
          return res(body);
        }

        return rej(err);
      });
    });
  },
  postBooking(lesson) {
    const params = ['booking', lesson.id];

    return new Promise((res, rej) => {
      request.get({
        url: `${bookClassUrl}?${params.join('=')}`,
        headers: {
          'Cookie': cookies
        }
      }, (err, _, body) => {
        if (!err && body.success) {
          console.log(`Booked class ${lesson.className} at ${lesson.time}`);
          return res(body);
        }

        return rej(err || body);
      });
    });
  },
  completeBasket() {
    return new Promise((res, rej) => {
      request.get({
        url: completeBasketUrl,
        headers: {
          'Cookie': cookies
        }
      }, (err, _, body) => {
        if (!err && _.statusCode === 302) {
          console.log('Payment succeed: ', body);
          return res();
        }

        return rej(err);
      });
    });
  }
}