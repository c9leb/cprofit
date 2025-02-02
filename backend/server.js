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

  const today = new Date();
  today.setHours(today.getHours() - 8);
  today.setHours(0, 0, 0, 0);
  let totalRevenue = 0;
  let totalRefunds = 0;
  let totalCosts = 0;
  let totalAdspend = await adspend.getFbAdspend(today);
  console.log('hi');
  const timeOrders = await Order.find({created_at: {$gt: today}});
  for (const order of timeOrders) {
    console.log(order.total);
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

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});