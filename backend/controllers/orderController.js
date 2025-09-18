const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    const { shipping_address, payment_method } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock availability
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
    const shipping_fee = subtotal < 500 ? 50 : 0; // Free shipping above ₹500
    const total_amount = subtotal + cod_fee + shipping_fee;

    // Create order items
    const order_items = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image_url: item.product.image_url,
      quantity: item.quantity,
      price: item.price_at_time,
      selected_color: item.selected_color,
      selected_size: item.selected_size
    }));

    // Create order
    const order = new Order({
      user: req.user._id,
      items: order_items,
      shipping_address,
      payment_method,
      subtotal,
      cod_fee,
      shipping_fee,
      total_amount,
      payment_status: 'pending' // Corrected: Always pending initially
    });

    await order.save();

    // Update stock quantities
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock_quantity: -item.quantity } }
      );
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    await order.populate('user', 'name email phone');

    console.log("Order created successfully:", order); // Added for debugging
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

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

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name image_url brand');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order belongs to user
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

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