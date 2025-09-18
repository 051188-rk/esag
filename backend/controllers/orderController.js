const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { shipping_address, payment_method } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock
    for (const item of cart.items) {
      if (item.product.stock_quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.product.name}` 
        });
      }
    }

    // Calculate totals
    const subtotal = cart.total_amount;
    const cod_fee = payment_method === 'cod' ? 25 : 0;
    const shipping_fee = subtotal < 500 ? 50 : 0;
    const total_amount = subtotal + cod_fee + shipping_fee;

    // Create order items from cart
    const order_items = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image_url: item.product.image_url,
      quantity: item.quantity,
      price: item.price_at_time,
      selected_color: item.selected_color,
      selected_size: item.selected_size
    }));

    // Create new order, payment is always 'pending' initially
    const order = new Order({
      user: req.user._id,
      items: order_items,
      shipping_address,
      payment_method,
      payment_status: 'pending',
      subtotal,
      cod_fee,
      shipping_fee,
      total_amount,
    });

    await order.save();

    // Decrease stock quantity for each product
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { 
        $inc: { stock_quantity: -item.quantity } 
      });
    }

    // Clear user's cart if payment is COD
    if (payment_method === 'cod') {
      cart.items = [];
      await cart.save();
    }
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
};

// Confirm dummy payment
exports.confirmPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.payment_status = 'paid';
    await order.save();

    // Clear cart after successful online payment
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    
    res.json(order);
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel an order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if order is cancellable
    if (['shipped', 'delivered', 'cancelled'].includes(order.order_status)) {
      return res.status(400).json({ message: `Cannot cancel an order that is already ${order.order_status}` });
    }

    order.order_status = 'cancelled';
    await order.save();

    // Restock items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock_quantity: item.quantity }
      });
    }

    res.json(order);
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all orders for a user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name image_url');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('user', 'name email phone')
      .populate('items.product', 'name image_url brand');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (for admins)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { order_status: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
