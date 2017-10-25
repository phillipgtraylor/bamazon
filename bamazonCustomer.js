var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});
connection.connect(function(err) {
  if (err) throw err;
  
  start();
});
function validateInput(value) {
	var integer = Number.isInteger(parseFloat(value));
	var sign = Math.sign(value);

	if (integer && (sign === 1)) {
		return true;
	} else {
		return 'Please enter a whole non-zero number.';
	}
}
function start() {
  inquirer
    .prompt({
      name: "browse",
      type: "rawlist",
      message: "Welcome to the shop",
      choices: ["BROWSE", "BE TOO COOL"]
    }).then(function(answer) {
      //if browse show inv if not tell them off
      if (answer.browse.toUpperCase() === "BROWSE") {
        showInventory();
      }
      else {
        beTooCool();
      }
    });
}
//purchase function
function purchase() {
	inquirer.prompt([
{
			type: 'input',
			name: 'ID',
			message: 'enter the ID of the item which you would like to purchase.',
			validate: validateInput,
			filter: Number
},
//qauntity input
{
			type: 'input',
			name: 'quantity',
			message: 'How many do you need?',
			validate: validateInput,
			filter: Number
}
]).then(function(input){
		var item = input.ID;
		var quantity = input.quantity;
		var queryString = 'SELECT * FROM products WHERE ?';
		connection.query(queryString, {ID: item}, function(err, data) {
		if (err) throw err;
		if(data.length === 0){
			console.log('invalid item id. I cannot hear you, please type slower');
			showInventory();
		}else{
			var productData = data[0];
			if (quantity <= productData.stock_quantity) {
					console.log('order placed');
					var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE ID = ' + item;
					connection.query(updateQueryStr, function(err, data) {
						if (err) throw err;

						console.log('The total is $' + productData.price * quantity);
						console.log('thank you for your purchase');
						console.log("\n---------------------------------------------------------------------\n");

						// end connection
						connection.end();
					})
				} else {
					console.log('I do not have enough of that item in stock!!! :[');
					console.log('maybe you go buy something else?');
					console.log("\n---------------------------------------------------------------------\n");

					showInventory();
				}		

			}			
		})
	})
}

//tell off
function beTooCool(){
	console.log("THEN GET OUT OF MY SHOP THIS IS SRS BUZZZINES")
};
//show inventory function
function showInventory() {
	queryString ="SELECT * FROM products";
	connection.query(queryString, function(err, data){
		if(err) throw error;

		console.log('Current Inventory: ');
		var stringOut = '';
		for( var i = 0; i <data.length;i++) {
			stringOut = '';
			stringOut += 'Item ID:' + data[i].ID + '//';
			stringOut += 'Product: ' + data[i].product_name + '//';
			stringOut += 'Department: ' + data[i].department_name + '//';
			stringOut += ' price: ' + data[i].price  + '\n';

			console.log(stringOut)

		}
		console.log('----------------------------------------------');
		//callpurchasefunction
		purchase();
	})
};