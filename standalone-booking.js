const { main } = require('./booking');
const { getUserLoginDetails } = require('./utils/login');

const { email, password } = getUserLoginDetails();

main(email, password);
