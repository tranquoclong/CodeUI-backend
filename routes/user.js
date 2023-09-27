const express = require("express");
const controllersUser = require("../controllers/user");
const { requireSignIn } = require("../controllers/auth");
const router = express.Router();
router.put("/user/favorite",
//  requireSignIn, 
controllersUser.addFavorite);
router.put("/user/unFavorite", 
// requireSignIn, 
controllersUser.removeFavorite);
router.post(
  "/user/findFavorite/:login",
  // requireSignIn,
  controllersUser.findFavorite
);
router.get("/users", controllersUser.allUsers);
router.get("/user/:login", controllersUser.getUser);
router.put("/user/:userId", 
// requireSignIn,
 controllersUser.updateUser);
router.delete("/user/:userId", 
// requireSignIn, 
controllersUser.deleteUser);
router.param("login", controllersUser.userByLogin);

module.exports = router;
