const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  price: { type: Number, required: true },
  original_price: { type: Number, required: true },
  description: { type: String, required: true },
  specifications: { type: Object, default: {} },
  image_url: { type: String, required: true },
  additional_images: [{ type: String }],
  stock_quantity: { type: Number, default: 0 },
  brand: { type: String, required: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  review_count: { type: Number, default: 0 },
  tags: [{ type: String }],
  weight: { type: Number },
  dimensions: { type: String },
  color_options: [{ type: String }],
  size_options: [{ type: String }],
  is_featured: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  discount_percentage: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Index for search functionality
productSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  brand: 'text'
});

module.exports = mongoose.model('Product', productSchema);
