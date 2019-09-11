let inquirer = require('inquirer');


inquirer.prompt([{
    type: 'confirm',
    message: 'Would You Like To Buy Something?',
    name: 'open'
}]).then(function (openResponse) {
    if (openResponse.open == false) {
        console.log('Have a good day! Please come back when you want to buy something')
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
                message: 'How many of ' + productChoice.product + ' would you like to buy?',
                name: 'productQuantity'
            }]).then(function (productPurchased) {
                console.log('You have purchased ' + productPurchased.productQuantity + ' ' + 'of' + ' ' + productChoice.product);
            })
        })
    }
})