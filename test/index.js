var fs = require('fs');
var util = require('util');
var fn = require('hactarjs');
var CronJob = require('cron').CronJob;

/*js to test*/
var logFileRemover = require('../src/index.js');

/*config*/
var config = {
	"timeZone": "Africa/Johannesburg",
	"logging": {
        "file": {
            "folder": "/logs",
            "retention": {
                "units": "hours",
                "amount": 7
            },
            "timeToTake": "mtime"
        },
    	"startTheJobAutomatically": true,
    	"cronTime": "* * * * * *"   
    }
};

//run every second!!!
generateFakeLogFiles('logs/fakeLogFile', 6);
logFileRemover.schedule(config);

function generateFakeLogFiles(filePath, numberToGenerate){
	for (var i = 0; i < numberToGenerate; i++){
		generateFakeLog(filePath+'.log'+i);
	}
}

function generateFakeLog(filePath){
	var exampleData = {
		exception: "An error has occurred.",
		errorCode: Math.random() * (1000 - 1) + 1,
		innerException: "A deeper error philosophy has occurred."
	};
	fn.saveFile(exampleData, filePath);
}
