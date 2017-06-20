const { getUserLoginDetails } = require('./utils/login');
const { main } = require('./dist/booking');

const { email, password } = getUserLoginDetails();

main(email, password);
