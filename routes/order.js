
import express from 'express';
import { createOrder, getOrdersByUser } from '../controllers/orderController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.route('/').post(protect, createOrder);
router.route('/user/:userId').get(protect, getOrdersByUser);

export default router;
