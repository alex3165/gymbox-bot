const config = require('../config.json');

module.exports = {
  getUserLoginDetails() {
    const emailArg = process.argv.indexOf('-e');
    const passArg = process.argv.indexOf('-p');

    const details = {
      email: emailArg > -1 && process.argv[emailArg + 1],
      password: passArg > -1 && process.argv[passArg + 1]
    };

    if (!details.email) {
      details.email = config.email;
    }

    if (!details.password) {
      details.password = config.password;
    }

    return details;
  }
}
