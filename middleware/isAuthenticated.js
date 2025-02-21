const Account = require("../models/Account");

const isAuthenticated = async (req, res, next) => {
  // Cette route est réservée aux user authentifiés
  // ils vont envoyer leurs token, je dois vérifier si le token reçu est valide
  //console.log(req.headers.authorization);
  //console.log(req.headers.authorization.replace("Bearer ", ""));

  // Si j'ai pas reçu de token ===> Unauthorized
  if (!req.headers.authorization) {
    return res.json("No account found");
  }
  const token = req.headers.authorization.replace("Bearer ", "");
  const checkAutorisation = await Account.findOne({
    token: token,
  });
  if (!checkAutorisation) {
    return res.json("No account found");
  }
  //return res.json(checkAutorisation);//null if not present
  req.offerCreator = checkAutorisation;
  next();
};

module.exports = isAuthenticated;
