"use strict";

var fl = require('../index.js');
var fileContents = [];
fl(__dirname+'/data.txt',function(lineData,lineNum){
    fileContents.push(lineData);
    console.log(lineNum+':'+lineData+'\n');
},function(err,eventType,totalLineNum){
    if(eventType=='end'){
        //if file read all line to success, "close" event still will emit, so you need distinguish between they
        console.log('read line is done, total '+totalLineNum+' line(s)');
    }
    if(eventType=='close'){
        console.log('read line is closed, read to '+totalLineNum+' line(s)');
    }
    if(eventType=='error'){
        console.log('read file line has an error:'+err.message);
    }
});

//--------

var fileContents2=[];
fl(__dirname+'/data.txt',function(lineData,lineNum){
    var thisFL = this;
    if(lineNum>=5){
        this.close(); //And also has a function is "this.stop()", but it still emit "close" event so you still need listen "close" event, so mustn't listen "stop" event
        return;
    }
    fileContents2.push(lineData);
    console.log(lineNum+':'+lineData+'\n');
},function(err,eventType,totalLineNum){
    if(eventType=='end'){
        //if file read all line to success, "close" event still will emit, so you need distinguish between they
        console.log('read line is done, total '+totalLineNum+' line(s)');
    }
    if(eventType=='close'){
        console.log('read line is closed, read to '+totalLineNum+' line(s)');
    }
    if(eventType=='error'){
        console.log('read file line has an error:'+err.message);
    }
});
