
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Create a new order
export const createOrder = async (req, res) => {
  const { shippingAddress, paymentMethod, items, expectedDeliveryDate } = req.body;

  try {
    if (items && items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Calculate total price on the backend to prevent tampering
    const itemsFromDB = await Product.find({
      _id: { $in: items.map(item => item.productId) },
    });

    const orderItems = items.map(item => {
      const dbItem = itemsFromDB.find(dbI => dbI._id.toString() === item.productId);
      if (!dbItem) {
        res.status(404).json({ message: `Product not found: ${item.productId}` });
        throw new Error(`Product not found: ${item.productId}`);
      }
      return {
        name: dbItem.name,
        quantity: item.quantity,
        image: dbItem.imageUrls[0],
        price: dbItem.price,
        productId: dbItem._id,
      };
    });

    const totalPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const order = new Order({
      userId: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      expectedDeliveryDate,
    });

    const createdOrder = await order.save();

    // Clear the user's cart after placing the order
    await Cart.deleteOne({ userId: req.user.id });

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders for a specific user
export const getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).populate('orderItems.productId', 'name imageUrls');
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
