"use strict";

var events = require('events');
var util = require('util');
var fs = require('fs');
var stringDecoder = require('string_decoder').StringDecoder;
var lineEnding = /\r?\n|\r(?!\n)/;




var readfileline = function(path,opt){
	
	var self = this;
	events.EventEmitter.call(self);

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
				var theTurnData = decoder.write(data);
				self.emit('data',theTurnData,data);

				if(lineEnding.test(theTurnData)){
					var lines = theTurnData.split(lineEnding);
					self.emit('line',frs.chunk+lines.shift());
					frs.chunk = lines.pop();
					for(var i in lines){
						var row = lines[i];
						self.emit('line',row);
					}
				}else{
					frs.chunk+=theTurnData;
				}
			});
			frs.on('end',function(chunk){
				self.emit('line',frs.chunk);
				self.emit('end');
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
readfileline.prototype.close = function(){
	var self = this;
	self.frs.close();
	return self;
};
util.inherits(readfileline,events.EventEmitter);
// var stream = require('stream');
// util.inherits(readfileline,stream.Readable);

var exports = module.exports = function(path,opt,lineCB,endCB){
	if('function' == typeof opt){
		endCB = lineCB;
		lineCB = opt;
		opt={};
	}
	opt = opt || {};
	lineCB = lineCB || function(){};
	endCB = endCB || function(){};


	var rfl = new readfileline(path,opt);
	var lineNum = -1;

	rfl.on('line',function(lineData){
		lineNum++;
		lineCB.call(rfl,lineNum,lineData);
	});
	rfl.on('error',function(err){
		endCB.call(rfl,err,'error',lineNum+1);
	});
	rfl.on('close',function(err){
		endCB.call(rfl,err,'close',lineNum+1);
	});
	rfl.on('end',function(err){
		endCB.call(rfl,err,'end',lineNum+1);
	});
};



exports.create = function(path,opt){
	return new readfileline(path,opt);
}