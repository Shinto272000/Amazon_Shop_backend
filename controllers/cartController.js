
import Cart from '../models/Cart.js';

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart) {
      // If no cart exists for the user, create one
      const newCart = await Cart.create({ userId: req.user.id, items: [] });
      return res.json(newCart);
    }
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      // Item already exists in cart, update quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Item does not exist in cart, add new item
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('items.productId');
    res.json(populatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update item quantity in cart
export const updateCartItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      if (cart.items[itemIndex].quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.items.splice(itemIndex, 1);
      }
    } else {
        return res.status(404).json({ message: 'Item not in cart' });
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('items.productId');
    res.json(populatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('items.productId');
    res.json(populatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
