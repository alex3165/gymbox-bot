const { getUserLoginDetails } = require('./utils/login');
const { main } = require('./dist/booking');

const { email, password } = getUserLoginDetails();

const command = process.argv.indexOf('-c');

if (command === -1) {
  console.error(`
  Please provide a command to execute:
    - run: Book a class from the classes.json
    - add: Add a class to book to the classes.json (WIP)
  `);

  process.exit(1);
}

const commandValue = process.argv[command + 1];

if (commandValue === 'run') {
  console.log(`Run booking of classes process with email: ${email}`);
  main(email, password);
}

