const express = require('express');
const { auth } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.use(auth); // All order routes require authentication

router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);

router.post('/track', orderController.trackOrder);

// New routes for payment and cancellation
router.put('/:id/payment', orderController.confirmPayment);
router.put('/:id/cancel', orderController.cancelOrder);

// Admin-only route
router.put('/:id/status', orderController.updateOrderStatus);


module.exports = router;
