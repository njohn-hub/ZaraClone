import express from "express";
import {
  addToCart,
  addToFavourites,
  getAllCartItems,
  getAllOrders,
  getUserFavourites,
  placeOrder,
  removeFromCart,
  removeFromFavourites,
  UserLogin,
  UserRegister,
} from "../Controllers/Users.js";
import { verifyToken } from "../middleware/verify.js";

const router = express.Router();

router.post("/signup", UserRegister);
router.post("/signin", UserLogin);

//cart
router.get("/cart" ,verifyToken, getAllCartItems);
router.post("/cart",verifyToken, addToCart);
router.patch("/cart",verifyToken, removeFromCart);

//order
router.get("/order",verifyToken, getAllOrders);
router.post("/order",verifyToken, placeOrder);

//order
router.get("/favourite",verifyToken, getUserFavourites);
router.post("/favourite",verifyToken, addToFavourites);
router.post("/favourite",verifyToken, removeFromFavourites);

export default router;
