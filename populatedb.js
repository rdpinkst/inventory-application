#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Category = require('./models/category')
var Item = require('./models/item')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var categories = []
var items = []

function categoryCreate(name, description, cb) {
  categorydetail = {name: name , description: description }
  
  var category = new Category(categorydetail);
       
  category.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category)
  }  );
}

function itemCreate(name, description, category, price, number_in_stock, cb) {
    itemdetail = {
        name: name,
        description: description,
        category: category,
        price: price,
        number_in_stock: number_in_stock,
    };

  var item = new Item(itemdetail);
       
  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Item: ' + item);
    items.push(item)
    cb(null, item);
  }   );
}


function createCategories(cb) {
    async.series([
        function(callback) {
          categoryCreate('Produce', 'Stuff that comes from the earth', callback);
        },
        function(callback) {
          categoryCreate('Deli', 'Lunch meat and fresh items cut and made at store daily', callback);
        },
        function(callback) {
          categoryCreate('Dairy', 'Milk, cheese, yogurt, stuff that comes from cows or goats', callback);
        },
        function(callback) {
          categoryCreate('Meat and Seafood', 'Protein from an animal source', callback);
        },
        function(callback) {
          categoryCreate('Grocery', 'Highly processed food that bad for you', callback);
        },
        function(callback) {
          categoryCreate('Health and Beauty', 'Products that make you look and feel good', callback);
        },
        ],
        // optional callback
        cb);
}


function createItems(cb) {
    async.parallel([
        function(callback) {
          itemCreate('Fuji Apple', 'Highly nutritious snack', categories[0], '0.99/lb', '44', callback);
        },
        function(callback) {
          itemCreate('New York Strip Steak', 'Highly desired cut of meat', categories[3], '14.99/lb', '21', callback);
        },
        function(callback) {
          itemCreate('Honey smoked ham lunchmeat', 'Meat for sandwich', categories[1], '5.99/lb', '14', callback);
        },
        function(callback) {
          itemCreate('Lipstick', 'Change your lips color and make them lush', categories[5], '12', '55', callback);
        },
        function(callback) {
          itemCreate('Full fat milk', 'Good for cereal and getting protein and calcium', categories[2], '4', '77', callback);
        },
        function(callback) {
          itemCreate('Banana', 'Everyones go to fruit snack', categories[0], '0.69/lb', '99', callback);
        },
        function(callback) {
          itemCreate('Lucky Charms', 'Favorite marshmellow cereal', categories[4], '5.99', '25', callback);
        },
        ],
        // optional callback
        cb);
}


async.series([
    createCategories,
    createItems
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Items: '+items);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});




