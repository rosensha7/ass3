var request = require('tedious').Request;

module.exports.Select = function(con, query, extraPar1, callback){
	var qTable = [];
	var properties = [];
	var r = new request(query, function(err, rows){
		if(err){
			console.log(err);
			console.log(query);
			callback(err);
		}
		else{
			console.log(rows + "rows selected");
		}
	});

	r.on('columnMetadata', function(columns){
		columns.forEach(function (column){
			if(column.colName != null){
				properties.push(column.colName);
			}
			else{
				console.log('found no match');
			}
		});
	});
	r.on('row', function(row){
		var item = {};
		for (i=0; i< row.length; i++) {
			item[properties[i]] = row[i].value;
		}
		qTable.push(item);
	});
	r.on('requestCompleted', function(){
		callback(qTable, extraPar1);
	});

	con.execSql(r);
}

module.exports.Insert = function(con, query, callback){

	var r = new request(query, function(err, rows){
		if(err){
			console.log(err);
			//console.log(query);
			callback(err);
		}
		else{
			console.log(rows + "rows added");
			callback("insert successful");
		}
	});

	con.execSql(r);
}

module.exports.Update = function(con, query, callback){

	var r = new request(query, function(err, rows){
		if(err){
			console.log(err);
			//console.log(query);
			callback(err);
		}
		else{
			console.log(rows + "rows updated");
			callback("update successful");
		}
	});

	con.execSql(r);
}

module.exports.Delete = function(con, query, callback){

	var r = new request(query, function(err, rows){
		if(err){
			console.log(err);
			//console.log(query);
			callback(err);
		}
		else{
			console.log(rows + "rows deleted");
			callback("delete successful");
		}
	});

	con.execSql(r);
}
