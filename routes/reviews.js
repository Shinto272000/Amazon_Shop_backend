import express from 'express';
import { createProductReview, getProductReviews } from '../controllers/reviewController.js'; // We will create this controller
// import { protect } from '../middlewares/auth.js'; // No protect middleware for anonymous reviews

const router = express.Router();

router.route('/:productId').post(createProductReview); // POST to /api/reviews/:productId
router.route('/product/:productId').get(getProductReviews); // GET reviews for a product

export default router;
