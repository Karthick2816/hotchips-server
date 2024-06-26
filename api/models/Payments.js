const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentSchema = new Schema({
  transitionId: String,
  email: String,
  price: Number,
  quantity: Number,
  status: String,
  itemName: Array,
  cartItems: Array,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
