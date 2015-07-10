"use strict";
var now = Date.now();
var util = require('util');
var fs = require('fs');
var assert = require('assert')
var fl = require('../index.js');

var fileContent = [];
fl(__dirname+'/data.txt',function(lineData,lineNum){
    fileContent.push(lineData);
},function(err,eventType,lineNum){
    if(eventType=='end'){
        assert.equal(lineNum,28);
        fs.readFile(__dirname+'/data.txt',function(err,data){
            assert.equal(data.toString(),fileContent.join('\n'));
        })
    }
});


fl(__dirname+'/nofile.txt',function(lineData,lineNum){
    
},function(err,eventType,lineNum){
    if(eventType=='error'){
        assert.equal(lineNum,0);
        assert.equal(typeof err,'object');
        assert.equal(err.message,'file/path not exists');
    }
});

var fileContent2 = [];
fl(__dirname+'/data.txt',function(lineData,lineNum,rl){
    
    if(lineNum==5){
        rl.close()
        return;
    }
    fileContent2.push(lineData);

},function(err,eventType,lineNum){

    assert.equal(fileContent2.length,4);
    assert.equal(lineNum,5);

});