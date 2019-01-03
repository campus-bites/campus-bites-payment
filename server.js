if (process.env.NODE_ENV !== 'production') {

  require('dotenv').load()

}



const stripeSecretKey = process.env.STRIPE_SECRET_KEY

const stripePublicKey = process.env.STRIPE_PUBLIC_KEY



const express = require('express')

const app = express()

const fs = require('fs')

const stripe = require('stripe')(stripeSecretKey)



app.set('view engine', 'ejs')

app.use(express.json())

app.use(express.static('public'))



app.get('/store', function(req, res) {

  fs.readFile('items.json', function(error, data) {

    if (error) {

      res.status(500).end()

    } else {

      res.render('store.ejs', {

        stripePublicKey: stripePublicKey,

        items: JSON.parse(data)

      })

    }

  })

})



app.post('/purchase', function(req, res) {

  fs.readFile('items.json', function(error, data) {

    if (error) {

      res.status(500).end()

    } else {

      const itemsJson = JSON.parse(data)

      const itemsArray = itemsJson.food.concat(itemsJson.starbucks)

      let total = 0

      req.body.items.forEach(function(item) {

        const itemJson = itemsArray.find(function(i) {

          return i.id == item.id

        })

        total = total + itemJson.price * item.quantity

      })

      var emailBruh = req.body.emailBruh
      var tokenBruh = req.body.stripeToken
      var addressBruh = req.body.addressBruh
      var customerAddressName = req.body.customerAddressName
      var customerAddressLine1 = req.body.customerAddressLine1
      var customerAddressZIP = req.body.customerAddressZIP

      stripe.customers.create({
        source: tokenBruh,
        email: emailBruh,
        // shipping: customerAddressName
        // SHIPPING IS MESSED UP, WILL FIX LATER
      })

      stripe.charges.create({

        amount: total,

        source: req.body.stripeTokenId,

        currency: 'gbp',

        receipt_email: emailBruh

      }).then(function() {

        console.log('Charge Successful')
        res.json({ message: 'Successfully purchased items' })

      }).catch(function() {

        console.log('Charge Fail')

        res.status(500).end()

      })

    }

  })

})



app.listen(8082)