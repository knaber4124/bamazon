let inquirer = require('inquirer');
require('dotenv').config();
let mysql = require('mysql');
let customerOptions = require('./customer.js');
let managerOptions = require('./manager.js');

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


function start() {
    inquirer.prompt([{
        type: 'list',
        message: 'Are You A Customer or Manager',
        choices: ['Customer', 'Manager', 'Exit'],
        name: 'userType'
    }]).then(function (userTypeResponse) {
        if (userTypeResponse.userType === 'Customer') {
            customerOptions();
        }
        else if (userTypeResponse.userType === 'Manager') {
            managerOptions();
        }
        else {
            connection.end();
        }
    })
};
module.exports = start;
start();

