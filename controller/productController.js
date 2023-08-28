const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");
const slugify = require("slugify");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");

// create a new product
const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (err) {
    res.json(err);
    throw new Error(err);
  }
});

// get a product
const getaProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  try {
    const findProduct = await Product.findById(id);
    res.json(findProduct);
  } catch (err) {
    res.json(err);
    throw new Error(err);
  }
});

// Add to Wishlist
const addToWishlist = asyncHandler(async (req, res) => {});

// Rating
const rating = asyncHandler(async (req, res) => {});

// Update a product
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params.id;
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updateaProduct = await Product.findOneAndUpdate({ id }, req.body, {
      new: true,
    });
    res.json(updateaProduct);
  } catch (err) {
    res.json(err);
    throw new Error(err);
  }
});

// Delete a product
const deleteProduct = asyncHandler(async (req, res) => {});

// get all products
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    // Filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    // Sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // limiting the fields

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // pagination

    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This Page does not exists");
    }
    const product = await query;
    res.json(product);
  } catch (err) {
    res.json(err);
    throw new Error(err);
  }
});

module.exports = {
  createProduct,
  getaProduct,
  addToWishlist,
  rating,
  updateProduct,
  deleteProduct,
  getAllProducts,
};
