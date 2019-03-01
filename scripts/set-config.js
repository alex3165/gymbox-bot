const fs = require('fs');

fs.mkdirSync('./data');

const { GYMBOX_EMAIL, GYMBOX_PASSWORD, ENABLE_DEFAULT } = process.env;

const defaultClass = {
  Tuesday: {
    className: 'OCR Training',
    time: '18:30',
    location: 'Farringdon'
  },
  Saturday: {
    className: 'Bodyweight Bandits',
    time: '11:30',
    location: 'Westfield London'
  }
};

fs.writeFileSync(
  './data/config.json',
  JSON.stringify({ email: GYMBOX_EMAIL, password: GYMBOX_PASSWORD })
);
fs.writeFileSync('./data/classes.json', JSON.stringify({}));
fs.writeFileSync(
  './data/classesByDay.json',
  JSON.stringify(ENABLE_DEFAULT === 'true' ? defaultClass : {})
);
