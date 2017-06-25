const cron = require('node-cron');
const moment = require('moment');
const { main } = require('./dist/booking');
const { getUserLoginDetails } = require('./utils/login');
const { email, password } = getUserLoginDetails();

const { CRON } = process.env;

/**
* Run class booking every 3 minutes
*/
cron.schedule(CRON || '*/3 * * * *', () => {
  console.log(`Running booking at ${moment().format()}`);
  main(email, password);
});
