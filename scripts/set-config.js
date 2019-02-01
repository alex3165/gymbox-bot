const fs = require('fs')

fs.mkdirSync('./data');

const { GYMBOX_EMAIL, GYMBOX_PASSWORD } = process.env

fs.writeFileSync('./data/config.json', JSON.stringify({ email: GYMBOX_EMAIL, password: GYMBOX_PASSWORD }))
fs.writeFileSync('./data/classes.json', JSON.stringify({}))
