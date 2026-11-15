const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, message: "Product created", product });
});

const getProducts = asyncHandler(async (req, res) => {
  const { category, search, minPrice, maxPrice, sort = "-createdAt", page = 1, limit = 10 } = req.query;
  const filter = {};
  if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, "i");
  if (search) {
    const term = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: term }, { sku: term }, { supplier: term }];
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    if (Object.values(filter.price).some(v => !Number.isFinite(v) || v < 0)) {
      res.status(400); throw new Error("Price filters must be valid non-negative numbers");
    }
  }
  const pageNo = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const sortField = sort.startsWith("-") ? sort.slice(1) : sort;
  const allowed = ["name", "price", "quantity", "category", "createdAt", "updatedAt"];
  if (!allowed.includes(sortField)) {
    res.status(400); throw new Error(`Sort field must be one of: ${allowed.join(", ")}`);
  }
  const sortSpec = { [sortField]: sort.startsWith("-") ? -1 : 1 };
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortSpec).skip((pageNo - 1) * pageSize).limit(pageSize),
    Product.countDocuments(filter)
  ]);
  res.json({ success: true, total, page: pageNo, limit: pageSize,
    totalPages: Math.ceil(total / pageSize), count: products.length, products });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Product not found"); }
  res.json({ success: true, product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const allowed = ["name", "sku", "category", "price", "quantity", "reorderLevel", "supplier"];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  if (!Object.keys(updates).length) {
    res.status(400); throw new Error("Provide at least one valid product field");
  }
  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true, runValidators: true
  });
  if (!product) { res.status(404); throw new Error("Product not found"); }
  res.json({ success: true, message: "Product updated", product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) { res.status(404); throw new Error("Product not found"); }
  res.json({ success: true, message: "Product deleted", id: product._id });
});

const adjustStock = asyncHandler(async (req, res) => {
  const change = Number(req.body.change);
  if (!Number.isInteger(change) || change === 0) {
    res.status(400); throw new Error("change must be a non-zero integer");
  }
  const condition = { _id: req.params.id, quantity: { $gte: Math.max(0, -change) } };
  const product = await Product.findOneAndUpdate(condition, { $inc: { quantity: change } }, {
    new: true, runValidators: true
  });
  if (!product) {
    const exists = await Product.exists({ _id: req.params.id });
    if (!exists) { res.status(404); throw new Error("Product not found"); }
    res.status(400); throw new Error("Insufficient stock: quantity cannot become negative");
  }
  res.json({ success: true, message: "Stock updated", product });
});

const lowStockReport = asyncHandler(async (req, res) => {
  const lowStockItems = await Product.find({
    $expr: { $lte: ["$quantity", "$reorderLevel"] }
  }).sort({ quantity: 1 });
  res.json({ success: true, count: lowStockItems.length, lowStockItems });
});

const categorySummary = asyncHandler(async (req, res) => {
  const summary = await Product.aggregate([
    { $group: {
      _id: "$category",
      totalItems: { $sum: 1 },
      totalQuantity: { $sum: "$quantity" },
      totalStockValue: { $sum: { $multiply: ["$price", "$quantity"] } },
      averagePrice: { $avg: "$price" }
    }},
    { $project: {
      _id: 0, category: "$_id", totalItems: 1, totalQuantity: 1,
      totalStockValue: { $round: ["$totalStockValue", 2] },
      averagePrice: { $round: ["$averagePrice", 2] }
    }},
    { $sort: { category: 1 } }
  ]);
  res.json({ success: true, categories: summary.length, summary });
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
module.exports = {
  createProduct, getProducts, getProductById, updateProduct,
  deleteProduct, adjustStock, lowStockReport, categorySummary
};
