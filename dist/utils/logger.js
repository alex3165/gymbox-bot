const momentTz = require('moment-timezone');

const log = text =>
  console.log(`${momentTz.tz('Europe/London').format()} - ${text}`);

module.exports = {
  log
};
