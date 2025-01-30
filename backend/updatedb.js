
const Shopify = require('shopify-api-node');
const mongoose = require('mongoose');
const Order = require('./models/order');
const Product = require('./models/product');
require('dotenv').config();
const shopify = new Shopify({
  shopName: process.env.SHOPIFY_STORE_NAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_ADMIN_KEY
});

async function updateOrderDatebase() {
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // start of the day
  today.setDate(1);

  let allOrders = []

  let params = {
    status: 'any',
    limit: 250,
    updated_at_min:today.toISOString(),
  };

  do {
    const orders = await shopify.order.list(params);
    allOrders = allOrders.concat(orders);
    params = orders.nextPageParameters;
  } while (params !== undefined);

  for (const order of allOrders) {
    if ((['refunded', 'partially_refunded', 'cancelled', 'voided'].includes(order.financial_status) && new Date(order.refunds[0].created_at) < today) || new Date(order.created_at) < today && ['paid'].includes(order.financial_status)) {
      continue;
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
  };
}

async function updateProductDatebase() {

  let allProducts = []
  let prodIds = []

  let params = {
    limit: 250,
  };

  do {
    const products = await shopify.product.list(params);
    allProducts = allProducts.concat(products);
    params = products.nextPageParameters;
  } while (params !== undefined);

  for (const product of allProducts) {
    for (const variant of product.variants) {
      prodIds.push(variant.inventory_item_id);
    };
  };

  allProducts = []
  const idGroups = chunkArray(prodIds, 100);  

  for (const idGroup of idGroups) {
    params = {
      limit: 250,
      ids: idGroup.join(','),
    };

    do {
      try {
        const products = await shopify.inventoryItem.list(params);
        allProducts = allProducts.concat(products);
        params = products.nextPageParameters;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 5000));  // Wait for 5 seconds
        continue;  // Retry the request
      }
    } while (params !== undefined);
  }

  for (const product of allProducts) {
    const productData = new Product({
        _id: product.sku,
        cost: product.cost
    });
    await Product.findOneAndUpdate({_id: product.sku}, productData, {upsert:true, new:true}).exec()
  };
}

function chunkArray(array, chunkSize) {
  var index = 0;
  var arrayLength = array.length;
  var tempArray = [];
  
  for (index = 0; index < arrayLength; index += chunkSize) {
    tempArray.push(array.slice(index, index+chunkSize));
  }

  return tempArray;
}

module.exports = { updateOrderDatebase, updateProductDatebase }