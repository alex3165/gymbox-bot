# Gymbox bot

Run this script on a CRON on Linux and never bother yourself waking up at 7am to book your gym classes.

Tested only on node 6.5.0

# How to use

Temporary add a `session.json` file which should look like (Check your cookies of gymbox official website on your browser) :
```
{
  "ASP.NET_SessionId": "awnjktjkkcjt9j12l0231um9",
  "LegendOnlineAffinity": "a00db204d7c840f8751aceb4a6c454cb7b61489e2debf13ebcd49b98e6179ff8",
  "APP_LGD_COOKIE_TEST": true,
  "Responsive": 0
}
```

Create a `classes.json` file to define the classes you want to attend, example of json :

```
{
  "2016-11-24": [
    {
      "className": "Frame Fitness",
      "time": "18:15"
    }
  ],
  "2016-11-27": [
    {
      "className": "Frame Fitness",
      "time": "13:30"
    }
  ]
}
```

Run the script:

```
node index.js -e your_email -p your_password
```
