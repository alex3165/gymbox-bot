# Gymbox bot

Provide you a complete experience to automate booking of your gymbox classes:
- API: Add class to book
- Scheduler: Cron to run on your server to check class to book everydays at 7am
- Cli: Book a class using command line

## How to make a booking

First you need to add your `email` and `password` into a `config.json`, example:
```
{
  "email": "YOUR_EMAIL_HERE",
  "password": "YOUR_PASSWORD_HERE"
}
```

Secondly you need to add the class you want to book (Create your own client and use the API if you want):
```
{
  "2017-06-21": {
    "className": "Gymnastic Conditioning",
    "time": "12:15"
  }
}
```

### Using the cli

```
node cli.js
```

### Using the scheduler

> Edit cron expression in `scheduler.js` then:

```
node scheduler.js
```

## How to use the API

First you need to add your `email` and `password` into a `config.json`, example:
```
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
