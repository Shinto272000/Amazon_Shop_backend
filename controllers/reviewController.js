import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Product from '../models/Product.js';

// @desc    Create new review
// @route   POST /api/reviews/:productId
// @access  Public (for anonymous users)
const createProductReview = asyncHandler(async (req, res) => {
  const { name, rating, comment } = req.body;
  const { productId } = req.params;

  const product = await Product.findById(productId);

  if (product) {
    // Check if the product already has a review from this anonymous user (optional, based on requirements)
    // For simplicity, we'll allow multiple anonymous reviews for now.
    // If you want to restrict to one review per anonymous user, you'd need to store some identifier
    // like an IP address or a cookie, which is more complex.

    const review = new Review({
      name,
      rating: Number(rating),
      comment,
      product: productId,
    });

    const createdReview = await review.save();

    res.status(201).json({ message: 'Review added', review: createdReview });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const reviews = await Review.find({ product: productId });

  res.json(reviews);
});

export { createProductReview, getProductReviews };
