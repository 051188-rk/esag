const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  selected_color: String,
  selected_size: String,
  price_at_time: {
    type: Number,
    required: true
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  total_amount: {
    type: Number,
    default: 0
  },
  total_items: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.total_amount = this.items.reduce((total, item) => total + (item.price_at_time * item.quantity), 0);
  this.total_items = this.items.reduce((total, item) => total + item.quantity, 0);
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
