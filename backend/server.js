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
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'Missing date parameters. Use ?from=YYYY-MM-DD&to=YYYY-MM-DD' });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);

  const daysDifference = (toDate - fromDate) / (1000 * 60 * 60 * 24) + 1;
  const prevToDate = new Date(fromDate);
  prevToDate.setDate(prevToDate.getDate() - 1);
  const prevFromDate = new Date(prevToDate);
  prevFromDate.setDate(prevFromDate.getDate() - daysDifference + 1);

  prevFromDate.setHours(0, 0, 0, 0);
  prevToDate.setHours(23, 59, 59, 999);

  async function calculateMetrics(startDate, endDate) {
    let totalRevenue = 0;
    let totalRefunds = 0;
    let totalCosts = 0;
    let revenues = {};
    let totalAdspend = await adspend.getFbAdspend(startDate, endDate);

    const orders = await Order.find({
      created_at: {
        $gte: startDate,
        $lte: endDate
      }
    });

    for (const order of orders) {
      totalRevenue += order.total;
      const dateKey = order.created_at.toISOString().slice(0, 10);
      revenues[dateKey] = (revenues[dateKey] || 0) + order.total;
      revenues[dateKey] = parseFloat(revenues[dateKey].toFixed(2));
      totalRefunds += order.refundedAmount;
    }
    const sortedRevenues = Object.entries(revenues)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    for (const order of orders) {
      for (const sku of order.products) {
        const product = await Product.findOne({ _id: sku });
        if (product) {
          totalCosts += product.cost;
        }
      }
    }

    return {
      Revenue: (totalRevenue - totalRefunds).toFixed(2),
      Refunds: (totalRefunds).toFixed(2),
      Adspend: totalAdspend,
      COGS: (totalCosts).toFixed(2),
      Profit: (totalRevenue - totalCosts - totalAdspend - totalRefunds).toFixed(2),
      Revenues: sortedRevenues
    };
  }

  const currentMetrics = await calculateMetrics(fromDate, toDate);
  const previousMetrics = await calculateMetrics(prevFromDate, prevToDate);

  res.json({
    currentPeriod: {
      from: fromDate.toISOString().slice(0, 10),
      to: toDate.toISOString().slice(0, 10),
      ...currentMetrics
    },
    previousPeriod: {
      from: prevFromDate.toISOString().slice(0, 10),
      to: prevToDate.toISOString().slice(0, 10),
      ...previousMetrics
    }
  });
});


// app.get('/update', async (req, res) => {

//   update.updateOrderDatebase()
//   update.updateProductDatebase()
//   res.send("Updated.")
// });




/*

WEBHOOKS

*/
app.post('/webhooks/update', async (req, res) => {
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