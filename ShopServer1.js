var express = require('express');
var bodyparser = require('body-parser');
var tedious = require('tedious');
var Dbutils = require('./Dbutils.js');
var Dbutils2 = require('./registered.js');
var sleep = require('system-sleep');
var requ = require('tedious').Request;

var app = express();
var Connection = tedious.Connection;
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

var port = 3000;
app.listen(port);
console.log('Running on port 3000....');

//*******************Connect to SQL Database Azure***********************
var config = {
	userName: 'rosensha',
	password: 'fw3rcYxa',
	server: 'svivot.database.windows.net',
	requestTimeout: 5000,
	options: {encrypt: true, database: 'TheShop'}
};

var con = new Connection(config);

con.on('connect', function(err){
	if(err){
		console.error('error connecting' + err.stack);
	}
	console.log('Connected to Azure!');
});

var con2 = new Connection(config);
con2.on('connect', function(err){
	if(err){
		console.error('error connecting' + err.stack);
	}
	console.log('Connected to Azure!');
});

var con3 = new Connection(config);
	con3.on('connect', function(err){
	if(err){
		console.error('error connecting' + err.stack);
	}
	console.log('Connected to Azure!');
});

var con4 = new Connection(config);
	con4.on('connect', function(err){
	if(err){
		console.error('error connecting' + err.stack);
	}
	console.log('Connected to Azure!');
});

var con5 = new Connection(config);
	con5.on('connect', function(err){
	if(err){
		console.error('error connecting' + err.stack);
	}
	console.log('Connected to Azure!');
});

