const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  price: { type: Number, required: true },
  original_price: { type: Number, required: true },
  description: { type: String, required: true },
  specifications: { type: Object, default: {} },
  image_url: { type: String, required: true },
  stock_quantity: { type: Number, default: 0 },
  brand: { type: String, required: true },
  rating: { type: Number, default: 0 },
  review_count: { type: Number, default: 0 },
  tags: [{ type: String }],
  weight: { type: Number },
  dimensions: { type: String },
  color_options: [{ type: String }],
  size_options: [{ type: String }],
  is_featured: { type: Boolean, default: false },
  created_date: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const importData = async () => {
  try {
    const products = [];
    
    fs.createReadStream('./dummy_products.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Parse JSON fields
        let specifications = {};
        let tags = [];
        let color_options = [];
        let size_options = [];
        
        try {
          specifications = JSON.parse(row.specifications || '{}');
        } catch (e) {
          specifications = {};
        }
        
        if (row.tags) tags = row.tags.split(',').map(tag => tag.trim());
        if (row.color_options) color_options = row.color_options.split(',').map(color => color.trim());
        if (row.size_options) size_options = row.size_options.split(',').map(size => size.trim());
        
        products.push({
          name: row.name,
          category: row.category,
          subcategory: row.subcategory,
          price: parseFloat(row.price),
          original_price: parseFloat(row.original_price),
          description: row.description,
          specifications,
          image_url: row.image_url,
          stock_quantity: parseInt(row.stock_quantity),
          brand: row.brand,
          rating: parseFloat(row.rating),
          review_count: parseInt(row.review_count),
          tags,
          weight: parseFloat(row.weight),
          dimensions: row.dimensions,
          color_options,
          size_options,
          is_featured: row.is_featured === 'true',
          created_date: new Date(row.created_date)
        });
      })
      .on('end', async () => {
        console.log(`Parsed ${products.length} products from CSV`);
        
        // Insert products in batches
        const batchSize = 100;
        for (let i = 0; i < products.length; i += batchSize) {
          const batch = products.slice(i, i + batchSize);
          await Product.insertMany(batch);
          console.log(`Inserted batch ${Math.ceil((i + 1) / batchSize)}`);
        }
        
        console.log('All products imported successfully!');
        mongoose.connection.close();
      });
  } catch (error) {
    console.error('Error importing data:', error);
    mongoose.connection.close();
  }
};

importData();
