//All imports
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
const stripe = require("stripe")(process.env.STRIPE_KEY);
//Connection to database
mongoose.connect(process.env.MONGODB_URI);
// console.log(process.env.STRIPE_KEY);

// mongoose.connect("mongodb://127.0.0.1:27017/vintedLike");
//express activation
const serv = express();

const allowedOrigins = [
  "http://localhost:5174", // Your local dev frontend
  "https://vintedlike.netlify.app", // Replace with your deployed frontend URL if you have one
  // Add any other origins you need to allow
];

serv.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

//Used by serv
serv.use(express.json());
serv.use(userRoutes);
serv.use(offerRoutes);

//route payment
serv.post("/payment", async (req, res) => {
  try {
    console.log(req.body);
    const amountToPay = req.body.amount * 100;

    // On crée une intention de paiement
    const paymentIntent = await stripe.paymentIntents.create({
      // Montant de la transaction
      amount: amountToPay,
      // Devise de la transaction
      currency: "usd",
      // Description du produit
      description: "La description du produit",
    });
    // On renvoie les informations de l'intention de paiement au client
    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//Other routes
serv.get("/", (req, res) => {
  res.json("Welcome");
});
serv.all("*", (req, res) => {
  res.status(404).json("Route not found");
});
//Serv starting
serv.listen(process.env.PORT, () => {
  console.log("serv start");
});
