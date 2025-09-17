const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/subcategories', productController.getSubcategories);
router.get('/brands', productController.getBrands);
router.get('/featured', productController.getFeaturedProducts);
router.get('/:id', productController.getProductById);

module.exports = router;
