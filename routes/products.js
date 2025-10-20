import express from 'express';
import multer from 'multer';
import { getAllProducts, createProduct, getProductById } from '../controllers/productController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Configure Multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.route('/').get(getAllProducts).post(protect, upload.array('images', 5), createProduct);
router.route('/:id').get(getProductById);

export default router;
