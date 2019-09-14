let inquirer = require('inquirer');
require('dotenv').config();
let mysql = require('mysql');

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



function startOver() {
    inquirer.prompt([{
        type: 'confirm',
        message: 'Would you like to do anything else?',
        name: 'customerEnd'
    }]).then(function (customerEndReply) {
        if (customerEndReply.customerEnd == false) {
            connection.end();
        }
        else {
            start();
        }
    })
}

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
            connection.query(
                'SELECT item_id,product_name,price,quantity FROM products', function (err, results) {
                    if (err) throw err;
                    inquirer.prompt([{
                        type: 'list',
                        message: 'What Would You Like To Buy?',
                        choices: function () {
                            let choiceArray = [];
                            results.forEach(item => {
                                choiceArray.push(item.product_name);
                            });
                            return choiceArray;
                        },
                        name: 'product'
                    }]).then(function (productChoice) {
                        var productToBuy;
                        for (var i = 0; i < results.length; i++) {
                            if (results[i].product_name === productChoice.product) {
                                productToBuy = results[i];
                            }
                        }
                        inquirer.prompt([{
                            type: 'number',
                            message: `There are ${productToBuy.quantity} ${productChoice.product}s. They are $${productToBuy.price} each. How many of them would you like to buy?`,
                            name: 'productQuantity'
                        }]).then(function (productPurchased) {
                            if (productPurchased.productQuantity < productToBuy.quantity) {
                                let totalCharge = productPurchased.productQuantity * productToBuy.price;
                                let newQuantity = productToBuy.quantity - productPurchased.productQuantity;
                                console.log(`You have purchased ${productPurchased.productQuantity} ${productChoice.product}s`);
                                console.log(`Your Total Purchase was:$${totalCharge}`)
                                console.log(newQuantity);
                                connection.query('UPDATE products SET ? WHERE ?', [
                                    {
                                        quantity: newQuantity
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
                            console.log(`ID: ${entry.item_id}\nProduct:${entry.product_name}\nPrice:$${entry.price} each\nQuantity:${entry.quantity}`);
                        });
                    })

                    startOver();
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
                            console.log(results);
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
                            department_name:addingProduct.productToAddDepartment,
                            price:addingProduct.productToAddPrice,
                            quantity:addingProduct.productToAddQuantity
                        },
                        function(err,results){
                            if(err) throw err;
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
function supOptions() {
    inquirer.prompt([{
        type: 'password',
        name: 'supPassword',
        message: 'Enter The Supervisor Password'
    }]).then(function (supEntry) {
        if (supEntry.supPassword === env.supervisorPassword) {
            console.log('Welcome To The Supervisor Portal');
            inquirer.prompt([{
                type: 'list',
                choices: ['View Products By Department', 'Create New Department'],
                message: 'What Action Would You Like To Perform?',
                name: 'supMenu'
            }]).then(function (supMenuResponse) {
                if (supMenuResponse.supMenu === 'View Products By Department') {
                    console.log('Displaying Department Information');

                    startOver();
                }
                else {
                    console.log('Creating New Department');

                    startOver();
                }
            })
        }
        else {
            console.log('WRONG PASSWORD!');
            startOver();
        }
    })

}


function start() {
    inquirer.prompt([{
        type: 'list',
        message: 'Are You A Customer, Manager, or Supervisor',
        choices: ['Customer', 'Manager', 'Supervisor', 'Exit'],
        name: 'userType'
    }]).then(function (userTypeResponse) {
        if (userTypeResponse.userType === 'Customer') {
            customerOptions();
        }
        else if (userTypeResponse.userType === 'Manager') {
            managerOptions();
        }
        else if (userTypeResponse.userType === 'Supervisor') {
            supOptions();
        }
        else {
            connection.end();
        }
    })
};

start();