//*****************************get requests*******************************
app.get('/', function(req, res){//get 5 hottest prods
    console.log('this user is a guest.');
    //grab 5 hottest products from database
    //send back to client 5 hottest products in Json array
    Dbutils.Select(con, top5PopularProductsQuery()).then(function(result){
		res.send(result);
	});
})
app.get('/users', function(req, res){//get 5 newest prods
    Dbutils.Select(con, top5NewProductsQuery()).then(function(result){
    	res.send(result);
	});
})
app.post('/guests/register', function(req, res){//register
    //get the new user's details from request body
    console.log("enetered");
    var regUsername = req.body.username;
    var regPassword = req.body.password;
    var regFirstName = req.body.firstname;
    var regLastName = req.body.lastname;
    var regAddress = req.body.address;
    var regLastLoginDate = req.body.lastlogindate;
    var regCountry = req.body.country;
    var regQ1 = req.body.q1;
    var regA1 = req.body.a1;
	var regCategoryID = req.body.favcategoryid;

    //TO DO: validate details with DB - check if username is already taken. if taken return false.
    //TO DO: add the new user to the database and return a true bool
    //TO DO: if not valid, return false bool
    //TO DO: transfer guest to /login
    Dbutils.Select(con, findClientByUsernameQuery(regUsername))
    	.then(function(result){//check if username already exists.
	    	console.log('^^^^^^^^^^');
	    	console.log("resultlength = "+result.length);
	    	console.log(result);
	    	if(result.length > 0){
	    		console.log("this username already exists.");
				res.send(false);
				return;
			}
			else{
				console.log("this username doesnt exists.");
				var insertQuery = addNewClientQueryA(regUsername, regPassword, regFirstName, regLastName, regAddress, regLastLoginDate, regCountry, regQ1, regA1, regCategoryID);
				Dbutils.Insert(con2, insertQuery)
				.then(function(result2){
					console.log(result2);
					if(result2=="insert successful"){
						res.status(200);
						res.send(true);
					}
					else
						res.send(false);
				})
				.catch(function(error){
					console.log("error2 - " + error);
					res.send(false);
				});
			}
		})
		.catch(function(error){
			console.log(error);
		});
})
app.post('/guests/login', function(req, res){
    var logUsername = req.body.username;
    var logPassword = req.body.password;
    var logDate = req.body.logindate;
    console.log(req.body);
    Dbutils.Select(con, findClientByUsernameQuery(logUsername))
    .then(function(result1){
    	console.log(result1);
    	if(result1[0].Password == logPassword){
    		res.send(true);
    		Dbutils.Update(con2, updateClientsLastLoginDateQueryA(logUsername, logDate))
    		.catch(function(error){
    			console.log(error);
    			res.send(false);
    		});
    	}
    	else
    		res.send(false);
    })
    .catch(function(error){
    	console.log(error);
    	res.send(false);
    });
})
app.post('/users/buyCart', function(req, res){
	var cid = req.body.cid;
	var deliveryDate = req.body.deliverydate;
	Dbutils.Select(con, buyCartQuery1(cid))
		.then(function(result){
			var len = result.length;
			console.log(result);
			var sum = 0;
			result.forEach(function(item){
				console.log("stock: "+item.stockamount+"......amount: "+item.amount);
				console.log(item.stockamount - item.amount);
				if(item.stockamount - item.amount < 0){
					console.log("Not enough in stock.");
					res.send(false);
					res.end();
				}
				sum+=item.priceshekels;
				console.log("sumsum "+sum);
			});
			console.log("print1-- stock is ok, now add order to DB");
			var insCID = result[0].clientid;
			console.log("delDate: " + deliveryDate);
			Dbutils.Insert(con2, buyCartQuery2(insCID, deliveryDate, sum));//add order to orders1
			sleep(1*1000);

			Dbutils2.Select(con3, "SELECT MAX(OID) AS oid FROM orders1", result, function(qTable, par){
				console.log(qTable[0].oid);
				console.log(par);
				//insert products to productsorders1
				par.forEach(function(item){
					console.log("in loop.....");
					var loopCon = new Connection(config);
					loopCon.on('connect', function(err){
						if(err){
							console.error('error connecting' + err.stack);
						}
						console.log('Connected to Azure!');
					});			
					sleep(1000);
					var query = buyCartQuery3(qTable[0].oid, item.pid, item.amount, item.priceshekels, item.priceshekels*3.5);
					var r = new requ(query, function(err, rows){
						if(err){
							console.log(err);
						}
						else{
							console.log(rows + "rrrrrrows added");
						}
					});

					loopCon.execSql(r);	
				});
			})
		})
		//.then(function(result2){
		//	result2.forEach(function(item){
		//		var loopCon2 = new Connection(config);
		//		loopCon2.on('connect', function(err){
		//			if(err){
		//				console.error('error connecting' + err.stack);
		//			}
		//			console.log('Connected to Azure!');
		//		});
		//		var newStock = item.stockamount - item.amount;
		//		Dbutils.Update(loopCon2, buyCartQuery5(item.pid, newStock));
		//	})
		//})
		.then(function(result3){//clear cart
			console.log(result3);
			Dbutils.Delete(con4, buyCartQuery4(cid))
			.then(function(result4){
				console.log(result4);
				if(result4=="delete successful"){
					res.send(true);
				}
				else{
					console.log("should be here..............//");
					res.send(false);
				}
			})
		})
})
//SHOW CART ITEMS SORTED BY SOMETHING
app.get('/users/showCartSortedpName', function(req, res){
	var clientid = req.query.cid;
	Dbutils.Select(con, getCartProducts(clientid))
	.then(function(result){
		console.log(result);
		if(result.length == 0){
			res.send("no items");
		}
		else{
			res.send(result);
		}
	})
	.catch(function(error){
		console.log(error);
		res.send(false);
	})
})
app.get('/users/showCartSortedPopularity', function(req, res){
	var clientid = req.query.cid;
	Dbutils.Select(con, getCartProducts(clientid))
	.then(function(result){
		console.log(result);
		if(result.length == 0){
			res.send("no items");
		}
		else{
			res.send(result);
		}
	})
	.catch(function(error){
		console.log(error);
		res.send(false);
	})
})
//ADD ITEM TO CART
app.get('/users/addItemToCart', function(req, res){
	var pid = req.query.pid;
	var clientid = req.query.cid;
	var amount = req.query.amount;
	var priceShekelsSingle = req.query.priceShekels;
	var priceDollarsSingle = req.query.priceDollars;

	var priceShekels = amount*priceShekelsSingle;
	var priceDollars = amount*priceDollarsSingle;

	Dbutils.Select(con, checkExistsInCartQuery(clientid, pid))
	.then(function(result){
		console.log(result);
		console.log(result.length);
		if(result.length==0){//item doesnt exist in cart
			Dbutils.Insert(con2, addItemToCartQuery(clientid, pid, amount, priceShekels, priceDollars))
			.then(function(result1){
				console.log(result1);
				if(result1=="insert successful"){
					res.send(true);
					res.end();
				}
				else{
					res.send(false);
					res.end();
				}
			})
			.catch(function(error){
				console.log(error);
				res.send(false);
			})
		}
		else{//this item already exists in the cart
			console.log("RESULT[0]----------" + result[0]);
			console.log("RESULT[0]----------" + result);
			var oldAmount = result[0].Amount;
			var oldShekels = result[0].PriceShekels;
			var oldDollars = result[0].PriceDollars;

			var newAmount = Number(oldAmount)+Number(amount);
			var newShekels = oldShekels+priceShekels;
			var newDollars = oldDollars+priceDollars;

			console.log(result);
			console.log(result[0].Amount);
			Dbutils.Update(con2, addExistingItemToCartQuery(clientid, pid, newAmount, newShekels, newDollars))
			.then(function(result2){
				console.log(result2);
				if(result2=="update successful"){
					res.send(true);
					res.end();
				}
				else{
					console.log("This was printed..........");
					res.send(false);
					res.end();
				}
			})
			.catch(function(error){
				console.log("ERROR2");
				console.log(error);
				res.send(false);
			})
		}
	})
})
app.get('/users/removeItemFromCart', function(req, res){
	var pid = req.query.pid;
	var clientid = req.query.cid;
	var amount = req.query.amount;
	var priceShekelsSingle = req.query.priceShekels;
	var priceDollarsSingle = req.query.priceDollars;

	var priceShekels = amount*priceShekelsSingle;
	var priceDollars = amount*priceDollarsSingle;

	Dbutils.Select(con, checkExistsInCartQuery(clientid, pid))
	.then(function(result){
		console.log(result);
		console.log(result.length);
		if(result.length==0){//item doesnt exist in cart
			console.log("cant remove item from cart if it doenst exist");
			res.send(false);
			res.end();
		}
		else{//this item exists in the cart
			var oldAmount = result[0].Amount;
			var oldShekels = result[0].PriceShekels;
			var oldDollars = result[0].PriceDollars;

			var newAmount = Number(oldAmount)-Number(amount);
			var newShekels = oldShekels-priceShekels;
			var newDollars = oldDollars-priceDollars;

			if(Number(oldAmount) <= Number(amount)){//if current amount in cart is less than the amount i want to delete, then delete entry
				Dbutils.Delete(con2, removeProductFromCart(clientid, pid))
				.then(function(result2){
					if(result2=="delete successful"){
						res.send(true);
						res.end();
					}
					else{
						res.send(false);
						res.end();
					}
				})
				.catch(function(error){
					console.log(error);
					res.send(false);
					res.end();
				})				
			}
			else{//we only need to update the amount

				Dbutils.Update(con3, removeSomeAmoutOfProductFromCart(clientid, pid, newAmount, newShekels, newDollars))
				.then(function(result3){
					if(result3=="update successful"){
						res.send(true);
						res.end();
					}
					else{
						res.send(false);
						res.end();
					}
				})
				.catch(function(error){
					console.log(error);
					res.send(false);
					res.end();
				})
			}
		}
	})
})
//get previous orders of client
app.get('/users/showpreviousorders', function(req, res){
	var client_id = req.query.cid;
	Dbutils.Select(con, getPreviousOrdersByClientID(client_id))
	.then(function(result){
		res.send(result);
	});
})
app.get('/filterProductsByCategory', function(req, res){
	var cat_id = req.query.categoryid;
	Dbutils.Select(con, getProductsByCategoryQuery(cat_id))
	.then(function(result){
		res.send(result);
	});
})
app.get('/sortedProductsByCategory', function(req, res){
	Dbutils.Select(con, getProductsSortedByCategoryQuery())
	.then(function(result){
		res.send(result);
	});
})
app.get('/searchProductByName', function(req, res){
	var pname = req.query.pname;
	Dbutils.Select(con, findProductByNameQuery(pname))
	.then(function(result){
		res.send(result);
	});
})
app.get('/getProductDetails', function(req, res){
	var pname = req.query.pname;
	Dbutils.Select(con, findProductByNameQuery(pname))
	.then(function(result){
		res.send(result);
	});
})
app.get('/forgotPassword', function(req, res){//returns all the user's details (with q1, a1, password)
	var client_username = req.query.username;
	Dbutils.Select(con, findClientByUsernameQuery(client_username))
	.then(function(result){
		res.send(result);
	});
})
app.get('/recommendedProducts',function(req,res){
	if (req.query.categoryid!=null){
 		Dbutils.Select(con, getProductsByCategoryQuery(req.query.categoryid))
 		.then(function(allproduct){
			res.send(allproduct);
		});
 	}
	else{
		Dbutils.Select(con, top5PopularProductsQuery()).then(function(allproduct){
			res.send(allproduct);
			});
		}
});

