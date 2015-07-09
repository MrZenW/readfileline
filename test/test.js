"use strict";
var now = Date.now();
var util = require('util');
var fs = require('fs');
var assert = require('assert')
var fl = require('../index.js');

var fileContent = [];
fl(__dirname+'/data.txt',function(lineNum,lineData){
    fileContent.push(lineData);
},function(err,eventType,lineNum){
    if(eventType=='end'){
        assert.equal(lineNum,28);
        fs.readFile(__dirname+'/data.txt',function(err,data){
            assert.equal(data.toString(),fileContent.join('\n'));
        })
    }
});

fl(__dirname+'/nofile.txt',function(lineNum,lineData){
    
},function(err,eventType,lineNum){
    if(eventType=='error'){
        assert.equal(lineNum,0);
        assert.equal(typeof err,'object');
        assert.equal(err.message,'file/path not exists');
    }
});