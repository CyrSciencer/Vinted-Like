//imports
const express = require("express");
const Offer = require("../models/Offer");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middleware/isAuthenticated");
const convertToBase64 = require("../utilities/convertToBase64");

//Inter-route creation
const router = express.Router();
//cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});
//offer routes
router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const pictureToUpload = req.files.picture;
      const convertedPicture = await cloudinary.uploader.upload(
        convertToBase64(pictureToUpload)
      );
      const { title, description, price, brand, size, condition, color, city } =
        req.body;
      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ÉTAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
        product_image: convertedPicture.secure_url,
        owner: req.offerCreator._id,
      });
      console.log(newOffer);
      await newOffer.populate("owner", "account _id");
      await newOffer.save();
      console.log(newOffer);
      res.json(newOffer);
    } catch (error) {
      console.log(error);

      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/test", (req, res) => {
  console.log("Hi");
  res.json("hi");

  try {
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.message });
  }
});
//Modify Offer Route
router.put("/offer/:id", isAuthenticated, fileUpload(), async (req, res) => {
  try {
    const offerToModify = await Offer.findById(req.params.id);
    const pictureToUpload = req.files.picture;
    const convertedPicture = await cloudinary.uploader.upload(
      convertToBase64(pictureToUpload)
    );
    offerToModify.product_name = req.body.title;
    offerToModify.product_description = req.body.description;
    offerToModify.product_price = req.body.price;
    offerToModify.product_details[0].MARQUE = req.body.brand;
    offerToModify.product_details[1].TAILLE = req.body.size;
    offerToModify.product_details[2]["ÉTAT"] = req.body.condition;
    offerToModify.product_details[3].COULEUR = req.body.color;
    offerToModify.product_details[4].EMPLACEMENT = req.body.city;
    offerToModify.product_image = convertedPicture.secure_url;
    // console.log(offerToModify);
    await offerToModify.save();
    res.json(offerToModify);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.message });
  }
});
//Delete offer route
router.delete("/offer/:id", isAuthenticated, async (req, res) => {
  try {
    const offerToDelete = await Offer.findByIdAndDelete(req.params.id);
    res.json("deleted");
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.message });
  }
});
//offer research route
router.get("/offers", async (req, res) => {
  try {
    let { title, priceMin, priceMax, sort, page } = req.query;
    const filter = {};
    if (title) {
      filter.product_name = new RegExp(title, "i");
    }
    if (priceMin && priceMax) {
      filter.product_price = {};
      filter.product_price.$gte = Number(priceMin);
      filter.product_price.$lte = Number(priceMax);
    } else if (priceMin) {
      filter.product_price = {};
      filter.product_price.$gte = Number(priceMin);
    } else if (priceMax) {
      filter.product_price = {};
      filter.product_price.$lte = Number(priceMax);
    }

    // for missing data
    if (!page) {
      page = 1;
    }
    if (!sort) {
      sort = "asc";
    }
    //offerSortingfunctions
    const selection = "product_name product_price";
    const offerPerPage = 2;
    const sorting = async (filter, sorting, page) => {
      const offers = await Offer.find(filter)
        .sort({ product_price: sorting })
        .skip(offerPerPage * (page - 1))
        .limit(offerPerPage)
        .select(selection);
      return offers;
    };
    console.log(filter);
    res.json(await sorting(filter, sort, page));
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.message });
  }
});
//offer details route
router.get("/offers/:id", async (req, res) => {
  const offers = await Offer.findById(req.params.id).populate(
    "owner",
    "account _id"
  );
  res.json(offers);
});

//Export of userRoute
module.exports = router;