app.post('/users/makeOrder',function(req,res){
	console.log(req.body);
	var productsOfOrder=req.body.products;//sends pids from client
	var clientID=req.body.clientid;
	var orderDate=req.body.orderdate;
	var deliveryDate=req.body.deliverydate;
	var totalprice=req.body.totalprice;
	var totalamount = req.body.TotalAmount;
	console.log(req.body.products);
	console.log(productsOfOrder);
	var oid;

	var mypromise = new Promise(function(resolve, reject){
		console.log('start mypromise');
		var c = 0;
		productsOfOrder.forEach(function(item){ //for each products, check if there's enough in storage
			var loopCon = new Connection(config);
			loopCon.on('connect', function(err){
				console.log('new connection was made.');
				if(err){
					console.error(err.stack);
					reject(err);
				}
				else{
					Dbutils.Select(loopCon, checkStockAmountQuery(item))//if the buyer bought several instances of the same product, calculate the total amount in the client side
					.then(function(result){
						console.log(result);
						var sa = result[0].stockAmount;
						if(sa < totalamount[c]){
							res.send(false).end();//returns false if there is not enough in stock
							console.log("this was printed............... totalamount="+totalamount[c]+" , sa="+sa);
							resolve(false);
							return;
						}
						c++;
						console.log("c = "+ c)
					})
					.catch(function(err){console.log("CAUGHT!"+err);})
				}
			})
		})
		sleep(1.5*1000);
		resolve(true);//means that all the products storage amount are ok
	})
	.then(function(result){
		console.log("second then " + result);
		if(result){
			Dbutils.Insert(con2, addNewOrderQuery(clientID, orderDate, deliveryDate, totalprice))//add new order to DB
			.then(function(result1){//then, add all the bought products to ordersproducts
				console.log(result1);
				if(result1 == "insert successful"){
					Dbutils.Select(con3, addNewOrderQuery2())
					.then(function(result2){
						oid = result2[0].oid;
						var c = 1;
						productsOfOrder.forEach(function(item){
							var loopCon = new Connection(config);
							loopCon.on('connect', function(err){
								console.log('new connection was made.');
								if(err){
									console.error('ERRORCONNECTING' + err.stack);
								}	
								else{
									Dbutils.Insert(loopCon, addNewOrderQuery3(oid, item, /*totalamount[c],*/ totalprice));
								}
							});
						});
					})
				}
			})
			res.send(true);
		}
	});
})





