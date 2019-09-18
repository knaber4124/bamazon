let inquirer = require('inquirer');
require('dotenv').config();
let mysql = require('mysql');
let startOver = require('./startOver.js');
let start = require('./start');


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

function managerOptions() {
    inquirer.prompt([{
        type: 'password',
        name: 'manPassword',
        message: 'Enter The Manager Password'
    }]).then(function (managerEntry) {
        if (managerEntry.manPassword === env.managerPassword) {
            console.log('Welcome To The Manager Portal');
            inquirer.prompt([{
                type: 'list',
                message: 'What Action Do You Want To Perform?',
                choices: ['View Products For Sale', 'View Low Inventory Items', 'Add Inventory', 'Add New Product'],
                name: 'managerMenu'
            }]).then(function (managerOption) {
                let manFirstOption = managerOption.managerMenu;
                if (manFirstOption === 'View Products For Sale') {
                    connection.query('SELECT item_id,product_name,price,quantity FROM products', function (err, results) {
                        if (err) throw err;
                        results.forEach(entry => {
                            console.log(`\nID: ${entry.item_id}\nProduct:${entry.product_name}\nPrice:$${entry.price} each\nQuantity:${entry.quantity}`);
                        });
                        startOver();
                    })

                }
                else if (manFirstOption === 'View Low Inventory Items') {
                    console.log('These Items Are Low On Inventory');
                    connection.query('SELECT item_id,product_name,quantity FROM products', function (err, results) {
                        if (err) throw err;
                        results.forEach(item => {
                            if (item.quantity < 5) {
                                console.log(`\nID:${item.item_id}\nProduct:${item.product_name}\nQuantity:${item.quantity}`)
                            }
                        })
                        startOver();
                    })
                }
                else if (manFirstOption === 'Add Inventory') {
                    console.log('Add Inventory');
                    connection.query(
                        'SELECT item_id,product_name,quantity FROM products', function (err, results) {
                            if (err) throw err;
                            inquirer.prompt([{
                                type: 'list',
                                message: 'Which Item Do You Want To Buy More Inventory Of?',
                                choices: function () {
                                    let choiceArray = [];
                                    results.forEach(item => {
                                        choiceArray.push(item.product_name);
                                    });
                                    return choiceArray;
                                },
                                name: 'item'
                            }]).then(function (addToInventory) {
                                inquirer.prompt([{
                                    type: 'number',
                                    message: `How Many ${addToInventory.item} Would You Like To Buy?`,
                                    name: 'quantityToBuy'
                                }]).then(function (buyForInventory) {
                                    var productToBuy;
                                    for (var i = 0; i < results.length; i++) {
                                        if (results[i].product_name === addToInventory.item) {
                                            productToBuy = results[i];
                                        }
                                    }
                                    let newQuantity = parseInt(productToBuy.quantity) + parseInt(buyForInventory.quantityToBuy);
                                    console.log(`You Have Purchased ${buyForInventory.quantityToBuy} ${addToInventory.item}s`);
                                    console.log(newQuantity);
                                    connection.query('UPDATE products SET ? WHERE ?', [
                                        {
                                            quantity: newQuantity,
                                        },
                                        {
                                            product_name: addToInventory.item
                                        }
                                    ]), function (err, results) {
                                        if (err) throw err;
                                    }
                                    startOver();
                                })
                            })
                        })
                }
                else if (manFirstOption === 'Add New Product') {
                    console.log('Add New Products');
                    inquirer.prompt([{
                        type: 'input',
                        message: 'What Product Would You Like To Add To Inventory?',
                        name: 'productToAdd'
                    },
                    {
                        type: 'number',
                        message: 'How Many Would You Like To Buy?',
                        name: 'productToAddQuantity'
                    },
                    {
                        type: 'input',
                        message: 'What Department Is This In?',
                        name: 'productToAddDepartment'
                    },
                    {
                        type: 'number',
                        message: 'How Much Will You Charge For This?',
                        name: 'productToAddPrice'
                    }]).then(function (addingProduct) {
                        console.log(`You Added ${addingProduct.productToAddQuantity} ${addingProduct.productToAdd}s to ${addingProduct.productToAddDepartment} at $${addingProduct.productToAddPrice}`);
                        connection.query('INSERT INTO products SET ?',
                            {
                                product_name: addingProduct.productToAdd,
                                department_name: addingProduct.productToAddDepartment,
                                price: addingProduct.productToAddPrice,
                                quantity: addingProduct.productToAddQuantity
                            },
                            function (err, results) {
                                if (err) throw err;
                            })
                        startOver();
                    })

                }
            })

        }
        else {
            console.log('WRONG PASSWORD!');
            startOver();
        }
    })

}


module.exports = managerOptions;