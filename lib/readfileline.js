/**
 * User:    zenboss
 * GitHub:  zenboss
 * Email:   zenyes@gmail.com
 * Version: 2.0
 */
"use strict";

var events = require('events');
var util = require('util');
var fs = require('fs');
var stringDecoder = require('string_decoder').StringDecoder;
var lineEnding = /\r?\n|\r(?!\n)/;




var readfileline = function(path,opt){
    
    var self = this;
    events.EventEmitter.call(self);
    self.readLineIsStop = false;
    self.chunk = '';

    opt = opt||{};
    fs.exists(path,function(isExists){
        if(isExists){
            var frs = self.frs = fs.createReadStream(path,{
                flags: 'r',
                autoClose: true
            });

            frs.chunk = '';
            var decoder = new stringDecoder(opt.encoding||'utf8');
            frs.on('data',function(data){
                if(!!self.readLineIsStop)return;
                var theTurnData = decoder.write(data);
                self.emit('data',theTurnData,data);

                if(lineEnding.test(theTurnData)){
                    var lines = theTurnData.split(lineEnding);
                    self.emit('line',self.chunk+lines.shift());
                    self.chunk = lines.pop();
                    for(var i in lines){
                        if(!!self.readLineIsStop)break;
                        var row = lines[i];
                        self.emit('line',row);
                    }
                }else{
                    self.chunk+=theTurnData;
                }
            });
            frs.on('end',function(chunk){
                if(!self.readLineIsStop){ // node v0.10 0.9 0.8 ... has a bug, this "if" fix the bug
                    self.emit('line',self.chunk);
                    self.emit('end');
                }

            })
            frs.on('readable',function(data,more){
                self.emit('readable',data,more);
            })
            frs.on('close',function(data,more){
                self.emit('close',data,more);
            })
            frs.on('error',function(data,more){
                self.emit('error',data,more);
            })
        }else{
            self.emit('error',new Error('file/path not exists'));
        }
    });

}

util.inherits(readfileline,events.EventEmitter);
readfileline.prototype.close = readfileline.prototype.stop = function(){
    var self = this;

    if(!self.readLineIsStop){
        if(!!self.frs.close)self.frs.close();
    }
    self.readLineIsStop = true;
    return self;
}

var exports = module.exports = function(path,lineCB,endCB,opt){

    opt = opt || {};
    lineCB = lineCB || function(){};
    endCB = endCB || function(){};


    var rfl = new readfileline(path,opt);

    var lineNum = 0;

    rfl.on('line',function(lineData){
        lineNum++;
        lineCB.call(rfl,lineData,lineNum,rfl);
    });
    rfl.on('error',function(err){
        endCB.call(rfl,err,'error',lineNum,rfl);
    });
    rfl.on('close',function(err){
        endCB.call(rfl,err,'close',lineNum,rfl);
    });
    rfl.on('end',function(err){
        endCB.call(rfl,err,'end',lineNum,rfl);
    });
};


exports.create = function(path,opt){
    return new readfileline(path,opt);
}