//(1.1) TOP 5 POPULAR PRODUCTS
function top5PopularProductsQuery(){
	return "SELECT TOP 5 * FROM products ORDER BY popularity DESC";
}
//(1.2) get client details by his username
function findClientByUsernameQuery(p_username){
	return "SELECT * FROM clients1 WHERE username='" + p_username + "'";
}
//(1.3) add new client to clients (needs username, password, fav category, country, etc...)
function addNewClientQuery(p_username, p_password, p_firstname, p_lastname, p_address, p_joindate, p_country, p_q1, p_a1, p_categoryid){
	var query = "INSERT INTO clients(username, [password], firstname, lastname, [address], joinDate, country, q1, a1)"
	+ " VALUES('"+p_username+"', '" +p_password+"', '"+p_firstname+"', '"+p_lastname+"', '" + p_address+"', '"+p_joindate+"', '"+p_country+"','"+p_q1+"','"+p_a1+"')";
	return query;
}
function addNewClientQuery2(){
	return "SELECT MAX(clientid) AS cid FROM Clients";
}
function addNewClientQuery3(p_categoryid, cid){
	return "INSERT INTO clientscategories(clientid, categoryid) VALUES ("+cid+", "+p_categoryid+")";
}
//(1.5) get client's password
function getClientsPasswordQuery(p_username){
	return "SELECT [password] FROM clients WHERE username='"+p_username+"'";
}
//(1.7) update client's last login date (joindate by mistake.....)
function updateClientsLastLoginDateQuery(p_username, p_loginDate){
	return "UPDATE clients SET joinDate ='"+p_loginDate+"' WHERE username='"+p_username+"'";
}
//(2.1) select top 5 newest products in last month
function top5NewProductsQuery(){
	
	return "SELECT TOP 5 * FROM products WHERE adddate Between DATEADD(m, -1, GETDATE()) and GETDATE() Order By AddDate Desc";
	// (ORDER BY addDate DESC) AND getdate()-products.addDate>=31 ";
}
//(3.1) get all products under a chosen category
function getProductsByCategoryQuery(p_categoryid){
	var query = "SELECT * FROM products WHERE "+
	"products.categoryid="+p_categoryid;
	return query;
}
function getAllProductsWithCategoryQuery(p_categoryname){
	return "SELECT * FROM products, productscategories WHERE prod"
}
//(4.1) get product by name
function findProductByNameQuery(p_pname){
	return "SELECT * FROM products WHERE pname='" + p_pname + "'";
}
//(4.3) get product by id
function findProductByIDQuery(p_pid){
	return "SELECT * FROM products WHERE pid=" + p_pid;
}
//get product amount storage by id (to check if amount>0)
function checkProductInStorageQuery(p_pid){
	return "SELECT stockamount FROM products WHERE pid=" + p_pid;
}
//get client's question by username
function getClientQuestionQuery(p_username){
	return "SELECT q1 FROM clients WHERE username='" + p_username + "'";
}
//get client's correct answer
function getClientAnswerQuery(p_username){
	return "SELECT a1 FROM clients WHERE username='" + p_username + "'";
}
function getPreviousOrdersByClientID(p_clientid){
	return "SELECT * FROM orders1 WHERE orders1.clientid = "+p_clientid;
}

