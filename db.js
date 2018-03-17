var debugLog = true;

var dbName = 'pms';

var fs = require('fs');
var path = require('path');
var merge = require('merge');
var mongojs = require('mongojs');
var querystring = require('querystring');

var db = mongojs(dbName);

var aggregations = {};
var transformations = {};

module.exports = {
	
	select:
	
		function(request, response, args) {
			select(args, function(err, nRecords, docs) {
				if(err) sendError(response, err); else sendJson(response, docs, { 'X-Records': nRecords });
			});
		},
		
	insert:
	
		function(request, response, args) {
			var item = '';
			request.setEncoding('utf8');
			request.on('data', function(chunk) { item += chunk; }).on('end', function() {
				insert(args, item, function(err, docs) {
					if(err) sendError(response, err); else sendJson(response, docs, { 'X-Records': Array.isArray(docs) ? docs.length : 1 });
				});
			});
		},
		
	update:
	
		function(request, response, args) {
			var item = '';
			request.setEncoding('utf8');
			request.on('data', function(chunk) { item += chunk; }).on('end', function() {
				update(args, item, function(err, docs) {
					if(err) sendError(response, err); else sendJson(response, docs, { 'X-Records': Array.isArray(docs) ? docs.length : 1 });
				});
			});
		},

	remove:
	
		function(request, response, args) {
			remove(args, function(err, docs) {
				if(err) sendError(response, err); else sendJson(response, docs, { 'X-Records': Array.isArray(docs) ? docs.length : 1 } );
			});
		},

	error:
		
		function(response, errCode, msg = '') {
			sendError(response, { error: msg }, errCode);
		},
		
	checkCredentials:
	
		function(cred, callback) {
			var collection = db.collection('persons');
			collection.find({ email: cred.login, password: cred.password }).toArray(function(err, docs) {
				callback(err || docs.length < 1 ? {} : docs[0]);
			});
		}
		
};

function sendJson(response, obj, extraHeaders) {
  response.writeHead(200, merge({'Content-Type': 'application/json'}, extraHeaders));
  response.end(JSON.stringify(obj));
}

function sendError(response, obj, errCode = 400) {
  response.writeHead(errCode, {'Content-Type': 'application/json'});
  response.end(JSON.stringify(obj));
}

function select(args, callback) {
	if(debugLog) console.log('SELECT( ' + args + ' )');
	try {
		var collection = db.collection(args[0]);
		var query = {};
		if(args[1]) {
			try {
				var requiredId = mongojs.ObjectId(args[1]);
				query = { _id: requiredId };
			} catch(err) {
				var qExpr = args[1].split('=');
				if(qExpr.length == 2) {
					try {
						qExpr[1] = mongojs.ObjectId(qExpr[1]);
					} catch(err) {}
					query[qExpr[0]] = qExpr[1];
				}
			}
		}
		if(!(args[0] in aggregations)) {
			var aggregationFileName = path.normalize('./json/aggregations/' + args[0] + '.json');
			if(fs.existsSync(aggregationFileName)) {
				var content = fs.readFileSync(aggregationFileName);
				aggregations[args[0]] = JSON.parse(content);
			} else {
				aggregations[args[0]] = null;
			}
		}
		var collAggregation = aggregations[args[0]];
		var aggregation = [];
		if(query) {
			aggregation.push({ $match: query });
		}
		if(collAggregation) {
			aggregation = aggregation.concat(collAggregation);
		}
		collection.aggregate(aggregation).toArray(function (err, docs) {
			var nRecords = 0;
			if(docs) {
				nRecords = docs.length;
			}
			callback(err, nRecords, docs);
		});
	} catch(err) { 
		console.log('ERROR: ' + err);
		callback(err, 0, []);
	}
}

function transform(collName, obj) {
	if(!(collName in transformations)) {
		var transformationFileName = path.normalize('./include/transformations/' + collName + '.inc');
		if(fs.existsSync(transformationFileName)) {
			var content = fs.readFileSync(transformationFileName);
			eval('transformations[collName] = ' + content);
		} else {
			transformations[collName] = null;
		}
	}
	var transformation = transformations[collName];
	if(transformation) {
		try {
			obj = transformation(obj);
		} catch(err) {}
	}
	return obj;
}

function insert(args, item, callback) {
	if(debugLog) console.log('INSERT( ' + args + ' ; ' + item + ' )');
	try {
		var collection = db.collection(args[0]);
		var obj;
		if(args[1] == 'json') {
			obj = JSON.parse(item);
		} else {
			obj = querystring.parse(item);
			if(debugLog) console.log('Converting ' + item + ' to ' + JSON.stringify(obj));
		}
		collection.insert(transform(args[0], obj), {'safe': true}, function (err, documents) {
			if(err) {
				callback(err, null);
		    } else {
				callback(null, documents);
			}
		});
	} catch(err) { callback(err, null); }
}

function update(args, item, callback) {
	if(debugLog) console.log('UPDATE( ' + args + ' ; ' + item + ' )');
	try {
		var collection = db.collection(args[0]);
		var query = { _id: mongojs.ObjectId(args[1]) };
		var obj = JSON.parse(item);
		delete obj._id; 
		collection.update(query, transform(args[0], obj), function (err, documents) {
			if(err) {
				callback(err, null);
		    } else {
				callback(null, documents);
			}
		});
	} catch(err) { callback(err, null); }
}

function remove(args, callback) {
	if(debugLog) console.log('DELETE( ' + args + ' )');
	try {
		var collection = db.collection(args[0]);
		var query = { _id: mongojs.ObjectId(args[1])};
		collection.remove(query, function(err, docs) {
			if(err) {
				callback(err, []);
			} else {
				callback(err, docs);
			}
		});
	} catch(err) { callback(err, 0, []); }
}
