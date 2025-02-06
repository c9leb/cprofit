
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