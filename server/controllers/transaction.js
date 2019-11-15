const Transaction = require('../models/transaction');
const Product = require('../models/product');
const User = require('../models/user');
const { checkout } = require('../controllers/cart');


function updateProduct(data) {
  console.log('ini dalam function updateProduct')
  console.log(data)
  return new Promise ((resolve, reject) => {
    Product.findById(data.id)
      .then(product => {
        // console.log('dalam prmise')
        console.log('ini dalam promise')
        console.log(product)
        if(Number(product.stock) >= Number(data.count)) {
          product.stock = Number(product.stock) - Number(data.count)
          return Product.findByIdAndUpdate(data.id, {stock: product.stock}, {new: true})
        } else {
          throw {msg: 'out of stock'}
        }
      })
      .then(product => {
        console.log(product)
        resolve(product);
      })
      .catch(reject)
  })
}
module.exports = {
  // getConfirmTransaction () {
  //   Transaction.find({ UserId: req.loggedUser.id })
  //     .then(transactions => {
  //       transactions.forEach
  //     })
  //   Transaction.find({ confirm: true })
  //     .then(transactions => {
  //       res.status(200).json({ transactions })
  //     })
  //     .catch(next)
  // },
  updateStatusReceived (req, res, next) {
    console.log(req.params.id)
    Transaction.findByIdAndUpdate(req.params.id, {status: true}, {new: true})
      .then(transaction => {
        res.status(200).json({transaction})
      })
      .catch(next)
  },
  updateStatusConfirm (req, res, next) {
    Transaction.findByIdAndUpdate(req.params.id, {confirm: true}, {new: true})
      .then(transaction => {
        res.status(200).json({transaction})
      })
      .catch(next)
  },

  getTransaction (req, res, next) {
    console.log(req.CartId)
    Transaction.findOne({StoreId: req.CartId.UserId.StoreId})
      .populate({
        path: 'CartId',
        model: 'carts',
        populate: {
          path: 'UserId',
          model: 'users',
          // select: 'email username profile_image '
        }
      })
      .then(transaction => {
        console.log(transaction)
        res.status(200).json({transaction})
      })
      .catch(next)
  },
  createTransaction (req, res, next) {
    const Cart = req.CartId;
    console.log(Cart.UserId)
    let totalPayment = 0
    let tempProductId = []
    Cart.product.forEach((el, i) => {
      tempProductId.push({id: el.id, count: el.count})
      totalPayment += Number(el.price) * Number(el.count)
    })
    
    // prosses pengurangan stock
    
    let tempUpdateProduct = []
    setTimeout(() => {
      tempProductId.forEach((el, i) => {
        updateProduct(el)
        .then(data => {
          tempUpdateProduct.push(data)
        })
        .catch(next)
      })
    }, 500);
    
    // prosess membuat transaction
    let tempTrasaction
    let tempCart
    setTimeout(() => {
      if(tempUpdateProduct.length == 0) next({msg: 404, msg: 'no have Cart'})
      else {
        setTimeout(() => {
          Transaction.create({ ProductId: tempUpdateProduct, payment: totalPayment, UserId: req.loggedUser.id })
            .then(transaction => {
              tempTrasaction = transaction
              return checkout(req.loggedUser.id)
            })
            .then((cart) => {
              tempCart = cart
              return User.findByIdAndUpdate(req.loggedUser.id, {$push: {History: tempTrasaction._id}})
            })
            .then(user => {
              res.status(201).json({transaction: tempTrasaction, product: tempUpdateProduct, cart: tempCart, user})
            })
            .catch(next)
        }, 5000);
      }
    }, 1000);
  }
}