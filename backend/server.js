const express = require('express');
const app = express();
const mongoose = require('mongoose');
const adspend = require('./facebook-adspend');
const update = require('./updatedb');
const Order = require('./models/order');
const Product = require('./models/product');
const cors = require('cors');
app.use(express.json());
app.use(cors());
//for fronted number update, make the numbers soft flash like coinbase, stock number changing

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
}

app.get('/', async (req, res) => {

  console.log('hi');
  const today = new Date();
  today.setHours(today.getHours() - 8);
  today.setHours(0, 0, 0, 0);
  let totalRevenue = 0;
  let totalRefunds = 0;
  let totalCosts = 0;
  let totalAdspend = await adspend.getFbAdspend(today);
  const timeOrders = await Order.find({created_at: {$gt: today}});
  for (const order of timeOrders) {
    totalRevenue += order.total;
    totalRefunds += order.refundedAmount;
  }
  for (const order of timeOrders) {
    const products = order.products;
    for (const sku of products) {
      const product = await Product.findOne({_id: sku});
      if (product) {
        totalCosts += product.cost;
      }
    }
  }
  res.json({
            Date: today.toISOString().slice(0, 10),
            Revenue: (totalRevenue-totalRefunds).toFixed(2),
            Refunds: (totalRefunds).toFixed(2),
            Adspend: totalAdspend,
            COGS: totalCosts.toFixed(2),
            Profit: (totalRevenue-totalCosts-totalAdspend-totalRefunds).toFixed(2)
          });
});

app.get('/update', async (req, res) => {

  update.updateOrderDatebase()
  update.updateProductDatebase()
  res.send("Updated.")
});




/*

WEBHOOKS

*/
app.post('/webhooks/update', async (req, res) => {
  console.log('a');
  console.log(req.body);
  const order = req.body;
  const today = new Date();
  today.setHours(today.getHours() - 1);

  if (new Date(order.created_at) < today && ['paid'].includes(order.financial_status)) {
    return res.sendStatus(200);
  }
  
  const refProducts = []
  let refunded = 0

  if (['refunded', 'partially_refunded', 'cancelled', 'voided'].includes(order.financial_status)) {
    for (const refund of order.refunds) {
      for (const transaction of refund.transactions) {
        refunded += parseFloat(transaction.amount);
      };
      for (const product of refund.refund_line_items) {
        refProducts.push(product.line_item.sku);
      };
    };
  }

  const orderData = new Order({
    _id: order.name,
    created_at: new Date(order.created_at), 
    total: parseFloat(order.total_price).toFixed(2),
    products: order.line_items.map(product => product.sku),
    refundedProducts: refProducts,
    refundedAmount: refunded,
    financialStatus: order.financial_status
  });

  await Order.findOneAndUpdate({_id: order.name}, orderData, {upsert:true, new:true}).exec()
  res.sendStatus(200);
});

app.post('/webhooks/product', async (req, res) => {
    const product = req.body;
    const today = new Date();
    today.setHours(today.getHours() - 1);

    if (new Date(product.created_at) < today) {
        return res.sendStatus(200);
    }

    const orderData = new Order({
        _id: order.name,
        created_at: new Date(order.created_at), 
        total: parseFloat(order.total_price).toFixed(2),
        products: order.line_items.map(product => product.sku),
        refundedProducts: refProducts,
        refundedAmount: refunded,
        financialStatus: order.financial_status
    });

    await Order.findOneAndUpdate({_id: order.name}, orderData, {upsert:true, new:true}).exec()
    res.sendStatus(200);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});