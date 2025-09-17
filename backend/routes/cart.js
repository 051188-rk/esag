const express = require('express');
const { auth } = require('../middleware/auth');
const cartController = require('../controllers/cartController');

const router = express.Router();

router.use(auth); // All cart routes require authentication

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/item/:itemId', cartController.updateCartItem);
router.delete('/item/:itemId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

module.exports = router;
