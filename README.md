# log-file-remover
A tool to automate removal of generated logs after a set amount of time.
For the commandline and also for inclusion in other node apps.

##Install
  npm install log-file-remover

##Usage
  - require the library in your code
  - entry point is index.js

  I suggest the use of the node async library, to asynchronously schedule the removal of log files.

  ```javascript
  var logRemover = require('log-file-remover');
  logRemover.schedule(config);
  ```

##Commandline


##Config JSON Object
The library will accept a custom config object being passed into the schedule function. If no object is passed through then the default config will be used.

##Default object passed into the scheduler unless otherwise specified.
```json
{
    "timeZone": "Africa/Johannesburg", 
    "logging": {
        "file": {
            "folder": "/logs",
            "retention": {
                "units": "days",
                "amount": 7
            },
            "timeToTake": "mtime"
        },
        "startTheJobAutomatically": false,
        "cronTime": "* * * * *"
    }
}
```

If startTheJobAutomatically is set to false, remember to call job.start(), assuming job is the variable you set the cron job to. Unfortunately, for now this is hard coded to true.

For the timeZone if you need others, check the moment-timezone npm module

timeToTake is the time which will be looked at when deleting logs.	
timeToTake is either mtime, ctime or fileName. The modified time, the created time or a date specified in the file name.
The filename looked at follows this expression: `log-file-name.YYYY-MM-DDTHH` 

Example:
`crash-log.2016-01-13T14`

cronTime uses standard cron input. This allows for more explicit control of the timed settings of the cron Job

##Some Examples of Cron Times:

```javascript
    everySecond: '* * * * * *',
    everyMinute: '* * * * *',
    everyHour: '00 00 * * * *',
    every10Seconds: '*/6 * * * * *',
    midnight: '00 00 00 * *',
    everyDayAtTwoFifteen: '00 15 02 * * *'
```
