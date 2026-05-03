require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors()); // Allow frontend to communicate with backend
app.use(express.json());

// Initialize Razorpay instance with keys from .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Route to create an order
app.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    // Razorpay requires amount in subunits (paise for INR, cents for USD)
    const options = {
      amount: Math.round(amount * 100), 
      currency: 'USD', // Change to 'INR' if you are testing with Indian Rupees
      receipt: 'receipt_order_' + Math.floor(Math.random() * 10000),
    };

    // Create the order using Razorpay SDK
    const order = await razorpay.orders.create(options);

    // Send the order details to the frontend
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
