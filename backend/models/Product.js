const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    index: true
  },
  category: { 
    type: String, 
    required: true,
    index: true
  },
  subcategory: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0,
    index: true
  },
  original_price: { 
    type: Number, 
    required: true,
    min: 0
  },
  description: { 
    type: String, 
    required: true 
  },
  specifications: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  image_url: { 
    type: String, 
    required: true 
  },
  additional_images: [{ type: String }],
  stock_quantity: { 
    type: Number, 
    default: 0,
    min: 0
  },
  brand: { 
    type: String, 
    required: true,
    index: true
  },
  rating: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 5 
  },
  review_count: { 
    type: Number, 
    default: 0,
    min: 0
  },
  tags: [{ type: String }],
  weight: { type: Number },
  dimensions: { type: String },
  color_options: [{ type: String }],
  size_options: [{ type: String }],
  is_featured: { 
    type: Boolean, 
    default: false,
    index: true
  },
  is_active: { 
    type: Boolean, 
    default: true,
    index: true
  },
  discount_percentage: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Text index for search functionality
productSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
  tags: 'text'
});

// Compound indexes for common queries
productSchema.index({ category: 1, is_active: 1 });
productSchema.index({ is_featured: 1, is_active: 1 });
productSchema.index({ price: 1, is_active: 1 });
productSchema.index({ createdAt: -1, is_active: 1 });

// This change prevents the OverwriteModelError by checking if the model already exists
module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);