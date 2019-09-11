let inquirer = require('inquirer');
require('dotenv').config();

inquirer.prompt([{
    type: 'list',
    message: 'Are You A Customer, Manager, or Supervisor',
    choices: ['Customer', 'Manager', 'Supervisor'],
    name: 'userType'
}]).then(function (userTypeResponse) {
    if (userTypeResponse.userType === 'Customer') {
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
    }
    else if(userTypeResponse.userType==='Manager'){
        inquirer.prompt([{
            type:'password',
            name:'manPassword',
            message:'Enter The Manager Password'
        }]).then(function(managerEntry){
            if(managerEntry.manPassword===process.env.managerPassword){
                console.log('You Entered the Correct Password');
            }
            else{
                console.log('WRONG PASSWORD!');
            }
        })
    }
    else{
        inquirer.prompt([{
            type:'password',
            name:'supPassword',
            message:'Enter The Supervisor Password'
        }]).then(function(supEntry){
            if(supEntry.supPassword===process.env.supervisorPassword){
                console.log('You Entered The Right Password');
            }
            else{
                console.log('WRONG PASSWORD!');
            }
        })
    }
})