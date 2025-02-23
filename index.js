//All imports
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
//Connection to database
mongoose.connect(process.env.MONGODB_URI);
//express activation

const serv = express();
serv.use(cors());

//Used by serv
serv.use(express.json());
serv.use(userRoutes);
serv.use(offerRoutes);

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
