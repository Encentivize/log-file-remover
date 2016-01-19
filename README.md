# winston-log-remover
A tool to automate removal of logs generated by winston (npm package) after a set amount of time.

This tool requires the npm cron library: [https://www.npmjs.com/package/cron](https://www.npmjs.com/package/cron)

##Install
  - npm install winston-log-remover
##Usage
  - require the library in your code
  - entry point is index.js
  'var winstonLogRemover = require('winston-log-remover');'
  ###To Configure:
  'winstonLogRemover.configure();'
  ###To Use:
  'winstonLogRemover.schedule(config);'
  You can also implicity pass through configuration to the schedule function if saving a configuration json is not ideal.

 ##Config JSON Object
 ###Default object passed into the scheduler unless otherwise specified.
 '''json
	{
		"timeZone": "Africa/Johannesburg", // if you need others, check the moment-timezone npm module
		"logging": {
	        "file": {
	            "folder": "/logs",
	            "retention": {
	                "units": "minutes",
	                "amount": 1
	            }
	        },
	    	"startTheJobAutomatically": false,
	    	"cronTime": "* * * * *"
	    }
	}
 '''
 If startTheJobAutomatically is set to false, remember to call job.start(), assuming job is the variable you set the cron job to.