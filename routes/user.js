//All imports
const express = require("express");
const Account = require("../models/Account");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
//Inter-route creation
const router = express.Router();
//User routes
router.post("/user/signup", async (req, res) => {
  try {
    if (!req.body.username || !req.body.password || !req.body.email) {
      return res.status(400).json({ message: "Missing input" });
    }
    const checkAccount = await Account.findOne({ email: req.body.email });
    if (checkAccount) {
      //   console.log("taken");
      res.status(409).json({ message: "Email already taken" });
    } else {
      const password = req.body.password;
      const salt = uid2(16);
      const newAccount = new Account({
        email: req.body.email,
        account: {
          username: req.body.username,
          avatar: {},
        },
        newsletter: req.body.newsletter,
        token: uid2(64),
        salt: salt,
        hash: SHA256(password + salt).toString(encBase64),
      });
      //   console.log("ok");

      await newAccount.save();
      res.json({
        _id: newAccount._id,
        token: newAccount.token,
        account: {
          username: newAccount.account.username,
        },
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.message });
  }
});
//-------------------------------------------------------------------------------------------------------------------------------------------------
router.post("/user/login", async (req, res) => {
  try {
    const checkAccount = await Account.findOne({ email: req.body.email });
    // console.log(checkAccount);

    // console.log(checkAccount.hash);
    // console.log(checkPassword);
    if (!checkAccount) {
      return res
        .status(401)
        .json({ message: "The combinaison email / password is wrong" });
    }
    const checkPassword = SHA256(
      req.body.password + checkAccount.salt
    ).toString(encBase64);
    if (checkAccount.hash !== checkPassword) {
      return res
        .status(401)
        .json({ message: "The combinaison email / password is wrong" });
    }
    //Show user data

    res.json({
      _id: checkAccount._id,
      token: checkAccount.token,
      account: {
        username: checkAccount.account.username,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.message });
  }
});
//Export of userRoute

module.exports = router;
