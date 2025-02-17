const Route = require('express').Router();
const user = require('./user');
const product = require('./product');
const cart = require('./cart');
const store = require('./store');
const transaction = require('./transaction');

Route.use('/users', user);
Route.use('/products', product);
Route.use('/carts', cart);
Route.use('/stores', store);
Route.use('/transactions', transaction)

module.exports = Route;