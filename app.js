let inquirer = require('inquirer');
require('dotenv').config();
let mysql = require('mysql');
let start = require('./start')

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



start();
