import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  imageUrls: {
    type: [String],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  brand: {
    type: String,
  },
  countInStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
});

const Product = mongoose.model('Product', productSchema);

export default Product;
