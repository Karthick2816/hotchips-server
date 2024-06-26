const express = require("express");
const router = express.Router();
const Payment = require("../models/Payments");
const mongoose = require("mongoose");
const Cart = require("../models/Carts");
const ObjectId = mongoose.Types.ObjectId;
//token verify
const verifyToken = require("../middleware/verifyToken");
//post payment
router.post("/", verifyToken, async (req, res) => {
  const payment = req.body;
  try {
    const paymentRequest = await Payment.create(payment);

    //delete carts after payment
    const cardIds = payment.cartItems.map((id) => new ObjectId(id));
    const deletedCartRequest = await Cart.deleteMany({ _id: { $in: cardIds } });
    res.status(200).json({ paymentRequest, deletedCartRequest });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});
router.get("/", verifyToken, async (req, res) => {
  const email = req.query.email;
  const query = { email: email };
  try {
    const decodedEmail = req.decoded.email;
    if (email !== decodedEmail) {
      res.status(403).json({ message: "forbidden acess" });
    }
    const result = await Payment.find(query).sort({ createdAt: -1 }).exec();
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

//get all payments by email
router.get("/all", async (req, res) => {
  try {
    const payments = await Payment.find({}).sort({ createdAt: -1 }).exec();
    res.status(200).json(payments);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});
//confirm payments status
router.patch("/:id", async (req, res) => {
  const payId = req.params.id;
  const { status } = req.body;
  try {
    const updatedStatus = await Payment.findByIdAndUpdate(
      payId,
      { status: "confirmed" },
      { new: true, runValidators: true }
    );
    if (!updatedStatus) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json(updatedStatus);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});
module.exports = router;
