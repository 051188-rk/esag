const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
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
      sortOrder = 'desc',
      featured
    } = req.query;

    // Build filter object
    const filter = { is_active: true };

    if (category) filter.category = { $regex: category, $options: 'i' };
    if (subcategory) filter.subcategory = { $regex: subcategory, $options: 'i' };
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (featured) filter.is_featured = featured === 'true';

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const products = await Product.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      hasMore: page < Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.is_active) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Product.countDocuments({ category, is_active: true });
        return { name: category, count };
      })
    );
    res.json(categoriesWithCount);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSubcategories = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category, is_active: true } : { is_active: true };
    const subcategories = await Product.distinct('subcategory', filter);
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand', { is_active: true });
    res.json(brands.sort());
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      is_featured: true, 
      is_active: true 
    }).limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
