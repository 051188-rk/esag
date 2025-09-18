const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

// Make sure all these functions exist in the controller
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/subcategories', productController.getSubcategories);
router.get('/brands', productController.getBrands);
router.get('/featured', productController.getFeaturedProducts);
router.get('/:id', productController.getProductById);
router.post('/smart-search', productController.smartSearch);

module.exports = router;
