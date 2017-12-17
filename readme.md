![gif](https://media.giphy.com/media/3oz8xK9ER0CRMAhozK/giphy.gif)

# Gymbox bot

Provide you a complete experience to automate booking of your gymbox classes:
- API: Add class to book
- Scheduler: Cron to run on your server to check class to book everydays at 7am
- Cli: Book a class using command line

## How to make a booking

First you need to add your `email` and `password` into a `./data/config.json`, example:
```json
{
  "email": "YOUR_EMAIL_HERE",
  "password": "YOUR_PASSWORD_HERE"
}
```

Secondly you need to add the class you want to book to either the `./data/classes.json` file, using the date as the key,
or for recurring bookings by adding the class you want to book to the `./data/classesByDay.json` file. Format for 
classes.json is:
```json
{
  "2017-06-21": {
    "className": "Gymnastic Conditioning",
    "time": "12:15"
  }
}
```

Format for classesByDay.json is:
```json
{
  "Monday": {
    "className": "Gymnastic Conditioning",
    "time": "12:15"
  }
}
```

### Using the cli

```
node cli.js -c run
```

### Using the scheduler

> Edit cron expression in `scheduler.js` then:

```
node scheduler.js
```

## How to use the API

First you need to add your `email` and `password` into a `./data/config.json`, example:
```json
{
  "email": "YOUR_EMAIL_HERE",
  "password": "YOUR_PASSWORD_HERE"
}
```

then:
```
node api.js
```

Endpoints:
  - GET: `/api/table`: return the gymbox time table
  - GET: `/api/add`: Add a class to book
    - params: { className: "Name_of_class", time: "HH:mm", date: "YYYY-MM-DD" }
