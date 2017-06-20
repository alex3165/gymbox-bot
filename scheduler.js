const cron = require('node-cron');
const moment = require('moment');
const { main } = require('./dist/booking');
const { getUserLoginDetails } = require('../utils/login');
const { email, password } = getUserLoginDetails();

/**
* Run everyday at 7 am the booking script which is getting the classes to book from classes.json
* and book them accordingly 1 day before
*/
cron.schedule('*/3 * * * *', () => {
  console.log(`Running booking at ${moment().format()}`);
  main(email, password);
});
