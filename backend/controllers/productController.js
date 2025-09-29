const Product = require('../models/Product');
const { parseSearchQuery } = require('../utils/aiService');

const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log('=== PRODUCTS QUERY DEBUG ===');
    console.log('Query params:', req.query);
    
    // REMOVE is_active filter temporarily to see all products
    const filter = {};

    if (category && category !== '') {
      filter.category = { $regex: new RegExp(category, 'i') };
    }
    
    if (subcategory && subcategory !== '') {
      filter.subcategory = { $regex: new RegExp(subcategory, 'i') };
    }
    
    if (brand && brand !== '') {
      filter.brand = { $regex: new RegExp(brand, 'i') };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && !isNaN(minPrice)) {
        filter.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice && !isNaN(maxPrice)) {
        filter.price.$lte = parseFloat(maxPrice);
      }
    }

    // Search filter
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { brand: searchRegex }
      ];
    }

    console.log('Filter:', JSON.stringify(filter, null, 2));

    // Sort object
    const sort = {};
    sort[sortBy || 'createdAt'] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Get total count first
    const totalCount = await Product.countDocuments(filter);
    console.log('Total count:', totalCount);

    // Get products
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    console.log('Found products:', products.length);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        total: totalCount,
        limit: limitNum,
        hasMore: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message
    });
  }
};



const getFeaturedProducts = async (req, res) => {
  try {
    // Get latest products instead of featured for now
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    
    console.log('Featured products found:', products.length);
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Featured products error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
      { $sort: { name: 1 } }
    ]);
    
    console.log('Categories found:', categories.length);
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message
    });
  }
};

const getSubcategories = async (req, res) => {
  try {
    const { category } = req.query;
    const match = {};
    
    if (category && category !== '') {
      match.category = { $regex: new RegExp(category, 'i') };
    }
    
    const subcategories = await Product.distinct('subcategory', match);
    
    res.json({
      success: true,
      subcategories: subcategories.sort()
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching subcategories' 
    });
  }
};

const getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json({
      success: true,
      brands: brands.sort()
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching brands' 
    });
  }
};

const getProductById = async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log('Getting product by ID:', id);
      
      // Validate MongoDB ObjectId format
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid product ID format' 
        });
      }
  
      // Find product by ID
      const product = await Product.findById(id).lean();
      
      console.log('Found product:', product ? 'Yes' : 'No');
      
      if (!product) {
        return res.status(404).json({ 
          success: false,
          message: 'Product not found' 
        });
      }
      
      // Ensure all required fields have default values
      const productWithDefaults = {
        ...product,
        name: product.name || 'Product Name Not Available',
        brand: product.brand || 'Unknown Brand',
        description: product.description || 'No description available',
        price: product.price || 0,
        original_price: product.original_price || product.price || 0,
        stock_quantity: product.stock_quantity || 0,
        rating: product.rating || 0,
        review_count: product.review_count || 0,
        color_options: product.color_options || [],
        size_options: product.size_options || [],
        specifications: product.specifications || {},
        image_url: product.image_url || 'https://via.placeholder.com/500x500?text=No+Image',
        category: product.category || 'Unknown',
        subcategory: product.subcategory || 'Unknown'
      };
      
      console.log('Returning product with defaults:', productWithDefaults.name);
      
      res.json({
        success: true,
        product: productWithDefaults
      });
    } catch (error) {
      console.error('Get product by ID error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error while fetching product',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };


  const smartSearch = async (req, res) => {
    const { query } = req.body;
  
    if (!query) {
      return res.status(400).json({ message: 'Search query is required.' });
    }
  
    try {
      // 1. Parse the natural language query using the AI service
      const parsedQuery = await parseSearchQuery(query);
      
      // 2. Handle the "addToCart" intent separately
      if (parsedQuery.intent === 'addToCart') {
        const product = await Product.findOne({
          name: { $regex: new RegExp(parsedQuery.product, 'i') }
        });
  
        if (!product) {
          return res.status(404).json({ message: `Product "${parsedQuery.product}" not found.` });
        }
  
        return res.json({
          intent: 'addToCart',
          product: product,
          quantity: parsedQuery.quantity || 1
        });
      }
  
      // 3. For "search" intent, return the parsed filter object
      // The frontend will use this to build the URL and navigate.
      res.json({
        intent: 'search',
        filters: parsedQuery
      });
  
    } catch (error) {
      console.error('Smart search error:', error);
      res.status(500).json({ message: 'Failed to perform smart search.' });
    }
  };

  const getRelatedProducts = async (req, res) => {
    try {
      const { id } = req.params;
      const mainProduct = await Product.findById(id).lean();
  
      if (!mainProduct) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
  
      // 1. Find products with the same category and subcategory
      let products = await Product.find({
        _id: { $ne: id }, // Exclude the current product
        category: mainProduct.category,
        subcategory: mainProduct.subcategory,
      }).limit(10).lean();
  
      const foundIds = products.map(p => p._id);
      foundIds.push(id); // Add current product ID to exclusion list for the next query
  
      // 2. If we don't have 10 products, find more from the same main category
      if (products.length < 10) {
        const remainingLimit = 10 - products.length;
        const categoryProducts = await Product.find({
          _id: { $nin: foundIds }, // Exclude all previously found IDs
          category: mainProduct.category,
        }).limit(remainingLimit).lean();
        
        // Combine the two lists
        products = products.concat(categoryProducts);
      }
      
      res.json({
        success: true,
        products: products
      });
  
    } catch (error) {
      console.error('Related products error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching related products'
      });
    }
  };


// Export all functions properly
module.exports = {
  getAllProducts,
  getProductById,
  getCategories,
  getSubcategories,
  getBrands,
  getFeaturedProducts,
  smartSearch,
  getRelatedProducts
};


