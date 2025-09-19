const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  image_url: String,
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  selected_color: String,
  selected_size: String
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order_id: {
    type: String,
    unique: true,
  },
  items: [orderItemSchema],
  shipping_address: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  payment_method: {
    type: String,
    enum: ['cod', 'online', 'card'],
    required: true
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  order_status: {
    type: String,
    enum: ['placed', 'confirmed', 'shipped', 'at_warehouse', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed'
  },
  estimated_delivery_date: {
    type: Date
  },
  subtotal: { type: Number, required: true },
  cod_fee: { type: Number, default: 0 },
  shipping_fee: { type: Number, default: 0 },
  total_amount: { type: Number, required: true }
}, {
  timestamps: true
});

// Generate order ID and set estimated delivery
orderSchema.pre('save', function(next) {
  if (!this.order_id) {
    this.order_id = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  if (!this.estimated_delivery_date) {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // Set delivery 7 days from now
    this.estimated_delivery_date = deliveryDate;
  }
  next();
});

// This change prevents the OverwriteModelError
module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);