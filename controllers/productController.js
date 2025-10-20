import Product from '../models/Product.js';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



// @desc    Get all products
// @route   GET /products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get product by ID
// @route   GET /products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// @desc    Create a new product
// @route   POST /products
// @access  Private (you might want to add authentication middleware)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, countInStock,rating } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'amazon-clone' }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    });

    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map((result) => result.secure_url);

    const newProduct = new Product({
      name,
      description,
      price,
      imageUrls,
      category,
      brand,
      countInStock,
      rating,
    });

    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
