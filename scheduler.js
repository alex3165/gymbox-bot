const cron = require('node-cron');
const moment = require('moment');
const { main } = require('./dist/booking');
const { getUserLoginDetails } = require('./utils/login');
const { email, password } = getUserLoginDetails();

const { CRON } = process.env;

const run = () => {
  console.log('\n');
  console.log('_____________________________________________');
  console.log(`Running booking at ${moment().format()}`);
  main(email, password);
}

/**
* Run everyday at 7am (retry every 5 minutes for 2 hours after 7am)
*/
cron.schedule(CRON || '44 * * * *', () => {

  run();

  // Retry for 2 hours
  let retry = 24;
  const interval = setInterval(() => {
    if (retry > 0) {
      retry--;
      return run();
    }

    clearInterval(interval);
  }, 300000);
});
