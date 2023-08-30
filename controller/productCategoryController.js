const { json } = require("body-parser");
const Category = require("../models/productCategoryModel");
const asyncHandler = require("express-async-handler");
// const validateMongoDbId = require("../utils/validateMongoDbId");

//Create category
const createCategory = asyncHandler(async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    res.json(newCategory);
  } catch (err) {
    res.json(err);
    throw new Error(err);
  }
});

// Update category
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const newCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(newCategory);
  } catch (err) {
    res.json(err);
    throw new Error(err);
  }
});

//Delete Category

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleteCategory = await Category.findByIdAndDelete(id);
    res.json(deleteCategory);
  } catch (err) {
    res.json(err);
    throw new Error(err);
  }
});

// Get A Category

const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const getCategory = await Category.findById(id);
    res.json(getCategory);
  } catch (err) {
    res.json(err);
    throw new Error(err);
  }
});

// Get all categories

const getAllCategory = asyncHandler(async (req, res) => {
  try {
    const getAllCategory = await Category.find();
    res.json(getAllCategory);
  } catch (err) {
    res.json(err);
    throw new Error(err);
  }
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategory,
};
