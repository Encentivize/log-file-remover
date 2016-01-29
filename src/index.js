#!/usr/bin/env node
/* jshint node: true */
'use strict';
var fs = require('fs');
var path = require('path');
var program = require('commander');
var pkg = require(path.join(__dirname, '../package.json'));
var CronJob = require('cron').CronJob;
var appRootPath = require('app-root-path');
var moment = require('moment');
var cronTimers = require('./cron-timers.js');

/*configs*/
var startTheJobAutomatically = false; //if false, remember to call job.start(), assuming job is the variable you set the cron job to.
var fileLogPath = null;
var retentionAmount = null;
var retentionUnits = null;
var cronTime = null;
var timezone = null;
var timeToTake = null;
var fileRemovalThreshold = null;

var exposed = {
  schedule: schedule
};

module.exports = exposed;

/*commandline*/
program
    .version(pkg.version)
    .option('-c, --config <configPath>', 'Configuration to use')
    .option('-s, --silent', 'Silent mode, no console logging')
    .parse(process.argv);

if (program.config){
    var configPath = program.config;
    var config = require(appRootPath.resolve(configPath));
    console.log(config);
    schedule(config);
}
else if (program.silent){
    console.warn("Not Yet Implemented");
    //hack TODO: fix later
        if (!DEBUG_MODE_ON) {
        console = console || {};
        console.log = function(){};
    }
}

function help(){
    console.log("log-file-remover");
    console.log("version: %s", pkg.version);
    console.log("\nUsage:");
    console.log("-c --config <configPath> Configuration to use");
    console.log("-s --silent Silent mode, no console logging");
    console.log("-h --help Command usage");
    console.log("\nExample:");
    console.log("log-file-remover --config config.json");
}

function schedule(config, callback) {
    configure(config);
    var job = new CronJob(cronTime, onTick, onComplete, startTheJobAutomatically, timezone);
    console.log('Scheduled the remove old logs job');
    if (callback){
        callback(job, null);
    }
}

function configure(config){
    if(config){
        fileLogPath = appRootPath.resolve(config.logging.file.folder);
        retentionAmount = config.logging.file.retention.amount;
        retentionUnits = config.logging.file.retention.units;
        timezone = config.timeZone;
        cronTime = config.logging.cronTime;
        timeToTake = config.logging.file.timeToTake;
    }
    else{
        config = require('config');
        startTheJobAutomatically = true; //if false, remember to call job.start(), assuming job is the variable you set the cron job to.
        fileLogPath = appRootPath.resolve(config.get('logging.file.folder'));
        retentionAmount = config.get('logging.file.retention.amount');
        retentionUnits = config.get('logging.file.retention.units');
        cronTime = config.get('logging.cronTime');
        timezone = config.get('timeZone');
        timeToTake = config.get('logging.file.timeToTake');
        fileRemovalThreshold = null;
        console.log('remove old logs, using default configuration settings');
    }

    if(!startTheJobAutomatically){
        console.log('cron job will not start automatically. Use job.start() to start the job');
    }

    var today = moment.utc();
    fileRemovalThreshold = moment(today).subtract(retentionAmount, retentionUnits);
    console.log('File Removal Threshold: '+fileRemovalThreshold);
}

function onTick(jobDone) {
    
    fs.readdir(fileLogPath, function (err, files) {
        if (err) {
            console.error("Error reading log files for removal", err);
            return jobDone();
        }
        for (var i = 0; i < files.length; i++){
            checkIfFileNeedsToBeRemoved(files[i]);
        }
    });

    function checkIfFileNeedsToBeRemoved(file) {
        if (file === '.gitignore') {
            console.warn("This is the .gitignore file, won't delete");
        }
        else{
        	var fileDateTimeString = null;
        	var fileDateTime = null;

        	var err = false;
        	if(timeToTake === 'mtime'){
        		fileDateTimeString = fs.statSync(path.join(fileLogPath, file)).mtime.getTime(); //get the last modified date
        		fileDateTime = fileDateTimeString;
        	}
        	else if(timeToTake === 'ctime'){
        		fileDateTimeString = fs.statSync(path.join(fileLogPath, file)).ctime.getTime(); //get the created date
        		fileDateTime = fileDateTimeString;
        	}
        	else if(timeToTake === 'fileName'){
        		fileDateTimeString = file.split(".")[1]; // get the date from the file name
        		fileDateTime = moment(fileDateTimeString, "YYYY-MM-DDTHH");
        	}
        	else{
        		console.error('Incorrect timeToTake specified, please specifiy either mtime or ctime');
        		err = true;
        	}

	        if(!err){
		        if (!fileDateTime || fileDateTime < 1) {
		            console.warn('File (' + file + ') does not have a valid date, ignoring');
		        }
		        else{
		        	if (fileDateTime > fileRemovalThreshold) {
		            	console.info('File (' + file + ') is still valid');
			        }
			        else{
			        	fs.unlink(path.join(fileLogPath, file), function (err) {
				            if (err) {
				                console.error('Error deleting old log file: ', err);
				            }
				            console.info("Successfully deleted log file: " + file);
			        	});
			        }	        
		        }
	        }
        }
    }

    function finishedRemovingOldFiles(err) {
        if (err) {
            console.error(err);
            if (jobDone) {
                return jobDone(err);
            }
        }
        if (jobDone) {
            return jobDone();
        }
    }
}

function onComplete() {
    console.log("Finished removal of old log files");
}
