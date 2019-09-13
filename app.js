let inquirer = require('inquirer');
require('dotenv').config();
let mysql = require('mysql');

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "naber2010",
    database: "bamazon_db"
});
connection.connect(function (err) {
    if (err) throw err;
});

let env = process.env;

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
            inquirer.prompt([{
                type: 'list',
                message: 'What Would You Like To Buy?',
                choices: ['item1', 'item2', 'item3', 'item4'],
                name: 'product'
            }]).then(function (productChoice) {
                inquirer.prompt([{
                    type: 'number',
                    message: `How many of ${productChoice.product} would you like to buy?`,
                    name: 'productQuantity'
                }]).then(function (productPurchased) {
                    console.log(`You have purchased ${productPurchased.productQuantity} of ${productChoice.product}`);
                    startOver();
                })
            })
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
                    console.log('Products for Sale');

                    startOver();
                }
                else if (manFirstOption === 'View Low Inventory Items') {
                    console.log('Low Inventory');

                    startOver();
                }
                else if (manFirstOption === 'Add Inventory') {
                    console.log('Add Inventory');

                    startOver();
                }
                else if (manFirstOption === 'Add New Product') {
                    console.log('Add New Products');

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
        choices: ['Customer', 'Manager', 'Supervisor'],
        name: 'userType'
    }]).then(function (userTypeResponse) {
        if (userTypeResponse.userType === 'Customer') {
            customerOptions();
        }
        else if (userTypeResponse.userType === 'Manager') {
            managerOptions();
        }
        else {
            supOptions();
        }
    })
};

start();