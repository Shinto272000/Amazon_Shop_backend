
import 'dotenv/config';

import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(
  session({
    secret: 'keyboard cat', // Replace with a real secret
    resave: false,
    saveUninitialized: false,
  })
);

import './config/passport.js'; // Moved here

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import reviewsRouter from './routes/reviews.js';
import cartRouter from './routes/cart.js';
import orderRouter from './routes/order.js';

app.use('/auth', authRouter);
app.use('/products', productsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);


const uri = process.env.MONGO_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