function getProductsSortedByCategoryQuery(){
	return "SELECT products.pid, pname, priceshekels,pricedollars, popularity, shoesize, adddate, imageurl, stockamount, categories.categoryname"
	+" FROM products, categories WHERE products.categoryid=categories.categoryid"
	+" ORDER BY categoryname ASC";
}
//add new order - also requires pid
function addNewOrderQuery(p_clientid, p_orderDate, p_deliveryDate, p_totalPrice, p_pid){
	var query = "INSERT INTO orders (clientid, orderdate, deliverydate, totalprice) VALUES(p_clientid,p_orderDate,p_deliveryDate,p_totalPrice) "
				+ "COMMIT "
				+ "DECLARE @o_id int SELECT @o_id=MAX(oid) FROM orders "
				+ "INSERT INTO productsorders (pid, oid, totalamount) VALUES('"+p_pid+"', "+p_oid+", "+p_totalPrice+"')";
	return query;
}
function addNewOrderQuery(p_clientid, p_orderDate, p_deliveryDate, p_totalPrice){
	var query = "INSERT INTO orders (clientid, orderdate, deliverydate, totalprice) VALUES("+p_clientid+", '"+p_orderDate+"', '"+p_deliveryDate+"', "+p_totalPrice+")";
	
	return  query;
}
function addNewOrderQuery2(){
	return "SELECT MAX(OID) AS oid FROM orders";
}
function addNewOrderQuery3(p_oid, p_pid, p_totalamount){
	return "INSERT INTO productsorders(pid, oid, totalamount) VALUES ("+p_pid+", "+p_oid+", "+p_totalamount+")";
}
function checkStockAmountQuery(p_pid){
	return "SELECT stockAmount FROM products WHERE pid="+p_pid;
}

