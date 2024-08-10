import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createError } from "../error.js";
import User from "../Models/User.js";
import Orders from "../Models/Order.js";

dotenv.config();

// User registration
export const UserRegister = async (req, res, next) => {
  try {
    const { email, password, name, img } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError(409, "Email is already registered"));
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      img,
    });
    const createdUser = await user.save(); // Await the save function
    const token = jwt.sign({ id: createdUser._id }, process.env.JWT, {
      expiresIn: "1h",
    });
    return res.status(200).json({ token, user: createdUser }); // Include the created user
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};

// User login
export const UserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(404, "User not found"));
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return next(createError(400, "Invalid credentials"));
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT, {
      expiresIn: "1h",
    });
    return res.status(200).json({ token, user });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userJWT = req.user;
    const user = await User.findById(userJWT.id);
    const existingCartItemIndex = user.cart.findIndex((item) =>
      item.product.equals(productId)
    );
    if (existingCartItemIndex !== -1) {
      //product is already in the cart, update the quantity
      user.cart[existingCartItemIndex].quantity += quantity;
    } else {
      //product is not in the cart, add 🇮🇹
      user.cart.push({ product: productId, quantity });
    }
    await user.save();

    return res
      .status(200)
      .json({ message: "Product added to cart successfully", user });
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userJWT = req.user;
    const user = await User.findById(userJWT.id);
    if (!user) {
      return next(createError(404, "User not Found"));
    }
    const productIndex = user.cart.findIndex((item) =>
      item.product.equals(productId)
    );
    if (productIndex !== -1) {
      if (quantity && quantity > 0) {
        user.cart[productIndex].quantity -= quantity;
        if (user.cart[productIndex].quantity <= 0) {
          user.cart.splice(productIndex, 1);
        }
      } else {
        user.cart.splice(productIndex, 1);
      }
      await user.save();
      return res.status(200).json({
        message: "Product Quantity Updated to cart successfully",
        user,
      });
    } else {
      return next(createError(404, "Product not Found in the User's Cart"));
    }
  } catch (err) {
    next(err);
  }
};

export const getAllCartItems = async (req, res, next) => {
  try {
    const userJwt = req.user;
    const user = await User.findById(userJwt.id).populate({
      path: "cart.product",
      model: "Products",
    });
    const cartItems = user.cart;
    return res.status(200).json(cartItems);
  } catch (err) {
    next(err);
  }
};

export const placeOrder = async (req, res, next) => {
  try {
    const { products, address, totalAmount } = req.body;
    const userJWt = req.user;
    const user = await User.findById(userJWt.id);
    const order = new Orders({
      products,
      user: user._id,
      total_amount: totalAmount,
      address,
    });
    await order.save();

    user.cart.save();

    user.cart = [];
    await user.save();

    return res
      .status(200)
      .json({ message: "Order Placed Successfully", order });
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const user = req.user;
    const orders = await Orders.find({ user: user.id });
    return res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

export const addToFavourites = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userJWT = req.user;
    const user = await User.findById(userJWT.id);

    if (!user.favourites.includes(productId)) {
      user.favourites.push(productId);
      await user.save();
    }
    return res
      .status(200)
      .json({ message: "Product Added to Favourites Successfully", user });
  } catch (err) {
    next(err);
  }
};

export const removeFromFavourites = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userJWT = req.user;
    const user = await User.findById(userJWT.id);

    user.favourites = user.favourites.filter((fav) => !fav.equals(productId));
    await user.save();
    return res
      .status(200)
      .json({ message: "Product Removed from Favourites Successfully", user });
  } catch (err) {
    next(err);
  }
};

export const getUserFavourites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("favourites").exec();

    if (!user) {
      return next(createError(404, "User not Found"));
    }
    return res.status(200).json(user.favourites);
  } catch (err) {
    next(err);
  }
};
