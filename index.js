const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");

const port = process.env.PORT || 8000;
const mongoose = require("mongoose");
const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51P4k7xSCLYeRmR0MoDHMstkv3w15zHeRGK9QAv9ZLpoaUKZFrC62QmGBf1knrS2o2T42Vzwj1S0IOLMCHbuzVSJx0093tjwEhe"
);

require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// mongodb configuration using mongoose

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@hotchips-1.kuiwmye.mongodb.net/hotchips?retryWrites=true&w=majority&appName=Hotchips-1`
  )
  .then(console.log("MongoDB Connected Successfully!"))
  .catch((error) => console.log("Error connecting to MongoDB", error));

//jwt token auth
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1hr",
  });
  res.send({ token });
});

//import routes

const menuRoutes = require("./api/routes/menuRoutes");
const cartRoutes = require("./api/routes/cartRoutes");
const userRoutes = require("./api/routes/userRoutes");
const verifyToken = require("./api/middleware/verifyToken");
const paymentRoutes = require("./api/routes/paymentRoutes");
const adminStats = require("./api/routes/adminStats");
app.use("/menu", menuRoutes);
app.use("/carts", cartRoutes);
app.use("/users", userRoutes);
app.use("/payments", paymentRoutes);
app.use("/adminStats", adminStats);
//stripe payment routes

app.post("/create-payment-intent", async (req, res) => {
  const { price } = req.body;
  const amount = price * 100;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "inr",
    payment_method_types: ["card"],
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.get("/", verifyToken, (req, res) => {
  res.send("Hello Fam!");
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
