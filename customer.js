let inquirer = require('inquirer');
require('dotenv').config();
let mysql = require('mysql');
let startOver= require('./startOver.js');
let start= require('./app');

let env = process.env;

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: env.mySQLPassword,
    database: "bamazon_db"
});
connection.connect(function (err) {
    if (err) throw err;
});

function customerOptions() {
    inquirer.prompt([{
        type: 'confirm',
        message: 'Would You Like To Buy Something?',
        name: 'open'
    }]).then(function (openResponse) {
        if (openResponse.open == false) {
            console.log('Have a good day! Please come back when you want to buy something')
            startOver();
        }
        else {
            console.log
            connection.query(
                'SELECT item_id,product_name,price,quantity,product_sales FROM products', function (err, results) {
                    if (err) throw err;
                    console.log(`Product ID     Product Name        Price`)
                    results.forEach(items => {
                        console.log(`${items.item_id}               ${items.product_name}              $${items.price}`)
                    });
                    inquirer.prompt([{
                        type: 'number',
                        message: 'What Would You Like To Buy? Enter The ID Of The Product',
                        name: 'product'
                    }]).then(function (productChoice) {
                        var productToBuy;
                        for (var i = 0; i < results.length; i++) {
                            if (results[i].item_id == productChoice.product) {
                                productToBuy = results[i];
                            }
                        }
                        inquirer.prompt([{
                            type: 'number',
                            message: `There are ${productToBuy.quantity} ${productToBuy.product_name}s. They are $${productToBuy.price} each. How many of them would you like to buy?`,
                            name: 'productQuantity'
                        }]).then(function (productPurchased) {
                            if (productPurchased.productQuantity < productToBuy.quantity) {
                                let totalCharge = productPurchased.productQuantity * productToBuy.price;
                                let newQuantity = productToBuy.quantity - productPurchased.productQuantity;
                                let salesFigure = parseFloat(totalCharge) + parseFloat(productToBuy.product_sales);
                                console.log(`You have purchased ${productPurchased.productQuantity} ${productToBuy.product_name}s`);
                                console.log(`Your Total Purchase was:$${totalCharge}`);
                                connection.query('UPDATE products SET ? , ? WHERE ?', [
                                    {
                                        quantity: newQuantity
                                    },
                                    {
                                        product_sales: salesFigure
                                    },
                                    {
                                        product_name: productChoice.product
                                    }
                                ],
                                    function (err, results) {
                                        if (err) throw err;
                                    });

                            }
                            else {
                                console.log(`There isn't enough ${productChoice.product}s to buy that many`);
                            }
                            startOver();
                        })
                    })
                }
            )
        }
    })
}

module.exports=customerOptions;