const request = require('request');

module.exports = {
  login(email, password, cookies) {
    return new Promise((res, rej) => {
      request.post({
        url: 'https://gymbox.legendonlineservices.co.uk/enterprise/account/login',
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
  getGymboxTimeTable(gymboxTimeTableUrl, cookies) {
    return new Promise((res, rej) => {
      request.get({
        url: gymboxTimeTableUrl,
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
  }
}