////////////////////////////////

function checkExistsInCartQuery(p_cid, p_pid){
	return "SELECT * FROM carts WHERE clientid="+p_cid+" AND pid="+p_pid;
}
function addItemToCartQuery(p_cid, p_pid, p_amount, p_priceShekels, p_priceDollars){
	return "INSERT INTO carts VALUES("+p_cid+", "+p_pid+", "+p_amount+", "+p_priceShekels+", "+p_priceDollars+")";
}
function addExistingItemToCartQuery(p_cid, p_pid, p_amount, p_priceShekels, p_priceDollars){
	return "UPDATE carts SET Amount="+p_amount+", priceShekels="+p_priceShekels+", priceDollars="+p_priceDollars+""
	+"WHERE pid="+p_pid+" AND clientid="+p_cid;
}
function removeProductFromCart(p_cid, p_pid){
	return "DELETE FROM carts WHERE clientid="+p_cid+" AND pid="+p_pid;
}
function removeSomeAmoutOfProductFromCart(p_cid, p_pid, p_amount, p_priceShekels, p_priceDollars){
	return "UPDATE carts SET Amount="+p_amount+", priceShekels="+p_priceShekels+", priceDollars="+p_priceDollars+""
	+"WHERE pid="+p_pid+" AND clientid="+p_cid;
}
function checkStockAmountQuery(p_pid){
	return "SELECT stockAmount FROM products WHERE pid="+p_pid;
}
function getCartProducts(p_cid){
	return "SELECT products.pid, pname, popularity, shoesize, adddate, imageurl, categoryid, stockamount, amount, carts.priceshekels, carts.pricedollars "
			+ " FROM carts, products WHERE carts.clientid="+p_cid+" AND carts.pid=products.pid ORDER BY popularity";
}

function buyCartQuery1(p_cid){
	return "SELECT carts.pid, carts.clientid, carts.amount, stockamount, carts.priceshekels FROM carts, products "
			+" WHERE carts.clientid="+p_cid+" AND carts.pid=products.pid";
}
function buyCartQuery2(p_cid, p_deliveryDate, p_priceShekels){
	return "INSERT INTO orders1 (ClientID, orderdate, deliverydate, totalpriceinshekels) "
		+" VALUES ("+p_cid+", '"+p_deliveryDate+"', GETDATE(), "+p_priceShekels+")";
}

function buyCartQuery3(p_oid, p_pid, p_totalamount, p_tps, p_tpd){
	return "INSERT INTO productsorders1(pid, oid, totalamount, totalpriceshekels, totalpricedollars) VALUES ("+p_pid+", "+p_oid+", "+p_totalamount+", "+p_tps+", "+p_tpd+")";
}
function buyCartQuery4(p_cid){
	return "DELETE FROM carts WHERE clientid="+p_cid;
}
function buyCartQuery5(p_pid, p_newStock){
	return "UPDATE products SET stockamount="+p_newStock+" WHERE pid="+p_pid;
}

function addNewClientQueryA(p_username, p_password, p_firstname, p_lastname, p_address, p_lastlogindate, p_country, p_q1, p_a1, p_categoryid){
	var query = "INSERT INTO clients1(username, [password], firstname, lastname, [address], lastLoginDate, country, q1, a1, categoryid)"
	+ " VALUES('"+p_username+"', '" +p_password+"', '"+p_firstname+"', '"+p_lastname+"', '" + p_address+"', '"+p_lastlogindate+"', '"+p_country+"','"+p_q1+"','"+p_a1+"', "+p_categoryid+")";
	return query;
}




















