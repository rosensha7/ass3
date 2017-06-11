var request = require('tedious').Request;

module.exports.Select = function(con, query){

	return new Promise(function (resolve, reject){
		var r = new request(query, function(err, rows){
			if(err){
				console.log(err);
				console.log(query);
				reject(err.message);
			}
			else{
				console.log(rows + "rows selected");
			}
		});	

		var qTable = [];
		var properties = [];

		r.on('columnMetadata', function(columns){
			columns.forEach(function (column){
				if(column.colName != null){
					//console.log(column);
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
			//console.log(qTable);
			resolve(qTable);
		});

		con.execSql(r);
		});
}

module.exports.Insert = function(con, query){

	return new Promise(function (resolve, reject){
		var r = new request(query, function(err, rows){
			if(err){
				console.log(err);
				console.log(query);
				reject(err.message);
			}
			else{
				console.log(rows + "rows added");
				resolve("insert successful");
			}
		});	

		con.execSql(r);
	});

}

module.exports.Update = function(con, query){

	return new Promise(function (resolve, reject){
		var r = new request(query, function(err, rows){
			if(err){
				console.log(err);
				console.log(query);
				reject(err.message);
			}
			else{
				console.log(rows + "rows updated");
				resolve("update successful");
			}
		});	

		con.execSql(r);
	});
}

module.exports.Delete = function(con, query){

	return new Promise(function (resolve, reject){
		var r = new request(query, function(err, rows){
			if(err){
				console.log(err);
				console.log(query);
				reject(err.message);
			}
			else{
				console.log(rows + "rows deleted");
				resolve("delete successful");
			}
		});	

		con.execSql(r);
	});
}

