import express from "express";
import { addProducts, getProductById, getProducts } from "../Controllers/Products.js";


const router = express.Router();

router.post("/add", addProducts);
router.get("/", getProducts);
router.get("/:id", getProductById);


export default router;