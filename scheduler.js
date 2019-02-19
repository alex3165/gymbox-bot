const cron = require('node-cron');
const moment = require('moment');
const momentTz = require('moment-timezone');
const { main } = require('./dist/booking');
const config = require('./data/config.json');

const { getUserLoginDetails } = require('./dist/utils/login');
const { email, password } = getUserLoginDetails(config);

const { CRON } = process.env;

const run = () => {
  console.log('\n');
  console.log('_____________________________________________');
  console.log(`Running booking at ${moment().format()}`);
  main(email, password);
};

const getTimezonedhour = () => {
  const machineHour = momentTz.tz(momentTz.tz.guess()).hour();
  const BSTHour = momentTz.tz('Europe/London').hour();
  return 7 + (machineHour - BSTHour);
};

const finalCron = CRON || `2 ${getTimezonedhour()} * * *`;

console.log(`Running scheduler with Cron: ${finalCron}`);

/**
 * Run everyday at 7am, BST time
 */
cron.schedule(finalCron, run);
